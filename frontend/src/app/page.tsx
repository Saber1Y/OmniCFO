import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { ThreeCardGrid } from "@/components/ThreeCardGrid";
import { ProductShowcase } from "@/components/ProductShowcase";
import { WorkflowDiagram } from "@/components/WorkflowDiagram";
import { SecurityDiagram } from "@/components/SecurityDiagram";
import { TechStack } from "@/components/TechStack";
import { CTA } from "@/components/CTA";
import { Footer } from "@/components/Footer";
import { Screenshots } from "@/components/Screenshots";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main>
        <Hero />
        <ThreeCardGrid />
        <SecurityDiagram />
        <ProductShowcase />
        <WorkflowDiagram />
        <Screenshots />
        <TechStack />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
