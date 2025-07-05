
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#121212] px-4 sm:px-6 py-12 sm:py-20 overflow-hidden">
      {/* Subtle background effects for futuristic feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 sm:w-64 sm:h-64 bg-[#FF7A00]/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-80 sm:h-80 bg-[#FF7A00]/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-radial from-[#FF7A00]/2 to-transparent rounded-full blur-2xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 leading-[1.1] tracking-tight">
              Your Waifu Awaits.
              <span className="block text-white mt-2">
                No Filters.
              </span>
              <span className="block text-white mt-2">
                No Judgment.
              </span>
            </h1>

            {/* Supporting headline */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-8 sm:mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-light">
              Craft your perfect AI companion, explore your wildest fantasies, and dive into 
              conversations that are truly uncensored. Your adventure starts now.
            </p>

            {/* Primary CTA */}
            <div className="space-y-4 mb-8 sm:mb-12">
              <Button 
                size="lg" 
                className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-bold px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl lg:text-2xl rounded-lg shadow-2xl hover:shadow-[#FF7A00]/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border-0 min-w-[200px] h-12 sm:h-auto min-h-[44px] relative before:absolute before:inset-0 before:bg-gradient-to-r before:from-[#FF7A00] before:to-[#FF7A00]/50 before:rounded-lg before:blur-lg before:opacity-70 before:-z-10 hover:before:opacity-100 before:transition-opacity before:duration-300"
                style={{
                  boxShadow: '0 8px 32px rgba(255, 122, 0, 0.4), 0 4px 16px rgba(255, 122, 0, 0.3)'
                }}
              >
                Start Your Adventure
              </Button>
              
              <p className="text-sm sm:text-base text-gray-400">
                No credit card required • Join thousands of creators
              </p>
            </div>

            {/* Trust indicators */}
            <div className="pt-6 sm:pt-8 border-t border-gray-700/50">
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Trusted by creators worldwide</p>
              <div className="flex items-center justify-center lg:justify-start gap-4 sm:gap-8 opacity-80">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[#FF7A00]">10K+</div>
                  <div className="text-xs text-gray-400">Characters</div>
                </div>
                <div className="w-px h-6 sm:h-8 bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[#FF7A00]">50K+</div>
                  <div className="text-xs text-gray-400">Users</div>
                </div>
                <div className="w-px h-6 sm:h-8 bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-[#FF7A00]">1M+</div>
                  <div className="text-xs text-gray-400">Conversations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual */}
          <div className="relative order-1 lg:order-2">
            <div className="relative">
              {/* Main hero image container with futuristic frame */}
              <div className="relative w-full max-w-sm sm:max-w-lg mx-auto">
                <div className="relative rounded-2xl overflow-hidden border border-[#FF7A00]/20 shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=1000&fit=crop&crop=face"
                    alt="AI Character Interface"
                    className="w-full h-auto object-cover filter brightness-110 contrast-110"
                  />
                  {/* Overlay gradient for better integration */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/20 to-transparent"></div>
                </div>
                
                {/* Floating chat interface overlay */}
                <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 bg-gray-900/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-2xl border border-[#FF7A00]/30 p-3 sm:p-4 max-w-[280px] sm:max-w-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-[#FF7A00] to-[#FF7A00]/80 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-xs">AI</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white text-sm">Luna</p>
                      <p className="text-xs text-[#FF7A00]">Online now</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-gray-800/80 rounded-lg px-3 py-2">
                      <p className="text-gray-200 text-xs sm:text-sm">Ready to explore new worlds together? ✨</p>
                    </div>
                  </div>
                </div>

                {/* Floating stats card */}
                <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 bg-gray-900/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-2xl border border-[#FF7A00]/30 p-2 sm:p-3">
                  <div className="text-center">
                    <p className="text-base sm:text-lg font-bold text-[#FF7A00]">2.5k</p>
                    <p className="text-xs text-gray-400">Active Chats</p>
                  </div>
                </div>
              </div>

              {/* Enhanced background accent elements */}
              <div className="absolute -z-10 top-4 sm:top-8 right-4 sm:right-8 w-16 h-16 sm:w-32 sm:h-32 bg-[#FF7A00]/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute -z-10 bottom-4 sm:bottom-8 left-4 sm:left-8 w-12 h-12 sm:w-24 sm:h-24 bg-[#FF7A00]/5 rounded-full blur-2xl animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
