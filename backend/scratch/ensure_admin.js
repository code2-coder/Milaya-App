import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import User from "../src/models/user.js";
import bcrypt from "bcryptjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to DB.");

    let admin = await User.findOne({ email: "admin@test.com" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    if (!admin) {
      admin = await User.create({
        name: "Admin User",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
        isVerified: true
      });
      console.log("Created admin user:", admin.email);
    } else {
      admin.password = hashedPassword;
      admin.role = "admin";
      admin.isVerified = true;
      await admin.save();
      console.log("Updated admin user:", admin.email);
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
run();
