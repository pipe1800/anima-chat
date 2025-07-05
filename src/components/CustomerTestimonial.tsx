
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const CustomerTestimonial = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Customer Photo */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <Avatar className="w-48 h-48 lg:w-56 lg:h-56 shadow-2xl border-4 border-white">
                <AvatarImage 
                  src="/placeholder.svg" 
                  alt="Jane Doe - Marketing Director"
                  className="object-cover"
                />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-700">
                  JD
                </AvatarFallback>
              </Avatar>
              {/* Decorative element */}
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full opacity-30"></div>
            </div>
          </div>

          {/* Right Column - Testimonial Content */}
          <div className="text-center lg:text-left">
            {/* Large opening quotation mark */}
            <div className="text-6xl lg:text-7xl text-blue-300 font-serif leading-none mb-4">
              "
            </div>
            
            {/* Testimonial Quote */}
            <blockquote className="text-xl lg:text-2xl text-gray-800 italic leading-relaxed mb-6 relative -mt-8">
              This platform has completely transformed how we approach AI conversations. The characters feel incredibly real and engaging, making every interaction meaningful and productive.
              
              {/* Closing quotation mark */}
              <span className="text-4xl lg:text-5xl text-blue-300 font-serif absolute -bottom-2 ml-2">
                "
              </span>
            </blockquote>

            {/* Attribution */}
            <div className="mt-8">
              <p className="text-lg font-bold text-gray-900 mb-1">
                Jane Doe
              </p>
              <p className="text-gray-600">
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
