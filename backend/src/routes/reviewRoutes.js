import express from "express";
import reviewController from "../controllers/ReviewController.js";
import { isAuthenticatedUser, authorizeRoles } from "../middleware/auth.js";

const router = express.Router();

//
// ✍️ CUSTOMER REVIEWS
//
router.post("/reviews", isAuthenticatedUser, reviewController.createReview);
router.post("/reviews/upload-media", isAuthenticatedUser, reviewController.uploadReviewMedia);
router.get("/reviews/check-eligibility", isAuthenticatedUser, reviewController.checkReviewEligibility);
router.put("/reviews/:id", isAuthenticatedUser, reviewController.updateReview);

//
// 👁️ PUBLIC PRODUCT REVIEWS & SUMMARIES
//
router.get("/reviews/product/:id", reviewController.getProductReviews);
router.get("/reviews/product/:id/summary", reviewController.getProductReviewsSummary);

//
// 👑 ADMIN PANEL MODERATION
//
router.get("/admin/reviews", isAuthenticatedUser, authorizeRoles("admin"), reviewController.adminGetReviews);
router.put("/admin/reviews/:id/status", isAuthenticatedUser, authorizeRoles("admin"), reviewController.adminUpdateReviewStatus);
router.post("/admin/reviews/:id/reply", isAuthenticatedUser, authorizeRoles("admin"), reviewController.adminReplyToReview);
router.delete("/admin/reviews/:id/media", isAuthenticatedUser, authorizeRoles("admin"), reviewController.adminRemoveReviewMedia);
router.delete("/admin/reviews/:id", isAuthenticatedUser, authorizeRoles("admin"), reviewController.adminDeleteReview);

export default router;
