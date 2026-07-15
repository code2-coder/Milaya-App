import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';
import { Truck, ShieldCheck, Clock, RefreshCcw, HandPlatter, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import { useSEO } from '../hooks/useSEO';

const iconMap = {
  Truck,
  ShieldCheck,
  Clock,
  RefreshCcw,
  HandPlatter,
  AlertCircle
};

// Fallback default content
const DEFAULT_CONTENT = {
  title: "Shipping Policy",
  subtitle: "Everything you need to know about our secure, insured delivery process.",
  highlights: [
    { title: "Free Delivery", content: "Complimentary Pan-India shipping on all orders above ₹10,000.", iconName: "Truck" },
    { title: "100% Insured", content: "Every shipment is fully insured until it reaches your hands securely.", iconName: "ShieldCheck" },
    { title: "Delivery Time", content: "Standard pieces arrive in 3-5 days. Custom orders take 10-15 days.", iconName: "Clock" }
  ],
  sections: [
    { title: "Order Processing", content: "All orders are processed within 24 to 48 hours (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped, containing tracking information." },
    { title: "Packaging Security", content: "We take the utmost care in packaging your clothing. Each piece is placed in our signature luxury box, which is then securely sealed in tamper-proof packaging. We strongly advise you not to accept any package that appears to have been tampered with." },
    { title: "International Shipping", content: "Currently, we proudly serve customers across India and Australia. International shipping to Australia carries a flat processing fee, and delivery timelines may vary based on customs processing. Customers are responsible for any local import duties or taxes." }
  ]
};

export function ShippingPolicy() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  useSEO(content.title, content.subtitle);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await api.get("/pages/shipping-policy");
        if (data.success && data.page) {
          setContent(data.page);
        }
      } catch (error) {
        console.warn("Failed to fetch shipping-policy from API, using default content.", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6]">
      <Header />
      
      <main className="flex-1 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full pt-[160px] lg:pt-[180px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-serif text-[#0A0204] mb-4">{content.title}</h1>
          {content.subtitle && (
            <p className="text-[#5C1A1B]/70 font-light max-w-2xl mx-auto">
              {content.subtitle}
            </p>
          )}
        </motion.div>

        {content.highlights && content.highlights.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {content.highlights.map((item, idx) => {
              const Icon = iconMap[item.iconName] || Truck;
              return (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-[#B8934E]/20 text-center shadow-sm">
                  <Icon className="w-8 h-8 text-[#B8934E] mx-auto mb-4" />
                  <h3 className="font-serif text-lg text-[#0A0204] mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500 font-light">{item.content}</p>
                </div>
              );
            })}
          </div>
        )}

        {content.sections && content.sections.length > 0 && (
          <div className="bg-white rounded-3xl p-8 md:p-12 border border-[#B8934E]/20 shadow-sm prose prose-stone max-w-none">
            {content.sections.map((sec, idx) => (
              <React.Fragment key={idx}>
                <h2 className="font-serif text-2xl text-[#0A0204] mb-4">{sec.title}</h2>
                <p className="text-gray-600 font-light mb-8 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </p>
              </React.Fragment>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
