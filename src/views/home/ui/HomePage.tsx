import { AdvantagesSection } from "./AdvantagesSection";
import { HeroSection } from "./HeroSection";
import { HomeMotion } from "./HomeMotion";
import { JourneySection } from "./JourneySection";
import { ManifestoSection } from "./ManifestoSection";
import { OrderSection } from "./OrderSection";
import { OriginsMarquee } from "./OriginsMarquee";
import { VisitSection } from "./VisitSection";

// Секции — серверные компоненты; анимации подключает HomeMotion.
export function HomePage() {
  return (
    <HomeMotion>
      <HeroSection />
      <ManifestoSection />
      <JourneySection />
      <OriginsMarquee />
      <AdvantagesSection />
      <OrderSection />
      <VisitSection />
    </HomeMotion>
  );
}
