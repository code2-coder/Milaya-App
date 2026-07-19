import React from 'react';
import { useFormContext } from 'react-hook-form';
import VariantImageUploader from './VariantImageUploader';
import NestedSizeManager from './NestedSizeManager';

export default function VariantCard({ index, field = {} }) {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="pb-6 border-b border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Variant / Color Name *</label>
          <input {...register(`variants.${index}.variantName`, { required: true })} defaultValue={field.variantName} placeholder="e.g. Midnight Black" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-gray-900 outline-none" />
        </div>
      </div>

      <div>
        <VariantImageUploader index={index} />
      </div>

      <NestedSizeManager variantIndex={index} />
    </div>
  );
}