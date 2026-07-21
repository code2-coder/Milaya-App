import { useLocation, Link, Navigate } from "react-router";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { SEO } from "../components/SEO";
import { ArrowLeft, Sparkles } from "lucide-react";

export function VisualSearch() {
  
  const location = useLocation();
  const products = location.state?.results;

  if (!products) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title={"Visual Match Results"} description={"Products visually matching your uploaded image."} />
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[160px] lg:pt-[180px]">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
             <Link to="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-bold text-sm mb-4 transition-colors">
               <ArrowLeft className="w-4 h-4 mr-1" />
               Back to Home
             </Link>
             <h2 className="text-3xl font-black text-gray-800 flex items-center">
               <Sparkles className="w-8 h-8 text-fuchsia-500 mr-3" />
               Visual Match Results
             </h2>
             <p className="text-gray-600 mt-2 font-medium">
               {products.length > 0 
                  ? `AI found ${products.length} products visually similar to your image.` 
                  : "We couldn't find any products that look like your image."}
             </p>
          </div>
        </div>

        {products.length > 0 ? (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
             {products.map((product) => (
               <div key={product._id} className="relative group">
                 <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-black shadow-lg flex items-center border border-white/10">
                   <Sparkles className="w-3 h-3 mr-1 text-yellow-400" />
                   {(product.similarityScore * 100).toFixed(1)}% Match
                 </div>
                 <ProductCard product={product} />
               </div>
             ))}
           </div>
        ) : (
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-gray-800 mb-2">No Visual Matches Found</h3>
             <p className="text-gray-500 mb-6 max-w-md mx-auto">
               Our AI couldn't find any clothing in our catalog that closely matches the style, shape, or color of your uploaded image.
             </p>
             <Link to="/" className="inline-block bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/20 hover:bg-emerald-700 transition-all">
               Browse All Products
             </Link>
           </div>
        )}
      </main>
    </div>
  );
}
