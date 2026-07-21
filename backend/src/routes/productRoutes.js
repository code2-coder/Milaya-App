import express from "express";
import productController from "../controllers/ProductController.js";
import { cacheMiddleware } from "../middleware/cache.js";
import {
  isAuthenticatedUser,
  authorizeRoles,
} from "../middleware/auth.js";

const router = express.Router();

//
// 📦 PUBLIC ROUTES
//
router.get("/products", cacheMiddleware(300), (req, res, next) => productController.getProducts(req, res, next)); // Cache for 5 mins
router.post("/products/visual-search", (req, res, next) => productController.visualSearchProducts(req, res, next));
router.get("/products/:id", cacheMiddleware(300), (req, res, next) => productController.getProductById(req, res, next));

//
// 👑 ADMIN PRODUCT ROUTES
//
router.post(
  "/admin/products",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  (req, res, next) => productController.createProduct(req, res, next)
);

router.get(
  "/admin/products",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  (req, res, next) => productController.getAdminProducts(req, res, next)
);


router
  .route("/admin/products/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), (req, res, next) => productController.updateProduct(req, res, next))
  .delete(isAuthenticatedUser, authorizeRoles("admin"), (req, res, next) => productController.deleteProduct(req, res, next));

export default router;
