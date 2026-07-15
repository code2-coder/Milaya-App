import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { toast } from "sonner";

export function ContactUs() {
  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Thank you for reaching out. Our team will get back to you shortly.");
    e.target.reset();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans selection:bg-[#B8934E]/30">
      <Header />

      <main className="pb-20 pt-[160px] lg:pt-[180px]">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto mb-16">
          <div className="text-center max-w-3xl mx-auto pt-16">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl lg:text-6xl font-serif text-obsidian tracking-wide mb-6"
            >
              Get in <span className="text-[#B8934E] italic">Touch</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 font-light leading-relaxed text-lg"
            >
              We are here to assist you with any inquiries regarding our collections, custom orders, or bespoke services.
            </motion.p>
          </div>
        </section>

        {/* Contact Section */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 mb-24">
          
          {/* Contact Form */}
          <motion.div 
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="bg-white p-8 md:p-12 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-gray-100"
          >
            <h2 className="text-2xl font-serif text-obsidian tracking-wide mb-8">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8934E]/30 focus:border-[#B8934E] transition-all"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8934E]/30 focus:border-[#B8934E] transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Message</label>
                <textarea 
                  required
                  rows="5"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#B8934E]/30 focus:border-[#B8934E] transition-all resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-4 bg-obsidian text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="flex flex-col justify-center space-y-12"
          >
            <div>
              <h2 className="text-3xl font-serif text-obsidian tracking-wide mb-8">Contact Information</h2>
              <p className="text-gray-600 font-light leading-relaxed mb-10">
                Prefer to speak with us directly? Reach out via phone or email, or visit our flagship boutique to experience our craftsmanship firsthand.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0 text-[#B8934E]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-obsidian uppercase tracking-widest mb-2">Visit Us</h4>
                  <p className="text-gray-600 font-light text-sm leading-relaxed">
                    Vrindavan, District Mathura,<br />
                    Uttar Pradesh, India 281121
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0 text-[#B8934E]">
                  <Phone className="w-5 h-5" />
                </div>
                 <div className="flex flex-col">
                  <h4 className="text-sm font-bold text-obsidian uppercase tracking-widest mb-2">Call Us</h4>
                  <a href="tel:+919152350955" className="text-gray-600 font-light text-sm hover:text-[#B8934E] transition-colors mb-1">
                    +91 91523 50955
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0 text-[#B8934E]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-obsidian uppercase tracking-widest mb-2">Email Us</h4>
                  <a href="mailto:info@milaya.com" className="text-gray-600 font-light text-sm hover:text-[#B8934E] transition-colors">
                    info@milaya.com
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

        </section>
      </main>

      <Footer />
    </div>
  );
}
