import { createServer, validateHeaderName, validateHeaderValue } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const DEFAULT_DIST = fileURLToPath(new URL('./dist/', import.meta.url));
export const MIME_TYPES = Object.freeze({
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
});

export function normalizeRequestPath(raw) {
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    throw new Error('Invalid request path');
  }
  let pathname;
  try {
    pathname = decodeURIComponent(raw.split(/[?#]/, 1)[0]);
  } catch {
    throw new Error('Invalid URL encoding');
  }
  if (/[\\\u0000-\u001f\u007f]/.test(pathname) || pathname.startsWith('//')) {
    throw new Error('Invalid request path');
  }
  const segments = pathname.split('/');
  if (segments.some((segment) => segment.startsWith('.'))) {
    throw new Error('Hidden files and traversal are not public paths');
  }
  if (segments.some((segment) => segment === '_headers' || segment === '_redirects')) {
    throw new Error('Hosting configuration is not a public asset');
  }
  return pathname.replace(/\/{2,}/g, '/');
}

export function fileCandidates(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return ['index.html'];
  const local = path.slice(1);
  return extname(local)
    ? [local]
    : [`${local}/index.html`, `${local}.html`, local];
}

function isWithin(root, candidate) {
  const path = relative(root, candidate);
  return path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

export async function resolvePublicFile(root, pathname) {
  const realRoot = await realpath(root);
  for (const candidate of fileCandidates(pathname)) {
    const full = resolve(realRoot, candidate);
    if (!isWithin(realRoot, full)) continue;
    try {
      const actual = await realpath(full);
      if (isWithin(realRoot, actual) && (await stat(actual)).isFile()) return actual;
    } catch (error) {
      if (!['ENOENT', 'ENOTDIR', 'ELOOP'].includes(error.code)) throw error;
    }
  }
  return null;
}

// Preview the common Pages redirect subset; rewrites and placeholders other
// than a terminal splat are intentionally not interpreted as redirects.
export function parseRedirects(source) {
  const rules = [];
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [from, to, rawStatus = '302'] = trimmed.split(/\s+/);
    const status = Number(rawStatus.replace(/!$/, ''));
    if (!from || !to || ![301, 302, 303, 307, 308].includes(status)) continue;
    if (!from.startsWith('/') || from.startsWith('//') || from.includes(':')) continue;
    if (from.includes('*') && (!from.endsWith('*') || from.indexOf('*') !== from.length - 1)) continue;
    if (!/^(?:\/(?!\/)|https?:\/\/)/i.test(to) || /[\r\n]/.test(to)) continue;
    if (/:(?!splat\b)[a-z]+/i.test(to.replace(/^https?:/, ''))) continue;
    rules.push({ from, to, status });
  }
  return rules;
}

export function matchRedirect(pathname, rules) {
  for (const rule of rules) {
    const wildcard = rule.from.endsWith('*');
    const prefix = wildcard ? rule.from.slice(0, -1) : rule.from;
    if (wildcard ? pathname.startsWith(prefix) : pathname === prefix) {
      const splat = wildcard ? pathname.slice(prefix.length).split('/').map(encodeURIComponent).join('/') : '';
      const location = rule.to.replaceAll(':splat', splat);
      if (location === pathname) continue;
      return { status: rule.status, location };
    }
  }
  return null;
}

// Mirror only the global Pages header block; asset caching stays disabled locally.
export function parseGlobalHeaders(source) {
  const headers = {};
  let global = false;
  for (const line of source.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) {
      global = line.trim() === '/*';
      continue;
    }
    if (!global) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const name = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    validateHeaderName(name);
    validateHeaderValue(name, value);
    headers[name] = value;
  }
  return headers;
}

export async function createPreviewServer({ root = DEFAULT_DIST } = {}) {
  const realRoot = await realpath(root);
  if (!(await stat(realRoot)).isDirectory()) throw new Error(`Not a directory: ${root}`);
  let redirects = [];
  try {
    const redirectFile = await realpath(resolve(realRoot, '_redirects'));
    if (!isWithin(realRoot, redirectFile)) throw new Error('_redirects escapes the dist directory');
    redirects = parseRedirects(await readFile(redirectFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  let headers = {};
  try {
    const headerFile = await realpath(resolve(realRoot, '_headers'));
    if (!isWithin(realRoot, headerFile)) throw new Error('_headers escapes the dist directory');
    headers = parseGlobalHeaders(await readFile(headerFile, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const server = createServer(async (req, res) => {
    for (const [name, value] of Object.entries(headers)) res.setHeader(name, value);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    const send = (status, body, type = 'text/plain; charset=utf-8') => {
      res.writeHead(status, { 'Content-Type': type, 'Content-Length': Buffer.byteLength(body) });
      res.end(req.method === 'HEAD' ? undefined : body);
    };
    if (!['GET', 'HEAD'].includes(req.method)) {
      res.setHeader('Allow', 'GET, HEAD');
      send(405, 'Method not allowed\n');
      return;
    }
    let pathname;
    try {
      pathname = normalizeRequestPath(req.url);
    } catch {
      send(400, 'Invalid request path\n');
      return;
    }
    try {
      const redirect = matchRedirect(pathname, redirects);
      if (redirect) {
        res.writeHead(redirect.status, { Location: redirect.location, 'Content-Length': '0' });
        res.end();
        return;
      }
      let file = await resolvePublicFile(realRoot, pathname);
      const status = file && relative(realRoot, file) !== '404.html' ? 200 : 404;
      if (!file) file = await resolvePublicFile(realRoot, '/404.html');
      if (!file) {
        send(404, 'Page not found\n');
        return;
      }
      send(status, await readFile(file), MIME_TYPES[extname(file).toLowerCase()] || 'application/octet-stream');
    } catch (error) {
      console.error(`Preview request failed: ${error.message}`);
      if (!res.headersSent) send(500, 'Internal preview error\n');
      else res.destroy();
    }
  });
  server.requestTimeout = 15_000;
  server.headersTimeout = 10_000;
  return server;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node serve.mjs [--port 4173] [--dir path]\nPORT also sets the port. Binds only to 127.0.0.1.');
    return;
  }
  let root = DEFAULT_DIST;
  let port = process.env.PORT || '4173';
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--port' && args[i + 1]) port = args[++i];
    else if (args[i] === '--dir' && args[i + 1]) root = resolve(args[++i]);
    else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
  }
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw new Error('PORT must be between 1 and 65535');
  const server = await createPreviewServer({ root });
  await new Promise((accept, reject) => {
    server.once('error', reject);
    server.listen(Number(port), '127.0.0.1', accept);
  });
  console.log(`Preview: http://127.0.0.1:${port}\nServing: ${root}\nPress Ctrl+C to stop.`);
  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const timer = setTimeout(() => server.closeAllConnections(), 3000);
    timer.unref();
    server.close(() => clearTimeout(timer));
    server.closeIdleConnections();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Preview failed: ${error.code === 'ENOENT' ? 'dist is missing; run the compact build first.' : error.message}`);
    process.exitCode = 1;
  });
}
