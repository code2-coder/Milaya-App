import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const admins = await User.find({ role: "admin" }).select("email name role");
  console.log("Admins:", admins);
  process.exit(0);
};
run();
