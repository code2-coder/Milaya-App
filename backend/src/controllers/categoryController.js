import Category from "../models/category.js";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import uploadService from "../services/UploadService.js";
import { clearCache } from "../middlewares/cache.js";

//
// 🆕 CREATE CATEGORY (ADMIN)
//
export const createCategory = catchAsyncErrors(async (req, res, next) => {
  const { name, parentCategory, image } = req.body;
  
  const catPayload = { name };
  if (parentCategory) catPayload.parentCategory = parentCategory;

  // Handle Image Upload
  if (image && typeof image === "string" && image.startsWith("data:image")) {
    const result = await uploadService.uploadMedia(image, {
      folder: "milaya/categories",
    });

    catPayload.image = {
      public_id: result.public_id,
      url: result.url || result.secure_url,
    };
  } else if (image && typeof image === "object" && image.url) {
    // Allows passing an already structured image object (e.g. from seeders)
    catPayload.image = image;
  }

  const category = await Category.create(catPayload);
  
  clearCache("/api/v1/categories");

  res.status(201).json({ 
    success: true, 
    category 
  });
});

//
// 📦 GET ALL CATEGORIES
//
export const getAllCategories = catchAsyncErrors(async (req, res, next) => {
  const categories = await Category.find().lean();
  
  res.status(200).json({ 
    success: true, 
    categories 
  });
});

//
// 🔍 GET SINGLE CATEGORY
//
export const getCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id).lean();
  
  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }
  
  res.status(200).json({ 
    success: true, 
    category 
  });
});

//
// ✏️ UPDATE CATEGORY (ADMIN)
//
export const updateCategory = catchAsyncErrors(async (req, res, next) => {
  let category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  let image = req.body.image;

  // Handle Image Update
  if (image && typeof image === "string" && image.startsWith("data:image")) {
    // 1. Destroy old image
    if (category.image && category.image.public_id) {
      await uploadService.deleteMedia(category.image.public_id);
    }

    // 2. Upload new image
    const result = await uploadService.uploadMedia(image, {
      folder: "milaya/categories",
    });

    req.body.image = {
      public_id: result.public_id,
      url: result.url || result.secure_url,
    };
  }

  category = await Category.findByIdAndUpdate(req.params.id, req.body, { 
    new: true,
    runValidators: true
  });
  
  clearCache("/api/v1/categories");

  res.status(200).json({ 
    success: true, 
    category 
  });
});

//
// ❌ DELETE CATEGORY (ADMIN)
//
export const deleteCategory = catchAsyncErrors(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler("Category not found", 404));
  }

  // Delete category image from cloudinary if it exists
  if (category.image && category.image.public_id) {
    await uploadService.deleteMedia(category.image.public_id);
  }

  // Find and delete all subcategories
  const subcategories = await Category.find({ parentCategory: category._id });
  for (const sub of subcategories) {
    if (sub.image && sub.image.public_id) {
      await uploadService.deleteMedia(sub.image.public_id);
    }
    await sub.deleteOne();
  }

  await category.deleteOne();

  clearCache("/api/v1/categories");

  res.status(200).json({ 
    success: true, 
    message: "Category and its subcategories deleted successfully" 
  });
});
