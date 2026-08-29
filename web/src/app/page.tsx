import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem, Forfeit } from "@/components/landing/Story";
import { Pipeline } from "@/components/landing/Pipeline";
import {
  Privacy,
  SealedDrops,
  CTA,
  Footer,
} from "@/components/landing/Proof";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Forfeit />
        <Pipeline />
        <Privacy />
        <SealedDrops />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
