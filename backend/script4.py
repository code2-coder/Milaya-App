import re

file_path = "e:/VaibhavPawar/CodeFusionProjects/WorkSpace/ClothingBrand/Milaya-App/backend/src/utils/apiFilters.js"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace sizes block
sizes_old = """        // Handle sizes array
        if (this.queryStr.sizes) {
            const sizes = this.queryStr.sizes.split(',').map(s => s.trim());
            if (sizes.length > 0 && sizes[0] !== '') {
                filterObj['$or'] = [
                    { 'variants.sizes.size': { $in: sizes } },
                    { 'sizes.size': { $in: sizes } }
                ];
            }
        }"""
sizes_new = """        // Handle sizes array
        if (this.queryStr.sizes) {
            const sizes = this.queryStr.sizes.split(',').filter(s => s.trim() !== '').map(s => new RegExp(`^${s.trim()}$`, 'i'));
            if (sizes.length > 0) {
                filterObj['$and'] = filterObj['$and'] || [];
                filterObj['$and'].push({
                    $or: [
                        { 'variants.sizes.size': { $in: sizes } },
                        { 'sizes.size': { $in: sizes } }
                    ]
                });
            }
        }"""
content = content.replace(sizes_old, sizes_new)

# Replace colors block
colors_old = """        // Handle colors array
        if (this.queryStr.colors) {
            const colors = this.queryStr.colors.split(',').filter(c => c.trim() !== '').map(c => new RegExp(`^${c.trim()}$`, 'i'));
            if (colors.length > 0) {
                // Search both variants.colorHex and color field
                filterObj['$or'] = filterObj['$or'] || [];
                filterObj['$or'].push(
                   { 'variants.colorHex': { $in: colors } },
                   { color: { $in: colors } }
                );
            }
        }"""
colors_new = """        // Handle colors array
        if (this.queryStr.colors) {
            const colors = this.queryStr.colors.split(',').filter(c => c.trim() !== '').map(c => new RegExp(`^${c.trim()}$`, 'i'));
            if (colors.length > 0) {
                filterObj['$and'] = filterObj['$and'] || [];
                filterObj['$and'].push({
                    $or: [
                        { 'variants.colorHex': { $in: colors } },
                        { 'variants.colorName': { $in: colors } },
                        { color: { $in: colors } }
                    ]
                });
            }
        }"""
content = content.replace(colors_old, colors_new)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("apiFilters.js updated successfully")
