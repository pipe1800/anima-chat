
import { Button } from "@/components/ui/button";

const ClosingSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#121212] text-white border-t border-gray-700/50">
      <div className="max-w-4xl mx-auto text-center relative">
        {/* Background glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-[#FF7A00]/5 to-transparent rounded-full blur-3xl"></div>
        
        <div className="relative">
          {/* Closing Statement */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 leading-tight text-white">
            Transform Your Conversations with AI Characters That Feel Real
          </h2>
          
          {/* Supporting Text */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of users who are already creating meaningful connections with AI. Start your journey today.
          </p>

          {/* Call-to-Action Button */}
          <Button 
            size="lg" 
            className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-bold px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl rounded-lg shadow-2xl hover:shadow-[#FF7A00]/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border-0 min-w-[200px] h-12 sm:h-auto min-h-[44px]"
            style={{
              boxShadow: '0 8px 25px rgba(255, 122, 0, 0.3), 0 4px 15px rgba(255, 122, 0, 0.2)'
            }}
          >
            Start Chatting
          </Button>

          {/* Trust-building text */}
          <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">
            ✓ 14-Day Free Trial ✓ No Credit Card Required ✓ Cancel Anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default ClosingSection;
