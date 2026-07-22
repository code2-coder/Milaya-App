import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/frontend/src/pages/Shop.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Update PRICE_RANGES
price_ranges_old = """const PRICE_RANGES = [
  { label: "Under 5K", min: "", max: "5000" },
  { label: "5K - 10K", min: "5000", max: "10000" },
  { label: "10K - 15K", min: "10000", max: "15000" },
  { label: "15K - 20K", min: "15000", max: "20000" },
  { label: "20K - 25K", min: "20000", max: "25000" },
  { label: "25K+", min: "25000", max: "" }
];"""
price_ranges_new = """const PRICE_RANGES = [
  { label: "Under 2K", min: "", max: "2000" },
  { label: "Under 4K", min: "", max: "4000" },
  { label: "Under 6K", min: "", max: "6000" },
  { label: "Under 8K", min: "", max: "8000" },
  { label: "Under 10K", min: "", max: "10000" },
  { label: "Under 12K", min: "", max: "12000" },
  { label: "Under 14K", min: "", max: "14000" },
  { label: "15K+", min: "15000", max: "" }
];"""
content = content.replace(price_ranges_old, price_ranges_new)

# Update PriceSection count logic
price_map_old = """const isSelected = activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max;
                const pId = range.min === "" ? 0 : Number(range.min);
                const count = facets && facets.prices ? (facets.prices.find(f => f._id === pId)?.count || 0) : null;
                const isDisabled = count === 0 && !isSelected;"""
price_map_new = """const isSelected = activeFilters.minPrice === range.min && activeFilters.maxPrice === range.max;
                let count = null;
                if (facets && facets.prices) {
                  count = 0;
                  facets.prices.forEach(f => {
                    if (f._id === "15000+") {
                      if (range.min === "15000") count += f.count;
                    } else {
                      const bMin = Number(f._id);
                      const rMin = range.min ? Number(range.min) : 0;
                      const rMax = range.max ? Number(range.max) : Infinity;
                      if (bMin >= rMin && bMin < rMax) {
                        count += f.count;
                      }
                    }
                  });
                }
                const isDisabled = count === 0 && !isSelected;"""
content = content.replace(price_map_old, price_map_new)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Shop.jsx updated for new price ranges")
