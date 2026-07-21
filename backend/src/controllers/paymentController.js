import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/order.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import { validateOrderPrices } from "../utils/shippingCalculator.js";




export const createRazorpayOrder = catchAsyncErrors(async (req, res, next) => {
  const verifiedTotals = await validateOrderPrices(req.body);
  if (!verifiedTotals) {
    return next(new ErrorHandler("Order pricing validation failed. Please refresh your cart and try again.", 400));
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: Math.round(verifiedTotals.totalAmount * 100), // amount in the smallest currency unit
    currency: "INR",
    receipt: `rcpt_${req.user._id.toString().slice(-6)}_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Razorpay error full object:", JSON.stringify(error, null, 2));
    console.error("Razorpay error message:", error.message);
    let errMsg = "Razorpay order creation failed: ";
    if (error && error.error && error.error.description) {
      errMsg += error.error.description;
    } else if (error && error.message) {
      errMsg += error.message;
    } else if (typeof error === 'string') {
      errMsg += error;
    } else {
      errMsg += "Unknown error";
    }
    return next(new ErrorHandler(errMsg, 400));
  }
});

export const verifyRazorpayPayment = catchAsyncErrors(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new ErrorHandler("Razorpay payment details are incomplete", 400));
  }
  if (!orderData) return next(new ErrorHandler("Order data is required", 400));

  // Verify Signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    return next(new ErrorHandler("Payment signature validation failed", 400));
  }

  // Validate order data pricing before saving order
  const verifiedTotals = await validateOrderPrices(orderData);
  if (!verifiedTotals) {
    return next(new ErrorHandler("Razorpay payment order data validation failed", 400));
  }

  // Check if order already exists
  const existingOrder = await Order.findOne({ "paymentInfo.id": razorpay_payment_id });
  if (existingOrder) {
    return res.status(200).json({ success: true, order: existingOrder });
  }

  const order = await Order.create({
    orderItems: orderData.orderItems,
    shippingInfo: orderData.shippingInfo,
    itemsPrice: verifiedTotals.itemsPrice,
    taxAmount: verifiedTotals.taxAmount,
    shippingAmount: verifiedTotals.shippingAmount,
    packagingAmount: verifiedTotals.packagingAmount,
    shippingMethod: orderData.shippingMethod || "standard",
    packagingOption: orderData.packagingOption || "standard",
    totalAmount: verifiedTotals.totalAmount,
    paymentMethod: "Razorpay",
    paymentInfo: {
      id: razorpay_payment_id,
      status: "Paid",
    },
    paidAt: Date.now(),
    user: req.user._id, // use the authenticated user
  });

  res.status(200).json({
    success: true,
    message: "Razorpay payment verified successfully",
    order,
  });
});
