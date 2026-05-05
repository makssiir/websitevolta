import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rootDir = process.cwd();
const distIndexPath = resolve(rootDir, 'dist/index.html');

execSync('vite build', { stdio: 'inherit' });

const html = readFileSync(distIndexPath, 'utf8');

const staticSnapshot = `
<div class="min-h-screen bg-background" id="top">
  <a href="#content" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">Skip to content</a>

  <header style="position:sticky;top:0;z-index:50;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);border-bottom:1px solid #e5e7eb;">
    <div style="max-width:1200px;margin:0 auto;padding:0 16px;height:64px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
      <a href="#top" style="display:flex;align-items:center;gap:8px;font-weight:700;font-size:18px;color:#111827;text-decoration:none;">Elektoria Elektrotechniek</a>
      <nav aria-label="Hoofdnavigatie" style="display:flex;gap:12px;flex-wrap:wrap;font-size:14px;">
        <a href="#diensten">Diensten</a>
        <a href="#over-ons">Over ons</a>
        <a href="#prijzen">Prijzen</a>
        <a href="#werkgebied">Werkgebied</a>
        <a href="#reviews">Reviews</a>
        <a href="#faq">FAQ</a>
      </nav>
    </div>
  </header>

  <main id="content">
    <section style="background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:72px 16px;">
      <div style="max-width:1200px;margin:0 auto;">
        <h1 style="font-size:clamp(2rem,5vw,3.75rem);line-height:1.05;margin:0 0 1rem;font-weight:800;">Elektricien in Veenendaal voor groepenkast, laadpaal, verlichting en renovatie-elektra</h1>
        <p style="font-size:clamp(1.1rem,2.2vw,1.5rem);max-width:780px;margin:0 0 1rem;">Wij helpen particulieren en bedrijven met groepenkasten, extra groepen, Perilex-aansluitingen, laadpalen, verlichting en renovatie-elektra in Veenendaal en omgeving.</p>
        <p style="font-size:1rem;max-width:760px;margin:0 0 1.5rem;color:#dbeafe;">Snel schakelen, duidelijke prijzen en vakwerk volgens NEN-richtlijnen — ook in Utrecht, Amersfoort, Arnhem en Nijmegen.</p>
        <p style="font-size:1rem;max-width:760px;margin:0;">Uurtarief €65 incl. btw. Transparante prijzen, duidelijke planning en een betrouwbare aanpak voor iedere klus.</p>
      </div>
    </section>

    <section id="diensten" style="padding:56px 16px;">
      <div style="max-width:1200px;margin:0 auto;">
        <h2>Diensten voor elektra in Veenendaal en omgeving</h2>
        <p>Van groepenkast vervangen tot laadpaal installatie: wij leveren praktische oplossingen voor woningen, verbouwingen en zakelijke projecten. Denk aan extra groepen, kookplaataansluitingen, verlichting, renovaties, noodstroom en elektrotechnische planning.</p>
        <p>Onze aanpak is helder: vooraf uitleg, duidelijke prijsindicatie en nette afwerking. Daardoor weet u wat u kunt verwachten en houdt u grip op planning en budget.</p>
      </div>
    </section>

    <section id="over-ons" style="padding:56px 16px;background:#f8fafc;">
      <div style="max-width:1200px;margin:0 auto;">
        <h2>Over Elektoria Elektrotechniek</h2>
        <p>Transparantie voorop: duidelijke prijzen, planning en werkzaamheden. 25+ jaar ervaring volgens NEN-richtlijnen.</p>
        <p>Electrotechnische installaties vragen om vakmanschap, veiligheid en een nette uitvoering. Daarom werken wij met duidelijke communicatie, een praktische aanpak en oog voor detail. Van een kleine aanpassing tot een volledige renovatie denken we mee over de beste oplossing voor uw woning of bedrijfspand.</p>
      </div>
    </section>

    <section id="prijzen" style="padding:56px 16px;">
      <div style="max-width:1200px;margin:0 auto;">
        <h2>Tarieven en richtprijzen</h2>
        <p>Uurtarief €65 incl. btw. Voor de meeste werkzaamheden geven wij na intake of foto's een vaste prijsindicatie.</p>
        <p>Indicatieve werkzaamheden: stopcontact installeren, lamp ophangen, schakelaar installeren, extra groep aanleggen, groepenkast vervangen, Perilex-aansluiting en elektra in keuken of badkamer. Zo krijgt u vooraf een realistisch beeld van de kosten.</p>
      </div>
    </section>

    <section id="werkgebied" style="padding:56px 16px;background:#f8fafc;">
      <div style="max-width:1200px;margin:0 auto;">
        <h2>Werkgebied en regio</h2>
        <p>Actief in Veenendaal en omliggende regio's in Gelderland en Utrecht.</p>
        <p>Werkgebied: Veenendaal, Utrecht, Amersfoort, Arnhem en Nijmegen. Ook werkzaam in Ede, Wageningen, Rhenen en Scherpenzeel. Twijfelt u? Neem contact op voor overleg over uw locatie en planning.</p>
      </div>
    </section>

    <section id="reviews" style="padding:56px 16px;">
      <div style="max-width:1200px;margin:0 auto;">
        <h2>Google Reviews</h2>
        <p>Bekijk actuele beoordelingen rechtstreeks op Google Maps.</p>
        <p>Klanten waarderen onze duidelijke communicatie, nette afwerking en het meedenken in praktische oplossingen voor verlichting, renovaties, groepenkasten en laadpalen.</p>
      </div>
    </section>

    <section id="faq" style="padding:56px 16px;background:#f8fafc;">
      <div style="max-width:1200px;margin:0 auto;">
        <h2>Veelgestelde vragen</h2>
        <p>Veelgestelde vragen over tarieven, planning, laadpalen, groepenkasten en renovaties.</p>
        <p>Hoeveel kost een elektricien per uur in Veenendaal? Ons uurtarief is €65 incl. btw. Wat kost een groepenkast vervangen? Indicatief tussen €600 en €1.100. Krijg ik vooraf een prijsopgave? Ja, meestal wel, op basis van foto's, omschrijving of inspectie op locatie.</p>
      </div>
    </section>
  </main>

  <footer style="padding:48px 16px;background:#111827;color:#fff;">
    <div style="max-width:1200px;margin:0 auto;">
      <p>Elektoria Elektrotechniek is een handelsnaam van Voltaa Group B.V.</p>
      <p>Spaarne 58, 3904 NJ Veenendaal, Nederland</p>
      <p>+31617552558 | info@voltaa.nl</p>
    </div>
  </footer>
</div>`;

const prerendered = html.replace('<div id="root"></div>', `<div id="root">${staticSnapshot}</div>`);
writeFileSync(distIndexPath, prerendered, 'utf8');
console.log('Prerendered dist/index.html');

