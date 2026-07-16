import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export function PremiumNewsletter() {
  const [email, setEmail] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail('');
    }
  };

  return (
    <section className="bg-white">
      <div className="flex flex-col lg:flex-row min-h-[600px] lg:min-h-[700px] w-full max-w-[2000px] mx-auto border-t border-stone-200">
        
        {/* Left Side - Image */}
        <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&q=80&w=1200" 
            alt="Premium Elegant Fashion" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none"></div>
        </div>

        {/* Right Side - Content */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-10 sm:p-16 lg:p-24 bg-white relative overflow-hidden group">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-black/[0.02] rounded-full blur-[100px] transition-all duration-1000 group-hover:bg-black/[0.04] group-hover:scale-110 pointer-events-none"></div>
          
          <div className="relative z-10 w-full max-w-[480px]">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-8 h-[1px] bg-black/40"></div>
               <span className="text-black font-sans text-[11px] font-bold tracking-[0.3em] uppercase">
                 The Insider
               </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif text-black tracking-tight mb-6">
              Stay Updated
            </h2>
            
            <p className="font-serif text-stone-600 text-base sm:text-lg leading-relaxed mb-12 font-light italic">
              "Subscribe to receive exclusive offers, new arrivals, seasonal collections, and special member-only discounts directly to your inbox."
            </p>

            {/* Subscription Form */}
            <form onSubmit={handleSubmit} className="w-full relative mb-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className="w-full bg-stone-50 border border-stone-200 p-4 font-sans text-base text-black placeholder:text-stone-400 focus:border-black focus:outline-none focus:ring-0 transition-colors duration-300"
                />
                <button 
                  type="submit" 
                  className="bg-black text-white hover:bg-stone-800 px-8 py-4 transition-colors duration-300 flex items-center justify-center group/btn shrink-0"
                >
                  <span className="font-sans font-bold text-[11px] tracking-[0.2em] uppercase mr-3">Subscribe</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover/btn:translate-x-1" />
                </button>
              </div>
            </form>

            <p className="font-sans text-stone-400 text-[10px] uppercase tracking-[0.2em]">
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
