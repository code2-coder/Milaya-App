import express from "express";
import { uploadMedia, deleteMedia } from "../controllers/uploadController.js";
import { authorizeRoles, isAuthenticatedUser } from "../middleware/auth.js";

const router = express.Router();

router.route("/admin/upload").post(isAuthenticatedUser, authorizeRoles("admin"), uploadMedia);
router.route("/admin/upload").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteMedia);

export default router;
