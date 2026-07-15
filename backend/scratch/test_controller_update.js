import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../src/models/product.js";
import ProductController from "../src/controllers/ProductController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB.");

    const product = await Product.findOne({ name: "Chandrika demo", price: 2222 });
    if (!product) {
      console.log("Product not found");
      process.exit(1);
    }

    console.log(`Testing updateProduct controller with product ID: ${product._id}`);

    const req = {
      params: { id: product._id.toString() },
      body: {
        name: "Chandrika demo",
        description: product.description,
        category: product.category ? product.category.toString() : "",
        price: 2222,
        stock: 22,
        homeSection: "",
        status: "draft",
        images: product.images || [],
        videos: product.videos || [],
        variants: product.variants || [],
        features: product.features || [],
        material: "",
        metal: "",
        stoneType: "",
        finish: "",
        color: "",
        theme: "",
        style: "",
        pattern: "",
        shape: "",
        weight: "",
        dimensions: "",
        countryOfOrigin: ""
      },
      user: {
        _id: "6a1d43c7bd3e247e9d4bcd5b"
      }
    };

    const res = {
      statusCode: 200,
      headers: {},
      setHeader: function(name, val) {
        this.headers[name] = val;
        return this;
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      }
    };

    const next = (err) => {
      if (err) {
        throw err;
      }
    };

    await ProductController.updateProduct(req, res, next);

    console.log("Controller execution completed.");
    console.log("Response status code:", res.statusCode);
    console.log("Response data success:", res.data?.success);
    console.log("Response product status:", res.data?.product?.status);

    const fetched = await Product.findById(product._id);
    console.log("DB status after controller run:", fetched.status);

    // Restore to published
    req.body.status = "published";
    await ProductController.updateProduct(req, res, next);
    console.log("Restored status to published.");

    process.exit(0);
  } catch (error) {
    console.error("Controller update failed:", error);
    process.exit(1);
  }
};
run();
