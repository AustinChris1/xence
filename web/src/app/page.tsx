import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem, Forfeit } from "@/components/landing/Story";
import { Pipeline } from "@/components/landing/Pipeline";
import { BuiltOn } from "@/components/landing/BuiltOn";
import { AgentRail } from "@/components/landing/AgentRail";
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
        <BuiltOn />
        <Problem />
        <Forfeit />
        <Pipeline />
        <Privacy />
        <SealedDrops />
        <AgentRail />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
