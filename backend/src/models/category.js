import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null
    },
    image: {
      public_id: String,
      url: String
    }
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, parentCategory: 1 });

export default mongoose.model("Category", categorySchema);
