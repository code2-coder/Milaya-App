class APIFilters {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    // 🔍 SEARCH — regex for prefix matching (1–2 chars), $text for longer terms
    search() {
        if (this.queryStr.keyword) {
            const kw = this.queryStr.keyword.trim();
            const regex = new RegExp(kw, 'i');
            
            // Build the base $or array for both modes
            const searchOrBlock = [
                { name: { $regex: regex } },
                { description: { $regex: regex } },
                { material: { $regex: regex } },
                { metalColor: { $regex: regex } },
                { color: { $regex: regex } },
                { stoneType: { $regex: regex } },
                { features: { $regex: regex } },
                { 'variants.sku': { $regex: regex } },
                { 'variants.sizes.sku': { $regex: regex } },
                { 'sizes.sku': { $regex: regex } },
                { 'variants.colorName': { $regex: regex } }
            ];

            // If we manually resolved category IDs matching this keyword in the service, inject them
            if (this.queryStr.matchedCategories && this.queryStr.matchedCategories.length > 0) {
                searchOrBlock.push({ category: { $in: this.queryStr.matchedCategories } });
            }

            // Execute regex search for all inputs. 
            // Avoid using $text inside $or unless ALL other fields in the $or array are fully indexed.
            this.query = this.query.find({ $or: searchOrBlock });
        }
        return this;
    }

    // 🎯 FILTER (price, ratings, category etc)
    filters() {
        const queryCopy = { ...this.queryStr };

        // Remove fields that should not be strictly filtered
        const removeFields = ["keyword", "page", "limit", "sort", "category", "sizes", "colors", "materials", "stoneTypes"];
        removeFields.forEach((el) => delete queryCopy[el]);

        // Expand flat bracket keys from Express (e.g., { "price[lt]": "4000" } -> { "price": { "lt": 4000 } })
        for (const key in queryCopy) {
            const match = key.match(/^(.+)\[(gt|gte|lt|lte)\]$/);
            if (match) {
                const field = match[1];
                const op = match[2];
                if (!queryCopy[field]) queryCopy[field] = {};
                
                let val = queryCopy[key];
                if (!isNaN(val) && val !== "") {
                    val = Number(val);
                }
                
                queryCopy[field][op] = val;
                delete queryCopy[key];
            }
        }

        // Advance filter
        let queryStr = JSON.stringify(queryCopy);

        // Convert to Mongo operators ($gt, $gte, etc)
        queryStr = queryStr.replace(
            /\b(gt|gte|lt|lte)\b/g,
            (key) => `$${key}`
        );

        let filterObj = JSON.parse(queryStr);

        // Handle category array
        if (this.queryStr.category) {
            const categories = this.queryStr.category.split(',').map(c => c.trim());
            if (categories.length > 0 && categories[0] !== '') {
                filterObj.category = { $in: categories };
            }
        }

        // Handle sizes array
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
        }

        // Handle colors array
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
        }

        // Handle materials array
        if (this.queryStr.materials) {
            const materials = this.queryStr.materials.split(',').filter(m => m.trim() !== '').map(m => new RegExp(`^${m.trim()}$`, 'i'));
            if (materials.length > 0) {
                filterObj.material = { $in: materials };
            }
        }

        // Handle stoneTypes array
        if (this.queryStr.stoneTypes) {
            const stoneTypes = this.queryStr.stoneTypes.split(',').filter(s => s.trim() !== '').map(s => new RegExp(`^${s.trim()}$`, 'i'));
            if (stoneTypes.length > 0) {
                filterObj.stoneType = { $in: stoneTypes };
            }
        }

        // Handle inStock boolean
        if (this.queryStr.inStock === 'true') {
            filterObj.stock = { $gt: 0 };
        }

        this.query = this.query.find(filterObj);
        return this;
    }

    // 🔀 SORTING
    sort() {
        if (this.queryStr.sort) {
            switch (this.queryStr.sort) {
                case 'price_asc':
                    this.query = this.query.sort({ price: 1 });
                    break;
                case 'price_desc':
                    this.query = this.query.sort({ price: -1 });
                    break;
                case 'rating':
                    this.query = this.query.sort({ ratings: -1 });
                    break;
                case 'newest':
                    this.query = this.query.sort({ createdAt: -1 });
                    break;
                case 'bestselling':
                case 'popular':
                    this.query = this.query.sort({ numOfReviews: -1 });
                    break;
                case 'name_asc':
                    this.query = this.query.sort({ name: 1 });
                    break;
                case 'name_desc':
                    this.query = this.query.sort({ name: -1 });
                    break;
                case 'featured':
                    this.query = this.query.sort({ homeSection: -1, createdAt: -1 });
                    break;
                default:
                    this.query = this.query.sort({ createdAt: -1 });
                    break;
            }
        } else {
            // Default sort if keyword exists and length > 2
            if (this.queryStr.keyword && this.queryStr.keyword.length > 2) {
               // Relevance sorting is handled in search() now via $text, but we removed select/sort from there.
               // So we just sort by createdAt for now.
               this.query = this.query.sort({ createdAt: -1 });
            } else {
               this.query = this.query.sort({ createdAt: -1 });
            }
        }
        return this;
    }

    // 📄 PAGINATION
    pagination(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const limit = Number(this.queryStr.limit) || resPerPage;

        const skip = limit * (currentPage - 1);

        this.query = this.query.limit(limit).skip(skip);
        return this;
    }
}

export default APIFilters;
