import { useNavigate } from "react-router";
import { ArrowRight, Tag, Sparkles, Percent, Gift } from "lucide-react";
import { motion } from "motion/react";

export function AdPostersDisplay({ adPosters }) {
  const navigate = useNavigate();

  if (!adPosters || adPosters.length === 0) {
    return null;
  }

  // Helper to get premium styling based on type
  const getTypeStyling = (type) => {
    switch(type) {
      case 'offer':
        return { bg: 'bg-emerald-900', text: 'text-emerald-50', icon: Gift, label: 'Special Offer' };
      case 'discount':
        return { bg: 'bg-rose-900', text: 'text-rose-50', icon: Percent, label: 'Limited Discount' };
      case 'new_arrival':
        return { bg: 'bg-fuchsia-900', text: 'text-fuchsia-50', icon: Sparkles, label: 'New Arrival' };
      default:
        return { bg: 'bg-[#0B1121]', text: 'text-slate-50', icon: Tag, label: type };
    }
  };

  return (
    <div className="mt-20 mb-20">
      {/* Premium Header */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center text-center mb-16"
      >
        <div className="inline-flex items-center space-x-3 mb-6">
           <div className="h-[1px] w-12 bg-emerald-300/50"></div>
           <span className="text-xs font-bold text-emerald-800 uppercase tracking-[0.3em]">Curated Collection</span>
           <div className="h-[1px] w-12 bg-emerald-300/50"></div>
        </div>
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-slate-900 tracking-tight mb-6">
          Exclusive <span className="font-serif italic text-emerald-800 font-medium">Highlights</span>
        </h2>
        
        <p className="text-slate-500 max-w-2xl text-base md:text-lg font-light leading-relaxed px-4">
          Explore our most coveted pieces, seasonal offers, and the latest breathtaking additions to our premium clothing collection.
        </p>
      </motion.div>
      
      {/* Immersive Editorial Grid */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
          }
        }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      >
        {adPosters.map((poster, index) => {
          const style = getTypeStyling(poster.type);
          const Icon = style.icon;
          
          // Make the first item larger if there's an odd number of items, for a beautiful asymmetric look on tablet
          const isFeatured = index === 0 && adPosters.length % 2 !== 0;
          
          return (
            <motion.div 
              key={poster._id || poster.id || index}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
                }
              }}
              onClick={() => poster.link && navigate(poster.link)}
              className={`group relative overflow-hidden rounded-2xl bg-slate-100 shadow-sm transition-all duration-700 ease-out hover:shadow-2xl hover:shadow-emerald-900/20 ${poster.link ? 'cursor-pointer' : ''} ${isFeatured ? 'md:col-span-2 lg:col-span-1' : ''}`}
            >
              <div className={`w-full relative ${isFeatured ? 'aspect-[4/3] md:aspect-[21/9] lg:aspect-[4/5]' : 'aspect-[4/5] sm:aspect-square lg:aspect-[4/5]'}`}>
                 {/* Image with slow elegant zoom */}
                 <img 
                   src={poster.image}
                   srcSet={undefined}
                   sizes="(max-width: 768px) 100vw, 33vw"
                   alt={poster.title || style.label} 
                   loading="lazy"
                   decoding="async"
                   className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                 />
                 
                 {/* Sophisticated Gradient Overlay */}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-700 pointer-events-none"></div>

                 {/* Content Overlay */}
                 <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 pointer-events-none">
                    
                    {/* Top Section: Elegant Type Badge */}
                    <div className="flex justify-start transform -translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 ease-out">
                       <div className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg flex items-center backdrop-blur-md border border-white/10 ${style.bg} ${style.text}`}>
                          <Icon className="w-3.5 h-3.5 mr-2 opacity-80" />
                          <span>{style.label}</span>
                       </div>
                    </div>

                    {/* Bottom Section: Title & Action */}
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                       {poster.title && (
                         <h3 className="font-serif text-white mb-4 tracking-wide text-2xl md:text-3xl lg:text-4xl leading-tight font-medium drop-shadow-md">
                           {poster.title}
                         </h3>
                       )}
                       
                       {poster.link && (
                         <div className="inline-flex items-center text-white border-b border-white/30 pb-1 group-hover:border-white transition-colors duration-500 mt-2">
                            <span className="text-xs font-bold uppercase tracking-[0.2em]">Discover</span>
                            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform duration-500 ease-out" />
                         </div>
                       )}
                    </div>
                 </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
