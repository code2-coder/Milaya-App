import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { SEO } from "../components/SEO";
import api from "../api/axios";

const DEFAULT_CONTENT = {
  title: "Privacy Policy",
  subtitle: "Last Updated: 7/9/2026",
  sections: [
    {
      title: "1. Information We Collect",
      content: "We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes your name, email address, shipping address, phone number, and payment information."
    },
    {
      title: "2. How We Use Your Information",
      content: "We use the information we collect to process your orders, maintain your account, send you related information including order confirmations, and respond to your customer service requests."
    },
    {
      title: "3. Information Sharing",
      content: "We do not share your personal information with third parties except as necessary to process your payments and ship your orders (e.g., payment gateways and shipping carriers)."
    },
    {
      title: "4. Contact Us",
      content: "If you have any questions about this Privacy Policy, please contact us at support@milaya.in."
    }
  ]
};

export function PrivacyPolicy() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await api.get("/pages/privacy");
        if (data.success && data.page) {
          setContent(data.page);
        }
      } catch (error) {
        console.warn("Failed to fetch privacy policy from API, using default content.", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <SEO title={content.title} description={"Read the Milaya privacy policy."} />
      <Header />
      <main className="flex-grow max-w-4xl mx-auto px-4 pb-16 pt-[160px] lg:pt-[180px] w-full">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">{content.title}</h1>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 prose prose-emerald max-w-none text-gray-600">
          {content.subtitle && (
            <p className="mb-4 font-semibold text-emerald-600">{content.subtitle}</p>
          )}
          
          {content.sections && content.sections.map((sec, idx) => (
            <React.Fragment key={idx}>
              <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">{sec.title}</h2>
              {sec.content.includes("support@milaya.in") ? (
                <p className="mb-4 leading-relaxed whitespace-pre-line">
                  If you have any questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:support@milaya.in" className="text-emerald-600 hover:underline font-medium">
                    support@milaya.in
                  </a>.
                </p>
              ) : (
                <p className="mb-4 leading-relaxed whitespace-pre-line">{sec.content}</p>
              )}
            </React.Fragment>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
