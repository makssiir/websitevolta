import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createDiscovery } from './discovery.mjs';
import {
  createPreviewServer, DEFAULT_DIST, fileCandidates, matchRedirect,
  MIME_TYPES, normalizeRequestPath, parseGlobalHeaders, parseRedirects, resolvePublicFile,
} from './serve.mjs';

const ROUTES = ['/', '/zakelijk', '/diensten', '/woningprojecten', '/projecten', '/over-ons', '/contact', '/privacy'];
const DEFAULT_ORIGIN = 'https://www.elektoria.nl';

function decodeEntities(value) {
  const named = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (whole, entity) => {
    if (!entity.startsWith('#')) return named[entity.toLowerCase()];
    const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
  });
}

function attributes(source) {
  const result = {};
  const pattern = /([^\s=/'"<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s'"=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return result;
}

function htmlTags(html) {
  // Remove raw-text content so strings inside scripts cannot impersonate tags.
  const markup = html.replace(/<!--[\s\S]*?-->/g, '').replace(/(<(script|style)\b[^>]*>)[\s\S]*?(<\/\2\s*>)/gi, '$1$3');
  return [...markup.matchAll(/<([a-z][\w:-]*)\b((?:[^'"<>]|"[^"]*"|'[^']*')*)>/gi)]
    .map((match) => ({ tag: match[1].toLowerCase(), attrs: attributes(match[2]) }));
}

function cssReferences(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...source.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]+))\s*\)|@import\s+["']([^"']+)["']/gi)]
    .map((match) => match[1] ?? match[2] ?? match[3] ?? match[4]);
}

function canonicalPath(url) {
  return url.pathname.replace(/\/$/, '') || '/';
}

function walkJson(value, visit) {
  if (!value || typeof value !== 'object') return;
  if (!Array.isArray(value)) visit(value);
  for (const item of Object.values(value)) walkJson(item, visit);
}

function forbiddenClaims(text) {
  return [
    ['certification claim', /\b(?:gecertificeerd\w*|certified|B[ -]VCA|erkend(?:e)?\s+installateur)\b/i],
    ['review claim', /\b(?:reviews?|recensies|klantbeoordelingen|testimonials?)\b/i],
    ['zero-percent claim', /(?:^|[^\d.,])0\s*%/],
    ['guaranteed satisfaction claim', /100\s*%\s*(?:tevreden|satisfaction|garantie)/i],
  ].filter(([, pattern]) => pattern.test(text)).map(([label]) => label);
}

async function inventory(root, folder = root) {
  const files = [];
  for (const entry of await readdir(folder, { withFileTypes: true })) {
    const path = resolve(folder, entry.name);
    assert(!entry.isSymbolicLink(), `Symlinks are not allowed in dist: ${relative(root, path)}`);
    if (entry.isDirectory()) files.push(...await inventory(root, path));
    else if (entry.isFile()) files.push({ path, name: relative(root, path).replaceAll('\\', '/'), bytes: (await stat(path)).size });
  }
  return files;
}

export async function verify({ root = DEFAULT_DIST, origin = DEFAULT_ORIGIN } = {}) {
  root = resolve(root);
  const originUrl = new URL(origin);
  assert.equal(originUrl.protocol, 'https:', 'Canonical origin must use HTTPS');
  assert.equal(originUrl.pathname, '/', 'Origin must not contain a path');
  assert(!originUrl.search && !originUrl.hash && !originUrl.username && !originUrl.password, 'Invalid canonical origin');
  origin = originUrl.origin;
  const failures = [];
  const check = (label, fn) => {
    try { fn(); } catch (error) { failures.push(`${label}: ${error.message}`); }
  };
  const files = await inventory(root);
  const fileNames = new Set(files.map((file) => file.name));
  const expectedFiles = new Set(['404.html']);
  const pages = new Map();
  const references = [];
  const definedIds = new Set();
  const referencedIds = new Set();
  const googleReviews = JSON.parse(await readFile(resolve(root, 'assets/google-reviews.json'), 'utf8'));
  const reviewRating = new Intl.NumberFormat('nl-NL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(googleReviews.rating);
  const reviewDate = new Intl.DateTimeFormat('nl-NL', { timeZone: 'UTC' }).format(new Date(`${googleReviews.checkedOn}T12:00:00Z`));
  check('Dated Google rating snapshot', () => {
    assert(Number.isFinite(googleReviews.rating) && googleReviews.rating >= 1 && googleReviews.rating <= 5, 'Invalid Google rating');
    assert(Number.isInteger(googleReviews.count) && googleReviews.count > 0, 'Invalid Google review count');
    assert.match(googleReviews.checkedOn, /^\d{4}-\d{2}-\d{2}$/, 'Keep the actual verification date, not a generated current date');
    const source = new URL(googleReviews.sourceUrl);
    assert.equal(source.origin, 'https://www.google.com');
    assert.equal(source.searchParams.get('query_place_id'), 'ChIJSQF3IcgykW8RYCZbQHuvvyY', 'Reviews must link to Elektoria, not a different business');
  });

  for (const file of files) {
    check(file.name, () => {
      assert(!/(?:^|\/)(?:_next|api|en|uk|ru)(?:\/|\.|$)/i.test(file.name), 'Locale, API or Next output is forbidden');
      assert(!/(?:^|\/)(?:\.env[^/]*|node_modules|server\.(?:m?js|cjs)|package(?:-lock)?\.json)(?:\/|$)/i.test(file.name), 'Server/private files must not be published');
    });
  }

  for (const route of [...ROUTES, '/404.html']) {
    const file = await resolvePublicFile(root, route);
    if (!file) { failures.push(`${route}: missing HTML file`); continue; }
    expectedFiles.add(relative(root, file).replaceAll('\\', '/'));
    const html = await readFile(file, 'utf8');
    const tags = htmlTags(html);
    const ids = tags.flatMap(({ attrs }) => attrs.id ? [attrs.id] : []);
    const page = { html, tags, ids: new Set(ids), file };
    pages.set(route, page);
    const url = new URL(route, origin);
    check(route, () => {
      assert.equal(tags.filter((tag) => tag.tag === 'html').length, 1, 'Expected one HTML document');
      assert.match(tags.find((tag) => tag.tag === 'html')?.attrs.lang || '', /^nl(?:-NL)?$/i, 'Document must declare Dutch');
      assert.equal(tags.filter((tag) => tag.tag === 'h1').length, 1, 'Expected one H1');
      assert.equal(ids.length, page.ids.size, 'Duplicate HTML IDs');
      assert(!tags.some((tag) => tag.tag === 'base'), 'Base tags hide relative URL mistakes');
      assert(!/\/_next(?:\/|\b)|__NEXT_DATA__|self\.__next_f/.test(html), 'Next.js runtime found');
      assert(!/\/api(?:\/|["'?#])/.test(html), 'Server API reference found');
      assert(!tags.some(({ tag, attrs }) => tag === 'link' && attrs.hreflang && !['nl', 'nl-nl', 'x-default'].includes(attrs.hreflang.toLowerCase())), 'Translated hreflang advertised');
      const title = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
      assert.equal(title.length, 1, 'Expected one title');
      assert(decodeEntities(title[0][1]).trim().length > 0, 'Empty title');
      const descriptions = tags.filter(({ tag, attrs }) => tag === 'meta' && attrs.name?.toLowerCase() === 'description');
      assert.equal(descriptions.length, 1, 'Expected one meta description');
      assert(descriptions[0].attrs.content?.trim(), 'Empty description');
      const robots = tags.filter(({ tag, attrs }) => tag === 'meta' && ['robots', 'googlebot'].includes(attrs.name?.toLowerCase())).map(({ attrs }) => attrs.content || '').join(',');
      if (route === '/404.html') assert(/\bnoindex\b/i.test(robots), '404 must be noindex');
      else {
        assert(!/\bnoindex\b|\bnone\b/i.test(robots), 'Public page is noindex');
        const canonicals = tags.filter(({ tag, attrs }) => tag === 'link' && attrs.rel?.toLowerCase().split(/\s+/).includes('canonical'));
        assert.equal(canonicals.length, 1, 'Expected one canonical');
        const canonical = new URL(canonicals[0].attrs.href);
        assert.equal(canonical.origin, origin, 'Wrong canonical origin');
        assert.equal(canonicalPath(canonical), route, 'Wrong canonical path');
        assert(!canonical.search && !canonical.hash, 'Canonical contains query or fragment');
        for (const { attrs } of tags.filter(({ tag, attrs }) => tag === 'meta' && attrs.property?.toLowerCase() === 'og:url')) {
          const socialUrl = new URL(attrs.content);
          assert.equal(socialUrl.origin, origin, 'Wrong Open Graph origin');
          assert.equal(canonicalPath(socialUrl), route, 'Wrong Open Graph page URL');
        }
      }
    });

    const reviewBlocks = [...html.matchAll(/<a data-google-reviews\b[^>]*>[\s\S]*?<\/a>/g)];
    check(`${route} Google review links`, () => {
      assert.equal(reviewBlocks.length, ['/', '/woningprojecten'].includes(route) ? 2 : 1, 'Show the rating at deliberate trust points, not repeatedly throughout the page');
      for (const [block] of reviewBlocks) {
        const anchor = htmlTags(block)[0];
        assert.equal(anchor.attrs.href, googleReviews.sourceUrl);
        assert.equal(anchor.attrs.target, '_blank');
        assert(anchor.attrs.rel.includes('noopener'));
        const text = decodeEntities(block.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
        assert.equal(text, `${reviewRating}/5 · ${googleReviews.count} reviews op Google Stand ${reviewDate}`, 'Use the verified count and rating, and show when they were checked');
        assert(htmlTags(block).some(({ tag, attrs }) => tag === 'time' && attrs.datetime === googleReviews.checkedOn));
      }
    });
    const visible = decodeEntities(html.replace(/<a data-google-reviews\b[^>]*>[\s\S]*?<\/a>/g, '').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]*>/g, ' '));
    for (const claim of forbiddenClaims(visible)) failures.push(`${route}: unsupported ${claim}`);
    const schemas = [...html.matchAll(/<script\b((?:[^'"<>]|"[^"]*"|'[^']*')*)>([\s\S]*?)<\/script\s*>/gi)]
      .filter((match) => attributes(match[1]).type?.toLowerCase() === 'application/ld+json');
    if (route !== '/404.html' && !schemas.length) failures.push(`${route}: missing JSON-LD`);
    for (const block of schemas) {
      check(`${route} JSON-LD`, () => {
        const data = JSON.parse(block[2]);
        page.structuredData = data;
        assert(data && typeof data === 'object', 'Schema must be an object or array');
        let hasSchemaContext = false;
        let hasType = false;
        walkJson(data, (node) => {
          if (/^https?:\/\/schema\.org\/?$/.test(node['@context'])) hasSchemaContext = true;
          const types = [node['@type']].flat();
          if (types.some((type) => typeof type === 'string' && type.length)) hasType = true;
          assert(!types.some((type) => ['Review', 'AggregateRating', 'EducationalOccupationalCredential'].includes(type)), 'Unsupported review/certification schema');
          assert(!node.aggregateRating && !node.review && !node.hasCredential, 'Unsupported review/certification property');
          if (node.inLanguage) assert([node.inLanguage].flat().every((lang) => /^nl(?:-NL)?$/i.test(lang)), 'Non-Dutch schema language');
          if (typeof node['@id'] === 'string' && node['@id'].startsWith(origin)) {
            (Object.keys(node).some((key) => key !== '@id') ? definedIds : referencedIds).add(node['@id']);
          }
        });
        assert(hasSchemaContext, 'Missing schema.org context');
        assert(hasType, 'Missing schema type');
        for (const claim of forbiddenClaims(JSON.stringify(data))) failures.push(`${route} JSON-LD: unsupported ${claim}`);
      });
    }

    for (const { tag, attrs } of tags) {
      for (const key of ['href', 'src', 'poster']) {
        if (attrs[key] !== undefined) references.push({ from: route, value: attrs[key], base: url, anchor: tag === 'a' && key === 'href' });
      }
      if (tag === 'video' && attrs['data-background-video']) references.push({ from: route, value: attrs['data-background-video'], base: url });
      if (attrs.srcset && !attrs.srcset.trim().startsWith('data:')) {
        for (const item of attrs.srcset.split(',')) references.push({ from: route, value: item.trim().split(/\s+/)[0], base: url });
      }
      if (attrs.style) for (const value of cssReferences(attrs.style)) references.push({ from: route, value, base: url });
      if (tag === 'form') check(`${route} form`, () => assert(!attrs.action || /^(?:mailto:|https:\/\/)/i.test(attrs.action), 'Local form submission needs a server'));
    }
    for (const block of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
      for (const value of cssReferences(block[1])) references.push({ from: route, value, base: url });
    }
  }

  check('HTML inventory', () => {
    assert.equal(pages.size, ROUTES.length + 1, `Expected ${ROUTES.length} public pages plus 404`);
    assert.deepEqual(files.filter((file) => /\.html?$/i.test(file.name)).map((file) => file.name).sort(), [...expectedFiles].sort(), 'Unexpected or duplicate HTML pages');
  });
  const titles = ROUTES.map((route) => pages.get(route)?.html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]).filter(Boolean);
  check('Titles', () => assert.equal(new Set(titles).size, ROUTES.length, 'Public page titles must be unique'));
  check('Compact external Google Maps link', () => {
    const tags = pages.get('/contact').tags;
    assert(!tags.some(({ tag }) => tag === 'iframe'), 'Do not embed a map');
    assert(!tags.some(({ attrs }) => attrs.id === 'load-map' || attrs['data-map-src']), 'Remove the map loader and placeholder');
    const link = tags.find(({ tag, attrs }) => tag === 'a' && attrs['aria-label']?.includes('in Google Maps'));
    assert(link, 'Keep an accessible Google Maps link');
    const source = new URL(link.attrs.href);
    assert.equal(source.origin, 'https://www.google.com');
    assert.equal(source.pathname, '/maps/search/');
    assert(source.searchParams.has('query_place_id'), 'Keep the correct business destination');
    assert(!source.searchParams.has('key'), 'Map should not require an API key');
    assert.equal(link.attrs.target, '_blank');
    assert(link.attrs.rel.includes('noopener'), 'Protect the external map link');
    assert(pages.get('/privacy').ids.has('google-maps'), 'Missing map privacy disclosure');
    assert(pages.get('/privacy').html.includes('Er wordt geen kaart op deze website geladen.'), 'Privacy information should match the external-only map');
    assert(!tags.some(({ tag, attrs }) => ['link', 'script', 'img'].includes(tag) && /^https:\/\/[^/]*google/.test(attrs.src || attrs.href || '')), 'No eager Google resources');
  });
  check('Project intake', () => {
    const tags = pages.get('/contact').tags;
    for (const name of ['Opdrachtgever', 'Prijsafspraak', 'Werkpakket']) assert(tags.some(({ tag, attrs }) => tag === 'select' && attrs.name === name), `Missing ${name}`);
    assert(tags.some(({ tag, attrs }) => tag === 'option' && attrs.value === 'particulier'), 'Private project path missing');
    for (const id of ['intake-heading', 'intake-description']) assert(pages.get('/contact').ids.has(id), `Missing audience-specific intake element ${id}`);
  });
  check('Compact contact page', () => {
    const { html, tags } = pages.get('/contact');
    const optional = html.match(/<details class="form-extra">([\s\S]*?)<\/details>/)?.[1];
    assert(optional, 'Keep optional intake fields in a disclosure');
    for (const field of ['E-mail', 'Telefoon', 'Startperiode', 'Werkpakket', 'Gewenste bezetting', 'Prijsafspraak']) {
      assert(optional.includes(`name="${field}"`), `${field} should not lengthen the default form`);
    }
    assert(!tags.some(({ attrs }) => attrs.name === 'Toelichting'), 'Use one project description instead of overlapping scope and explanation fields');
    assert(tags.some(({ tag, attrs }) => tag === 'textarea' && attrs.name === 'Projectomvang' && 'required' in attrs), 'Keep the project description required');
    assert(tags.some(({ tag, attrs }) => tag === 'div' && attrs.id === 'locatie' && attrs.class === 'contact-location'), 'Keep the location as a compact inline row');
    assert(!html.includes('class="container location-grid"'), 'Avoid a separate full-height location section');
  });
  const globalHeaders = parseGlobalHeaders(await readFile(resolve(root, '_headers'), 'utf8'));
  check('Planned work rates', () => {
    const businessPage = pages.get('/zakelijk');
    const contactPage = pages.get('/contact');
    assert(businessPage.ids.has('tarieven'), 'Pricing anchor missing');
    for (const id of ['dagtarief', 'uur-reis']) {
      assert(businessPage.tags.some(({ attrs }) => attrs['data-rate'] === id), `Missing secondary rate reference ${id}`);
      assert(businessPage.tags.some(({ tag, attrs }) => tag === 'a' && attrs.href === `/contact?prijs=${id}#aanvraag`), `Missing preference link ${id}`);
      assert(contactPage.tags.some(({ tag, attrs }) => tag === 'option' && attrs['data-rate'] === id), `Missing intake preference ${id}`);
    }
    const copy = decodeEntities(businessPage.html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
    for (const term of ['8 werkuren op locatie: \u20ac 464 excl. btw', '\u20ac 58 per uur', 'Minimale boeking: \u00e9\u00e9n projectdag van 8 uur', '\u20ac 35', '\u20ac 55', '\u20ac 95', '\u20ac 499', '\u20ac 519', '\u20ac 559', 'btw verlegd', 'excl. btw', 'buiten de regio', 'nog geen boeking']) {
      assert(copy.includes(term), `Missing rate condition: ${term}`);
    }
    const intakeCopy = decodeEntities(contactPage.html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
    for (const term of ['Zakelijke projectdag (indicatie): \u20ac 464 excl. btw per monteur voor 8 uur + reisbijdrage', 'Zakelijk uurtarief (indicatie): \u20ac 58 excl. btw per monteur per uur + reisbijdrage', 'Particuliere projecturen (indicatie): \u20ac 75,63 per monteur per uur incl. btw + reisbijdrage']) {
      assert(intakeCopy.includes(term), `Incorrect intake price: ${term}`);
    }
    for (const route of ['/zakelijk']) {
      const businessCopy = decodeEntities(pages.get(route).html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
      assert(businessCopy.includes('\u20ac 58 per uur') && businessCopy.includes('\u20ac 464 excl. btw'), `Incorrect business rates on ${route}`);
      assert(!businessCopy.includes('\u20ac 62,50 per uur') && !businessCopy.includes('\u20ac 500 per dag'), `Obsolete business rates on ${route}`);
    }
    for (const page of pages.values()) assert(!/netto marge|brandstof 100%|\u20ac\s*485/.test(decodeEntities(page.html)), 'Internal margin calculation must not be public');
  });
  check('Negotiable reference prices and explicitly agreed blended team rates', () => {
    for (const route of ['/', '/zakelijk', '/woningprojecten']) {
      assert(pages.get(route).html.includes('Prijsafspraken zijn bespreekbaar.'), `Explain negotiable project pricing on ${route}`);
    }
    const contact = pages.get('/contact');
    for (const id of ['teamtarief', 'per-rol']) {
      const option = contact.tags.find(({ tag, attrs }) => tag === 'option' && attrs['data-rate'] === id);
      assert(option && !option.attrs['data-audience'], `Offer ${id} as an optional preference for both client types`);
    }
    for (const [route, id, href] of [
      ['/zakelijk', 'teamtarief', '/contact?prijs=teamtarief#aanvraag'],
      ['/woningprojecten', 'particulier-teamtarief', '/contact?type=particulier&prijs=teamtarief#aanvraag'],
    ]) {
      const page = pages.get(route);
      const team = page.html.match(new RegExp(`<details\\b[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/details>`))?.[0];
      assert(team && !('open' in htmlTags(team)[0].attrs), `Keep detailed team pricing secondary on ${route}`);
      const copy = decodeEntities(team.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
      for (const term of ['Tarief per rol', 'Eén gemiddeld teamtarief', 'uurtarief per persoon', 'ervaringsniveau', 'technische begeleiding', 'specialistische inzet offreren we apart', '16 persoonsuren', 'extra inzet alleen na akkoord', 'per voertuig, niet per persoon']) {
        assert(copy.includes(term), `Missing transparent team-pricing condition on ${route}: ${term}`);
      }
      assert(page.tags.some(({ tag, attrs }) => tag === 'a' && attrs.href === href), `Missing team-price enquiry link on ${route}`);
      assert(page.html.includes('referentietarief') && page.html.includes('indicatief'), `Hourly prices must be clearly indicative on ${route}`);
      assert(copy.includes(route === '/woningprojecten' ? 'bedragen inclusief btw' : 'bedragen exclusief btw'), `Correct team-price VAT context on ${route}`);
    }
  });
  check('Private visit minimum includes VAT and one travel charge without double billing', () => {
    const privatePage = pages.get('/woningprojecten');
    const minimum = privatePage.html.match(/<div class="private-visit-minimum" id="minimumbezoek">([\s\S]*?)<\/div>/)?.[1];
    assert(minimum, 'Explain the private minimum within the hourly pricing terms');
    const copy = decodeEntities(minimum.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
    for (const term of ['minimaal 2 arbeidsuren', 'Bij 1,5 uur werk betaalt u dus 2 uur; bij 3 uur werk betaalt u 3 uur', 'niet boven op de gewerkte uren', 'inclusief 21% btw en één retourrit', '\u20ac 151,25 arbeid', '\u20ac 42,35', '\u20ac 66,55', '\u20ac 193,60', '\u20ac 217,80', 'geen extra voorrijtoeslag', 'per voertuig per werkdag', 'Boven 55 km', 'teambezetting', 'vaste projectofferte', 'herstel van onze eigen uitvoeringsfouten', 'vóór uw akkoord', 'geen spoed- of reparatieservice']) {
      assert(copy.includes(term), `Missing private minimum condition: ${term}`);
    }
    const zones = htmlTags(minimum).filter(({ tag, attrs }) => tag === 'tr' && attrs['data-private-visit-zone']);
    assert.deepEqual(zones.map(({ attrs }) => attrs['data-private-visit-zone']), ['25', '55'], 'Do not offer short visits at the distant-project rate');
    assert(privatePage.tags.some(({ tag, attrs }) => tag === 'a' && attrs.href === '#minimumbezoek'), 'Minimum terms must be reachable from the visible pricing notice');
    const contact = pages.get('/contact');
    const option = contact.html.match(/<option\b[^>]*data-rate="particulier-regie"[^>]*>([^<]+)<\/option>/)?.[1];
    assert(option?.includes('min. 2 arbeidsuren per bezoek'), 'The selected hourly enquiry must carry the minimum into the draft');
    const rateOption = contact.tags.find(({ tag, attrs }) => tag === 'option' && attrs['data-rate'] === 'particulier-regie');
    assert(rateOption.attrs['data-price-note']?.includes('\u20ac 193,60 incl. btw en reis'), 'Provide a visible, VAT-inclusive local total beside the selected hourly preference');
    assert(!pages.get('/zakelijk').html.includes('id="minimumbezoek"'), 'Private call-out terms must not replace the existing business agreement');
  });
  check('Maps security policy', () => assert.match(globalHeaders['Content-Security-Policy'], /(?:^|;)\s*frame-src https:\/\/www\.google\.com\s*;/, 'Only Google Maps frames should be allowed'));
  check('Quote-led pricing with secondary hourly terms', () => {
    const business = pages.get('/zakelijk');
    const businessRegie = business.html.match(/<details\b[^>]*id="uur-reis"[^>]*>([\s\S]*?)<\/details>/)?.[0];
    assert(businessRegie && !('open' in htmlTags(businessRegie)[0].attrs), 'Keep B2B hourly terms accessible in a closed secondary disclosure');
    assert(business.html.indexOf('Vraag een projectofferte') < business.html.indexOf('id="uur-reis"'), 'Lead with the project quote, not the hourly rate');
    assert(businessRegie.includes('Standaard projectmontage') && businessRegie.includes('travel-table'), 'Present the hourly reference together with its scope and additional costs');
    assert(!business.tags.some(({ tag, attrs }) => tag === 'article' && attrs['data-rate']), 'Do not promote hours and days as competing price cards');
    assert(pages.get('/woningprojecten').ids.has('prijsafspraak'), 'Residential pricing anchor missing');
    assert(pages.get('/woningprojecten').html.includes('per uur incl. 21% btw'), 'Residential VAT label missing');
    const privateHtml = pages.get('/woningprojecten').html;
    const privateRegie = privateHtml.match(/<details\b[^>]*id="particulier-regie"[^>]*>([\s\S]*?)<\/details>/)?.[0];
    assert(privateRegie && !('open' in htmlTags(privateRegie)[0].attrs), 'Keep private project hours secondary and collapsed initially');
    assert(privateHtml.indexOf('Vraag een woningofferte') < privateHtml.indexOf('id="particulier-regie"'), 'Lead private clients to the total project quote');
    const privateCopy = decodeEntities(pages.get('/woningprojecten').html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
    for (const term of ['\u20ac 75,63 per uur incl. 21% btw', '8 werkuren: \u20ac 605 incl. 21% btw', '\u20ac 42,35', '\u20ac 66,55', '\u20ac 114,95', '\u20ac 647,35', '\u20ac 671,55', '\u20ac 719,95']) {
      assert(privateCopy.includes(term), `Incorrect residential price: ${term}`);
    }
    assert(!privateCopy.includes('\u20ac 82,28') && !privateCopy.includes('\u20ac 68 excl.'), 'Obsolete residential rate');
    const home = pages.get('/');
    assert(home.ids.has('tarieven'), 'Shared home pricing anchor missing');
    for (const audience of ['business', 'private']) {
      assert(home.tags.some(({ tag, attrs }) => tag === 'article' && attrs['data-audience'] === audience), `Missing photo-led ${audience} route`);
    }
    const homeCopy = decodeEntities(home.html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ');
    assert(!/\u20ac\s*\d/.test(homeCopy), 'Homepage should explain pricing methods without advertising hourly or daily amounts');
    for (const term of ['Vaste projectprijs', 'Werken op regie', 'Team op maat']) assert(homeCopy.includes(term), `Missing home pricing method: ${term}`);
    for (const href of ['/zakelijk#tarieven', '/woningprojecten#prijsafspraak']) assert(home.tags.some(({ tag, attrs }) => tag === 'a' && attrs.href === href), `Pricing conditions must remain easy to find: ${href}`);
    for (const route of ROUTES) {
      const html = pages.get(route).html;
      const businessIndex = html.indexOf('class="nav-link" href="/zakelijk"');
      const privateIndex = html.indexOf('class="nav-link" href="/woningprojecten"');
      const servicesIndex = html.indexOf('class="nav-link" href="/diensten"');
      assert(businessIndex >= 0 && privateIndex > businessIndex && servicesIndex > privateIndex, `Audience-first navigation missing on ${route}`);
    }
  });
  const assetVersion = createHash('sha256').update(await readFile(resolve(root, 'assets/styles.css'))).update(await readFile(resolve(root, 'assets/site.js'))).digest('hex').slice(0, 12);
  check('Changed styles and scripts bypass stale browser caches', () => {
    for (const page of pages.values()) {
      assert(page.tags.some(({ tag, attrs }) => tag === 'link' && attrs.href === `/assets/styles.css?v=${assetVersion}`), 'Stylesheet must have a content-based version');
      assert(page.tags.some(({ tag, attrs }) => tag === 'script' && attrs.src === `/assets/site.js?v=${assetVersion}`), 'Script must have a content-based version');
    }
  });
  check('Single company identity line and comprehensive project-led services', () => {
    assert(!pages.get('/over-ons').html.includes('class="details-list"'), 'Do not repeat the company registry as an About-page table');
    for (const route of ROUTES) {
      const footer = pages.get(route).html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/)[0];
      assert.equal((footer.match(/97285862/g) || []).length, 1, 'Show KvK once in the footer');
      assert(!footer.includes('KvK: Voltaa'), 'KvK must not repeat the legal company name');
    }
    const { html, tags } = pages.get('/diensten');
    assert(html.includes('Onze projectfocus.'), 'Feature the preferred project work before the full catalogue');
    assert(html.indexOf('project-focus-services') < html.indexOf('id="alle-werkzaamheden"'), 'Project priorities must precede the broader services');
    const services = tags.filter(({ tag, attrs }) => tag === 'a' && /^\/contact\?werk=/.test(attrs.href || ''));
    assert(services.length >= 35, 'Include four featured work packages and at least 31 specific services');
    const intake = pages.get('/contact').tags;
    for (const { attrs } of services) {
      const id = new URL(attrs.href, DEFAULT_ORIGIN).searchParams.get('werk');
      assert(intake.some(({ tag, attrs }) => tag === 'option' && attrs['data-work'] === id), `Missing enquiry preference for ${id}`);
    }
    assert(!/meest winstgevend|hoogste marge|most profitable/i.test(html), 'Internal profitability positioning must not be published as a customer-facing claim');
  });
  check('Footer prioritizes messaging and groups navigation', () => {
    for (const route of ROUTES) {
      const footer = pages.get(route).html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/)[0];
      const tags = htmlTags(footer);
      const messaging = tags.find(({ tag, attrs }) => tag === 'a' && attrs.class?.includes('footer-whatsapp'));
      const calling = tags.find(({ tag, attrs }) => tag === 'a' && attrs.class === 'footer-phone');
      assert.equal(messaging?.attrs.href, 'https://wa.me/31617552558', 'Use the real WhatsApp link as the primary footer action');
      assert(messaging.attrs.class.includes('button--primary'), 'WhatsApp must have primary visual emphasis');
      assert.equal(calling?.attrs.href, 'tel:+31617552558', 'Keep calling available as a secondary link');
      assert(!calling.attrs.class.includes('button'), 'Calling must not compete as a primary button');
      assert(footer.indexOf('footer-whatsapp') < footer.indexOf('footer-phone'), 'Show messaging before calling');
      assert(footer.includes('Bij voorkeur een bericht via WhatsApp.'), 'State the preferred contact channel');
      assert(footer.includes('aria-label="Snel naar"') && footer.includes('aria-label="Normen en veiligheid"'), 'Separate navigation from standards and contact information');
    }
  });
  check('Project-led team capacity without unconfirmed staffing promises', () => {
    const business = pages.get('/zakelijk');
    const contact = pages.get('/contact');
    assert(business.ids.has('bezetting'), 'Explain the available team arrangements on the B2B page');
    for (const id of ['ervaren-monteur', 'met-hulpmonteur', 'tweede-monteur']) {
      assert(business.tags.some(({ tag, attrs }) => tag === 'a' && attrs.href === `/contact?bezetting=${id}#aanvraag`), `Missing team enquiry link: ${id}`);
      assert(contact.tags.some(({ tag, attrs }) => tag === 'option' && attrs['data-crew'] === id), `Missing team preference: ${id}`);
    }
    assert(business.html.includes('tarief per rol of één gemiddeld teamtarief'), 'Offer role-based or explicitly agreed blended pricing, not an automatic full electrician rate for every worker');
    assert(business.html.includes('technische begeleiding') && business.html.includes('beschikbaarheid'), 'Explain supervision and confirm availability before agreeing a team');
    assert(pages.get('/').html.includes('ervaren monteur of afgestemd team'), 'Homepage must not read as single-person-only');
    assert(pages.get('/over-ons').html.includes('hulpmonteur of tweede monteur'), 'About page should explain flexible execution capacity');
    assert(!/altijd (?:een )?(?:team|ploeg|hulpmonteur) beschikbaar|alleen een B\.V\. kan/i.test(business.html), 'Do not promise permanent capacity or claim B.V.-exclusive staffing rights');
  });
  check('Concise, non-repeated page content', () => {
    for (const route of ROUTES.filter(route => route !== '/privacy')) {
      const main = pages.get(route).html.match(/<main[^>]*>([\s\S]*?)<\/main>/)[1];
      const normalize = text => decodeEntities(text.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim().toLowerCase();
      const headings = [...main.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/g)].map(match => normalize(match[1]));
      assert.equal(new Set(headings).size, headings.length, `Repeated heading on ${route}`);
      const paragraphs = [...main.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map(match => normalize(match[1])).filter(text => text.length > 80);
      assert.equal(new Set(paragraphs).size, paragraphs.length, `Repeated paragraph on ${route}`);
    }
    const home = pages.get('/').html;
    for (const section of ['home-partner', 'home-private-section', 'faq-section']) assert(!home.includes(`class="section ${section}"`) && !home.includes(`class="section section--muted ${section}"`), `Redundant homepage section: ${section}`);
    for (const route of ['/', '/diensten']) assert(!pages.get(route).html.includes('class="scope-tags"'), 'Service descriptions should not be followed by repeated tag lists');
    assert(!pages.get('/projecten').html.includes('Meer werk in beeld'), 'Project page should not link to itself as more content');
  });
  check('Contact stays directly accessible alongside WhatsApp', () => {
    for (const route of ROUTES) {
      const { tags } = pages.get(route);
      assert(tags.some(({ tag, attrs }) => tag === 'a' && attrs.href === '/contact' && attrs.class?.includes('header-contact-button')), `Contact header button missing on ${route}`);
      assert(tags.some(({ tag, attrs }) => tag === 'a' && attrs.href === 'https://wa.me/31617552558' && attrs.class?.includes('header-whatsapp-button')), `WhatsApp header button missing on ${route}`);
    }
  });
  check('WhatsApp is the preferred contact channel', () => {
    for (const route of ROUTES) {
      const { html } = pages.get(route);
      assert(html.includes('class="button button--primary header-whatsapp-button" href="https://wa.me/31617552558"'), `Header WhatsApp CTA missing on ${route}`);
      assert(html.includes('href="tel:+31617552558"'), `Secondary telephone contact missing on ${route}`);
    }
    const { html, tags } = pages.get('/contact');
    assert(html.indexOf('class="contact-whatsapp"') < html.indexOf('<small>Liever bellen?</small>'), 'Direct WhatsApp contact must precede calling');
    const submit = tags.filter(({ tag, attrs }) => tag === 'button' && attrs.type === 'submit');
    assert.equal(submit[0].attrs.value, 'whatsapp', 'Default form submission should prepare WhatsApp');
    assert(submit[0].attrs.class.includes('button--primary'), 'WhatsApp should be the primary form action');
    assert.equal(submit[1].attrs.value, 'email', 'Email must remain available');
    assert(!Object.hasOwn(tags.find(({ tag, attrs }) => tag === 'input' && attrs.name === 'E-mail').attrs, 'required'), 'WhatsApp requests must not require an email address');
  });
  check('Named team portraits on About page', () => {
    const { html, tags } = pages.get('/over-ons');
    for (const name of ['Maksym Usyk', 'Oleksandr Volkov']) assert(html.includes(name), `Missing team member: ${name}`);
    for (const src of ['/assets/media/maksym-usyk-natural-portrait-v3.webp', '/assets/oleksandr-working-uniform-portrait.webp']) {
      const portrait = tags.find(({ tag, attrs }) => tag === 'img' && attrs.src === src);
      assert(portrait?.attrs.alt, `Missing portrait or alternative text: ${src}`);
      assert(portrait.attrs.width && portrait.attrs.height, 'Portrait dimensions must reserve space');
    }
    assert(!html.includes('maksym-usyk-business-portrait-v1') && !html.includes('maksym-usyk-business-portrait-v2'), 'Only the approved portrait should be published');
  });
  check('Distinct real-photo page openings', () => {
    const openings = new Map([
      ['/', 'work-photos/webp/industrial-panel-distribution-progress'],
      ['/zakelijk', 'media/opening-commercial-panel'],
      ['/woningprojecten', 'media/opening-daylight-home'],
      ['/diensten', 'media/opening-linear-lighting'],
      ['/projecten', 'media/opening-modern-living'],
      ['/over-ons', 'media/opening-team-on-site'],
      ['/contact', 'media/opening-cove-lighting'],
    ]);
    assert.equal(new Set(openings.values()).size, openings.size, 'Each main page needs a distinct opening photo');
    assert(!pages.get('/').html.includes('opening-hospitality'), 'The old restaurant hero must not return');
    const homePhotos = pages.get('/').tags.filter(({ tag, attrs }) => tag === 'img' && ['project-hero-image', 'hero-photo-detail', 'hero-photo-interior'].includes(attrs.class));
    assert.equal(homePhotos.length, 3, 'Homepage should show installation, lighting and finished interior photos');
    assert.equal(new Set(homePhotos.map(({ attrs }) => attrs.src)).size, 3, 'Homepage collage photos must differ');
    for (const [route, file] of openings) {
      const { tags, html } = pages.get(route);
      const images = tags.filter(({ tag, attrs }) => tag === 'img' && ['project-hero-image', 'page-intro-image'].includes(attrs.class));
      assert.equal(images.length, 1, `One opening photo required on ${route}`);
      const image = images[0];
      assert.equal(image.attrs.src, `/assets/${file}.webp`, `Wrong opening photo on ${route}`);
      assert.equal(image.attrs.loading, 'eager', 'Opening photo must not be lazy-loaded');
      assert.equal(image.attrs.fetchpriority, 'high', 'Opening photo needs loading priority');
      assert(files.find((asset) => asset.name === `assets/${file}.webp`)?.bytes < 550_000, 'Opening photo exceeds asset budget');
      assert(!image.attrs.style, 'Photo framing must use the stylesheet, not CSP-blocked inline styles');
      assert(image.attrs.alt && Number(image.attrs.width) > 0 && Number(image.attrs.height) > 0, 'Photo needs alternative text and stable dimensions');
      const headingIndex = tags.findIndex(({ tag }) => tag === 'h1');
      if (image.attrs.class === 'page-intro-image') {
        assert(tags.indexOf(image) > headingIndex && tags.indexOf(image) < tags.findIndex(({ tag }) => tag === 'h2'), 'Editorial photo must follow the introduction and precede the main content');
        assert(!html.includes('page-intro-shade'), 'Editorial photos must not have a fading overlay');
      } else assert(tags.indexOf(image) < headingIndex, 'Hero photo must be part of the opening');
      assert(!tags.some(({ tag }) => tag === 'video'), 'Page openings should use real photos');
      assert(!html.includes('hero-video-toggle'), 'No inactive video controls');
    }
    assert(!pages.get('/privacy').tags.some(({ attrs }) => attrs.class === 'page-intro-image'), 'Legal page should remain compact');
    assert.equal(files.filter((file) => file.name.endsWith('.mp4')).length, 0, 'Unused clips must not be shipped');
  });
  check('Local relevance in public HTML', () => {
    const home = pages.get('/');
    const opening = home.html.match(/<p class="project-hero-description">([^<]+)<\/p>/)?.[1] || '';
    for (const phrase of ['bouw en renovatie', 'Utrecht', 'Gelderland', 'Vanuit Veenendaal']) {
      assert(opening.includes(phrase), `Homepage must explain the actual service region without JavaScript: ${phrase}`);
    }
    const businessDescription = pages.get('/zakelijk').tags.find(({ tag, attrs }) => tag === 'meta' && attrs.name === 'description').attrs.content;
    assert(/aannemers en installatiebedrijven/.test(businessDescription), 'Business description must identify the actual buyers');
    assert(/Utrecht en Gelderland/.test(businessDescription), 'Business description must reflect the real service region');
    const privateDescription = pages.get('/woningprojecten').tags.find(({ tag, attrs }) => tag === 'meta' && attrs.name === 'description').attrs.content;
    assert(/grote woningrenovaties/.test(privateDescription) && /inclusief btw/.test(privateDescription), 'Private projects must remain distinct, with consumer-facing pricing context');
    assert(!fileNames.has('SEARCH-LAUNCH.md'), 'Internal launch observations must not be published');
  });
  for (const id of referencedIds) check('Schema reference', () => assert(definedIds.has(id), `Undefined entity: ${id}`));

  for (const file of files) {
    if (file.name.endsWith('.css')) {
      for (const value of cssReferences(await readFile(file.path, 'utf8'))) references.push({ from: file.name, value, base: new URL(`/${file.name}`, origin) });
    }
    if (/\.(?:m?js|css)$/i.test(file.name)) {
      const source = await readFile(file.path, 'utf8');
      check(file.name, () => assert(!/\/_next\/|__NEXT_DATA__|self\.__next_f|["'`]\/api(?:\/|["'`?#])/.test(source), 'Next runtime or server API reference found'));
    }
  }

  for (const ref of references) {
    if (/^(?:mailto:|tel:|sms:|data:|blob:)/i.test(ref.value)) continue;
    try {
      assert(!/^javascript:/i.test(ref.value), 'javascript: URL');
      const target = new URL(ref.value, ref.base);
      if (target.origin !== origin) continue;
      assert(!/^\/(?:en|uk|ru|api|_next)(?:\/|$)/i.test(target.pathname), 'Forbidden locale, API or Next URL');
      const pathname = normalizeRequestPath(target.pathname);
      const file = await resolvePublicFile(root, pathname);
      assert(file, `Missing target ${target.pathname}`);
      if (ref.anchor && target.hash && extname(file) === '.html') {
        let targetPage = pages.get(canonicalPath(target));
        if (!targetPage || targetPage.file !== file) targetPage = { ids: new Set(htmlTags(await readFile(file, 'utf8')).map(({ attrs }) => attrs.id).filter(Boolean)) };
        assert(targetPage.ids.has(decodeURIComponent(target.hash.slice(1))), `Missing anchor ${target.hash} on ${target.pathname}`);
      }
    } catch (error) { failures.push(`${ref.from} -> ${ref.value}: ${error.message}`); }
  }

  try {
    const xml = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
    const locations = [...xml.matchAll(/<loc\b[^>]*>([\s\S]*?)<\/loc>/gi)].map((match) => decodeEntities(match[1].trim()));
    assert.match(xml, /<urlset\b/, 'Expected a URL sitemap');
    assert.equal(locations.length, ROUTES.length, `Sitemap must contain exactly ${ROUTES.length} URLs`);
    const paths = locations.map((value) => {
      const url = new URL(value);
      assert.equal(url.origin, origin, 'Wrong sitemap origin');
      assert(!url.hash && !url.search, 'Sitemap URL has query/fragment');
      return canonicalPath(url);
    });
    assert.deepEqual(paths.sort(), [...ROUTES].sort(), 'Sitemap does not match the public route set');
  } catch (error) { failures.push(`sitemap.xml: ${error.message}`); }
  try {
    const robots = await readFile(resolve(root, 'robots.txt'), 'utf8');
    assert(!/^Disallow:\s*\/\s*$/im.test(robots), 'Robots blocks the whole site');
    assert(robots.split(/\r?\n/).some((line) => line.trim().toLowerCase() === `sitemap: ${origin}/sitemap.xml`.toLowerCase()), 'Missing canonical sitemap declaration');
    for (const agent of ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User']) {
      assert(robots.includes(`User-agent: ${agent}\n`), `Missing explicit search/retrieval crawler: ${agent}`);
    }
  } catch (error) { failures.push(`robots.txt: ${error.message}`); }
  try {
    const profile = JSON.parse(await readFile(resolve(root, 'company.json'), 'utf8'));
    const guide = await readFile(resolve(root, 'llms.txt'), 'utf8');
    const fullText = await readFile(resolve(root, 'llms-full.txt'), 'utf8');
    check('Public AI-readable company profile', () => {
      assert.equal(profile.schemaVersion, 1);
      assert.equal(profile.canonicalUrl, `${origin}/`);
      assert.equal(profile.name, 'Elektoria Elektrotechniek');
      assert.equal(profile.legalName, 'Voltaa Group B.V.');
      assert.equal(profile.kvk, '97285862');
      assert.equal(profile.contact.preferredChannel, 'WhatsApp');
      assert.equal(profile.contact.whatsapp, 'https://wa.me/31617552558');
      assert.deepEqual(profile.contact.availableLanguages, ['nl', 'en', 'uk', 'ru']);
      assert.deepEqual(profile.siteLanguages, ['nl'], 'Contact languages must not imply four translated websites');
      assert.equal(profile.enquiries.automaticSubmission, false);
      assert.equal(profile.enquiries.automaticBooking, false);
      assert.equal(profile.pricing.indicative, true);
      assert.equal(profile.pricing.business.hourlyReferenceExcludingVat, 58);
      assert.equal(profile.pricing.business.minimumBookingHours, 8);
      assert.equal(profile.pricing.business.dayReferenceExcludingVat, 464);
      assert.equal(profile.pricing.private.hourlyReferenceIncludingVat, 75.63);
      assert.equal(profile.pricing.private.dayReferenceIncludingVat, 605);
      assert.equal(profile.pricing.private.minimumVisit.labourHours, 2);
      assert.equal(profile.pricing.private.minimumVisit.labourIncludingVat, 151.25);
      assert.deepEqual(profile.pricing.private.minimumVisit.examplesIncludingVatAndTravel.map(item => item.totalIncludingVat), [193.6, 217.8]);
      assert.deepEqual(profile.pricing.travel.zones.map(zone => zone.amountIncludingVat), [42.35, 66.55, 114.95]);
      assert(profile.pricing.travel.unit.includes('per voertuig per werkdag'));
      assert(profile.teams.conditions.includes('geen universeel tarief'));
      assert.equal(profile.workPackages.length, 4);
      assert(profile.additionalServices.flatMap(group => group.items).length >= 31);
      for (const item of [...profile.workPackages, ...profile.additionalServices.flatMap(group => group.items)]) {
        const target = new URL(item.url);
        assert.equal(target.origin, origin);
        assert.equal(target.pathname, '/diensten');
        assert(pages.get('/diensten').ids.has(target.hash.slice(1)), `Missing visible service anchor: ${item.name}`);
      }
      for (const page of profile.pages) {
        const target = new URL(page.url);
        assert.equal(target.origin, origin);
        assert(pages.has(canonicalPath(target)), 'Profile must only reference real public pages');
      }
      assert(!/localhost|127\.0\.0\.1|netto marge|salary|password|api[_ -]?key/i.test(JSON.stringify(profile)), 'No local, internal or private information in the public profile');
    });
    check('Readable AI guides and machine-data discovery', () => {
      assert(guide.startsWith('# Elektoria Elektrotechniek\n\n> '));
      assert(guide.includes(`${origin}/company.json`) && guide.includes(`${origin}/llms-full.txt`));
      assert(guide.includes('geen boeking') && fullText.includes('geen boeking'));
      for (const term of ['\u20ac 58,00', '\u20ac 75,63', '\u20ac 193,60', '\u20ac 217,80', 'minimaal 2 arbeidsuren', 'persoonsuren', 'geen universeel tarief', 'geen extra toeslag']) {
        assert(fullText.toLowerCase().includes(term.toLowerCase()), `Full summary must retain pricing and team context: ${term}`);
      }
      for (const item of [...profile.workPackages, ...profile.additionalServices.flatMap(group => group.items)]) {
        assert(fullText.includes(item.name) && fullText.includes(item.url), `Missing service in text summary: ${item.name}`);
      }
      for (const route of ROUTES) {
        for (const [href, type] of [['/company.json', 'application/json'], ['/llms.txt', 'text/plain'], ['/llms-full.txt', 'text/plain']]) {
          assert(pages.get(route).tags.some(({ tag, attrs }) => tag === 'link' && attrs.rel === 'describedby' && attrs.href === href && attrs.type === type), `Missing ${href} discovery on ${route}`);
        }
      }
      assert(guide.length < 7000 && fullText.length < 25000, 'Keep supplementary guides compact');
    });
    check('Linked company and service entities without misleading prices or credentials', () => {
      for (const route of ROUTES) {
        const graph = pages.get(route).structuredData?.['@graph'];
        assert(Array.isArray(graph), `Missing entity graph on ${route}`);
        const organization = graph.find(node => node['@type'] === 'Organization');
        const electrician = graph.find(node => node['@type'] === 'Electrician');
        const website = graph.find(node => node['@type'] === 'WebSite');
        const page = graph.find(node => node['@type'] === 'WebPage');
        assert.equal(organization.name, profile.legalName);
        assert.equal(organization.identifier.value, profile.kvk);
        assert.equal(electrician.name, profile.name);
        assert.equal(electrician.parentOrganization['@id'], organization['@id']);
        assert.equal(page.isPartOf['@id'], website['@id']);
        assert.equal(page.about['@id'], electrician['@id']);
        assert.equal(electrician.hasMap, profile.googleMaps);
        assert.equal(electrician.contactPoint.url, profile.contact.whatsapp);
        assert(!electrician.serviceType, 'Use actual Service nodes, not a Service-only property on Electrician');
        if (['/zakelijk', '/woningprojecten'].includes(route)) {
          const service = graph.find(node => node['@type'] === 'Service');
          assert.equal(page.mainEntity['@id'], service['@id']);
          assert.equal(service.provider['@id'], electrician['@id']);
          assert.equal(service.audience['@type'], route === '/zakelijk' ? 'BusinessAudience' : 'Audience');
        }
      }
      const services = pages.get('/diensten').structuredData['@graph'].filter(node => node['@type'] === 'Service');
      assert.equal(services.length, profile.workPackages.length + profile.additionalServices.flatMap(group => group.items).length);
      for (const service of services) assert(pages.get('/diensten').ids.has(new URL(service.url).hash.slice(1)), 'Schema service must link to visible work');
    });
  } catch (error) { failures.push(`AI discovery resources: ${error.message}`); }
  try {
    const image = await readFile(resolve(root, 'assets/og-image.jpg'));
    const digest = createHash('sha256').update(image).digest('hex').slice(0, 12);
    const imagePath = `/assets/og-image-${digest}.jpg`;
    const versionedImage = await readFile(resolve(root, imagePath.slice(1)));
    const profile = JSON.parse(await readFile(resolve(root, 'company.json'), 'utf8'));
    check('Consistent sharing image and contact metadata', () => {
      assert(image.equals(versionedImage), 'Legacy image URL must also serve the corrected image');
      const imageUrl = `${origin}${imagePath}`;
      for (const route of ROUTES) {
        const page = pages.get(route);
        for (const [key, value] of [
          ['og:image', imageUrl], ['twitter:image', imageUrl],
          ['og:image:alt', `${profile.name} - ${profile.contact.telephone}`],
          ['twitter:image:alt', `${profile.name} - ${profile.contact.telephone}`],
          ['og:image:width', '1200'], ['og:image:height', '630'],
        ]) {
          const meta = page.tags.filter(({ tag, attrs }) => tag === 'meta' && (attrs.property === key || attrs.name === key));
          assert.equal(meta.length, 1, `Expected one ${key} on ${route}`);
          assert.equal(meta[0].attrs.content, value, `Wrong ${key} on ${route}`);
        }
        const electrician = page.structuredData['@graph'].find(node => node['@type'] === 'Electrician');
        assert.equal(electrician.image, imageUrl, 'Structured data must use the same versioned image');
      }
    });
  } catch (error) { failures.push(`Sharing image: ${error.message}`); }
  if (!fileNames.has('404.html')) failures.push('Missing top-level 404.html required for static hosting');

  await verifyHttp(root, pages, failures);
  const total = files.reduce((sum, file) => sum + file.bytes, 0);
  console.log(`Checked ${pages.size} HTML pages, ${references.length} references, ${files.length} files.`);
  console.log(`Total: ${total.toLocaleString('en-US')} bytes (${(total / 1024 / 1024).toFixed(2)} MiB).`);
  console.log(`Largest: ${[...files].sort((a, b) => b.bytes - a.bytes).slice(0, 5).map((file) => `${file.name} (${file.bytes.toLocaleString('en-US')} bytes)`).join(', ')}`);
  if (failures.length) {
    for (const failure of failures) console.error(`FAIL ${failure}`);
    throw new Error(`${failures.length} verification failure(s)`);
  }
  console.log('PASS: Dutch static site and local HTTP behavior verified. No build or deployment performed.');
}

async function verifyHttp(root, pages, failures) {
  const server = await createPreviewServer({ root });
  try {
    await new Promise((accept, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', accept); });
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const route of [...ROUTES, ...ROUTES.slice(1).map((route) => `${route}/`), '/missing-preview-page-404', '/404.html']) {
      try {
        const response = await fetch(`${base}${route}`, { redirect: 'manual', signal: AbortSignal.timeout(5000) });
        const expectedStatus = route.includes('missing-preview-page') || route === '/404.html' ? 404 : 200;
        assert.equal(response.status, expectedStatus, 'Unexpected HTTP status');
        assert.match(response.headers.get('content-type') || '', /^text\/html\b/i, 'Wrong HTML MIME');
        assert.match(response.headers.get('content-security-policy') || '', /frame-src https:\/\/www\.google\.com;/, 'Preview must enforce the Maps frame policy');
        const body = await response.text();
        if (expectedStatus === 404 && pages.has('/404.html')) assert.equal(body, pages.get('/404.html').html, 'Missing custom 404 body');
        if (expectedStatus === 200 && pages.has(route.replace(/\/$/, '') || '/')) {
          assert.equal(body, pages.get(route.replace(/\/$/, '') || '/').html, 'Clean URL served the wrong document');
        }
      } catch (error) { failures.push(`HTTP ${route}: ${error.message}`); }
    }
    for (const agent of ['OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User']) {
      for (const [path, type] of [['/robots.txt', 'text/plain'], ['/llms.txt', 'text/plain'], ['/llms-full.txt', 'text/plain'], ['/company.json', 'application/json'], ['/diensten', 'text/html']]) {
        try {
          const response = await fetch(`${base}${path}`, { headers: { 'User-Agent': agent }, signal: AbortSignal.timeout(5000) });
          assert.equal(response.status, 200);
          assert((response.headers.get('content-type') || '').startsWith(type), 'Wrong discovery content type');
          assert.equal(await response.text(), await readFile((await resolvePublicFile(root, path)), 'utf8'), 'Crawlers and visitors must receive the same public content');
        } catch (error) { failures.push(`HTTP ${agent} ${path}: ${error.message}`); }
      }
    }
    const head = await fetch(`${base}/`, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '', 'HEAD must have no response body');
    const post = await fetch(`${base}/`, { method: 'POST', signal: AbortSignal.timeout(5000) });
    assert.equal(post.status, 405, 'Static preview must reject POST');
    await post.text();
  } catch (error) { failures.push(`HTTP preview: ${error.message}`); }
  finally {
    server.closeAllConnections();
    await new Promise((accept) => server.close(accept));
  }
}

export function selfTest() {
  assert.equal(normalizeRequestPath('/contact/?x=1'), '/contact/');
  for (const path of ['/../private', '/%2e%2e/private', '/assets/%2e%2e/private', '/%2eenv', '/a%5cb', '/%00', '/%GG', '//example.com', '/_redirects']) assert.throws(() => normalizeRequestPath(path), undefined, path);
  assert.deepEqual(fileCandidates('/'), ['index.html']);
  assert.deepEqual(fileCandidates('/zakelijk/'), ['zakelijk/index.html', 'zakelijk.html', 'zakelijk']);
  assert.equal(MIME_TYPES['.svg'], 'image/svg+xml');
  assert.deepEqual(parseGlobalHeaders('/*\n  Content-Security-Policy: default-src \'self\'; frame-src https://www.google.com;\n/assets/*\n  Cache-Control: public, max-age=3600\n'), { 'Content-Security-Policy': "default-src 'self'; frame-src https://www.google.com;" });
  const rules = parseRedirects('# old URLs\n/old /contact 301\n/old/* /diensten/:splat 308\n/* /index.html 200');
  assert.equal(rules.length, 2);
  assert.deepEqual(matchRedirect('/old', rules), { status: 301, location: '/contact' });
  assert.deepEqual(matchRedirect('/old/test', rules), { status: 308, location: '/diensten/test' });
  assert.deepEqual(matchRedirect('/old/a?b', rules), { status: 308, location: '/diensten/a%3Fb' });
  assert.deepEqual(matchRedirect('/old', parseRedirects('/old /contact?name=a%20b 301')), { status: 301, location: '/contact?name=a%20b' });
  assert.equal(matchRedirect('/other', rules), null);
  assert.deepEqual(htmlTags('<script>const x = "<h1>fake</h1>";</script><!-- <img src="no"> --><a href="/contact?a=1&amp;b=2" id=go>Go</a>'), [
    { tag: 'script', attrs: {} }, { tag: 'a', attrs: { href: '/contact?a=1&b=2', id: 'go' } },
  ]);
  assert.deepEqual(cssReferences('/* url(no) */ @import "theme.css";a{background:url(../img/a.webp)}b{src:url("font.woff2")}'), ['theme.css', '../img/a.webp', 'font.woff2']);
  assert.deepEqual(forbiddenClaims('Werk volgens NEN 1010. 100% van de pagina geladen.'), []);
  assert(forbiddenClaims('0% storingen').includes('zero-percent claim'));
  assert(forbiddenClaims('B-VCA gecertificeerd').includes('certification claim'));
  assert(forbiddenClaims('Google Reviews').includes('review claim'));
  const discoveryInput = {
    business: { url: 'https://example.test', name: 'Test Elektrotechniek', legalName: 'Test B.V.', kvk: '12345678', street: 'Teststraat 1', postalCode: '1000 AA', city: 'Veenendaal', phone: '+31 6 0000 0000', email: 'info@example.test', whatsapp: 'https://wa.me/31600000000', googleMapsUrl: 'https://www.google.com/maps' },
    pricing: { vatRate: 0.21, businessHourly: 70, privateHourly: 80, dayHours: 8, privateMinimumHours: 3, privateShortVisitMaxKm: 55, travelZones: [{ label: 'Tot en met 25 km', maxKm: 25, fee: 40 }, { label: 'Tot en met 55 km', maxKm: 55, fee: 60 }, { label: 'Tot en met 100 km', maxKm: 100, fee: 100 }] },
    pages: [{ path: '/', label: 'Home', title: 'Test', description: 'Testbedrijf' }], workPackages: [], serviceCatalogue: [], crewChoices: [],
  };
  const discovery = createDiscovery(discoveryInput);
  const profile = JSON.parse(discovery.resources['company.json']);
  assert.equal(profile.pricing.business.hourlyReferenceExcludingVat, 70, 'Business AI references must follow changed source prices');
  assert.equal(profile.pricing.business.dayReferenceExcludingVat, 560);
  assert.equal(profile.pricing.private.hourlyReferenceIncludingVat, 96.8);
  assert.equal(profile.pricing.private.minimumVisit.labourIncludingVat, 290.4);
  assert.deepEqual(profile.pricing.private.minimumVisit.examplesIncludingVatAndTravel.map(item => item.totalIncludingVat), [338.8, 363]);
  assert(discovery.resources['llms-full.txt'].includes('\u20ac 338,80') && discovery.resources['llms-full.txt'].includes('minimaal 3 arbeidsuren'), 'Text summaries must follow minimum and travel changes, not hard-coded live prices');
  for (const badUrl of ['http://example.test', 'https://example.test/private', 'https://example.test/?key=private', 'https://user:secret@example.test']) {
    assert.throws(() => createDiscovery({ ...discoveryInput, business: { ...discoveryInput.business, url: badUrl } }), /canonical origin/);
  }
  console.log('PASS: built-in path, redirect, HTML/CSS parser and claim assertion tests.');
}

async function main() {
  let root = DEFAULT_DIST;
  let origin = DEFAULT_ORIGIN;
  const args = process.argv.slice(2);
  if (args.includes('--help')) {
    console.log('Usage: node verify.mjs [--dir path] [--origin https://www.elektoria.nl]\n       node verify.mjs --self-test\nChecks existing dist only; never builds or reads .env files.');
    return;
  }
  if (args.length === 1 && args[0] === '--self-test') { selfTest(); return; }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--dir' && args[i + 1]) root = resolve(args[++i]);
    else if (args[i] === '--origin' && args[i + 1]) origin = args[++i];
    else throw new Error(`Unknown or incomplete argument: ${args[i]}`);
  }
  selfTest();
  await verify({ root, origin });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(`Verification failed: ${error.code === 'ENOENT' ? 'dist is missing or incomplete; run the compact build first.' : error.message}`);
    process.exitCode = 1;
  });
}
