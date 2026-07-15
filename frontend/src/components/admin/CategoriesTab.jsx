import React, { useState } from "react";
import { 
   Plus, Trash2, Edit2, Image as ImageIcon, ChevronLeft, ChevronRight, Download, FolderTree, Tags
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

export function CategoriesTab({ categories, setCategories, globalSearch }) {
  const [activeView, setActiveView] = useState("main"); // 'main' or 'sub'
  const [formData, setFormData] = useState({
     name: "",
     parentCategory: "",
     image: "",
     description: ""
  });
  const [editingId, setEditingId] = useState(null);

  const filteredCategories = categories.filter(c => 
     c.name?.toLowerCase().includes(globalSearch?.toLowerCase() || "")
  );

  const rootCategories = filteredCategories.filter(c => !c.parentCategory);
  const subCategories = filteredCategories.filter(c => c.parentCategory);

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
          if (reader.readyState === 2) {
             setFormData(prev => ({ ...prev, image: reader.result }));
          }
      };
      reader.readAsDataURL(file);
  };

  const resetForm = () => {
      setFormData({ name: "", parentCategory: "", image: "", description: "" });
      setEditingId(null);
  };

  const handleEdit = (category) => {
      setEditingId(category._id);
      setFormData({
         name: category.name,
         parentCategory: category.parentCategory || "",
         image: category.image?.url || "",
         description: ""
      });
      setActiveView(category.parentCategory ? "sub" : "main");
  };

  const handleSave = async () => {
      if(!formData.name) {
        toast.error("Category name is required");
        return;
      }
      if (activeView === "sub" && !formData.parentCategory) {
        toast.error("Parent category is required for subcategories");
        return;
      }

     try {
       const payload = { name: formData.name };
       if (activeView === "sub" && formData.parentCategory) {
           payload.parentCategory = formData.parentCategory;
       }
       
       if (formData.image && formData.image.startsWith("data:image")) {
          payload.image = formData.image;
       }

       if (editingId) {
           const { data } = await api.put(`/admin/categories/${editingId}`, payload);
           setCategories(categories.map(c => c._id === editingId ? data.category : c));
           toast.success("Category updated successfully!");
       } else {
           const { data } = await api.post("/admin/categories", payload);
           setCategories([...categories, data.category]);
           toast.success("Category created!");
       }
       resetForm();
     } catch(error) { 
         toast.error(editingId ? "Failed to update category" : "Failed to add category"); 
     }
  };

  const handleDelete = async (id, isRoot) => {
     if (isRoot && !window.confirm("Are you sure? All subcategories under this category will ALSO be permanently deleted.")) return;
     if (!isRoot && !window.confirm("Are you sure you want to delete this subcategory?")) return;
     
     try {
       await api.delete(`/admin/categories/${id}`);
       if (isRoot) {
           setCategories(categories.filter(c => c._id !== id && c.parentCategory !== id));
       } else {
           setCategories(categories.filter(c => c._id !== id));
       }
       if (editingId === id) resetForm();
       toast.success(isRoot ? "Category and its subcategories deleted!" : "Deleted successfully!");
     } catch(e) { toast.error("Failed to delete category"); }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Taxonomy Manager</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage main categories and their nested subcategories separately.</p>
         </div>
      </div>

      {/* Internal Tabs Toggle */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl w-fit mb-8 shadow-sm">
        <button 
          onClick={() => { setActiveView("main"); resetForm(); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === "main" ? "bg-white text-emerald-600 shadow-[0_4px_15px_rgba(0,0,0,0.05)]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
        >
          <FolderTree className="w-4 h-4" />
          Main Categories
        </button>
        <button 
          onClick={() => { setActiveView("sub"); resetForm(); }}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeView === "sub" ? "bg-white text-emerald-600 shadow-[0_4px_15px_rgba(0,0,0,0.05)]" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"}`}
        >
          <Tags className="w-4 h-4" />
          Sub Categories
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* Left Sidebar Form */}
         <div className="w-full lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sticky top-24">
               <h2 className="text-xl font-black text-slate-800 mb-6">
                 {editingId ? `Edit ${activeView === "main" ? "Main Category" : "Sub Category"}` : `Add New ${activeView === "main" ? "Main Category" : "Sub Category"}`}
               </h2>
               
               <div className="space-y-6">
                  {activeView === "main" && (
                    <div>
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Thumbnail</label>
                       <div className="relative group">
                          <input type="file" id="catImg" accept="image/*" onChange={handleFileChange} className="hidden" />
                          <label htmlFor="catImg" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl h-40 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-colors cursor-pointer overflow-hidden relative">
                             {formData.image ? (
                                <>
                                  <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                  <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                     <span className="text-white text-sm font-bold bg-white/20 px-3 py-1.5 rounded-lg">Change Image</span>
                                  </div>
                                </>
                             ) : (
                                <>
                                   <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                                   <span className="text-xs text-slate-500 font-bold">Click to upload</span>
                                </>
                             )}
                          </label>
                       </div>
                    </div>
                  )}

                  <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Name</label>
                     <input 
                        type="text" 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                        placeholder={activeView === "main" ? "e.g. Outerwear" : "e.g. Apparel Outerwear"} 
                        className="w-full border border-slate-200 px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-700 shadow-sm transition-all placeholder-slate-400" 
                     />
                  </div>

                  {activeView === "sub" && (
                    <div>
                       <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Parent Category <span className="text-red-500">*</span></label>
                       <select 
                          value={formData.parentCategory} 
                          onChange={e => setFormData({ ...formData, parentCategory: e.target.value })} 
                          className="w-full border border-slate-200 px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-700 shadow-sm transition-all"
                       >
                           <option value="">Select Parent</option>
                           {rootCategories.map(c => (
                               <option key={c._id} value={c._id}>{c.name}</option>
                           ))}
                       </select>
                    </div>
                  )}

                  <div>
                     <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2">Description</label>
                     <textarea 
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Define the category..."
                        rows="3"
                        className="w-full border border-slate-200 px-4 py-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm font-medium text-slate-700 shadow-sm transition-all resize-none placeholder-slate-400"
                     ></textarea>
                  </div>

                  <div className="pt-4 flex gap-3">
                     {editingId && (
                        <button onClick={resetForm} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                           Cancel
                        </button>
                     )}
                     <button onClick={handleSave} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5">
                        {editingId ? "Update" : "Save"}
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Right Main Content */}
         <div className="flex-1 space-y-8 min-w-0">
            
            {activeView === "main" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-right-4 fade-in duration-300">
                 <div className="p-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Main Categories ({rootCategories.length})</h2>
                 </div>
                 
                 <div className="p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {rootCategories.map(cat => {
                       const subCount = subCategories.filter(s => s.parentCategory === cat._id).length;
                       return (
                          <div key={cat._id} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden group">
                             <div className="h-40 bg-slate-200 relative overflow-hidden">
                                {cat.image?.url ? (
                                   <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                   <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                      <ImageIcon className="w-10 h-10 text-slate-400/50" />
                                   </div>
                                )}
                             </div>
                             <div className="p-4">
                                 <div className="flex justify-between items-start">
                                    <div>
                                       <h3 className="font-black text-slate-800 text-base">{cat.name}</h3>
                                       <p className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-widest">{subCount} Subcategories</p>
                                    </div>
                                    <div className="flex gap-2 transition-opacity">
                                       <button onClick={() => handleEdit(cat)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm">
                                          <Edit2 className="w-4 h-4" />
                                       </button>
                                       <button onClick={() => handleDelete(cat._id, true)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm">
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                    </div>
                                 </div>
                             </div>
                          </div>
                       )
                    })}
                    {rootCategories.length === 0 && (
                       <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                             <FolderTree className="w-8 h-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-1">No Main Categories</h3>
                          <p className="text-sm text-slate-500">Add your first main category using the form.</p>
                       </div>
                    )}
                 </div>
              </div>
            )}

            {activeView === "sub" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in slide-in-from-left-4 fade-in duration-300">
                 <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-900">Sub Categories ({subCategories.length})</h2>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                       <thead>
                          <tr className="bg-slate-50 border-b border-slate-100">
                             <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Subcategory Name</th>
                             <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Parent</th>
                             <th className="py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100">
                          {subCategories.length > 0 ? subCategories.map(sub => {
                             const parent = rootCategories.find(c => c._id === sub.parentCategory);
                             return (
                                <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors group">
                                   <td className="py-4 px-6">
                                      <div className="flex items-center gap-4">
                                         {sub.image?.url ? (
                                             <img src={sub.image.url} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shadow-sm" alt={sub.name} />
                                         ) : (
                                             <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200">
                                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                             </div>
                                         )}
                                         <span className="font-bold text-slate-800 text-sm">{sub.name}</span>
                                      </div>
                                   </td>
                                   <td className="py-4 px-6">
                                       <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 uppercase tracking-widest border border-emerald-100">
                                          {parent?.name || "Unknown"}
                                       </span>
                                   </td>
                                   <td className="py-4 px-6 text-right">
                                       <div className="flex items-center justify-end gap-2 transition-opacity">
                                          <button onClick={() => handleEdit(sub)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-colors shadow-sm">
                                             <Edit2 className="w-4 h-4" />
                                          </button>
                                          <button onClick={() => handleDelete(sub._id, false)} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white border border-slate-200 text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors shadow-sm">
                                             <Trash2 className="w-4 h-4" />
                                          </button>
                                       </div>
                                   </td>
                                </tr>
                             )
                          }) : (
                             <tr>
                                <td colSpan="3" className="py-16 flex flex-col items-center justify-center text-center">
                                   <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                                      <Tags className="w-8 h-8 text-slate-400" />
                                   </div>
                                   <h3 className="text-lg font-bold text-slate-900 mb-1">No Sub Categories</h3>
                                   <p className="text-sm text-slate-500">Add your first sub category using the form.</p>
                                </td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
}
