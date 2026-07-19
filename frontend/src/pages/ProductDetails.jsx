import { useParams, useNavigate } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import ProductReviewsSection from "../components/reviews/ProductReviewsSection";
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
  Heart,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { toast } from "sonner";
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../context/AuthContext";
import { useSEO } from "../hooks/useSEO";
import { ProductSchema } from "../components/ProductSchema";
import { motion, AnimatePresence } from "motion/react";
import { useCategory } from "../context/CategoryContext";
import { CollectionCard } from "../components/CollectionCard";
import { formatPrice } from "../utils/priceUtils";
import { PackagingInfo } from "../components/ShippingAndPackaging";
import { getPackagingText } from "../api/shippingService";
import { useDispatch, useSelector } from "react-redux";
import { toggleWishlist, selectIsInWishlist } from "../redux/slices/wishlistSlice";

export function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isWished = useSelector((state) => selectIsInWishlist(state, id));
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
  const [pincodeError, setPincodeError] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [checked, setChecked] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState('details');

  const handleCheckAvailability = async () => {
    const pin = zipCode.trim();
    if (!pin) return;
    
    if (!/^\d{6}$/.test(pin)) {
      setPincodeError("Please enter a valid 6-digit PIN code.");
      setChecked(false);
      return;
    }
    
    setPincodeError("");
    setIsChecking(true);
    setChecked(false);
    try {
      const { data } = await api.get(`/delhivery/serviceability/${pin}`);
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

  const handleToggleWishlist = () => {
    if (product) {
      dispatch(toggleWishlist(product));
      toast.success(isWished ? 'Removed from wishlist' : 'Added to wishlist');
    }
  };

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
    return { border: "border-gray-800", text: "text-gray-800", swatch: "#1f2937" };
  };

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-[120px]">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-100 w-32 mb-10" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="w-full h-[600px] bg-gray-100 rounded-xl" />
              <div className="p-8">
                <div className="h-8 bg-gray-100 w-64 mb-6 rounded-md" />
                <div className="h-6 bg-gray-100 w-32 mb-8 rounded-md" />
                <div className="h-3 bg-gray-100 w-full mb-3 rounded-md" />
                <div className="h-3 bg-gray-100 w-3/4 mb-10 rounded-md" />
                <div className="h-14 bg-gray-100 w-full mt-10 rounded-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      <Header />
      <ProductSchema product={product} />

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-[140px] lg:pt-[160px]">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center space-x-2 text-gray-500 hover:text-black transition-colors mb-10 text-xs tracking-widest font-medium uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shopping</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-24">
          
          {/* LEFT: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col space-y-4 lg:sticky lg:top-32 h-fit"
          >
            {/* Main Image */}
            <div className="w-full bg-[#EFEFEF] rounded-2xl overflow-hidden aspect-[4/5] relative flex items-center justify-center">
              {activeImage === 'video' && (selectedColorVariant?.videos?.[0] || product?.videos?.[0]) ? (
                <video
                  src={selectedColorVariant?.videos?.[0]?.url || product?.videos?.[0]?.url}
                  autoPlay
                  loop
                  muted
                  controls
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              ) : (
                <img
                  onClick={() => setIsLightboxOpen(true)}
                  src={getOptimizedUrl((selectedColorVariant?.images && selectedColorVariant.images[activeImage]?.url) || (product?.images && product.images[activeImage]?.url) || product?.image, 1200) || "https://placehold.co/800x1000"}
                  alt={`${product.name} - Main`}
                  className="w-full h-full object-cover cursor-zoom-in hover:scale-[1.02] transition-transform duration-700 ease-out mix-blend-multiply"
                />
              )}
            </div>

            {/* Thumbnails */}
            {((selectedColorVariant?.videos?.length > 0 || product?.videos?.length > 0) || (selectedColorVariant?.images && selectedColorVariant.images.length > 1) || (product?.images && product.images.length > 1)) && (
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                {(selectedColorVariant?.images || product?.images || [])?.map((img, index) => (
                  <button
                    key={img.public_id || index}
                    onClick={() => setActiveImage(index)}
                    className={`w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#EFEFEF] transition-all duration-300 ${activeImage === index ? 'ring-1 ring-offset-2 ring-black opacity-100' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <img
                      src={getOptimizedUrl(img.url, 200)}
                      alt={`${product.name} - Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover mix-blend-multiply"
                    />
                  </button>
                ))}
                {(selectedColorVariant?.videos?.length > 0 || product?.videos?.length > 0) && (
                  <button
                    onClick={() => setActiveImage('video')}
                    className={`w-full aspect-[4/5] rounded-xl overflow-hidden bg-[#EFEFEF] transition-all duration-300 relative group ${activeImage === 'video' ? 'ring-1 ring-offset-2 ring-black opacity-100' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <video src={selectedColorVariant?.videos?.[0]?.url || product?.videos?.[0]?.url} className="w-full h-full object-cover mix-blend-multiply" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20">
                      <Play className="w-5 h-5 text-white" fill="white" />
                    </div>
                  </button>
                )}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Product Info */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
            }}
            className="flex flex-col pt-4 lg:pt-8"
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <h1 className="text-2xl md:text-[28px] font-light text-gray-900 tracking-wider uppercase leading-snug mb-3">{product.name}</h1>
              
              <div className="flex items-end space-x-3 mb-8">
                <span className="text-lg md:text-xl font-medium text-gray-900">
                  {formatPrice(displayPrice)}
                </span>
                {displayComparePrice > displayPrice && (
                  <span className="text-gray-400 line-through text-sm font-medium tracking-wide pb-0.5">
                    {formatPrice(displayComparePrice)}
                  </span>
                )}
              </div>
            </motion.div>

            {/* Description */}
            {product.description && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-8">
                <p className="text-[14px] text-gray-600 leading-relaxed font-light pr-4">{product.description}</p>
              </motion.div>
            )}

            {/* Selection */}
            {((product.variants && product.variants.length > 0) || (product.sizes && product.sizes.length > 0)) && (
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="mb-10 pt-8 border-t border-gray-100">
                <p className="text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-5">
                  {product.variants?.length > 0 && product.sizes?.length > 0 ? "Select Colour & Size" : product.variants?.length > 0 ? "Select Colour" : "Select Size"}
                </p>

                {/* Colors */}
                {product.variants && product.variants.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-6">
                    {product.variants.map((variant, idx) => {
                      const displayColor = variant.colorHex || getVariantAccent(variant.variantName).swatch;
                      const isSelected = selectedColorVariant?._id === variant._id || (selectedColorVariant && selectedColorVariant.variantName === variant.variantName);
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
                          className="flex flex-col items-center gap-2.5 group outline-none"
                        >
                          <div 
                            className={`w-14 h-16 sm:w-16 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-gray-50 relative transition-all duration-300 ${isSelected ? 'ring-2 ring-offset-2 ring-gray-900 shadow-md' : 'ring-1 ring-gray-200 group-hover:ring-gray-300 group-hover:shadow-sm'}`}
                          >
                            {variant.images && variant.images.length > 0 ? (
                              <img src={variant.images[0].url} alt={variant.variantName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full" style={{ backgroundColor: displayColor }} />
                            )}
                          </div>
                          <span className={`text-[10px] sm:text-[11px] tracking-widest capitalize transition-colors ${isSelected ? 'text-gray-900 font-bold' : 'text-gray-400 font-medium group-hover:text-gray-700'}`}>
                            {variant.variantName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Sizes */}
                {((selectedColorVariant?.sizes && selectedColorVariant.sizes.length > 0) || (product.sizes && product.sizes.length > 0)) && (
                  <div className="flex flex-wrap gap-3">
                    {(selectedColorVariant?.sizes || product.sizes || []).map((sizeObj, idx) => {
                       const isSelected = selectedSize?._id === sizeObj._id || (selectedSize && selectedSize.size === sizeObj.size);
                       return (
                         <button
                           key={sizeObj._id || idx}
                           onClick={() => { setSelectedSize(sizeObj); setQuantity(1); }}
                           disabled={sizeObj.stock === 0}
                           className={`min-w-[48px] h-12 px-4 rounded-full flex items-center justify-center text-xs font-semibold tracking-wider transition-all duration-300 ${
                             isSelected 
                               ? "bg-gray-900 text-white" 
                               : sizeObj.stock === 0
                                 ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-transparent"
                                 : "bg-white text-gray-500 border border-gray-200 hover:border-gray-900 hover:text-gray-900"
                           }`}
                         >
                           {sizeObj.size}
                         </button>
                       );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* Add to Cart */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex gap-4 mb-12">
              <button
                onClick={handleAddToCart}
                disabled={displayStock === 0}
                className="flex-1 bg-black text-white py-4 rounded-full font-bold text-sm tracking-wider hover:bg-gray-800 active:scale-[0.98] transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {displayStock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
              <button onClick={handleToggleWishlist} className={`w-[52px] h-[52px] rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${isWished ? 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100' : 'border-gray-300 bg-white text-gray-400 hover:text-black hover:border-black'}`}>
                <Heart className="w-5 h-5" fill={isWished ? "currentColor" : "none"} />
              </button>
            </motion.div>

            {/* Details & Information */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col mt-16">
              
              {/* Offers Available */}
              <div className="flex flex-col gap-5 pb-10">
                <span className="font-bold text-gray-900 text-[11px] tracking-widest uppercase flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5" /> Special Offers
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#FFF8F3] border border-[#FFE8D6] rounded-2xl p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-[#FF944D]/10 text-[#FF944D] rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[12px] font-bold">%</span></div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 mb-1">10% Off First Order</p>
                      <p className="text-xs text-gray-500">Use code <strong className="text-gray-900">MILAYA10</strong> at checkout.</p>
                    </div>
                  </div>
                  <div className="bg-[#F0F7FF] border border-[#D6E8FF] rounded-2xl p-5 flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                    <div className="bg-[#4D94FF]/10 text-[#4D94FF] rounded-full w-8 h-8 flex items-center justify-center shrink-0 mt-0.5"><Truck className="w-4 h-4" /></div>
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 mb-1">Free Shipping</p>
                      <p className="text-xs text-gray-500">On all orders above ₹4999.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details */}
              <div className="flex flex-col gap-6 py-10 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-[11px] tracking-widest uppercase">The Details</span>
                
                {(() => {
                  const specsList = [
                    { label: 'Fabric / Material', value: product.material },
                    { label: 'Finish', value: product.finish },
                    { label: 'Color', value: product.color },
                    { label: 'Style', value: product.style || product.productType },
                    { label: 'Pattern', value: product.pattern },
                    { label: 'Country of Origin', value: product.countryOfOrigin },
                    { label: 'Fit', value: product.fit },
                    { label: 'Sleeve Type', value: product.sleeveType },
                    { label: 'Neck Type', value: product.neckType },
                    { label: 'Occasion', value: product.occasion },
                    { label: 'Transparency', value: product.transparency },
                    { label: 'Season', value: product.season },
                    { label: 'Weight', value: product.weight },
                    { label: 'Dimensions', value: product.dimensions },
                  ].filter(s => s.value && typeof s.value === 'string' && s.value.trim() !== '');

                  return (
                    <div className="grid grid-cols-1 gap-y-10 mt-4">
                      {/* Specs */}
                      {specsList.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-900 text-[10px] tracking-wider uppercase mb-5">Specifications</p>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-[13px] border-collapse">
                              <tbody>
                                {specsList.map((spec, idx) => (
                                  <tr key={idx} className="border-b border-gray-200 last:border-0 even:bg-gray-50/50">
                                    <td className="py-3 px-4 w-2/5 text-gray-500 font-medium border-r border-gray-200">{spec.label}</td>
                                    <td className="py-3 px-4 w-3/5 text-gray-900">{spec.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Highlights */}
                      {product.features?.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-900 text-[10px] tracking-wider uppercase mb-5">Highlights</p>
                          <ul className="space-y-4">
                            {product.features.map((feat, i) => (
                              <li key={i} className="flex items-start gap-4 text-[13px] text-gray-700 font-light leading-relaxed">
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 shrink-0"></div>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Delivery & Return Details */}
              <div className="flex flex-col gap-6 pt-10 border-t border-gray-200">
                <span className="font-bold text-gray-900 text-[11px] tracking-widest uppercase">Shipping & Returns</span>
                
                {/* Pincode Check */}
                <div className="flex items-center gap-3 max-w-sm mt-2">
                   <div className="flex-1 relative">
                     <MapPin className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                     <input
                       type="text"
                       placeholder="Enter PIN Code"
                       value={zipCode}
                       onChange={(e) => {
                         setZipCode(e.target.value);
                         if (pincodeError) setPincodeError("");
                       }}
                       className={`w-full bg-gray-50 border ${pincodeError ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-gray-900'} rounded-xl pl-12 pr-28 py-4 text-[13px] outline-none transition-colors`}
                     />
                     <button
                       onClick={handleCheckAvailability}
                       disabled={isChecking || !zipCode.trim()}
                       className="absolute right-2 top-2 bottom-2 px-6 bg-black text-white text-[11px] uppercase font-bold tracking-widest rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                     >
                       {isChecking ? "..." : "Check"}
                     </button>
                   </div>
                </div>
                {pincodeError && (
                  <p className="text-red-500 text-[12px] font-medium -mt-1 ml-3 flex items-center gap-1.5">
                    <X className="w-3.5 h-3.5" /> {pincodeError}
                  </p>
                )}
                {checked && availability && (() => {
                  const deliveryDate = new Date();
                  deliveryDate.setDate(deliveryDate.getDate() + 4);
                  const formattedDate = deliveryDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <div className="flex flex-col gap-1.5 -mt-2 ml-3">
                      <p className="text-green-600 text-[13px] font-semibold flex items-center gap-2">
                        <Truck className="w-3.5 h-3.5" /> 
                        Delivery by {formattedDate}
                      </p>
                    </div>
                  );
                })()}
                {checked && !availability && (
                  <p className="text-red-500 text-[13px] font-medium -mt-2 ml-3 flex items-center gap-2">
                    <X className="w-3.5 h-3.5" /> 
                    Delivery not available for {zipCode}
                  </p>
                )}

                {/* Trust Badges */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-gray-300 transition-colors">
                    <Truck className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 mb-1.5">7-Day Returns</p>
                      <p className="text-[12px] text-gray-500 font-light">Easy return and exchange</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 hover:border-gray-300 transition-colors">
                    <Package className="w-7 h-7 text-gray-900" strokeWidth={1.5} />
                    <div>
                      <p className="text-[13px] font-bold text-gray-900 mb-1.5">Pay on Delivery</p>
                      <p className="text-[12px] text-gray-500 font-light">Cash on delivery available</p>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>

          </motion.div>
        </div>

        {/* Customer Reviews Section */}
        <div className="mt-16">
          <ProductReviewsSection productId={product._id} />
        </div>

        {/* Complete the Look / Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-24 mt-32 border-t border-gray-200 pt-16">
            <h2 className="text-lg font-serif text-gray-900 tracking-wider mb-8">Complete Look</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct._id || relatedProduct.id}>
                  <ProductCard product={relatedProduct} />
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Mobile sticky Add-to-Cart */}
        {product && displayStock > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
              <img src={getOptimizedUrl((selectedColorVariant?.images && selectedColorVariant.images[0]?.url) || product?.image, 100) || "https://placehold.co/80x80"} alt={product.name} loading="lazy" className="w-12 h-12 object-cover rounded border border-gray-100" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold truncate text-gray-900 tracking-wide">{product.name}</div>
                <div className="text-sm font-serif text-gray-600">{formatPrice(displayPrice)}</div>
              </div>
              <button onClick={handleAddToCart} className="bg-black text-white px-6 py-3 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-gray-900 transition-colors">
                Add
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="w-full max-w-6xl h-[90vh] relative flex flex-col md:flex-row bg-white rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 bg-white/50 hover:bg-white text-gray-900 transition-colors p-2 rounded-full z-10 shadow-sm"
              aria-label="Close Lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-full md:w-2/3 bg-[#F8F8F8] flex items-center justify-center p-6 h-[50vh] md:h-full relative">
              {activeImage === 'video' && (selectedColorVariant?.videos?.[0] || product?.videos?.[0]) ? (
                <video
                  src={selectedColorVariant?.videos?.[0]?.url || product?.videos?.[0]?.url}
                  autoPlay
                  loop
                  controls
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <img
                  src={getOptimizedUrl((selectedColorVariant?.images && selectedColorVariant.images[activeImage]?.url) || (product?.images && product.images[activeImage]?.url) || product?.image, 1600) || "https://placehold.co/800x1000"}
                  alt={`${product.name} - Detailed View`}
                  className="max-w-full max-h-full object-contain mix-blend-multiply"
                />
              )}
            </div>

            <div className="w-full md:w-1/3 flex flex-col p-6 overflow-y-auto bg-white">
              <h2 className="text-lg font-medium text-gray-900 tracking-tight mb-2">{product.name}</h2>
              {selectedSize && <div className="text-sm text-gray-600 mt-2"><span className="font-semibold text-gray-900">Size: </span>{selectedSize.size}</div>}
              {selectedColorVariant && <div className="text-sm text-gray-600 mt-1"><span className="font-semibold text-gray-900">Color: </span>{selectedColorVariant.variantName}</div>}

              {((selectedColorVariant?.videos?.length > 0 || product?.videos?.length > 0) || (selectedColorVariant?.images && selectedColorVariant.images.length > 1) || (product?.images && product.images.length > 1)) && (
                <div className="flex flex-wrap gap-2 mt-8">
                  {(selectedColorVariant?.images || product?.images || [])?.map((img, index) => (
                    <button
                      key={img.public_id || index}
                      onClick={() => setActiveImage(index)}
                      className={`w-14 h-14 flex-shrink-0 relative overflow-hidden rounded-md border-2 transition-all p-0.5 ${activeImage === index ? 'border-black' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                      <img src={getOptimizedUrl(img.url, 150)} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                  {(selectedColorVariant?.videos?.length > 0 || product?.videos?.length > 0) && (
                    <button
                      onClick={() => setActiveImage('video')}
                      className={`w-14 h-14 flex-shrink-0 relative overflow-hidden rounded-md border-2 transition-all ${activeImage === 'video' ? 'border-black' : 'border-gray-200 hover:border-gray-400'}`}
                    >
                      <video src={selectedColorVariant?.videos?.[0]?.url || product?.videos?.[0]?.url} className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10"><Play className="w-4 h-4 text-white" fill="white" /></div>
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
