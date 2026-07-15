import { getGfsBucket } from "../utils/gridfs.js";
import { Readable } from "stream";
import mongoose from "mongoose";

export class UploadService {
  /**
   * Upload media to GridFS
   * @param {string} file - Base64 string
   * @param {object} options - Options (type: "image"|"video", folder: string)
   */
  async uploadMedia(file, { type = "image", folder = "milaya/products" } = {}) {
    try {
      const gfsBucket = getGfsBucket();
      
      // Parse Base64
      // format: data:image/png;base64,iVBORw0KGgo...
      let mimeType = type === "video" ? "video/mp4" : "image/jpeg";
      let base64Data = file;
      
      if (file.startsWith("data:")) {
        const matches = file.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        }
      }
      
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `${folder.replace(/\//g, '_')}_${Date.now()}`;
      
      return new Promise((resolve, reject) => {
        const readableStream = Readable.from(buffer);
        const uploadStream = gfsBucket.openUploadStream(filename, {
          contentType: mimeType
        });
        
        readableStream.pipe(uploadStream)
          .on('error', (error) => {
            console.error("GridFS upload error:", error.message);
            reject(error);
          })
          .on('finish', () => {
            resolve({
              public_id: uploadStream.id.toString(),
              url: `/api/v1/files/${uploadStream.id.toString()}`,
              duration: 0 // Cannot easily calculate duration for buffer without external tools like ffmpeg
            });
          });
      });
      
    } catch (error) {
      console.error("Upload error:", error.message);
      throw error;
    }
  }

  /**
   * Delete media from GridFS
   * @param {string} publicId - The GridFS ID of the resource
   * @param {string} type - "image" or "video"
   */
  async deleteMedia(publicId, type = "image") {
    try {
      const gfsBucket = getGfsBucket();
      if (mongoose.Types.ObjectId.isValid(publicId)) {
        await gfsBucket.delete(new mongoose.Types.ObjectId(publicId));
      }
      return true;
    } catch (error) {
      console.error(`GridFS delete error for ${publicId}:`, error.message);
      // Don't throw error if file is already deleted or not found
      return false;
    }
  }
}

export default new UploadService();
