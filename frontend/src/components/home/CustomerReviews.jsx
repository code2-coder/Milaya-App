import React, { useRef } from 'react';
import { Star, BadgeCheck, Quote, User, ChevronLeft, ChevronRight } from 'lucide-react';

export function CustomerReviews() {
  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth } = carouselRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      carouselRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const reviews = [
    {
      id: 1,
      name: "Ananya Sharma",
      location: "Mumbai, India",
      product: "Silk Evening Gown",
      text: "The quality of the fabric is exceptional. It drapes beautifully and feels incredibly luxurious. I received so many compliments at the gala.",
      rating: 5
    },
    {
      id: 2,
      name: "Priya Patel",
      location: "London, UK",
      product: "Cashmere Turtleneck",
      text: "Absolutely stunning piece. The craftsmanship is evident in every stitch. This has become a staple in my winter wardrobe.",
      rating: 5
    },
    {
      id: 3,
      name: "Aisha Khan",
      location: "Delhi, India",
      product: "Tailored Wool Coat",
      text: "I was hesitant to order outerwear online, but the fit is impeccable. The delivery was fast and the packaging was beautifully presented.",
      rating: 5
    },
    {
      id: 4,
      name: "Riya Kapoor",
      location: "New York, USA",
      product: "Pleated Midi Skirt",
      text: "Such an elegant design. The movement of the skirt is gorgeous. I appreciate the attention to detail in the hidden zipper and lining.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#FAF9F6] border-y border-stone-200 overflow-hidden relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 md:mb-16">
          <div className="flex flex-col items-center md:items-start text-center md:text-left w-full md:w-auto mb-6 md:mb-0">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-black tracking-wide mb-4">
              Loved by Our Customers
            </h2>
            <p className="text-stone-500 max-w-xl text-sm sm:text-base mb-6 font-light">
              Real experiences from happy shoppers around the world.
            </p>
            <div className="w-16 h-[2px] bg-[#800000] rounded-full"></div>
          </div>
          
          {/* Desktop Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-3 pb-2">
            <button 
              onClick={() => scroll('left')} 
              className="p-3 rounded-full border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-[#800000] hover:border-[#800000] transition-all shadow-sm focus:outline-none"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <button 
              onClick={() => scroll('right')} 
              className="p-3 rounded-full border border-stone-200 bg-white text-stone-500 hover:bg-stone-50 hover:text-[#800000] hover:border-[#800000] transition-all shadow-sm focus:outline-none"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Carousel */}
        <div 
          ref={carouselRef}
          className="flex overflow-x-auto gap-6 sm:gap-8 pb-12 snap-x scrollbar-hide px-2 md:px-4 scroll-smooth"
          style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
               display: none;
            }
          `}</style>
          
          {reviews.map((review) => (
            <div 
              key={review.id} 
              className="relative w-[320px] sm:w-[400px] flex-shrink-0 snap-center bg-white rounded-xl p-8 lg:p-10 shadow-sm border border-stone-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-500 flex flex-col h-full group"
            >
              <Quote className="absolute top-8 right-8 w-12 h-12 text-stone-100 fill-stone-100 group-hover:text-stone-200 group-hover:fill-stone-200 transition-colors duration-500" />
              
              {/* Rating */}
              <div className="flex gap-1.5 mb-8">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>

              {/* Review Text */}
              <p className="font-serif text-stone-800 text-base sm:text-lg leading-relaxed flex-grow mb-10 italic">
                "{review.text}"
              </p>

              {/* Product Purchased */}
              <div className="mb-6">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#800000]">Purchased</span>
                <p className="font-serif text-black text-sm mt-1 group-hover:underline underline-offset-4 decoration-stone-300">{review.product}</p>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-stone-100">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-semibold text-black tracking-wide text-sm">{review.name}</span>
                    <BadgeCheck className="w-4 h-4 text-[#B8934E]" />
                  </div>
                  <span className="font-sans text-[10px] text-stone-500 tracking-wider uppercase mt-1">
                    {review.location}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
