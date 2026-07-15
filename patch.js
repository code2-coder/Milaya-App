const fs = require('fs');
const file = 'frontend/src/components/admin/ProductsTab.jsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add state for selectedProducts
content = content.replace(
  '  const [statusFilter, setStatusFilter] = useState("All");',
  '  const [statusFilter, setStatusFilter] = useState("All");\n  const [selectedProducts, setSelectedProducts] = useState([]);'
);

// 2. Add handleBulkStatusUpdate and handleToggleStatus
const deleteFunc = '  const handleDeleteProduct = async (id) => {';
const newFuncs = `  const handleBulkStatusUpdate = async (status) => {
    if (!selectedProducts.length) return;
    if (!window.confirm(\`Are you sure you want to change the status of \${selectedProducts.length} products to \${status}?\`)) return;
    try {
      await api.patch("/admin/products/bulk-status", { productIds: selectedProducts, status });
      setProducts(products.map(p => selectedProducts.includes(p._id) ? { ...p, status } : p));
      setSelectedProducts([]);
      toast.success(\`Updated \${selectedProducts.length} products to \${status}\`);
    } catch(err) {
      toast.error(err.response?.data?.message || "Failed to update bulk status");
    }
  };

  const handleToggleStatus = async (product, newStatus) => {
      if (!window.confirm(\`Change status of \${product.name} to \${newStatus}?\`)) return;
      try {
          await api.put(\`/admin/products/\${product._id}\`, { ...product, status: newStatus });
          setProducts(products.map(p => p._id === product._id ? { ...p, status: newStatus } : p));
          toast.success("Status updated");
      } catch(e) {
          toast.error("Status update failed");
      }
  };\n\n`;
content = content.replace(deleteFunc, newFuncs + deleteFunc);

// 3. Update filteredProducts
const filterOld = `    if (statusFilter === "In Stock") matchesStatus = p.stock > 5;
    else if (statusFilter === "Low Stock") matchesStatus = p.stock > 0 && p.stock <= 5;
    else if (statusFilter === "Out of Stock") matchesStatus = p.stock === 0;`;
const filterNew = `    if (statusFilter === "Draft") matchesStatus = p.status === "draft";
    else if (statusFilter === "Published") matchesStatus = p.status === "published" || !p.status;`;
content = content.replace(filterOld, filterNew);

// 4. Update status filter dropdown options
const selectOld = `<option value="All">All Status</option>
                     <option value="In Stock">In Stock</option>
                     <option value="Low Stock">Low Stock</option>
                     <option value="Out of Stock">Out of Stock</option>`;
const selectNew = `<option value="All">All Products</option>
                     <option value="Draft">Draft</option>
                     <option value="Published">Published</option>`;
content = content.replace(selectOld, selectNew);

// 5. Add bulk actions bar and checkbox
const contentAreaOld = `            {/* Content Area */}
            <div className="p-8 bg-gray-50/30">
               {filteredProducts.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                           <div key={product._id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col">`;
const contentAreaNew = `            {/* Bulk Actions Bar */}
            {selectedProducts.length > 0 && (
               <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <span className="text-sm font-semibold text-indigo-900">{selectedProducts.length} product(s) selected</span>
                     <button 
                        onClick={() => setSelectedProducts([])}
                        className="text-xs text-indigo-500 hover:text-indigo-700 underline"
                     >
                        Clear Selection
                     </button>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => handleBulkStatusUpdate("draft")} className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-colors shadow-sm">Mark as Draft</button>
                     <button onClick={() => handleBulkStatusUpdate("published")} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">Mark as Published</button>
                  </div>
               </div>
            )}

            {/* Content Area */}
            <div className="p-8 bg-gray-50/30">
               {filteredProducts.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredProducts.map(product => (
                           <div key={product._id} className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group flex flex-col relative">
                              {/* Selection Checkbox */}
                              <div className="absolute top-3 right-3 z-20">
                                 <input
                                    type="checkbox"
                                    checked={selectedProducts.includes(product._id)}
                                    onChange={(e) => {
                                       if (e.target.checked) {
                                          setSelectedProducts([...selectedProducts, product._id]);
                                       } else {
                                          setSelectedProducts(selectedProducts.filter(id => id !== product._id));
                                       }
                                    }}
                                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                 />
                              </div>`;
content = content.replace(contentAreaOld, contentAreaNew);

// 6. Add status tag
const statusTagOld = `                                 {/* Status Tag */}
                                 <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {product.stock === 0 ? (
                                       <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">Out of Stock</span>
                                    ) : product.stock <= 5 ? (
                                       <span className="bg-yellow-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">Low Stock</span>
                                    ) : (
                                       <span className="bg-gray-900/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">In Stock</span>
                                    )}
                                 </div>`;
const statusTagNew = `                                 {/* Status Tag */}
                                 <div className="absolute top-4 left-4 flex flex-col gap-2">
                                    {product.stock === 0 ? (
                                       <span className="bg-red-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">Out of Stock</span>
                                    ) : product.stock <= 5 ? (
                                       <span className="bg-yellow-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">Low Stock</span>
                                    ) : (
                                       <span className="bg-gray-900/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">In Stock</span>
                                    )}
                                    {product.status === "draft" ? (
                                       <span className="bg-yellow-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">🟡 Draft</span>
                                    ) : (
                                       <span className="bg-green-500/90 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg shadow-sm">🟢 Published</span>
                                    )}
                                 </div>`;
content = content.replace(statusTagOld, statusTagNew);

// 7. Add quick toggle dropdown
const contentSectionOld = `                              {/* Content Section */}
                              <div className="p-5 flex-1 flex flex-col bg-white">
                                 <h4 className="font-bold text-gray-900 text-[15px] mb-1.5 line-clamp-2 leading-tight" title={product.name}>{product.name}</h4>`;
const contentSectionNew = `                              {/* Content Section */}
                              <div className="p-5 flex-1 flex flex-col bg-white">
                                 <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <h4 className="font-bold text-gray-900 text-[15px] line-clamp-2 leading-tight flex-1" title={product.name}>{product.name}</h4>
                                    <select 
                                       value={product.status || 'published'}
                                       onChange={(e) => handleToggleStatus(product, e.target.value)}
                                       className={\`text-xs font-bold rounded-lg px-2 py-1 border \${product.status === 'draft' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-green-50 text-green-700 border-green-200'} cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 \${product.status === 'draft' ? 'focus:ring-yellow-500' : 'focus:ring-green-500'}\`}
                                    >
                                       <option value="draft">Draft</option>
                                       <option value="published">Published</option>
                                    </select>
                                 </div>`;
content = content.replace(contentSectionOld, contentSectionNew);

fs.writeFileSync(file, content, 'utf-8');
console.log('Successfully patched ProductsTab.jsx');
