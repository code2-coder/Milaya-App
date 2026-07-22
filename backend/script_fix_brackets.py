import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/backend/src/utils/apiFilters.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

old_code = """        // Advance filter
        let queryStr = JSON.stringify(queryCopy);"""

new_code = """        // Expand flat bracket keys from Express (e.g., { "price[lt]": "4000" } -> { "price": { "lt": "4000" } })
        for (const key in queryCopy) {
            const match = key.match(/^(.+)\[(gt|gte|lt|lte)\]$/);
            if (match) {
                const field = match[1];
                const op = match[2];
                if (!queryCopy[field]) queryCopy[field] = {};
                queryCopy[field][op] = queryCopy[key];
                delete queryCopy[key];
            }
        }

        // Advance filter
        let queryStr = JSON.stringify(queryCopy);"""

content = content.replace(old_code, new_code)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Fixed APIFilters.js to expand bracket notation")
