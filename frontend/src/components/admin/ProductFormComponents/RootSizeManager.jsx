import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

export default function RootSizeManager() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sizes'
  });

  const addSize = () => {
    append({
      size: '',
      price: '',
      comparePrice: '',
      stock: '',
      weight: '',
      barcode: '',
      status: 'Active'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Size & Pricing Variations</h3>
          <p className="text-xs text-gray-500">Manage prices, stock, and weight per size for this product.</p>
        </div>
        <button 
          type="button" 
          onClick={addSize} 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white hover:bg-black rounded-lg text-xs font-bold transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add Size
        </button>
      </div>

      <div className="space-y-3">
        {fields.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <p className="text-xs text-gray-500 font-medium">No sizes added to this product yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                  <th className="p-3">Size *</th>
                  <th className="p-3">Price *</th>
                  <th className="p-3">Stock *</th>
                  <th className="p-3">Weight(g)</th>
                  <th className="p-3 w-12 text-center"></th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, sizeIndex) => (
                  <tr key={field.id} className="border-b border-gray-100 bg-white last:border-0 hover:bg-gray-50/50">
                    <td className="p-2 align-top">
                      <input 
                        {...register(`sizes.${sizeIndex}.size`, { required: true })} 
                        defaultValue={field.size}
                        placeholder="e.g. 18" 
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-gray-900 outline-none" 
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input 
                        type="number" 
                        {...register(`sizes.${sizeIndex}.price`, { required: true, valueAsNumber: true })} 
                        defaultValue={field.price}
                        placeholder="0" 
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-gray-900 outline-none" 
                      />
                    </td>
                    <td className="p-2 align-top">
                      <input 
                        type="number" 
                        {...register(`sizes.${sizeIndex}.stock`, { required: true, valueAsNumber: true })} 
                        defaultValue={field.stock}
                        placeholder="0" 
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-gray-900 outline-none" 
                      />
                    </td>

                    <td className="p-2 align-top">
                      <input 
                        type="number" 
                        {...register(`sizes.${sizeIndex}.weight`, { valueAsNumber: true })} 
                        defaultValue={field.weight}
                        placeholder="0" 
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm focus:ring-1 focus:ring-gray-900 outline-none" 
                      />
                    </td>
                    <td className="p-2 align-top text-center">
                      <button 
                        type="button" 
                        onClick={() => remove(sizeIndex)} 
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors mt-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
