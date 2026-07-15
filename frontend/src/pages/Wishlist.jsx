import { useWishlist } from "../context/WishlistContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ProductCard } from "../components/ProductCard";
import { Link } from "react-router";
import { Heart } from "lucide-react";

export function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24 pt-[160px] lg:pt-[180px] w-full">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#B8934E]"></div>
            <Heart className="w-6 h-6 text-[#800000] fill-transparent" />
            <div className="h-[1px] w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#B8934E]"></div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#2D0D18] tracking-tight">Your Wishlist</h1>
        </div>

        {wishlist.length === 0 ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#FAF9F6] rounded-[2rem] border border-[#800000]/10 p-12 sm:p-20 text-center flex flex-col items-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] relative overflow-hidden group">
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#DDA7A5]/20 rounded-full blur-[80px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#B8934E]/10 rounded-full blur-[80px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

              <div className="relative mb-8">
                <div className="absolute inset-0 bg-[#800000]/5 rounded-full blur-2xl animate-pulse"></div>
                <div className="w-24 h-24 rounded-full bg-white shadow-xl border border-[#800000]/10 flex items-center justify-center relative z-10 group-hover:-translate-y-2 transition-transform duration-500">
                  <Heart className="w-10 h-10 text-[#DDA7A5]" strokeWidth={1.5} />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#2D0D18] mb-4 relative z-10">Your wishlist is empty</h2>
              <p className="text-[#5C1A1B]/70 mb-10 max-w-lg text-[15px] sm:text-[16px] leading-relaxed relative z-10">
                Save your favorite items here so you never lose track of them. Start exploring our exquisite collections to find your perfect piece!
              </p>
              
              <Link
                to="/"
                className="relative z-10 bg-gradient-to-r from-[#5C1A1B] to-[#800000] text-white text-[12px] uppercase tracking-widest font-bold px-10 py-4 rounded-full hover:shadow-[0_15px_30px_rgba(128,0,0,0.2)] hover:-translate-y-1 transition-all duration-300"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-10 border-b border-[#800000]/10 pb-6">
              <p className="text-[#5C1A1B] text-[15px] font-medium tracking-wide">
                You have <span className="font-bold text-[#800000]">{wishlist.length}</span> {wishlist.length === 1 ? 'piece' : 'pieces'} saved in your collection.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {wishlist.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
