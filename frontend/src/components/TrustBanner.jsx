import React from 'react';
import { motion } from 'framer-motion';
import { Gem, Sparkles, ShieldCheck, RefreshCw, Gift, Crown } from 'lucide-react';

const trustCards = [
  {
    icon: Gem,
    title: "Authentic Clothing",
    description: "Crafted with genuine materials and verified quality standards."
  },
  {
    icon: Sparkles,
    title: "Premium Craftsmanship",
    description: "Expert artisans create timeless designs with exceptional attention to detail."
  },
  {
    icon: ShieldCheck,
    title: "Secure Transactions",
    description: "Advanced encryption and trusted payment gateways ensure safe purchases."
  },
  {
    icon: Gift,
    title: "Thoughtful Spiritual Gifts",
    description: "A meaningful gift for Janmashtami, housewarming ceremonies, weddings, and religious occasions."
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    description: "Hassle-free 14-day return and exchange policy for your peace of mind."
  },
  {
    icon: Crown,
    title: "Temple-Inspired Designs",
    description: "Inspired by centuries-old temple traditions, our collections reflect authentic Indian craftsmanship and divine elegance."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export function TrustBanner() {
  return (
    <section className="relative w-full py-20 lg:py-28 overflow-hidden bg-[#FFF5F5]">
      {/* Background Gradients & Patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF5F5] via-[#FFF0F0] to-[#FFEBEB] z-0"></div>
      
      {/* Subtle Maroon Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-[#800000]/[0.03] via-transparent to-transparent z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#800000]/[0.03] via-transparent to-transparent z-0"></div>

      {/* Decorative Lotus/Temple Motifs (Abstract CSS representation) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-10">
        <svg className="absolute top-10 left-10 w-32 h-32 text-[#800000] rotate-45" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C60 30 80 40 100 50 C80 60 60 70 50 100 C40 70 20 60 0 50 C20 40 40 30 50 0 Z" />
        </svg>
        <svg className="absolute bottom-10 right-10 w-40 h-40 text-[#B8934E] -rotate-12" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C60 30 80 40 100 50 C80 60 60 70 50 100 C40 70 20 60 0 50 C20 40 40 30 50 0 Z" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16 lg:mb-20"
        >
          <span className="text-[#800000] text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Our Promise</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-obsidian tracking-wide mb-6">
            Shop with <span className="italic text-[#800000] font-normal">Confidence</span>
          </h2>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-[#B8934E]/60"></div>
            <span className="text-[#B8934E] text-sm opacity-80">✧</span>
            <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-[#B8934E]/60"></div>
          </div>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed font-normal px-4">
            Every piece reflects our commitment to authenticity, craftsmanship, security, and customer satisfaction. Experience luxury without compromise.
          </p>
        </motion.div>

        {/* Trust Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {trustCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div 
                key={index}
                variants={itemVariants}
                className="group relative bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(128,0,0,0.08)] rounded-2xl p-8 sm:p-10 transition-all duration-500 overflow-hidden"
              >
                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#800000]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-[#FFF5F5] border border-[#800000]/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#800000] transition-all duration-500">
                  <Icon className="w-6 h-6 text-[#800000] group-hover:text-white transition-colors duration-500" strokeWidth={1.5} />
                </div>
                
                {/* Text Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-serif text-obsidian font-medium mb-3 group-hover:text-[#800000] transition-colors duration-300">
                    {card.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed font-normal">
                    {card.description}
                  </p>
                </div>
                
                {/* Decorative Accent Line */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#800000] to-[#B8934E] w-0 group-hover:w-full transition-all duration-700 ease-in-out"></div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
