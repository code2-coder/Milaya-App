import { Header } from "../components/Header";
import { lazy, Suspense, useState, useEffect } from "react";
const Footer = lazy(() => import("../components/Footer").then(m => ({ default: m.Footer })));
import { Flower2 } from "lucide-react";
import { useSEO } from "../hooks/useSEO";
import api from "../api/axios";
import { BannerCarousel } from "../components/BannerCarousel";
import { Link } from "react-router";
import { ProductCard } from "../components/ProductCard";

export function Home() {
  useSEO("Home", "Browse Milaya's expansive offering of highly-rated clothing pieces, elegant outerwear, and premium dresses.");

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

        <main className="max-w-[1600px] xl:max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[160px] lg:pt-[180px] w-full min-h-[60vh]">
          {banners.length > 0 && <BannerCarousel banners={banners} />}

          {categories.length > 0 && (
            <section className="py-12 lg:py-16 mt-4">
              <div className="flex flex-col items-center mb-10 text-center">
                <h2 className="text-2xl md:text-3xl font-serif text-obsidian tracking-wide">
                  Shop by Category
                </h2>
                <div className="w-16 h-[2px] bg-[#800000] mt-4 rounded-full"></div>
              </div>
              <div className="flex overflow-x-auto gap-6 pb-6 px-2 xl:justify-center scrollbar-none snap-x" style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}>
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

          {products && products.length > 0 && (
            <section className="py-12 lg:py-16 mt-4 border-t border-gray-100">
              <div className="flex flex-col items-center mb-12 text-center">
                <h2 className="text-2xl md:text-3xl font-serif text-obsidian tracking-wide">
                  Featured Collection
                </h2>
                <div className="w-16 h-[2px] bg-[#800000] mt-4 rounded-full"></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {products.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            </section>
          )}
        </main>

        <Suspense fallback={<div className="h-20 bg-[#0b1121]"></div>}>
          <Footer />
        </Suspense>
      </div>
    </div>
  );
}
