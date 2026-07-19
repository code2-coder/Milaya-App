import { Header } from "../components/Header";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
const Footer = lazy(() => import("../components/Footer").then(m => ({ default: m.Footer })));
import { Flower2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSEO } from "../hooks/useSEO";
import api from "../api/axios";
import { BannerCarousel } from "../components/BannerCarousel";
import { Link } from "react-router";
import { ProductCard } from "../components/ProductCard";

import { LimitedTimeOffer } from "../components/home/LimitedTimeOffer";
import { PremiumWhyChooseUs } from "../components/home/PremiumWhyChooseUs";
import { CustomerReviews } from "../components/home/CustomerReviews";
import { InstagramGallery } from "../components/home/InstagramGallery";

export function Home() {
  useSEO("Home", "Browse Milaya's expansive offering of highly-rated clothing pieces, elegant outerwear, and premium dresses.");

  const womensRef = useRef(null);
  const mensRef = useRef(null);
  const kidsRef = useRef(null);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth / 2 : scrollLeft + clientWidth / 2;
      ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bannersRes, categoriesRes, productsRes] = await Promise.all([
          api.get("/banners"),
          api.get("/categories"),
          api.get("/products?limit=1000")
        ]);
        setBanners(bannersRes.data.banners || bannersRes.data.data?.banners || []);
        setCategories(categoriesRes.data.categories || categoriesRes.data.data?.categories || []);
        setProducts(productsRes.data.products || productsRes.data.data?.products || []);
      } catch (error) {
        console.error("Failed to fetch data", error);
      }
    };
    fetchData();
  }, []);

  const getCategoryImage = (category) => {
    if (category?.image?.url) return category.image.url;
    if (category?.image?.public_id) return `/api/v1/files/${category.image.public_id}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(category.name)}&background=random&size=400`;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <div className="relative z-10">
        <Header />

        <main className="max-w-[1600px] xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[100px] lg:pt-[120px] w-full min-h-[60vh]">
          {banners.length > 0 && <BannerCarousel banners={banners} />}

          {categories.length > 0 && (
            <section className="pt-12 pb-4 lg:pt-16 lg:pb-6 mt-4">
              <div className="flex flex-col items-center mb-10 text-center">
                <h2 className="text-2xl md:text-3xl font-serif text-obsidian tracking-wide">
                  Explore By Category
                </h2>
                <div className="w-16 h-[2px] bg-[#800000] mt-4 rounded-full"></div>
              </div>
              <div className="flex overflow-x-auto gap-6 pb-6 px-2 justify-center scrollbar-none snap-x" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
                {categories.filter(c => !c.parentCategory).map((category) => (
                  <Link 
                    key={category._id}
                    to={`/shop?category=${encodeURIComponent(category.name)}`}
                    className="flex flex-col items-center gap-4 flex-shrink-0 snap-center group w-[100px] sm:w-[130px] md:w-[150px]"
                  >
                    <div className="w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden shadow-sm border-4 border-gray-50 group-hover:shadow-md group-hover:border-[#B8934E]/20 transition-all duration-500 relative">
                      <img 
                        src={getCategoryImage(category)} 
                        alt={category.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500"></div>
                    </div>
                    <span className="text-sm md:text-base font-medium text-gray-800 group-hover:text-[#800000] transition-colors duration-300 text-center uppercase tracking-wider text-[11px] sm:text-xs md:text-sm">
                      {category.name}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Featured Collections */}
          <section className="pt-0 pb-16 lg:pt-2 lg:pb-24">
            <div className="flex flex-col items-center mb-12 lg:mb-16 text-center">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-obsidian tracking-wide">
                Featured Collections
              </h2>
              <div className="w-24 h-[2px] bg-[#800000] mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 px-4 sm:px-6 lg:px-10 pb-12 lg:pb-24">
              {[
                {
                  title: "New Arrivals",
                  image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
                  link: "/shop?sort=newest"
                },
                {
                  title: "Trending Now",
                  image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
                  link: "/shop?tag=trending"
                },
                {
                  title: "Best Sellers",
                  image: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&q=80&w=800",
                  link: "/shop?sort=bestselling"
                }
              ].map((collection, index) => (
                <Link
                  key={index}
                  to={collection.link}
                  className={`group relative overflow-hidden flex flex-col h-[450px] sm:h-[550px] lg:h-[700px] w-full bg-gray-100 rounded-sm shadow-md hover:shadow-2xl transition-all duration-700 ${index === 1 ? 'md:mt-12 lg:mt-16' : ''}`}
                >
                  {/* Subtle Inner Frame on Hover */}
                  <div className="absolute inset-4 sm:inset-6 border border-white/0 group-hover:border-white/30 transition-colors duration-700 z-20 pointer-events-none"></div>

                  <img
                    src={collection.image}
                    alt={collection.title}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-[1.07]"
                  />
                  {/* Gradient Overlay for Text Readability - Darker at bottom, slight vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10 opacity-70 group-hover:opacity-80 transition-opacity duration-700 z-10"></div>
                  
                  {/* Content Container */}
                  <div className="absolute inset-x-0 bottom-0 p-8 sm:p-12 flex flex-col items-center justify-end text-center z-20">
                    <div className="relative overflow-hidden pb-2">
                      <h3 className="text-white text-2xl sm:text-3xl lg:text-4xl font-serif tracking-[0.15em] uppercase drop-shadow-lg transform transition-transform duration-700 group-hover:-translate-y-2">
                        {collection.title}
                      </h3>
                      {/* Expanding underline effect */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-white/80 transition-all duration-700 group-hover:w-full"></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Women's Collection */}
          {products.length > 0 && (
            <section className="py-16 lg:py-24 bg-gradient-to-b from-stone-50/50 to-white relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8934E]/5 rounded-full blur-[80px] pointer-events-none translate-x-1/3 -translate-y-1/2"></div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 lg:mb-14 px-4 sm:px-6 lg:px-10 relative z-10">
                <div className="flex flex-col mb-6 sm:mb-0 max-w-2xl">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#B8934E] uppercase mb-3">Curated Excellence</span>
                  <h2 className="text-4xl md:text-5xl font-serif text-obsidian tracking-wide">
                    Women's Collection
                  </h2>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <Link 
                    to="/shop?category=Women" 
                    className="group flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest hover:text-[#B8934E] transition-colors"
                  >
                    <span className="relative">
                      View Entire Collection
                      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#B8934E] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => scroll(womensRef, 'left')} 
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                    >
                      <ChevronLeft size={20} className="stroke-[1.5]" />
                    </button>
                    <button 
                      onClick={() => scroll(womensRef, 'right')} 
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                    >
                      <ChevronRight size={20} className="stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontal Scroll Container */}
              <div 
                ref={womensRef}
                className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 pb-10 snap-x scroll-smooth"
                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              >
                {/* Hide Webkit Scrollbar through inline styles if global css doesn't have it */}
                <style>{`
                  .snap-x::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {(products.filter(p => p.category?.name?.toLowerCase().includes('women') || p.name?.toLowerCase().includes('women')).length > 0 
                  ? products.filter(p => p.category?.name?.toLowerCase().includes('women') || p.name?.toLowerCase().includes('women')) 
                  : products
                ).slice(0, 10).map((product) => (
                  <div key={product._id} className="w-[260px] sm:w-[280px] lg:w-[320px] snap-center flex-shrink-0 group">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Men's Collection */}
          {products.length > 0 && (
            <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50/80 to-white relative">
              <div className="absolute top-0 left-0 w-64 h-64 bg-slate-400/5 rounded-full blur-[80px] pointer-events-none -translate-x-1/3 -translate-y-1/2"></div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 lg:mb-14 px-4 sm:px-6 lg:px-10 relative z-10">
                <div className="flex flex-col mb-6 sm:mb-0 max-w-2xl">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-slate-500 uppercase mb-3">Men's Collection</span>
                  <h2 className="text-4xl md:text-5xl font-serif text-obsidian tracking-wide mb-4">
                    The Men's Collection Edit
                  </h2>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-xl font-medium">
                    An exquisite curation of masterful design, where timeless tradition seamlessly meets modern brilliance.
                  </p>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <Link 
                    to="/shop?category=Men" 
                    className="group flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    <span className="relative">
                      View Entire Collection
                      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-slate-600 transition-all duration-300 group-hover:w-full"></span>
                    </span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => scroll(mensRef, 'left')} 
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                    >
                      <ChevronLeft size={20} className="stroke-[1.5]" />
                    </button>
                    <button 
                      onClick={() => scroll(mensRef, 'right')} 
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                    >
                      <ChevronRight size={20} className="stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontal Scroll Container */}
              <div 
                ref={mensRef}
                className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 pb-10 snap-x scroll-smooth"
                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              >
                {(products.filter(p => (p.category?.name?.toLowerCase().includes('men') && !p.category?.name?.toLowerCase().includes('women')) || (p.name?.toLowerCase().includes('men') && !p.name?.toLowerCase().includes('women'))).length > 0 
                  ? products.filter(p => (p.category?.name?.toLowerCase().includes('men') && !p.category?.name?.toLowerCase().includes('women')) || (p.name?.toLowerCase().includes('men') && !p.name?.toLowerCase().includes('women'))) 
                  : products
                ).slice(0, 10).map((product) => (
                  <div key={product._id} className="w-[260px] sm:w-[280px] lg:w-[320px] snap-center flex-shrink-0 group">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Kids Collection */}
          {products.length > 0 && (
            <section className="py-16 lg:py-24 bg-gradient-to-b from-[#FAF4F0] to-white relative">
              <div className="absolute top-0 right-1/4 w-64 h-64 bg-[#E8C5A8]/10 rounded-full blur-[80px] pointer-events-none -translate-y-1/2"></div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 lg:mb-14 px-4 sm:px-6 lg:px-10 relative z-10">
                <div className="flex flex-col mb-6 sm:mb-0 max-w-2xl">
                  <span className="text-[10px] font-bold tracking-[0.25em] text-[#D4A373] uppercase mb-3">Playful Styles</span>
                  <h2 className="text-4xl md:text-5xl font-serif text-obsidian tracking-wide">
                    Kids Collection
                  </h2>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <Link 
                    to="/shop?category=Kids" 
                    className="group flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-widest hover:text-[#D4A373] transition-colors"
                  >
                    <span className="relative">
                      View Entire Collection
                      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4A373] transition-all duration-300 group-hover:w-full"></span>
                    </span>
                    <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => scroll(kidsRef, 'left')} 
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                    >
                      <ChevronLeft size={20} className="stroke-[1.5]" />
                    </button>
                    <button 
                      onClick={() => scroll(kidsRef, 'right')} 
                      className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-black hover:text-white hover:border-black transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)]"
                    >
                      <ChevronRight size={20} className="stroke-[1.5]" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Horizontal Scroll Container */}
              <div 
                ref={kidsRef}
                className="flex overflow-x-auto gap-4 sm:gap-6 px-4 sm:px-6 lg:px-10 pb-10 snap-x scroll-smooth"
                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              >
                {(products.filter(p => {
                  const searchStr = `${p.category?.name || ''} ${p.name || ''}`.toLowerCase();
                  return searchStr.includes('kid') || searchStr.includes('girl') || searchStr.includes('boy');
                }).length > 0 
                  ? products.filter(p => {
                      const searchStr = `${p.category?.name || ''} ${p.name || ''}`.toLowerCase();
                      return searchStr.includes('kid') || searchStr.includes('girl') || searchStr.includes('boy');
                    }) 
                  : products
                ).slice(0, 10).map((product) => (
                  <div key={product._id} className="w-[260px] sm:w-[280px] lg:w-[320px] snap-center flex-shrink-0 group">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>
          )}


        </main>

        {/* Full-width Premium Sections */}

        <LimitedTimeOffer />
        <PremiumWhyChooseUs />
        <CustomerReviews />
        <InstagramGallery />

        <Suspense fallback={<div className="h-20 bg-[#0b1121]"></div>}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}
