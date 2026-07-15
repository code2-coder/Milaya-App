import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useSEO } from "../hooks/useSEO";
import api from "../api/axios";

const DEFAULT_CONTENT = {
  title: "Terms of Service",
  subtitle: "Last Updated: 7/9/2026",
  sections: [
    {
      title: "1. Acceptance of Terms",
      content: "By accessing or using Milaya, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this site."
    },
    {
      title: "2. User Accounts",
      content: "When you create an account, you must provide accurate and complete information. You are solely responsible for the activity that occurs on your account and must keep your account password secure."
    },
    {
      title: "3. Products and Pricing",
      content: "All prices are subject to change without notice. We reserve the right to modify or discontinue any product at any time. We shall not be liable to you or any third party for any modification, price change, or discontinuance."
    },
    {
      title: "4. Returns and Refunds",
      content: "Please review our Return Policy for detailed information on returns and refunds. We reserve the right to refuse service to anyone for any reason at any time."
    }
  ]
};

export function TermsOfService() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  useSEO(content.title, "Read the Milaya terms of service.");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data } = await api.get("/pages/terms");
        if (data.success && data.page) {
          setContent(data.page);
        }
      } catch (error) {
        console.warn("Failed to fetch terms of service from API, using default content.", error);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <p className="mb-4 leading-relaxed whitespace-pre-line">{sec.content}</p>
            </React.Fragment>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
