# SEO Deployment Guide voor Elektoria Elektrotechniek

## Belangrijke SEO Aanpassingen voor Live Gang

### 1. Meta Tags (in HTML `<head>`)

```html
<title>Elektoria Elektrotechniek | Elektricien in Veenendaal en omgeving</title>
<meta name="description" content="Elektoria Elektrotechniek helpt met groepenkasten, extra groepen, verlichting, kookplaataansluitingen, renovatie-elektra en laadpaalinstallaties in Veenendaal en omgeving.">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="canonical" href="https://www.elektoria.nl/" />
```

**Belangrijke opmerkingen:**
- GEEN `meta keywords` - deze worden niet meer gebruikt
- Pas de canonical URL aan naar je echte domein
- Beschrijving moet tussen 150-160 karakters blijven

### 2. Structured Data (JSON-LD)

Voeg dit toe aan de `<head>` sectie, **alleen met echte bedrijfsgegevens**:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Elektoria Elektrotechniek",
  "image": "https://www.elektoria.nl/logo.png",
  "@id": "https://www.elektoria.nl",
  "url": "https://www.elektoria.nl",
  "telephone": "+31612345678",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Adres",
    "addressLocality": "Veenendaal",
    "postalCode": "3900",
    "addressCountry": "NL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 52.0287,
    "longitude": 5.5570
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday"
    ],
    "opens": "08:00",
    "closes": "17:00"
  },
  "sameAs": [
    "https://www.facebook.com/elektoria",
    "https://www.linkedin.com/company/elektoria"
  ]
}
</script>
```

**BELANGRIJK:**
- Vul ALLEEN echte gegevens in
- Voeg GEEN `aggregateRating` of `review` toe tenzij je echte, verifieerbare reviews hebt
- Test de structured data met [Google Rich Results Test](https://search.google.com/test/rich-results)

### 3. Heading Structuur (al correct geïmplementeerd)

✅ **Eén H1 per pagina:**
- "Elektricien in Veenendaal en omgeving"

✅ **Logische H2 headings:**
- "Onze elektrotechnische diensten"
- "Over Elektoria Elektrotechniek"
- "Onze hoofdmonteur"
- "Duidelijke prijsindicatie vooraf"
- "Werkgebied"
- "Klantreviews"
- "Veelgestelde vragen"
- "Neem contact op"

### 4. Content in HTML (al correct geïmplementeerd)

✅ Alle belangrijke content staat direct in de HTML source
✅ FAQ vragen en antwoorden zijn zichtbaar in de HTML
✅ Geen belangrijke content wordt alleen via JavaScript geladen

### 5. Google My Business / Google Business Profile

**Voor lokale SEO is dit ESSENTIEEL:**

1. **Claim je Google Business Profile:**
   - Ga naar [Google Business Profile](https://business.google.com)
   - Voeg Elektoria Elektrotechniek toe
   - Verifieer je bedrijf

2. **Vul volledig in:**
   - Bedrijfsnaam: Elektoria Elektrotechniek
   - Categorie: Elektricien / Electrical Installation Service
   - Adres: Je werkelijke bedrijfsadres in Veenendaal
   - Telefoonnummer: Consistent met website
   - Website URL: https://www.elektoria.nl
   - Openingstijden
   - Beschrijving (met keywords)
   - Foto's van werk, team, locatie

3. **Reviews verzamelen:**
   - Vraag tevreden klanten om een review
   - Link: `https://g.page/r/YOUR_GOOGLE_PLACE_ID/review`
   - Reageer op alle reviews (positief én negatief)

4. **Update de website:**
   - Vervang `YOUR_GOOGLE_PLACE_ID` in de code met je echte Place ID
   - Voeg de correcte Google Maps embed toe

### 6. robots.txt

Maak een `robots.txt` bestand in de root:

```
User-agent: *
Allow: /

Sitemap: https://www.elektoria.nl/sitemap.xml
```

### 7. Sitemap.xml

Maak een `sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.elektoria.nl/</loc>
    <lastmod>2026-05-02</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

### 8. Performance & Technical SEO

- ✅ Zorg dat de site snel laadt (<3 seconden)
- ✅ Mobiel-vriendelijk (responsive design - al geïmplementeerd)
- ✅ HTTPS gebruiken (niet HTTP)
- ✅ Compress afbeeldingen (vooral Oleksandr en Maksym foto's)
- ✅ Gebruik WebP formaat voor afbeeldingen waar mogelijk

### 9. Lokale Citaties

Registreer het bedrijf op:
- Telefoongids.nl
- Detelefoongids.nl
- 2theloo.nl
- Yelp Nederland
- Facebook Business
- LinkedIn Company Page

**BELANGRIJK:** Gebruik overal exact dezelfde NAP (Name, Address, Phone):
- Naam: Elektoria Elektrotechniek
- Adres: [Exact hetzelfde adres]
- Telefoon: [Exact hetzelfde nummer]

### 10. Checklist voor Live Gang

- [ ] Meta title en description ingevuld
- [ ] Canonical URL ingesteld
- [ ] Structured data toegevoegd (alleen met echte gegevens)
- [ ] Google Business Profile geclaimd en ingevuld
- [ ] Echte telefoonnummer en email ingevuld
- [ ] Placeholder reviews verwijderd of vervangen door echte reviews
- [ ] Google Place ID ingevuld in review links
- [ ] Alle foto's geoptimaliseerd (gecomprimeerd)
- [ ] HTTPS certificaat actief
- [ ] robots.txt en sitemap.xml toegevoegd
- [ ] Getest op mobiel en desktop
- [ ] Getest met Google Rich Results Test
- [ ] Getest met Google PageSpeed Insights
- [ ] Google Search Console ingesteld
- [ ] Google Analytics ingesteld (optioneel)

### 11. Na Live Gang

**Week 1:**
- Submit sitemap in Google Search Console
- Controleer of de site geïndexeerd wordt
- Vraag eerste tevreden klanten om Google reviews

**Maand 1:**
- Monitor positie voor "elektricien Veenendaal"
- Voeg 3-5 blogposts toe (optioneel maar sterk aanbevolen):
  - "Groepenkast vervangen: wat komt er bij kijken?"
  - "Laadpaal thuis laten installeren: complete gids"
  - "Kookplaat aansluiten: Perilex of gewone stekker?"

**Doorlopend:**
- Blijf vragen om reviews
- Update prijzen 1-2x per jaar
- Voeg nieuwe projectfoto's toe
- Reageer op alle Google reviews binnen 48 uur

## Veelgestelde Fouten om te Vermijden

❌ **NOOIT DOEN:**
- Fake reviews plaatsen
- Certificaten claimen die je niet hebt
- "Beste elektricien van Nederland" claimen
- Prijzen garanderen zonder voorbehoud
- 24/7 beschikbaarheid claimen als dat niet klopt
- Meerdere Google Business Profiles voor hetzelfde bedrijf
- Inconsistente NAP gegevens op verschillende platforms

✅ **WEL DOEN:**
- Eerlijk zijn over je diensten
- Realistische verwachtingen scheppen
- Consistente informatie op alle platforms
- Regelmatig content updaten
- Reageren op reviews
- Foto's van echt werk toevoegen

## Hulp Nodig?

Voor professionele SEO hulp:
- [Google Search Central](https://developers.google.com/search)
- [Google Business Profile Help](https://support.google.com/business)
- Lokale SEO specialist inhuren voor eenmalige audit

---

**Laatste update:** 2 mei 2026
**Website versie:** MVP 1.0
