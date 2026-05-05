import {
    Building2,
    CheckCircle2,
    HelpCircle,
    Home,
    Mail,
    MapPin,
    Menu,
    MessageCircle,
    Phone,
    Star,
    Wrench,
    X,
    Zap
} from "lucide-react";
import {Button} from "./components/ui/button";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "./components/ui/accordion";
import {GoogleReviews} from "./components/GoogleReviews";
import {useState} from "react";

export default function App() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const phoneNumber = "31617552558";
    const email = "info@voltaa.nl";

    const navItems = [
        {label: "Diensten", href: "#diensten"},
        {label: "Over ons", href: "#over-ons"},
        {label: "Prijzen", href: "#prijzen"},
        {label: "Werkgebied", href: "#werkgebied"},
        {label: "Reviews", href: "#reviews"},
        {label: "FAQ", href: "#faq"}
    ];

    const services = [
        {
            title: "Groepenkast vervangen of uitbreiden",
            description: "Groepenkast vervangen of uitbreiden in Veenendaal en omgeving. Inclusief aardlekschakelaars, installatiebeveiliging en nette afwerking volgens NEN 1010."
        },
        {
            title: "Extra groepen en kookplaataansluitingen",
            description: "Extra groep aanleggen voor inductiekookplaat, elektrische kookplaat, laadpunt of zware apparatuur. Inclusief Perilex 5-polige aansluitingen en meterkastwerk."
        },
        {
            title: "Stopcontacten en schakelaars installeren",
            description: "Nieuwe stopcontacten en schakelaars plaatsen, verplaatsen of vervangen. Voor binnen en buiten, met strakke afwerking en veilige aansluiting."
        },
        {
            title: "Verlichting installeren",
            description: "LED-verlichting, binnen- en buitenverlichting, inbouwspots en lichtplannen voor woningen en bedrijven in de regio Veenendaal."
        },
        {
            title: "Elektra bij renovaties en verbouwingen",
            description: "Complete elektrotechnische installatie voor keuken, badkamer, uitbouw of woningrenovatie. Van leidingwerk tot aansluitpunten en afmontage."
        },
        {
            title: "Laadpaal installatie voor elektrisch rijden",
            description: "Laadpaal installatie voor elektrische auto thuis of zakelijk. 1-fase en 3-fase laadpalen met voorbereiding vanuit de meterkast."
        },
        {
            title: "Noodstroomsystemen en back-up",
            description: "Installatie van noodstroomvoorziening, UPS-systemen, noodaggregaten en automatische omschakeling bij stroomuitval."
        },
        {
            title: "Advies en elektrotechnische planning",
            description: "Deskundig advies over elektra-installaties bij nieuwbouw, renovatie, verbouwing of uitbreiding. Inclusief capaciteitsberekening en plan van aanpak."
        }
    ];

    const werkgebied = [
        "Veenendaal",
        "Utrecht",
        "Amersfoort",
        "Arnhem",
        "Nijmegen"
    ];

    const priceExamples = [
        {service: "Stopcontact installeren", price: "€55 – €150"},
        {service: "Lamp ophangen / aansluiten", price: "€70 – €110"},
        {service: "Schakelaar installeren", price: "€90 – €200"},
        {service: "Extra groep aanleggen", price: "€150 – €350"},
        {service: "Groepenkast vervangen", price: "€600 – €1.100"},
        {service: "Kookplaat aansluiten (Perilex)", price: "€200 – €500"},
        {service: "Elektra keuken/badkamer", price: "€840 – €1.000"}
    ];

    const faqs = [
        {
            question: "Hoeveel kost een elektricien per uur in Veenendaal?",
            answer: "Ons uurtarief is €65 incl. btw. Voor veel werkzaamheden kunnen wij na een korte intake of foto's een vaste prijsindicatie geven, zodat u vooraf weet waar u aan toe bent."
        },
        {
            question: "Wat kost een groepenkast vervangen?",
            answer: "Het vervangen van een groepenkast kost indicatief tussen €600 en €1.100, afhankelijk van het aantal groepen, de meterkastsituatie en eventuele extra werkzaamheden zoals nieuwe aardlekschakelaars."
        },
        {
            question: "Hoe snel kunnen jullie komen?",
            answer: "Voor reguliere elektrotechnische werkzaamheden plannen wij meestal binnen enkele werkdagen een afspraak in. Bij dringende situaties kunt u bellen of WhatsAppen, dan kijken wij wat mogelijk is."
        },
        {
            question: "Wat is een Perilex aansluiting en wanneer heb ik die nodig?",
            answer: "Een Perilex aansluiting is een 5-polige aansluiting speciaal voor inductiekookplaten en krachtige elektrische apparaten. U heeft dit nodig bij inductie, sommige elektrische kookplaten en apparaten die meer dan 3680 watt verbruiken. Wij installeren zowel de Perilex aansluiting als de extra groep in de meterkast."
        },
        {
            question: "Werken jullie volgens de NEN 1010 en NEN 3140 normen?",
            answer: "Ja, wij werken volgens de relevante NEN-richtlijnen voor elektrotechnische installaties, waaronder NEN 1010 (installatienorm) en NEN 3140 (veiligheidsnorm). Dit zorgt voor veilige en regelconforme installaties."
        },
        {
            question: "Krijg ik een prijsopgave vooraf?",
            answer: "Ja. Op basis van uw omschrijving, foto's of een korte inspectie op locatie als het nodig is ontvangt u vooraf een duidelijke prijsindicatie of offerte op maat. Zo weet u precies waar u aan toe bent."
        },
        {
            question: "Wat kost het installeren van een laadpaal?",
            answer: "Een 1-fase laadpaal installeren kost indicatief €800 tot €1.900. Een 3-fase laadpaal kost €3.500 tot €5.000. De exacte prijs hangt af van de afstand tot de meterkast, de benodigde bekabeling en het type laadpaal."
        },
        {
            question: "Kunnen jullie ook elektra verzorgen bij een keuken- of badkamerrenovatie?",
            answer: "Ja, wij verzorgen regelmatig de elektra bij keuken- en badkamerrenovaties. Dit omvat aansluitpunten voor apparatuur, verlichting, extra stopcontacten, kookplaataansluitingen en eventueel vloerverwarming. Wij denken graag mee over de beste oplossing voor uw situatie."
        },
        {
            question: "Leveren jullie garantie op het uitgevoerde werk?",
            answer: "Ja. Wij staan achter ons werk en de nette afwerking. De garantie hangt af van de uitgevoerde werkzaamheden en gebruikte materialen. Dit bespreken wij vooraf in de offerte."
        }
    ];

    return (
        <div className="min-h-screen bg-background" id="top">

            {/* WhatsApp Floating Button */}
            <a
                href={`https://wa.me/${phoneNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
                aria-label="Contact via WhatsApp"
            >
                <MessageCircle className="w-6 h-6"/>
            </a>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border" aria-label="Hoofdnavigatie">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <a href="#" className="flex items-center gap-2 font-semibold text-lg"
                           aria-label="Elektoria Elektrotechniek - Elektricien Veenendaal">
                            <Zap className="w-6 h-6 text-blue-600" aria-hidden="true"/>
                            <span className="hidden sm:inline">Elektoria Elektrotechniek</span>
                            <span className="sm:hidden">Elektoria</span>
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-6">
                            {navItems.map((item) => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {item.label}
                                </a>
                            ))}
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                                <a href={`tel:${phoneNumber}`}>
                                    <Phone className="w-4 h-4 mr-2"/>
                                    Bel nu
                                </a>
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-foreground"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
                        </button>
                    </div>

                    {/* Mobile Navigation */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-border">
                            <div className="flex flex-col gap-4">
                                {navItems.map((item) => (
                                    <a
                                        key={item.href}
                                        href={item.href}
                                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {item.label}
                                    </a>
                                ))}
                                <Button className="bg-blue-600 hover:bg-blue-700 w-full" asChild>
                                    <a href={`tel:${phoneNumber}`}>
                                        <Phone className="w-4 h-4 mr-2"/>
                                        Bel nu
                                    </a>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            <main>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '60px 60px'
                    }}></div>
                </div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                            Elektricien in Veenendaal voor groepenkast, laadpaal, verlichting en renovatie-elektra
                        </h1>

                        <p className="text-xl sm:text-2xl mb-10 text-blue-50">
                            Wij helpen particulieren en bedrijven met groepenkasten, extra groepen, Perilex-aansluitingen, laadpalen, verlichting en renovatie-elektra in Veenendaal en omgeving.
                        </p>

                        <p className="text-base sm:text-lg mb-10 text-blue-100 max-w-2xl">
                            Snel schakelen, duidelijke prijzen en vakwerk volgens NEN-richtlijnen — ook in Utrecht, Amersfoort, Arnhem en Nijmegen.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="bg-white text-blue-700 hover:bg-gray-100 text-lg px-8 py-6 h-auto font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                asChild
                            >
                                <a href={`tel:${phoneNumber}`}>
                                    <Phone className="w-5 h-5 mr-2"/>
                                    Bel direct
                                </a>
                            </Button>

                            <Button
                                size="lg"
                                className="bg-green-500 text-white hover:bg-green-600 text-lg px-8 py-6 h-auto font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105"
                                asChild
                            >
                                <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noopener noreferrer">
                                    <MessageCircle className="w-5 h-5 mr-2"/>
                                    WhatsApp
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-16 bg-white border-y border-border">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-foreground">
                        Waarom kiezen voor Elektoria?
                    </h2>
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                                <CheckCircle2 className="w-8 h-8 text-blue-600"/>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Kwaliteit</h3>
                            <p className="text-sm text-muted-foreground">Vakwerk volgens NEN-normen</p>
                        </div>
                        <div>
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                                <Star className="w-8 h-8 text-blue-600"/>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Transparant</h3>
                            <p className="text-sm text-muted-foreground">Vooraf duidelijk over planning en kosten</p>
                        </div>
                        <div>
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                                <MapPin className="w-8 h-8 text-blue-600"/>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Lokaal</h3>
                            <p className="text-sm text-muted-foreground">Veenendaal en regio</p>
                        </div>
                        <div>
                            <div
                                className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-full mb-4">
                                <Building2 className="w-8 h-8 text-blue-600"/>
                            </div>
                            <h3 className="font-semibold text-lg mb-2">Voor iedereen</h3>
                            <p className="text-sm text-muted-foreground">Particulieren en bedrijven</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section className="relative py-12 bg-background overflow-hidden" id="diensten">
                {/* Subtle gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-blue-50/20"></div>
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%232563eb' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundSize: '100px 100px'
                    }}></div>
                </div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center">
                        Diensten voor elektra in Veenendaal en omgeving
                    </h2>
                    <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-8">
                        Van groepenkast vervangen tot laadpaal installatie: wij leveren praktische oplossingen voor woningen, verbouwingen en zakelijke projecten.
                    </p>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {services.map((service, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-lg border border-border hover:border-blue-600 transition-colors bg-card"
                            >
                                <Wrench className="w-8 h-8 text-blue-600 mb-4"/>
                                <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                                <p className="text-muted-foreground">{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="relative py-12 bg-muted/30 overflow-hidden" id="over-ons">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '40px 40px'
                }}></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-3xl font-bold mb-6 text-center">
                        Over Elektoria Elektrotechniek
                    </h2>

                    <p className="text-center text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Transparantie voorop: duidelijke prijzen, planning en werkzaamheden. 25+ jaar ervaring volgens
                        NEN-richtlijnen.
                    </p>

                    <div className="bg-card border border-border rounded-lg p-5 shadow-lg">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Photo */}
                            <div className="flex flex-col items-center mx-auto md:mx-0 flex-shrink-0">
                                <div
                                    className="w-24 h-24 rounded-full border-4 border-blue-600 shadow-lg overflow-hidden mb-2">
                                    <img
                                        src="https://media.licdn.com/dms/image/v2/D4D03AQG2qq7Vafc8tA/profile-displayphoto-crop_800_800/B4DZjcMSi5HsAQ-/0/1756040866775?e=1779321600&v=beta&t=MffIYPlGuy8OKPrGAVijI-tng7XrqAfVtvJazEtaevM"
                                        alt="Portret van Oleksandr Volkov, eigenaar van Elektoria Elektrotechniek"
                                        className="w-full h-full object-cover"
                                        width={96}
                                        height={96}
                                        loading="lazy"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Sinds 1999</p>
                            </div>

                            {/* Info */}
                            <div className="flex-1 space-y-3">
                                <div>
                                    <h3 className="text-xl font-bold">Oleksandr Volkov</h3>
                                    <p className="text-blue-600 font-semibold text-sm mb-2">Eigenaar</p>

                                    <div
                                        className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded mb-2">
                                        <p className="text-sm font-bold">🇳🇱 3+ jaar ervaring Nederlandse markt</p>
                                        <p className="text-xs opacity-90">Dornick B.V. • MAATT Nijkerk • Covebo Techniek
                                            • VD Heuvel</p>
                                    </div>

                                    <p className="text-muted-foreground text-xs">
                                        25+ jaar ervaring (sinds 1999) • <strong>Zelfstandig sinds 2023</strong>
                                    </p>
                                </div>

                                <div className="text-xs">
                                    <div className="flex flex-wrap gap-6">
                                        <div>
                                            <p className="font-semibold mb-1">Opleiding</p>
                                            <p className="text-muted-foreground"><strong>MBO +
                                                HBO</strong> Elektrotechniek</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold mb-1">Certificeringen</p>
                                            <p className="text-muted-foreground">B-VCA • NEN 1010 • NEN 3140</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs">
                                    <p className="font-semibold mb-1">Specialisaties</p>
                                    <p className="text-muted-foreground leading-relaxed">
                                        Groepenkasten • Laadpalen (1-3 fase) • Noodstroom/UPS • Krachtstroom •
                                        Industriële installaties • Renovatie-elektra • Projectplanning
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="relative py-3 bg-muted/30 overflow-hidden" id="prijzen">
                {/* Euro symbol pattern background */}
                <div className="absolute inset-0 opacity-3">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='20' y='70' font-size='60' fill='%232563eb' opacity='0.4' font-family='Arial' font-weight='bold'%3E%E2%82%AC%3C/text%3E%3C/svg%3E")`,
                        backgroundSize: '100px 100px'
                    }}></div>
                </div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-center">
                        Tarieven en richtprijzen
                    </h2>
                    <p className="text-muted-foreground text-center mb-8 text-base max-w-3xl mx-auto">
                        Uurtarief <span className="font-semibold text-foreground">€65 incl. btw</span>. Voor de meeste
                        werkzaamheden geven wij na intake of foto's een vaste prijsindicatie.
                    </p>

                    <div className="bg-card border border-border rounded-lg overflow-hidden mb-8">
                        <div className="bg-blue-600 text-white py-3 px-6">
                            <h3 className="font-semibold">Indicatieve prijzen</h3>
                        </div>
                        <p className="px-6 py-3 text-sm text-muted-foreground bg-blue-50">
                            <strong>Prijzen zijn indicatief en inclusief btw.</strong> Voor een definitieve prijs vragen
                            wij meestal om foto's, aanvullende informatie of een korte inspectie op locatie. Zo kunnen
                            wij u een nauwkeurige offerte op maat geven.
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50">
                                <tr>
                                    <th className="text-left py-3 px-6 font-semibold text-sm">Werkzaamheden</th>
                                    <th className="text-right py-3 px-6 font-semibold text-sm">Richtprijs</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                {priceExamples.map((item, index) => (
                                    <tr key={index} className="hover:bg-muted/20">
                                        <td className="py-3 px-6">{item.service}</td>
                                        <td className="py-3 px-6 text-right font-semibold text-blue-600">{item.price}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Home className="w-5 h-5 text-blue-600"/>
                                Renovaties
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex justify-between">
                                    <span>Kleine renovatie-elektra</span>
                                    <span className="font-semibold">€800 – €1.800</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Volledige elektra renovatie</span>
                                    <span className="font-semibold">€3.000 – €12.000</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Complete woning (nieuw)</span>
                                    <span className="font-semibold">€1.550 – €2.000</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-card border border-border rounded-lg p-6">
                            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-blue-600"/>
                                Speciale installaties
                            </h3>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li className="flex justify-between">
                                    <span>Laadpaal 1-fase</span>
                                    <span className="font-semibold">€800 – €1.900</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Laadpaal 3-fase</span>
                                    <span className="font-semibold">€3.500 – €5.000</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Krachtstroom aanleggen</span>
                                    <span className="font-semibold">€175 – €350</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Coverage Area */}
            <section className="relative py-12 bg-muted/30 overflow-hidden" id="werkgebied">
                {/* Map-inspired background pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='1'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0-5.523-4.477-10-10-10zm-20 0c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10zM30 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm30 20c5.523 0 10 4.477 10 10s-4.477 10-10 10-10-4.477-10-10 4.477-10 10-10z' opacity='0.5'/%3E%3Cpath d='M20 70l-5-5 5-5 5 5m30 0l-5-5 5-5 5 5M20 10l-5-5 5-5 5 5m30 0l-5-5 5-5 5 5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        backgroundSize: '80px 80px'
                    }}></div>
                </div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <MapPin className="w-12 h-12 text-blue-600 mx-auto mb-6" aria-hidden="true"/>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                        Werkgebied en regio
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        Actief in Veenendaal en omliggende regio's in Gelderland en Utrecht.
                    </p>

                    <div className="flex flex-wrap justify-center gap-4 mb-8">
                        {werkgebied.map((plaats, index) => (
                            <div
                                key={index}
                                className="bg-card border-2 border-blue-600 rounded-full px-6 py-3 font-semibold text-lg"
                            >
                                {plaats}
                            </div>
                        ))}
                    </div>

                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Ook werkzaam in <strong>Ede, Wageningen, Rhenen, Scherpenzeel</strong> en andere plaatsen in de
                        regio. Twijfelt u? Neem contact op.
                    </p>
                </div>
            </section>

            {/* Reviews Section */}
            <section className="relative py-12 bg-background overflow-hidden" id="reviews">
                {/* Star pattern background */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 10l3.09 9.514h10.038l-8.127 5.913 3.102 9.528L50 29.042l-8.103 5.913 3.102-9.528-8.127-5.913h10.038L50 10zm0 40l3.09 9.514h10.038l-8.127 5.913 3.102 9.528L50 69.042l-8.103 5.913 3.102-9.528-8.127-5.913h10.038L50 50zm0 40l3.09 9.514h10.038l-8.127 5.913 3.102 9.528L50 109.042l-8.103 5.913 3.102-9.528-8.127-5.913h10.038L50 90zM10 30l3.09 9.514h10.038l-8.127 5.913 3.102 9.528L10 49.042l-8.103 5.913 3.102-9.528-8.127-5.913h10.038L10 30zm0 40l3.09 9.514h10.038l-8.127 5.913 3.102 9.528L10 89.042l-8.103 5.913 3.102-9.528-8.127-5.913h10.038L10 70zM90 30l3.09 9.514h10.038l-8.127 5.913 3.102 9.528L90 49.042l-8.103 5.913 3.102-9.528-8.127-5.913h10.038L90 30zm0 40l3.09 9.514h10.038l-8.127 5.913 3.102 9.528L90 89.042l-8.103 5.913 3.102-9.528-8.127-5.913h10.038L90 70z' fill='%23eab308' fill-rule='evenodd'/%3E%3C/svg%3E")`,
                        backgroundSize: '100px 100px'
                    }}></div>
                </div>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-8">
                        <p className="text-sm text-muted-foreground mb-4">
                            Bekijk actuele beoordelingen rechtstreeks op Google Maps.
                        </p>
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-7 h-7 fill-yellow-400 text-yellow-400"/>
                                ))}
                            </div>
                            <span className="text-3xl font-bold">4.9</span>

                        </div>

                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                            Google Reviews
                        </h2>
                    </div>

                    {/* Reviews Carousel */}
                    <GoogleReviews/>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
                        <Button
                            size="lg"
                            variant="outline"
                            className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                            asChild
                        >
                            <a
                                href="https://www.google.com/maps/place/Elektoria+Elektrotechniek/@52.0229724,5.5295376,17z/data=!3m1!4b1!4m6!3m5!1s0x6f9132c821770149:0x26bfaf7b405b2660!8m2!3d52.0229724!4d5.5295376!16s%2Fg%2F11xnr8rndm?entry=ttu&g_ep=EgoyMDI2MDQyOS4wIKXMDSoASAFQAw%3D%3D"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2"
                            >
                                <MapPin className="w-5 h-5"/>
                                Bekijk op Google Maps
                            </a>
                        </Button>

                        <Button
                            size="lg"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            asChild
                        >
                            <a
                                href="https://g.page/r/CWAmW0B7r78mEAE/review"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2"
                            >
                                <Star className="w-5 h-5"/>
                                Review achterlaten
                            </a>
                        </Button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="relative py-12 bg-muted/30 overflow-hidden" id="faq">
                {/* Question mark pattern background */}
                <div className="absolute inset-0 opacity-3">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='10' y='80' font-size='90' fill='%232563eb' opacity='0.3' font-family='Arial'%3E%3F%3C/text%3E%3C/svg%3E")`,
                        backgroundSize: '120px 120px'
                    }}></div>
                </div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-8">
                        <HelpCircle className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                            Veelgestelde vragen
                        </h2>
                    </div>

                    <Accordion type="single" collapsible className="bg-card border border-border rounded-lg">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="px-6 py-4 text-left hover:no-underline">
                                    <span className="font-semibold text-lg">{faq.question}</span>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 pb-4 text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </section>
            </main>

            {/* Footer */}
            <footer className="relative bg-slate-900 text-white py-12 overflow-hidden">
                {/* Subtle circuit-like pattern */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        {/* Company Info */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-6 h-6 text-blue-400"/>
                                <span className="font-bold text-lg">Elektoria Elektrotechniek</span>
                            </div>
                            <p className="text-sm text-gray-300 mb-4">
                                Elektrotechnische installaties in Veenendaal en omgeving.
                            </p>
                            <div className="flex gap-4">
                                    <a href={`https://g.page/r/CWAmW0B7r78mEAE`} target="_blank" rel="noopener noreferrer"
                                   className="text-blue-400 hover:text-blue-300">
                                    Google
                                </a>
                            </div>
                        </div>

                        {/* Contact Info (NAP) */}
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Contact</h3>
                            <div className="space-y-3 text-sm text-gray-300">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-blue-400"/>
                                    <div>
                                        <address className="not-italic">
                                            <p className="font-medium text-white">Elektoria Elektrotechniek</p>
                                            <p>Spaarne 58</p>
                                            <p>3904 NJ Veenendaal</p>
                                            <p>Nederland</p>
                                        </address>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 flex-shrink-0 text-blue-400"/>
                                    <a href={`tel:${phoneNumber}`} className="hover:text-white">+{phoneNumber}</a>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 flex-shrink-0 text-blue-400"/>
                                    <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
                                </div>
                            </div>
                        </div>

                        {/* Service Areas */}
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Regio</h3>
                            <div className="flex flex-wrap gap-2">
                                {werkgebied.map((plaats, index) => (
                                    <span key={index}
                                          className="text-xs bg-blue-900/30 text-blue-200 px-2 py-1 rounded">
                    {plaats}
                  </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-3">
                                + omliggende plaatsen
                            </p>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-700 pt-6">
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-xs text-gray-400 text-center">
                                Elektoria Elektrotechniek is een handelsnaam van Elektoria Group B.V.
                            </p>
                            <p className="text-sm text-gray-400 text-center">
                                © {new Date().getFullYear()} Elektoria Group B.V. · KvK: 97285862 · BTW: NL867985562B01
                                · Alle rechten voorbehouden
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}