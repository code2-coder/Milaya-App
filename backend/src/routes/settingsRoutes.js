import express from "express";
import { isAuthenticatedUser, authorizeRoles } from "../middlewares/auth.js";
import {
    getSettings,
    updateSettings,
    getShippingCost,
    getPackagingOptions,
    getPackagingText,
} from "../controllers/settingsController.js";

const router = express.Router();

// Public endpoints
router.get("/settings/shipping", getShippingCost);
router.post("/settings/shipping", getShippingCost);
router.get("/settings/packaging-options", getPackagingOptions);
router.get("/settings/packaging-text", getPackagingText);
router.get("/settings", getSettings);

// Admin endpoints
router.put(
    "/settings",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updateSettings
);

export default router;
