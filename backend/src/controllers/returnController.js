import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import Return from "../models/return.js";
import Order from "../models/order.js";
import ErrorHandler from "../utils/errorHandler.js";

// 🛒 CUSTOMER: CREATE RETURN REQUEST
export const createReturn = catchAsyncErrors(async (req, res, next) => {
  const {
    orderId,
    orderItemId,
    productId,
    quantity,
    returnType,
    reason,
    description,
    media,
  } = req.body;

  const order = await Order.findById(orderId);

  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }

  // Ensure order belongs to user
  if (order.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized to return this order", 403));
  }

  // Ensure order is delivered
  if (order.orderStatus !== "Delivered") {
    return next(new ErrorHandler("Returns are only allowed for delivered orders", 400));
  }

  // Check if return window is valid (e.g., 7 days)
  const returnWindowDays = 7;
  const deliveredDate = new Date(order.deliveredAt);
  const currentDate = new Date();
  const daysSinceDelivery = (currentDate - deliveredDate) / (1000 * 60 * 60 * 24);

  if (daysSinceDelivery > returnWindowDays) {
    return next(new ErrorHandler("Return window has expired", 400));
  }

  // Check if return already exists for this order item
  const existingReturn = await Return.findOne({ orderItemId, user: req.user._id });
  if (existingReturn) {
    return next(new ErrorHandler("Return request already exists for this item", 400));
  }

  // Ensure video is uploaded
  const hasVideo = media && media.some((m) => m.type === "video");
  if (!hasVideo) {
    return next(new ErrorHandler("Unboxing video is mandatory for returns", 400));
  }

  // Find item price for refund calculation (simplistic calculation)
  const orderItem = order.orderItems.find((item) => item._id.toString() === orderItemId.toString());
  const refundAmount = orderItem ? orderItem.price * quantity : 0;

  const returnNumber = `RET-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const returnRequest = await Return.create({
    returnNumber,
    order: orderId,
    orderItemId,
    user: req.user._id,
    product: productId,
    quantity,
    returnType: returnType || "Refund",
    reason,
    description,
    media,
    refundAmount,
    timeline: [
      {
        status: "Pending Review",
        message: "Your return request has been submitted and is pending review.",
      },
    ],
  });

  // 🔥 FIX: Link the active return to the Order Item to establish single source of truth
  const itemIndex = order.orderItems.findIndex(
    (i) => i._id.toString() === orderItemId.toString()
  );
  if (itemIndex > -1) {
    order.orderItems[itemIndex].returnActive = returnRequest._id;
    await order.save({ validateBeforeSave: false });
  }



  res.status(201).json({
    success: true,
    returnRequest,
  });
});

// 👤 CUSTOMER: GET MY RETURNS
export const myReturns = catchAsyncErrors(async (req, res, next) => {
  const returns = await Return.find({ user: req.user._id })
    .populate("product", "name images")
    .populate("order", "orderItems")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    returns,
  });
});

// 📦 CUSTOMER: GET RETURN DETAILS
export const getReturnDetails = catchAsyncErrors(async (req, res, next) => {
  const returnReq = await Return.findById(req.params.id)
    .populate("product", "name images")
    .populate("order", "shippingInfo paymentMethod totalAmount");

  if (!returnReq) {
    return next(new ErrorHandler("Return request not found", 404));
  }

  // Ensure it belongs to the user
  if (returnReq.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Unauthorized", 403));
  }

  res.status(200).json({
    success: true,
    return: returnReq,
  });
});

// 👑 ADMIN: GET ALL RETURNS
export const allReturns = catchAsyncErrors(async (req, res, next) => {
  const returns = await Return.find()
    .populate("user", "name email")
    .populate("product", "name")
    .sort({ createdAt: -1 });

  // Basic analytics for dashboard cards
  const totalReturns = returns.length;
  const pendingReview = returns.filter((r) => r.status === "Pending Review").length;
  const approved = returns.filter((r) => r.status === "Approved").length;
  const rejected = returns.filter((r) => r.status === "Rejected").length;
  const pickupScheduled = returns.filter((r) => r.status === "Pickup Scheduled").length;
  const pickupCompleted = returns.filter((r) => r.status === "Pickup Completed").length;
  const productsReceived = returns.filter((r) => r.status === "Product Received").length;
  const inspectionPending = returns.filter((r) => r.status === "Quality Inspection").length;
  const refundProcessing = returns.filter((r) => r.status === "Refund Processing").length;
  const refundCompleted = returns.filter((r) => r.status === "Refund Completed").length;
  const replacementRequests = returns.filter((r) => r.returnType === "Replacement").length;
  const exchangeRequests = returns.filter((r) => r.returnType === "Exchange").length;

  res.status(200).json({
    success: true,
    returns,
    analytics: {
      totalReturns,
      pendingReview,
      approved,
      rejected,
      pickupScheduled,
      pickupCompleted,
      productsReceived,
      inspectionPending,
      refundProcessing,
      refundCompleted,
      replacementRequests,
      exchangeRequests,
    },
  });
});

// 👑 ADMIN: GET RETURN DETAILS
export const getAdminReturnDetails = catchAsyncErrors(async (req, res, next) => {
  const returnReq = await Return.findById(req.params.id)
    .populate("user", "name email")
    .populate("product", "name images price")
    .populate("order", "shippingInfo orderItems totalAmount paymentMethod");

  if (!returnReq) {
    return next(new ErrorHandler("Return request not found", 404));
  }

  res.status(200).json({
    success: true,
    return: returnReq,
  });
});

// 👑 ADMIN: UPDATE RETURN STATUS
export const updateReturnStatus = catchAsyncErrors(async (req, res, next) => {
  const { 
    status, 
    adminRemarks, 
    refundAmount, 
    pickupDate,
    pickupTime,
    courierPartner,
    trackingNumber,
    pickupRemarks,
    refundMethod,
    refundTransactionReference,
    replacementProduct,
    shippingProgress
  } = req.body;

  const returnReq = await Return.findById(req.params.id);

  if (!returnReq) {
    return next(new ErrorHandler("Return request not found", 404));
  }

  returnReq.status = status || returnReq.status;
  
  if (adminRemarks !== undefined) returnReq.adminRemarks = adminRemarks;
  if (refundAmount !== undefined) returnReq.refundAmount = refundAmount;
  if (pickupDate !== undefined) returnReq.pickupDate = pickupDate;
  if (pickupTime !== undefined) returnReq.pickupTime = pickupTime;
  if (courierPartner !== undefined) returnReq.courierPartner = courierPartner;
  if (trackingNumber !== undefined) returnReq.trackingNumber = trackingNumber;
  if (pickupRemarks !== undefined) returnReq.pickupRemarks = pickupRemarks;
  if (refundMethod !== undefined) returnReq.refundMethod = refundMethod;
  if (refundTransactionReference !== undefined) returnReq.refundTransactionReference = refundTransactionReference;
  if (replacementProduct !== undefined) returnReq.replacementProduct = replacementProduct;
  if (shippingProgress !== undefined) returnReq.shippingProgress = shippingProgress;

  returnReq.approvedBy = req.user._id;

  // Add timeline event
  let timelineMessage = `Status updated to ${status}`;
  if (status === "Approved") timelineMessage = "Return request approved. We will schedule a pickup soon.";
  if (status === "Rejected") timelineMessage = `Return request rejected. Reason: ${adminRemarks || "Not specified"}`;
  if (status === "Pickup Scheduled") timelineMessage = `Pickup scheduled for ${new Date(pickupDate).toLocaleDateString()}`;
  if (status === "Product Received") timelineMessage = "Product has been received at our facility. Quality check in progress.";
  if (status === "Refund Processing") timelineMessage = "Refund is being processed.";
  if (status === "Refund Completed") timelineMessage = `Refund of ${returnReq.refundAmount} has been completed.`;

  returnReq.timeline.push({
    status,
    message: timelineMessage,
  });

  await returnReq.save();

  res.status(200).json({
    success: true,
    return: returnReq,
  });
});
