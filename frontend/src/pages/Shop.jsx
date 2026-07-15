import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { useCategory } from "../context/CategoryContext";

import { useSEO } from "../hooks/useSEO";
import api from "../api/axios";
import { 
  Filter, X, ChevronDown, ChevronRight, Search, 
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
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
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" }
];

// Reusable Checkbox List Component
const FilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="py-5 border-b border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4 text-sm tracking-wide">{title}</h3>
      <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
        {items.map(item => {
          const isChecked = activeFilters[stateKey].includes(item);
          return (
            <label key={item} className="flex items-center group cursor-pointer">
              <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors mr-3 ${isChecked ? 'bg-obsidian border-obsidian' : 'border-gray-300 group-hover:border-obsidian'}`} onClick={() => toggleArrayFilter(stateKey, item)}>
                {isChecked && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm tracking-wide ${isChecked ? 'text-obsidian font-semibold' : 'text-gray-600 group-hover:text-obsidian'}`}>{item}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

const SidebarContent = ({ activeFilters, updateFilter, toggleArrayFilter, categories, PRICE_RANGES, uniqueMaterials, uniqueStoneTypes, uniqueColors, uniqueSizes }) => (
  <div className="flex flex-col h-full bg-white">
    {/* Search */}
    <div className="py-5 border-b border-gray-100">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search collections..." 
          value={activeFilters.keyword}
          onChange={(e) => updateFilter('keyword', e.target.value)}
          className="w-full bg-gray-50 border-transparent focus:border-obsidian focus:ring-0 text-sm rounded-xl py-3 pl-10 pr-4 transition-all"
        />
      </div>
    </div>

    {/* Collections */}
    <div className="py-6 border-b border-gray-100">
      <h3 className="font-bold text-gray-900 mb-5 text-xs uppercase tracking-[0.15em]">Collections</h3>
      <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar pr-2">
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
    </div>

    {/* Price */}
    <div className="py-5 border-b border-gray-100">
      <h3 className="font-bold text-gray-900 mb-4 text-sm tracking-wide">Price</h3>
      <div className="space-y-2 mb-4">
        {PRICE_RANGES.map((range, i) => {
          const isSelected = activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max;
          return (
            <label key={i} className="flex items-center group cursor-pointer">
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors mr-3 ${isSelected ? 'border-obsidian' : 'border-gray-300 group-hover:border-obsidian'}`} onClick={() => { updateFilter('price[gte]', range.min); updateFilter('price[lte]', range.max); }}>
                {isSelected && <div className="w-2 h-2 rounded-full bg-obsidian" />}
              </div>
              <span className={`text-sm tracking-wide ${isSelected ? 'text-obsidian font-semibold' : 'text-gray-600'}`}>{range.label}</span>
            </label>
          );
        })}
      </div>
    </div>

    {/* Dynamic Filters */}
    <FilterSection title="Material" items={uniqueMaterials} stateKey="materials" activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />
    <FilterSection title="Stone Type" items={uniqueStoneTypes} stateKey="stoneTypes" activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />
    <FilterSection title="Color" items={uniqueColors} stateKey="colors" activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />
    <FilterSection title="Size" items={uniqueSizes} stateKey="sizes" activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />

    {/* Availability */}
    <div className="py-5">
      <label className="flex items-center group cursor-pointer">
        <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors mr-3 ${activeFilters.inStock ? 'bg-obsidian border-obsidian' : 'border-gray-300 group-hover:border-obsidian'}`} onClick={() => updateFilter('inStock', activeFilters.inStock ? "" : "true")}>
          {activeFilters.inStock && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className={`text-sm font-semibold tracking-wide ${activeFilters.inStock ? 'text-obsidian' : 'text-gray-700'}`}>In Stock Only</span>
      </label>
    </div>
  </div>
);

export function Shop() {
  useSEO("Shop All Collections", "Browse our complete collection of premium clothing, filter by budget and category.");
  
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
  }), [searchParams]);

  // Derived unique filter options from attributes
  const uniqueMaterials = useMemo(() => attributes.filter(a => a.type === 'material').map(a => a.value), [attributes]);
  const uniqueStoneTypes = useMemo(() => attributes.filter(a => a.type === 'stoneType').map(a => a.value), [attributes]);
  const uniqueColors = useMemo(() => attributes.filter(a => a.type === 'color').map(a => a.value), [attributes]);
  const uniqueSizes = useMemo(() => attributes.filter(a => a.type === 'size').map(a => a.value), [attributes]);
  
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
        // Map category names to IDs
        const catIds = activeFilters.category.map(catName => {
           const c = categories.find(c => c.name === catName);
           return c ? c._id : null;
        }).filter(Boolean);
        if (catIds.length > 0) url += `&category=${catIds.join(',')}`;
      }
      
      if (activeFilters.keyword) url += `&keyword=${encodeURIComponent(activeFilters.keyword)}`;
      if (activeFilters.minPrice) url += `&price[gte]=${activeFilters.minPrice}`;
      if (activeFilters.maxPrice) url += `&price[lte]=${activeFilters.maxPrice}`;
      if (activeFilters.materials.length > 0) url += `&materials=${encodeURIComponent(activeFilters.materials.join(','))}`;
      if (activeFilters.colors.length > 0) url += `&colors=${encodeURIComponent(activeFilters.colors.join(','))}`;
      if (activeFilters.sizes.length > 0) url += `&sizes=${encodeURIComponent(activeFilters.sizes.join(','))}`;
      if (activeFilters.stoneTypes.length > 0) url += `&stoneTypes=${encodeURIComponent(activeFilters.stoneTypes.join(','))}`;
      if (activeFilters.inStock) url += `&inStock=true`;
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

  const chips = getActiveChips();

  return (
    <div className="min-h-screen bg-gray-50/30 flex flex-col">
      <Header />

      {/* Page Header */}
      <div className="pt-[100px] md:pt-[130px] pb-6 px-4 md:px-8 bg-white border-b border-gray-100">
         <div className="max-w-[90rem] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
               <div className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold mb-3">
                  <Link to="/" className="hover:text-obsidian transition-colors">Home</Link>
                  <ChevronRight className="w-3 h-3 text-gray-300" />
                  <span className="text-obsidian">Shop</span>
               </div>
               <h1 className="text-3xl lg:text-4xl font-serif text-obsidian tracking-wide">The Collection</h1>
            </div>
            <p className="text-sm text-gray-500 font-medium">{totalResults} pieces found</p>
         </div>
      </div>

      <main className="flex-1 max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
             <div className="sticky top-[140px] bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                   <h2 className="text-sm uppercase tracking-[0.2em] font-black text-obsidian flex items-center">
                     <Filter className="w-4 h-4 mr-2" /> Filters
                   </h2>
                   {chips.length > 0 && (
                      <button onClick={clearAllFilters} className="text-[10px] font-bold text-gray-400 hover:text-obsidian uppercase tracking-wider">
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

                {/* Sort Dropdown */}
                <div className="relative ml-auto">
                   <button 
                     onClick={() => setIsSortOpen(!isSortOpen)}
                     className="flex items-center space-x-2 bg-white border border-gray-200 px-5 py-2.5 rounded-full text-xs font-bold text-obsidian shadow-sm hover:border-obsidian transition-colors"
                   >
                     <span>Sort by: {SORT_OPTIONS.find(o => o.value === activeFilters.sort)?.label || "Latest"}</span>
                     <ChevronDown className={`w-4 h-4 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                   </button>
                   
                   <AnimatePresence>
                      {isSortOpen && (
                         <>
                           <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                           <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             exit={{ opacity: 0, y: 10 }}
                             className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-20"
                           >
                              {SORT_OPTIONS.map(opt => (
                                 <button
                                   key={opt.value}
                                   onClick={() => { updateFilter('sort', opt.value); setIsSortOpen(false); }}
                                   className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${activeFilters.sort === opt.value ? 'bg-gray-50 text-obsidian font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-obsidian font-medium'}`}
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

             {/* Active Filter Chips */}
             {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-8">
                   {chips.map((chip, i) => (
                      <span key={i} className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 shadow-sm">
                         {chip.label}
                         <button onClick={() => removeChip(chip.key, chip.val)} className="ml-2 text-gray-400 hover:text-obsidian transition-colors focus:outline-none">
                            <X className="w-3.5 h-3.5" />
                         </button>
                      </span>
                   ))}
                   <button onClick={clearAllFilters} className="text-xs font-bold text-gray-500 hover:text-obsidian underline ml-2 transition-colors">
                      Clear All
                   </button>
                </div>
             )}

             {/* Product Grid */}
             {loading && page === 1 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {[1,2,3,4,5,6,7,8].map(i => (
                     <div key={i} className="bg-gray-100 aspect-[4/5] animate-pulse rounded-2xl"></div>
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
                          className="px-8 py-3.5 bg-obsidian text-white text-xs font-bold uppercase tracking-widest rounded-full hover:bg-black hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-3"
                        >
                          <span>{loading ? "Loading..." : "Load More"}</span>
                        </button>
                     </div>
                  )}
                </>
             ) : (
                <div className="bg-white border border-gray-100 p-16 text-center max-w-2xl mx-auto rounded-3xl shadow-sm mt-8">
                   <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-6 h-6 text-gray-400" />
                   </div>
                   <h3 className="text-2xl font-serif text-obsidian mb-3">No pieces found</h3>
                   <p className="text-gray-500 mb-8 text-sm max-w-sm mx-auto leading-relaxed">
                     We couldn&apos;t find any items matching your current filters. Try adjusting them to discover more.
                   </p>
                   <button onClick={clearAllFilters} className="bg-obsidian text-white font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-black transition-all">
                     Clear All Filters
                   </button>
                </div>
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
              className="fixed top-0 right-0 w-[300px] h-[100dvh] bg-white shadow-2xl z-[101] flex flex-col lg:hidden"
            >
               <div className="p-5 flex justify-between items-center border-b border-gray-100 bg-white">
                 <h2 className="font-black text-sm uppercase tracking-widest text-obsidian flex items-center">
                   <Filter className="w-4 h-4 mr-2" /> Filters
                 </h2>
                 <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2 text-gray-400 hover:text-obsidian transition-colors bg-gray-50 rounded-full">
                   <X className="w-4 h-4" />
                 </button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6">
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
               
               <div className="p-5 border-t border-gray-100 bg-white flex gap-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                 <button onClick={clearAllFilters} className="flex-1 bg-gray-50 text-gray-600 font-bold py-3.5 text-xs uppercase tracking-widest rounded-xl hover:bg-gray-100 transition-colors">
                   Clear
                 </button>
                 <button onClick={() => setIsMobileDrawerOpen(false)} className="flex-[2] bg-obsidian text-white font-bold py-3.5 text-xs uppercase tracking-widest rounded-xl hover:bg-black transition-colors">
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
