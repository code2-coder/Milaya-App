import express from "express";
import {
  createRazorpayOrder,
  verifyRazorpayPayment
} from "../controllers/paymentController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

import rateLimit from "express-rate-limit";

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 payment requests per 15 minutes
  message: "Too many payment attempts from this IP, please try again after 15 minutes"
});





// Razorpay routes
router.post("/payment/razorpay/create-order", isAuthenticatedUser, paymentLimiter, createRazorpayOrder);
router.post("/payment/razorpay/verify", isAuthenticatedUser, paymentLimiter, verifyRazorpayPayment);

export default router;
