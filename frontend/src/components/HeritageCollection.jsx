import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, Crown } from 'lucide-react';
import { useNavigate } from 'react-router';

export function HeritageCollection() {
  const navigate = useNavigate();
  return (
    <section className="relative w-full py-24 lg:py-32 overflow-hidden bg-gradient-to-b from-[#0A0204] via-[#1A050A] to-[#2D0D18] font-sans selection:bg-[#B8934E]/20">
      
      {/* Museum Ambient Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-[#B8934E] rounded-full mix-blend-screen filter blur-[300px] opacity-[0.07]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[1000px] h-[1000px] bg-[#DDA7A5] rounded-full mix-blend-screen filter blur-[300px] opacity-[0.05]"></div>

      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-20 lg:mb-28"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#B8934E]"></div>
            <span className="text-[#B8934E] text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em]">Royal Indian Culture</span>
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#B8934E]"></div>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-serif text-white mb-6 leading-[1.1] tracking-tight">
            Inspired by <span className="italic text-[#DDA7A5] font-light">Tradition</span>
          </h2>
          <p className="text-white/60 font-light text-[15px] sm:text-[17px] leading-loose px-4 max-w-2xl mx-auto tracking-wide">
            Experience the grandeur of traditional artistry through meticulously crafted clothing that celebrates culture, devotion, heritage, and timeless elegance.
          </p>
        </motion.div>

        {/* Desktop Museum Grid */}
        <div className="hidden lg:grid grid-cols-12 grid-rows-2 gap-6 lg:gap-8 mb-20 auto-rows-[300px]">
          
          {/* HERO MODEL CARD (Row 1-2, Col 1-4) */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            onClick={() => navigate('/shop')} className="col-span-4 row-span-2 cursor-pointer relative rounded-3xl overflow-hidden group shadow-2xl bg-[#0A0204] border border-white/5"
          >
            <img 
              src="/product_img/product_23.jpeg" 
              alt="Traditional Masterpieces" 
              className="absolute inset-0 w-full h-full object-cover object-top opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0204] via-[#0A0204]/60 to-transparent"></div>

            <div className="absolute bottom-0 left-0 right-0 p-10 z-10 flex flex-col justify-end">
              <Crown className="w-8 h-8 text-[#B8934E] mb-6" />
              <h3 className="text-white font-serif text-[42px] mb-4 leading-none tracking-wide">Heritage Mastery</h3>
              <p className="text-white/80 font-light text-[14px] leading-relaxed mb-8">
                 Experience the grandeur of heritage craftsmanship meant for the modern bride.
              </p>
              <button onClick={() => navigate('/shop')} className="w-fit px-8 py-4 bg-transparent border border-[#B8934E] text-[#B8934E] text-[11px] uppercase tracking-[0.2em] font-medium rounded-full hover:bg-[#B8934E] hover:text-[#0A0204] transition-all duration-500">
                Explore Heritage
              </button>
            </div>
          </motion.div>

          {/* TEMPLE Clothing (Row 1, Col 5-12) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            onClick={() => navigate('/shop')} className="col-span-8 row-span-1 cursor-pointer rounded-3xl bg-gradient-to-r from-[#2D0D18] to-[#4A0A18] border border-[#800000]/20 overflow-hidden group shadow-xl flex cursor-pointer hover:border-[#800000]/50 transition-all duration-700 hover:-translate-y-1 relative"
          >
             {/* Left Text Box */}
             <div className="w-1/2 p-12 flex flex-col justify-center relative z-10">
                <h4 className="font-serif text-[36px] text-white mb-4 tracking-wide group-hover:text-[#DDA7A5] transition-colors duration-500">Temple Clothing</h4>
                <p className="font-light text-white/60 leading-loose text-[14px] max-w-sm">
                  Intricately crafted designs inspired by sacred architecture and divine artistry.
                </p>
                
                <div className="mt-8 flex items-center gap-3 text-[#B8934E] text-[11px] uppercase tracking-widest font-medium opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                  <span>Discover Pieces</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
             </div>
             
             {/* Right Image Box */}
             <div className="w-1/2 h-full relative overflow-hidden">
                <img src="/product_img/product_98.jpeg" alt="Temple Clothing" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
             </div>
          </motion.div>

          {/* DEVOTIONAL Accessories (Row 2, Col 5-8) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onClick={() => navigate('/shop')} className="col-span-4 row-span-1 cursor-pointer rounded-3xl bg-gradient-to-br from-[#FAF9F6] to-[#F0EBE1] border border-[#B8934E]/10 overflow-hidden group shadow-xl flex flex-col justify-between cursor-pointer hover:border-[#B8934E]/40 transition-all duration-700 hover:-translate-y-1 relative"
          >
             <div className="absolute top-8 right-8 z-10">
               <ArrowRight className="w-6 h-6 text-[#2D0D18] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
             </div>
             <div className="p-10 pb-0 relative z-10">
               <h4 className="font-serif text-[28px] text-[#2D0D18] mb-3">Devotional Accessories</h4>
               <p className="font-light text-[#5C1A1B]/70 text-[13px] leading-loose">
                 Meaningful designs reflecting heritage and devotion.
               </p>
             </div>
             <div className="flex-1 w-full relative flex items-center justify-center p-6">
                <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl">
                   <img src="/product_img/products_1222.jpeg" alt="Devotional" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                </div>
             </div>
          </motion.div>

          {/* HANDCRAFTED BANGLES (Row 2, Col 9-12) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onClick={() => navigate('/shop')} className="col-span-4 row-span-1 cursor-pointer rounded-3xl bg-gradient-to-br from-[#1A050A] to-[#2D0D18] border border-white/5 overflow-hidden group shadow-xl flex flex-col justify-between cursor-pointer hover:border-white/20 transition-all duration-700 hover:-translate-y-1 relative"
          >
             <div className="absolute top-8 right-8 z-10">
               <ArrowRight className="w-6 h-6 text-[#DDA7A5] opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
             </div>
             <div className="p-10 pb-0 relative z-10">
               <h4 className="font-serif text-[28px] text-[#DDA7A5] mb-3">Handcrafted Bangles</h4>
               <p className="font-light text-white/50 text-[13px] leading-loose">
                 Artisan-created clothing featuring intricate detailing.
               </p>
             </div>
             <div className="flex-1 w-full relative flex items-center justify-center p-6">
                <img src="/antique_bangle.png" alt="Handcrafted" className="w-[85%] h-[85%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
             </div>
          </motion.div>

        </div>


        {/* Mobile / Tablet Interactive Layout */}
        <div className="lg:hidden flex flex-col gap-6 sm:gap-8 mt-12">
           
           {/* Heritage Mastery */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             onClick={() => navigate('/shop')} className="cursor-pointer flex flex-col rounded-3xl overflow-hidden shadow-2xl bg-[#0A0204]"
           >
             <div className="relative w-full aspect-[4/5] sm:aspect-square">
               <img 
                 src="/product_img/product_23.jpeg" 
                 alt="Traditional Masterpieces" 
                 className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0A0204] via-transparent to-transparent"></div>
             </div>
             <div className="p-8 sm:p-10 flex flex-col bg-[#0A0204] -mt-10 relative z-10">
               <Crown className="w-6 h-6 text-[#B8934E] mb-4" />
               <h3 className="text-white font-serif text-[32px] sm:text-[40px] mb-3 leading-tight">Heritage Mastery</h3>
               <p className="text-white/90 font-light text-[14px] sm:text-[16px] mb-8 leading-relaxed">
                 Experience the grandeur of heritage craftsmanship meant for the modern bride.
               </p>
               <button onClick={() => navigate('/shop')} className="w-full py-4 bg-transparent border-2 border-[#B8934E] text-[#B8934E] text-[12px] uppercase tracking-widest font-bold rounded-full">
                 Explore Heritage
               </button>
             </div>
           </motion.div>

           {/* Temple Clothing */}
           <motion.div onClick={() => navigate('/shop')} className="cursor-pointer flex flex-col rounded-3xl bg-gradient-to-br from-[#2D0D18] to-[#4A0A18] overflow-hidden shadow-xl">
              <div className="relative w-full aspect-video sm:aspect-[16/10]">
                <img src="/product_img/product_98.jpeg" alt="Temple" className="absolute inset-0 w-full h-full object-cover" />
              </div>
              <div className="p-8">
                <h4 className="font-serif text-[28px] sm:text-[32px] font-bold text-white mb-3">Temple Clothing</h4>
                <p className="font-light text-white/80 text-[14px] sm:text-[15px] leading-relaxed">Intricately crafted designs inspired by sacred architecture and divine artistry.</p>
              </div>
           </motion.div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Devotional Accessories */}
              <motion.div onClick={() => navigate('/shop')} className="cursor-pointer flex flex-col rounded-3xl bg-[#FAF9F6] overflow-hidden shadow-xl">
                 <div className="relative w-full aspect-square">
                    <img src="/product_img/products_1222.jpeg" alt="Accessories" className="absolute inset-0 w-full h-full object-cover" />
                 </div>
                 <div className="p-8 bg-[#FAF9F6]">
                   <h4 className="font-serif text-[26px] font-bold text-[#2D0D18] mb-2">Devotional Accessories</h4>
                   <p className="font-medium text-[#5C1A1B]/80 text-[13px] leading-relaxed">Meaningful designs reflecting heritage and devotion.</p>
                 </div>
              </motion.div>
              
              {/* Handcrafted Bangles */}
              <motion.div onClick={() => navigate('/shop')} className="cursor-pointer flex flex-col rounded-3xl bg-[#1A050A] overflow-hidden shadow-xl">
                 <div className="relative w-full aspect-square flex items-center justify-center bg-gradient-to-br from-[#2D0D18] to-[#1A050A]">
                   <img src="/antique_bangle.png" alt="Bangles" className="w-[80%] h-[80%] object-contain drop-shadow-2xl" />
                 </div>
                 <div className="p-8 bg-[#1A050A]">
                   <h4 className="font-serif text-[26px] font-bold text-[#DDA7A5] mb-2">Handcrafted Bangles</h4>
                   <p className="font-medium text-white/70 text-[13px] leading-relaxed">Artisan-created clothing featuring intricate detailing.</p>
                 </div>
              </motion.div>
           </div>
        </div>

      </div>
    </section>
  );
}
