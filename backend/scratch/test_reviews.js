import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../src/models/product.js";
import User from "../src/models/User.js";
import Order from "../src/models/order.js";
import Review from "../src/models/Review.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const run = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI env variable is missing!");
    }

    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected.");

    // Clean up any lingering test reviews
    await Review.deleteMany({ comment: /\[TEST_REVIEW\]/ });

    // 1. Create Mock User, Category and Product
    const testUser = await User.findOne({ role: "user" }) || await User.create({
      name: "Reviewer Client",
      email: `reviewer.client.${Date.now()}@example.com`,
      password: "password123",
      role: "user",
      isVerified: true
    });
    console.log(`Using user: ${testUser.name} (${testUser._id})`);

    const mockProduct = await Product.create({
      name: "Test Review Gemstone Product " + Date.now(),
      price: 250,
      description: "Beautiful test gemstone clothing",
      seller: "Milaya",
      stock: 10,
      user: testUser._id,
      status: "published"
    });
    console.log(`Created product: ${mockProduct.name} (${mockProduct._id})`);

    // Verify rating defaults
    if (mockProduct.ratings !== 0 || mockProduct.numOfReviews !== 0) {
      throw new Error("Expected initial product ratings/numOfReviews to be 0");
    }

    // 2. Try to write review without order (should fail in controller, let's test DB creation first)
    // We will verify the order search query that the controller runs
    const checkOrder = await Order.findOne({
      user: testUser._id,
      orderStatus: "Delivered",
      "orderItems.product": mockProduct._id
    });
    console.log(`Is order found before creating mock? ${!!checkOrder} (expected false)`);

    // Create a mock order to enable review submission
    const mockOrder = await Order.create({
      shippingInfo: {
        fullName: "Test Client",
        address: "123 Street",
        city: "Mumbai",
        phoneNo: "9876543210",
        zipCode: "400001",
        country: "India"
      },
      user: testUser._id,
      orderItems: [
        {
          name: mockProduct.name,
          quantity: 1,
          image: "test.jpg",
          price: 250,
          product: mockProduct._id
        }
      ],
      paymentMethod: "COD",
      itemsPrice: 250,
      taxAmount: 10,
      shippingAmount: 50,
      totalAmount: 310,
      orderStatus: "Delivered" // Must be Delivered to write reviews
    });
    console.log(`Mock order created in Delivered status: ${mockOrder._id}`);

    // Recheck eligibility
    const checkOrderAfter = await Order.findOne({
      user: testUser._id,
      orderStatus: "Delivered",
      "orderItems.product": mockProduct._id
    });
    if (!checkOrderAfter) {
      throw new Error("Order eligibility check failed after mock order creation!");
    }
    console.log("Customer eligibility check: PASSED");

    // 3. Create a review in Pending status
    const pendingReview = await Review.create({
      product: mockProduct._id,
      user: testUser._id,
      rating: 4,
      comment: "[TEST_REVIEW] The design and polishing are amazing. Worth the buy!",
      isVerifiedPurchase: true,
      status: "Pending"
    });
    console.log(`Review created with ID: ${pendingReview._id}, Status: ${pendingReview.status}, Rating: ${pendingReview.rating}`);

    // Verify product ratings is still 0 (since review is pending)
    let freshProduct = await Product.findById(mockProduct._id);
    console.log(`Product ratings with Pending review: ${freshProduct.ratings} (expected 0)`);
    if (freshProduct.ratings !== 0) {
      throw new Error("Product rating changed for a pending review!");
    }

    // 4. Approve the review and verify product rating updates
    pendingReview.status = "Approved";
    await pendingReview.save();
    
    // Trigger rating recalculation (copy of controller recalculation method)
    const recalculateProductRatings = async (pId) => {
      const approvedReviews = await Review.find({ product: pId, status: "Approved" });
      const count = approvedReviews.length;
      let avg = 0;
      if (count > 0) {
        avg = Number((approvedReviews.reduce((s, r) => s + r.rating, 0) / count).toFixed(1));
      }
      await Product.findByIdAndUpdate(pId, { ratings: avg, numOfReviews: count });
    };

    await recalculateProductRatings(mockProduct._id);
    
    freshProduct = await Product.findById(mockProduct._id);
    console.log(`Product ratings after Approval: ${freshProduct.ratings} (expected 4.0), Reviews Count: ${freshProduct.numOfReviews} (expected 1)`);
    if (freshProduct.ratings !== 4.0 || freshProduct.numOfReviews !== 1) {
      throw new Error("Product rating recalculation failed on approval!");
    }

    // 5. Submit another review from a different user, reject it, and check it doesn't affect ratings
    const anotherUser = await User.create({
      name: "Second Client",
      email: `second.client.${Date.now()}@example.com`,
      password: "password123",
      role: "user",
      isVerified: true
    });

    const rejectedReview = await Review.create({
      product: mockProduct._id,
      user: anotherUser._id,
      rating: 1,
      comment: "[TEST_REVIEW] Inappropriate content or spam",
      isVerifiedPurchase: false,
      status: "Rejected"
    });
    console.log(`Created second review: ${rejectedReview._id}, status: ${rejectedReview.status}, rating: ${rejectedReview.rating}`);

    await recalculateProductRatings(mockProduct._id);

    freshProduct = await Product.findById(mockProduct._id);
    console.log(`Product ratings after Rejected review: ${freshProduct.ratings} (expected 4.0), Reviews Count: ${freshProduct.numOfReviews} (expected 1)`);
    if (freshProduct.ratings !== 4.0 || freshProduct.numOfReviews !== 1) {
      throw new Error("Rejected review influenced product ratings!");
    }

    // 6. Delete review and verify rating drops back to 0
    await Review.findByIdAndDelete(pendingReview._id);
    await recalculateProductRatings(mockProduct._id);

    freshProduct = await Product.findById(mockProduct._id);
    console.log(`Product ratings after Delete: ${freshProduct.ratings} (expected 0.0), Reviews Count: ${freshProduct.numOfReviews} (expected 0)`);
    if (freshProduct.ratings !== 0 || freshProduct.numOfReviews !== 0) {
      throw new Error("Rating failed to reset to 0 after deleting approved review!");
    }

    // Clean up DB
    await Product.findByIdAndDelete(mockProduct._id);
    await Order.findByIdAndDelete(mockOrder._id);
    await User.findByIdAndDelete(anotherUser._id);
    await Review.findByIdAndDelete(rejectedReview._id);

    console.log("All Review and Rating tests completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
};

run();
