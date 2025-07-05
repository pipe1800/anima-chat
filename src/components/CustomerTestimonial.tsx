
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const CustomerTestimonial = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-r from-gray-900 to-[#121212]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          {/* Left Column - Customer Photo */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-1">
            <div className="relative">
              <Avatar className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 xl:w-56 xl:h-56 shadow-2xl border-4 border-[#FF7A00]/20">
                <AvatarImage 
                  src="/placeholder.svg" 
                  alt="Jane Doe - Marketing Director"
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-br from-gray-800 to-gray-900 text-[#FF7A00]">
                  JD
                </AvatarFallback>
              </Avatar>
              {/* Decorative element */}
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-8 h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#FF7A00]/30 to-[#FF7A00]/10 rounded-full blur-sm"></div>
            </div>
          </div>

          {/* Right Column - Testimonial Content */}
          <div className="text-center lg:text-left order-2 lg:order-2">
            {/* Large opening quotation mark */}
            <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-[#FF7A00]/60 font-serif leading-none mb-3 sm:mb-4">
              "
            </div>
            
            {/* Testimonial Quote */}
            <blockquote className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white italic leading-relaxed mb-4 sm:mb-6 relative -mt-4 sm:-mt-6 lg:-mt-8">
              This platform has completely transformed how we approach AI conversations. The characters feel incredibly real and engaging, making every interaction meaningful and productive.
              
              {/* Closing quotation mark */}
              <span className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl text-[#FF7A00]/60 font-serif absolute -bottom-1 sm:-bottom-2 ml-2">
                "
              </span>
            </blockquote>

            {/* Attribution */}
            <div className="mt-6 sm:mt-8">
              <p className="text-base sm:text-lg font-bold text-white mb-1">
                Jane Doe
              </p>
              <p className="text-sm sm:text-base text-gray-400">
                Marketing Director at ExampleCorp
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CustomerTestimonial;
