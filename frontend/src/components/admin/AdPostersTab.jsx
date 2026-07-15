import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Edit2, X, UploadCloud, Tag } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

export function AdPostersTab({ adPosters, setAdPosters, globalSearch }) {
  const [showPosterForm, setShowPosterForm] = useState(false);
  const [editingPoster, setEditingPoster] = useState(null);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  const [posterForm, setPosterForm] = useState({
    title: "",
    type: "offer",
    image: "",
    link: "",
  });

  const handleFileChange = (e) => {
      const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
          if (reader.readyState === 2) {
              setPosterForm(prev => ({...prev, image: reader.result}));
          }
      };
      reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHoveringDrop(false);
    handleFileChange(e);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsHoveringDrop(true);
  };

  const handleDragLeave = () => {
    setIsHoveringDrop(false);
  };

  const handleAddPoster = () => {
    setShowPosterForm(true);
    setEditingPoster(null);
    setPosterForm({ title: "", type: "offer", image: "", link: "" });
  };

  const handleEditPoster = (poster) => {
    setShowPosterForm(true);
    setEditingPoster(poster);
    setPosterForm({
      title: poster.title || "",
      type: poster.type || "offer",
      image: poster.image || "",
      link: poster.link || "",
    });
  };

  const handleSavePoster = async () => {
    if (!posterForm.image) {
      toast.error("Image is required");
      return;
    }

    try {
      if (editingPoster) {
        const { data } = await api.put(`/admin/ad-poster/${editingPoster._id}`, posterForm);
        setAdPosters(adPosters.map((p) => (p._id === editingPoster._id ? data.adPoster : p)));
        toast.success("Ad Poster updated successfully");
      } else {
        const { data } = await api.post(`/admin/ad-poster`, posterForm);
        setAdPosters([...adPosters, data.adPoster]);
        toast.success("Ad Poster added successfully");
      }
      setShowPosterForm(false);
      setPosterForm({ title: "", type: "offer", image: "", link: "" });
    } catch (error) {
       toast.error("Failed to save ad poster");
       console.error(error);
    }
  };

  const handleDeletePoster = async (posterId) => {
    if (!window.confirm("Are you sure you want to delete this ad poster?")) return;
    try {
        await api.delete(`/admin/ad-poster/${posterId}`);
        setAdPosters(adPosters.filter((p) => p._id !== posterId));
        toast.success("Ad Poster deleted successfully");
    } catch (error) {
        toast.error("Failed to delete ad poster");
    }
  };

  const filteredPosters = adPosters.filter(p => 
     (p.title && p.title?.toLowerCase().includes(globalSearch?.toLowerCase() || "")) ||
     p.type?.toLowerCase().includes(globalSearch?.toLowerCase() || "")
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ad Posters</h1>
            <p className="text-sm text-slate-500 mt-1">Manage promotional posters for offers, discounts, and new arrivals.</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
               onClick={handleAddPoster} 
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold shadow-sm shadow-indigo-600/20"
            >
               <Plus className="w-4 h-4" />
               Create Ad Poster
            </button>
         </div>
      </div>

      {/* Form Panel */}
      {showPosterForm && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 relative z-10 mb-8">
          <div className="p-6 flex justify-between items-center border-b border-slate-100">
             <h3 className="text-xl font-bold text-slate-900 flex items-center">
               <ImageIcon className="w-5 h-5 mr-2 text-indigo-500" />
               {editingPoster ? "Edit Ad Poster" : "Create New Ad Poster"}
             </h3>
             <button onClick={() => setShowPosterForm(false)} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
               {/* Image Upload Area */}
               <div className="lg:col-span-3">
                  <label className="block mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {editingPoster ? "Poster Visual" : "Upload Visual *"}
                  </label>
                  <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative w-full aspect-[4/3] sm:aspect-video border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 overflow-hidden group
                      ${isHoveringDrop ? 'border-indigo-500 bg-indigo-50/50 scale-[1.02]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300'}
                    `}
                  >
                     {posterForm.image ? (
                        <>
                           <img src={posterForm.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                           <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                              <div className="bg-white text-slate-900 font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-sm">
                                 <Edit2 className="w-4 h-4 text-indigo-600" />
                                 <span>Replace Image</span>
                              </div>
                           </div>
                        </>
                     ) : (
                        <div className="flex flex-col items-center pointer-events-none">
                           <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mb-4">
                              <UploadCloud className={`w-8 h-8 transition-colors duration-300 ${isHoveringDrop ? 'text-indigo-500' : 'text-slate-400'}`} />
                           </div>
                           <h4 className="text-base font-semibold text-slate-700 mb-1">Drag & Drop your poster here</h4>
                           <p className="text-xs font-medium text-slate-500 mb-4">High-resolution PNG, JPG, or WebP</p>
                           <span className="bg-white border border-slate-200 px-4 py-2 rounded-lg font-semibold text-slate-600 shadow-sm pointer-events-auto group-hover:border-indigo-300 group-hover:text-indigo-600 transition-colors text-sm">
                              Browse Files
                           </span>
                        </div>
                     )}
                     <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  </div>
               </div>

               {/* Form Details Area */}
               <div className="lg:col-span-2 flex flex-col justify-center space-y-5">
                  <div>
                    <label className="block mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Poster Title (Optional)</label>
                    <input type="text" value={posterForm.title} onChange={(e) => setPosterForm({ ...posterForm, title: e.target.value })} placeholder="E.g. Diwali Sale" className="w-full border border-slate-200 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm" />
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Poster Type *</label>
                    <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-4 w-4 text-slate-400" />
                       </div>
                       <select value={posterForm.type} onChange={(e) => setPosterForm({ ...posterForm, type: e.target.value })} className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm appearance-none">
                           <option value="offer">Special Offer</option>
                           <option value="discount">Discount</option>
                           <option value="new_arrival">New Arrival</option>
                       </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Link URL (Optional)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LinkIcon className="h-4 w-4 text-slate-400" />
                      </div>
                      <input type="text" value={posterForm.link} onChange={(e) => setPosterForm({ ...posterForm, link: e.target.value })} placeholder="/shop?category=Outerwear" className="w-full pl-9 border border-slate-200 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm" />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 flex space-x-3">
                    <button onClick={() => setShowPosterForm(false)} className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                      Cancel
                    </button>
                    <button onClick={handleSavePoster} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 flex items-center justify-center">
                      {editingPoster ? "Update Poster" : "Publish Poster"}
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Posters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosters.map((poster) => (
          <div key={poster._id} className="group relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
            <div 
              className="relative w-full aspect-square md:aspect-[4/3] bg-slate-100 cursor-pointer overflow-hidden"
              onClick={() => handleEditPoster(poster)}
            >
              <img src={poster.image} alt={poster.title || "Ad Poster"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              
              {/* Type Badge */}
              <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold shadow-sm ${
                     poster.type === 'offer' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                     poster.type === 'discount' ? 'bg-red-100 text-red-700 border border-red-200' :
                     'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                     {poster.type.replace('_', ' ').toUpperCase()}
                  </span>
              </div>
              
              {/* Actions */}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button onClick={(e) => { e.stopPropagation(); handleEditPoster(poster); }} className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur text-slate-700 flex items-center justify-center hover:text-indigo-600 shadow-sm transition-colors" title="Edit">
                    <Edit2 className="w-4 h-4" />
                 </button>
                 <button onClick={(e) => { e.stopPropagation(); handleDeletePoster(poster._id); }} className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur text-slate-700 flex items-center justify-center hover:text-red-600 shadow-sm transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
            
            <div className="p-4 flex flex-col gap-2 border-t border-slate-100">
              {poster.title ? (
                 <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{poster.title}</h4>
              ) : (
                 <h4 className="font-semibold text-slate-400 text-sm italic">No Title</h4>
              )}
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 truncate">{poster.link || "No Target URL"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPosters.length === 0 && !showPosterForm && (
        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
             <ImageIcon className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No Ad Posters Found</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">Upload promotional posters to showcase your offers and new arrivals.</p>
          <button
             onClick={handleAddPoster}
             className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-semibold hover:bg-indigo-100 transition-colors inline-flex items-center gap-2"
          >
             <Plus className="w-4 h-4" /> Create Poster
          </button>
        </div>
      )}
    </div>
  );
}
