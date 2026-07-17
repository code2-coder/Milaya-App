import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Mail, Check, ArrowRight } from 'lucide-react';

export function Newsletter() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setEmail('');
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1500);
  };

  return (
    <section className="relative w-full py-12 sm:py-16 lg:py-20 overflow-hidden bg-[#FAF9F6] flex items-center justify-center font-sans">
      {/* Background Decor - Extremely subtle maroon & premium gradients on light background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#800000] rounded-full mix-blend-multiply filter blur-[150px] opacity-10"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#B8934E] rounded-full mix-blend-multiply filter blur-[150px] opacity-10"></div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        {/* Premium Card Container - Maroon themed */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-[#800000] via-[#5C0000] to-[#3B0000] shadow-[0_20px_50px_rgba(128,0,0,0.25)] flex flex-col lg:flex-row group"
        >
          {/* Subtle lotus overlay for richness */}

          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#800000]/60 pointer-events-none z-0"></div>

          {/* Left: Editorial Image Full Cover */}
          <div className="w-full lg:w-5/12 relative h-[18rem] sm:h-[22rem] lg:h-auto flex items-center justify-center p-0 lg:p-0 bg-black/10 z-10 overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-t from-[#3B0000]/80 via-transparent to-transparent pointer-events-none lg:bg-gradient-to-r lg:from-transparent lg:to-[#4A0000]/80 z-10"></div>
             <img 
               src="/luxury_clothing_model.jpeg" 
               alt="Luxury Clothing Collection" 
               className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000"
             />
             <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.4)] pointer-events-none"></div>
             
             {/* Floating sparkles */}
             <div className="absolute top-1/4 left-6 text-[#B8934E] animate-[pulse_3s_infinite] z-20 drop-shadow-md">
               <Sparkles className="w-6 h-6" />
             </div>
             <div className="absolute bottom-1/3 right-8 text-[#DDA7A5] animate-[pulse_4s_infinite] delay-500 z-20 drop-shadow-md">
               <Sparkles className="w-5 h-5" />
             </div>
          </div>

          {/* Right: Typography and Form */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center p-8 sm:p-10 lg:p-14 relative z-10 text-white">
            
             {/* Logo & Branding - Made prominently larger and framed beautifully */}
             <div className="flex flex-col items-center lg:items-start mb-6 w-full">

               <div className="flex items-center gap-4 w-full justify-center lg:justify-start">
                 <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-[#B8934E]"></div>
                 <h3 className="text-[#B8934E] font-serif text-lg sm:text-xl lg:text-2xl tracking-[0.25em] uppercase opacity-95 drop-shadow-sm text-center">
                   Milaya
                 </h3>
                 <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-[#B8934E]"></div>
               </div>
             </div>

             {/* Heading */}
             <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif mb-4 leading-tight text-center lg:text-left drop-shadow-lg">
               Stay Connected <span className="italic font-light text-[#DDA7A5]">with Elegance</span>
             </h2>

             <p className="text-[#F8D7E5] font-light text-[13px] sm:text-[15px] leading-relaxed mb-6 max-w-[28rem] mx-auto lg:mx-0 text-center lg:text-left opacity-90">
               Subscribe to receive exclusive launches, styling inspiration, early-access collections, and special offers delivered directly to your inbox.
             </p>

             {/* Benefits Grid */}
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4 mb-6 max-w-[28rem] mx-auto lg:mx-0 w-full">
               {[
                 'Early access collections',
                 'Exclusive special offers',
                 'Luxury styling inspiration',
                 'New festive launches'
               ].map((benefit, i) => (
                 <div key={i} className="flex items-center gap-3 group/benefit">
                   <div className="w-4 h-4 rounded-full border border-[#B8934E]/40 flex items-center justify-center bg-white/5 group-hover/benefit:bg-[#B8934E]/20 group-hover/benefit:border-[#B8934E] transition-all shadow-inner shrink-0">
                     <Check className="w-2.5 h-2.5 text-[#B8934E]" />
                   </div>
                   <span className="font-medium text-[11px] sm:text-xs text-white/85 tracking-wide">{benefit}</span>
                 </div>
               ))}
             </div>

             {/* Form */}
             <form onSubmit={handleSubmit} className="relative w-full max-w-[28rem] mx-auto lg:mx-0 mb-5">
               <div className={`relative flex items-center transition-all duration-500 rounded-full bg-white/10 backdrop-blur-md border ${isFocused ? 'border-[#B8934E] shadow-[0_0_25px_rgba(184,147,78,0.3)]' : 'border-white/20 hover:border-[#B8934E]/50 hover:bg-white/15'}`}>
                 <div className="pl-5 text-[#B8934E] transition-transform duration-300 transform group-focus-within:scale-110">
                   <Mail className="w-4 h-4" />
                 </div>
                 <input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   onFocus={() => setIsFocused(true)}
                   onBlur={() => setIsFocused(false)}
                   placeholder="Enter your email address" 
                   required
                   className="w-full bg-transparent text-white placeholder-white/50 text-[13px] sm:text-sm py-3.5 lg:py-4 pl-3 pr-2 outline-none font-light tracking-wide min-w-0"
                 />
                 <div className="pr-1.5 shrink-0">
                   <button 
                     type="submit"
                     disabled={isSubmitting || isSuccess}
                     className={`relative h-10 sm:h-11 lg:h-12 px-6 sm:px-8 rounded-full font-semibold text-[10px] sm:text-[11px] uppercase tracking-widest transition-all duration-500 overflow-hidden flex items-center justify-center shadow-lg min-w-[120px] lg:min-w-[140px] ${isSuccess ? 'bg-green-600 text-white shadow-green-600/40' : 'bg-gradient-to-r from-[#B8934E] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B8934E] text-white hover:shadow-[0_0_20px_rgba(184,147,78,0.5)] transform hover:-translate-y-0.5'}`}
                   >
                     <span className={`relative z-10 flex items-center gap-2 transition-opacity duration-300 ${isSubmitting ? 'opacity-0' : 'opacity-100'}`}>
                       {isSuccess ? 'Subscribed' : 'Subscribe Now'}
                       {!isSuccess && <ArrowRight className="w-3.5 h-3.5" />}
                     </span>
                     
                     {/* Loading Spinner */}
                     {isSubmitting && (
                       <div className="absolute inset-0 flex items-center justify-center">
                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                       </div>
                     )}
                   </button>
                 </div>
               </div>
             </form>

             {/* Trust Text */}
             <p className="text-white/40 text-[11px] sm:text-xs font-light text-center lg:text-left max-w-[28rem] mx-auto lg:mx-0 tracking-wide">
               Join thousands of clothing enthusiasts receiving exclusive updates and luxury style inspiration.
             </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
