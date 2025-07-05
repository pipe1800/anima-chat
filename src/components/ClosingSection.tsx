
import { Button } from "@/components/ui/button";

const ClosingSection = () => {
  return (
    <section className="py-20 px-6 bg-gray-900 text-white">
      <div className="max-w-4xl mx-auto text-center">
        {/* Closing Statement */}
        <h2 className="text-3xl lg:text-5xl font-bold mb-6 leading-tight">
          Transform Your Conversations with AI Characters That Feel Real
        </h2>
        
        {/* Supporting Text */}
        <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Join thousands of users who are already creating meaningful connections with AI. Start your journey today.
        </p>

        {/* Call-to-Action Button */}
        <Button 
          size="lg" 
          className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-8 py-6 h-auto font-semibold"
        >
          Get Started Now
        </Button>
      </div>
    </section>
  );
};

export default ClosingSection;
