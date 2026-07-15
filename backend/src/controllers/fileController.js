import { getGfsBucket } from "../utils/gridfs.js";
import mongoose from "mongoose";
import ErrorHandler from "../utils/errorHandler.js";
import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";

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
    
    const downloadStream = gfsBucket.openDownloadStream(fileId);
    downloadStream.on("error", (error) => {
      return next(new ErrorHandler("Error streaming file", 500));
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    return next(new ErrorHandler("Error fetching file", 500));
  }
});
