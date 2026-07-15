import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function ProductInformation({ categories, productType }) {
  const { register, formState: { errors } } = useFormContext();

  const isVariationMode = productType === 'variant';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
          <input {...register("name")} placeholder="e.g., Apparel Jacket" className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all" />
          {errors.name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
          <select {...register("category")} className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all">
            <option value="">Select Category</option>
            {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          {errors.category && <p className="text-red-500 text-xs mt-1 font-medium">{errors.category.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Display in home page</label>
          <select {...register("homeSection")} className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all font-semibold">
            <option value="">Select section</option>
            <option value="New Arrival">New Arrival</option>
            <option value="Best Seller">Best Seller</option>
            <option value="Trending Product">Trending Product</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Status *</label>
          <select {...register("status", { required: "Status is required" })} className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all font-semibold">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          {errors.status && <p className="text-red-500 text-xs mt-1 font-medium">{errors.status.message}</p>}
        </div>
        {!isVariationMode && (
          <>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Base Selling Price *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input 
                  type="number" 
                  {...register("price", { 
                    required: !isVariationMode ? "Base Selling Price is required" : false, 
                    valueAsNumber: true,
                    min: !isVariationMode ? { value: 0.01, message: "Price must be greater than 0" } : undefined
                  })} 
                  placeholder="0" 
                  className="w-full border border-gray-300 rounded-xl pl-8 pr-4 py-3 outline-none transition-all font-semibold bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900" 
                />
              </div>
              {errors.price && <p className="text-red-500 text-xs mt-1 font-medium">{errors.price.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Stock *
              </label>
              <input 
                type="number" 
                {...register("stock", { 
                  required: !isVariationMode ? "Stock is required" : false, 
                  valueAsNumber: true,
                  min: !isVariationMode ? { value: 0, message: "Stock cannot be negative" } : undefined
                })} 
                placeholder="0" 
                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none transition-all font-semibold bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900" 
              />
              {errors.stock && <p className="text-red-500 text-xs mt-1 font-medium">{errors.stock.message}</p>}
            </div>
          </>
        )}
        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-gray-700 mb-2">Full Description *</label>
          <textarea {...register("description")} rows="4" placeholder="Detailed product description..." className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-gray-900 outline-none transition-all resize-y"></textarea>
          {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description.message}</p>}
        </div>
      </div>
    </div>
  );
}