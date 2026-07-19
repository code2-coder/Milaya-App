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
    <div className="w-full pb-4 sm:pb-10 pt-0">
      <div
        className="relative w-full aspect-[1800/720] overflow-hidden group bg-muted/30 rounded-xl sm:rounded-2xl shadow-[0_20px_40px_-15px_rgba(74,4,78,0.15)] border border-border/40 transition-shadow duration-700 hover:shadow-[0_30px_60px_-15px_rgba(74,4,78,0.25)]"
        onMouseEnter={() => { isHoveredRef.current = true; }}
        onMouseLeave={() => { isHoveredRef.current = false; }}
      >
        {/* Slides */}
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          const content = (
            <img
              src={getBannerSrc(banner.image)}
              srcSet={getBannerSrcSet(banner.image)}
              sizes="100vw"
              alt={banner.title || `Banner ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              fetchpriority={index === 0 ? "high" : "auto"}
              decoding="async"
              className={`w-full h-full object-cover object-center transition-transform ease-in-out will-change-transform ${
                isActive ? "scale-105 duration-[8000ms]" : "scale-100 duration-1000"
              }`}
            />
          );

          return (
            <div
              key={banner._id || banner.id || index}
              className={`absolute inset-0 transition-opacity duration-[1200ms] ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {banner.link ? (
                <Link to={banner.link} className="block w-full h-full cursor-pointer relative">
                  {content}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 mix-blend-multiply" />
                </Link>
              ) : (
                <div className="block w-full h-full relative">
                  {content}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent opacity-50 mix-blend-multiply pointer-events-none" />
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
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all duration-500 hover:bg-white hover:text-black hover:border-white hover:scale-110 shadow-[0_8px_32px_rgba(0,0,0,0.3)] cursor-pointer group/arrow"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] transition-colors duration-300" />
          </button>
        )}

        {/* Right Arrow */}
        {banners.length > 1 && (
          <button
            onClick={goToNext}
            aria-label="Next banner"
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500 hover:bg-white hover:text-black hover:border-white hover:scale-110 shadow-[0_8px_32px_rgba(0,0,0,0.3)] cursor-pointer group/arrow"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] transition-colors duration-300" />
          </button>
        )}

        {/* Pagination Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.preventDefault(); goTo(idx); }}
                className={`transition-all duration-500 rounded-full cursor-pointer ${
                  idx === currentIndex 
                    ? "w-8 sm:w-10 h-1.5 sm:h-2 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                    : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/50 hover:bg-white/80 hover:scale-110"
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
