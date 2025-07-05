
import { MessageCircle, Sparkles, Users } from "lucide-react";

const ValueProposition = () => {
  const benefits = [
    {
      icon: MessageCircle,
      title: "Instant AI Conversations",
      description: "Chat with diverse AI personalities anytime, anywhere. Get instant responses and engage in meaningful conversations that adapt to your interests and mood."
    },
    {
      icon: Sparkles,
      title: "Create Custom Characters",
      description: "Design unique AI personalities with custom traits, backgrounds, and speaking styles. Bring your imagination to life with characters that truly reflect your vision."
    },
    {
      icon: Users,
      title: "Join a Creative Community",
      description: "Connect with thousands of creators and discover amazing characters. Share your creations, get inspired, and be part of a thriving community of AI enthusiasts."
    }
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our AI Characters?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience the future of AI interaction with powerful features designed for creators and conversation enthusiasts.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-12 md:gap-8 mb-20">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center group">
              {/* Icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                  <benefit.icon className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                {benefit.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Visual Demonstration Subsection */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              See It In Action
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Watch how easy it is to start a conversation with our AI characters. Simply type your message and get instant, personalized responses that adapt to the character's unique personality and your conversation style.
            </p>
          </div>

          {/* Right Column - Video Placeholder */}
          <div className="relative">
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                  <div className="w-0 h-0 border-l-[12px] border-l-gray-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
                </div>
                <p className="text-gray-500 font-medium">Demo Video</p>
                <p className="text-sm text-gray-400 mt-1">Interactive AI Chat Preview</p>
              </div>
            </div>
            
            {/* Optional: Add a subtle animation to make it more engaging */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse opacity-40"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueProposition;
