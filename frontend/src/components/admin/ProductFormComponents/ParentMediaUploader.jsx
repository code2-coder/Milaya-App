import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { X, UploadCloud, Video, Play } from 'lucide-react';
import api from "../../../api/axios";

export default function ParentMediaUploader() {
  const { watch, setValue, register, formState: { errors } } = useFormContext();
  
  useEffect(() => {
    register("images");
  }, [register]);

  const images = watch('images') || [];
  const videos = watch('videos') || [];
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    const newMedia = [];

    for (const file of files) {
      if (type === 'video' && file.size > 20 * 1024 * 1024) {
        alert("Video must be under 20MB");
        continue;
      }

      const reader = new FileReader();
      const base64 = await new Promise(resolve => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      try {
        const res = await api.post('/admin/upload', { file: base64, type });
        if (res.data.success) {
          newMedia.push(res.data.media);
        }
      } catch (err) {
        console.error("Upload failed", err);
      }
    }

    if (type === 'image') {
      setValue('images', [...images, ...newMedia], { shouldValidate: true, shouldDirty: true });
    } else {
      setValue('videos', [...videos, ...newMedia], { shouldValidate: true, shouldDirty: true });
    }
    
    setIsUploading(false);
  };

  const removeMedia = async (index, type) => {
    const list = type === 'image' ? [...images] : [...videos];
    const removed = list.splice(index, 1)[0];
    
    if (removed.public_id && !removed.public_id.includes('temp')) {
      try {
        await api.delete('/admin/upload', { data: { public_id: removed.public_id, type } });
      } catch (err) {
        console.error("Failed to delete from GridFS");
      }
    }
    
    setValue(type === 'image' ? 'images' : 'videos', list, { shouldValidate: true, shouldDirty: true });
  };

  const setAsMain = (index) => {
    if (index === 0) return;
    const newImages = [...images];
    const [selected] = newImages.splice(index, 1);
    newImages.unshift(selected);
    setValue('images', newImages, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Parent Media *</h3>
      
      {/* IMAGES */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-700 mb-2">Images (First is Main View)</label>
        <div className="flex flex-wrap gap-4 mb-4">
          {images.map((img, i) => (
            <div key={i} className={`relative w-24 h-24 rounded-lg overflow-hidden border ${i === 0 ? 'border-gray-900 ring-2 ring-gray-900 shadow-md' : 'border-gray-200'} group`}>
              <img src={img.url || img} className="w-full h-full object-cover" alt="" />
              
              {i === 0 && (
                <div className="absolute bottom-0 left-0 right-0 bg-gray-900 text-white text-[9px] font-bold text-center py-0.5">
                  MAIN VIEW
                </div>
              )}
              
              {i !== 0 && (
                <button type="button" onClick={() => setAsMain(i)} className="absolute bottom-1 left-1 right-1 bg-white/90 text-gray-900 text-[10px] font-bold py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity text-center shadow-sm hover:bg-gray-100">
                  Make Main
                </button>
              )}
              
              <button type="button" onClick={() => removeMedia(i, 'image')} className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
            <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-[10px] font-semibold text-gray-500">Upload</span>
            <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={isUploading} />
          </label>
        </div>
        {errors.images && (
          <p className="text-red-500 text-xs mt-1 font-medium">{errors.images.message}</p>
        )}
      </div>

      {/* VIDEOS */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">Videos</label>
        <div className="flex flex-wrap gap-4 mb-4">
          {videos.map((vid, i) => (
            <div key={i} className="relative w-32 h-24 rounded-lg overflow-hidden border border-gray-200 group bg-black">
              <video src={vid.url || vid} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 flex items-center justify-center">
                 <Play className="w-6 h-6 text-white" />
              </div>
              <button type="button" onClick={() => removeMedia(i, 'video')} className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
            <Video className="w-6 h-6 text-gray-400 mb-1" />
            <span className="text-[10px] font-semibold text-gray-500">Add Video</span>
            <input type="file" multiple accept="video/mp4,video/webm" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} disabled={isUploading} />
          </label>
        </div>
      </div>

      {isUploading && <p className="text-sm text-blue-500 font-medium animate-pulse mt-2">Uploading media...</p>}
    </div>
  );
}