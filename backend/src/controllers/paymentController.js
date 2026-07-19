import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Order from "../models/order.js";
import Stripe from "stripe";
import Razorpay from "razorpay";
import crypto from "crypto";
import { validateOrderPrices } from "../utils/shippingCalculator.js";

export const createStripeCheckoutSession = catchAsyncErrors(async (req, res, next) => {
  const verifiedTotals = await validateOrderPrices(req.body);
  if (!verifiedTotals) {
    return next(new ErrorHandler("Order pricing validation failed. Please refresh your cart and try again.", 400));
  }

  const {
    orderItems,
    shippingInfo,
    shippingMethod = "standard",
    packagingOption = "standard",

  } = req.body;

  const origin = req.headers.origin || "http://localhost:5173";
  const paymentCurrency = "inr";

  // Create line items for Stripe
  const lineItems = orderItems.map((item) => ({
    price_data: {
      currency: paymentCurrency,
      product_data: {
        name: item.name,
        images: [item.image !== "no-image" ? item.image : "https://placehold.co/400x400"],
      },
      unit_amount: Math.round(item.price * 100), // Stripe expects cents
    },
    quantity: item.quantity,
  }));

  // Add shipping as a separate line item if greater than 0
  if (verifiedTotals.shippingAmount > 0) {
    const shippingMethodName = shippingMethod === "express" ? "Express Post" : "Standard Delivery";
    lineItems.push({
      price_data: {
        currency: paymentCurrency,
        product_data: {
          name: `Shipping (${shippingMethodName})`,
        },
        unit_amount: Math.round(verifiedTotals.shippingAmount * 100),
      },
      quantity: 1,
    });
  }

  // Add packaging as a separate line item if greater than 0
  if (verifiedTotals.packagingAmount > 0) {
    const packagingName = packagingOption === "exquisite" ? "Exquisite Gift Packaging" : "Standard Packaging";
    lineItems.push({
      price_data: {
        currency: paymentCurrency,
        product_data: {
          name: `Packaging (${packagingName})`,
        },
        unit_amount: Math.round(verifiedTotals.packagingAmount * 100),
      },
      quantity: 1,
    });
  }

  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

  const session = await stripeInstance.checkout.sessions.create({
    payment_method_types: ["card"],
    success_url: `${origin}/orders?stripe_success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart?stripe_canceled=true`,
    customer_email: req.user.email,
    client_reference_id: req.user._id.toString(),
    mode: "payment",
    line_items: lineItems
  });

  res.status(200).json({
    success: true,
    sessionId: session.id,
    url: session.url
  });
});

export const verifyStripePayment = catchAsyncErrors(async (req, res, next) => {
  const { sessionId, orderData } = req.body;
  
  if (!sessionId) return next(new ErrorHandler("Session ID is required", 400));
  if (!orderData) return next(new ErrorHandler("Order data is required", 400));

  // Validate order data pricing before saving order
  const verifiedTotals = await validateOrderPrices(orderData);
  if (!verifiedTotals) {
    return next(new ErrorHandler("Stripe payment order data validation failed", 400));
  }

  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return next(new ErrorHandler("Payment not successful", 400));
  }

  // Check if order already exists
  const existingOrder = await Order.findOne({ "paymentInfo.id": session.payment_intent });
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
    paymentMethod: "Card",
    paymentInfo: {
      id: session.payment_intent,
      status: "Paid",
    },
    paidAt: Date.now(),
    user: session.client_reference_id,
  });

  res.status(200).json({
    success: true,
    message: "Stripe payment verified successfully",
    order,
  });
});

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
    receipt: `receipt_${req.user._id.toString()}_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message || "Something went wrong creating Razorpay order", 500));
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
