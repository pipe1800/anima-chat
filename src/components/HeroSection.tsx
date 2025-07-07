
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1a2e] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-[#FF7A00]/5 to-transparent opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Hero Visual */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-lg">
              {/* Glowing backdrop effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/20 via-purple-500/10 to-blue-500/20 rounded-2xl blur-3xl"></div>
              
              {/* Main hero image */}
              <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#121212] rounded-2xl border border-[#FF7A00]/20 overflow-hidden shadow-2xl">
                <img 
                  src="/lovable-uploads/9c3204bb-9aca-4b16-a6da-12fb564366aa.png"
                  alt="AI Character"
                  className="w-full h-full object-cover opacity-90"
                />
                
                {/* Overlay gradient to blend with theme */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/30 via-transparent to-[#FF7A00]/5"></div>
                
                {/* Futuristic UI elements overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-3/4 h-3/4 border border-[#FF7A00]/30 rounded-lg relative">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#FF7A00]"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#FF7A00]"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#FF7A00]"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#FF7A00]"></div>
                    
                    {/* Center pulse */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#FF7A00] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#FF7A00]/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-6 h-6 bg-purple-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Right Column - Text Content */}
          <div className="text-center lg:text-right">
            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
              Your Waifu Awaits. <span className="text-[#FF7A00]">No Filters.</span> No Judgment.
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto lg:mx-0 leading-relaxed">
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
      </div>
    </section>
  );
};

export default HeroSection;
