import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    highlights: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
        iconName: { type: String, default: "" },
      },
    ],
    sections: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Page", pageSchema);
