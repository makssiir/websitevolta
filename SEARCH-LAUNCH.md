# Search And AI Visibility

Owner checklist, checked 2026-10-20. This file is not copied into `dist/`.
Nothing here guarantees rankings, AI citations or enquiries. The objective is
qualified B2B work and substantial residential projects, not every electrician
search or the largest possible visitor count.

## 1. Resolve The Production Mismatch First

Read-only checks on 2026-10-20 found:

| Address | Observed content | Canonical destination |
| --- | --- | --- |
| `https://www.elektoria.nl/` | Older consumer-oriented site | Main domain |
| `https://elektoria-b2b.vercel.app/` | Newer B2B site | Main domain |

The newer B2B homepage was titled "Elektricien voor bedrijven & grote
woningprojecten | Elektoria"; the main domain was titled "Elektricien Veenendaal
| Groepenkast, Laadpaal & Renovatie | Elektoria Elektrotechniek".
This is a point-in-time deployment observation, not an indexing report.

- [ ] With owner approval, publish the verified build on the canonical domain
  configured in `business.json`. No deployment or DNS change has been made here.
- [ ] Confirm every sitemap URL serves the intended page with HTTP 200, one
  correct canonical, no `noindex` and no authentication or bot challenge.
- [ ] Confirm `/robots.txt`, `/sitemap.xml`, `/company.json`, `/llms.txt` and
  `/llms-full.txt` serve their real contents, not an HTML fallback or old files.
- [ ] Check apex/www and hosting aliases for consistent canonical handling. Do
  not block an alias in robots before crawlers can read its canonical/redirect.
- [ ] Keep useful legacy redirects. Unknown URLs must still return a real 404.
- [ ] Verify the domain in the owner's Google Search Console and Bing Webmaster
  Tools. Submit the canonical sitemap and inspect the key public URLs.
- [ ] Check production logs/CDN rules for verified search crawlers. Never allow
  traffic on user-agent alone or disable the firewall to improve visibility.

The local verifier checks HTML, canonical links, structured data, internal links,
pricing consistency and simulated crawler requests. It does not prove production
access, indexing or real crawler visits. No external submissions are automated.

## 2. Make The Business Consistent And Verifiable

- [ ] Verify/manage the real Google Business Profile. Use the genuine trading
  name, phone, website, business category, services and service area. Do not add
  keywords to the name or invent offices in the cities served.
- [ ] Check address eligibility: a public address is appropriate only when it
  meets Google's rules for receiving customers. Otherwise use the service-area
  business arrangement. The website currently says visits are by appointment.
- [ ] Use consistent identity across the site, profile, actual partner sites
  and relevant business listings: Elektoria Elektrotechniek, handelsnaam van
  Voltaa Group B.V., KvK 97285862, Veenendaal, +31 6 1755 2558.
- [ ] Add current, authentic work photos to the profile and request honest
  reviews from completed clients. No discounts for reviews, fabricated reviews
  or positive-review-only selection. Reply helpfully to real feedback.
- [ ] Refresh the site's dated Google rating only after checking the listing.
  Do not turn an old snapshot into a live-review claim or invent a review widget.
- [ ] Seek genuine references from customers, contractors and suppliers who
  have worked with Elektoria. Avoid bought links, directory spam and invented
  memberships or certification logos.

Google describes local results in terms of relevance, distance and prominence.
None of these steps means Elektoria will rank first in every city.

## 3. Publish Evidence, Not More Generic Pages

The existing eight pages intentionally stay compact. The homepage separates
business work from substantial private projects; the service catalogue and
audience pages answer scope, team, price, travel and communication questions.
Machine summaries are generated from the same public facts and pricing inputs.

Next useful content: two or three real project examples, once the owner provides
the facts and approves publication. For each collect:

| Fact | What to supply |
| --- | --- |
| Project | Building type and town/region; exact address is unnecessary |
| Elektoria's role | Actual contracted work, not the whole main contractor's job |
| Scope | Work completed, relevant quantities or phases if confirmed |
| Coordination | Drawings, other trades, client contact and handover actually used |
| Evidence | Matching original photos, before/after only when they are comparable |
| Permission | Approval to publish photos, client names or quotes where applicable |

Do not invent dates, project values, delivery results, team capacity or NEN
certification. Standards followed are not automatically company certificates.
Use public case summaries with useful captions, linked to the relevant service
and enquiry route. Do not create near-identical pages for dozens of towns.

## 4. Measure The Right Outcome

After the correct site is live and verified:

- [ ] Record the publication date and current indexing status for `/`,
  `/zakelijk`, `/woningprojecten`, `/diensten` and `/projecten`.
- [ ] In Google Search Console, review actual queries, indexed pages and Web
  performance. Google's AI features are included in overall Web reporting, not
  a promised separate ranking or citation score.
- [ ] Where available, use Bing Webmaster Tools' AI Performance report for
  citations, cited pages and grounding queries in supported Microsoft AI
  experiences. It is not a universal view of every AI service.
- [ ] For each real enquiry record referral source, project type, location,
  estimated scope, qualified/not qualified, quote and outcome. Ask how the client
  found Elektoria rather than treating every WhatsApp click as a booked project.
- [ ] Manually sample the same unbranded Dutch questions in search-enabled AI
  tools. Record date, tool, search mode, stated location, cited URLs and whether
  Elektoria was mentioned. Answers vary; this is a directional sample, not a
  stable leaderboard. Do not repeatedly submit prompts to manipulate results.

Useful starting questions:

| Audience | Example question |
| --- | --- |
| Contractor | Elektrotechnische onderaannemer voor renovatie in Veenendaal of Ede |
| Installation company | Partner voor ruwbouw en afmontage in Utrecht en Gelderland |
| Property owner | Elektrische installatie bij transformatie van kantoor naar woningen |
| Private project | Complete elektra vernieuwen bij woningrenovatie in Veenendaal |
| Private project | Elektricien voor een volledige nieuwbouwwoning in Ede |
| Buyer comparing terms | Wat moet in een offerte voor een complete elektrische installatie staan? |

Review the first results after enough time for recrawling and indexing; there is
no guaranteed deadline. Improve missing answers and evidence based on actual
queries and lead quality, not repeated wholesale redesigns or arbitrary scores.
No analytics cookies, paid SEO tools or new recurring hosting costs are required
for this checklist. No accounts, profiles, reviews or search submissions were
changed as part of the local work.

## Primary Guidance

- [Google: AI features and your website](https://developers.google.com/search/docs/appearance/ai-features)
- [Google: local ranking](https://support.google.com/business/answer/7091)
- [Google: Business Profile representation rules](https://support.google.com/business/answer/3038177)
- [Bing: AI Performance](https://www.bing.com/webmasters/help/ai-performance-9f8e7d6c)
- [OpenAI: crawler controls](https://developers.openai.com/api/docs/bots)

Google requires normal search eligibility, not a special AI file or schema.
OpenAI search crawling and model-training crawling are distinct controls.
Allowing retrieval is an eligibility step, not a recommendation guarantee.
