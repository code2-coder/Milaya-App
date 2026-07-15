import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: false, // Optional for Google OAuth users
      select: false, // Don't return password by default
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "staff"],
      default: "user",
    },
    googleId: {
      type: String,
    },
    provider: {
      type: String,
      default: "local",
    },
    avatar: {
      public_id: { type: String },
      url: { type: String },
    },
    addresses: [
      {
        title: { type: String, default: "Home" },
        fullName: { type: String, required: true },
        phoneNo: { type: String, required: true },
        altPhoneNo: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      }
    ],
    phoneNumber: {
      type: String,
    },
    altPhoneNumber: {
      type: String,
    },
    address: {
      street: { type: String },
      landmark: { type: String },
      city: { type: String },
      state: { type: String },
      pinCode: { type: String },
    },

    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    refreshToken: {
      type: String,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
