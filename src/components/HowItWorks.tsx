
import { MessageSquare, Palette, Users } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      icon: MessageSquare,
      title: "Start Chatting",
      description: "Browse our collection of AI characters or jump right into a conversation. No account required to get started."
    },
    {
      number: 2,
      icon: Palette,
      title: "Create Your Character",
      description: "Design unique AI personalities with custom traits, backgrounds, and speaking styles that match your vision."
    },
    {
      number: 3,
      icon: Users,
      title: "Join the Community",
      description: "Share your creations, discover amazing characters from other users, and connect with fellow creators."
    }
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get Started in 3 Simple Steps
          </h2>
        </div>

        {/* Steps Container */}
        <div className="relative">
          {/* Desktop: Horizontal Layout with Connection Line */}
          <div className="hidden md:block">
            {/* Connection Line */}
            <div className="absolute top-16 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-200 via-blue-300 to-blue-200 opacity-60">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-50 animate-pulse"></div>
            </div>
            
            {/* Steps Grid */}
            <div className="grid grid-cols-3 gap-6 sm:gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Step Number Circle */}
                  <div className="relative mb-4 sm:mb-6 flex justify-center">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white border-3 sm:border-4 border-blue-200 rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <span className="text-lg sm:text-xl font-bold text-blue-600">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl flex items-center justify-center">
                      <step.icon className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Vertical Layout */}
          <div className="md:hidden">
            <div className="space-y-8 sm:space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 sm:gap-6">
                  {/* Left Column - Step Number and Line */}
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white border-3 border-blue-200 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-base sm:text-lg font-bold text-blue-600">{step.number}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-12 sm:h-16 bg-gradient-to-b from-blue-200 to-blue-100 mt-4"></div>
                    )}
                  </div>

                  {/* Right Column - Content */}
                  <div className="flex-1 pt-1">
                    {/* Icon */}
                    <div className="mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <step.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
