import React from 'react';
import { Link } from 'react-router';
import { ProductCard } from '../ProductCard';

export function BestSellersCarousel({ products = [] }) {
  // Use a different slice or sort for best sellers
  const displayProducts = products.length > 8 ? products.slice(8, 16) : products.slice(0, 8);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-[#F8F5F2] font-poppins">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[#222222] tracking-wide mb-4">
            Best Sellers
          </h2>
          <p className="text-[#222222]/70 max-w-xl mx-auto text-sm sm:text-base mb-6 font-light">
            Our customers' favorite styles loved for quality and comfort.
          </p>
          <div className="w-16 h-[2px] bg-[#D4AF37] rounded-full"></div>
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
              className="relative w-full min-w-[280px] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] snap-center flex-shrink-0"
            >
              {/* Bestseller Badge */}
              <div className="absolute top-4 right-4 z-30">
                <div className="bg-[#D4AF37] text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-md">
                  Bestseller
                </div>
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
