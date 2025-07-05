
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-6 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        {/* Main headline */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
          Create and Chat with
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
            AI Characters
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Discover amazing AI personalities, create your own unique characters, and engage in 
          conversations that bring your imagination to life.
        </p>

        {/* Hero visual placeholder */}
        <div className="mb-16 relative">
          <div className="mx-auto w-full max-w-4xl h-80 md:h-96 bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl border border-gray-200/50 shadow-xl overflow-hidden">
            {/* Chat interface mockup */}
            <div className="p-8 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">AI</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Character Name</p>
                  <p className="text-sm text-gray-500">Online now</p>
                </div>
              </div>
              
              <div className="flex-1 space-y-4">
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 shadow-sm border border-gray-100 max-w-xs">
                    <p className="text-gray-700 text-sm">Hello! I'm excited to chat with you. What would you like to talk about?</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-500 rounded-2xl rounded-tr-md px-4 py-3 shadow-sm max-w-xs">
                    <p className="text-white text-sm">Let's explore some creative ideas together!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA */}
        <div className="space-y-4">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
          >
            Get Started Free
          </Button>
          
          <p className="text-sm text-gray-500">
            No credit card required • Join thousands of creators
          </p>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 pt-12 border-t border-gray-200/50">
          <p className="text-sm text-gray-400 mb-6">Trusted by creators worldwide</p>
          <div className="flex items-center justify-center gap-12 opacity-60">
            <div className="text-2xl font-bold text-gray-400">10K+</div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-2xl font-bold text-gray-400">50K+</div>
            <div className="w-px h-8 bg-gray-300"></div>
            <div className="text-2xl font-bold text-gray-400">1M+</div>
          </div>
          <div className="flex items-center justify-center gap-12 mt-2 text-xs text-gray-400">
            <span>Characters</span>
            <span>Users</span>
            <span>Conversations</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
