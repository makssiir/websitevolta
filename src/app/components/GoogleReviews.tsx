import { Star, User } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface Review {
  author: string;
  rating: number;
  text: string;
}

// Echte Google reviews van Elektoria Elektrotechniek
const SAMPLE_REVIEWS: Review[] = [
  {
    author: "Jan Klaassen",
    rating: 4,
    text: "Goede ervaring met dit bedrijf. In de keuken en hal zijn nieuwe lampen geplaatst en de verlichting is duidelijk verbeterd.",
  },
  {
    author: "iloonski Wiese",
    rating: 5,
    text: "Super goed geholpen via de app en erg vriendelijk",
  },
  {
    author: "Jeff Pikoulin",
    rating: 5,
    text: "De monteur was vriendelijk en dacht goed mee over de oplossing. Alles werd snel en netjes uitgevoerd. Ik ben heel tevreden en kan dit bedrijf van harte aanbevelen!",
  },
  {
    author: "Olena Kovalyova",
    rating: 5,
    text: "He did the light in the kitchen and in the living room. We were happy not only with accurate job but also with professional advice and searching for the best solution. Really great job.",
  },
  {
    author: "Kristina Samodurova",
    rating: 5,
    text: "De aanleg van de tuinverlichting is naar volle tevredenheid uitgevoerd. Het werk is vakkundig en netjes verricht, geheel volgens afspraak. Het eindresultaat is prachtig en draagt bij aan zowel de sfeer als de veiligheid. Een absolute aanrader.",
  },
  {
    author: "Curious George",
    rating: 5,
    text: "De oude bedrading gaf me altijd zorgen, maar nu is alles veilig en netjes vervangen. De elektricien werkt snel, schoon en met oog voor detail. Ik voel me eindelijk gerust in mijn eigen huis.",
  },
  {
    author: "Alex den besten",
    rating: 5,
    text: "Snelle en nette installatie van verlichting in ons magazijn. Goed geregeld",
  }
];

interface GoogleReviewsProps {
  reviews?: Review[];
  googlePlaceId?: string;
}

export function GoogleReviews({ reviews = SAMPLE_REVIEWS, googlePlaceId }: GoogleReviewsProps) {
  return (
    <div className="space-y-6">
      {/* Reviews Carousel */}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
            stopOnInteraction: false,
          })
        ]}
        className="w-full"
      >
        <CarouselContent>
          {reviews.map((review, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="h-full p-2">
                <div className="bg-card border border-border rounded-lg p-6 h-full flex flex-col hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{review.author}</h4>
                    </div>
                  </div>

                  <div className="flex gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground flex-1 line-clamp-4">
                    {review.text}
                  </p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>

      {/* Google link */}
      {googlePlaceId && (
        <div className="text-center pt-4">
          <a
            href={`https://search.google.com/local/reviews?placeid=${googlePlaceId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
          >
            Alle reviews bekijken op Google →
          </a>
        </div>
      )}
    </div>
  );
}
