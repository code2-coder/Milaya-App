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
  title: "Return & Exchange",
  subtitle: "Our commitment to your complete satisfaction and peace of mind.",
  highlights: [
    { title: "7-Day Returns", content: "Eligible items can be returned within 7 days of delivery.", iconName: "RefreshCcw" },
    { title: "Lifetime Exchange", content: "Upgrade your clothing anytime with our lifetime exchange policy.", iconName: "HandPlatter" },
    { title: "Non-Returnable", content: "Customized and engraved pieces cannot be returned or exchanged.", iconName: "AlertCircle" }
  ],
  sections: [
    { title: "How to Initiate a Return", content: "To initiate a return or exchange, please contact our support team at info@milaya.com within 7 days of receiving your order. We will arrange a complimentary secure pickup from your address. The item must be unused, in its original condition, and accompanied by the original invoice and Certificate of Authenticity." },
    { title: "Quality Inspection", content: "Upon receiving the returned item, our master craftsmen will conduct a thorough quality check. Once the item is verified to be in its original condition without any damage or alteration, we will process your refund or exchange within 3-5 business days." },
    { title: "Lifetime Exchange Value", content: "We value your investment. Under our Lifetime Exchange Policy, you can exchange your Milaya clothing for a new piece at 100% of the current prevailing market value of the metal and 80% of the apparel value, subject to our assessment." }
  ]
};

export function ReturnPolicy() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  useSEO(content.title, content.subtitle);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await api.get("/pages/return-policy");
        if (data.success && data.page) {
          setContent(data.page);
        }
      } catch (error) {
        console.warn("Failed to fetch return-policy from API, using default content.", error);
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
              const Icon = iconMap[item.iconName] || RefreshCcw;
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
