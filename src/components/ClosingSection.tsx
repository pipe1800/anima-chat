
import { Button } from "@/components/ui/button";

const ClosingSection = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Closing Statement */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
          Transform Your Conversations with AI Characters That Feel Real
        </h2>
        
        {/* Supporting Text */}
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
          Join thousands of users who are already creating meaningful connections with AI. Start your journey today.
        </p>

        {/* Call-to-Action Button - Identical to Hero Section */}
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold px-8 sm:px-10 py-4 sm:py-5 text-lg sm:text-xl rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 min-w-[200px] h-12 sm:h-auto min-h-[44px]"
          style={{
            boxShadow: '0 8px 25px rgba(249, 115, 22, 0.3), 0 4px 15px rgba(249, 115, 22, 0.2)'
          }}
        >
          Start Chatting
        </Button>

        {/* Trust-building text */}
        <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">
          ✓ 14-Day Free Trial ✓ No Credit Card Required ✓ Cancel Anytime
        </p>
      </div>
    </section>
  );
};

export default ClosingSection;
