import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CreatableSelect } from '../CreatableSelect';
import { Sparkles, Plus } from 'lucide-react';

/**
 * Renders a single CreatableSelect wired to react-hook-form via Controller.
 */
function SpecSelect({ name, label, attributeType, attributes, onCreateAttr, onEditAttr, onDeleteAttr }) {
  const { control } = useFormContext();
  const options = (attributes || [])
    .filter(a => a.type === attributeType)
    .map(a => ({ _id: a._id, value: a.value }));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-bold text-gray-700">{label}</label>
        <button
          type="button"
          onClick={() => {
            const val = window.prompt(`Enter new ${label}:`);
            if (val && val.trim()) {
              onCreateAttr(attributeType, label, val.trim());
            }
          }}
          className="text-[11px] tracking-wider font-bold text-amber-700 hover:text-amber-800 flex items-center transition-colors bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md"
        >
          <Plus className="w-3 h-3 mr-1" />
          Create
        </button>
      </div>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        render={({ field }) => (
          <CreatableSelect
            value={field.value || ''}
            onChange={field.onChange}
            options={options}
            placeholder={`Select ${label}...`}
            label={label}
            onCreate={(val) => onCreateAttr(attributeType, label, val)}
            onEdit={onEditAttr}
            onDelete={onDeleteAttr}
          />
        )}
      />
    </div>
  );
}

export default function ProductSpecifications({ attributes, onCreateAttr, onEditAttr, onDeleteAttr }) {
  const { register } = useFormContext();

  const dropdownSpecs = [
    { name: 'material',      label: 'Fabric / Material', attributeType: 'material'       },
    { name: 'finish',        label: 'Finish',            attributeType: 'finish'         },
    { name: 'color',         label: 'Color',             attributeType: 'color'          },
    { name: 'style',         label: 'Style',             attributeType: 'style'          },
    { name: 'pattern',       label: 'Pattern',           attributeType: 'pattern'        },
    { name: 'countryOfOrigin', label: 'Country of Origin', attributeType: 'countryOfOrigin' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="p-1.5 bg-amber-50 rounded-lg">
          <Sparkles className="w-4 h-4 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Product Specifications</h3>
      </div>

      {/* Dropdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {dropdownSpecs.map(spec => (
          <SpecSelect
            key={spec.name}
            name={spec.name}
            label={spec.label}
            attributeType={spec.attributeType}
            attributes={attributes}
            onCreateAttr={onCreateAttr}
            onEditAttr={onEditAttr}
            onDeleteAttr={onDeleteAttr}
          />
        ))}
      </div>

      {/* Text Fields Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Weight</label>
          <input
            {...register('weight')}
            placeholder="e.g., 12g, 50g"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Dimensions</label>
          <input
            {...register('dimensions')}
            placeholder="e.g., 2.5cm × 1cm"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Fit</label>
          <input
            {...register('fit')}
            placeholder="e.g., Regular Fit, Slim Fit"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Sleeve Type</label>
          <input
            {...register('sleeveType')}
            placeholder="e.g., Half Sleeves, Full Sleeves"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Neck Type</label>
          <input
            {...register('neckType')}
            placeholder="e.g., Round Neck, V-Neck"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Occasion</label>
          <input
            {...register('occasion')}
            placeholder="e.g., Casual, Festive, Party"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Transparency</label>
          <input
            {...register('transparency')}
            placeholder="e.g., Opaque, Semi-Sheer"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Season</label>
          <input
            {...register('season')}
            placeholder="e.g., Summer, Winter, All Season"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all text-sm"
          />
        </div>
      </div>

    </div>
  );
}
