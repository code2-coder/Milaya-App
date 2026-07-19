import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      fullName: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      landmark: {
        type: String,
      },
      phoneNo: {
        type: String,
        required: true,
      },
      altPhoneNo: {
        type: String,
      },
      zipCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },

    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        image: {
          type: String,
          required: true,
        },

        // 🔥 FIX: MUST be Number
        price: {
          type: Number,
          required: true,
        },

        size: {
          type: String,
        },

        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        returnActive: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Return",
        },
      },
    ],

    paymentMethod: {
      type: String,
      required: [true, "Please select payment method"],
      enum: ["COD", "Card", "Razorpay"],
    },

    paymentInfo: {
      id: String,
      status: String,
    },

    itemsPrice: {
      type: Number,
      required: true,
    },

    taxAmount: {
      type: Number,
      required: true,
    },

    shippingAmount: {
      type: Number,
      required: true,
    },

    // 🔥 NEW: Packaging add-on
    packagingAmount: {
      type: Number,
      default: 0,
    },

    packagingOption: {
      type: String,
      enum: ["standard", "exquisite"],
      default: "standard",
    },

    // 🔥 NEW: Shipping method
    shippingMethod: {
      type: String,
      enum: ["standard", "express"],
      default: "standard",
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered"],
      default: "Processing",
    },

    deliveredAt: Date,

    // 🔥 NEW: when order is paid
    paidAt: Date,

    // 🔥 NEW: Tracking ID for shipment
    trackingId: {
      type: String,
    },

    // 🔥 NEW: Tracking URL for shipment
    trackingUrl: {
      type: String,
    },

    awbNumber: {
      type: String,
    },

    courierName: {
      type: String,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Order", orderSchema);
