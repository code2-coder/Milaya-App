import { useParams, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import api from "../api/axios";
import {
  ShoppingCart,
  ShoppingBag,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  Package,
  Truck,
  Star,
  User,
  ThumbsUp,
  Calendar,
  Play,
  X,
  MapPin,
  Zap,
  Headphones,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import { ProductSchema } from "../components/ProductSchema";
import { motion } from "motion/react";
import { useCategory } from "../context/CategoryContext";
import { CollectionCard } from "../components/CollectionCard";
import { formatPrice } from "../utils/priceUtils";
import { PackagingInfo } from "../components/ShippingAndPackaging";
import { getPackagingText } from "../api/shippingService";
import ProductReviewsSection from "../components/reviews/ProductReviewsSection";

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedColorVariant, setSelectedColorVariant] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const { categories } = useCategory();

  const thumbnailsRef = useRef(null);
  const [packagingText, setPackagingText] = useState("Every piece arrives in our signature Milaya presentation sachet.");
  const [zipCode, setZipCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [checked, setChecked] = useState(false);

  const handleCheckAvailability = async () => {
    if (!zipCode.trim()) return;
    setIsChecking(true);
    setChecked(false);
    try {
      const { data } = await api.get(`/delhivery/serviceability/${zipCode.trim()}`);
      if (data.success && data.data && data.data.isServiceable) {
        setAvailability(data.data);
      } else {
        setAvailability(null);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailability(null);
    } finally {
      setIsChecking(false);
      setChecked(true);
    }
  };

  useEffect(() => {
    const fetchPackagingText = async () => {
      try {
        const text = await getPackagingText("product");
        setPackagingText(text || "Every piece arrives in our signature Milaya presentation sachet.");
      } catch (err) {
        console.error("Error loading packaging text:", err);
      }
    };
    fetchPackagingText();
  }, []);

  const scrollThumbnails = (direction) => {
    if (thumbnailsRef.current) {
      const scrollAmount = 200;
      thumbnailsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getOptimizedUrl = (url, width) => {
    if (url && url.includes("cloudinary.com")) {
      return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
    }
    return url;
  };

  // Review states are handled by ProductReviewsSection

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/products/${id}`);
        setProduct(data.product);
        if (data.product.variants && data.product.variants.length > 0) {
          const firstVariant = data.product.variants[0];
          setSelectedColorVariant(firstVariant);
          if (firstVariant.sizes && firstVariant.sizes.length > 0) {
            const firstAvailableSize = firstVariant.sizes.find(s => s.stock > 0) || firstVariant.sizes[0];
            setSelectedSize(firstAvailableSize);
          }
        } else if (data.product.sizes && data.product.sizes.length > 0) {
          const firstAvailableSize = data.product.sizes.find(s => s.stock > 0) || data.product.sizes[0];
          setSelectedSize(firstAvailableSize);
        }

        // Fetch related products
        if (data.product?.category) {
          try {
            const categoryId = data.product.category._id || data.product.category;
            const relatedRes = await api.get(`/products?category=${categoryId}`);
            const related = (relatedRes.data.products || [])
              .filter(p => p._id !== data.product._id)
              .slice(0, 4);
            setRelatedProducts(related);
          } catch (err) {
            console.error("Failed to fetch related products", err);
          }
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const displayPrice = selectedSize ? selectedSize.price : product?.price || 0;
  const displayStock = selectedSize ? selectedSize.stock : product?.stock || 0;
  const displayComparePrice = selectedSize?.comparePrice;

  const handleAddToCart = () => {
    if (product) {
      const variantDesc = [selectedColorVariant?.variantName, selectedSize?.size].filter(Boolean).join(" - ");
      addToCart(product, quantity, variantDesc, selectedSize?.price || displayPrice);
      toast.success(`${quantity} x ${product.name} ${variantDesc ? `(${variantDesc})` : ''} added to cart!`);
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < displayStock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  useSEO(
    product ? product.name : "Loading Product...",
    product ? `${product.name} - ${product.description.substring(0, 150)}...` : "Premium Tech Product",
    {
      image: product?.images?.[0]?.url || product?.image,
      type: "product",
      keywords: product ? `${product.name}, tech, hardware, Milaya` : "tech, hardware"
    }
  );

  // Review methods and stats are handled by ProductReviewsSection

  const specificationEntries = [
    { label: "Product Type", value: product?.productType },
    { label: "Material", value: product?.material },
    { label: "Metal", value: product?.metal },
    { label: "Stone Type", value: product?.stoneType },
    { label: "Finish", value: product?.finish },
    { label: "Color", value: product?.color },
    { label: "Theme", value: product?.theme },
    { label: "Style", value: product?.style },
    { label: "Pattern", value: product?.pattern },
    { label: "Shape", value: product?.shape },
    { label: "Origin", value: product?.countryOfOrigin },
    { label: "Weight", value: product?.weight },
    { label: "Dimensions", value: product?.dimensions },
  ].filter((item) => Boolean(item.value));

  const getVariantAccent = (variantName = "") => {
    const name = variantName.toLowerCase();
    if (name.includes("emerald") || name.includes("green")) {
      return { border: "border-emerald-500", text: "text-emerald-700", swatch: "#10b981" };
    }
    if (name.includes("ruby") || name.includes("red") || name.includes("crimson")) {
      return { border: "border-rose-500", text: "text-rose-700", swatch: "#f43f5e" };
    }
    if (name.includes("pearl") || name.includes("white") || name.includes("ivory")) {
      return { border: "border-slate-300", text: "text-slate-700", swatch: "#f8fafc" };
    }
    if (name.includes("premium") || name.includes("amber") || name.includes("yellow")) {
      return { border: "border-amber-400", text: "text-amber-700", swatch: "#f59e0b" };
    }
    if (name.includes("blue") || name.includes("sapphire")) {
      return { border: "border-sky-500", text: "text-sky-700", swatch: "#0ea5e9" };
    }
    return { border: "border-[#B8934E]", text: "text-[#B8934E]", swatch: "#B8934E" };
  };

  // Show a lightweight skeleton while initial product data is loading
  if (loading && !product) {
    return (
      <div className="min-h-screen bg-muted/30">
        <Header />
        <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-100 w-32 mb-10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-4">
                <div className="w-full h-[600px] bg-muted/30 rounded-none border border-border/50" />
                <div className="flex space-x-3">
                  <div className="w-20 h-20 bg-muted/30 rounded-none border border-border/50" />
                  <div className="w-20 h-20 bg-muted/30 rounded-none border border-border/50" />
                  <div className="w-20 h-20 bg-muted/30 rounded-none border border-border/50" />
                </div>
              </div>
              <div className="bg-white p-8">
                <div className="h-8 bg-gray-100 w-64 mb-6" />
                <div className="h-6 bg-gray-100 w-32 mb-8" />
                <div className="h-3 bg-muted/30 w-full mb-3" />
                <div className="h-3 bg-muted/30 w-full mb-3" />
                <div className="h-14 bg-gray-100 w-full mt-10 rounded-none" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <ProductSchema product={product} />

      <main className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[160px] lg:pt-[180px]">
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-muted-foreground/70 hover:text-foreground transition-colors mb-10 text-[10px] uppercase tracking-[0.2em] font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Collections</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mb-16 overflow-hidden max-w-5xl mx-auto">
          {/* Product Gallery - Compact Layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-3 lg:sticky lg:top-24 h-fit -mt-6 lg:-mt-12"
          >
            {/* Main Image / Video */}
            {activeImage === 'video' && (selectedColorVariant?.videos?.[0] || product?.videos?.[0]) ? (
              <div className="w-[85%] sm:w-[75%] md:w-[90%] lg:w-[80%] mx-auto relative overflow-hidden bg-gray-50 flex items-center justify-center aspect-[4/5] rounded-xl shadow-sm">
                <video
                  src={selectedColorVariant?.videos?.[0]?.url || product?.videos?.[0]?.url}
                  autoPlay
                  loop
                  muted
                  controls
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              </div>
            ) : (
              <div className="w-[85%] sm:w-[75%] md:w-[90%] lg:w-[80%] mx-auto relative overflow-hidden bg-gray-50 flex items-center justify-center aspect-[4/5] group rounded-xl shadow-sm">
                {/* Main Image (Always visible) */}
                <img
                  onClick={() => setIsLightboxOpen(true)}
                  src={getOptimizedUrl((selectedColorVariant?.images && selectedColorVariant.images[activeImage]?.url) || (product?.images && product.images[activeImage]?.url) || product?.image, 1200) || "https://placehold.co/800x1000"}
                  alt={`${product.name} - Main`}
                  loading="eager"
                  decoding="async"
                  className="w-full h-full object-cover cursor-zoom-in hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>
            )}

            {/* Sub Images Horizontal Line - Tiny Thumbnails */}
            {((selectedColorVariant?.videos?.length > 0 || product?.videos?.length > 0) || (selectedColorVariant?.images && selectedColorVariant.images.length > 1) || (product?.images && product.images.length > 1)) && (
              <div className="relative group/thumbs w-[85%] sm:w-[75%] md:w-[90%] lg:w-[80%] mx-auto">
                <button
                  onClick={() => scrollThumbnails('left')}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -ml-2 z-10 bg-white/90 backdrop-blur shadow-md border border-gray-100 rounded-full p-1 text-gray-500 hover:text-obsidian hover:scale-110 transition-all opacity-0 group-hover/thumbs:opacity-100 hidden sm:block"
                >
                  <ArrowLeft className="w-3 h-3" />
                </button>

                <div
                  ref={thumbnailsRef}
                  className="flex gap-2 sm:gap-2.5 overflow-x-auto pb-2 pt-1 px-1 w-full scroll-smooth"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {(selectedColorVariant?.images || product?.images || [])?.map((img, index) => (
                    <button
                      key={img.public_id || index}
                      onClick={() => setActiveImage(index)}
                      aria-pressed={activeImage === index}
                      className={`w-10 sm:w-12 rounded-md flex-shrink-0 aspect-[4/5] relative overflow-hidden bg-gray-50 transition-all duration-300 ${activeImage === index ? 'ring-2 ring-offset-2 ring-obsidian opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <img
                        src={getOptimizedUrl(img.url, 200)}
                        alt={`${product.name} - Thumbnail ${index + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 mix-blend-multiply"
                      />
                    </button>
                  ))}
                  {(selectedColorVariant?.videos?.length > 0 || product?.videos?.length > 0) && (
                    <button
                      onClick={() => setActiveImage('video')}
                      aria-label="View product video"
                      aria-pressed={activeImage === 'video'}
                      className={`w-10 sm:w-12 rounded-md flex-shrink-0 aspect-[4/5] relative overflow-hidden bg-gray-50 transition-all duration-300 group ${activeImage === 'video' ? 'ring-2 ring-offset-2 ring-obsidian opacity-100' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <video src={selectedColorVariant?.videos?.[0]?.url || product?.videos?.[0]?.url} className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                        <Play className="w-5 h-5 text-white drop-shadow-md" fill="white" />
                      </div>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => scrollThumbnails('right')}
                  className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2 z-10 bg-white/90 backdrop-blur shadow-md border border-gray-100 rounded-full p-1 text-gray-500 hover:text-obsidian hover:scale-110 transition-all opacity-0 group-hover/thumbs:opacity-100 hidden sm:block"
                >
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Minimal Specifications Below Images */}
            {specificationEntries.length > 0 && (
              <div className="mt-16 w-[85%] sm:w-[75%] md:w-[90%] lg:w-[80%] mx-auto">
                <h3 className="text-sm font-black uppercase tracking-widest text-obsidian mb-3 border-b border-gray-200 pb-2">Specifications</h3>
                <div className="flex flex-col">
                  {specificationEntries.map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="text-xs font-medium text-gray-500">{item.label}</span>
                      <span className="text-xs font-semibold text-obsidian text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Product Info - Compact Layout */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                  delayChildren: 0.3
                }
              }
            }}
            className="bg-white p-0 lg:pl-6 xl:pl-10 flex flex-col justify-start"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-8">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="inline-block text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-[#B8934E] border-b border-[#B8934E]/30 pb-0.5 hover:tracking-[0.25em] transition-all duration-300 cursor-default">
                  {(() => {
                    const cat = product.category?.name || product.category;
                    if (!cat || cat === "Uncategorized" || (typeof cat === "string" && cat.match(/^[0-9a-fA-F]{24}$/))) {
                      return "Premium Collection";
                    }
                    return cat;
                  })()}
                </span>
              </div>

              <h1 className="text-lg sm:text-xl font-serif text-obsidian mb-4 font-bold tracking-tight leading-tight hover:text-[#B8934E] transition-all duration-500 cursor-default">{product.name}</h1>

              <div className="flex items-center space-x-3 mb-4">
                <div className="flex text-[#B8934E]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < (product.ratings || 0) ? "fill-current" : "text-gray-200 fill-current"}`} />
                  ))}
                </div>
                <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest">({product.numOfReviews || 0} reviews)</span>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-baseline space-x-3">
                  <span className="text-lg sm:text-xl font-bold text-obsidian">
                    {formatPrice(displayPrice)}
                  </span>
                  {displayComparePrice > displayPrice && (
                    <span className="text-gray-400 line-through text-base font-medium tracking-wide">
                      {formatPrice(displayComparePrice)}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-800 text-sm leading-relaxed font-medium">{product.description}</p>
            </motion.div>

            {((product.variants && product.variants.length > 0) || (product.sizes && product.sizes.length > 0)) && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-8">

                {/* Size Selection */}
                {((selectedColorVariant?.sizes && selectedColorVariant.sizes.length > 0) || (product.sizes && product.sizes.length > 0)) && (
                  <div className="mb-6">
                    <label className="block text-xs uppercase tracking-[0.2em] font-black text-gray-800 mb-4">
                      Select Size
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {(selectedColorVariant?.sizes || product.sizes || []).map((sizeObj, idx) => (
                        <button
                          key={sizeObj._id || idx}
                          onClick={() => {
                            setSelectedSize(sizeObj);
                            setQuantity(1);
                          }}
                          disabled={sizeObj.stock === 0}
                          className={`px-4 py-1.5 font-bold text-[10px] sm:text-xs tracking-widest uppercase transition-all duration-300 rounded border hover:-translate-y-0.5 hover:shadow-sm ${selectedSize?._id === sizeObj._id || (selectedSize && selectedSize.size === sizeObj.size)
                            ? "bg-obsidian text-white border-obsidian shadow-sm"
                            : sizeObj.stock === 0
                              ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed hover:-translate-y-0 hover:shadow-none"
                              : "bg-white text-gray-800 border-gray-300 hover:border-obsidian hover:text-obsidian"
                            }`}
                        >
                          {sizeObj.size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {product.variants && product.variants.length > 0 && (
                  <div>
                    <label className="block text-sm uppercase tracking-[0.2em] font-black text-gray-800 mb-4">
                      {(() => {
                        const selectedDisplayColor = selectedColorVariant?.colorHex || getVariantAccent(selectedColorVariant?.variantName).swatch;
                        const isWhite = selectedDisplayColor && ['#ffffff', '#fff', 'white', '#f8fafc'].includes(selectedDisplayColor.toLowerCase());
                        return (
                          <>
                            Select Color: <span 
                              className={`ml-2 font-serif text-xl font-bold capitalize ${isWhite ? 'bg-black px-2 py-0.5 rounded' : ''}`} 
                              style={{ color: selectedDisplayColor }}
                            >
                              {selectedColorVariant?.variantName}
                            </span>
                          </>
                        );
                      })()}
                    </label>
                    <div className="flex flex-wrap gap-4">
                      {product.variants.map((variant, idx) => {
                        const accent = getVariantAccent(variant.variantName);
                        const displayColor = variant.colorHex || accent.swatch;
                        return (
                          <button
                            key={variant._id || idx}
                            onClick={() => {
                              setSelectedColorVariant(variant);
                              setActiveImage(0);
                              if (variant.sizes && variant.sizes.length > 0) {
                                const firstAvail = variant.sizes.find(s => s.stock > 0) || variant.sizes[0];
                                setSelectedSize(firstAvail);
                                setQuantity(1);
                              } else {
                                setSelectedSize(null);
                              }
                            }}
                            className={`group relative flex flex-col items-center p-2 rounded transition-all duration-300 w-28 hover:-translate-y-1 hover:shadow-lg ${selectedColorVariant?._id === variant._id || (selectedColorVariant && selectedColorVariant.variantName === variant.variantName)
                              ? `border-none ring-2 ring-obsidian ring-offset-2 bg-gray-50 shadow-md`
                              : `border-transparent bg-white hover:bg-gray-50`
                              }`}
                            title={variant.variantName}
                          >
                            <div className="absolute right-3 top-2 h-3 w-3 rounded-full border border-white/70 shadow-sm z-10" style={{ backgroundColor: displayColor }} />
                            <div className="relative w-16 h-16 mb-2 rounded-lg overflow-hidden border border-gray-100 bg-[#FAF9F6]">
                              <img
                                src={getOptimizedUrl((variant.images && variant.images[0]?.url) || (product?.images && product.images[0]?.url) || product?.image, 150) || "https://placehold.co/150x150"}
                                alt={variant.variantName}
                                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            </div>
                            <span 
                              className={`text-xs sm:text-sm font-black uppercase tracking-[0.1em] text-center truncate w-full px-1 transition-colors duration-300 text-gray-900 group-hover:text-black`}
                            >
                              {variant.variantName}
                            </span>
                            <span 
                              className={`text-sm font-serif font-semibold mt-0.5 text-gray-900`}
                            >
                              {formatPrice(variant.sizes?.[0]?.price || 0)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Stock Status */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-6 flex items-center">
              {displayStock > 0 ? (
                <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-foreground hover:tracking-[0.2em] transition-all duration-300 cursor-default">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  <span>In Stock ({displayStock})</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-red-500">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>Out of Stock</span>
                </div>
              )}
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-8">
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-gray-400 mb-3">
                Quantity
              </label>
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <div className="flex items-center justify-between border border-gray-200 rounded-none bg-white sm:w-24 shadow-sm">
                  <button
                    onClick={decrementQuantity}
                    aria-label="Decrease quantity"
                    className="p-2 sm:p-2.5 hover:bg-gray-50 hover:text-obsidian disabled:opacity-30 transition-colors text-gray-400"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-medium text-obsidian text-xs tracking-widest">{quantity}</span>
                  <button
                    onClick={incrementQuantity}
                    aria-label="Increase quantity"
                    className="p-2 sm:p-2.5 hover:bg-gray-50 hover:text-obsidian disabled:opacity-30 transition-colors text-gray-400"
                    disabled={quantity >= displayStock}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={displayStock === 0}
                  aria-label="Add to cart"
                  className="flex-1 bg-obsidian text-white py-3 border border-obsidian hover:bg-black hover:-translate-y-1 hover:shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] active:scale-95 transition-all duration-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 font-bold text-xs sm:text-sm uppercase tracking-[0.2em] flex items-center justify-center space-x-3 shadow-md group"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  <span>{displayStock === 0 ? "Out of Stock" : "Add to Bag"}</span>
                </button>
              </div>
            </motion.div>

            {/* Delivery Availability Check */}
            {true && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="border-t border-gray-100 pt-6 mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-[#B8934E]" />
                  <h4 className="font-bold text-obsidian text-sm uppercase tracking-wider">Delivery Availability</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="pincode-input" className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                      ZIP / Postal Code *
                    </label>
                    
                    <div className="relative flex items-center border border-gray-200 hover:border-obsidian focus-within:border-obsidian rounded-lg transition-all duration-300 bg-white group shadow-sm p-1">
                      <input
                        id="pincode-input"
                        type="text"
                        placeholder="Enter ZIP / Postal Code"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && zipCode.trim() && !isChecking) {
                            handleCheckAvailability();
                          }
                        }}
                        className="flex-1 bg-transparent border-0 px-3 py-2 text-xs outline-none transition-all text-obsidian font-medium placeholder:text-gray-300"
                      />
                      <button
                        onClick={handleCheckAvailability}
                        disabled={isChecking || !zipCode.trim()}
                        className="px-5 py-2 bg-obsidian text-white text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-black transition-all duration-300 rounded-md disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200 disabled:cursor-not-allowed flex items-center justify-center min-w-[130px] h-[34px]"
                      >
                        {isChecking ? (
                          <div className="flex items-center gap-1.5">
                            <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            <span>Checking...</span>
                          </div>
                        ) : (
                          "Check"
                        )}
                      </button>
                    </div>
                  </div>

                  {checked && availability && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/60 to-emerald-50/10 border border-emerald-100 shadow-sm animate-fade-in-up relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/10 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                          <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span>✅ Available</span>
                        </div>
                        <button
                          onClick={() => {
                            setZipCode("");
                            setChecked(false);
                            setAvailability(null);
                          }}
                          className="text-[10px] font-bold text-[#B8934E] hover:text-obsidian uppercase tracking-widest transition-colors cursor-pointer border-b border-[#B8934E]/30 hover:border-obsidian pb-0.5"
                        >
                          Change
                        </button>
                      </div>
                      <p className="text-xs text-emerald-700 font-medium mb-3">
                        ✓ Delivery is available to your location{availability.city && availability.state && availability.city !== "Unknown" ? ` (${availability.city}, ${availability.state})` : ""}.
                      </p>
                      <div className="border-t border-emerald-100/45 pt-3">
                        <p className="text-[10px] font-bold text-[#B8934E] uppercase tracking-widest mb-3 flex items-center gap-1">
                          Estimated Delivery Times:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-emerald-700 font-medium">
                          <div className="flex items-start gap-2.5 bg-white/40 p-2.5 rounded-lg border border-emerald-100/30">
                            <Truck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider">Standard Delivery</p>
                              <p className="mt-0.5 text-[11px]">3–5 Business Days</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 bg-white/40 p-2.5 rounded-lg border border-emerald-100/30">
                            <Zap className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                            <div>
                              <p className="font-bold text-emerald-800 text-[10px] uppercase tracking-wider">Express Delivery</p>
                              <p className="mt-0.5 text-[11px]">1–2 Business Days</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {checked && !availability && (
                    <div className="p-4 rounded-xl bg-gradient-to-br from-red-50/60 to-red-50/10 border border-red-100 shadow-sm animate-fade-in-up relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/10 rounded-full blur-2xl pointer-events-none"></div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 text-red-800 font-bold text-xs uppercase tracking-wider">
                          <span className="flex h-2 w-2 rounded-full bg-red-500"></span>
                          <span>❌ Not Available</span>
                        </div>
                        <button
                          onClick={() => {
                            setZipCode("");
                            setChecked(false);
                            setAvailability(null);
                          }}
                          className="text-[10px] font-bold text-[#B8934E] hover:text-obsidian uppercase tracking-widest transition-colors cursor-pointer border-b border-[#B8934E]/30 hover:border-obsidian pb-0.5"
                        >
                          Try Again
                        </button>
                      </div>
                      <p className="text-xs text-red-700 font-medium leading-relaxed">
                        Delivery is not available to this location. Please verify the code or test with another area.
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Delivery Info - Polished */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="border-t border-gray-100 pt-6 mt-8 space-y-6">
              {true ? (
                <>
                  <div className="flex items-start space-x-3">
                    <Truck className="w-5 h-5 text-obsidian mt-0.5" />
                    <div>
                      <p className="font-bold text-obsidian text-sm uppercase tracking-wider">Free Delivery</p>
                      <p className="text-sm text-gray-800 font-medium mt-1">
                        Enjoy free and insured delivery anywhere in India. Expected arrival in 3-5 business days.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Package className="w-5 h-5 text-obsidian mt-0.5" />
                    <div>
                      <p className="font-bold text-obsidian text-sm uppercase tracking-wider">Packaging Details</p>
                      <PackagingInfo text={packagingText} showIcon={false} className="!bg-transparent !border-0 !p-0 !shadow-none !text-sm !text-gray-800 font-medium mt-1 leading-relaxed" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start space-x-3">
                    <Truck className="w-5 h-5 text-obsidian mt-0.5" />
                    <div>
                      <p className="font-bold text-obsidian text-sm uppercase tracking-wider">Insured Shipping</p>
                      <p className="text-sm text-gray-800 font-medium mt-1">
                        Fast, fully insured worldwide delivery right to your doorstep.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Headphones className="w-5 h-5 text-obsidian mt-0.5" />
                    <div>
                      <p className="font-bold text-obsidian text-sm uppercase tracking-wider">24/7 Dedicated Support</p>
                      <p className="text-sm text-gray-800 font-medium mt-1">
                        Our luxury concierge team is always here to assist you.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>

        {/* Product Details Section - Borderless Asymmetric Layout */}
        <div className="max-w-5xl mx-auto mb-16 border-t border-gray-100 pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

            {/* Left: Features */}
            <div className="lg:col-span-7">
              {product.features?.length > 0 && (
                <div>
                  <div className="mb-6">
                    <h4 className="text-xl md:text-2xl font-extrabold text-black tracking-tight mb-3">Product Features</h4>
                    <div className="h-[2px] w-12 bg-[#B8934E]"></div>
                  </div>
                  <ul className="space-y-4">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-4 text-base font-medium text-gray-800 leading-relaxed">
                        <div className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rotate-45 bg-[#B8934E]"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right: Quick Specs */}
            <div className="lg:col-span-5 rounded-[1.5rem] border border-[#f0e4c8] bg-gradient-to-br from-[#7a0f0f] via-[#8b1515] to-[#a01d1d] p-6 shadow-[0_18px_50px_-20px_rgba(120,20,20,0.55)] text-white h-fit sticky top-32">
              <div className="mb-5 flex items-center justify-between border-b border-white/15 pb-3">
                <h3 className="text-xs sm:text-sm uppercase tracking-[0.2em] font-black text-white/90">
                  At a Glance
                </h3>
                <div className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                  Premium
                </div>
              </div>
              <div className="grid gap-2 text-sm font-medium">
                <div className="group flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-3 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_8px_24px_-10px_rgba(255,255,255,0.25)] cursor-default">
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold text-white/70">Category</span>
                  <span className="text-right text-sm font-black leading-snug text-white transition-transform duration-300 group-hover:scale-[1.02]">
                    {product.category?.name || product.category}
                  </span>
                </div>
                <div className="group flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-3 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_8px_24px_-10px_rgba(255,255,255,0.25)] cursor-default">
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold text-white/70">Product ID</span>
                  <span className="text-right text-sm font-black leading-snug text-white transition-transform duration-300 group-hover:scale-[1.02]">
                    #{product._id?.slice(-8) || product.id?.slice(-8)}
                  </span>
                </div>
                <div className="group flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-3 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_8px_24px_-10px_rgba(255,255,255,0.25)] cursor-default">
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold text-white/70">Availability</span>
                  <span className={`text-right text-sm font-black leading-snug transition-transform duration-300 group-hover:scale-[1.02] ${displayStock > 0 ? "text-emerald-300" : "text-red-300"}`}>
                    {displayStock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
                <div className="group flex items-start justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-3 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-[0_8px_24px_-10px_rgba(255,255,255,0.25)] cursor-default">
                  <span className="text-[10px] sm:text-xs uppercase tracking-[0.15em] font-bold text-white/70">Size/Variant</span>
                  <span className="text-right text-sm font-black leading-snug text-white transition-transform duration-300 group-hover:scale-[1.02]">
                    {selectedColorVariant?.variantName || "Standard"} {selectedSize ? `(${selectedSize.size})` : ''}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-24 animate-fade-in-slow max-w-5xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="text-lg md:text-xl font-serif text-obsidian font-light tracking-widest uppercase">You May Also Like</h2>
              <div className="h-px w-12 bg-[#B8934E]/50 mx-auto mt-4"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct, idx) => (
                <div key={relatedProduct._id || relatedProduct.id} className="animate-fade-in-up" style={{ animationDelay: `${0.3 + idx * 0.1}s`, animationFillMode: 'both' }}>
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Collections (category-based) */}
        {categories && categories.length > 0 && (() => {
          const prodCatId = product?.category?._id || product?.category;
          const relatedCollections = categories.filter(c => c && c._id !== prodCatId && !c.parentCategory).slice(0, 4);
          return (
            relatedCollections.length > 0 && (
              <div className="mb-24 animate-fade-in-slow max-w-5xl mx-auto">
                <div className="mb-8 text-center">
                  <h2 className="text-lg md:text-xl font-serif text-obsidian font-light tracking-widest uppercase">Explore Related Collections</h2>
                  <div className="h-px w-12 bg-[#B8934E]/50 mx-auto mt-4"></div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
                  {relatedCollections.map((cat, idx) => (
                    <div key={cat._id} className="animate-fade-in-up" style={{ animationDelay: `${0.3 + idx * 0.08}s`, animationFillMode: 'both' }}>
                      <CollectionCard category={cat} />
                    </div>
                  ))}
                </div>
              </div>
            )
          );
        })()}

        <ProductReviewsSection productId={id} />

        {/* Mobile sticky Add-to-Cart (shows on small screens) */}
        {product && displayStock > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-border p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
              <img src={getOptimizedUrl((selectedColorVariant?.images && selectedColorVariant.images[0]?.url) || product?.image, 100) || "https://placehold.co/80x80"} alt={product.name} loading="lazy" className="w-12 h-12 object-cover border border-border/50" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate text-foreground tracking-wide">{product.name} {selectedColorVariant && `(${selectedColorVariant.variantName})`} {selectedSize && `- ${selectedSize.size}`}</div>
                <div className="text-sm font-serif text-gray-600">{formatPrice(displayPrice)}</div>
              </div>
              <button onClick={handleAddToCart} aria-label="Add to cart" className="bg-primary text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] disabled:bg-gray-200 disabled:cursor-not-allowed transition-colors">
                Add
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-[95%] sm:w-full max-w-4xl h-auto max-h-[90vh] relative flex flex-col md:flex-row overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors p-2 rounded-full z-10"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
            </button>

            {/* Left Side: Main Image */}
            <div className="w-full md:w-[60%] lg:w-[65%] bg-[#F8F8F8] flex items-center justify-center p-4 sm:p-6 min-h-[35vh] md:min-h-[60vh]">
              {activeImage === 'video' && (selectedColorVariant?.videos?.[0] || product?.videos?.[0]) ? (
                <video
                  src={selectedColorVariant?.videos?.[0]?.url || product?.videos?.[0]?.url}
                  autoPlay
                  loop
                  controls
                  className="max-w-full max-h-[85vh] object-contain rounded-md"
                />
              ) : (
                <img
                  src={getOptimizedUrl((selectedColorVariant?.images && selectedColorVariant.images[activeImage]?.url) || (product?.images && product.images[activeImage]?.url) || product?.image, 1600) || "https://placehold.co/800x1000"}
                  alt={`${product.name} - Detailed View`}
                  className="max-w-full max-h-[85vh] object-contain cursor-zoom-in transition-transform duration-300"
                  onMouseMove={(e) => {
                    if (window.innerWidth >= 768) {
                      const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientX - left) / width) * 100;
                      const y = ((e.clientY - top) / height) * 100;
                      e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
                      e.currentTarget.style.transform = 'scale(2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transformOrigin = 'center center';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
              )}
            </div>

            {/* Right Side: Details & Thumbnails */}
            <div className="w-full md:w-[40%] lg:w-[35%] flex flex-col p-4 sm:p-6 overflow-y-auto border-l border-gray-100 max-h-[45vh] md:max-h-[90vh]">
              <div className="mb-4 pr-6">
                <h2 className="text-base sm:text-lg font-medium text-gray-900 tracking-tight mb-2">
                  {product.name}
                </h2>

                {selectedSize && (
                  <div className="text-xs sm:text-sm text-gray-600 mt-2">
                    <span className="font-semibold text-gray-800">Size: </span>
                    {selectedSize.size}
                  </div>
                )}

                {selectedColorVariant && (
                  <div className="text-xs sm:text-sm text-gray-600 mt-1.5">
                    <span className="font-semibold text-gray-800">Color: </span>
                    {selectedColorVariant.variantName}
                  </div>
                )}
              </div>

              {/* Lightbox Thumbnails */}
              {((selectedColorVariant?.videos?.length > 0 || product?.videos?.length > 0) || (selectedColorVariant?.images && selectedColorVariant.images.length > 1) || (product?.images && product.images.length > 1)) && (
                <div className="flex flex-wrap gap-2 sm:gap-3 mt-auto md:mt-4">
                  {(selectedColorVariant?.images || product?.images || [])?.map((img, index) => (
                    <button
                      key={img.public_id || index}
                      onClick={() => setActiveImage(index)}
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 relative overflow-hidden rounded border-2 transition-all p-0.5 ${activeImage === index ? 'border-gray-800 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                      <img
                        src={getOptimizedUrl(img.url, 150)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </button>
                  ))}
                  {(selectedColorVariant?.videos?.length > 0 || product?.videos?.length > 0) && (
                    <button
                      onClick={() => setActiveImage('video')}
                      className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 relative overflow-hidden rounded border-2 transition-all ${activeImage === 'video' ? 'border-gray-800 shadow-md' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                      <video src={selectedColorVariant?.videos?.[0]?.url || product?.videos?.[0]?.url} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <Play className="w-5 h-5 text-white" fill="white" />
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
