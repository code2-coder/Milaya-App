import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./src/models/product.js";
import ProductService from "./src/services/ProductService.js";
import User from "./src/models/user.js";
import Category from "./src/models/category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI env variable is missing!");
    }
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    // Create a mock user ID
    const mockUserId = new mongoose.Types.ObjectId();
    const mockCategoryId = new mongoose.Types.ObjectId();

    // 1. Create a Draft Product
    console.log("Creating a draft product...");
    const draftProduct = await Product.create({
      name: "Test Draft Product " + Date.now(),
      price: 100,
      description: "Test description for draft product",
      seller: "Milaya",
      stock: 10,
      user: mockUserId,
      category: mockCategoryId,
      status: "draft"
    });
    console.log(`Draft product created with ID: ${draftProduct._id}, status: ${draftProduct.status}`);

    // 2. Create a Published Product
    console.log("Creating a published product...");
    const publishedProduct = await Product.create({
      name: "Test Published Product " + Date.now(),
      price: 200,
      description: "Test description for published product",
      seller: "Milaya",
      stock: 20,
      user: mockUserId,
      category: mockCategoryId,
      status: "published"
    });
    console.log(`Published product created with ID: ${publishedProduct._id}, status: ${publishedProduct.status}`);

    // 3. Create a Default Product (should default to draft)
    console.log("Creating a product without specifying status...");
    const defaultProduct = await ProductService.createProduct({
      name: "Test Default Product " + Date.now(),
      price: 150,
      description: "Test description for default product",
      seller: "Milaya",
      stock: 15,
      category: mockCategoryId,
    }, mockUserId);
    console.log(`Default product created with ID: ${defaultProduct._id}, status: ${defaultProduct.status} (expected draft)`);

    if (defaultProduct.status !== "draft") {
      throw new Error("Expected default status to be 'draft'");
    }

    // 4. Test Public getProducts API
    console.log("Testing public getProducts API (should NOT contain draft or default products)...");
    const publicResult = await ProductService.getProducts({});
    const publicProducts = publicResult.products;
    console.log(`Total public products fetched: ${publicProducts.length}`);
    
    const containsDraft = publicProducts.some(p => p._id.toString() === draftProduct._id.toString());
    const containsDefault = publicProducts.some(p => p._id.toString() === defaultProduct._id.toString());
    const containsPublished = publicProducts.some(p => p._id.toString() === publishedProduct._id.toString());

    console.log(`Contains Draft: ${containsDraft} (expected false)`);
    console.log(`Contains Default: ${containsDefault} (expected false)`);
    console.log(`Contains Published: ${containsPublished} (expected true)`);

    if (containsDraft || containsDefault) {
      throw new Error("Public API returned draft/default products!");
    }
    if (!containsPublished) {
      throw new Error("Public API failed to return the published product!");
    }

    // 5. Test Admin getAdminProducts API
    console.log("Testing admin getAdminProducts API (should contain draft, default and published products)...");
    const adminProducts = await ProductService.getAdminProducts();
    console.log(`Total admin products fetched: ${adminProducts.length}`);

    const adminContainsDraft = adminProducts.some(p => p._id.toString() === draftProduct._id.toString());
    const adminContainsDefault = adminProducts.some(p => p._id.toString() === defaultProduct._id.toString());
    const adminContainsPublished = adminProducts.some(p => p._id.toString() === publishedProduct._id.toString());

    console.log(`Admin Contains Draft: ${adminContainsDraft} (expected true)`);
    console.log(`Admin Contains Default: ${adminContainsDefault} (expected true)`);
    console.log(`Admin Contains Published: ${adminContainsPublished} (expected true)`);

    if (!adminContainsDraft || !adminContainsDefault || !adminContainsPublished) {
      throw new Error("Admin API is missing draft, default or published products!");
    }

    // 6. Test public getProductById API
    console.log("Testing public getProductById for draft product (should throw error)...");
    try {
      await ProductService.getProductById(draftProduct._id);
      throw new Error("Expected public getProductById to fail for draft product, but it succeeded.");
    } catch (err) {
      console.log(`Public getProductById failed as expected: ${err.message}`);
    }

    console.log("Testing public getProductById for published product (should succeed)...");
    const fetchedProduct = await ProductService.getProductById(publishedProduct._id);
    console.log(`Public getProductById succeeded. Fetched name: ${fetchedProduct.name}`);

    // Clean up test products
    console.log("Cleaning up test products...");
    await Product.deleteMany({
      _id: { $in: [draftProduct._id, publishedProduct._id, defaultProduct._id] }
    });
    console.log("Cleaned up.");

    console.log("Verification test completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Verification test failed:", error);
    process.exit(1);
  }
};

run();
