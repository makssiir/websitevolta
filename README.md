# Elektoria B2B Website

Standalone Dutch website for Elektoria Elektrotechniek / Voltaa Group B.V.
Business clients, contractors and larger private renovation or new-build projects.
This repository preserves the finished static website separately from the previous
multilingual Next.js project.

## Develop

Requires Node.js 22.

```sh
npm ci
npm run build
npm run verify
npm run preview -- --port 4176
```

Open http://127.0.0.1:4176/. Production output is generated in `dist/`.

## Source

- `build.mjs`: page templates, Dutch content and selected image references.
- `styles.css` and `site.js`: responsive layout and browser interactions.
- `pricing.json`: shared prices and travel contributions.
- `business.json`: public business/contact information.
- `discovery.mjs`: linked business/service schema and public AI-readable summaries.
- `media/` and `public/`: selected images needed for a reproducible build.
- `verify.mjs`: content, assets, routing, security headers and local HTTP checks.

The header offers separate Contact and WhatsApp buttons. WhatsApp is the preferred
messaging channel; telephone and email remain available. The project form only
prepares a message. Visitors review and send it themselves; no backend submission
or automatic success confirmation is used.

The About page includes the user-approved AI-assisted portrait of Maksym Usyk.
Its original and editing provenance are retained in `media/`. Project photos are
not generated. Historical source paths in `media/sources.json` refer to the owner's
original media archive; the selected web-ready images are included here.

## Hosting

Publish only `dist/`, never the repository source. For Cloudflare Pages:

- Framework preset: None.
- Root directory: repository root.
- Build command: `npm ci && npm run build && npm run verify`.
- Output directory: `dist`.
- Node.js version: 22 or later.

No server functions, database, translation bundles or environment secrets are
required. Google Maps opens through an explicit external link.

## Search And AI Discovery

The build generates linked Schema.org `Organization`, `Electrician`, `WebSite`,
`WebPage` and `Service` entities, plus a service catalogue. The legal company,
trading name, KvK, Google Maps listing and preferred WhatsApp contact are linked.
No unverified credentials, invented ratings or universal all-in prices are added.

Public resources, generated from the same business, service and pricing inputs:

- `/robots.txt`: open crawling with explicit Google, Bing, OpenAI search,
  Anthropic search and Perplexity search/user-fetcher groups.
- `/llms.txt`: concise site guide and authoritative page links.
- `/llms-full.txt`: compact business/service summary with pricing conditions.
- `/company.json`: a documented-by-example public profile, `schemaVersion: 1`.
- `/sitemap.xml`: canonical HTML pages.

The JSON profile is a project-specific format, not an official agent protocol.
`llms.txt` is supplementary, not a requirement or a ranking guarantee. Standard
HTML and matching structured data remain the primary public content. All rates
are indicative and preserve VAT, minimum hours, travel and role/team conditions.
The enquiry form prepares a draft, not a booking or automatic submission.
There are no analytics pixels, cookies, API credentials or extra running costs.
The existing wildcard robots policy remains unchanged, including for training
crawlers; search access and training permissions are separate decisions.

Before releasing, verify that the canonical origin in `business.json` actually
serves this build. It currently targets `https://www.elektoria.nl`; a Vercel preview
URL is not the canonical site. Do not point agents at new paths on an older site.
Submit the sitemap through the owner's Google Search Console and Bing Webmaster
Tools accounts. Confirm public access from the production host and review any
CDN/WAF bot challenges using each provider's official bot-verification guidance.
Do not disable security or allow traffic solely on a spoofable user-agent name.
Local HTTP checks simulate user-agent headers; they do not prove actual crawler
visits, production firewall access, indexing or AI recommendations. No submission,
deployment, account change or search-engine verification is automated by the build.

See [SEARCH-LAUNCH.md](./SEARCH-LAUNCH.md) for the production-domain blocker,
owner-account launch checks, real project evidence to collect and a practical
measurement plan. It is internal documentation and is not published in `dist/`.

Guidance checked 2026-10-20:
[Google AI features](https://developers.google.com/search/docs/appearance/ai-features),
[OpenAI crawlers](https://developers.openai.com/api/docs/bots),
[Anthropic crawlers](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler),
[Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers),
[llms.txt proposal](https://llmstxt.org/).

### Vercel

The tracked `vercel.json` sets the static framework preset, publishes `dist/`,
and runs the build and verification checks. It also carries over the security
headers and legacy redirects from the Cloudflare configuration. Set the project
root to the repository root. No dashboard output-directory override is needed.
The Node.js major version is pinned to 22.x.

Once a Vercel Git integration is connected, pushes to `main` trigger a production
deployment. Domain/DNS configuration is managed separately. Cloudflare remains a
supported alternative with the settings above.

Local backups, dependencies, generated output, screenshots, credentials and the
legacy Next.js application are intentionally excluded from Git.
