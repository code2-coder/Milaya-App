import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export function CuratedGallery() {
  // Use exactly 6 images for a curated preview
  const images = [
    { src: '/product_img/product_1.jpeg', alt: 'Curated Piece 1', span: 'col-span-2 row-span-2' },
    { src: '/product_img/product_2.jpeg', alt: 'Curated Piece 2', span: 'col-span-1 row-span-1' },
    { src: '/product_img/product_3.jpeg', alt: 'Curated Piece 3', span: 'col-span-1 row-span-2' },
    { src: '/product_img/product_4.jpeg', alt: 'Curated Piece 4', span: 'col-span-1 row-span-1' },
    { src: '/product_img/product_5.jpeg', alt: 'Curated Piece 5', span: 'col-span-1 row-span-1' },
    { src: '/product_img/product_6.jpeg', alt: 'Curated Piece 6', span: 'col-span-3 row-span-1' },
  ];

  return (
    <section className="relative w-full mt-16 lg:mt-24 pt-24 lg:pt-36 pb-20 lg:pb-28 overflow-hidden bg-[#FAF9F6] font-sans rounded-t-[3rem]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-4">
              <Sparkles className="w-4 h-4 text-[#800000]" />
              <span className="text-[#800000] text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em]">New Arrivals</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#0A0204] mb-4 leading-tight">
              Curated <span className="italic text-[#B8934E] font-light">Elegance</span>
            </h2>
            <p className="text-gray-500 font-light text-[15px] sm:text-[17px] leading-relaxed max-w-xl">
              Discover our latest additions. Each piece is a testament to extraordinary craftsmanship and timeless beauty, designed to make your moments unforgettable.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          >
             <Link to="/shop" className="group inline-flex items-center gap-3 px-8 py-4 bg-transparent border border-[#0A0204] text-[#0A0204] text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-[#0A0204] hover:text-white transition-all duration-500">
                <span>View Entire Gallery</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-500" />
             </Link>
          </motion.div>
        </div>

        {/* Masonry Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[200px] sm:auto-rows-[250px] gap-3 sm:gap-4">
          {images.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: "easeOut" }}
              className={`relative overflow-hidden group rounded-xl bg-white ${img.span} cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-700`}
            >
              <img 
                src={img.src} 
                alt={img.alt} 
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-110 ease-[cubic-bezier(0.16,1,0.3,1)]"
              />
              
              {/* Glassmorphism Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0204]/90 via-[#0A0204]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 sm:p-8 backdrop-blur-[2px]">
                 <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500"
                 >
                    <h3 className="text-white font-serif text-2xl sm:text-3xl mb-2">{img.alt}</h3>
                    <div className="flex items-center gap-2 text-white/80 text-[10px] sm:text-xs uppercase tracking-widest font-medium">
                      <span>Explore Piece</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                 </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
