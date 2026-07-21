import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";
import {
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage
} from "../controllers/pageController.js";

const router = express.Router();

// Public endpoints
router.get("/pages", getPages);
router.get("/pages/:slug", getPageBySlug);

// Protected admin endpoints
router.post("/pages", isAuthenticatedUser, authorizeRoles("admin"), createPage);
router.put("/pages/:slug", isAuthenticatedUser, authorizeRoles("admin"), updatePage);
router.delete("/pages/:slug", isAuthenticatedUser, authorizeRoles("admin"), deletePage);

export default router;
