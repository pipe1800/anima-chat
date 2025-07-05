
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
    <section className="py-20 px-6 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
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
            <div className="grid grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {/* Step Number Circle */}
                  <div className="relative mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-white border-4 border-blue-200 rounded-full flex items-center justify-center shadow-lg relative z-10">
                      <span className="text-xl font-bold text-blue-600">{step.number}</span>
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                      <step.icon className="w-7 h-7 text-blue-600" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Vertical Layout */}
          <div className="md:hidden">
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-6">
                  {/* Left Column - Step Number and Line */}
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-white border-3 border-blue-200 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-lg font-bold text-blue-600">{step.number}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-0.5 h-16 bg-gradient-to-b from-blue-200 to-blue-100 mt-4"></div>
                    )}
                  </div>

                  {/* Right Column - Content */}
                  <div className="flex-1 pt-1">
                    {/* Icon */}
                    <div className="mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <step.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 leading-relaxed">
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
