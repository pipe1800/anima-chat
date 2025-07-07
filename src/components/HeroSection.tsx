
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1a2e] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-[#FF7A00]/5 to-transparent opacity-50"></div>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
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

          {/* Right Column - Video */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-full max-w-2xl">
              {/* Glowing backdrop effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/20 via-purple-500/10 to-blue-500/20 rounded-2xl blur-3xl"></div>
              
              {/* Video container */}
              <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#121212] rounded-2xl border border-[#FF7A00]/20 overflow-hidden shadow-2xl aspect-video">
                <iframe
                  src="https://drive.google.com/file/d/1RBT8C-1EJaP6CkTcb84XgZ6XjVdTWTiY/preview"
                  className="w-full h-full"
                  allow="autoplay"
                  allowFullScreen
                />
                
                {/* Subtle overlay for theme integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/10 via-transparent to-[#FF7A00]/5 pointer-events-none"></div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#FF7A00]/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-6 h-6 bg-purple-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
