import Review from "../models/Review.js";
import Product from "../models/product.js";
import Order from "../models/order.js";
import UploadService from "../services/UploadService.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import { sendResponse } from "../helpers/response.js";
import mongoose from "mongoose";

// Utility function to escape HTML tags and protect against XSS
const sanitizeHtml = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Recalculates and updates the product's aggregated average rating and review counts (Approved only)
const recalculateProductRatings = async (productId) => {
  const approvedReviews = await Review.find({
    product: productId,
    status: "Approved",
  });
  
  const numOfReviews = approvedReviews.length;
  let averageRating = 0;
  
  if (numOfReviews > 0) {
    const totalStars = approvedReviews.reduce((sum, r) => sum + r.rating, 0);
    averageRating = Number((totalStars / numOfReviews).toFixed(1));
  }
  
  await Product.findByIdAndUpdate(productId, {
    ratings: averageRating,
    numOfReviews: numOfReviews,
  });
};

export class ReviewController {
  //
  // ✍️ CUSTOMER SUBMIT REVIEW
  //
  createReview = catchAsyncErrors(async (req, res, next) => {
    const { productId, rating, comment, images = [], videos = [] } = req.body;
    const userId = req.user._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ErrorHandler("Please provide a valid product ID", 400));
    }

    const product = await Product.findById(productId);
    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    // 1. Uniqueness check: One review per user per product
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return next(new ErrorHandler("You have already submitted a review for this product", 400));
    }

    // 2. Eligibility check: Customer must have purchased and received the product
    const order = await Order.findOne({
      user: userId,
      orderStatus: "Delivered",
      "orderItems.product": productId,
    });

    if (!order) {
      return next(
        new ErrorHandler(
          "Only customers who have purchased and received this product can write a review",
          403
        )
      );
    }

    // 3. Validation limits: Up to 10 images, up to 2 videos
    if (images.length > 10) {
      return next(new ErrorHandler("You can upload a maximum of 10 images", 400));
    }
    if (videos.length > 2) {
      return next(new ErrorHandler("You can upload a maximum of 2 videos", 400));
    }

    // 4. Sanitize comment input for XSS safety
    const sanitizedComment = sanitizeHtml(comment);

    const review = await Review.create({
      product: productId,
      user: userId,
      rating: Number(rating),
      comment: sanitizedComment,
      images,
      videos,
      isVerifiedPurchase: true,
      status: "Pending", // Always starts pending approval
    });

    return sendResponse(res, 201, true, "Review submitted successfully and is pending administrator approval", {
      review,
    });
  });

  //
  // 👁️ PUBLIC GET APPROVED REVIEWS (PAGINATED, FILTERED & SORTED)
  //
  getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const productId = req.params.id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ErrorHandler("Please provide a valid product ID", 400));
    }

    const filter = {
      product: productId,
      status: "Approved",
    };

    // Filters: Stars (1-5)
    if (req.query.rating) {
      filter.rating = Number(req.query.rating);
    }

    // Filters: With Photos
    if (req.query.hasPhotos === "true") {
      filter["images.0"] = { $exists: true };
    }

    // Filters: Verified Purchase Only
    if (req.query.isVerified === "true") {
      filter.isVerifiedPurchase = true;
    }

    // Sorting Modes
    let sortOption = { createdAt: -1 }; // default: most recent
    if (req.query.sort) {
      switch (req.query.sort) {
        case "oldest":
          sortOption = { createdAt: 1 };
          break;
        case "highest":
          sortOption = { rating: -1, createdAt: -1 };
          break;
        case "lowest":
          sortOption = { rating: 1, createdAt: -1 };
          break;
        case "recent":
        default:
          sortOption = { createdAt: -1 };
          break;
      }
    }

    // Pagination (10 per page)
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalReviews = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate("user", "name avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean();

    return sendResponse(res, 200, true, "Reviews fetched successfully", {
      totalReviews,
      page,
      limit,
      reviews,
    });
  });

  //
  // 📊 PUBLIC GET REVIEW SUMMARY & STAR DISTRIBUTION
  //
  getProductReviewsSummary = catchAsyncErrors(async (req, res, next) => {
    const productId = req.params.id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ErrorHandler("Please provide a valid product ID", 400));
    }

    // Query approved reviews
    const reviews = await Review.find({ product: productId, status: "Approved" }).select("rating").lean();

    const totalReviews = reviews.length;
    const ratingsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumRating = 0;

    reviews.forEach((r) => {
      ratingsCount[r.rating] = (ratingsCount[r.rating] || 0) + 1;
      sumRating += r.rating;
    });

    const averageRating = totalReviews === 0 ? 0 : Number((sumRating / totalReviews).toFixed(1));

    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const count = ratingsCount[stars];
      const percentage = totalReviews === 0 ? 0 : Math.round((count / totalReviews) * 100);
      return {
        stars,
        count,
        percentage,
      };
    });

    return sendResponse(res, 200, true, "Reviews summary fetched successfully", {
      summary: {
        averageRating,
        totalRatings: totalReviews,
        totalReviews,
        distribution,
      },
    });
  });

  //
  // 📤 SECURE CUSTOMER REVIEW MEDIA UPLOAD
  //
  uploadReviewMedia = catchAsyncErrors(async (req, res, next) => {
    const { file, type = "image" } = req.body;

    if (!file) {
      return next(new ErrorHandler("No file payload provided", 400));
    }

    if (type !== "image" && type !== "video") {
      return next(new ErrorHandler("Media type must be either 'image' or 'video'", 400));
    }

    // Validate size and format using base64 string analysis
    // base64 length estimation: bytes = (string length * 3) / 4
    const approxBytes = (file.length * 3) / 4;

    if (type === "image") {
      const allowedImagePrefixes = [
        "data:image/jpeg",
        "data:image/png",
        "data:image/webp",
        "data:image/jpg",
      ];
      const isValidFormat = allowedImagePrefixes.some((prefix) => file.startsWith(prefix));
      if (!isValidFormat) {
        return next(
          new ErrorHandler("Invalid image format. Only JPG, PNG, and WEBP are allowed.", 400)
        );
      }
      if (approxBytes > 5 * 1024 * 1024) {
        return next(new ErrorHandler("Image size exceeds the 5MB limit", 400));
      }
    } else {
      const allowedVideoPrefixes = ["data:video/mp4", "data:video/quicktime"];
      const isValidFormat = allowedVideoPrefixes.some((prefix) => file.startsWith(prefix));
      if (!isValidFormat) {
        return next(new ErrorHandler("Invalid video format. Only MP4 and MOV are allowed.", 400));
      }
      if (approxBytes > 30 * 1024 * 1024) {
        return next(new ErrorHandler("Video size exceeds the 30MB limit", 400));
      }
    }

    // Upload to Cloudinary under the 'milaya/reviews' folder
    try {
      const result = await UploadService.uploadMedia(file, {
        type,
        folder: "milaya/reviews",
      });

      return sendResponse(res, 200, true, "Media uploaded successfully", {
        media: {
          public_id: result.public_id,
          url: result.url,
        },
      });
    } catch (uploadError) {
      return next(new ErrorHandler(uploadError.message || "Media upload to Cloudinary failed", 500));
    }
  });

  //
  // 👑 ADMIN: FETCH ALL REVIEWS (FOR MODERATION LIST)
  //
  adminGetReviews = catchAsyncErrors(async (req, res, next) => {
    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.rating) {
      filter.rating = Number(req.query.rating);
    }

    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const totalReviews = await Review.countDocuments(filter);
    
    // Find reviews, populate product and user details
    const reviews = await Review.find(filter)
      .populate("product", "name images")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return sendResponse(res, 200, true, "Admin reviews fetched successfully", {
      totalReviews,
      page,
      limit,
      reviews,
    });
  });

  //
  // 👑 ADMIN: MODERATE REVIEW STATUS (APPROVE / REJECT)
  //
  adminUpdateReviewStatus = catchAsyncErrors(async (req, res, next) => {
    const { status } = req.body;
    const reviewId = req.params.id;

    if (!["Approved", "Rejected"].includes(status)) {
      return next(new ErrorHandler("Status must be either 'Approved' or 'Rejected'", 400));
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    review.status = status;
    await review.save();

    // Recompute product ratings dynamically
    await recalculateProductRatings(review.product);

    return sendResponse(res, 200, true, `Review status updated to ${status} successfully`, {
      review,
    });
  });

  //
  // 👑 ADMIN: SUBMIT OR EDIT OFFICIAL ADMIN REPLY (ONE PER REVIEW)
  //
  adminReplyToReview = catchAsyncErrors(async (req, res, next) => {
    const { comment } = req.body;
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    if (review.status !== "Approved") {
      return next(new ErrorHandler("Official replies can only be added to Approved reviews", 400));
    }

    // Add or edit the admin reply
    review.adminReply = {
      comment: sanitizeHtml(comment),
      repliedAt: new Date(),
    };
    await review.save();

    return sendResponse(res, 200, true, "Admin reply saved successfully", {
      review,
    });
  });

  //
  // 👑 ADMIN: REMOVE SPECIFIC MEDIA (SLIDE/VIDEO)
  //
  adminRemoveReviewMedia = catchAsyncErrors(async (req, res, next) => {
    const { public_id, type = "image" } = req.body;
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    // Remove from Cloudinary
    await UploadService.deleteMedia(public_id, type);

    // Remove from mongoose arrays
    if (type === "video") {
      review.videos = review.videos.filter((v) => v.public_id !== public_id);
    } else {
      review.images = review.images.filter((img) => img.public_id !== public_id);
    }

    await review.save();

    return sendResponse(res, 200, true, "Inappropriate media deleted successfully", {
      review,
    });
  });

  //
  // 👑 ADMIN: DELETE REVIEW COMPLETELY
  //
  adminDeleteReview = catchAsyncErrors(async (req, res, next) => {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return next(new ErrorHandler("Review not found", 404));
    }

    // Delete images from Cloudinary
    for (const image of review.images) {
      await UploadService.deleteMedia(image.public_id, "image").catch((err) =>
        console.error(`Failed to delete review image ${image.public_id}:`, err.message)
      );
    }

    // Delete videos from Cloudinary
    for (const video of review.videos) {
      await UploadService.deleteMedia(video.public_id, "video").catch((err) =>
        console.error(`Failed to delete review video ${video.public_id}:`, err.message)
      );
    }

    await Review.findByIdAndDelete(reviewId);

    // Recompute product ratings dynamically
    await recalculateProductRatings(review.product);

    return sendResponse(res, 200, true, "Review and associated media deleted successfully");
  });
  
  //
  // ✍️ CHECK ELIGIBILITY (FOR CUSTOMER WRITING COMPONENT)
  //
  checkReviewEligibility = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.query;
    const userId = req.user._id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return next(new ErrorHandler("Please provide a valid product ID", 400));
    }

    // 1. Check if user already reviewed
    const existingReview = await Review.findOne({ product: productId, user: userId });
    if (existingReview) {
      return res.status(200).json({
        success: true,
        eligible: false,
        reason: "already_reviewed",
        message: "You have already submitted a review for this product."
      });
    }

    // 2. Check purchase & delivery status
    const order = await Order.findOne({
      user: userId,
      orderStatus: "Delivered",
      "orderItems.product": productId
    });

    if (!order) {
      return res.status(200).json({
        success: true,
        eligible: false,
        reason: "no_purchase",
        message: "Only customers who have purchased and received this product can write a review."
      });
    }

    return res.status(200).json({
      success: true,
      eligible: true,
      message: "You are eligible to submit a review."
    });
  });
}

export default new ReviewController();
