import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Quote, ShieldCheck, MapPin, ChevronLeft, ChevronRight, Sparkles, HeartHandshake, Gem, Truck } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Aanya Sharma",
    location: "Mumbai, Maharashtra",
    rating: 5,
    highlight: "Exceptional Craftsmanship",
    text: "The craftsmanship of the temple jacket I received is simply breathtaking. Every intricate detail reflects true artistry. It made my wedding day absolutely perfect, and the quality is exactly as promised. Highly recommend Milaya for anyone looking for authentic heritage pieces.",
    verified: true,
    avatar: "AS",
    icon: <Gem className="w-4 h-4 text-[#B8934E]" />
  },
  {
    id: 2,
    name: "Priya Desai",
    location: "Ahmedabad, Gujarat",
    rating: 5,
    highlight: "Secure & Timely Delivery",
    text: "I was hesitant to buy luxury clothing online, but their secure delivery process and constant updates put me at ease. The dress arrived in pristine condition in a beautiful velvet box.",
    verified: true,
    avatar: "PD",
    icon: <Truck className="w-4 h-4 text-[#B8934E]" />
  },
  {
    id: 3,
    name: "Kavya Reddy",
    location: "Hyderabad, Telangana",
    rating: 5,
    highlight: "Outstanding Customer Support",
    text: "Their team guided me through the custom design process for my bridal set with so much patience and expertise. The final product exceeded all my expectations. Truly a trusted shopping experience.",
    verified: true,
    avatar: "KR",
    icon: <HeartHandshake className="w-4 h-4 text-[#B8934E]" />
  },
  {
    id: 4,
    name: "Meera Iyer",
    location: "Chennai, Tamil Nadu",
    rating: 5,
    highlight: "Authentic Quality",
    text: "The antique finish on the bangles is gorgeous. You can tell they pay attention to the finest details. It feels like wearing a piece of history. Exceptional quality and fast shipping.",
    verified: true,
    avatar: "MI",
    icon: <ShieldCheck className="w-4 h-4 text-[#B8934E]" />
  }
];

const stats = [
  { value: "50,000+", label: "Happy Customers" },
  { value: "4.9/5", label: "Average Rating" },
  { value: "98%", label: "Verified Reviews" },
  { value: "Pan-India", label: "Nationwide Reach" }
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 35 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 70, damping: 18 }
  }
};

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % testimonials.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const renderStars = () => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-[#B8934E] text-[#B8934E]" />
      ))}
    </div>
  );

  return (
    <section className="relative w-full py-20 sm:py-24 lg:py-32 overflow-hidden bg-[#FAF9F6] font-sans selection:bg-[#800000]/20">
      {/* Dynamic Animated Background Motifs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div 
          animate={{ scale: [1, 1.08, 1], rotate: [0, 6, 0], x: [0, 15, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] left-[-15%] w-[600px] h-[600px] bg-[#DDA7A5] rounded-full mix-blend-multiply filter blur-[150px] opacity-10"
        />
        <motion.div 
          animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 0], y: [0, 20, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] bg-[#B8934E] rounded-full mix-blend-multiply filter blur-[150px] opacity-10"
        />
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto mb-16 lg:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#B8934E]"></div>
            <Sparkles className="w-5 h-5 text-[#B8934E] animate-pulse" />
            <div className="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#B8934E]"></div>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#2D0D18] mb-6 leading-[1.2]">
            What Our <span className="italic text-[#800000]">Customers Say</span>
          </h2>
          <p className="text-[#5C1A1B] font-light text-[15px] sm:text-[17px] leading-relaxed opacity-85 px-4 tracking-wide">
            Trusted by clothing lovers across India for exceptional craftsmanship, authentic quality, and memorable shopping experiences.
          </p>
        </motion.div>

        {/* Desktop & Tablet Layout (Hidden on Mobile) */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 mb-24">
          
          {/* Featured Masterpiece Testimonial */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            whileHover={{ y: -6, scale: 1.01 }}
            className="lg:col-span-5 relative group cursor-pointer"
          >
            <div className="h-full rounded-[2.5rem] bg-[#4A0A18] p-10 lg:p-14 shadow-[0_20px_50px_rgba(74,10,24,0.15)] group-hover:shadow-[0_30px_60px_rgba(184,147,78,0.2)] relative overflow-hidden flex flex-col justify-between transition-all duration-500 border border-white/5 group-hover:border-[#B8934E]/30">
              {/* Internal subtle overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#5C1A1B] to-[#3B0000] opacity-85 pointer-events-none transition-opacity duration-500 group-hover:opacity-90"></div>

              
              <Quote className="absolute top-10 right-10 w-32 h-32 text-[#B8934E]/10 rotate-12 transition-all duration-700 group-hover:rotate-[20deg] group-hover:scale-110 pointer-events-none" />
              
              <div className="relative z-10 mb-10">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 mb-8 bg-white/10 w-fit px-5 py-2.5 rounded-full border border-white/10 backdrop-blur-sm transition-colors duration-300 group-hover:bg-[#B8934E]/20"
                >
                  {testimonials[0].icon}
                  <span className="text-xs sm:text-[13px] font-bold tracking-[0.15em] text-[#B8934E] uppercase">{testimonials[0].highlight}</span>
                </motion.div>
                {renderStars()}
                <p className="text-[#FAF9F6] mt-8 font-serif text-[19px] lg:text-[22px] leading-[1.8] italic group-hover:text-white transition-colors duration-300">
                  "{testimonials[0].text}"
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between mt-auto pt-8 border-t border-[#FAF9F6]/10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#B8934E] to-[#D4AF37] p-[2px] transition-transform duration-500 group-hover:rotate-12">
                    <div className="w-full h-full rounded-full bg-[#3B0000] flex items-center justify-center border-2 border-[#5C1A1B]">
                      <span className="text-white font-serif text-2xl tracking-widest">{testimonials[0].avatar}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-serif text-xl tracking-wide">{testimonials[0].name}</h4>
                    <div className="flex items-center gap-2 text-white/70 text-[13px] mt-1 font-light tracking-wide">
                      <MapPin className="w-3.5 h-3.5 text-[#DDA7A5]" />
                      {testimonials[0].location}
                    </div>
                  </div>
                </div>
                {testimonials[0].verified && (
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <ShieldCheck className="w-6 h-6 text-[#4ADE80] animate-pulse" />
                    <span className="text-[9px] uppercase tracking-[0.2em] text-[#4ADE80] font-bold">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Supporting Grid with Staggered Entrance */}
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 relative"
          >
            {testimonials.slice(1).map((testi) => (
              <motion.div 
                key={testi.id}
                variants={cardVariant}
                whileHover={{ y: -6, scale: 1.02 }}
                className="bg-white rounded-[2rem] p-8 shadow-[0_10px_30px_rgba(0,0,0,0.02)] border border-[#800000]/5 flex flex-col justify-between transition-all duration-500 hover:border-[#B8934E]/40 hover:shadow-[0_20px_40px_rgba(184,147,78,0.1)] group relative overflow-hidden cursor-pointer"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#F8D7E5]/30 to-transparent rounded-bl-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    {renderStars()}
                    <Quote className="w-6 h-6 text-[#B8934E]/10 transition-transform duration-700 group-hover:scale-120 group-hover:rotate-12" />
                  </div>
                  <h5 className="text-[#800000] font-semibold text-[15px] mb-4 flex items-center gap-2.5 group-hover:text-[#B8934E] transition-colors duration-300">
                    {testi.icon}
                    <span className="tracking-wide">{testi.highlight}</span>
                  </h5>
                  <p className="text-[#4A4A4A] text-[15px] leading-[1.8] font-light mb-8 group-hover:text-black transition-colors duration-300">
                    "{testi.text}"
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 pt-5 border-t border-[#800000]/5 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-[#FAF9F6] border border-[#B8934E]/20 flex items-center justify-center shadow-sm transition-all duration-500 group-hover:bg-[#B8934E]/10 group-hover:border-[#B8934E]/40">
                    <span className="text-[#800000] font-serif text-base tracking-wider">{testi.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[#2D0D18] font-serif text-[17px] leading-tight flex items-center gap-2 group-hover:text-[#800000] transition-colors duration-300">
                      {testi.name}
                      {testi.verified && <ShieldCheck className="w-4 h-4 text-[#4ADE80]" title="Verified Purchase" />}
                    </h4>
                    <span className="text-[#5C1A1B]/60 text-xs block mt-1 tracking-wide font-light">{testi.location}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>

        {/* Mobile Swipeable Carousel */}
        <div className="md:hidden relative mb-20">
           <div className="overflow-hidden relative rounded-3xl shadow-xl bg-white border border-[#800000]/10">
             <AnimatePresence mode="wait">
               <motion.div
                 key={activeIndex}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 transition={{ duration: 0.3, ease: "easeInOut" }}
                 className="p-8 sm:p-10"
               >
                 <div className="flex items-center gap-3 mb-6 bg-[#FAF9F6] w-fit px-4 py-2 rounded-full border border-[#B8934E]/20">
                   {testimonials[activeIndex].icon}
                   <span className="text-[12px] font-bold tracking-widest text-[#800000] uppercase">
                     {testimonials[activeIndex].highlight}
                   </span>
                 </div>
                 
                 {renderStars()}
                 
                 <p className="text-[#2D0D18] mt-6 font-serif text-[18px] sm:text-[20px] font-medium leading-[1.8] italic mb-8">
                   "{testimonials[activeIndex].text}"
                 </p>

                 <div className="flex items-center justify-between pt-6 border-t border-[#800000]/10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border border-[#B8934E]/30 flex items-center justify-center shadow-inner">
                        <span className="text-[#800000] font-serif text-xl font-bold tracking-widest">{testimonials[activeIndex].avatar}</span>
                      </div>
                      <div>
                        <h4 className="text-[#2D0D18] font-serif text-[20px] font-bold flex items-center gap-2">
                          {testimonials[activeIndex].name}
                          {testimonials[activeIndex].verified && <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />}
                        </h4>
                        <span className="text-[#5C1A1B]/80 text-[13px] mt-1 block tracking-wide font-medium">{testimonials[activeIndex].location}</span>
                      </div>
                    </div>
                 </div>
               </motion.div>
             </AnimatePresence>
           </div>
           
           {/* Mobile Controls */}
           <div className="flex justify-center gap-6 mt-8">
             <button onClick={handlePrev} className="w-14 h-14 rounded-full border-2 border-[#B8934E]/30 flex items-center justify-center text-[#800000] hover:bg-[#800000] hover:text-white transition-colors bg-white shadow-md active:scale-95">
               <ChevronLeft className="w-7 h-7" />
             </button>
             <button onClick={handleNext} className="w-14 h-14 rounded-full border-2 border-[#B8934E]/30 flex items-center justify-center text-[#800000] hover:bg-[#800000] hover:text-white transition-colors bg-white shadow-md active:scale-95">
               <ChevronRight className="w-7 h-7" />
             </button>
           </div>
        </div>

        {/* Trust Stats Bottom Bar */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="bg-white rounded-3xl border border-[#B8934E]/15 p-8 sm:p-12 shadow-xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-10 md:divide-x divide-[#B8934E]/15 relative z-10">
            {stats.map((stat, idx) => (
              <motion.div 
                key={idx} 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 60, damping: 15 } }
                }}
                whileHover={{ y: -4, scale: 1.05 }}
                className="flex flex-col items-center justify-center text-center px-4 cursor-pointer group/stat transition-all duration-500"
              >
                <span className="text-[34px] sm:text-[40px] lg:text-5xl font-serif font-bold text-[#5C1A1B] mb-2 tracking-tight group-hover/stat:text-[#B8934E] transition-colors duration-300">{stat.value}</span>
                <span className="text-[12px] sm:text-[13px] uppercase tracking-widest font-bold text-[#B8934E] group-hover/stat:text-[#5C1A1B] transition-colors duration-300">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
