import express from "express";
import {
  createBanner,
  getBanners,
  getSingleBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";

import {
  isAuthenticatedUser,
  authorizeRoles,
} from "../middleware/auth.js";

import { cacheMiddleware } from "../middleware/cache.js";

const router = express.Router();

// ✅ Public Routes
router.get("/banners", cacheMiddleware(300), getBanners);
router.get("/banner/:id", cacheMiddleware(300), getSingleBanner);

// ✅ Admin Routes
router.post(
  "/admin/banner",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  createBanner
);

router.put(
  "/admin/banner/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  updateBanner
);

router.delete(
  "/admin/banner/:id",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteBanner
);

export default router;
