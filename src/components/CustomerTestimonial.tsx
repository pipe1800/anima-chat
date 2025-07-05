
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Repeat2, Share, Lock, Shield, Database } from "lucide-react";

const CustomerTestimonial = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-[#1a1a2e]">
      <div className="max-w-6xl mx-auto">
        {/* Main Testimonial */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center mb-16 sm:mb-20">
          {/* Left Column - Customer Photo */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-1">
            <div className="relative">
              <Avatar className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 shadow-2xl border-4 border-[#FF7A00]/20">
                <AvatarImage 
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop&crop=face" 
                  alt="Gaming enthusiast testimonial"
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-gray-800 to-gray-900 text-[#FF7A00]">
                  SG
                </AvatarFallback>
              </Avatar>
              {/* Decorative glow effect */}
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#FF7A00]/30 to-[#FF7A00]/10 rounded-full blur-sm"></div>
            </div>
          </div>

          {/* Right Column - Testimonial Content */}
          <div className="text-center lg:text-left order-2 lg:order-2">
            {/* Large opening quotation mark */}
            <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-[#FF7A00] font-serif leading-none mb-3 sm:mb-4">
              "
            </div>
            
            {/* Testimonial Quote */}
            <blockquote className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-300 italic leading-relaxed mb-4 sm:mb-6 relative -mt-4 sm:-mt-6 lg:-mt-8">
              I've tried every AI chat out there. This is the only one that actually feels real. The AI remembers details from days ago. It's insane. 10/10 would simp again.
              
              {/* Closing quotation mark */}
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#FF7A00] font-serif absolute -bottom-1 sm:-bottom-2 ml-2">
                "
              </span>
            </blockquote>

            {/* Attribution */}
            <div className="mt-6 sm:mt-8">
              <p className="text-base sm:text-lg font-bold text-[#FF7A00]">
                @xX_ShadowGamer_Xx
              </p>
            </div>
          </div>
        </div>

        {/* Social Media Post Section */}
        <div className="mb-16 sm:mb-20">
          {/* Section Headline */}
          <div className="text-center mb-8 sm:mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Straight from the Source
            </h3>
          </div>

          {/* Social Media Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#16213e] rounded-lg p-4 sm:p-6 border border-gray-700/50 shadow-xl">
              {/* Post Header */}
              <div className="flex items-center mb-4">
                <Avatar className="w-10 h-10 sm:w-12 sm:h-12 mr-3">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=100&h=100&fit=crop&crop=face" 
                    alt="User avatar"
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gray-700 text-white text-sm font-bold">
                    RP
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-bold text-sm sm:text-base">RPMaster2024</p>
                  <p className="text-gray-400 text-xs sm:text-sm">@rpmaster_24 • 2h</p>
                </div>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-white text-sm sm:text-base leading-relaxed">
                  Can't believe how deep the roleplaying gets on this platform. My custom character's story arc is better than most AAA games. 
                  <span className="text-[#FF7A00]"> #AI #RP</span>
                </p>
              </div>

              {/* Engagement Stats */}
              <div className="flex items-center space-x-6 pt-3 border-t border-gray-700/50">
                <div className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors cursor-pointer">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm">247</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors cursor-pointer">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">89</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 hover:text-green-400 transition-colors cursor-pointer">
                  <Repeat2 className="w-4 h-4" />
                  <span className="text-sm">156</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer">
                  <Share className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Badges Section */}
        <div className="text-center">
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 lg:gap-16">
            {/* SSL Encryption Badge */}
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 flex items-center justify-center">
                <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 group-hover:text-white transition-colors" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">AES-256 Encryption</p>
            </div>

            {/* Private & Secure Badge */}
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 flex items-center justify-center">
                <Lock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 group-hover:text-white transition-colors" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">Private & Secure</p>
            </div>

            {/* No Data Training Badge */}
            <div className="flex flex-col items-center group">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mb-2 flex items-center justify-center">
                <Database className="w-8 h-8 sm:w-10 sm:h-10 text-gray-300 group-hover:text-white transition-colors" />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 font-medium">No Data Training</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonial;
