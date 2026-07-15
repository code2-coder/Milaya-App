import { ShoppingBag, Heart, Share2 } from "lucide-react";
import { Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/slices/cartSlice";
import { toggleWishlist, selectIsInWishlist } from "../redux/slices/wishlistSlice";
import { formatPrice } from "../utils/priceUtils";
import { toast } from "sonner";
import { memo, useState } from "react";

export const ProductCard = memo(function ProductCard({ product }) {
  const hasVariants = product.variants && product.variants.length > 0;
  const [selectedVariant] = useState(hasVariants ? product.variants[0] : null);

  const dispatch = useDispatch();
  const isWished = useSelector((state) => selectIsInWishlist(state, product._id || product.id));

  
  // Extract correct variant/size properties
  const variantSize = selectedVariant?.sizes?.[0] || product.sizes?.[0];
  const currentStock = variantSize ? variantSize.stock : product.stock;
  const currentPrice = variantSize?.price ?? product.price;
  const currentSizeName = variantSize ? variantSize.size : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ product, quantity: 1, size: currentSizeName, price: currentPrice }));
    toast.success(`${product.name} ${currentSizeName ? `(${currentSizeName})` : ''} added to bag!`);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/product/${product._id || product.id}`;
    const text = `Check out this exquisite ${product.name} at Milaya!`;

    if (window.navigator.share) {
      try {
        await window.navigator.share({
          title: product.name,
          text: text,
          url: url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' \n\n' + url)}`;
      window.open(whatsappUrl, '_blank');
      toast.success("Opened WhatsApp to share!");
    }
  };

  const getImageUrl = () => {
    const originalUrl = (product.images && product.images[0]?.url) || product.image;
    if (originalUrl && originalUrl.includes("cloudinary.com")) {
      return originalUrl.replace("/upload/", "/upload/f_auto,q_auto,w_400/");
    }
    return originalUrl || "https://placehold.co/400x600?text=No+Image";
  };

  const getSecondaryImageUrl = () => {
    const originalUrl = product.images?.[1]?.url || product.images?.[1];
    if (originalUrl && originalUrl.includes("cloudinary.com")) {
      return originalUrl.replace("/upload/", "/upload/f_auto,q_auto,w_400/");
    }
    return originalUrl || null;
  };

  const getSrcSet = () => {
    const originalUrl = (product.images && product.images[0]?.url) || product.image;
    if (originalUrl && originalUrl.includes("cloudinary.com")) {
      return `${originalUrl.replace("/upload/", "/upload/f_auto,q_auto,w_400/")} 400w, 
              ${originalUrl.replace("/upload/", "/upload/f_auto,q_auto,w_600/")} 600w`;
    }
    return undefined;
  };

  const secondaryImage = getSecondaryImageUrl();
  const hasSecondaryImage = !!secondaryImage;

  return (
    <div className="group relative flex flex-col h-full bg-white transition-all duration-500 rounded-2xl border border-stone-100 hover:border-amber-200/50 hover:shadow-[0_20px_45px_rgba(184,147,78,0.08)] max-w-sm mx-auto overflow-hidden">
      
      {/* Image Container */}
      <Link 
        to={`/product/${product._id || product.id}`} 
        aria-label={`View ${product.name} details`} 
        className="block relative aspect-[4/5] bg-[#FCFAF8] overflow-hidden cursor-pointer"
      >
        {/* Primary Image */}
        <img
          src={getImageUrl()}
          srcSet={getSrcSet()}
          sizes="(max-width: 640px) 100vw, 50vw"
          alt={product.name}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${
            hasSecondaryImage ? "md:group-hover:opacity-0" : "group-hover:scale-105"
          }`}
        />

        {/* Secondary Image (cross-fades on hover - Desktop Only) */}
        {hasSecondaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} - alternate view`}
            loading="lazy"
            decoding="async"
            className="hidden md:block absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out opacity-0 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Luxury Badges (Pills) */}
        <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 flex flex-col gap-1 md:gap-2">
          {currentStock < 10 && currentStock > 0 && (
            <span className="text-[#AA8C2C] bg-[#FCFAF8]/95 border border-[#AA8C2C]/30 backdrop-blur-md px-2 md:px-2.5 py-0.5 md:py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.18em] shadow-sm rounded-full">
              Limited
            </span>
          )}
          {currentStock === 0 && (
            <span className="text-white bg-stone-900/90 backdrop-blur-md px-2 md:px-2.5 py-0.5 md:py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.18em] shadow-sm rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Glassmorphic Floating Quick Actions */}
        <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 flex flex-col gap-1.5 md:gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               dispatch(toggleWishlist(product));
            }}
            aria-pressed={isWished}
            aria-label={isWished ? 'Remove from wishlist' : 'Add to wishlist'}
            className="p-1.5 md:p-2.5 bg-white/80 hover:bg-white text-stone-700 hover:text-rose-600 border border-white/20 shadow-md backdrop-blur-md rounded-full transition-all duration-300 transform active:scale-90 hover:scale-105 flex items-center justify-center cursor-pointer"
          >
            <Heart className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-colors duration-200 ${isWished ? "fill-rose-600 text-rose-600" : "text-stone-700"}`} />
          </button>

          <button
            onClick={handleShare}
            aria-label="Share product"
            className="p-1.5 md:p-2.5 bg-white/80 hover:bg-white text-stone-700 hover:text-[#AA8C2C] border border-white/20 shadow-md backdrop-blur-md rounded-full transition-all duration-300 transform hover:scale-105 flex items-center justify-center cursor-pointer"
          >
            <Share2 className={`w-3.5 h-3.5 md:w-4 md:h-4`} />
          </button>
        </div>
        
        {/* Floating Quick Add Button (Sliding Glassmorphism - Desktop Only) */}
        <div className="absolute bottom-4 left-0 right-0 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out hidden md:block z-20 pointer-events-none group-hover:pointer-events-auto px-4">
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            className="w-full py-3.5 bg-stone-900/95 hover:bg-[#800000] text-white rounded-xl shadow-xl font-bold text-[10px] tracking-[0.2em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{currentStock === 0 ? "Out of Stock" : "Add to Bag"}</span>
          </button>
        </div>

      </Link>

      {/* Product Info */}
      <div className="pt-3 pb-4 md:pt-5 md:pb-6 px-3.5 md:px-5 flex flex-col flex-grow bg-white text-center">
        <p className="text-[#AA8C2C] text-[9px] md:text-[10px] mb-1 md:mb-2 font-bold uppercase tracking-[0.2em] md:tracking-[0.25em]">
          {product.category?.name || "Collection"}
        </p>
        
        <Link to={`/product/${product._id || product.id}`} className="focus:outline-none w-full mb-1.5 md:mb-2 inline-block">
          <h3 className="font-serif text-stone-850 hover:text-[#AA8C2C] text-[13px] sm:text-sm md:text-base font-normal leading-snug transition-colors duration-300 line-clamp-2 px-1">
            {product.name}
          </h3>
        </Link>

        {/* Ratings & Reviews Stars Display */}
        {product.ratings !== undefined && product.ratings > 0 && (
          <div className="flex items-center justify-center gap-1 mb-2 md:mb-3">
            <div className="flex text-amber-500 gap-0.5">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 md:w-3.5 md:h-3.5 ${
                    i < Math.round(product.ratings) ? "fill-current" : "text-stone-200"
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-[9px] md:text-[10px] text-stone-400 font-medium font-sans mt-0.5">
              ({product.numOfReviews || 0})
            </span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between w-full pt-1.5 md:pt-3">
          <span className="text-stone-900 font-semibold tracking-wide text-xs sm:text-sm md:text-base text-left">
            {currentPrice != null ? formatPrice(currentPrice) : "Price Unavailable"}
          </span>
          
          {/* Mobile Add to Bag (Circular Action Icon next to Price) */}
          <button
            onClick={handleAddToCart}
            disabled={currentStock === 0}
            className="md:hidden w-8 h-8 rounded-full bg-stone-900 hover:bg-[#800000] text-white flex items-center justify-center transition-all duration-300 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer shrink-0"
            aria-label="Add to bag"
          >
             <ShoppingBag className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
});

