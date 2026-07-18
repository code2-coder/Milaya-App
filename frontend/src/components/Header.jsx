import { Link, useNavigate } from "react-router";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Gem,
  Grid,
  ChevronDown,
  X,
  Loader2,
  Menu,
  Heart,
  Mic,
  Camera,
  Package,
  ChevronRight,
  ChevronLeft,
  Globe,
  MapPin,
  Star,
  Sparkles,
  History,
  Clock,
  ArrowUpRight,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCategory } from "../context/CategoryContext";
import { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { formatPrice } from '../utils/priceUtils';
import { DropdownMenu } from "../ui/DropdownMenu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { motion, AnimatePresence } from "motion/react";

export function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [liveResults, setLiveResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { categories } = useCategory();
  const [showCategories, setShowCategories] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isCollectionsVisible, setIsCollectionsVisible] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null); // 'collections', 'price', 'occasion', null
  const [categoryProducts, setCategoryProducts] = useState({});
  const [loadingCategory, setLoadingCategory] = useState(null);
  const lastScrollY = useRef(0);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    setSearchHistory(history);
  }, []);

  const saveToHistory = (query) => {
    if (!query.trim()) return;
    const history = JSON.parse(localStorage.getItem("searchHistory") || "[]");
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 5);
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
    setSearchHistory(newHistory);
  };

  const clearHistory = () => {
    localStorage.removeItem("searchHistory");
    setSearchHistory([]);
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (currentScrollY > 50) {
            if (currentScrollY > lastScrollY.current) {
               setIsCollectionsVisible(false); // scrolling down
            } else if (currentScrollY < lastScrollY.current) {
               setIsCollectionsVisible(true); // scrolling up
            }
          } else {
            setIsCollectionsVisible(true); // Always show at the very top
          }
          
          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const SEARCH_PLACEHOLDERS = [
    "Search for collections...",
    "Search for clothing...",
    "Search for designs..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const searchRef = useRef(null);
  const fileInputRef = useRef(null);
  const hiddenImageRef = useRef(null);
  const categoryRef = useRef(null);
  const horizontalNavRef = useRef(null);

  const scrollNav = (direction) => {
    if (horizontalNavRef.current) {
      const scrollAmount = 300;
      horizontalNavRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };


  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setShowCategories(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);



  // Debounced Live Search — triggers from first character
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 1) {
        try {
          setIsSearching(true);
          const { data } = await api.get(`/products?keyword=${encodeURIComponent(searchQuery)}&limit=6`);
          setLiveResults(data.products || []);
          setShowSearchDropdown(true);
        } catch (err) {
          console.error("Live search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setLiveResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const safeCategories = categories || [];
    const parents = safeCategories.filter(c => !c.parentCategory);
    if (parents.length > 0 && !activeCategory) {
      setActiveCategory(parents[0]._id);
    }
  }, [categories]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleCategoryHover = async (categoryName) => {
    setActiveDropdown(categoryName);
    if (categoryProducts[categoryName]) return; // Already fetched
    
    const cat = categories?.find(c => c.name === categoryName);
    if (!cat) return;

    setLoadingCategory(categoryName);
    try {
      const { data } = await api.get(`/products?category=${cat._id}&limit=5`);
      setCategoryProducts(prev => ({ ...prev, [categoryName]: data.products }));
    } catch (err) {
      console.error("Error fetching category products:", err);
    } finally {
      setLoadingCategory(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToHistory(searchQuery);
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
    }
  };

  const startVoiceSearch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice search is not supported in your browser. Please try Chrome.");
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        toast.info("Microphone active. Please speak now...");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
          toast.success(`Heard: "${transcript}"`);
          saveToHistory(transcript);
          navigate(`/shop?search=${encodeURIComponent(transcript)}`);
          setShowSearchDropdown(false);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow mic permissions in your browser address bar.");
        } else if (event.error === 'no-speech') {
          toast.error("No speech detected. Please try again.");
        } else if (event.error === 'network') {
          toast.error("Network error. Voice recognition requires an internet connection.");
        } else {
          toast.error(`Voice error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Voice setup error:", err);
      toast.error("Could not start voice search.");
      setIsListening(false);
    }
  };

  const handlePictureSearch = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const toastId = toast.loading("AI is analyzing your image...");

    try {
      // Create object URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);

      // Load image into hidden image element
      const img = hiddenImageRef.current;
      img.src = imageUrl;

      // Wait for image to load
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      toast.loading("Running visual matching engine...", { id: toastId });

      const mobilenet = await import('@tensorflow-models/mobilenet');
      const tf = await import('@tensorflow/tfjs');
      await tf.ready();
      const model = await mobilenet.load({ version: 2, alpha: 1.0 });

      // Get the mathematical visual fingerprint (embedding vector)
      const activation = model.infer(img, true);
      const embeddingData = Array.from(activation.dataSync());

      toast.loading("Searching database for visual matches...", { id: toastId });

      const { data } = await api.post('/products/visual-search', { embedding: embeddingData });

      if (data.success && data.products && data.products.length > 0) {
        toast.success(`Found ${data.products.length} visual matches!`, { id: toastId });
        navigate('/visual-search', { state: { results: data.products } });
      } else {
        toast.error("No visual matches found in our database.", { id: toastId });
      }

      // Cleanup
      URL.revokeObjectURL(imageUrl);
      e.target.value = null;
    } catch (error) {
      console.error("Visual search error:", error);
      toast.error("An error occurred during visual search.", { id: toastId });
      e.target.value = null;
    }
  };

  const searchDropdownContent = showSearchDropdown && (
    <div className="absolute top-full left-0 w-full mt-3 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-300">
      {isSearching ? (
        <div className="py-2">
          <div className="px-5 py-2 text-[10px] font-bold uppercase text-black tracking-[0.2em] mb-1">
            Suggestions
          </div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center px-5 py-2.5 animate-pulse border-b border-gray-50 last:border-0">
              <div className="w-9 h-9 rounded-lg bg-gray-100 mr-3 flex-shrink-0"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : liveResults.length > 0 ? (
        <div className="py-2">
          <div className="px-5 py-3 text-xs font-semibold uppercase text-gray-900 tracking-widest mb-1 flex items-center gap-2">
            <span className="w-4 h-[1px] bg-gray-300"></span>
            Top Suggestions
          </div>
          {liveResults.map(product => {
            const variantPrice = product.variants?.[0]?.sizes?.[0]?.price || product.sizes?.[0]?.price;
            const displayPrice = variantPrice !== undefined ? variantPrice : product.price;

            return (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              onClick={() => setShowSearchDropdown(false)}
              className="flex items-center px-6 py-3 hover:bg-gray-50 transition-all duration-300 group border-b border-gray-50 last:border-0"
            >
              <div className="w-14 h-14 rounded-md overflow-hidden border border-gray-100 mr-4 flex-shrink-0 bg-gray-50 shadow-sm group-hover:shadow-md transition-all duration-300">
                {/* Fixed duplicate title bug by removing redundant alt text */}
                <img
                  src={product.images?.[0]?.url || product.image || "/placeholder.jpg"}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-[14px] font-medium text-gray-900 truncate group-hover:text-obsidian transition-colors leading-tight">
                  {(() => {
                     if (!searchQuery) return product.name;
                     const parts = product.name.split(new RegExp(`(${searchQuery})`, 'gi'));
                     return parts.map((part, i) =>
                       part.toLowerCase() === searchQuery.toLowerCase()
                         ? <span key={i} className="font-bold underline decoration-gray-300 underline-offset-4">{part}</span>
                         : part
                     );
                  })()}
                </span>
                {displayPrice && (
                  <span className="text-xs text-gray-500 mt-1 font-medium">{formatPrice(displayPrice)}</span>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-x-2 shadow-sm">
                <ArrowUpRight className="w-4 h-4 text-gray-600" />
              </div>
            </Link>
          )})}
          <div className="px-5 mt-2 pb-2">
            <button
              onClick={handleSearch}
              className="w-full py-3.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-obsidian transition-colors rounded-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <span>View all results for "{searchQuery}"</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : searchQuery.trim().length >= 1 ? (
        <div className="p-10 text-center bg-gray-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
            <Search className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-600 uppercase tracking-widest mb-1">No products found</p>
          <p className="text-xs text-gray-400 font-medium max-w-[200px] mx-auto leading-relaxed">Try checking your spelling or using different keywords</p>
        </div>
      ) : (
        <div className="py-2 max-h-[70vh] overflow-y-auto custom-scrollbar">

          {/* ── Recent Searches ── */}
          {searchHistory.length > 0 && (
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-black flex items-center gap-1.5">
                  <Clock className="w-3 h-3" /> Recent
                </span>
                <button
                  onClick={clearHistory}
                  type="button"
                  className="text-[10px] font-semibold text-black hover:text-black/60 transition-colors tracking-wide"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-col">
                {searchHistory.map((query, idx) => (
                  <Link
                    key={idx}
                    to={`/shop?search=${encodeURIComponent(query)}`}
                    onClick={() => { setShowSearchDropdown(false); setSearchQuery(query); saveToHistory(query); }}
                    className="flex items-center justify-between py-2 px-1 group transition-colors rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <History className="w-3.5 h-3.5 text-black/30 group-hover:text-black transition-colors flex-shrink-0" />
                      <span className="text-[13px] text-black group-hover:text-black transition-colors font-medium">{query}</span>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-black/30 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Divider ── */}
          {searchHistory.length > 0 && (
            <div className="mx-5 border-t border-gray-100 my-1" />
          )}

          {/* ── Collections ── */}
          <div className="px-5 pt-3 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-black block mb-2">
              Collections
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
              {(categories || []).filter(c => !c.parentCategory).map((cat) => (
                <Link
                  key={cat._id}
                  to={`/shop?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setShowSearchDropdown(false)}
                  className="flex items-center gap-2 py-2 px-1 group transition-colors rounded-lg hover:bg-gray-50"
                >
                  <span className="w-1 h-3.5 rounded-full bg-black/20 group-hover:bg-black transition-colors flex-shrink-0" />
                  <span className="text-[13px] font-medium text-black group-hover:text-black transition-colors">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full flex flex-col">
      {/* Top Announcement Bar Removed per request */}
      
      <header className="bg-white/95 backdrop-blur-2xl border-b border-gray-100 transition-colors duration-500 font-sans w-full shadow-sm">
      <div className="w-full max-w-[1800px] mx-auto px-6 sm:px-8 lg:px-10 xl:px-14">
        <div className="flex items-center justify-between h-20 relative">
          
          {/* Middle Mobile Delivery Badge (Centered) */}


          <div className="flex items-center space-x-6 md:space-x-10">
            <Link to="/" className="flex items-center space-x-2 group relative z-[70] ml-2">
              <div className="flex items-center">
                <img src="/loginlogo-removebg-preview.png" alt="Milaya Logo" className="h-14 md:h-16 lg:h-20 w-auto object-contain scale-150 md:scale-[1.75] transition-transform duration-300 group-hover:scale-[1.8] filter drop-shadow-sm" />
              </div>
            </Link>

            {/* Delivery badge removed per request */}
          </div>

          <div className="ml-auto mr-4 lg:mr-8 flex items-center flex-1 justify-end space-x-6 lg:space-x-8">
            {/* Categories Dropdown Trigger */}
            <div 
              className="hidden lg:flex items-center h-full cursor-pointer relative" 
              ref={categoryRef}
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              <button
                className="flex items-center space-x-1.5 text-obsidian text-[14px] font-bold uppercase tracking-[0.1em] px-2 hover:text-[#B8934E] transition-colors duration-300"
                onClick={() => setShowCategories(!showCategories)}
              >
                <span>Collections</span>
              </button>

              {/* LUXURY MODERN DROPDOWN MENU */}
              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, filter: "blur(10px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -5, filter: "blur(10px)" }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-[100%] left-0 w-[850px] bg-white border border-gray-100 shadow-2xl rounded-2xl z-50 flex mt-4 overflow-hidden h-[460px]"
                  >
                    {/* Column 1: Navigation (28%) */}
                    <div className="w-[30%] bg-[#FAF9F6] p-8 border-r border-gray-100 flex flex-col relative z-20">
                      <span className="text-[#B8934E] text-[10px] font-bold uppercase tracking-[0.2em] mb-8">Explore By</span>
                      <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar">
                        {(categories || []).filter(c => !c.parentCategory).map((parent) => (
                          <Link
                            key={parent._id}
                            to={`/shop?category=${encodeURIComponent(parent.name)}`}
                            onMouseEnter={() => setActiveCategory(parent._id)}
                            onClick={() => setShowCategories(false)}
                            className="group flex items-center justify-between w-full py-3 transition-all duration-300 relative"
                          >
                            <div className={`absolute left-[-32px] w-1 h-full rounded-r-md transition-all duration-500 ${activeCategory === parent._id ? 'bg-[#800000]' : 'bg-transparent'}`}></div>
                            <span className={`text-[14px] font-medium tracking-wide transition-all duration-300 ${activeCategory === parent._id ? 'text-obsidian translate-x-2' : 'text-gray-500 group-hover:text-obsidian'}`}>
                              {parent.name}
                            </span>
                            {activeCategory === parent._id && (
                              <ArrowRight className="w-3.5 h-3.5 text-obsidian flex-shrink-0 ml-2 animate-in fade-in slide-in-from-left-2 duration-300" strokeWidth={2} />
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Right Container: Flex 1 */}
                    <div className="flex-1 bg-white flex relative">
                      {activeCategory ? (
                        <>
                          {/* Column 2: Content (40%) */}
                          <div className="w-[45%] p-10 flex flex-col justify-between z-10 bg-white border-r border-gray-50">
                            <div>
                              <h3 className="text-obsidian text-[11px] font-bold uppercase tracking-[0.15em] mb-4">
                                The {(categories || []).find(c => c._id === activeCategory)?.name} Edit
                              </h3>
                              <p className="text-[13px] text-gray-500 font-serif italic leading-relaxed mb-8">
                                {(() => {
                                  const name = ((categories || []).find(c => c._id === activeCategory)?.name || "").toLowerCase();
                                  if (name.includes("dress")) return "Drape yourself in liquid light. Masterpieces designed to rest elegantly close to the heart.";
                                  if (name.includes("saree")) return "An exquisite curation of masterful design, where timeless tradition seamlessly meets modern brilliance.";
                                  if (name.includes("salwar")) return "A delicate embrace of premium fabrics, moving with extraordinary grace at your every gesture.";
                                  return "An exquisite curation of masterful design, where timeless tradition seamlessly meets modern brilliance.";
                                })()}
                              </p>

                              <div className="flex flex-col gap-4">
                                  {(categories || []).filter(sub => sub.parentCategory === activeCategory).slice(0,5).map((sub) => (
                                     <Link
                                        key={sub._id}
                                        to={`/shop?category=${encodeURIComponent(sub.name)}`}
                                        onClick={() => setShowCategories(false)}
                                        className="group/sub flex items-center gap-3 text-[13px] text-obsidian font-medium transition-colors hover:text-[#800000]"
                                     >
                                       <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover/sub:bg-[#800000] transition-colors"></div>
                                       <span>{sub.name}</span>
                                     </Link>
                                  ))}
                              </div>
                            </div>

                            <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-4">
                              <Link
                                to={`/shop?category=${encodeURIComponent((categories || []).find(c => c._id === activeCategory)?.name || "")}`}
                                onClick={() => setShowCategories(false)}
                                className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-obsidian group/btn hover:text-[#800000] transition-colors w-fit"
                              >
                                <span className="border-b border-black group-hover/btn:border-[#800000] pb-0.5">View Entire Collection</span>
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" strokeWidth={2} />
                              </Link>
                              <div className="flex items-center gap-1.5 opacity-60">
                                <Gem className="w-3.5 h-3.5 text-[#B8934E]" />
                                <span className="text-[#B8934E] text-[9px] font-bold uppercase tracking-[0.15em]">Curated Excellence</span>
                              </div>
                            </div>
                          </div>

                          {/* Column 3: Image (55%) */}
                          <div className="w-[55%] h-full relative overflow-hidden bg-gray-50 p-3">
                            <div className="w-full h-full rounded-xl overflow-hidden relative group/img">
                              <img 
                                src={
                                  (() => {
                                    const cat = (categories || []).find(c => c._id === activeCategory);
                                    if (cat?.image?.url) return cat.image.url;
                                    if (cat?.image?.public_id) return `/api/v1/files/${cat.image.public_id}`;
                                    const name = (cat?.name || "").toLowerCase();
                                    if (name.includes("men")) return "https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=800&auto=format&fit=crop";
                                    if (name.includes("kid")) return "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop";
                                    return "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800&auto=format&fit=crop";
                                  })()
                                }
                                alt="Category"
                                className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover/img:scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-500"></div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center opacity-30 text-center bg-gray-50">
                          <Gem className="w-8 h-8 text-[#B8934E] mb-3" />
                          <span className="text-obsidian text-[11px] font-bold tracking-[0.2em] uppercase">Curated Excellence</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <form onSubmit={handleSearch} className="max-w-xs lg:max-w-md xl:max-w-lg w-full hidden md:block" ref={searchRef}>
              <div className="relative group">
              <input
                type="text"
                value={searchQuery}
                onFocus={() => setShowSearchDropdown(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder=""
                className="w-full px-5 py-2 pl-11 pr-24 text-sm rounded-none border-2 border-black bg-gray-50/50 hover:bg-white hover:border-black focus:bg-white focus:outline-none focus:border-black focus:ring-0 transition-all duration-500 font-medium text-obsidian shadow-sm focus:shadow-md relative z-10"
              />
              
              {!searchQuery && (
                <div className="absolute inset-y-0 left-11 right-24 pointer-events-none overflow-hidden z-20">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholderIndex}
                      initial={{ y: "50%", opacity: 0 }}
                      animate={{ y: "-50%", opacity: 1 }}
                      exit={{ y: "-150%", opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-1/2 text-gray-400 text-sm font-medium whitespace-nowrap"
                    >
                      {SEARCH_PLACEHOLDERS[placeholderIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}

              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-black transition-colors duration-500 z-30 pointer-events-none" />

              <div className="absolute right-2.5 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 sm:space-x-1.5 z-30">
                {isSearching ? (
                  <Loader2 className="text-obsidian w-5 h-5 animate-spin" />
                ) : searchQuery ? (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setShowSearchDropdown(false); }}
                    className="text-gray-400 hover:text-obsidian transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={startVoiceSearch}
                  className={`p-1 transition-all duration-300 ${isListening ? 'text-red-500 animate-pulse' : 'text-black hover:scale-110 drop-shadow-sm'}`}
                  title="Voice Search"
                >
                  <Mic className="w-5 h-5" strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1 text-black hover:scale-110 transition-all duration-300 drop-shadow-sm"
                  title="Visual Search"
                >
                  <Camera className="w-5 h-5" strokeWidth={2.5} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePictureSearch}
                  className="hidden"
                />
                <img ref={hiddenImageRef} className="hidden" alt="hidden preview" crossOrigin="anonymous" />
              </div>

              {/* Search Suggestions Dropdown */}
              {searchDropdownContent}
            </div>
          </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center justify-end space-x-4 lg:space-x-6 flex-shrink-0">
            {/* Vertical Divider for larger screens */}
            <div className="hidden xl:block w-px h-6 bg-gray-200"></div>

            <div className="flex items-center space-x-2 sm:space-x-4">


              {/* Desktop/Tablet icons (Hidden on mobile) */}
              <Link
                to="/wishlist"
                title="Wishlist"
                className="relative hidden md:flex items-center justify-center p-2 text-black transition-colors duration-300 group"
              >
                <Heart className="w-[22px] h-[22px] group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 transform translate-x-1/2 -translate-y-1/2 bg-[#B8934E] text-white font-bold text-[8.5px] rounded-full min-w-[15px] h-[15px] px-1 flex items-center justify-center shadow-sm border border-white">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              
              <Link
                to="/cart"
                title="Shopping Cart"
                className="relative hidden md:flex items-center justify-center p-2 text-black transition-colors duration-300 group"
              >
                <ShoppingCart className="w-[22px] h-[22px] group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
                {cartCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 transform translate-x-1/2 -translate-y-1/2 bg-[#B8934E] text-white font-bold text-[8.5px] rounded-full min-w-[15px] h-[15px] px-1 flex items-center justify-center shadow-sm border border-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              <div className="flex items-center space-x-2 pl-1 sm:pl-2 border-l border-transparent sm:border-gray-100">
                <DropdownMenu className="hidden md:block" />
                <button
                  className="lg:hidden p-2 text-gray-700 hover:text-obsidian relative z-[110] transition-transform"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-expanded={isMobileMenuOpen}
                  aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                >
                  {/* Animated Hamburger Icon */}
                  <div className="relative w-5 h-5 flex flex-col justify-center items-center group">
                    <span
                      className={`block absolute h-[1.5px] w-4 bg-current rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "rotate-45" : "-translate-y-1"
                        }`}
                    />
                    <span
                      className={`block absolute h-[1.5px] w-4 bg-current rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "opacity-0" : "opacity-100"
                        }`}
                    />
                    <span
                      className={`block absolute h-[1.5px] w-4 bg-current rounded-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? "-rotate-45" : "translate-y-1"
                        }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar (Header Bottom) */}
        <div className="md:hidden w-full px-4 pb-3 pt-1 border-t border-transparent relative z-[90]">
          <form onSubmit={handleSearch} className="relative group w-full">
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setShowSearchDropdown(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder=""
              className="w-full px-5 py-2 pl-11 pr-24 text-sm rounded-none border-2 border-black bg-gray-50/50 hover:bg-white hover:border-black focus:bg-white focus:outline-none focus:border-black focus:ring-0 transition-all duration-500 font-medium text-obsidian shadow-sm focus:shadow-md relative z-10"
            />

            {!searchQuery && (
              <div className="absolute inset-y-0 left-11 right-24 pointer-events-none overflow-hidden z-20">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={placeholderIndex}
                    initial={{ y: "-150%", opacity: 0 }}
                    animate={{ y: "-50%", opacity: 1 }}
                    exit={{ y: "50%", opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute top-1/2 text-gray-400 text-sm font-medium whitespace-nowrap"
                  >
                    {SEARCH_PLACEHOLDERS[placeholderIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-20 pointer-events-none group-focus-within:text-black transition-colors duration-500" />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 z-30">
              <button
                type="button"
                onClick={startVoiceSearch}
                className={`p-1.5 transition-all duration-300 ${isListening ? 'text-red-500 animate-pulse' : 'text-black hover:scale-110 drop-shadow-sm'}`}
              >
                <Mic className="w-4 h-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-black hover:scale-110 transition-all duration-300 drop-shadow-sm"
              >
                <Camera className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            {searchDropdownContent}
          </form>
        </div>
      </div>



      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-500"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Content */}
          <div className="absolute top-0 right-0 w-[300px] sm:w-[350px] h-[100dvh] bg-white shadow-2xl animate-in slide-in-from-right duration-500 ease-out flex flex-col">
            <div className="p-8 flex justify-between items-center border-b border-gray-50/50">
              <span className="font-black text-2xl text-obsidian uppercase tracking-tighter">Menu</span>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* BRAND LOGO IN DRAWER */}
              <div className="pb-6 border-b border-gray-100 flex justify-center">
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                  <img src="/Milaya_Logo.jpg-removebg-preview.png" alt="Milaya Logo" className="h-12 w-auto object-contain filter drop-shadow-sm" />
                </Link>
              </div>

              {/* Mobile Search */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em]">Search</p>
                <form onSubmit={handleSearch} className="relative group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder=""
                    className="w-full px-4 py-2.5 pl-10 pr-20 text-sm bg-gray-50 border border-gray-200 rounded-none focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-black transition-all duration-300 font-medium text-obsidian relative z-10"
                  />

                  {!searchQuery && (
                    <div className="absolute inset-y-0 left-10 right-20 pointer-events-none overflow-hidden z-20">
                      <AnimatePresence>
                        <motion.span
                          key={placeholderIndex}
                          initial={{ y: "-150%", opacity: 0 }}
                          animate={{ y: "-50%", opacity: 1 }}
                          exit={{ y: "50%", opacity: 0 }}
                          transition={{ duration: 0.4, ease: "easeInOut" }}
                          className="absolute top-1/2 text-gray-400 text-sm font-medium whitespace-nowrap"
                        >
                          {SEARCH_PLACEHOLDERS[placeholderIndex]}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  )}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1 z-30">
                    <button
                      type="button"
                      onClick={startVoiceSearch}
                      className={`p-1.5 transition-all duration-300 ${isListening ? 'text-red-500 animate-pulse' : 'text-black hover:scale-110 drop-shadow-sm'}`}
                    >
                      <Mic className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 text-black hover:scale-110 transition-all duration-300 drop-shadow-sm"
                    >
                      <Camera className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Mobile Main Menu */}
              <div className="space-y-4 border-b border-gray-100 pb-6">
                <p className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em]">Menu</p>
                <div className="flex flex-col gap-1">
                  <Link
                    to="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity group"
                  >
                    <span className="text-gray-800 text-sm uppercase tracking-widest font-bold group-hover:text-obsidian transition-colors">Home</span>
                  </Link>

                </div>
              </div>

              {/* Mobile Categories */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase text-gray-500 tracking-[0.2em]">Collections</p>
                <div className="grid grid-cols-1 gap-1">
                  {(categories || []).length > 0 ? (
                    (categories || []).filter(c => !c.parentCategory).map((cat, index) => (
                      <Link
                        key={cat._id}
                        to={`/shop?category=${encodeURIComponent(cat.name)}`}
                        className="flex items-center justify-between py-3 border-b border-gray-50 hover:border-gray-200 transition-all group"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-gray-800 text-sm uppercase tracking-widest group-hover:text-obsidian transition-colors">{cat.name}</span>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-obsidian transition-colors" />
                      </Link>
                    ))
                  ) : (
                    <div className="py-8 text-center border-y border-gray-100">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-gray-300" />
                    </div>
                  )}
                </div>
              </div>

              {/* Account / User Section */}
              <div className="pt-8 border-t border-gray-200 space-y-4">
                <p className="text-[10px] font-black uppercase text-[#5C0000] tracking-[0.2em]">Account</p>
                {user ? (
                  <div className="space-y-1">
                    <Link
                      to="/account"
                      className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm uppercase tracking-widest text-obsidian">{user.name}</span>
                      <User className="w-4 h-4 text-gray-400" />
                    </Link>

                    <Link
                      to="/orders"
                      className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-sm uppercase tracking-widest text-obsidian">My Orders</span>
                      <Package className="w-4 h-4 text-gray-400" />
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center justify-between py-3 hover:opacity-70 transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-sm uppercase tracking-widest text-obsidian">Admin Dashboard</span>
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="pt-4">
                    <button
                      onClick={() => window.location.href = `${(import.meta.env.VITE_API_URL || 'https://milaya-app.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google`} 
                      className="w-full flex items-center justify-center p-4 bg-obsidian text-white text-xs uppercase tracking-widest hover:bg-gray-800 transition-all space-x-3"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Sign in with Google</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-8 bg-gray-50 text-center rounded-t-[40px] border-t border-gray-100">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">© 2024 Milaya Premium Clothing</p>
            </div>
          </div>
        </div>
      )}
    </header>
    </div>
  );
}
