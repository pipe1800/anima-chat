
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
        <div className="grid md:grid-cols-3 gap-12 md:gap-8">
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
      </div>
    </section>
  );
};

export default ValueProposition;
