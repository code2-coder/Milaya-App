import React from 'react';
import { Save } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

export default function StickySaveBar({ onCancel, isSaving }) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-200 p-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-50 mt-10">
      <div className="max-w-5xl mx-auto flex justify-end items-center gap-4">
        <button type="button" onClick={onCancel} className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:border-gray-300 rounded-xl transition-colors shadow-sm">
          Cancel
        </button>
        <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-8 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors shadow-md disabled:opacity-50">
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </div>
  );
}