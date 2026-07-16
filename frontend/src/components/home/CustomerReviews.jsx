import React from 'react';
import { Star, BadgeCheck, Quote } from 'lucide-react';

export function CustomerReviews() {
  const reviews = [
    {
      id: 1,
      name: "Eleanor Harper",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
      location: "New York, USA",
      product: "Silk Evening Gown",
      text: "The quality of the fabric is exceptional. It drapes beautifully and feels incredibly luxurious. I received so many compliments at the gala.",
      rating: 5
    },
    {
      id: 2,
      name: "Sophia Chen",
      photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      location: "London, UK",
      product: "Cashmere Turtleneck",
      text: "Absolutely stunning piece. The craftsmanship is evident in every stitch. This has become a staple in my winter wardrobe.",
      rating: 5
    },
    {
      id: 3,
      name: "Olivia Rossi",
      photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&q=80&w=200",
      location: "Milan, Italy",
      product: "Tailored Wool Coat",
      text: "I was hesitant to order outerwear online, but the fit is impeccable. The delivery was fast and the packaging was beautifully presented.",
      rating: 5
    },
    {
      id: 4,
      name: "Amelia Dupont",
      photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200",
      location: "Paris, France",
      product: "Pleated Midi Skirt",
      text: "Such an elegant design. The movement of the skirt is gorgeous. I appreciate the attention to detail in the hidden zipper and lining.",
      rating: 5
    }
  ];

  return (
    <section className="py-20 lg:py-28 bg-white border-y border-stone-200 overflow-hidden relative">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-16 md:mb-20 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-black tracking-wide mb-4">
            Loved by Our Customers
          </h2>
          <p className="text-stone-500 max-w-xl mx-auto text-sm sm:text-base mb-6 font-light">
            Real experiences from happy shoppers around the world.
          </p>
          <div className="w-16 h-[2px] bg-black rounded-full"></div>
        </div>

        {/* Carousel */}
        <div 
          className="flex overflow-x-auto gap-6 sm:gap-8 pb-12 snap-x scrollbar-hide px-2 md:px-4"
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
              className="relative w-[320px] sm:w-[400px] flex-shrink-0 snap-center bg-white rounded-2xl p-8 lg:p-10 border border-stone-200 hover:border-black transition-all duration-500 flex flex-col h-full group"
            >
              <Quote className="absolute top-6 right-6 w-12 h-12 text-stone-100 fill-stone-100 group-hover:text-stone-200 group-hover:fill-stone-200 transition-colors duration-500" />
              
              {/* Rating */}
              <div className="flex gap-1.5 mb-8">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-black text-black" />
                ))}
              </div>

              {/* Review Text */}
              <p className="font-serif text-black text-base sm:text-lg leading-relaxed flex-grow mb-10">
                "{review.text}"
              </p>

              {/* Product Purchased */}
              <div className="mb-6">
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Purchased</span>
                <p className="font-serif text-black text-sm mt-1 group-hover:underline underline-offset-4 decoration-stone-300">{review.product}</p>
              </div>

              {/* Customer Info */}
              <div className="flex items-center gap-4 pt-6 border-t border-stone-100">
                <img 
                  src={review.photo} 
                  alt={review.name} 
                  className="w-12 h-12 rounded-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-sans font-semibold text-black tracking-wide text-sm">{review.name}</span>
                    <BadgeCheck className="w-4 h-4 text-black" />
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
