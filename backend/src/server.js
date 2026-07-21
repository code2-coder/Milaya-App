import logger from "./utils/logger.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env first before importing app or connection
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Handle Uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error(`UNCAUGHT EXCEPTION: ${err.message}`);
  console.error(err.stack);
  logger.info("Shutting down due to uncaught exception...");
  setTimeout(() => {
    process.exit(1);
  }, 200);
});

import app from "./app.js";
import { connectDB } from "./database/connection.js";
import { seedPages } from "./database/pageSeeder.js";

// Connect to MongoDB
connectDB().then(() => {
  seedPages();
});

// Start the server
const PORT = Number(process.env.PORT) || 8085;
const server = app.listen(PORT, "0.0.0.0", () => {
  logger.info(`Server is running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
});

// Handle Unhandled Promise Rejections
process.on("unhandledRejection", (err) => {
  console.error(`UNHANDLED REJECTION: ${err.message}`);
  console.error(err.stack);
  logger.info("Shutting down server due to Unhandled Promise Rejection...");
  if (server) {
    server.close(() => {
      setTimeout(() => {
        process.exit(1);
      }, 200);
    });
  } else {
    setTimeout(() => {
      process.exit(1);
    }, 200);
  }
});
