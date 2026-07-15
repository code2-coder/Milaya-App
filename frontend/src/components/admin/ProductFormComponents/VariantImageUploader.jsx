import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { X, UploadCloud, Video, Play } from 'lucide-react';
import api from "../../../api/axios";

export default function VariantImageUploader({ index }) {
  const { watch, setValue } = useFormContext();
  const images = watch(`variants.${index}.images`) || [];
  const videos = watch(`variants.${index}.videos`) || [];
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e, type) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    const newMedia = [];

    for (const file of files) {
      if (type === 'video' && file.size > 20 * 1024 * 1024) continue;

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
        console.error("Variant upload failed", err);
        alert(err.response?.data?.message || `Failed to upload ${type}. Please try again.`);
      }
    }

    if (type === 'image') {
      setValue(`variants.${index}.images`, [...images, ...newMedia], { shouldDirty: true });
    } else {
      setValue(`variants.${index}.videos`, [...videos, ...newMedia], { shouldDirty: true });
    }
    
    setIsUploading(false);
  };

  const removeMedia = async (idx, type) => {
    const list = type === 'image' ? [...images] : [...videos];
    const removed = list.splice(idx, 1)[0];
    
    if (removed.public_id) {
      try {
        await api.delete('/admin/upload', { data: { public_id: removed.public_id, type } });
      } catch (err) {}
    }
    
    setValue(type === 'image' ? `variants.${index}.images` : `variants.${index}.videos`, list, { shouldDirty: true });
  };

  return (
    <div>
      <h5 className="text-sm font-bold text-gray-800 mb-3">Variant Media (Specific to this color)</h5>
      
      <div className="flex flex-wrap gap-4 mb-4">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-md overflow-hidden border border-gray-200 group">
            <img src={img.url || img} className="w-full h-full object-cover" alt="" />
            <button type="button" onClick={() => removeMedia(i, 'image')} className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {videos.map((vid, i) => (
          <div key={i} className="relative w-28 h-20 rounded-md overflow-hidden border border-gray-200 group bg-black">
            <video src={vid.url || vid} className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
            </div>
            <button type="button" onClick={() => removeMedia(i, 'video')} className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
          <UploadCloud className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-[9px] font-semibold text-gray-500 text-center leading-tight px-1">Upload<br/>Multiple</span>
          <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={isUploading} />
        </label>
        <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
          <Video className="w-5 h-5 text-gray-400 mb-1" />
          <span className="text-[9px] font-semibold text-gray-500 text-center leading-tight px-1">Upload<br/>Video</span>
          <input type="file" multiple accept="video/mp4,video/webm" className="hidden" onChange={(e) => handleFileUpload(e, 'video')} disabled={isUploading} />
        </label>
      </div>
      {isUploading && <p className="text-xs text-blue-500 font-medium animate-pulse">Uploading...</p>}
    </div>
  );
}