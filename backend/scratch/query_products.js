import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../src/models/product.js";
import ProductService from "../src/services/ProductService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    // Find the first product named "Chandrika demo" that has variants
    const product = await Product.findOne({ name: "Chandrika demo", "variants.0": { $exists: true } });
    if (!product) {
      console.log("Variant product 'Chandrika demo' not found");
      process.exit(1);
    }

    console.log(`Product found: ${product.name} (ID: ${product._id}), current status: ${product.status}`);

    const cleanVariants = (product.variants || []).map(v => {
      const plainV = v.toObject ? v.toObject() : v;
      const { _id, id, ...rest } = plainV;
      return {
        ...rest,
        images: rest.images?.map(img => { const { _id, id, ...imgRest } = img; return imgRest; }) || [],
        videos: rest.videos?.map(vid => { const { _id, id, ...vidRest } = vid; return vidRest; }) || [],
        sizes: rest.sizes?.map(size => { const { _id, id, ...sizeRest } = size; return sizeRest; }) || []
      };
    });

    const payload = {
      name: product.name,
      description: product.description,
      category: product.category ? product.category.toString() : "",
      price: product.price,
      stock: product.stock,
      homeSection: product.homeSection || "",
      status: "draft",
      images: product.images || [],
      videos: product.videos || [],
      variants: cleanVariants,
      features: product.features || [],
      material: product.material || "",
      metal: product.metal || "",
      stoneType: product.stoneType || "",
      finish: product.finish || "",
      color: product.color || "",
      theme: product.theme || "",
      style: product.style || "",
      pattern: product.pattern || "",
      shape: product.shape || "",
      weight: product.weight || "",
      dimensions: product.dimensions || "",
      countryOfOrigin: product.countryOfOrigin || ""
    };

    console.log("Updating product...");
    const updated = await ProductService.updateProduct(product._id, payload);
    console.log("Update success! New status in returned object:", updated.status);

    const fetched = await Product.findById(product._id);
    console.log("Fetched from DB status:", fetched.status);

    // Restore status to published
    await ProductService.updateProduct(product._id, { ...payload, status: "published" });
    console.log("Restored status to published.");

    process.exit(0);
  } catch (error) {
    console.error("Update failed with error:", error);
    process.exit(1);
  }
};
run();
