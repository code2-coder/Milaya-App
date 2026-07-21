import React, { useState } from "react";
import { UploadCloud, X, Film, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export const MediaUploader = ({ onUpload, type = "video", maxFiles = 1, maxSizeMB = 200 }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (uploadedFiles.length + files.length > maxFiles) {
      toast.error(`You can only upload up to ${maxFiles} ${type}(s)`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
        return false;
      }
      if (type === "video" && !file.type.startsWith("video/")) {
        toast.error(`${file.name} is not a valid video file`);
        return false;
      }
      if (type === "image" && !file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploading(true);
    
    // Simulating file upload by using FileReader to data URL for immediate preview
    // In a real implementation, you would POST to your backend
    // and returns the URL. For this component, we simulate the structure.
    
    try {
      const uploadPromises = validFiles.map(file => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            // Simulated response structure from backend
            resolve({
              url: reader.result,
              publicId: `mock_${Date.now()}`,
              type: type
            });
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      const results = await Promise.all(uploadPromises);
      const newFiles = [...uploadedFiles, ...results];
      setUploadedFiles(newFiles);
      onUpload(newFiles);
      toast.success(`${type} uploaded successfully`);
    } catch (error) {
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (indexToRemove) => {
    const newFiles = uploadedFiles.filter((_, index) => index !== indexToRemove);
    setUploadedFiles(newFiles);
    onUpload(newFiles);
  };

  return (
    <div className="mt-2">
      {uploadedFiles.length < maxFiles && (
        <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            {type === "video" ? (
              <Film className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
            ) : (
              <ImageIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
            )}
            <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
              <label
                htmlFor={`file-upload-${type}`}
                className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
              >
                <span>Upload a {type}</span>
                <input
                  id={`file-upload-${type}`}
                  name={`file-upload-${type}`}
                  type="file"
                  className="sr-only"
                  accept={type === "video" ? "video/*" : "image/*"}
                  multiple={maxFiles > 1}
                  onChange={handleUpload}
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              {type === "video" ? "MP4, MOV, WEBM up to 200MB" : "PNG, JPG, GIF up to 5MB"}
            </p>
            {isUploading && (
              <p className="text-sm font-medium text-primary mt-2">Uploading...</p>
            )}
          </div>
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <ul role="list" className="mt-4 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
          {uploadedFiles.map((file, index) => (
            <li key={index} className="relative">
              <div className="group aspect-h-7 aspect-w-10 block w-full overflow-hidden rounded-lg bg-gray-100 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
                {file.type === "video" ? (
                  <video src={file.url} className="pointer-events-none object-cover" />
                ) : (
                  <img src={file.url} alt="" className="pointer-events-none object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <X className="h-4 w-4 text-gray-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
