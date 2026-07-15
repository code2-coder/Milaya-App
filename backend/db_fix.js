import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "./src/models/product.js";

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

    // Update products that don't have status to 'published'
    const result1 = await Product.updateMany(
      { status: { $exists: false } },
      { $set: { status: "published" } }
    );
    console.log(`Updated ${result1.modifiedCount} products without status to 'published'.`);

    // In case there are products with status null
    const result2 = await Product.updateMany(
      { status: null },
      { $set: { status: "published" } }
    );
    console.log(`Updated ${result2.modifiedCount} products with null status to 'published'.`);

    // In case there are products with status not in ['draft', 'published']
    const result3 = await Product.updateMany(
      { status: { $nin: ["draft", "published"] } },
      { $set: { status: "published" } }
    );
    console.log(`Updated ${result3.modifiedCount} products with invalid status to 'published'.`);

    console.log("Migration complete successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

run();
