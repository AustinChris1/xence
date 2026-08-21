import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem, Conflict, Mechanism, Forfeit } from "@/components/landing/Story";
import {
  Privacy,
  Calibration,
  SealedDrops,
  Stack,
  CTA,
  Footer,
  SealTicker,
} from "@/components/landing/Proof";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <SealTicker />
        <Problem />
        <Conflict />
        <Mechanism />
        <Forfeit />
        <Privacy />
        <Calibration />
        <SealedDrops />
        <Stack />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
