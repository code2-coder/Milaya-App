import { getGfsBucket } from "../utils/gridfs.js";
import mongoose from "mongoose";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middleware/catchAsyncErrors.js";

// @route   GET /api/v1/files/:id
// @desc    Get file from GridFS by ID
export const getFile = catchAsyncErrors(async (req, res, next) => {
  const gfsBucket = getGfsBucket();
  
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorHandler("Invalid file ID", 400));
  }

  const fileId = new mongoose.Types.ObjectId(req.params.id);
  
  try {
    const files = await gfsBucket.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return next(new ErrorHandler("File not found", 404));
    }
    
    const file = files[0];
    if (file.contentType) {
      res.set("Content-Type", file.contentType);
    }
    
    // Add aggressive caching since these files are immutable in GridFS (they don't change, they get replaced with new IDs)
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    
    const downloadStream = gfsBucket.openDownloadStream(fileId);
    downloadStream.on("error", (error) => {
      return next(new ErrorHandler("Error streaming file", 500));
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    return next(new ErrorHandler("Error fetching file", 500));
  }
});
