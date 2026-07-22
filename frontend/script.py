import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/pages/Shop.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add facets state
content = re.sub(r'const \[attributes, setAttributes\] = useState\(\[\]\);', 'const [attributes, setAttributes] = useState([]);\n  const [facets, setFacets] = useState(null);', content)

# 2. Update fetchProducts
fetch_old = "const { data } = await api.get(url);"
fetch_new = """const facetsUrl = url.replace('/products?', '/products/facets?').replace(/limit=\\d+&page=\\d+&?/, '');
      const [productsRes, facetsRes] = await Promise.all([
        api.get(url),
        api.get(facetsUrl).catch(() => ({ data: { facets: null } }))
      ]);
      const { data } = productsRes;
      if (facetsRes.data && facetsRes.data.facets) {
        setFacets(facetsRes.data.facets);
      }"""
content = content.replace(fetch_old, fetch_new)

# 3. Update SidebarContent signature
content = content.replace("uniqueStoneTypes, uniqueColors, uniqueSizes }) => (", "uniqueStoneTypes, uniqueColors, uniqueSizes, facets }) => (")
content = content.replace("<SidebarContent \n                   activeFilters={activeFilters}", "<SidebarContent \n                   facets={facets}\n                   activeFilters={activeFilters}")

# 4. Update FilterSection
filter_section_old = "const FilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter, defaultOpen = false }) => {"
filter_section_new = "const FilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter, defaultOpen = false, facets }) => {"
content = content.replace(filter_section_old, filter_section_new)

filter_map_old = """const isChecked = activeFilters[stateKey].includes(item);
                  return (
                    <label key={item} className="flex items-center group cursor-pointer">
                      <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors mr-3 ${isChecked ? 'bg-obsidian border-obsidian' : 'border-gray-300 group-hover:border-obsidian'}`} onClick={() => toggleArrayFilter(stateKey, item)}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm tracking-wide ${isChecked ? 'text-obsidian font-semibold' : 'text-gray-600 group-hover:text-obsidian transition-colors'}`}>{item}</span>
                    </label>
                  );"""
filter_map_new = """const isChecked = activeFilters[stateKey].includes(item);
                  const count = facets && facets[stateKey] ? (facets[stateKey].find(f => f._id === item)?.count || 0) : null;
                  const isDisabled = count === 0 && !isChecked;
                  return (
                    <label key={item} className={`flex items-center group ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors mr-3 ${isChecked ? 'bg-obsidian border-obsidian' : 'border-gray-300 group-hover:border-obsidian'}`} onClick={() => !isDisabled && toggleArrayFilter(stateKey, item)}>
                        {isChecked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className={`text-sm tracking-wide flex-1 ${isChecked ? 'text-obsidian font-semibold' : 'text-gray-600 group-hover:text-obsidian transition-colors'}`}>{item}</span>
                      {count !== null && <span className="text-[10px] text-gray-400 font-medium">({count})</span>}
                    </label>
                  );"""
content = content.replace(filter_map_old, filter_map_new)

# 5. Update CategoriesSection
cat_section_old = "const CategoriesSection = ({ categories, activeFilters, toggleArrayFilter, defaultOpen = true }) => {"
cat_section_new = "const CategoriesSection = ({ categories, activeFilters, toggleArrayFilter, defaultOpen = true, facets }) => {"
content = content.replace(cat_section_old, cat_section_new)

# Subcategories
subcat_old = """const isSubActive = activeFilters.category.includes(sub.name);
                        return (
                        <div 
                          key={sub._id} 
                          onClick={() => toggleArrayFilter('category', sub.name)}
                          className={`flex items-center justify-between py-1.5 cursor-pointer group transition-all duration-200 ${isSubActive ? 'text-obsidian' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                          <span className={`text-[11px] uppercase tracking-wider ${isSubActive ? 'font-bold' : 'font-medium'}`}>{sub.name}</span>
                          {isSubActive && <Check className="w-3 h-3 text-obsidian" />}
                        </div>
                        );"""
subcat_new = """const isSubActive = activeFilters.category.includes(sub.name);
                        const subCount = facets && facets.categories ? (facets.categories.find(f => f._id === sub._id)?.count || 0) : null;
                        const isSubDisabled = subCount === 0 && !isSubActive;
                        return (
                        <div 
                          key={sub._id} 
                          onClick={() => !isSubDisabled && toggleArrayFilter('category', sub.name)}
                          className={`flex items-center justify-between py-1.5 group transition-all duration-200 ${isSubDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isSubActive ? 'text-obsidian' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                          <span className={`text-[11px] uppercase tracking-wider ${isSubActive ? 'font-bold' : 'font-medium'}`}>{sub.name} {subCount !== null && `(${subCount})`}</span>
                          {isSubActive && <Check className="w-3 h-3 text-obsidian" />}
                        </div>
                        );"""
content = content.replace(subcat_old, subcat_new)

# Categories
cat_old = """const isActive = activeFilters.category.includes(cat.name);
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
                  </div>"""
cat_new = """const isActive = activeFilters.category.includes(cat.name);
                const hasSubcategories = categories.some(sub => sub.parentCategory === cat._id);
                const catCount = facets && facets.categories ? (facets.categories.find(f => f._id === cat._id)?.count || 0) : null;
                const isCatDisabled = catCount === 0 && !isActive && !hasSubcategories;
                return (
                <div key={cat._id} className="flex flex-col">
                  <div 
                    onClick={() => !isCatDisabled && toggleArrayFilter('category', cat.name)}
                    className={`flex items-center justify-between py-2.5 group transition-all duration-300 ${isCatDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${isActive ? 'text-obsidian' : 'text-gray-500 hover:text-gray-900'}`}
                  >
                    <span className={`text-[13px] tracking-wide ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {cat.name} {catCount !== null && !hasSubcategories && <span className="text-[10px] text-gray-400 font-medium ml-1">({catCount})</span>}
                    </span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 ${isActive ? 'border-obsidian bg-obsidian' : 'border-gray-300 group-hover:border-gray-500'}`}>
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>"""
content = content.replace(cat_old, cat_new)


# 6. Update PriceSection
price_section_old = "const PriceSection = ({ PRICE_RANGES, activeFilters, updateFilter, defaultOpen = true }) => {"
price_section_new = "const PriceSection = ({ PRICE_RANGES, activeFilters, updateFilter, defaultOpen = true, facets }) => {"
content = content.replace(price_section_old, price_section_new)

price_map_old = """const isSelected = activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max;
                return (
                  <label key={i} className="flex items-center group cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors mr-3 ${isSelected ? 'border-obsidian' : 'border-gray-300 group-hover:border-obsidian'}`} onClick={() => { updateFilter('price[gte]', range.min); updateFilter('price[lte]', range.max); }}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-obsidian" />}
                    </div>
                    <span className={`text-sm tracking-wide transition-colors ${isSelected ? 'text-obsidian font-semibold' : 'text-gray-600 group-hover:text-obsidian'}`}>{range.label}</span>
                  </label>
                );"""
price_map_new = """const isSelected = activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max;
                const pId = range.min === "" ? 0 : Number(range.min);
                const count = facets && facets.prices ? (facets.prices.find(f => f._id === pId)?.count || 0) : null;
                const isDisabled = count === 0 && !isSelected;
                return (
                  <label key={i} className={`flex items-center group ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors mr-3 ${isSelected ? 'border-obsidian' : 'border-gray-300 group-hover:border-obsidian'}`} onClick={() => { if(!isDisabled) { updateFilter('price[gte]', range.min); updateFilter('price[lte]', range.max); } }}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-obsidian" />}
                    </div>
                    <span className={`text-sm tracking-wide flex-1 transition-colors ${isSelected ? 'text-obsidian font-semibold' : 'text-gray-600 group-hover:text-obsidian'}`}>{range.label}</span>
                    {count !== null && <span className="text-[10px] text-gray-400 font-medium">({count})</span>}
                  </label>
                );"""
content = content.replace(price_map_old, price_map_new)

# 7. SidebarContent passing facets to children
content = content.replace("<CategoriesSection categories={categories} activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />", "<CategoriesSection facets={facets} categories={categories} activeFilters={activeFilters} toggleArrayFilter={toggleArrayFilter} />")
content = content.replace("<PriceSection PRICE_RANGES={PRICE_RANGES} activeFilters={activeFilters} updateFilter={updateFilter} />", "<PriceSection facets={facets} PRICE_RANGES={PRICE_RANGES} activeFilters={activeFilters} updateFilter={updateFilter} />")
content = content.replace("<FilterSection title=\"Material\"", "<FilterSection facets={facets} title=\"Material\"")
content = content.replace("<FilterSection title=\"Stone Type\"", "<FilterSection facets={facets} title=\"Stone Type\"")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Shop.jsx updated")
