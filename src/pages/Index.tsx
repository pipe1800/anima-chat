
import HeroSection from "@/components/HeroSection";
import ValueProposition from "@/components/ValueProposition";
import HowItWorks from "@/components/HowItWorks";
import CustomerTestimonial from "@/components/CustomerTestimonial";
import FAQ from "@/components/FAQ";
import ClosingSection from "@/components/ClosingSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ValueProposition />
      <HowItWorks />
      <CustomerTestimonial />
      <FAQ />
      <ClosingSection />
    </div>
  );
};

export default Index;
