import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import passport from "./config/passport.js";
import errorMiddleware from "./middlewares/errors.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import subscriberRoutes from "./routes/subscriberRoutes.js";

import settingsRoutes from "./routes/settingsRoutes.js";
import adPosterRoutes from "./routes/adPosterRoutes.js";
import sizeRoutes from "./routes/sizeRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import delhiveryRoutes from "./routes/delhiveryRoutes.js";
import attributeRoutes from "./routes/attributeRoutes.js";
import returnRoutes from "./routes/returnRoutes.js";
import shipmentRoutes from "./routes/shipmentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import pageRoutes from "./routes/pageRoutes.js";
import fileRoutes from "./routes/fileRoute.js";

import rateLimit from "express-rate-limit";
import hpp from "hpp";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Trust proxy for Render/Vercel (required for rate limiting and secure cookies)
app.set("trust proxy", 1);

// Middleware config
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://milaya-frontend-fullstack.vercel.app",
  "https://clothing-app-iota.vercel.app",
  "https://clothing-app-kappa.vercel.app",
  "https://milaya.in",
  "https://www.milaya.in",
  "https://milaya.com",
  "https://www.milaya.com",
  "https://milaya.onrender.com",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      // Allow any localhost/127.0.0.1 port in development mode
      const isLocalhost = origin.startsWith("http://localhost:") || 
                          origin.startsWith("http://127.0.0.1:") || 
                          origin === "http://localhost" || 
                          origin === "http://127.0.0.1";

      if ((process.env.NODE_ENV || "development") === "development" && isLocalhost) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://placehold.co"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

// Security middleware against HTTP parameter pollution
app.use(hpp());

// API Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "server" });
});

// Register routes
app.use("/api/v1", categoryRoutes);
app.use("/api/v1", productRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", bannerRoutes);
app.use("/api/v1", paymentRoutes);
app.use("/api/v1", subscriberRoutes);

app.use("/api/v1", settingsRoutes);
app.use("/api/v1", adPosterRoutes);
app.use("/api/v1", sizeRoutes);
app.use("/api/v1/me/addresses", addressRoutes);
app.use("/api/v1/delhivery", delhiveryRoutes);
app.use("/api/v1", attributeRoutes);
app.use("/api/v1", returnRoutes);
app.use("/api/v1", shipmentRoutes);
app.use("/api/v1", uploadRoutes);
app.use("/api/v1", reviewRoutes);
app.use("/api/v1", pageRoutes);
app.use("/api/v1/files", fileRoutes);


// Handle unmatched API routes
app.all(/^\/api\/.*/, (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// Serve client static build in production
if (
  process.env.NODE_ENV === "PRODUCTION" ||
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "Production"
) {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  app.get(/^.*/, (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../frontend/dist/index.html"));
  });
} else {
  // Development default landing page
  app.get("/", (req, res) => {
    res.send("Server is running in development mode!");
  });
}

// Register global error handler middleware (must be last)
app.use(errorMiddleware);

export default app;
