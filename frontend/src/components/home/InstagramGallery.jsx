import React from 'react';
import { Instagram } from 'lucide-react';

export function InstagramGallery() {
  return (
    <section className="relative h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax-like scale effect */}
      <div className="absolute inset-0 group">
        <img 
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=2000" 
          alt="Fashion Lifestyle" 
          className="w-full h-full object-cover scale-105 transition-transform duration-[10s] ease-out"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Glassmorphism Content Box */}
      <div className="relative z-10 flex flex-col items-center text-center p-10 md:p-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl max-w-[600px] mx-4 transform transition-all duration-700 hover:bg-white/15 hover:-translate-y-2">
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6 backdrop-blur-md">
          <Instagram className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide mb-4">
          Follow Our Style
        </h2>
        <p className="text-white/90 max-w-md mx-auto text-sm sm:text-base mb-2 font-light">
          See how our customers style their favorite outfits.
        </p>
        <a href="https://www.instagram.com/milayafashion" target="_blank" rel="noopener noreferrer" className="font-poppins font-medium text-sm text-[#D4AF37] hover:text-white transition-colors mb-10 block tracking-widest uppercase">
          @milayafashion
        </a>
        
        <a 
          href="https://www.instagram.com/milayafashion" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-poppins bg-white text-[#222222] px-8 py-4 rounded-full font-medium tracking-widest uppercase text-sm hover:bg-[#D4AF37] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center gap-3 group"
        >
          <Instagram className="w-4 h-4 transition-transform duration-500 group-hover:scale-110" />
          Follow Us on Instagram
        </a>
      </div>
    </section>
  );
}
