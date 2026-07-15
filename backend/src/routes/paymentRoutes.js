import express from "express";
import {
  createStripeCheckoutSession,
  verifyStripePayment
} from "../controllers/paymentController.js";
import { isAuthenticatedUser } from "../middlewares/auth.js";

import rateLimit from "express-rate-limit";

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Limit each IP to 15 payment requests per 15 minutes
  message: "Too many payment attempts from this IP, please try again after 15 minutes"
});



// Stripe routes
router.post("/payment/stripe/create-checkout-session", isAuthenticatedUser, paymentLimiter, createStripeCheckoutSession);
router.post("/payment/stripe/verify", isAuthenticatedUser, paymentLimiter, verifyStripePayment);

export default router;
