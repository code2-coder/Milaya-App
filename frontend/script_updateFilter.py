import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/pages/Shop.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Update updateFilter
old_update_filter = """  const updateFilter = useCallback((key, value) => {
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
  }, [searchParams, setSearchParams]);"""

new_update_filter = """  const updateFilter = useCallback((keyOrObj, value) => {
    const newParams = new window.URLSearchParams(searchParams);
    
    if (typeof keyOrObj === 'object' && keyOrObj !== null && !Array.isArray(keyOrObj)) {
      Object.entries(keyOrObj).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          if (v.length > 0) newParams.set(k, v.join(','));
          else newParams.delete(k);
        } else if (v !== "" && v !== null && v !== undefined) {
          newParams.set(k, v);
        } else {
          newParams.delete(k);
        }
      });
    } else {
      const key = keyOrObj;
      if (Array.isArray(value)) {
        if (value.length > 0) newParams.set(key, value.join(','));
        else newParams.delete(key);
      } else if (value !== "" && value !== null && value !== undefined) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    }
    
    newParams.delete("page"); // reset pagination
    setPage(1);
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);"""
content = content.replace(old_update_filter, new_update_filter)

# Update PriceSection onClick
old_price_click = "onClick={() => { if(!isDisabled) { updateFilter('price[gte]', range.min); if(range.min === '') { updateFilter('price[lt]', range.max); updateFilter('price[lte]', ''); } else { updateFilter('price[lte]', range.max); updateFilter('price[lt]', ''); } } }}"
new_price_click = "onClick={() => { if(!isDisabled) { if(range.min === '') { updateFilter({ 'price[gte]': range.min, 'price[lt]': range.max, 'price[lte]': '' }); } else { updateFilter({ 'price[gte]': range.min, 'price[lte]': range.max, 'price[lt]': '' }); } } }}"
content = content.replace(old_price_click, new_price_click)

# Update removeChip for price
old_remove_chip = """      if (key === 'price') {
        updateFilter('price[gte]', "");
        updateFilter('price[lte]', "");
        updateFilter('price[lt]', "");
      }"""
new_remove_chip = """      if (key === 'price') {
        updateFilter({ 'price[gte]': "", 'price[lte]': "", 'price[lt]': "" });
      }"""
content = content.replace(old_remove_chip, new_remove_chip)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Shop.jsx updateFilter sequential updates fixed")
