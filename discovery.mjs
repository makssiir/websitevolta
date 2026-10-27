const amountFormat = new Intl.NumberFormat('en-US', { useGrouping: false, minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money = value => Number(amountFormat.format(value));
const euro = value => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value).replace(/\u00a0/g, ' ');

export function createDiscovery({ business, pricing, pages, workPackages, serviceCatalogue, crewChoices, socialImagePath = '/assets/og-image.jpg' }) {
  const origin = new URL(business.url);
  if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password) {
    throw new Error('Discovery requires an HTTPS canonical origin without a path, query or credentials');
  }
  const base = origin.origin;
  const url = path => new URL(path, `${base}/`).href;
  const gross = amount => money(amount * (1 + pricing.vatRate));
  const areas = ['Veenendaal', 'Ede', 'Utrecht', 'Gelderland', 'Midden-Nederland'];
  const address = {
    '@type': 'PostalAddress',
    ...(business.street ? { streetAddress: business.street } : {}),
    postalCode: business.postalCode,
    addressLocality: business.city,
    addressCountry: 'NL',
  };
  const contact = {
    preferredChannel: 'WhatsApp', whatsapp: business.whatsapp, email: business.email,
    telephone: business.phone, availableLanguages: ['nl', 'en', 'uk', 'ru'],
    languageScope: 'Klantcontact via Maksym. Werktaal en begrijpelijke veiligheidsinstructies op locatie worden per project afgesproken.',
    url: url('/contact'),
  };
  const packages = workPackages.map(item => ({
    id: item.id, name: item.title, description: item.text, url: url(`/diensten#${item.id}`),
  }));
  const services = serviceCatalogue.map(group => ({
    name: group.title, items: group.items.map(item => ({ name: item.title, id: item.id, url: url(`/diensten#${item.id}`) })),
  }));
  const minimumLabour = pricing.privateHourly * pricing.privateMinimumHours;
  const travel = pricing.travelZones.map(zone => ({
    distance: zone.label, maximumOneWayRoadKm: zone.maxKm,
    amountExcludingVat: zone.fee, amountIncludingVat: gross(zone.fee),
  }));
  const profile = {
    schemaVersion: 1,
    canonicalUrl: url('/'),
    name: business.name,
    legalName: business.legalName,
    kvk: business.kvk,
    address: { ...(business.street ? { street: business.street } : {}), postalCode: business.postalCode, city: business.city, country: 'NL', visits: 'Alleen op afspraak' },
    siteLanguages: ['nl'],
    contact,
    googleMaps: business.googleMapsUrl,
    serviceArea: { primary: areas, outsideRegion: 'Grotere en meerdaagse projecten na overleg over locatie, inzet, reisbijdrage en planning.' },
    audiences: [
      { type: 'business', description: 'Aannemers, installatiebedrijven, projectleiders en zakelijke gebouweigenaren.', url: url('/zakelijk') },
      { type: 'private', description: 'Particulieren met nieuwbouw, complete woninginstallaties of grote renovaties.', url: url('/woningprojecten') },
    ],
    excludedRequests: ['Losse kleine reparaties', 'Spoedstoringen'],
    workPackages: packages,
    additionalServices: services,
    teams: {
      options: crewChoices.map(item => ({ name: item.title, description: item.text, enquiryUrl: url(`/contact?bezetting=${item.id}#aanvraag`) })),
      conditions: 'Bezetting, ervaring, beschikbaarheid, taken en begeleiding vooraf bevestigen. Tarieven per rol of een afgesproken gemiddeld tarief per persoon binnen het afgesproken team; geen universeel tarief voor alle kwalificaties of specialismen.',
      billingUnit: 'persoonsuur, niet ploeguur',
    },
    pricing: {
      currency: 'EUR', vatRate: pricing.vatRate, indicative: true,
      agreement: 'Vaste projectprijs, eenheidsprijs of regie. Prijsafspraken zijn bespreekbaar op basis van omvang, looptijd, planning en bezetting. Definitieve prijs en voorwaarden vooraf in de offerte; extra inzet en meerwerk na akkoord.',
      business: {
        hourlyReferenceExcludingVat: pricing.businessHourly, unit: 'per monteur per uur',
        scope: 'Standaard projectmontage volgens tekeningen met eigen standaardgereedschap; geen tarief voor alle rollen of specialistisch werk.',
        minimumBookingHours: pricing.dayHours, dayReferenceExcludingVat: pricing.businessHourly * pricing.dayHours,
        excludedFromHourlyReference: ['Materialen', 'Reisbijdrage', 'Bijzondere hulpmiddelen', 'Parkeren', 'Eventuele overnachting'],
        vat: 'Btw verlegd alleen waar de verleggingsregeling van toepassing is; anders toepasselijke btw.',
        sourceUrl: url('/zakelijk#uur-reis'),
      },
      private: {
        hourlyReferenceIncludingVat: gross(pricing.privateHourly), unit: 'per monteur per uur',
        scope: 'Standaard montage binnen een groter woningproject.',
        dayReferenceIncludingVat: gross(pricing.privateHourly * pricing.dayHours),
        excludedFromHourlyReference: ['Materialen', 'Reisbijdrage', 'Bijzondere hulpmiddelen', 'Parkeren'],
        minimumVisit: {
          labourHours: pricing.privateMinimumHours, labourIncludingVat: gross(minimumLabour), workers: 1,
          appliesTo: 'Afzonderlijk afgesproken montagebezoek op regie binnen een aangenomen woningproject.',
          examplesIncludingVatAndTravel: pricing.travelZones.filter(zone => zone.maxKm <= pricing.privateShortVisitMaxKm).map(zone => ({
            maximumOneWayRoadKm: zone.maxKm, distance: zone.label, labourIncludingVat: gross(minimumLabour),
            travelIncludingVat: gross(zone.fee), totalIncludingVat: gross(minimumLabour + zone.fee),
          })),
          shortVisitMaximumOneWayRoadKm: pricing.privateShortVisitMaxKm,
          conditions: 'Minimum in plaats van, niet boven op de gewerkte uren. Na het minimum werkelijk gewerkte uren. Geen extra minimumtoeslag op vaste projectoffertes of herstel van eigen uitvoeringsfouten. Extra teambezetting en minimum apart afspreken. Verder weg alleen een groter werkblok op offerte.',
          sourceUrl: url('/woningprojecten#minimumbezoek'),
        },
        sourceUrl: url('/woningprojecten#particulier-regie'),
      },
      travel: {
        unit: 'Een afgesproken retourrit per voertuig per werkdag, inclusief reistijd en vervoer; niet per monteur.',
        distanceBasis: 'Afstand enkele reis over de weg vanaf Veenendaal.',
        zones: travel,
        conditions: 'Boven 100 km, extra ritten, meerdere locaties, parkeren, bijzondere hulpmiddelen en overnachting vooraf afspreken. Bij vaste projectprijzen worden afgesproken reis- en projectkosten in het totaal opgenomen.',
      },
    },
    enquiries: {
      url: url('/contact#aanvraag'), automaticSubmission: false, automaticBooking: false,
      process: 'Het formulier bereidt een bericht voor. De bezoeker controleert en verstuurt dit zelf via WhatsApp of e-mail. Aanvraag is geen boeking; capaciteit en prijs worden bevestigd.',
    },
    pages: pages.map(page => ({ name: page.label, description: page.description, url: url(page.path) })),
    resources: { guide: url('/llms.txt'), fullText: url('/llms-full.txt'), profile: url('/company.json'), sitemap: url('/sitemap.xml') },
  };

  const id = name => `${base}/#${name}`;
  const serviceNodes = [...packages, ...services.flatMap(group => group.items)].map(item => ({
    '@type': 'Service', '@id': `${url('/diensten')}#service-${item.id}`,
    name: item.name, ...(item.description ? { description: item.description } : {}),
    url: item.url, provider: { '@id': id('localbusiness') }, areaServed: areas,
  }));
  const offer = service => ({ '@type': 'Offer', itemOffered: { '@id': `${url('/diensten')}#service-${service.id}` } });
  const catalogue = {
    '@type': 'OfferCatalog', '@id': `${url('/diensten')}#catalogue`,
    name: 'Elektrotechnische werkzaamheden', url: url('/diensten'),
    itemListElement: [
      ...packages.map(offer),
      ...services.map(group => ({ '@type': 'OfferCatalog', name: group.name, itemListElement: group.items.map(offer) })),
    ],
  };
  const schemaForPage = page => {
    const pageUrl = url(page.path);
    const graph = [
      {
        '@type': 'Organization', '@id': id('organization'), name: business.legalName, legalName: business.legalName,
        identifier: { '@type': 'PropertyValue', propertyID: 'KvK', value: business.kvk },
        url: url('/'), address, telephone: business.phone, email: business.email,
      },
      {
        '@type': 'Electrician', '@id': id('localbusiness'), name: business.name, legalName: business.legalName,
        parentOrganization: { '@id': id('organization') }, url: url('/'), address, areaServed: areas,
        telephone: business.phone, email: business.email, image: url(socialImagePath), logo: url('/assets/favicon.svg'),
        hasMap: business.googleMapsUrl, sameAs: [business.googleMapsUrl],
        hasOfferCatalog: { '@id': catalogue['@id'] },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '17:00',
          },
        ],
        contactPoint: {
          '@type': 'ContactPoint', name: 'Maksym - klantcontact en projectplanning', contactType: 'projectaanvraag',
          url: business.whatsapp, telephone: business.phone, email: business.email, availableLanguage: contact.availableLanguages,
        },
      },
      { '@type': 'WebSite', '@id': id('website'), url: url('/'), name: business.name, inLanguage: 'nl-NL', publisher: { '@id': id('organization') } },
      {
        '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: page.title, description: page.description,
        inLanguage: 'nl-NL', isPartOf: { '@id': id('website') }, about: { '@id': id('localbusiness') },
        publisher: { '@id': id('organization') },
        ...(page.path === '/diensten' ? { mainEntity: { '@id': catalogue['@id'] } } : {}),
      },
    ];
    if (page.path === '/diensten') graph.push(catalogue, ...serviceNodes);
    if (['/zakelijk', '/woningprojecten'].includes(page.path)) {
      const privateClient = page.path === '/woningprojecten';
      graph.push({
        '@type': 'Service', '@id': `${pageUrl}#projectservice`, name: privateClient ? 'Complete woninginstallaties en grote renovaties' : 'Elektrotechnische onderaanneming en zakelijke projecten',
        description: page.description, url: pageUrl, provider: { '@id': id('localbusiness') }, areaServed: areas,
        audience: { '@type': privateClient ? 'Audience' : 'BusinessAudience', audienceType: privateClient ? 'Particulieren met grote woningprojecten' : 'Aannemers, installatiebedrijven en zakelijke gebouweigenaren' },
        termsOfService: url(privateClient ? '/woningprojecten#prijsafspraak' : '/zakelijk#tarieven'),
        availableChannel: { '@type': 'ServiceChannel', serviceUrl: url(privateClient ? '/contact?type=particulier#aanvraag' : '/contact#aanvraag') },
      });
      graph.find(node => node['@type'] === 'WebPage').mainEntity = { '@id': `${pageUrl}#projectservice` };
    }
    if (page.path !== '/') graph.push({
      '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: url('/') },
        { '@type': 'ListItem', position: 2, name: page.label, item: pageUrl },
      ],
    });
    return { '@context': 'https://schema.org', '@graph': graph };
  };

  const guide = `# ${business.name}

> Elektrotechniek voor aannemers, bedrijven en grote particuliere woningprojecten, vanuit Veenendaal. Handelsnaam van ${business.legalName}, KvK ${business.kvk}.

WhatsApp heeft de voorkeur: ${business.whatsapp}. E-mail: ${business.email}. Klantcontact via Maksym in het Nederlands, Engels, Oekra\u00efens en Russisch; werktaal op locatie vooraf afspreken. De website is Nederlandstalig.

## Bedrijf en projecten

${profile.pages.filter(page => !page.url.endsWith('/privacy')).map(page => `- [${page.name}](${page.url}): ${page.description}`).join('\n')}

## Prijs en inzet

- [Zakelijke prijsafspraken](${url('/zakelijk#tarieven')}): projectofferte of indicatieve regie, met reisbijdrage en teamafspraken.
- [Particuliere prijsafspraken](${url('/woningprojecten#prijsafspraak')}): bedragen inclusief btw, minimumbezoek en rekenvoorbeelden inclusief reisbijdrage.
- [Teambezetting](${url('/zakelijk#bezetting')}): ervaren monteur, eventueel met hulpmonteur of tweede monteur, na bevestiging van inzet en begeleiding.

## Openbare gegevens

- [Volledige tekstsamenvatting](${url('/llms-full.txt')}): diensten, doelgroepen, contact en prijsvoorwaarden uit dezelfde bron als de website.
- [Bedrijfsprofiel in JSON](${url('/company.json')}): openbare bedrijfsgegevens en expliciete prijsvoorwaarden; eigen formaat met schemaVersion 1.
- [Sitemap](${url('/sitemap.xml')}): canonieke pagina's.
- [Privacy](${url('/privacy')}): contactgegevens en gegevensverwerking.

Geen losse kleine reparaties of spoedstoringen. Een projectaanvraag is geen boeking; prijs en beschikbaarheid worden vooraf bevestigd.
`;
  const fullText = `# ${business.name} - openbare bedrijfssamenvatting

${profile.name} is een handelsnaam van ${profile.legalName}, KvK ${profile.kvk}.
Website: ${profile.canonicalUrl}
Vestiging: ${business.street}, ${business.postalCode} ${business.city}, Nederland. Bezoek alleen op afspraak.
Werkgebied: ${areas.join(', ')}. ${profile.serviceArea.outsideRegion}
Voor aannemers, installatiebedrijven en zakelijke gebouweigenaren; ook voor particulieren met nieuwbouw of een grote woningrenovatie. Geen losse kleine reparaties of spoedstoringen.

## Contact en aanvraag

WhatsApp heeft de voorkeur: ${contact.whatsapp}
E-mail: ${contact.email}
Telefoon als alternatief: ${contact.telephone}
Klantcontact via Maksym in het Nederlands, Engels, Oekra\u00efens en Russisch. ${contact.languageScope}
Google Maps: ${business.googleMapsUrl}
${profile.enquiries.process}
Aanvraag: ${profile.enquiries.url}

## Projectwerkpakketten

${packages.map(item => `- ${item.name}: ${item.description} ${item.url}`).join('\n')}

## Aanvullende werkzaamheden binnen projecten

${services.map(group => `### ${group.name}\n\n${group.items.map(item => `- ${item.name}: ${item.url}`).join('\n')}`).join('\n\n')}

## Teambezetting

${profile.teams.options.map(item => `- ${item.name}: ${item.description}`).join('\n')}
${profile.teams.conditions}
Een tarief per persoon is geen prijs per ploeguur: twee personen die ieder 8 uur werken zijn 16 persoonsuren. Extra inzet alleen na akkoord.

## Prijsafspraken

${profile.pricing.agreement}
Dit zijn indicatieve arbeidsprijzen voor de genoemde scope, geen universele all-in offertes. De zichtbare prijsvoorwaarden staan op de gekoppelde pagina's.

### Zakelijk

${euro(pricing.businessHourly)} per monteur per uur exclusief btw, voor standaard projectmontage volgens tekeningen met eigen standaardgereedschap. Minimale boeking: ${pricing.dayHours} werkuren. Een werkdag van ${pricing.dayHours} uur is ${euro(pricing.businessHourly * pricing.dayHours)} exclusief btw, exclusief materialen en reisbijdrage. Specialistisch werk en andere rollen apart afspreken. ${profile.pricing.business.vat}
Bron: ${profile.pricing.business.sourceUrl}

### Particulier

${euro(gross(pricing.privateHourly))} per monteur per uur inclusief 21% btw, voor standaard montage binnen een groter woningproject. Materialen, reisbijdrage, bijzondere hulpmiddelen en parkeren komen erbij na voorafgaande afspraak. Een werkdag van ${pricing.dayHours} uur is ${euro(gross(pricing.privateHourly * pricing.dayHours))} inclusief btw, exclusief materialen en reisbijdrage.
Bij een afzonderlijk afgesproken montagebezoek met een monteur geldt minimaal ${pricing.privateMinimumHours} arbeidsuren: ${euro(gross(minimumLabour))} inclusief btw, plus reisbijdrage. Bij een korter bezoek geldt de minimumduur; bij een langer bezoek worden de werkelijk gewerkte uren berekend. Het minimum is geen extra toeslag boven op de uren.
${profile.pricing.private.minimumVisit.examplesIncludingVatAndTravel.map(example => `- ${example.distance}: minimaal ${euro(example.totalIncludingVat)} inclusief btw en een retourrit (${euro(example.labourIncludingVat)} arbeid + ${euro(example.travelIncludingVat)} reisbijdrage).`).join('\n')}
${profile.pricing.private.minimumVisit.conditions}
Bron: ${profile.pricing.private.minimumVisit.sourceUrl}

### Reisbijdrage

${profile.pricing.travel.distanceBasis} ${profile.pricing.travel.unit}
${travel.map(zone => `- ${zone.distance}: ${euro(zone.amountExcludingVat)} exclusief btw / ${euro(zone.amountIncludingVat)} inclusief btw.`).join('\n')}
${profile.pricing.travel.conditions}

## Bronnen

${profile.pages.map(page => `- ${page.name}: ${page.url}`).join('\n')}
JSON-profiel: ${profile.resources.profile}
`;
  const searchAgents = ['Googlebot', 'Bingbot', 'OAI-SearchBot', 'ChatGPT-User', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User'];
  const robots = `# Public search and user-directed retrieval. Existing wildcard policy is unchanged.\nUser-agent: *\nAllow: /\n\n${searchAgents.map(name => `User-agent: ${name}`).join('\n')}\nAllow: /\n\nSitemap: ${url('/sitemap.xml')}\n`;
  return {
    schemaForPage,
    headLinks: '<link rel="describedby" type="application/json" href="/company.json" title="Openbare bedrijfsgegevens"><link rel="describedby" type="text/plain" href="/llms.txt" title="Website-overzicht"><link rel="describedby" type="text/plain" href="/llms-full.txt" title="Bedrijfssamenvatting">',
    resources: { 'robots.txt': robots, 'llms.txt': guide, 'llms-full.txt': fullText, 'company.json': `${JSON.stringify(profile, null, 2)}\n` },
  };
}
