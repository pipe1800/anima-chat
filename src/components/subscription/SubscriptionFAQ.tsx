
import React from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const SubscriptionFAQ = () => {
  const faqItems = [
    {
      id: "billing",
      question: "How does billing work?",
      answer: "You'll be charged monthly on the same date you signed up. All payments are processed securely through Stripe. You can view your billing history and download invoices from your account settings at any time."
    },
    {
      id: "cancel",
      question: "Can I cancel my subscription anytime?",
      answer: "Absolutely! You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you won't be charged again."
    },
    {
      id: "upgrade-downgrade",
      question: "Can I upgrade or downgrade my plan?",
      answer: "Yes, you can change your plan at any time. When upgrading, you'll be charged the prorated difference immediately. When downgrading, the change takes effect at your next billing cycle."
    },
    {
      id: "refund",
      question: "What's your refund policy?",
      answer: "We offer a 14-day money-back guarantee on all subscriptions. If you're not satisfied within the first 14 days, contact our support team for a full refund, no questions asked."
    },
    {
      id: "data-retention",
      question: "What happens to my data if I cancel?",
      answer: "Your characters and chat history remain accessible for 30 days after cancellation. This gives you time to export anything important or reactivate your subscription if you change your mind."
    },
    {
      id: "payment-methods",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and various local payment methods depending on your region. All transactions are secured with bank-level encryption."
    },
    {
      id: "business",
      question: "Do you offer business or team plans?",
      answer: "Currently, our plans are designed for individual users. However, we're working on team and enterprise solutions. Contact us if you're interested in a business plan, and we'll keep you updated on availability."
    },
    {
      id: "student-discount",
      question: "Do you offer student discounts?",
      answer: "We don't currently offer student discounts, but we occasionally run promotional campaigns. Follow us on social media or subscribe to our newsletter to be the first to know about special offers."
    }
  ];

  return (
    <section className="py-16 px-4 sm:px-6 border-t border-gray-700/30">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Subscription Questions?
          </h2>
          <p className="text-lg text-gray-300">
            Everything you need to know about billing, plans, and your subscription.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem 
              key={item.id} 
              value={item.id}
              className="border-b border-gray-700/50 last:border-b-0"
            >
              <AccordionTrigger className="text-left py-6 hover:no-underline [&[data-state=open]>svg]:text-[#FF7A00] [&>svg]:text-[#FF7A00]">
                <span className="text-lg font-semibold text-white pr-4">
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-gray-300 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Contact Support CTA */}
        <div className="text-center mt-12 pt-8 border-t border-gray-700/30">
          <p className="text-gray-300 mb-4">
            Still have questions? We're here to help.
          </p>
          <a 
            href="mailto:support@example.com" 
            className="inline-flex items-center px-6 py-3 bg-[#FF7A00] text-white font-semibold rounded-lg hover:bg-[#FF7A00]/90 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </section>
  );
};
