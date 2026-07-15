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

    // Find any product in the database to test
    const product = await Product.findOne({});
    if (!product) {
      console.log("No product found to test!");
      process.exit(1);
    }

    console.log(`Testing with product: ${product.name} (ID: ${product._id})`);
    const originalStatus = product.status;
    console.log(`Original status: ${originalStatus}`);

    // Update to published first
    console.log("Updating status to 'published'...");
    let updated = await ProductService.updateProduct(product._id, { status: "published" });
    console.log(`Updated status (should be published): ${updated.status}`);

    // Update to draft
    console.log("Updating status to 'draft'...");
    updated = await ProductService.updateProduct(product._id, { status: "draft" });
    console.log(`Updated status (should be draft): ${updated.status}`);

    // Fetch again from DB to verify
    const fetched = await Product.findById(product._id);
    console.log(`Fetched status from DB (should be draft): ${fetched.status}`);

    // Restore original status
    console.log(`Restoring original status to: ${originalStatus}`);
    await ProductService.updateProduct(product._id, { status: originalStatus });
    console.log("Restored.");

    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};
run();
