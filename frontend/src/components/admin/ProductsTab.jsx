import { useState } from "react";
import { Search, Plus, Edit, Trash2, Image as ImageIcon, X, LayoutGrid, List, Tag, AlertCircle, Film, Package } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";
import { CreatableSelect } from "./CreatableSelect";
import NewProductForm from "./NewProductForm";

export function ProductsTab({ products, setProducts, categories, setCategories, sizes, setSizes, attributes = [], setAttributes, formatINR, globalSearch, setGlobalSearch }) {
  const [showProductForm, setShowProductForm] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'

  const [newSizeName, setNewSizeName] = useState("");
  const [isCreatingSize, setIsCreatingSize] = useState(false);
  
  // Filter States
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    status: "draft",
    category: "",
    seller: "Milaya",
    images: [],
    video: null,
    productType: "Bottoms",
    style: "",
    accessoriestyle: "",
    nosepinStyle: "",
    pendantStyle: "",
    bottomstyle: "",
    material: "",
    metalColor: "",
    purity: "",
    metalTypeColor: "",
    availableInStore: false,
    readyToShip: false,
    onSale: false,
    variants: [],
    hasSizes: false,
    moreDetails: ""
  });

  const handleCreateSize = async () => {
    if(!newSizeName.trim()) return;
    setIsCreatingSize(true);
    try {
      const { data } = await api.post("/admin/sizes", { name: newSizeName.trim() });
      setSizes([...(sizes || []), data.size]);
      setNewSizeName("");
      toast.success("Size created!");
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to create size");
    } finally {
      setIsCreatingSize(false);
    }
  };

  const handleCreateAttribute = async (type, label, value) => {
    if (!value || !value.trim()) return;
    try {
        const { data } = await api.post("/admin/attribute/new", { type, value: value.trim() });
        setAttributes([...attributes, data.attribute]);
        toast.success(`'${value.trim()}' added to ${label}!`);
        
        setProductForm(prev => ({...prev, [type]: value.trim()}));
    } catch (err) {
        toast.error(err.response?.data?.message || `Failed to add ${label}`);
    }
  };

  const handleUpdateAttribute = async (id, newValue) => {
    try {
        const { data } = await api.put(`/admin/attribute/${id}`, { value: newValue.trim() });
        setAttributes(attributes.map(a => a._id === id ? data.attribute : a));
        toast.success(`Updated successfully!`);
    } catch (err) {
        toast.error(err.response?.data?.message || `Failed to update`);
    }
  };

  const handleDeleteAttribute = async (id) => {
    try {
        await api.delete(`/admin/attribute/${id}`);
        setAttributes(attributes.filter(a => a._id !== id));
        toast.success(`Deleted successfully!`);
    } catch (err) {
        toast.error(err.response?.data?.message || `Failed to delete`);
    }
  };

  const handleCreateCategory = async (value) => {
    if (!value || !value.trim()) return;
    try {
        const { data } = await api.post("/admin/categories", { name: value.trim() });
        if(setCategories) setCategories([...categories, data.category]);
        toast.success(`Product Type created!`);
        setProductForm(prev => ({...prev, productType: value.trim(), category: data.category._id}));
    } catch (err) {
        toast.error(err.response?.data?.message || `Failed to create Product Type`);
    }
  };

  const handleUpdateCategory = async (id, newValue) => {
    try {
        const { data } = await api.put(`/admin/categories/${id}`, { name: newValue.trim() });
        if(setCategories) setCategories(categories.map(c => c._id === id ? data.category : c));
        toast.success(`Updated successfully!`);
    } catch (err) {
        toast.error(err.response?.data?.message || `Failed to update`);
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
        await api.delete(`/admin/categories/${id}`);
        if(setCategories) setCategories(categories.filter(c => c._id !== id));
        toast.success(`Deleted successfully!`);
    } catch (err) {
        toast.error(err.response?.data?.message || `Failed to delete`);
    }
  };

  const getProductStyleLabel = (type) => {
      if (!type) return "Style";
      if (type.endsWith('s') && ['Bottoms', 'Accessories', 'Pendants', 'Outerwear', 'Bracelets', 'Nosepins', 'Bangles'].includes(type)) {
          return `${type.slice(0, -1)} Style`;
      }
      return `${type} Style`;
  };

  const getProductStyleKey = (type) => {
      if (!type) return "";
      if (type.endsWith('s') && ['Bottoms', 'Accessories', 'Pendants', 'Outerwear', 'Bracelets', 'Nosepins', 'Bangles'].includes(type)) {
          return `${type.toLowerCase().slice(0, -1)}Style`;
      }
      return `${type.toLowerCase().replace(/\s+/g, '')}Style`;
  };



  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_W = 1200;
          const scale = img.width > MAX_W ? MAX_W / img.width : 1;
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.78));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleProductImagesChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // ⚡ Compress all images in parallel before storing
    const compressedArray = await Promise.all(files.map(compressImage));
    setProductForm(prev => ({ ...prev, images: [...prev.images, ...compressedArray] }));
    e.target.value = "";
  };

  const handleProductVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file.");
      return;
    }

    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.onloadedmetadata = () => {
      window.URL.revokeObjectURL(videoElement.src);
      if (videoElement.duration > 30) {
        toast.error("Video must be under 30 seconds.");
        e.target.value = "";
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          if (reader.readyState === 2) {
            setProductForm({ ...productForm, video: reader.result });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    videoElement.src = URL.createObjectURL(file);
  };
  const handleAddProduct = () => {
      setShowProductForm(true);
      setEditingProduct(null);
      setProductForm({ 
        name: "", description: "", price: 0, stock: 0, category: categories[0]?._id || "", seller: "Milaya", images: [], video: null,
        productType: "Bottoms", style: "", accessoriestyle: "", nosepinStyle: "", pendantStyle: "", bottomstyle: "", material: "", metalColor: "", purity: "", metalTypeColor: "", availableInStore: false, readyToShip: false, onSale: false, variants: [], hasSizes: false, moreDetails: "", status: "draft"
      });
  };
 
  const handleEditProduct = (product) => {
      setShowProductForm(true);
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category?._id || product.category || categories[0]?._id || "",
        seller: product.seller || "Milaya",
        images: product.images || [],
        video: product.video || null,
        productType: product.productType || "Bottoms",
        style: product.style || "",
        accessoriestyle: product.accessoriestyle || "",
        nosepinStyle: product.nosepinStyle || "",
        pendantStyle: product.pendantStyle || "",
        bottomstyle: product.bottomstyle || "",
        material: product.material || "",
        metalColor: product.metalColor || "",
        purity: product.purity || "",
        metalTypeColor: product.metalTypeColor || "",
        availableInStore: product.availableInStore || false,
        readyToShip: product.readyToShip || false,
        onSale: product.onSale || false,
        variants: product.variants || [],
        hasSizes: product.variants && product.variants.length > 0,
        moreDetails: product.moreDetails || "",
        status: product.status || "draft"
      });
  };

  const handleSaveProduct = async () => {
      if (!productForm.name || !productForm.price || !productForm.category) {
          toast.error("Please fill all required fields");
          return;
      }

      // ⚡ Show spinner immediately before any async work
      setIsSavingProduct(true);

      try {
          const payload = { ...productForm };

          if (productForm.images && productForm.images.length > 0) {
              payload.images = productForm.images;
          } else {
              payload.images = [];
          }

          if (productForm.video) {
              if (typeof productForm.video === 'string' && productForm.video.startsWith("data:video")) {
                  payload.video = productForm.video;
              } else {
                  delete payload.video; // Keep existing
              }
          } else {
              payload.video = null; // Explicit deletion
          }

          if (editingProduct) {
             const { data } = await api.put(`/admin/products/${editingProduct._id}`, payload);
             setProducts(products.map(p => p._id === editingProduct._id ? data.product : p));
             toast.success("Product updated successfully");
          } else {
             const { data } = await api.post(`/admin/products`, payload);
             setProducts([data.product, ...products]);
             toast.success("Product created successfully");
          }
          setShowProductForm(false);
      } catch (error) {
          const msg = error.response?.data?.message || "Failed to save product";
          toast.error(msg);
          console.error(error);
      } finally {
          setIsSavingProduct(false);
      }
  };


  const handleBulkStatusUpdate = async (status) => {
    if (!selectedProducts.length) return;
    if (!window.confirm(`Are you sure you want to change the status of ${selectedProducts.length} products to ${status}?`)) return;
    try {
      await api.patch("/admin/products/bulk-status", { productIds: selectedProducts, status });
      setProducts(products.map(p => selectedProducts.includes(p._id) ? { ...p, status } : p));
      setSelectedProducts([]);
      toast.success(`Updated ${selectedProducts.length} products to ${status}`);
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to update bulk status");
    }
  };

  const handleToggleStatus = async (product, newStatus) => {
      if (!window.confirm(`Change status of ${product.name} to ${newStatus}?`)) return;
      try {
          await api.put(`/admin/products/${product._id}`, { ...product, status: newStatus });
          setProducts(products.map(p => p._id === product._id ? { ...p, status: newStatus } : p));
          toast.success("Status updated");
      } catch(e) {
          toast.error("Status update failed");
      }
  };

  const handleDeleteProduct = async (id) => {
      if (!window.confirm("Are you sure you want to permanently delete this product? This action cannot be undone.")) return;
      try {
          await api.delete(`/admin/products/${id}`);
          setProducts(products.filter(p => p._id !== id));
          toast.success("Deleted");
      } catch(e) {
          toast.error("Delete failed");
      }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
      try {
          const { data } = await api.put(`/admin/products/${id}`, { status: newStatus });
          setProducts(products.map(p => p._id === id ? data.product : p));
          toast.success(`Product status updated to ${newStatus}`);
      } catch (error) {
          toast.error(error.response?.data?.message || "Failed to update status");
          console.error(error);
      }
  };
 
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(globalSearch?.toLowerCase() || "") || p._id?.toLowerCase().includes(globalSearch?.toLowerCase() || "");
    const matchesCategory = categoryFilter === "All" || p.category?._id === categoryFilter || p.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === "Draft") {
      matchesStatus = (p.status || "draft") === "draft";
    } else if (statusFilter === "Published") {
      matchesStatus = (p.status || "draft") === "published";
    } else if (statusFilter === "Out of Stock") {
      matchesStatus = p.stock === 0;
    } else if (statusFilter === "Low Stock") {
      matchesStatus = p.stock > 0 && p.stock <= 5;
    }
     
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
         <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Product Catalog</h1>
            <p className="text-[15px] font-medium text-gray-500 mt-2">Manage your inventory, pricing, and product visibility.</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
               onClick={handleAddProduct} 
               className="flex items-center gap-2.5 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl transition-all text-sm font-semibold shadow-sm hover:shadow-md active:scale-95"
            >
               <Plus className="w-4 h-4" />
               New Product
            </button>
         </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Products</p>
            <h3 className="text-[2.5rem] leading-none font-bold text-gray-900 tracking-tight">{products.length}</h3>
         </div>
         <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Low Stock Alerts</p>
            <h3 className="text-[2.5rem] leading-none font-bold text-yellow-500 tracking-tight">{products.filter(p => p.stock > 0 && p.stock <= 5).length}</h3>
         </div>
         <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/5 group-hover:bg-red-500/10 transition-colors"></div>
            <p className="text-red-500 text-xs font-bold uppercase tracking-widest mb-2 relative z-10">Out of Stock</p>
            <h3 className="text-[2.5rem] leading-none font-bold text-red-600 tracking-tight relative z-10">{products.filter(p => p.stock === 0).length}</h3>
         </div>
         <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Total Categories</p>
            <h3 className="text-[2.5rem] leading-none font-bold text-gray-900 tracking-tight">{categories.length}</h3>
         </div>
      </div>

      {showProductForm && (
        <NewProductForm 
          editingProduct={editingProduct} 
          onClose={() => setShowProductForm(false)} 
          products={products}
          setProducts={setProducts}
          categories={categories}
          setCategories={setCategories}
          attributes={attributes}
          setAttributes={setAttributes}
        />
      )}
      {!showProductForm && (
         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            {/* Filters Bar */}
            <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
               <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <select 
                     value={categoryFilter}
                     onChange={(e) => setCategoryFilter(e.target.value)}
                     className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all"
                  >
                     <option value="All">All Categories</option>
                     {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>

                  <select 
                     value={statusFilter}
                     onChange={(e) => setStatusFilter(e.target.value)}
                     className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 shadow-sm transition-all"
                  >
                     <option value="All">All Status</option>
                     <option value="Draft">Draft</option>
                     <option value="Published">Published</option>
                     <option value="Out of Stock">Out of Stock</option>
                     <option value="Low Stock">Low Stock</option>
                  </select>

                  
                  <div className="relative flex-1 md:w-64 min-w-[200px]">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input 
                        type="text"
                        value={globalSearch}
                        onChange={e => setGlobalSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 placeholder-gray-400 text-gray-900 shadow-sm transition-all font-medium"
                     />
                  </div>
               </div>
            </div>

            {/* Content Area */}
            <div className="p-8 bg-gray-50/30">
               {filteredProducts.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                           <div key={product._id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col">
                              {/* Image Section */}
                              <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 flex items-center justify-center">
                                 {product.images?.[0]?.url ? (
                                    <img 
                                       src={product.images[0].url} 
                                       alt={product.name} 
                                       className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                       <ImageIcon className="w-12 h-12 text-gray-300" />
                                    </div>
                                 )}
                                 <div className="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                                 
                                 {/* Status Tag */}
                                 <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {product.stock === 0 ? (
                                       <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">Out of Stock</span>
                                    ) : product.stock <= 5 ? (
                                       <span className="bg-yellow-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">Low Stock</span>
                                    ) : (
                                       <span className="bg-gray-900/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">In Stock</span>
                                    )}
                                    {(product.status || "draft") === "published" ? (
                                       <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">Published</span>
                                    ) : (
                                       <span className="bg-gray-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">Draft</span>
                                    )}
                                 </div>

                                 {/* Hover Actions */}
                                 <div className="absolute top-4 right-4 flex flex-col gap-2.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                    <button onClick={() => handleEditProduct(product)} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/95 backdrop-blur text-gray-700 hover:bg-white hover:text-gray-900 transition-colors shadow-lg hover:scale-110">
                                       <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product._id)} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/95 backdrop-blur text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors shadow-lg hover:scale-110">
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              </div>
                              
                              {/* Content Section */}
                              <div className="p-5 flex-1 flex flex-col bg-white">
                                 <h4 className="font-bold text-gray-900 text-[15px] mb-1.5 line-clamp-2 leading-tight" title={product.name}>{product.name}</h4>
                                 <div className="mb-4">
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest font-mono">SKU: {product._id.substring(product._id.length - 8)}</p>
                                 </div>
                                 
                                 {product.variants && product.variants.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-5">
                                       {product.variants.slice(0,3).map(variant => (
                                          <span key={variant.size} className="text-[11px] font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                                             {variant.size}
                                          </span>
                                       ))}
                                       {product.variants.length > 3 && (
                                          <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
                                             +{product.variants.length - 3}
                                          </span>
                                       )}
                                    </div>
                                 )}
                                 
                                 <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="font-black text-gray-900 text-lg">{formatINR(product.price)}</span>
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{product.stock} left</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
               ) : (
                  <div className="py-20 flex flex-col items-center justify-center text-center">
                     <div className="w-20 h-20 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center mb-6">
                        <Package className="w-10 h-10 text-gray-300" />
                     </div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                     <p className="text-sm font-medium text-gray-500 max-w-sm">Try adjusting your filters, searching for a different keyword, or add a new product.</p>
                     
                     <button 
                        onClick={handleAddProduct} 
                        className="mt-8 flex items-center gap-2 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl transition-all text-sm font-semibold shadow-sm hover:shadow-md"
                     >
                        <Plus className="w-4 h-4" />
                        Add New Product
                     </button>
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}
