import express from "express";
import orderController from "../controllers/OrderController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// User Order Routes
router.post("/orders/new", isAuthenticatedUser, (req, res, next) => orderController.newOrder(req, res, next));
router.get("/me/orders", isAuthenticatedUser, (req, res, next) => orderController.myOrders(req, res, next));
router.get("/orders/:id", isAuthenticatedUser, (req, res, next) => orderController.getOrderDetails(req, res, next));

// Admin Order Routes
router.get(
  "/admin/orders",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  (req, res, next) => orderController.allOrders(req, res, next)
);

router
  .route("/admin/orders/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), (req, res, next) => orderController.updateOrder(req, res, next))
  .delete(isAuthenticatedUser, authorizeRoles("admin"), (req, res, next) => orderController.deleteOrder(req, res, next));

export default router;
