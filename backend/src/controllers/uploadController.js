import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";
import uploadService from "../services/UploadService.js";

// Upload a single media file (Image or Video)
export const uploadMedia = catchAsyncErrors(async (req, res, next) => {
  const { file, type = "image", folder = "milaya/products" } = req.body;

  if (!file) {
    return next(new ErrorHandler("No file provided", 400));
  }

  try {
    const result = await uploadService.uploadMedia(file, { type, folder });

    res.status(200).json({
      success: true,
      media: {
        public_id: result.public_id,
        url: result.url,
      }
    });
  } catch (error) {
     return next(new ErrorHandler(error.message || "Upload failed", 500));
  }
});

// Delete media from GridFS
export const deleteMedia = catchAsyncErrors(async (req, res, next) => {
  const { public_id, type = "image" } = req.body;
  if (!public_id) {
     return next(new ErrorHandler("No public_id provided", 400));
  }
  
  await uploadService.deleteMedia(public_id, type);
  
  res.status(200).json({ success: true, message: "Media deleted successfully" });
});
