import { useState, useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router";

export function BannerCarousel({ banners }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const isHoveredRef = useRef(false);
  const timerRef = useRef(null);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (!isHoveredRef.current) {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }
    }, 4000);
  }, [banners.length]);

  // Start auto-play whenever banners are available
  useEffect(() => {
    if (banners.length <= 1) return;
    startAutoPlay();
    return () => clearInterval(timerRef.current);
  }, [banners.length, startAutoPlay]);

  const goTo = useCallback((index) => {
    setCurrentIndex((index + banners.length) % banners.length);
    // Reset timer on manual navigation
    startAutoPlay();
  }, [banners.length, startAutoPlay]);

  const goToPrev = (e) => { if (e) e.preventDefault(); goTo(currentIndex - 1); };
  const goToNext = (e) => { if (e) e.preventDefault(); goTo(currentIndex + 1); };

  if (!banners || banners.length === 0) return null;

  const getBannerSrc = (url) => {
    if (url && url.includes("cloudinary.com")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_1920/");
    }
    return url;
  };

  const getBannerSrcSet = (url) => {
    if (url && url.includes("cloudinary.com")) {
      return `${url.replace("/upload/", "/upload/f_auto,q_auto,w_600/")} 600w, ${url.replace("/upload/", "/upload/f_auto,q_auto,w_1200/")} 1200w, ${url.replace("/upload/", "/upload/f_auto,q_auto,w_1920/")} 1920w`;
    }
    return undefined;
  };

  return (
    <div className="w-full pb-6 sm:pb-12 pt-0 px-2 sm:px-0">
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/9] lg:aspect-[1800/720] overflow-hidden group bg-gray-50 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/5 transition-all duration-700 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
      >
        {/* Slides */}
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          const content = (
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
              {/* Blurred background for mobile to fill aspect ratio gaps beautifully */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-50 sm:opacity-30 scale-125"
                style={{ backgroundImage: `url(${getBannerSrc(banner.image)})` }}
              />
              <img
                src={getBannerSrc(banner.image)}
                srcSet={getBannerSrcSet(banner.image)}
                sizes="100vw"
                alt={banner.title || `Banner ${index + 1}`}
                loading={index === 0 ? "eager" : "lazy"}
                fetchpriority={index === 0 ? "high" : "auto"}
                decoding="async"
                className={`relative z-10 w-full h-full object-contain sm:object-cover object-center transition-transform ease-in-out will-change-transform ${
                  isActive ? "scale-105 duration-[8000ms]" : "scale-100 duration-1000"
                }`}
              />
            </div>
          );

          return (
            <div
              key={banner._id || banner.id || index}
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {banner.link ? (
                <Link to={banner.link} className="block w-full h-full cursor-pointer relative group/link">
                  {content}
                  <div className="absolute inset-0 bg-black/0 group-hover/link:bg-black/5 transition-colors duration-700 z-20 pointer-events-none" />
                </Link>
              ) : (
                <div className="block w-full h-full relative">
                  {content}
                </div>
              )}
            </div>
          );
        })}


        {/* Left Arrow */}
        {banners.length > 1 && (
          <button
            onClick={goToPrev}
            aria-label="Previous banner"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md border border-black/10 text-black opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 hover:bg-white hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.1)] cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>
        )}

        {/* Right Arrow */}
        {banners.length > 1 && (
          <button
            onClick={goToNext}
            aria-label="Next banner"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md border border-black/10 text-black opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 hover:bg-white hover:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.1)] cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2]" />
          </button>
        )}

        {/* Pagination Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 sm:gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); goTo(idx); }}
                className={`transition-all duration-500 rounded-full cursor-pointer overflow-hidden ${
                  idx === currentIndex 
                    ? "w-6 sm:w-8 h-1.5 sm:h-1.5 bg-black" 
                    : "w-1.5 sm:w-2 h-1.5 sm:h-1.5 bg-black/30 hover:bg-black/50"
                }`}
                aria-label={`Go to banner ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
