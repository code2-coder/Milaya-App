import React from 'react';
import { Link } from 'react-router';
import { ProductCard } from '../ProductCard';

export function NewArrivals({ products = [] }) {
  // Use first 8 products for demo, or filter by newest if possible
  const displayProducts = products.slice(0, 8);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-white font-poppins">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#222222] tracking-wide mb-4">
            New Arrivals
          </h2>
          <p className="text-[#222222]/70 max-w-xl mx-auto text-sm sm:text-base mb-6 font-light">
            Discover the latest styles carefully selected for this season.
          </p>
          <div className="w-16 h-[2px] bg-[#8B1E3F] rounded-full"></div>
        </div>

        {/* Product Slider */}
        <div 
          className="flex overflow-x-auto gap-4 sm:gap-6 pb-12 snap-x scrollbar-hide"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          
          {displayProducts.map((product) => (
            <div 
              key={product._id || product.id} 
              className="w-full min-w-[280px] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] snap-center flex-shrink-0"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        {/* Call to Action */}
        <div className="flex justify-center">
          <Link 
            to="/shop?sort=newest" 
            className="group flex items-center gap-3 border border-[#222222] text-[#222222] px-8 py-3 rounded-full hover:bg-[#222222] hover:text-white transition-colors duration-300 shadow-[0_4px_14px_rgba(0,0,0,0.05)]"
          >
            <span className="text-sm font-medium tracking-widest uppercase">Explore All</span>
            <div className="w-6 h-[1px] bg-[#222222] group-hover:bg-white transition-colors"></div>
          </Link>
        </div>

      </div>
    </section>
  );
}
