import mongoose from "mongoose";



const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      maxLength: [200, "Product name cannot exceed 200 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      maxLength: [5, "Product price cannot exceed 5 digits"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    moreDetails: {
      type: String,
    },
    ratings: {
      type: Number,
      default: 0,
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
        },
        url: {
          type: String,
        },
      }
    ],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    productType: {
      type: String, // Bottoms, Accessories, Pendants, etc.
    },
    style: {
      type: String,
    },
    accessoriestyle: {
      type: String,
    },
    nosepinStyle: {
      type: String,
    },
    pendantStyle: {
      type: String,
    },
    bottomstyle: {
      type: String,
    },
    material: {
      type: String, // Apparel, Solitaire, Premium, Gemstone
    },
    metalColor: {
      type: String, // Yellow, Rose, White
    },
    purity: {
      type: String, // 14 KT, 18 KT, 22 KT
    },
    metalTypeColor: {
      type: String, // e.g. 14 KT Yellow Premium
    },
    // Extended Product Specifications
    metal: {
      type: String, // e.g. Premium, Silver, Copper
    },
    stoneType: {
      type: String, // e.g. Apparel, Ruby, Emerald
    },
    finish: {
      type: String, // e.g. Matte, Polished, Oxidised
    },
    color: {
      type: String, // e.g. Premium-Tone, Silver-Tone, Rose Premium
    },
    theme: {
      type: String, // e.g. Floral, Geometric, Traditional
    },
    pattern: {
      type: String, // e.g. Lotus, Paisley, Abstract
    },
    shape: {
      type: String, // e.g. Round, Oval, Square
    },
    fit: { type: String },
    sleeveType: { type: String },
    neckType: { type: String },
    occasion: { type: String },
    closureType: { type: String },
    length: { type: String },
    waistRise: { type: String },
    stretch: { type: String },
    transparency: { type: String },
    careInstructions: { type: String },
    season: { type: String },
    weight: {
      type: String, // e.g. 12g, 50g (string to allow units)
    },
    dimensions: {
      type: String, // e.g. 2.5cm x 1cm
    },
    handmade: {
      type: Boolean,
      default: false,
    },
    countryOfOrigin: {
      type: String,
      default: "India",
    },
    availableInStore: {
      type: Boolean,
      default: false,
    },
    readyToShip: {
      type: Boolean,
      default: false,
    },
    onSale: {
      type: Boolean,
      default: false,
    },

    visualEmbedding: {
      type: [Number],
      select: false,
    },
    seller: {
      type: String,
      required: [true, "Please enter product seller"],
    },
    stock: {
      type: Number,
      required: [true, "Please enter product stock"],
    },
    features: {
      type: [String],
      default: [],
    },
    homeSection: {
      type: String,
      enum: ["New Arrival", "Best Seller", "Trending Product", ""],
      default: "",
    },
    variants: [
      {
        variantName: { type: String, required: true },
        colorHex: { type: String },
        skuPrefix: { type: String },
        images: [
          {
            public_id: { type: String, required: true },
            url: { type: String, required: true }
          }
        ],
        videos: [
          {
            public_id: { type: String, required: true },
            url: { type: String, required: true }
          }
        ],
        sizes: [
          {
            size: { type: String, required: true },
            price: { type: Number, required: true },
            comparePrice: { type: Number },
            stock: { type: Number, required: true, default: 0 },
            sku: { type: String },
            weight: { type: Number },
            barcode: { type: String },
            status: { type: String, enum: ["Active", "Draft"], default: "Active" }
          }
        ]
      }
    ],
    sizes: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true },
        comparePrice: { type: Number },
        stock: { type: Number, required: true, default: 0 },
        sku: { type: String },
        weight: { type: Number },
        barcode: { type: String },
        status: { type: String, enum: ["Active", "Draft"], default: "Active" }
      }
    ],
    numOfReviews: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
        comment: {
          type: String,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      required: [true, "Product status is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Add Indexes for performance
productSchema.index({ category: 1 });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text' });
productSchema.index({ status: 1 });

export default mongoose.model("Product", productSchema);
