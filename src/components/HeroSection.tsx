
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1a1a2e] text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-radial from-[#FF7A00]/5 to-transparent opacity-50"></div>
      
      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-[#1a1a2e]/95 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/lovable-uploads/cb144190-2b60-459a-ac1e-0df3edba9e1b.png" 
                alt="Anima Chat" 
                className="h-12 w-auto"
              />
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button 
                  variant="ghost" 
                  className="text-[#FF7A00] hover:text-white hover:bg-[#FF7A00]/10 font-medium"
                >
                  Home
                </Button>
              </Link>
              <Link to="/characters">
                <Button 
                  variant="ghost" 
                  className="text-white hover:text-[#FF7A00] hover:bg-[#FF7A00]/10"
                >
                  Characters
                </Button>
              </Link>
              <Link to="/auth">
                <Button 
                  variant="outline" 
                  className="bg-transparent border-[#FF7A00] text-[#FF7A00] hover:bg-[#FF7A00] hover:text-white transition-colors"
                >
                  Login
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button 
                  className="bg-[#FF7A00] hover:bg-[#FF7A00]/90 text-white font-medium transition-colors"
                >
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-4rem)] pt-2 px-4 sm:px-6 mt-12">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Video */}
          <div className="relative flex justify-center lg:justify-start">
            <div className="relative w-full max-w-2xl">
              {/* Glowing backdrop effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#FF7A00]/20 via-purple-500/10 to-blue-500/20 rounded-2xl blur-3xl"></div>
              
              {/* Video container with 4:3 aspect ratio to match 1,660 x 1,244 */}
              <div className="relative bg-gradient-to-br from-[#1a1a2e] to-[#121212] rounded-2xl border border-[#FF7A00]/20 overflow-hidden shadow-2xl" style={{ aspectRatio: '1660/1244' }}>
                <video
                  src="https://rclpyipeytqbamiwcuih.supabase.co/storage/v1/object/sign/videos/20250707_1505_video.mp4?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mYmU5OTM4My0yODYxLTQ0N2UtYThmOC1hY2JjNzU3YjQ0YzgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ2aWRlb3MvMjAyNTA3MDdfMTUwNV92aWRlby5tcDQiLCJpYXQiOjE3NTE5MjM1NjYsImV4cCI6MTc4MzQ1OTU2Nn0.VYCXNwQU7GSp3N790Nr0SX5zKv7fY9zzd5ErsYULwyc"
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                />
                
                {/* Subtle overlay for theme integration */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/10 via-transparent to-[#FF7A00]/5 pointer-events-none"></div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-[#FF7A00]/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-6 -right-6 w-6 h-6 bg-purple-500/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>

          {/* Right Column - Text Content */}
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
            <Link to="/auth?mode=signup">
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
