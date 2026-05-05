# Team foto's toevoegen

## Waarom foto's belangrijk zijn
Foto's van het team verhogen de trust rate met 40-60%. Klanten willen zien met wie ze werken!

## Stap 1: Foto's voorbereiden
1. Zorg voor professionele portretfoto's (bij voorkeur vierkant)
2. Optimale grootte: 400x400 pixels of 600x600 pixels
3. Formaat: JPG of PNG
4. Bestandsnamen:
   - `oleksandr-volkov.jpg` (of oleksandr.jpg)
   - `maksym-usyk.jpg` (of maksym.jpg)

**Tips voor goede foto's:**
- Neutrale achtergrond of werklocatie
- Goede belichting
- Professionele, vriendelijke uitstraling
- Geen selfies - laat iemand anders de foto maken

## Stap 2: Foto's toevoegen aan project
1. Plaats beide foto's in de map: `/src/imports/`
2. Bijvoorbeeld:
   - `/src/imports/oleksandr.jpg`
   - `/src/imports/maksym.jpg`

## Stap 3: Code aanpassen

### Optie A: Direct img tag gebruiken
Open `/src/app/App.tsx` en zoek naar de "Ons team" sectie.

**Voor Oleksandr (zoek de eerste avatar):**
Vervang het comment `{/* Vervang met: ... */}` en de User icon door:
```jsx
<img 
  src="/src/imports/oleksandr.jpg" 
  alt="Oleksandr Volkov - Hoofdmonteur"
  className="w-full h-full object-cover"
/>
```

**Voor Maksym (zoek de tweede avatar):**
Vervang het comment en de User icon door:
```jsx
<img 
  src="/src/imports/maksym.jpg" 
  alt="Maksym Usyk - Partner"
  className="w-full h-full object-cover"
/>
```

### Optie B: ImageWithFallback gebruiken (veiliger)
```jsx
import { ImageWithFallback } from './components/figma/ImageWithFallback';

// Voor Oleksandr:
<ImageWithFallback 
  src="/src/imports/oleksandr.jpg" 
  alt="Oleksandr Volkov - Hoofdmonteur"
  className="w-full h-full object-cover"
/>

// Voor Maksym:
<ImageWithFallback 
  src="/src/imports/maksym.jpg" 
  alt="Maksym Usyk - Partner"
  className="w-full h-full object-cover"
/>
```

## Stap 4: Controleren
1. Sla de bestanden op
2. Refresh de browser
3. De foto's zullen nu mooi rond worden weergegeven met de blauwe border

De foto's zijn nu zichtbaar in:
- **"Ons team" sectie** (Over ons) - beide foto's
- **"Onze hoofdmonteur" sectie** - Oleksandr's foto

## Nog geen foto's?
De placeholders (User icons met gradient achtergrond) zien er ook professioneel uit, maar echte foto's maken een veel sterkere indruk!
