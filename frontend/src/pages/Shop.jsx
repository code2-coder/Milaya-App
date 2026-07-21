import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from "react";
import { useSearchParams, Link } from "react-router";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { useCategory } from "../context/CategoryContext";

import { SEO } from "../components/SEO";
import api from "../api/axios";
import { 
  Filter, X, ChevronDown, ChevronUp, ChevronRight, Search, 
  Check, SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Footer = lazy(() => import("../components/Footer").then(m => ({ default: m.Footer })));

// Predefined filters
const PRICE_RANGES = [
  { label: "Under 5K", min: "", max: "5000" },
  { label: "5K - 10K", min: "5000", max: "10000" },
  { label: "10K - 15K", min: "10000", max: "15000" },
  { label: "15K - 20K", min: "15000", max: "20000" },
  { label: "20K - 25K", min: "20000", max: "25000" },
  { label: "25K+", min: "25000", max: "" }
];

const SORT_OPTIONS = [
  { label: "Latest", value: "newest" },
  { label: "Popularity", value: "popular" },
  { label: "Best Sellers", value: "bestselling" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" }
];

// Reusable Checkbox List Component with Accordion
const FilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  if (!items || items.length === 0) return null;
  return (
    <div className="py-5 border-b border-gray-100">
      <SEO title={getPageTitle(} description={""} />
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group focus:outline-none"
      >
        <h3 className="font-bold text-gray-900 text-sm tracking-wide group-hover:text-obsidian transition-colors">{title}</h3>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" /> : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {items.map(item => {
                const isChecked = activeFilters[stateKey].includes(item);
                return (
                  <label key={item} className="flex items-center group cursor-pointer">
                    <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors mr-3 ${isChecked ? 'bg-obsidian border-obsidian' : 'border-gray-300 group-hover:border-obsidian'}`} onClick={() => toggleArrayFilter(stateKey, item)}>
                      {isChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm tracking-wide ${isChecked ? 'text-obsidian font-semibold' : 'text-gray-600 group-hover:text-obsidian transition-colors'}`}>{item}</span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Extracted logic for Categories Accordion
const CategoriesSection = ({ categories, activeFilters, toggleArrayFilter, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="py-6 border-b border-gray-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group focus:outline-none mb-2"
      >
        <h3 className="font-bold text-gray-900 text-xs uppercase tracking-[0.15em] group-hover:text-obsidian transition-colors">Collections</h3>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" /> : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" />}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-1 max-h-72 overflow-y-auto custom-scrollbar pr-2">
              {categories.filter(c => !c.parentCategory).map(cat => {
                const isActive = activeFilters.category.includes(cat.name);
                const hasSubcategories = categories.some(sub => sub.parentCategory === cat._id);
                return (
                <div key={cat._id} className="flex flex-col">
                  <div 
                    onClick={() => toggleArrayFilter('category', cat.name)}
                    className={`flex items-center justify-between py-2.5 cursor-pointer group transition-all duration-300 ${isActive ? 'text-obsidian' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <span className={`text-[13px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {cat.name}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${isActive ? 'border-obsidian bg-obsidian' : 'border-gray-300 group-hover:border-gray-500'}`}>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  {/* Subcategories (if any) */}
                  {hasSubcategories && (
                    <div className="pl-4 space-y-1 mt-1 mb-2 border-l border-gray-100 ml-2">
                      {categories.filter(sub => sub.parentCategory === cat._id).map(sub => {
                        const isSubActive = activeFilters.category.includes(sub.name);
                        return (
                        <div 
                          key={sub._id} 
                          onClick={() => toggleArrayFilter('category', sub.name)}
                          className={`flex items-center justify-between py-1.5 cursor-pointer group transition-all duration-200 ${isSubActive ? 'text-obsidian' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                          <span className={`text-[11px] uppercase tracking-wider ${isSubActive ? 'font-bold' : 'font-medium'}`}>{sub.name}</span>
                          {isSubActive && <Check className="w-3 h-3 text-obsidian" />}
                        </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )})}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Extracted logic for Price Accordion
const PriceSection = ({ PRICE_RANGES, activeFilters, updateFilter, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="py-5 border-b border-gray-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group focus:outline-none mb-2"
      >
        <h3 className="font-bold text-gray-900 text-sm tracking-wide group-hover:text-obsidian transition-colors">Price</h3>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" /> : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 space-y-2 mb-2">
              {PRICE_RANGES.map((range, i) => {
                const isSelected = activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max;
                return (
                  <label key={i} className="flex items-center group cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors mr-3 ${isSelected ? 'border-obsidian' : 'border-gray-300 group-hover:border-obsidian'}`} onClick={() => { updateFilter('price[gte]', range.min); updateFilter('price[lte]', range.max); }}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-obsidian" />}
                    </div>
                    <span className={`text-sm tracking-wide transition-colors ${isSelected ? 'text-obsidian font-semibold' : 'text-gray-600 group-hover:text-obsidian'}`}>{range.label}</span>
                  </label>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CSS_COLORS = {
  Red: '#EF4444',
  Blue: '#3B82F6',
  Green: '#10B981',
  Black: '#000000',
  White: '#FFFFFF',
  Yellow: '#F59E0B',
  Pink: '#EC4899',
  Purple: '#8B5CF6',
  Gray: '#6B7280',
  Brown: '#92400E',
  Orange: '#F97316',
  Maroon: '#800000',
  Navy: '#1E3A8A',
  Olive: '#4D7C0F',
  Teal: '#0D9488',
  Gold: '#CA8A04',
  Silver: '#9CA3AF'
};

const getColorHex = (colorName) => {
  return CSS_COLORS[colorName] || colorName;
};

const ColorFilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (!items || items.length === 0) return null;
  
  return (
    <div className="py-5 border-b border-gray-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group focus:outline-none mb-2"
      >
        <h3 className="font-bold text-gray-900 text-sm tracking-wide group-hover:text-obsidian transition-colors">{title}</h3>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" /> : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 flex flex-wrap gap-3">
              {items.map(item => {
                const isChecked = activeFilters[stateKey].includes(item);
                const hex = getColorHex(item);
                const isWhite = hex.toLowerCase() === '#ffffff' || item.toLowerCase() === 'white';
                return (
                  <button
                    key={item}
                    onClick={() => toggleArrayFilter(stateKey, item)}
                    title={item}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isWhite ? 'border border-gray-300' : 'border border-transparent shadow-sm'} ${isChecked ? 'ring-2 ring-obsidian ring-offset-2 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: hex }}
                  >
                    {isChecked && <Check className={`w-4 h-4 ${isWhite ? 'text-black' : 'text-white drop-shadow-md'}`} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SizeFilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (!items || items.length === 0) return null;
  
  return (
    <div className="py-5 border-b border-gray-100">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between group focus:outline-none mb-2"
      >
        <h3 className="font-bold text-gray-900 text-sm tracking-wide group-hover:text-obsidian transition-colors">{title}</h3>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" /> : <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-obsidian transition-colors" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 flex flex-wrap gap-2">
              {items.map(item => {
                const isChecked = activeFilters[stateKey].includes(item);
                return (
                  <button
                    key={item}
                    onClick={() => toggleArrayFilter(stateKey, item)}
                    className={`min-w-[40px] h-10 px-3 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-center ${isChecked ? 'bg-obsidian border-obsidian text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-obsidian hover:text-obsidian'}`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarContent = ({ activeFilters, updateFilter, toggleArrayFilter, categories, PRICE_RANGES, uniqueMaterials, uniqueStoneTypes, uniqueColors, uniqueSizes }) => (
  <div className="flex flex-col h-full bg-white">
    {/* Search */}
    <div className="py-5 border-b border-gray-100">
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-obsidian transition-colors" />
        <input 
          type="text" 
          placeholder="Search collections..." 
          value={activeFilters.keyword}
          onChange={(e) => updateFilter('keyword', e.target.value)}
          className="w-full bg-gray-50/80 hover:bg-gray-100 focus:bg-white border border-transparent focus:border-obsidian/30 focus:ring-4 focus:ring-obsidian/5 text-sm rounded-xl py-3 pl-10 pr-4 transition-all duration-300 placeholder:text-gray-400"
        />
      </div>
    </div>

    {/* Collections */}
    <CategoriesSection categories={categories} activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />

    {/* Price */}
    <PriceSection PRICE_RANGES={PRICE_RANGES} activeFilters={activeFilters} updateFilter={updateFilter} />

    {/* Dynamic Filters */}
    <ColorFilterSection title="Color" items={uniqueColors} stateKey="colors" activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />
    <SizeFilterSection title="Size" items={uniqueSizes} stateKey="sizes" activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />
    <FilterSection title="Material" items={uniqueMaterials} stateKey="materials" activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />
    <FilterSection title="Stone Type" items={uniqueStoneTypes} stateKey="stoneTypes" activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />

    {/* Availability */}
    <div className="py-6 mt-2">
      <label className="flex items-center group cursor-pointer bg-gray-50 hover:bg-gray-100 p-3 rounded-xl transition-colors">
        <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors mr-3 shadow-sm ${activeFilters.inStock ? 'bg-obsidian border-obsidian' : 'bg-white border-gray-300 group-hover:border-obsidian'}`} onClick={() => updateFilter('inStock', activeFilters.inStock ? "" : "true")}>
          {activeFilters.inStock && <Check className="w-3.5 h-3.5 text-white" />}
        </div>
        <span className={`text-sm font-bold tracking-wide ${activeFilters.inStock ? 'text-obsidian' : 'text-gray-700'}`}>In Stock Only</span>
      </label>
    </div>
  </div>
);

export function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategory();
  const currencySymbol = '₹';
  
  // State
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [attributes, setAttributes] = useState([]);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isQuickFilterOpen, setIsQuickFilterOpen] = useState(false);

  // Sync state with URL params
  const activeFilters = useMemo(() => ({
    keyword: searchParams.get("keyword") || "",
    category: searchParams.get("category") ? searchParams.get("category").split(',') : [],
    materials: searchParams.get("materials") ? searchParams.get("materials").split(',') : [],
    colors: searchParams.get("colors") ? searchParams.get("colors").split(',') : [],
    sizes: searchParams.get("sizes") ? searchParams.get("sizes").split(',') : [],
    stoneTypes: searchParams.get("stoneTypes") ? searchParams.get("stoneTypes").split(',') : [],
    minPrice: searchParams.get("price[gte]") || "",
    maxPrice: searchParams.get("price[lte]") || "",
    sort: searchParams.get("sort") || "newest",
    inStock: searchParams.get("inStock") === "true",
    tag: searchParams.get("tag") || "",
  }), [searchParams]);

  const getPageTitle = () => {
    if (activeFilters.category && activeFilters.category.length === 1) {
      return activeFilters.category[0];
    }
    if (activeFilters.tag === "trending") {
      return "Trending Now";
    }
    if (searchParams.get("sort") === "newest") {
      return "New Arrivals";
    }
    if (activeFilters.sort === "bestselling") {
      return "Best Sellers";
    }
    return "The Collection";
  };

  , "Browse our complete collection of premium clothing, filter by budget and category.");

  // Derived unique filter options from attributes
  const uniqueMaterials = useMemo(() => attributes.filter(a => a.type === 'material').map(a => a.value), [attributes]);
  const uniqueStoneTypes = useMemo(() => attributes.filter(a => a.type === 'stoneType').map(a => a.value), [attributes]);
  const uniqueColors = useMemo(() => {
    const attrColors = attributes.filter(a => a.type === 'color').map(a => a.value);
    const prodColors = new Set();
    products.forEach(p => {
       if (p.color) prodColors.add(p.color);
       if (p.variants) {
          p.variants.forEach(v => {
             if (v.color) prodColors.add(v.color);
          });
       }
    });
    const merged = Array.from(new Set([...attrColors, ...Array.from(prodColors)]));
    return merged.length > 0 ? merged : ["Red", "Blue", "Green", "Black", "White", "Yellow", "Pink", "Maroon", "Navy", "Gray", "Silver", "Gold", "Purple", "Olive"];
  }, [attributes, products]);
  
  const uniqueSizes = useMemo(() => {
    const attrSizes = attributes.filter(a => a.type === 'size').map(a => a.value);
    const prodSizes = new Set();
    products.forEach(p => {
       if (p.sizes && Array.isArray(p.sizes)) {
          p.sizes.forEach(s => {
             if (s.size) prodSizes.add(s.size);
          });
       }
       if (p.variants && Array.isArray(p.variants)) {
          p.variants.forEach(v => {
             if (v.sizes && Array.isArray(v.sizes)) {
                v.sizes.forEach(s => {
                   if (s.size) prodSizes.add(s.size);
                });
             }
          });
       }
    });
    const merged = Array.from(new Set([...attrSizes, ...Array.from(prodSizes)]));
    return merged.length > 0 ? merged : ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "Free Size"];
  }, [attributes, products]);
  
  useEffect(() => {
    const fetchAttributes = async () => {
       try {
          const { data } = await api.get('/attributes');
          setAttributes(data.attributes || []);
       } catch(e) {
          console.error("Failed to load attributes", e);
       }
    };
    fetchAttributes();
  }, []);

  const fetchProducts = useCallback(async (isLoadMore = false) => {
    try {
      if (!isLoadMore) setLoading(true);
      
      let url = `/products?limit=12&page=${page}`;
      
      if (activeFilters.category.length > 0) {
        // Map category names to IDs and include subcategories if a parent is selected
        const catIds = activeFilters.category.reduce((acc, catName) => {
           const c = categories.find(cat => cat.name === catName);
           if (c) {
               acc.push(c._id);
               const subCats = categories.filter(sub => sub.parentCategory === c._id);
               subCats.forEach(sub => acc.push(sub._id));
           }
           return acc;
        }, []);
        
        if (catIds.length > 0) {
            const uniqueCatIds = [...new Set(catIds)];
            url += `&category=${uniqueCatIds.join(',')}`;
        }
      }
      
      if (activeFilters.keyword) url += `&keyword=${encodeURIComponent(activeFilters.keyword)}`;
      if (activeFilters.minPrice) url += `&price[gte]=${activeFilters.minPrice}`;
      if (activeFilters.maxPrice) url += `&price[lte]=${activeFilters.maxPrice}`;
      if (activeFilters.materials.length > 0) url += `&materials=${encodeURIComponent(activeFilters.materials.join(','))}`;
      if (activeFilters.colors.length > 0) url += `&colors=${encodeURIComponent(activeFilters.colors.join(','))}`;
      if (activeFilters.sizes.length > 0) url += `&sizes=${encodeURIComponent(activeFilters.sizes.join(','))}`;
      if (activeFilters.stoneTypes.length > 0) url += `&stoneTypes=${encodeURIComponent(activeFilters.stoneTypes.join(','))}`;
      if (activeFilters.inStock) url += `&inStock=true`;
      if (activeFilters.tag === "trending") {
        url += `&homeSection=Trending Product`;
      }
      if (activeFilters.sort) url += `&sort=${activeFilters.sort}`;

      const { data } = await api.get(url);
      
      if (isLoadMore) {
        setProducts(prev => [...prev, ...data.products]);
      } else {
        setProducts(data.products || []);
      }
      
      setTotalResults(data.totalProducts || data.results || 0);
      setHasMore(data.products.length >= 12);
      
    } catch (error) {
      console.error("Error fetching shop products:", error);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, page, categories]);

  useEffect(() => {
    if (categories.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProducts(page > 1);
    }
  }, [fetchProducts, categories, page]);

  // Update URL helper
  const updateFilter = useCallback((key, value) => {
    const newParams = new window.URLSearchParams(searchParams);
    
    if (Array.isArray(value)) {
      if (value.length > 0) newParams.set(key, value.join(','));
      else newParams.delete(key);
    } else if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    newParams.delete("page"); // reset pagination
    setPage(1);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  const toggleArrayFilter = useCallback((key, item) => {
    const current = [...activeFilters[key]];
    const idx = current.indexOf(item);
    if (idx === -1) current.push(item);
    else current.splice(idx, 1);
    updateFilter(key, current);
  }, [activeFilters, updateFilter]);

  const clearAllFilters = () => {
    setSearchParams({});
    setPage(1);
    setIsMobileDrawerOpen(false);
  };

  const removeChip = (key, val = null) => {
    if (val !== null && Array.isArray(activeFilters[key])) {
      const current = activeFilters[key].filter(v => v !== val);
      updateFilter(key, current);
    } else {
      updateFilter(key, "");
      if (key === 'price') {
        updateFilter('price[gte]', "");
        updateFilter('price[lte]', "");
      }
    }
  };

  const getActiveChips = () => {
    const chips = [];
    if (activeFilters.keyword) chips.push({ key: 'keyword', label: `Search: "${activeFilters.keyword}"` });
    activeFilters.category.forEach(c => chips.push({ key: 'category', val: c, label: c }));
    activeFilters.materials.forEach(m => chips.push({ key: 'materials', val: m, label: m }));
    activeFilters.colors.forEach(c => chips.push({ key: 'colors', val: c, label: c }));
    activeFilters.sizes.forEach(s => chips.push({ key: 'sizes', val: s, label: `Size: ${s}` }));
    activeFilters.stoneTypes.forEach(st => chips.push({ key: 'stoneTypes', val: st, label: st }));
    
    if (activeFilters.minPrice || activeFilters.maxPrice) {
      chips.push({ key: 'price', label: `${activeFilters.minPrice ? `${currencySymbol}${activeFilters.minPrice}` : '0'} - ${activeFilters.maxPrice ? `${currencySymbol}${activeFilters.maxPrice}` : 'Max'}` });
    }
    if (activeFilters.inStock) chips.push({ key: 'inStock', label: 'In Stock' });
    
    return chips;
  };

  const getQuickFilterLabel = () => {
    if (activeFilters.tag === "trending") return "Trending Now";
    if (activeFilters.sort === "newest") return "New Arrivals";
    if (activeFilters.sort === "bestselling") return "Best Sellers";
    return "All Products";
  };

  const handleQuickFilterSelect = (type) => {
    const newParams = new window.URLSearchParams(searchParams);
    if (type === 'newest') {
      newParams.set('sort', 'newest');
      newParams.delete('tag');
    } else if (type === 'trending') {
      newParams.delete('sort');
      newParams.set('tag', 'trending');
    } else if (type === 'bestselling') {
      newParams.set('sort', 'bestselling');
      newParams.delete('tag');
    } else {
      newParams.delete('tag');
      if (newParams.get('sort') === 'newest' || newParams.get('sort') === 'bestselling') {
        newParams.delete('sort');
      }
    }
    newParams.delete("page"); // reset pagination
    setPage(1);
    setSearchParams(newParams);
    setIsQuickFilterOpen(false);
  };

  const chips = getActiveChips();

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex flex-col font-sans">
      <Header />

      {/* Premium Banner Header */}
      <div className="pt-[100px] md:pt-[130px] pb-12 px-4 md:px-8 bg-gradient-to-b from-gray-50/80 to-white relative overflow-hidden border-b border-gray-100">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-gray-100/50 to-transparent pointer-events-none rounded-bl-[100px] mix-blend-multiply opacity-60" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-gray-100/40 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-[90rem] mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-6"
          >
            <Link to="/" className="hover:text-obsidian transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-gray-300" />
            <span className="text-obsidian">Shop</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif text-obsidian tracking-wide mb-5"
          >
            {getPageTitle()}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-sm md:text-base text-gray-500 font-medium max-w-lg mx-auto leading-relaxed"
          >
             Discover our curated selection of premium pieces, designed for elegance and crafted with care.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 px-6 py-2.5 bg-white/80 backdrop-blur-md rounded-full border border-gray-200/50 shadow-sm text-xs font-bold tracking-widest text-obsidian uppercase"
          >
            {totalResults} {totalResults === 1 ? 'Piece' : 'Pieces'} Found
          </motion.div>
        </div>
      </div>

      <main className="flex-1 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
             <div className="sticky top-[140px] bg-white rounded-[24px] border border-gray-100/80 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-2 pb-4 border-b border-gray-100">
                   <h2 className="text-sm uppercase tracking-[0.2em] font-black text-obsidian flex items-center">
                     <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                   </h2>
                   {chips.length > 0 && (
                      <button onClick={clearAllFilters} className="text-[10px] font-bold text-gray-400 hover:text-obsidian uppercase tracking-wider transition-colors">
                         Clear All
                      </button>
                   )}
                </div>
                <SidebarContent 
                   activeFilters={activeFilters} 
                   updateFilter={updateFilter} 
                   toggleArrayFilter={toggleArrayFilter} 
                   categories={categories}
                   PRICE_RANGES={PRICE_RANGES}
                   uniqueMaterials={uniqueMaterials}
                   uniqueStoneTypes={uniqueStoneTypes}
                   uniqueColors={uniqueColors}
                   uniqueSizes={uniqueSizes}
                />
             </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
             
             {/* Toolbar Row (Mobile Filter Trigger & Sort) */}
             <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <button 
                  className="lg:hidden flex items-center space-x-2 bg-white border border-gray-200 px-5 py-2.5 rounded-full text-xs font-bold text-obsidian shadow-sm hover:border-obsidian transition-colors"
                  onClick={() => setIsMobileDrawerOpen(true)}
                >
                  <Filter className="w-4 h-4" />
                  <span>Filters {chips.length > 0 && `(${chips.length})`}</span>
                </button>

                <div className="flex items-center gap-3 ml-auto">
                    {/* Quick Filters Dropdown */}
                    <div className="relative">
                       <button 
                         onClick={() => setIsQuickFilterOpen(!isQuickFilterOpen)}
                         className="flex items-center space-x-2 bg-white border border-gray-200 px-5 py-2.5 rounded-full text-xs font-bold text-obsidian shadow-sm hover:border-obsidian transition-colors focus:ring-4 focus:ring-obsidian/5"
                       >
                         <span>Filter: {getQuickFilterLabel()}</span>
                         <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isQuickFilterOpen ? 'rotate-180' : ''}`} />
                       </button>
                       
                       <AnimatePresence>
                          {isQuickFilterOpen && (
                             <>
                               <div className="fixed inset-0 z-10" onClick={() => setIsQuickFilterOpen(false)} />
                               <motion.div 
                                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                 animate={{ opacity: 1, y: 0, scale: 1 }}
                                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                 transition={{ duration: 0.2 }}
                                 className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-2 z-20"
                               >
                                  <button
                                    onClick={() => handleQuickFilterSelect('all')}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${(!activeFilters.tag && activeFilters.sort !== 'newest' && activeFilters.sort !== 'bestselling') ? 'bg-gray-50 text-obsidian font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-obsidian font-medium'}`}
                                  >
                                     All Products
                                  </button>
                                  <button
                                    onClick={() => handleQuickFilterSelect('newest')}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${(activeFilters.sort === 'newest' && !activeFilters.tag) ? 'bg-gray-50 text-obsidian font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-obsidian font-medium'}`}
                                  >
                                     New Arrivals
                                  </button>
                                  <button
                                    onClick={() => handleQuickFilterSelect('trending')}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${(activeFilters.tag === 'trending') ? 'bg-gray-50 text-obsidian font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-obsidian font-medium'}`}
                                  >
                                     Trending Now
                                  </button>
                                  <button
                                    onClick={() => handleQuickFilterSelect('bestselling')}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${(activeFilters.sort === 'bestselling' && !activeFilters.tag) ? 'bg-gray-50 text-obsidian font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-obsidian font-medium'}`}
                                  >
                                     Best Sellers
                                  </button>
                               </motion.div>
                             </>
                          )}
                       </AnimatePresence>
                    </div>

                    {/* Sort Dropdown */}
                    <div className="relative">
                       <button 
                         onClick={() => setIsSortOpen(!isSortOpen)}
                         className="flex items-center space-x-2 bg-white border border-gray-200 px-5 py-2.5 rounded-full text-xs font-bold text-obsidian shadow-sm hover:border-obsidian transition-colors focus:ring-4 focus:ring-obsidian/5"
                       >
                         <span>Sort by: {SORT_OPTIONS.find(o => o.value === activeFilters.sort)?.label || "Latest"}</span>
                         <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                       </button>
                       
                       <AnimatePresence>
                          {isSortOpen && (
                             <>
                               <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                               <motion.div 
                                 initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                 animate={{ opacity: 1, y: 0, scale: 1 }}
                                 exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                 transition={{ duration: 0.2 }}
                                 className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 p-2 z-20"
                               >
                                  {SORT_OPTIONS.map(opt => (
                                     <button
                                       key={opt.value}
                                       onClick={() => { updateFilter('sort', opt.value); setIsSortOpen(false); }}
                                       className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 ${activeFilters.sort === opt.value ? 'bg-gray-50 text-obsidian font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-obsidian font-medium'}`}
                                     >
                                        {opt.label}
                                     </button>
                                  ))}
                               </motion.div>
                             </>
                          )}
                       </AnimatePresence>
                    </div>
                </div>
             </div>

             {/* Active Filter Chips */}
             <AnimatePresence>
                {chips.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap items-center gap-2 mb-8"
                  >
                     {chips.map((chip, i) => (
                        <motion.span 
                          layout
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          key={`${chip.key}-${chip.val}`} 
                          className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-[13px] font-medium text-gray-700 shadow-sm hover:border-obsidian/30 hover:shadow-md transition-all duration-300"
                        >
                           {chip.label}
                           <button onClick={() => removeChip(chip.key, chip.val)} className="ml-2.5 text-gray-400 hover:text-obsidian transition-colors focus:outline-none">
                              <X className="w-3.5 h-3.5" />
                           </button>
                        </motion.span>
                     ))}
                     <motion.button 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={clearAllFilters} 
                        className="text-xs font-bold text-gray-400 hover:text-obsidian underline ml-2 transition-colors"
                     >
                        Clear All
                     </motion.button>
                  </motion.div>
                )}
             </AnimatePresence>

             {/* Product Grid */}
             {loading && page === 1 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                  {[...Array(8)].map((_, i) => (
                     <div key={i} className="flex flex-col group animate-pulse">
                        <div className="bg-gray-200/60 aspect-[4/5] rounded-2xl mb-4 overflow-hidden relative">
                        </div>
                        <div className="h-4 bg-gray-200/60 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200/60 rounded w-1/4"></div>
                     </div>
                  ))}
                </div>
             ) : products.length > 0 ? (
                <>
                  <motion.div layout className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                    <AnimatePresence mode="popLayout">
                      {products.map((product, idx) => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.4, delay: (idx % 12) * 0.05 }}
                          key={product._id} 
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                  
                  {hasMore && (
                     <div className="mt-16 flex justify-center pb-12">
                        <button
                          onClick={() => setPage(p => p + 1)}
                          disabled={loading}
                          className="px-8 py-3.5 bg-obsidian text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-black hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center space-x-3"
                        >
                          {loading ? (
                             <>
                               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                               <span>Loading...</span>
                             </>
                          ) : (
                             <span>Load More</span>
                          )}
                        </button>
                     </div>
                  )}
                </>
             ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-gray-100 p-16 text-center max-w-2xl mx-auto rounded-3xl shadow-sm mt-8"
                >
                   <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                      <Search className="w-8 h-8 text-gray-300" />
                   </div>
                   <h3 className="text-2xl font-serif text-obsidian mb-3">No pieces found</h3>
                   <p className="text-gray-500 mb-8 text-sm max-w-sm mx-auto leading-relaxed">
                     We couldn&apos;t find any items matching your current filters. Try adjusting them to discover more.
                   </p>
                   <button onClick={clearAllFilters} className="bg-obsidian text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-black hover:shadow-lg transition-all">
                     Clear All Filters
                   </button>
                </motion.div>
             )}
          </div>
        </div>
      </main>

      <Suspense fallback={<div className="h-20 bg-obsidian"></div>}>
        <Footer />
      </Suspense>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-obsidian/40 backdrop-blur-sm z-[100] lg:hidden"
              onClick={() => setIsMobileDrawerOpen(false)} 
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[85vw] max-w-[340px] h-[100dvh] bg-white shadow-2xl z-[101] flex flex-col lg:hidden rounded-l-[24px] overflow-hidden"
            >
               <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-white/80 backdrop-blur-md relative z-10">
                 <h2 className="font-black text-sm uppercase tracking-widest text-obsidian flex items-center">
                   <SlidersHorizontal className="w-4 h-4 mr-2" /> Filters
                 </h2>
                 <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2.5 text-gray-400 hover:text-obsidian transition-colors bg-gray-50 hover:bg-gray-100 rounded-full">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 relative z-0">
                 <SidebarContent 
                   activeFilters={activeFilters} 
                   updateFilter={updateFilter} 
                   toggleArrayFilter={toggleArrayFilter} 
                   categories={categories}
                   PRICE_RANGES={PRICE_RANGES}
                   uniqueMaterials={uniqueMaterials}
                   uniqueStoneTypes={uniqueStoneTypes}
                   uniqueColors={uniqueColors}
                   uniqueSizes={uniqueSizes}
                 />
               </div>
               
               <div className="p-5 border-t border-gray-100 bg-white/90 backdrop-blur-md flex gap-3 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] relative z-10">
                 <button onClick={clearAllFilters} className="flex-1 bg-gray-50 text-gray-600 font-bold py-4 text-xs uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-colors">
                   Clear
                 </button>
                 <button onClick={() => setIsMobileDrawerOpen(false)} className="flex-[2] bg-obsidian text-white font-bold py-4 text-xs uppercase tracking-widest rounded-2xl hover:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] transition-all">
                   Show Items
                 </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
