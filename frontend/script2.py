import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/pages/Shop.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# ColorFilterSection
color_old = "const ColorFilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter, defaultOpen = false }) => {"
color_new = "const ColorFilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter, defaultOpen = false, facets }) => {"
content = content.replace(color_old, color_new)

color_map_old = """const hex = getColorHex(item);
                const isWhite = hex.toLowerCase() === '#ffffff' || item.toLowerCase() === 'white';
                return (
                  <button
                    key={item}
                    onClick={() => toggleArrayFilter(stateKey, item)}
                    title={item}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isWhite ? 'border border-gray-300' : 'border border-transparent shadow-sm'} ${isChecked ? 'ring-2 ring-obsidian ring-offset-2 scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: hex }}
                  >"""
color_map_new = """const hex = getColorHex(item);
                const isWhite = hex.toLowerCase() === '#ffffff' || item.toLowerCase() === 'white';
                const count = facets && facets.colors ? (facets.colors.find(f => f._id === item)?.count || 0) : null;
                const isDisabled = count === 0 && !isChecked;
                return (
                  <button
                    key={item}
                    onClick={() => !isDisabled && toggleArrayFilter(stateKey, item)}
                    title={`${item} ${count !== null ? `(${count})` : ''}`}
                    disabled={isDisabled}
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isWhite ? 'border border-gray-300' : 'border border-transparent shadow-sm'} ${isChecked ? 'ring-2 ring-obsidian ring-offset-2 scale-110' : 'hover:scale-110'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                    style={{ backgroundColor: hex }}
                  >"""
content = content.replace(color_map_old, color_map_new)

# SizeFilterSection
size_old = "const SizeFilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter, defaultOpen = false }) => {"
size_new = "const SizeFilterSection = ({ title, items, stateKey, activeFilters, toggleArrayFilter, defaultOpen = false, facets }) => {"
content = content.replace(size_old, size_new)

size_map_old = """return (
                  <button
                    key={item}
                    onClick={() => toggleArrayFilter(stateKey, item)}
                    className={`min-w-[40px] h-10 px-3 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-center ${isChecked ? 'bg-obsidian border-obsidian text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-obsidian hover:text-obsidian'}`}
                  >
                    {item}
                  </button>
                );"""
size_map_new = """const count = facets && facets.sizes ? (facets.sizes.find(f => f._id === item)?.count || 0) : null;
                const isDisabled = count === 0 && !isChecked;
                return (
                  <button
                    key={item}
                    onClick={() => !isDisabled && toggleArrayFilter(stateKey, item)}
                    title={count !== null ? `${count} items` : ''}
                    disabled={isDisabled}
                    className={`min-w-[40px] h-10 px-3 rounded-xl border text-xs font-bold transition-all duration-300 flex items-center justify-center ${isChecked ? 'bg-obsidian border-obsidian text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:border-obsidian hover:text-obsidian'} ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {item}
                  </button>
                );"""
content = content.replace(size_map_old, size_map_new)

content = content.replace("<ColorFilterSection title=\"Color\"", "<ColorFilterSection facets={facets} title=\"Color\"")
content = content.replace("<SizeFilterSection title=\"Size\"", "<SizeFilterSection facets={facets} title=\"Size\"")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Shop.jsx updated colors and sizes")
