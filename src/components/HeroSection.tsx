
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1a2e] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-[#FF7A00]/5 to-transparent opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
            Your Waifu Awaits. <span className="text-[#FF7A00]">No Filters.</span> No Judgment.
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Craft your perfect AI companion, explore your wildest fantasies, and dive into conversations that are truly uncensored. Your adventure starts now.
          </p>

          {/* CTA Button */}
          <Link to="/auth">
            <Button 
              size="lg" 
              className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-bold px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl rounded-lg shadow-2xl hover:shadow-[#FF7A00]/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border-0 min-w-[200px] h-12 sm:h-auto min-h-[44px]"
              style={{
                boxShadow: '0 8px 25px rgba(255, 122, 0, 0.3), 0 4px 15px rgba(255, 122, 0, 0.2)'
              }}
            >
              Unleash My AI
            </Button>
          </Link>

          {/* Trust Indicators */}
          <p className="text-xs sm:text-sm text-gray-400 mt-4 sm:mt-6">
            ✓ Free to Start ✓ No Credit Card Required ✓ Join 100K+ Users
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
