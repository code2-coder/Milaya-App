import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Diamond } from 'lucide-react';

export function PremiumWhyChooseUs() {
  const features = [
    {
      icon: <Diamond className="w-7 h-7 text-[#D4AF37] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />,
      title: "Premium Quality",
      description: "Only carefully selected premium fabrics and craftsmanship."
    },
    {
      icon: <ShieldCheck className="w-7 h-7 text-[#D4AF37] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-[15deg] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />,
      title: "Secure Payment",
      description: "100% safe and encrypted payment gateway."
    },
    {
      icon: <RotateCcw className="w-7 h-7 text-[#D4AF37] transition-all duration-500 group-hover:scale-110 group-hover:rotate-180 group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />,
      title: "Easy Returns",
      description: "Simple hassle-free return and exchange process."
    },
    {
      icon: <Truck className="w-7 h-7 text-[#D4AF37] transition-all duration-500 group-hover:scale-110 group-hover:translate-x-2 group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />,
      title: "Fast Delivery",
      description: "Quick and reliable doorstep delivery."
    }
  ];

  return (
    <section className="relative py-24 lg:py-32 bg-[#0A0A0A] overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#8B1E3F]/10 blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#D4AF37]/5 blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
      </div>

      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 z-10">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-20 text-center">
          <span className="text-[#D4AF37] font-poppins text-xs font-semibold tracking-[0.2em] uppercase mb-4 block">The Milaya Promise</span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white tracking-wide mb-6">
            Why Shop With Us
          </h2>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group relative flex flex-col p-8 rounded-[24px] bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-[#D4AF37]/30 backdrop-blur-md transition-all duration-500 hover:-translate-y-3 shadow-2xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
            >
              {/* Editorial Number Watermark */}
              <div className="absolute top-4 right-6 text-6xl font-serif font-bold text-white/[0.03] transition-all duration-500 group-hover:text-[#D4AF37]/[0.05] pointer-events-none">
                0{index + 1}
              </div>

              {/* Icon Container */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 flex items-center justify-center mb-8 overflow-hidden group-hover:border-[#D4AF37]/40 transition-all duration-500">
                <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/10 transition-colors duration-500"></div>
                <div className="relative z-10">
                  {feature.icon}
                </div>
              </div>
              
              {/* Content */}
              <h3 className="font-serif text-2xl text-white mb-3 group-hover:text-[#D4AF37] transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="font-poppins text-sm text-white/60 leading-relaxed font-light">
                {feature.description}
              </p>
              
              {/* Decorative Corner Accent */}
              <div className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden rounded-br-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="absolute bottom-[-1px] right-[-1px] w-4 h-4 border-b-2 border-r-2 border-[#D4AF37]/50 rounded-br-[4px]"></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
