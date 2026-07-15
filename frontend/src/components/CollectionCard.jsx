import { Link } from "react-router";
import { memo } from "react";

export const CollectionCard = memo(function CollectionCard({ category }) {
    const imageUrl = category?.image?.url || `https://placehold.co/800x600?text=${encodeURIComponent(category?.name || 'Collection')}`;
    const getOptimized = (url) => {
        if (!url) return url;
        if (url.includes("cloudinary.com")) return url.replace("/upload/", "/upload/f_auto,q_auto,w_800/");
        return url;
    };

    return (
        <Link to={`/shop?category=${encodeURIComponent(category?.name || '')}`} className="group relative block bg-card rounded-t-[100px] rounded-b-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 border border-border/40 hover:border-primary/30">
            <div className="aspect-[3/4] bg-muted overflow-hidden relative">
                <img src={getOptimized(imageUrl)} alt={`${category?.name || 'Collection'} collection`} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" />
                {/* Elegant overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 backdrop-blur-[2px] transition-all duration-700"></div>
            </div>
            
            {/* Glassmorphic info box pulling up over the image on hover */}
            <div className="p-4 bg-white relative z-10 transition-transform duration-700 group-hover:-translate-y-2 group-hover:bg-white/95 group-hover:backdrop-blur-md rounded-t-2xl border-t border-gray-50 flex flex-col items-center text-center">
                <h3 className="font-serif font-light text-obsidian text-base tracking-wide group-hover:text-[#B8934E] transition-colors">{category?.name}</h3>
                <p className="text-gray-400 text-[8px] mt-1.5 font-bold tracking-[0.2em] uppercase">Curated Selection</p>
                
                {/* Decorative line */}
                <div className="w-6 h-[1px] bg-gradient-to-r from-transparent via-[#B8934E]/50 to-transparent mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100"></div>
            </div>
        </Link>
    );
});

export default CollectionCard;
