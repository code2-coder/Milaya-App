import express from "express";
import {
  getAttributes,
  newAttribute,
  updateAttribute,
  deleteAttribute,
} from "../controllers/attributeController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

// Public route
router.route("/attributes").get(getAttributes);

// Admin routes
router
  .route("/admin/attribute/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), newAttribute);

router
  .route("/admin/attribute/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateAttribute)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteAttribute);

export default router;
