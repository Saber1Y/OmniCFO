import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ArchitectureDAG } from "@/components/ArchitectureDAG";
import { LiveWorkflow } from "@/components/LiveWorkflow";
import { TechStack } from "@/components/TechStack";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ArchitectureDAG />
        <LiveWorkflow />
        <TechStack />
      </main>
      <Footer />
    </>
  );
}
