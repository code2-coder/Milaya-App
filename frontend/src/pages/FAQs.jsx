import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "Do you provide certificates of authenticity?",
    answer: "Yes, every piece of clothing purchased from Milaya comes with a detailed Certificate of Authenticity and quality assurance guarantee."
  },
  {
    question: "How long does delivery take?",
    answer: "Pan India deliveries typically take 3-5 business days for standard items. For custom or handcrafted heritage pieces, please allow 10-15 business days."
  },
  {
    question: "Can I track my order?",
    answer: "Absolutely. Once your order is dispatched, you will receive a tracking link via email and SMS to monitor your delivery status in real-time."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we offer shipping within India and Australia. We are actively working on expanding our delivery network globally."
  },
  {
    question: "What is your return policy?",
    answer: "We offer a 7-day return policy on standard items in their original condition. Please note that custom-made or personalized clothing cannot be returned."
  }
];

export function FAQs() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />
      
      <main className="flex-1 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto pt-[160px] lg:pt-[180px] w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-[#0A0204] mb-4">Frequently Asked Questions</h1>
          <p className="text-[#5C1A1B]/70 font-light max-w-2xl mx-auto">
            Find answers to common questions about our clothing, shipping, and services.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="bg-white rounded-2xl border border-[#B8934E]/20 overflow-hidden shadow-sm"
            >
              <button 
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors"
              >
                <span className="font-serif text-[#0A0204] text-lg">{faq.question}</span>
                {openIndex === index ? (
                  <Minus className="w-5 h-5 text-[#B8934E] shrink-0" />
                ) : (
                  <Plus className="w-5 h-5 text-[#B8934E] shrink-0" />
                )}
              </button>
              
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? "max-h-40 pb-5 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-gray-600 font-light leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
