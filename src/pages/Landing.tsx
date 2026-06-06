import { Navigation } from "@/components/Landing/navigation";
import { HeroSection } from "@/components/Landing/hero-section";
import { FeaturesSection } from "@/components/Landing/features-section";
import { HowItWorksSection } from "@/components/Landing/how-it-works-section";
import { InfrastructureSection } from "@/components/Landing/infrastructure-section";
import { MetricsSection } from "@/components/Landing/metrics-section";
import { IntegrationsSection } from "@/components/Landing/integrations-section";
import { SecuritySection } from "@/components/Landing/security-section";
import { DevelopersSection } from "@/components/Landing/developers-section";
import { TestimonialsSection } from "@/components/Landing/testimonials-section";

import { CtaSection } from "@/components/Landing/cta-section";
import { FooterSection } from "@/components/Landing/footer-section";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background flex flex-col">
      <Navigation />
      <main className="flex-1 w-full">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <InfrastructureSection />
        <MetricsSection />
        <IntegrationsSection />
        <SecuritySection />
        <DevelopersSection />
        <TestimonialsSection />

        <CtaSection />
      </main>
      <FooterSection />
    </div>
  );
}
