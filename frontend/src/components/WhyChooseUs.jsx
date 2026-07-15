import React from 'react';
import { motion } from 'motion/react';
import { Gem, Award, Truck, ShieldCheck, RefreshCcw, Users, CheckCircle2, Star, Sparkles } from 'lucide-react';

const features = [
  {
    id: 1,
    title: "Premium Craftsmanship",
    desc: "Expertly handcrafted clothing created with exceptional attention to detail, precision, and timeless elegance.",
    icon: <Gem className="w-10 h-10 text-[#5C1A1B] stroke-[1.2] group-hover:text-[#F8D7E5] transition-colors duration-500" />
  },
  {
    id: 2,
    title: "Certified & Authentic",
    desc: "Every piece meets strict quality standards and is crafted using genuine materials for complete confidence.",
    icon: <Award className="w-10 h-10 text-[#5C1A1B] stroke-[1.2] group-hover:text-[#F8D7E5] transition-colors duration-500" />
  },
  {
    id: 3,
    title: "Secure Pan-India Delivery",
    desc: "Fast, insured, and carefully packaged shipping to ensure your clothing arrives safely and beautifully.",
    icon: <Truck className="w-10 h-10 text-[#5C1A1B] stroke-[1.2] group-hover:text-[#F8D7E5] transition-colors duration-500" />
  },
  {
    id: 4,
    title: "Safe & Secure Payments",
    desc: "Advanced encryption and trusted payment gateways provide a seamless and protected shopping experience.",
    icon: <ShieldCheck className="w-10 h-10 text-[#5C1A1B] stroke-[1.2] group-hover:text-[#F8D7E5] transition-colors duration-500" />
  },
  {
    id: 5,
    title: "Easy Returns & Exchange",
    desc: "Flexible return and exchange policies designed to give customers complete peace of mind.",
    icon: <RefreshCcw className="w-10 h-10 text-[#5C1A1B] stroke-[1.2] group-hover:text-[#F8D7E5] transition-colors duration-500" />
  },
  {
    id: 6,
    title: "Trusted by Thousands",
    desc: "A growing community of satisfied customers who value our quality, service, and commitment to excellence.",
    icon: <Users className="w-10 h-10 text-[#5C1A1B] stroke-[1.2] group-hover:text-[#F8D7E5] transition-colors duration-500" />
  }
];

const trustBadges = [
  { text: "Verified Customers", icon: <Star /> },
  { text: "Secure Checkout", icon: <ShieldCheck /> },
  { text: "Authentic Clothing", icon: <Award /> },
  { text: "Nationwide Delivery", icon: <Truck /> },
  { text: "100% Satisfaction", icon: <Sparkles /> }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
  }
};

export function WhyChooseUs() {
  return (
    <section className="relative w-full py-24 lg:py-32 bg-white font-sans selection:bg-[#F8D7E5]/50 overflow-hidden">
      
      {/* Ultra-Minimal Background Element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#F8D7E5] rounded-full mix-blend-multiply filter blur-[200px] opacity-[0.15] pointer-events-none"></div>

      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Minimal Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-20 lg:mb-28"
        >
          <span className="block text-[#DDA7A5] text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em] mb-6">
            The Milaya Promise
          </span>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#2D0D18] mb-8 leading-[1.1] tracking-tight">
            Why Choose <span className="italic text-[#DDA7A5]">Us</span>
          </h2>
          <p className="text-[#5C1A1B]/70 font-light text-[15px] sm:text-[16px] leading-[1.8] px-4">
            Experience exceptional craftsmanship, certified authenticity, and premium service designed to make every clothing purchase memorable and trustworthy.
          </p>
        </motion.div>

        {/* Minimal Premium Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 mt-10"
        >
          {features.map((feature) => (
            <motion.div 
              key={feature.id}
              variants={cardVariants}
              className="group relative bg-[#FAF9F6] border border-[#800000]/5 rounded-3xl p-8 lg:p-12 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:bg-[#4A0A18] hover:shadow-[0_30px_60px_rgba(74,10,24,0.15)] flex flex-col"
            >
              <div className="mb-8 lg:mb-10">
                 {feature.icon}
              </div>
              
              <h3 className="font-serif text-[26px] lg:text-[28px] font-bold text-[#2D0D18] mb-4 group-hover:text-[#F8D7E5] transition-colors duration-500">
                {feature.title}
              </h3>
              
              <p className="font-medium text-[#5C1A1B]/80 text-[14px] lg:text-[15px] leading-relaxed group-hover:text-[#F8D7E5]/90 transition-colors duration-500">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap lg:justify-center lg:items-center gap-y-10 gap-x-4 pt-16 lg:pt-24 mt-8 lg:mt-12 border-t border-[#800000]/10 w-full"
        >
           {trustBadges.map((badge, idx) => (
             <React.Fragment key={idx}>
               <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-4 lg:gap-4 px-2 lg:px-8 group cursor-default text-center sm:text-left">
                 <div className="flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10 rounded-full bg-[#FAF9F6] border border-[#800000]/10 group-hover:bg-[#4A0A18] group-hover:border-[#4A0A18] group-hover:scale-110 shadow-sm transition-all duration-500">
                   {React.cloneElement(badge.icon, { className: "w-[20px] h-[20px] lg:w-[18px] lg:h-[18px] text-[#800000] group-hover:text-[#F8D7E5] stroke-[1.5] transition-colors duration-500" })}
                 </div>
                 <span className="text-[#5C1A1B] font-bold text-[10px] lg:text-[11px] tracking-widest uppercase group-hover:text-[#2D0D18] transition-colors duration-300">
                   {badge.text}
                 </span>
               </div>
               
               {/* Elegant Gradient Divider for Desktop */}
               {idx < trustBadges.length - 1 && (
                 <div className="hidden lg:block w-[1px] h-10 bg-gradient-to-b from-transparent via-[#800000]/20 to-transparent"></div>
               )}
             </React.Fragment>
           ))}
        </motion.div>

      </div>
    </section>
  );
}
