import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem, Mechanism, Forfeit } from "@/components/landing/Story";
import {
  Privacy,
  Calibration,
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
        <Mechanism />
        <Forfeit />
        <Privacy />
        <Calibration />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
