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
        className="relative w-full aspect-[1800/480] overflow-hidden group bg-muted/30 rounded-xl sm:rounded-2xl shadow-[0_20px_40px_-15px_rgba(74,4,78,0.15)] border border-border/40 transition-shadow duration-700 hover:shadow-[0_30px_60px_-15px_rgba(74,4,78,0.25)]"
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


      </div>

      {/* Bottom: Arrows row */}
      {banners.length > 1 && (
        <div className="flex items-center justify-center mt-4 gap-3">
          {/* Left Arrow */}
          <button
            onClick={goToPrev}
            aria-label="Previous banner"
            className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center text-white hover:bg-[#600000] active:scale-95 transition-all duration-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={goToNext}
            aria-label="Next banner"
            className="w-8 h-8 rounded-full bg-[#800000] flex items-center justify-center text-white hover:bg-[#600000] active:scale-95 transition-all duration-200 shadow-sm"
          >
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      )}
    </div>
  );
}
