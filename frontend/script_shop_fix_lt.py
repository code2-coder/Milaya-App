import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/pages/Shop.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace activeFilters state assignment
old_active = """    minPrice: searchParams.get("price[gte]") || "",
    maxPrice: searchParams.get("price[lte]") || searchParams.get("price[lt]") || "","""
new_active = """    minPrice: searchParams.get("price[gte]") || "",
    maxPrice: searchParams.get("price[lte]") || "",
    ltPrice: searchParams.get("price[lt]") || "","""
content = content.replace(old_active, new_active)

# Replace url building
old_url = """      if (activeFilters.minPrice) url += `&price[gte]=${activeFilters.minPrice}`;
      if (activeFilters.maxPrice) url += `&price[lte]=${activeFilters.maxPrice}`;"""
new_url = """      if (activeFilters.minPrice) url += `&price[gte]=${activeFilters.minPrice}`;
      if (activeFilters.maxPrice) url += `&price[lte]=${activeFilters.maxPrice}`;
      if (activeFilters.ltPrice) url += `&price[lt]=${activeFilters.ltPrice}`;"""
content = content.replace(old_url, new_url)

# Replace PriceSection isSelected logic
old_isSelected = "const isSelected = activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max;"
new_isSelected = "const isSelected = activeFilters.minPrice === range.min && (activeFilters.maxPrice === range.max || activeFilters.ltPrice === range.max);"
content = content.replace(old_isSelected, new_isSelected)

# Replace price chip label logic
old_chip = """    if (activeFilters.minPrice || activeFilters.maxPrice) {
      chips.push({ key: 'price', label: `${activeFilters.minPrice ? `${currencySymbol}${activeFilters.minPrice}` : '0'} - ${activeFilters.maxPrice ? `${currencySymbol}${activeFilters.maxPrice}` : 'Max'}` });
    }"""
new_chip = """    if (activeFilters.minPrice || activeFilters.maxPrice || activeFilters.ltPrice) {
      chips.push({ key: 'price', label: `${activeFilters.minPrice ? `${currencySymbol}${activeFilters.minPrice}` : '0'} - ${activeFilters.maxPrice ? `${currencySymbol}${activeFilters.maxPrice}` : activeFilters.ltPrice ? `${currencySymbol}${activeFilters.ltPrice}` : 'Max'}` });
    }"""
content = content.replace(old_chip, new_chip)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed strict lt / lte passing to URL in fetchProducts")
