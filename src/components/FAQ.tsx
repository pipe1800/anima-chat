
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqItems = [
    {
      id: "item-1",
      question: "Is my payment information secure?",
      answer: "Absolutely. We use industry-standard SSL encryption for all transactions, and we never store your credit card details on our servers. Your security is our top priority."
    },
    {
      id: "item-2", 
      question: "What is your refund policy?",
      answer: "We offer a 30-day, no-questions-asked money-back guarantee. If you're not completely satisfied with your purchase, simply contact us within 30 days for a full refund."
    },
    {
      id: "item-3",
      question: "How do I get started?",
      answer: "Getting started is simple! You can begin chatting with our AI characters immediately without creating an account. To access advanced features and create your own characters, simply sign up for free."
    },
    {
      id: "item-4",
      question: "Can I create multiple AI characters?",
      answer: "Yes! Our platform allows you to create and customize multiple AI characters with unique personalities, backgrounds, and conversation styles. Each character can be tailored to your specific needs."
    },
    {
      id: "item-5",
      question: "Is there a free trial available?",
      answer: "You can start using our basic features for free right away. For premium features, we offer a 7-day free trial with no credit card required. Experience everything our platform has to offer risk-free."
    }
  ];

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Have Questions? We Have Answers.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to the most common questions about our AI character platform.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={item.id}
              className="border-b border-gray-200 last:border-b-0"
            >
              <AccordionTrigger className="text-left py-6 hover:no-underline">
                <span className="text-lg font-bold text-gray-900 pr-4">
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-700 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
