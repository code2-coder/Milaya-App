import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';

export function LimitedTimeOffer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 12,
    minutes: 45,
    seconds: 0
  });

  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(targetDate.getHours() + 12);
    targetDate.setMinutes(targetDate.getMinutes() + 45);

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Mins', value: timeLeft.minutes },
    { label: 'Secs', value: timeLeft.seconds }
  ];

  return (
    <section className="relative w-full py-24 lg:py-32 overflow-hidden flex items-center justify-center min-h-[600px]">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=2000" 
          alt="Limited Time Offer" 
          className="w-full h-full object-cover object-center"
        />
        {/* Premium Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#222222]/90 via-[#222222]/70 to-[#222222]/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 flex flex-col items-start text-white">
        
        <span className="text-[#D4AF37] font-poppins font-medium tracking-[0.2em] uppercase text-sm mb-4 block">
          Limited Time Offer
        </span>
        
        <h2 className="font-serif text-5xl md:text-6xl lg:text-7xl mb-6 leading-tight">
          Flat 30% OFF
        </h2>
        
        <p className="font-poppins font-light text-white/80 max-w-lg text-lg mb-10 leading-relaxed">
          Upgrade your wardrobe with premium fashion at exclusive prices. Hurry before the offer ends.
        </p>

        {/* Countdown Timer */}
        <div className="flex gap-4 sm:gap-6 mb-12">
          {timeBlocks.map((block, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mb-2 shadow-lg">
                <span className="font-serif text-2xl sm:text-3xl text-white">
                  {block.value.toString().padStart(2, '0')}
                </span>
              </div>
              <span className="font-poppins text-xs tracking-widest uppercase text-white/70">
                {block.label}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link 
            to="/shop?sale=true" 
            className="font-poppins bg-[#D4AF37] text-white px-8 py-4 rounded-full font-medium tracking-widest uppercase text-sm text-center hover:bg-[#b8942b] transition-colors shadow-[0_8px_20px_rgba(212,175,55,0.3)]"
          >
            Shop Now
          </Link>
          <Link 
            to="/shop" 
            className="font-poppins bg-transparent border border-white/30 text-white px-8 py-4 rounded-full font-medium tracking-widest uppercase text-sm text-center hover:bg-white hover:text-[#222222] transition-colors"
          >
            Explore Collection
          </Link>
        </div>

      </div>
    </section>
  );
}
