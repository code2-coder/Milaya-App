import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required for a review"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required for a review"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required (1-5 stars)"],
      min: [1, "Rating must be at least 1 star"],
      max: [5, "Rating cannot exceed 5 stars"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
    },
    images: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    videos: [
      {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    isVerifiedPurchase: {
      type: Boolean,
      default: false,
    },
    adminReply: {
      comment: {
        type: String,
        trim: true,
      },
      repliedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

// Compound indexes for fast querying of approved reviews by product
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
// Compound index to guarantee one review per product per user
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
// Index on status for admin queries
reviewSchema.index({ status: 1 });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);

export default Review;
