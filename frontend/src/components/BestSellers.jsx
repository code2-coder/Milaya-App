import React from 'react';
import { motion } from 'motion/react';
import { Star, ShieldCheck, Heart, Award, ArrowRight, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router';

export function BestSellers() {
  const navigate = useNavigate();
  return (
    <section className="relative w-full py-24 lg:py-32 overflow-hidden bg-[#FAF9F6] font-sans selection:bg-[#B8934E]/20">
      
      {/* Soft Pink Overlays & Background Patterns */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
        <div className="absolute top-[0%] right-[0%] w-[800px] h-[800px] bg-[#DDA7A5] rounded-full mix-blend-multiply filter blur-[200px] opacity-[0.15]"></div>
        <div className="absolute bottom-[0%] left-[-10%] w-[900px] h-[900px] bg-[#B8934E] rounded-full mix-blend-multiply filter blur-[200px] opacity-[0.08]"></div>

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
            <span className="text-[#B8934E] text-[10px] sm:text-xs font-bold uppercase tracking-[0.4em]">Most Loved Pieces</span>
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#B8934E]"></div>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-serif text-[#2D0D18] mb-6 leading-[1.1] tracking-tight">
            Loved by Our <span className="italic text-[#DDA7A5] font-light">Customers</span>
          </h2>
          <p className="text-[#5C1A1B]/70 font-light text-[15px] sm:text-[17px] leading-loose px-4 max-w-2xl mx-auto tracking-wide">
            Discover our most cherished clothing collections, admired for their exceptional craftsmanship, timeless beauty, and enduring elegance.
          </p>
        </motion.div>

        {/* Desktop Luxury Grid */}
        <div className="hidden lg:grid grid-cols-12 grid-rows-2 gap-6 lg:gap-8 mb-20 auto-rows-[340px]">
          
          {/* HERO BEST SELLER: Bridal Clothing (Row 1-2, Col 1-5) */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            onClick={() => navigate('/shop')} className="col-span-5 row-span-2 cursor-pointer relative rounded-3xl overflow-hidden group shadow-[0_20px_50px_rgba(45,13,24,0.08)] bg-[#1A0B10] border border-[#800000]/10"
          >
            <img 
              src="https://res.cloudinary.com/dg4pix57t/image/upload/v1782722459/milaya/products/hwliuthjrdpyizzhxxkn.jpg" 
              alt="Premium Deity Shringar" 
              className="absolute inset-0 w-full h-full object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A050A] via-[#1A050A]/40 to-transparent"></div>

            <div className="absolute top-8 left-8 flex flex-col gap-3 z-10">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg">
                <Heart className="w-3.5 h-3.5 text-[#800000] fill-[#800000]" />
                <span className="text-[#2D0D18] text-[10px] font-bold tracking-widest uppercase">Customer Favorite</span>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-10 z-10 flex flex-col justify-end">
              <div className="flex items-center gap-1 mb-4">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className="w-4 h-4 text-[#B8934E] fill-[#B8934E]" />
                 ))}
                 <span className="text-white/80 text-[12px] font-medium ml-2 tracking-wider">4.9/5 (1.2k Reviews)</span>
              </div>
              <h3 className="text-white font-serif text-[42px] mb-4 leading-none tracking-wide drop-shadow-md">Premium Deity Shringar</h3>
              <p className="text-white/80 font-light text-[14px] leading-relaxed mb-8 max-w-sm">
                 Customer-favorite Mukut and Shringar sets crafted with devotion for divine adornment.
              </p>
              <button onClick={() => navigate('/shop')} className="w-fit px-8 py-4 bg-[#B8934E] text-white text-[11px] uppercase tracking-[0.2em] font-bold rounded-full hover:bg-white hover:text-[#2D0D18] shadow-lg transition-all duration-500 flex items-center gap-3">
                <ShoppingBag className="w-4 h-4" /> Shop Collection
              </button>
            </div>
          </motion.div>

          {/* SIGNATURE Outerwear (Row 1, Col 6-12) */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            onClick={() => navigate('/shop')} className="col-span-7 row-span-1 cursor-pointer rounded-3xl bg-gradient-to-r from-[#5C1A1B] to-[#800000] overflow-hidden group shadow-xl flex cursor-pointer hover:-translate-y-1 transition-transform duration-700 relative"
          >
             <div className="absolute top-6 left-6 flex items-center gap-2 bg-[#1A050A]/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20">
                <Award className="w-3.5 h-3.5 text-[#B8934E]" />
                <span className="text-white text-[10px] font-bold tracking-widest uppercase">#1 Best Seller</span>
             </div>

             <div className="w-1/2 p-12 flex flex-col justify-center relative z-10">
                <div className="flex items-center gap-1 mb-4">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className="w-3.5 h-3.5 text-[#B8934E] fill-[#B8934E]" />
                 ))}
                </div>
                <h4 className="font-serif text-[34px] text-white mb-3 tracking-wide group-hover:text-[#DDA7A5] transition-colors duration-500">Divine Outerwear & Chokers</h4>
                <p className="font-light text-white/70 leading-loose text-[14px]">
                  Timeless statement outerwear and chokers designed for exquisite deity shringar.
                </p>
                <div className="mt-8 flex items-center gap-3 text-[#B8934E] text-[11px] uppercase tracking-widest font-bold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
             </div>
             
             <div className="w-1/2 h-full relative flex items-center justify-center p-8 bg-[#2D0D18]/30">
                 <img src="https://res.cloudinary.com/dg4pix57t/image/upload/v1782091008/milaya/products/va4itpnjtej851hy1fit.jpg" alt="Divine Jacket" className="w-[110%] h-[110%] object-cover rounded-xl drop-shadow-2xl group-hover:scale-110 group-hover:-rotate-2 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </div>
          </motion.div>

          {/* ELEGANT Accessories (Row 2, Col 6-9) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onClick={() => navigate('/shop')} className="col-span-4 row-span-1 cursor-pointer rounded-3xl bg-white border border-[#800000]/10 overflow-hidden group shadow-xl flex flex-col justify-between cursor-pointer hover:border-[#800000]/30 hover:-translate-y-1 transition-all duration-700 relative"
          >
             <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-[#FAF9F6] px-3 py-1.5 rounded-full border border-[#800000]/5">
                <ShieldCheck className="w-3 h-3 text-[#4A0A18]" />
                <span className="text-[#4A0A18] text-[9px] font-bold tracking-widest uppercase">Verified Quality</span>
             </div>
             <div className="absolute top-6 right-6 z-10">
                <Heart className="w-5 h-5 text-[#DDA7A5]" />
             </div>

             <div className="flex-1 w-full relative flex items-center justify-center pt-16 pb-4">
                 <img src="https://res.cloudinary.com/dg4pix57t/image/upload/v1781105671/milaya/products/zfxxljdhbsh3gmruw459.webp" alt="Deity Naths & Kundals" className="w-[85%] h-[85%] object-cover rounded-2xl drop-shadow-[0_15px_30px_rgba(0,0,0,0.15)] group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </div>
              <div className="p-8 pt-0 relative z-10 text-center">
                <h4 className="font-serif text-[24px] text-[#2D0D18] mb-2">Deity Naths & Kundals</h4>
                <p className="font-light text-[#5C1A1B]/70 text-[13px] leading-relaxed">
                  Beautifully handcrafted nose bottoms and kundals for divine shringar.
                </p>
             </div>
          </motion.div>

          {/* LUXURY Bottoms (Row 2, Col 10-12) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            onClick={() => navigate('/shop')} className="col-span-3 row-span-1 cursor-pointer rounded-3xl bg-gradient-to-b from-[#DDA7A5] to-[#E5B5B3] border border-white/30 overflow-hidden group shadow-xl flex flex-col justify-between cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 relative"
          >
             <div className="absolute top-6 left-6 z-10 flex items-center gap-2 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40">
                <Heart className="w-3 h-3 text-[#4A0A18] fill-[#4A0A18]" />
                <span className="text-[#4A0A18] text-[9px] font-bold tracking-widest uppercase">Trending</span>
             </div>

              <div className="flex-1 w-full relative flex items-center justify-center pt-16 pb-2">
                 <img src="https://res.cloudinary.com/dg4pix57t/image/upload/v1782091845/milaya/products/vspo0wtgx10m9guqmoqw.jpg" alt="Deity Bangles & Kangans" className="w-[85%] h-[85%] object-cover rounded-2xl drop-shadow-xl group-hover:scale-105 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              </div>
              <div className="p-8 pt-0 relative z-10 text-center">
                <h4 className="font-serif text-[24px] text-[#2D0D18] mb-2">Deity Bangles & Kangans</h4>
                <p className="font-light text-[#5C1A1B]/80 text-[13px] leading-relaxed">
                  Elegant bangles and kangans adorned with premium premium color finish.
                </p>
             </div>
          </motion.div>

        </div>

        {/* Exclusive Best Sellers Banner (Bottom Full Width) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="hidden lg:flex w-full bg-[#1A050A] rounded-[2.5rem] p-12 items-center justify-between shadow-2xl relative overflow-hidden"
        >

          
          <div className="flex items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-full bg-white/5 border border-[#B8934E]/20 flex items-center justify-center shadow-lg">
               <Award className="w-10 h-10 text-[#B8934E]" />
            </div>
            <div>
              <h4 className="font-serif text-[36px] text-white mb-2 tracking-wide">Exclusive Best Sellers</h4>
              <p className="font-light text-white/70 text-[15px] max-w-xl">
                The most loved deity shringar garments chosen by our customers. Devotionally crafted with unmatched elegance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 relative z-10">
             <div className="flex flex-col items-end border-r border-white/10 pr-6">
                <span className="text-[#B8934E] text-[28px] font-serif">10k+</span>
                <span className="text-white/60 text-[11px] uppercase tracking-widest font-bold">Happy Clients</span>
             </div>
             <button onClick={() => navigate('/shop')} className="px-8 py-4 ml-2 bg-gradient-to-r from-[#B8934E] to-[#D4AF37] text-[#1A050A] text-[12px] uppercase tracking-widest font-bold rounded-full hover:shadow-[0_0_20px_rgba(184,147,78,0.4)] hover:bg-white transition-all">
                Shop All Best Sellers
             </button>
          </div>
        </motion.div>


        {/* Mobile / Tablet Interactive Layout */}
        <div className="lg:hidden flex flex-col gap-6 sm:gap-8 mt-12">
           
           {/* Premium Bridal */}
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             onClick={() => navigate('/shop')} className="cursor-pointer flex flex-col rounded-3xl overflow-hidden shadow-2xl bg-[#1A0B10]"
           >
             <div className="relative w-full aspect-[4/5] sm:aspect-square">
               <img 
                 src="https://res.cloudinary.com/dg4pix57t/image/upload/v1782722459/milaya/products/hwliuthjrdpyizzhxxkn.jpg" 
                 alt="Premium Deity Shringar" 
                 className="absolute inset-0 w-full h-full object-cover object-top opacity-90"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#1A050A] via-transparent to-transparent"></div>
               <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 bg-white/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-white/20 shadow-lg z-10">
                  <Heart className="w-3.5 h-3.5 text-[#800000] fill-[#800000]" />
                  <span className="text-[#2D0D18] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">Customer Favorite</span>
               </div>
             </div>
             
             <div className="p-8 sm:p-10 flex flex-col bg-[#1A0B10] -mt-10 relative z-10">
               <div className="flex items-center gap-1 mb-3">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} className="w-4 h-4 text-[#B8934E] fill-[#B8934E]" />
                 ))}
                 <span className="text-white/80 text-[12px] font-bold ml-2">4.9/5</span>
               </div>
               <h3 className="text-white font-serif text-[32px] sm:text-[38px] font-bold mb-3 leading-tight">Premium Deity Shringar</h3>
               <p className="text-white/90 font-light text-[14px] sm:text-[16px] mb-8 leading-relaxed">
                 Customer-favorite Mukut and Shringar sets crafted with devotion for divine adornment.
               </p>
               <button onClick={() => navigate('/shop')} className="w-full py-4 bg-[#B8934E] text-white text-[12px] uppercase tracking-widest font-bold rounded-full flex items-center justify-center gap-3">
                 <ShoppingBag className="w-5 h-5" /> Shop Collection
               </button>
             </div>
           </motion.div>

           <div className="flex flex-col gap-6">
             {/* Signature Outerwear */}
             <motion.div onClick={() => navigate('/shop')} className="cursor-pointer flex flex-col rounded-3xl bg-gradient-to-r from-[#5C1A1B] to-[#800000] overflow-hidden shadow-xl">
                <div className="p-8 pb-4 relative">
                   <div className="absolute top-6 right-6 flex items-center gap-2 bg-[#1A050A]/50 px-3 py-1.5 rounded-full border border-white/10">
                      <Award className="w-3.5 h-3.5 text-[#B8934E]" />
                      <span className="text-white text-[9px] font-bold tracking-widest uppercase">#1 Best Seller</span>
                   </div>
                    <h4 className="font-serif text-[30px] font-bold text-white mb-3 mt-10">Divine Outerwear</h4>
                    <p className="font-light text-white/90 text-[14px] leading-relaxed">Timeless outerwear and chokers designed for exquisite deity shringar.</p>
                </div>
                 <div className="w-full relative aspect-video flex justify-center items-end bg-[#2D0D18]/30 pt-4">
                   <img src="https://res.cloudinary.com/dg4pix57t/image/upload/v1782091008/milaya/products/va4itpnjtej851hy1fit.jpg" alt="Jacket" className="w-[85%] h-[95%] object-cover rounded-t-xl drop-shadow-2xl" />
                 </div>
             </motion.div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Elegant Accessories */}
                <motion.div onClick={() => navigate('/shop')} className="cursor-pointer flex flex-col rounded-3xl bg-white border border-[#800000]/10 overflow-hidden shadow-xl relative">
                   <div className="absolute top-4 right-4 z-10">
                      <Heart className="w-5 h-5 text-[#DDA7A5]" />
                   </div>
                    <div className="relative w-full aspect-square bg-[#FAF9F6] flex items-center justify-center p-6">
                      <img src="https://res.cloudinary.com/dg4pix57t/image/upload/v1781105671/milaya/products/zfxxljdhbsh3gmruw459.webp" alt="Deity Naths & Kundals" className="w-[85%] h-[85%] object-cover rounded-2xl drop-shadow-lg" />
                    </div>
                    <div className="p-8 text-center bg-white">
                      <h4 className="font-serif text-[26px] font-bold text-[#2D0D18] mb-2">Deity Naths & Kundals</h4>
                      <p className="font-medium text-[#5C1A1B]/80 text-[13px]">Beautifully handcrafted nose bottoms and kundals.</p>
                   </div>
                </motion.div>
                
                {/* Luxury Bottoms */}
                <motion.div onClick={() => navigate('/shop')} className="cursor-pointer flex flex-col rounded-3xl bg-gradient-to-b from-[#DDA7A5] to-[#E5B5B3] border border-white/30 overflow-hidden shadow-xl relative">
                   <div className="absolute top-4 left-4 z-10 flex items-center gap-1 bg-white/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/40">
                      <Heart className="w-3 h-3 text-[#4A0A18] fill-[#4A0A18]" />
                      <span className="text-[#4A0A18] text-[9px] font-bold uppercase tracking-widest">Trending</span>
                   </div>
                    <div className="relative w-full aspect-square flex items-center justify-center p-6">
                      <img src="https://res.cloudinary.com/dg4pix57t/image/upload/v1782091845/milaya/products/vspo0wtgx10m9guqmoqw.jpg" alt="Deity Bangles & Kangans" className="w-[85%] h-[85%] object-cover rounded-2xl drop-shadow-xl" />
                    </div>
                    <div className="p-8 text-center bg-[#E5B5B3]">
                      <h4 className="font-serif text-[26px] font-bold text-[#2D0D18] mb-2">Deity Bangles & Kangans</h4>
                      <p className="font-medium text-[#5C1A1B]/90 text-[13px]">Elegant bangles and kangans adorned with premium color.</p>
                   </div>
                </motion.div>
             </div>
             
             {/* Mobile CTA Banner */}
             <motion.div className="rounded-3xl bg-[#1A050A] p-10 flex flex-col items-center text-center mt-2 shadow-2xl border border-white/5 relative overflow-hidden">

                 <div className="relative z-10">
                    <h4 className="font-serif text-[32px] font-bold text-white mb-4">Exclusive Best Sellers</h4>
                    <p className="font-light text-white/80 text-[14px] sm:text-[15px] leading-relaxed mb-8">The most loved deity shringar garments chosen by our customers.</p>
                   <button onClick={() => navigate('/shop')} className="w-full py-4 bg-gradient-to-r from-[#B8934E] to-[#D4AF37] text-[#1A050A] text-[13px] uppercase tracking-widest font-bold rounded-full shadow-[0_0_20px_rgba(184,147,78,0.3)]">
                      Shop All Best Sellers
                   </button>
                 </div>
             </motion.div>

           </div>
        </div>

      </div>
    </section>
  );
}
