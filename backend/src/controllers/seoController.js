import { Product } from "../models/productModel.js";
import { Category } from "../models/categoryModel.js";

export const getSitemap = async (req, res, next) => {
  try {
    const baseUrl = process.env.CLIENT_URL || "https://www.milayafashion.com";
    
    const [products, categories] = await Promise.all([
      Product.find({}),
      Category.find({})
    ]);

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/shop</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
`;

    // Add Categories
    categories.forEach(category => {
      xml += `
  <url>
    <loc>${baseUrl}/category/${category._id}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    // Add Products
    products.forEach(product => {
      xml += `
  <url>
    <loc>${baseUrl}/product/${product._id}</loc>
    <lastmod>${new Date(product.updatedAt || product.createdAt || Date.now()).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    xml += `\n</urlset>`;

    res.header("Content-Type", "application/xml");
    res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
};

export const getRobots = (req, res, next) => {
  try {
    const baseUrl = process.env.CLIENT_URL || "https://www.milayafashion.com";
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    
    const robots = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /cart
Disallow: /checkout
Disallow: /my-orders

Sitemap: ${sitemapUrl}`;

    res.header("Content-Type", "text/plain");
    res.status(200).send(robots);
  } catch (error) {
    next(error);
  }
};
