
import { Unlock, Palette, Brain } from "lucide-react";

const ValueProposition = () => {
  const benefits = [
    {
      icon: Unlock,
      title: "Truly Uncensored Chat",
      description: "Tired of filters? So are we. Our AI companions say what they mean. Explore any topic, any fantasy, without limits. The only boundary is your imagination."
    },
    {
      icon: Palette,
      title: "Craft Your Dream Character",
      description: "From shy anime heroines to battle-hardened space marines, you're the creator. Tweak every detail of their personality, backstory, and appearance. Bring your ultimate OC to life."
    },
    {
      icon: Brain,
      title: "Next-Gen AI Immersion",
      description: "Powered by cutting-edge language models, our AI remembers, adapts, and feels more real than ever. Experience conversations with depth and continuity that will blow your mind."
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-[#121212]">
      <div className="max-w-7xl mx-auto">
        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              {/* Glowing Orange Icon */}
              <div className="mb-8 flex justify-center">
                <div className="relative">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <benefit.icon 
                      className="w-12 h-12 text-[#FF7A00] filter drop-shadow-[0_0_8px_rgba(255,122,0,0.6)]" 
                      strokeWidth={1.5}
                    />
                  </div>
                  {/* Additional glow effect */}
                  <div className="absolute inset-0 w-20 h-20 bg-[#FF7A00]/20 rounded-full blur-xl opacity-70 animate-pulse"></div>
                </div>
              </div>

              {/* Sub-headline in white */}
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 leading-tight">
                {benefit.title}
              </h3>

              {/* Description in light gray */}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-sm mx-auto">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
