
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30 px-6 py-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100/40 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            {/* Main headline */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Create and Chat with
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                AI Characters
              </span>
            </h1>

            {/* Supporting headline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Discover amazing AI personalities, create your own unique characters, and engage in 
              conversations that bring your imagination to life.
            </p>

            {/* Primary CTA */}
            <div className="space-y-4 mb-12">
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
            <div className="pt-8 border-t border-gray-200/50">
              <p className="text-sm text-gray-400 mb-6">Trusted by creators worldwide</p>
              <div className="flex items-center justify-center lg:justify-start gap-8 opacity-60">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">10K+</div>
                  <div className="text-xs text-gray-400">Characters</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">50K+</div>
                  <div className="text-xs text-gray-400">Users</div>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-400">1M+</div>
                  <div className="text-xs text-gray-400">Conversations</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual */}
          <div className="relative lg:order-last">
            <div className="relative">
              {/* Main hero image container */}
              <div className="relative w-full max-w-lg mx-auto">
                <img 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=1000&fit=crop&crop=face"
                  alt="Person engaging with AI chat interface"
                  className="w-full h-auto rounded-2xl shadow-2xl object-cover"
                />
                
                {/* Floating chat interface overlay */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-gray-200/50 p-4 max-w-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">AI</span>
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-sm">Luna</p>
                      <p className="text-xs text-gray-500">Online now</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="bg-gray-50 rounded-lg px-3 py-2">
                      <p className="text-gray-700 text-xs">Ready to explore new worlds together? ✨</p>
                    </div>
                  </div>
                </div>

                {/* Floating stats card */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg border border-gray-200/50 p-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">2.5k</p>
                    <p className="text-xs text-gray-500">Active Chats</p>
                  </div>
                </div>
              </div>

              {/* Background accent elements */}
              <div className="absolute -z-10 top-8 right-8 w-32 h-32 bg-orange-100/40 rounded-full blur-2xl"></div>
              <div className="absolute -z-10 bottom-8 left-8 w-24 h-24 bg-blue-100/40 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
