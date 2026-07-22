import React, { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import api from '../../api/axios';
import {
  ProductInformation,
  ProductSpecifications,
  VariantManager,
  ParentMediaUploader,
  StickySaveBar,
  ProductFeatures,
  RootSizeManager
} from './ProductFormComponents';

export default function NewProductForm({
  editingProduct,
  onClose,
  products,
  setProducts,
  categories,
  setCategories,
  attributes,
  setAttributes
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [productType, setProductType] = useState(editingProduct && editingProduct.variants?.length > 0 ? 'variant' : 'single');

  const methods = useForm({
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: '',
      stock: '',
      homeSection: '',
      status: 'draft',
      images: [],
      videos: [],
      variants: [],
      sizes: [],
      features: [],
      // Product Specifications
      material: '',
      metal: '',
      stoneType: '',
      finish: '',
      color: '',
      theme: '',
      style: '',
      pattern: '',
      shape: '',
      weight: '',
      dimensions: '',
      countryOfOrigin: '',
      fit: '',
      sleeveType: '',
      neckType: '',
      occasion: '',
      closureType: '',
      length: '',
      waistRise: '',
      stretch: '',
      transparency: '',
      careInstructions: '',
      season: '',
    }
  });

  useEffect(() => {
    if (editingProduct) {
      // Deep clone and strip _id to avoid react-hook-form useFieldArray key conflicts
      const cleanVariants = (editingProduct.variants || []).map(v => {
        const { _id, id, ...rest } = v;
        return {
          ...rest,
          images: rest.images?.map(img => { const { _id, id, ...imgRest } = img; return imgRest; }) || [],
          videos: rest.videos?.map(vid => { const { _id, id, ...vidRest } = vid; return vidRest; }) || [],
          sizes: rest.sizes?.map(size => { const { _id, id, ...sizeRest } = size; return sizeRest; }) || []
        };
      });

      const cleanSizes = (editingProduct.sizes || []).map(size => {
        const { _id, id, ...rest } = size;
        return rest;
      });

      methods.reset({
        name: editingProduct.name || '',
        description: editingProduct.description || '',
        category: editingProduct.category?._id || editingProduct.category || '',
        price: editingProduct.price || '',
        stock: editingProduct.stock || '',
        homeSection: editingProduct.homeSection || '',
        status: editingProduct.status || 'draft',
        images: editingProduct.images || [],
        videos: editingProduct.videos || [],
        variants: cleanVariants,
        sizes: cleanSizes,
        features: editingProduct.features || [],
        // Product Specifications
        material: editingProduct.material || '',
        metal: editingProduct.metal || '',
        stoneType: editingProduct.stoneType || '',
        finish: editingProduct.finish || '',
        color: editingProduct.color || '',
        theme: editingProduct.theme || '',
        style: editingProduct.style || '',
        pattern: editingProduct.pattern || '',
        shape: editingProduct.shape || '',
        weight: editingProduct.weight || '',
        dimensions: editingProduct.dimensions || '',
        countryOfOrigin: editingProduct.countryOfOrigin || '',
        fit: editingProduct.fit || '',
        sleeveType: editingProduct.sleeveType || '',
        neckType: editingProduct.neckType || '',
        occasion: editingProduct.occasion || '',
        closureType: editingProduct.closureType || '',
        length: editingProduct.length || '',
        waistRise: editingProduct.waistRise || '',
        stretch: editingProduct.stretch || '',
        transparency: editingProduct.transparency || '',
        careInstructions: editingProduct.careInstructions || '',
        season: editingProduct.season || '',
      });
    }
  }, [editingProduct, methods]);

  const onSubmit = async (data) => {
    if (!data.name || !data.category) {
      toast.error("Please fill required fields (Name and Category)");
      return;
    }

    // Filter out empty features
    if (data.features) {
      data.features = data.features.filter(f => typeof f === 'string' && f.trim().length > 0);
    }

    // Clean payload based on productType toggled mode
    if (productType === 'single') {
      data.variants = [];
      
      // Validate parent media images
      if (!data.images || data.images.length === 0) {
        toast.error("At least one product image is required in Parent Media");
        return;
      }

      if (data.sizes && data.sizes.length > 0) {
        let minPrice = Infinity;
        let totalStock = 0;
        data.sizes.forEach(size => {
          const price = Number(size.price) || 0;
          const stock = Number(size.stock) || 0;
          if (price < minPrice && price > 0) minPrice = price;
          totalStock += stock;
        });
        data.price = minPrice === Infinity ? 0 : minPrice;
        data.stock = totalStock;
      } else {
        // Validate base price and stock for single product without sizes
        if (data.price === undefined || data.price === '' || isNaN(data.price) || Number(data.price) <= 0) {
          toast.error("Base Selling Price is required and must be greater than 0");
          return;
        }
        if (data.stock === undefined || data.stock === '' || isNaN(data.stock) || Number(data.stock) < 0) {
          toast.error("Stock is required and must be 0 or more");
          return;
        }
        data.price = Number(data.price) || 0;
        data.stock = Number(data.stock) || 0;
      }
    } else {
      data.sizes = [];
      if (data.variants && data.variants.length > 0) {
        let minPrice = Infinity;
        let totalStock = 0;
        let hasSizes = false;
        data.variants.forEach(variant => {
          if (variant.sizes && variant.sizes.length > 0) {
            hasSizes = true;
            variant.sizes.forEach(size => {
              const price = Number(size.price) || 0;
              const stock = Number(size.stock) || 0;
              if (price < minPrice && price > 0) minPrice = price;
              totalStock += stock;
            });
          }
        });
        
        if (!hasSizes) {
          toast.error("Please add at least one size with pricing to your variants");
          return;
        }
        
        if (minPrice === Infinity || minPrice <= 0) {
          toast.error("At least one variant size must have a price greater than 0");
          return;
        }

        data.price = minPrice;
        data.stock = totalStock;

        // Copy first variant's images to root for legacy components (like ProductCard)
        if (data.variants[0].images && data.variants[0].images.length > 0) {
          data.images = data.variants[0].images;
        }
      } else {
        toast.error("Please add at least one variant");
        return;
      }
    }

    // Default seller
    data.seller = "Milaya";

    setIsSaving(true);
    try {
      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct._id}`, data);
        setProducts(products.map(p => p._id === editingProduct._id ? res.data.product : p));
        toast.success("Product updated successfully");
      } else {
        const res = await api.post(`/admin/products`, data);
        setProducts([res.data.product, ...products]);
        toast.success("Product created successfully");
      }
      onClose();
    } catch (error) {
      const msg = error.response?.data?.message || "Failed to save product";
      toast.error(msg);
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 border border-gray-200 shadow-lg rounded-3xl bg-white animate-in slide-in-from-top-4 fade-in duration-300 my-8 relative">
      <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{editingProduct ? "Edit Product" : "Add New Product"}</h3>
        <button type="button" onClick={onClose} className="p-2.5 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit, (errors) => {
          console.error("Form validation errors:", errors);
          const getErrorPaths = (errObj, prefix = '') => {
            let paths = [];
            for (let key in errObj) {
              if (key === 'ref' || key === 'type' || key === 'message') continue;
              const currentPath = prefix ? `${prefix}.${key}` : key;
              if (errObj[key] && errObj[key].type) {
                paths.push(errObj[key].message || currentPath);
              } else if (errObj[key] && typeof errObj[key] === 'object') {
                paths = paths.concat(getErrorPaths(errObj[key], currentPath));
              }
            }
            return paths;
          };
          
          let paths = getErrorPaths(errors);
          paths = paths.map(p => {
             if (p.includes('variants.')) return 'Variant fields (Name, Sizes, Price, or SKU)';
             if (p === 'name') return 'Product Name';
             if (p === 'category') return 'Category';
             if (p === 'status') return 'Status';
             if (p === 'price') return 'Base Selling Price';
             if (p === 'stock') return 'Stock';
             if (p === 'description') return 'Description';
             return p;
          });
          
          const uniquePaths = [...new Set(paths)];
          toast.error(`Missing or invalid fields: ${uniquePaths.join(', ')}`);
        })} className="space-y-6">
          <ProductInformation categories={categories} productType={productType} />

          {/* Product Type Toggle */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Product Type</h3>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${productType === 'single' ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="productType" value="single" className="sr-only" checked={productType === 'single'} onChange={() => setProductType('single')} />
                <span className={`font-bold ${productType === 'single' ? 'text-gray-900' : 'text-gray-500'}`}>Single Product</span>
              </label>
              <label className={`flex-1 flex items-center justify-center p-4 border rounded-xl cursor-pointer transition-all ${productType === 'variant' ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="productType" value="variant" className="sr-only" checked={productType === 'variant'} onChange={() => setProductType('variant')} />
                <span className={`font-bold ${productType === 'variant' ? 'text-gray-900' : 'text-gray-500'}`}>Product with Variants</span>
              </label>
            </div>
          </div>

          <ProductFeatures />

          <ProductSpecifications
            attributes={attributes}
            onCreateAttr={async (type, label, val) => {
              try {
                const { data } = await api.post('/admin/attribute/new', { type, value: val });
                if (setAttributes) setAttributes(prev => [...(prev || []), data.attribute]);
                methods.setValue(type === 'generalStyle' ? 'style' : type, val);
              } catch (err) {
                toast.error(err.response?.data?.message || `Failed to add ${label}`);
              }
            }}
            onEditAttr={async (id, newValue) => {
              try {
                const { data } = await api.put(`/admin/attribute/${id}`, { value: newValue });
                if (setAttributes) setAttributes(prev => (prev || []).map(a => a._id === id ? data.attribute : a));
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to update');
              }
            }}
            onDeleteAttr={async (id) => {
              try {
                await api.delete(`/admin/attribute/${id}`);
                if (setAttributes) setAttributes(prev => (prev || []).filter(a => a._id !== id));
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete');
              }
            }}
          />

          {productType === 'single' ? (
            <>
              <ParentMediaUploader />
              <RootSizeManager />
            </>
          ) : (
            <VariantManager 
            attributes={attributes}
            onCreateAttr={async (type, label, val) => {
              try {
                const { data } = await api.post('/admin/attribute/new', { type, value: val });
                if (setAttributes) setAttributes(prev => [...(prev || []), data.attribute]);
                if (type === 'generalStyle') methods.setValue('style', val);
              } catch (err) {
                toast.error(err.response?.data?.message || `Failed to add ${label}`);
              }
            }}
            onEditAttr={async (id, newValue) => {
              try {
                const { data } = await api.put(`/admin/attribute/${id}`, { value: newValue });
                if (setAttributes) setAttributes(prev => (prev || []).map(a => a._id === id ? data.attribute : a));
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to update');
              }
            }}
            onDeleteAttr={async (id) => {
              try {
                await api.delete(`/admin/attribute/${id}`);
                if (setAttributes) setAttributes(prev => (prev || []).filter(a => a._id !== id));
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to delete');
              }
            }}
          />
          )}

          <StickySaveBar onCancel={onClose} isSaving={isSaving} />
        </form>
      </FormProvider>
    </div>
  );
}