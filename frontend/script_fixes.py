import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/pages/Shop.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update maxPrice extraction
content = content.replace('maxPrice: searchParams.get("price[lte]") || "",', 'maxPrice: searchParams.get("price[lte]") || searchParams.get("price[lt]") || "",')

# 2. Update removeChip
old_remove_chip = """      if (key === 'price') {
        updateFilter('price[gte]', "");
        updateFilter('price[lte]', "");
      }"""
new_remove_chip = """      if (key === 'price') {
        updateFilter('price[gte]', "");
        updateFilter('price[lte]', "");
        updateFilter('price[lt]', "");
      }"""
content = content.replace(old_remove_chip, new_remove_chip)

# 3. Update PriceSection onClick
old_price_click = "onClick={() => { if(!isDisabled) { updateFilter('price[gte]', range.min); updateFilter('price[lte]', range.max); } }}"
new_price_click = "onClick={() => { if(!isDisabled) { updateFilter('price[gte]', range.min); if(range.min === '') { updateFilter('price[lt]', range.max); updateFilter('price[lte]', ''); } else { updateFilter('price[lte]', range.max); updateFilter('price[lt]', ''); } } }}"
content = content.replace(old_price_click, new_price_click)

# 4. Debounce fetchProducts
old_use_effect = """  useEffect(() => {
    if (categories.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProducts(page > 1);
    }
  }, [fetchProducts, categories, page]);"""

new_use_effect = """  useEffect(() => {
    if (categories.length > 0) {
      const timer = setTimeout(() => {
        fetchProducts(page > 1);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [fetchProducts, categories, page]);"""
content = content.replace(old_use_effect, new_use_effect)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Shop.jsx logic fixes applied")
