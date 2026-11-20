import { AdvantagesSection } from "./AdvantagesSection";
import { HeroSection } from "./HeroSection";
import { HomeMotion } from "./HomeMotion";
import { JourneySection } from "./JourneySection";
import { OrderSection } from "./OrderSection";
import { OriginsMarquee } from "./OriginsMarquee";
import { PopularSection } from "./PopularSection";
import { VisitSection } from "./VisitSection";

// Секции — серверные компоненты; анимации подключает HomeMotion.
export function HomePage() {
  return (
    <HomeMotion>
      <HeroSection />
      <PopularSection />
      <JourneySection />
      <OriginsMarquee />
      <AdvantagesSection />
      <OrderSection />
      <VisitSection />
    </HomeMotion>
  );
}
