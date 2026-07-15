import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, "Attribute type is required"],
      enum: [
        "productType",
        "material",
        "metal",
        "stoneType",
        "finish",
        "color",
        "colorHex",
        "theme",
        "metalColor",
        "purity",
        "style",
        "pattern",
        "shape",
        "countryOfOrigin",
        "bottomstyle",
        "accessoriestyle",
        "nosepinStyle",
        "pendantStyle",
        "outerweartyle",
        "braceletStyle",
        "bangleStyle",
        "generalStyle",
        "metalSpecs"
      ],
    },
    value: {
      type: String,
      required: [true, "Attribute value is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate values for the same type
attributeSchema.index({ type: 1, value: 1 }, { unique: true });

export default mongoose.model("Attribute", attributeSchema);
