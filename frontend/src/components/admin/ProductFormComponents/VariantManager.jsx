import React, { useEffect, useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import VariantCard from './VariantCard';

export default function VariantManager({ openSizeModal, attributes = [], onCreateAttr, onEditAttr, onDeleteAttr }) {
  const { control } = useFormContext();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "variants"
  });

  const [expandedIndex, setExpandedIndex] = useState(0);

  const addVariant = () => {
    append({
      variantName: '',
      colorHex: '#000000',
      images: [],
      videos: [],
      sizes: []
    });
    setExpandedIndex(fields.length);
  };

  const duplicateVariant = (index) => {
    const v = fields[index];
    append({
      ...v,
      id: undefined, // remove id to avoid key conflicts
      variantName: v.variantName + ' (Copy)',
      sizes: v.sizes ? v.sizes.map(s => ({ ...s, id: undefined })) : []
    });
    setExpandedIndex(fields.length);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Product Variants</h3>
          <p className="text-sm text-gray-500">Add colors, and inside each color specify pricing, sizes, and specific media.</p>
        </div>
        <button type="button" onClick={addVariant} className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors">
          <Plus className="w-4 h-4" /> Add Variant
        </button>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => {
          const isExpanded = expandedIndex === index;
          return (
            <div key={field.id} className="border border-gray-200 rounded-xl overflow-hidden transition-all duration-300">
              <div 
                className={`flex items-center justify-between p-4 bg-gray-50 cursor-pointer ${isExpanded ? 'border-b border-gray-200' : ''}`}
                onClick={() => setExpandedIndex(isExpanded ? null : index)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border border-gray-300" style={{ backgroundColor: field.colorHex || '#ccc' }}></div>
                  <h4 className="font-bold text-gray-900">{field.variantName || `Variant ${index + 1}`}</h4>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={(e) => { e.stopPropagation(); duplicateVariant(index); }} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={(e) => { e.stopPropagation(); remove(index); }} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 bg-white">
                  <VariantCard 
                    index={index} 
                    field={field} 
                    attributes={attributes} 
                    onCreateAttr={onCreateAttr} 
                    onEditAttr={onEditAttr} 
                    onDeleteAttr={onDeleteAttr} 
                  />
                </div>
              )}
            </div>
          );
        })}

        {fields.length === 0 && (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-sm text-gray-500 font-medium mb-3">No variants added yet.</p>
            <button type="button" onClick={addVariant} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
              Create First Variant
            </button>
          </div>
        )}
      </div>
    </div>
  );
}