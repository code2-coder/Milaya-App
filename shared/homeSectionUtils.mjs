export const HOME_SECTION_OPTIONS = ["New Arrival", "Best Seller", "Trending Product"];

export function getHomeSectionGroups(products = []) {
    const groups = HOME_SECTION_OPTIONS.map((title) => ({
        title,
        key: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        products: [],
    }));

    (products || []).forEach((product) => {
        const match = groups.find((group) => group.title === product?.homeSection);
        if (match) {
            match.products.push(product);
        }
    });

    return groups.filter((group) => group.products.length > 0);
}
