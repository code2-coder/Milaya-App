import { useState } from "react";
import { Plus, Trash2, Image as ImageIcon, Link as LinkIcon, Edit2, X, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

export function BannersTab({ banners, setBanners, globalSearch }) {
  const [showBannerForm, setShowBannerForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isHoveringDrop, setIsHoveringDrop] = useState(false);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
  });

  const handleFileChange = (e) => {
      const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
          if (reader.readyState === 2) {
              setBannerForm(prev => ({...prev, image: reader.result}));
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

  const handleAddBanner = () => {
    setShowBannerForm(true);
    setEditingBanner(null);
    setBannerForm({ title: "", subtitle: "", image: "", link: "" });
  };

  const handleEditBanner = (banner) => {
    setShowBannerForm(true);
    setEditingBanner(banner);
    setBannerForm({
      title: banner.title,
      subtitle: banner.subtitle || "",
      image: banner.image || "",
      link: banner.link || "",
    });
  };

  const handleSaveBanner = async () => {
    if (!bannerForm.title || !bannerForm.image) {
      toast.error("Title and Image are required");
      return;
    }

    try {
      if (editingBanner) {
        const { data } = await api.put(`/admin/banner/${editingBanner._id}`, bannerForm);
        setBanners(banners.map((b) => (b._id === editingBanner._id ? data.banner : b)));
        toast.success("Banner updated successfully");
      } else {
        const { data } = await api.post(`/admin/banner`, bannerForm);
        setBanners([...banners, data.banner]);
        toast.success("Banner added successfully");
      }
      setShowBannerForm(false);
      setBannerForm({ title: "", subtitle: "", image: "", link: "" });
    } catch (error) {
       toast.error("Failed to save banner");
       console.error(error);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm("Are you sure you want to delete this marketing banner?")) return;
    try {
        await api.delete(`/admin/banner/${bannerId}`);
        setBanners(banners.filter((b) => b._id !== bannerId));
        toast.success("Banner deleted successfully");
    } catch (error) {
        toast.error("Failed to delete banner");
    }
  };

  const filteredBanners = banners.filter(b => 
     b.title?.toLowerCase().includes(globalSearch?.toLowerCase() || "") ||
     (b.subtitle && b.subtitle?.toLowerCase().includes(globalSearch?.toLowerCase() || ""))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Marketing Assets</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Design and control storefront banners.</p>
         </div>
         <div className="flex items-center gap-3">
            <button 
               onClick={handleAddBanner} 
               className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl transition-all text-sm font-bold shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5"
            >
               <Plus className="w-4 h-4" />
               Create Campaign
            </button>
         </div>
      </div>

      {/* Banner Form Panel */}
      {showBannerForm && (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300 relative z-10 mb-8">
          <div className="p-6 flex justify-between items-center border-b border-slate-100 bg-slate-50/50">
             <h3 className="text-xl font-black text-slate-800 flex items-center">
               <ImageIcon className="w-5 h-5 mr-3 text-emerald-500" />
               {editingBanner ? "Edit Marketing Asset" : "Launch New Campaign"}
             </h3>
             <button onClick={() => setShowBannerForm(false)} className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
               {/* Image Upload Area (Takes up 3/5 on large screens) */}
               <div className="lg:col-span-3">
                  <label className="block mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    {editingBanner ? "Campaign Visual" : "Upload Visual *"}
                  </label>
                  <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative w-full aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center transition-all duration-300 overflow-hidden group
                      ${isHoveringDrop ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-emerald-300'}
                    `}
                  >
                     {bannerForm.image ? (
                        <>
                           <img src={bannerForm.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                           <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                              <div className="bg-white text-slate-900 font-bold px-4 py-2.5 rounded-xl shadow-sm flex items-center space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-sm">
                                 <Edit2 className="w-4 h-4 text-emerald-600" />
                                 <span>Replace Image</span>
                              </div>
                           </div>
                        </>
                     ) : (
                        <div className="flex flex-col items-center pointer-events-none">
                           <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mb-4">
                              <UploadCloud className={`w-8 h-8 transition-colors duration-300 ${isHoveringDrop ? 'text-emerald-500' : 'text-slate-400'}`} />
                           </div>
                           <h4 className="text-base font-black text-slate-800 mb-1">Drag & Drop your banner here</h4>
                           <p className="text-xs font-medium text-slate-500 mb-4">High-resolution PNG, JPG, or WebP</p>
                           <span className="bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-slate-600 shadow-sm pointer-events-auto group-hover:border-emerald-300 group-hover:text-emerald-600 transition-colors text-sm">
                               Browse Files
                           </span>
                        </div>
                     )}
                     <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                  </div>
               </div>

               {/* Form Details Area (Takes up 2/5 on large screens) */}
               <div className="lg:col-span-2 flex flex-col justify-center space-y-5">
                   <div>
                     <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Campaign Title *</label>
                     <input type="text" value={bannerForm.title} onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })} placeholder="E.g. Summer Collection" className="w-full border border-slate-200/80 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm" />
                   </div>
                   
                   <div>
                     <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Subtitle (Optional)</label>
                     <input type="text" value={bannerForm.subtitle} onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })} placeholder="E.g. Up to 50% Off" className="w-full border border-slate-200/80 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm" />
                   </div>
                   
                   <div>
                     <label className="block mb-2 text-xs font-bold text-slate-500 uppercase tracking-[0.1em]">Target Link URL</label>
                     <div className="relative group">
                       <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                         <LinkIcon className="h-4 w-4 text-slate-400" />
                       </div>
                       <input type="text" value={bannerForm.link} onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })} placeholder="/shop?category=Bottoms" className="w-full pl-10 border border-slate-200/80 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm font-medium shadow-sm" />
                     </div>
                   </div>
                   
                   <div className="pt-6 border-t border-slate-100 flex space-x-4">
                     <button onClick={() => setShowBannerForm(false)} className="flex-1 px-5 py-3 bg-white border border-slate-200/80 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                       Cancel
                     </button>
                     <button onClick={handleSaveBanner} className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl text-sm font-bold transition-all shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 flex items-center justify-center">
                       {editingBanner ? "Update Asset" : "Publish Asset"}
                     </button>
                   </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBanners.map((banner) => (
          <div key={banner._id} className="group relative bg-white border border-slate-200/80 rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
             <div 
               className="relative w-full aspect-[21/9] bg-slate-100 cursor-pointer overflow-hidden"
               onClick={() => handleEditBanner(banner)}
             >
               <img src={banner.image} alt={banner.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
               
               {/* Overlay Content */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent flex flex-col justify-end p-8 pointer-events-none">
                 <h3 className="text-2xl font-black text-white mb-2 drop-shadow-sm tracking-tight">{banner.title}</h3>
                 {banner.subtitle && <p className="text-emerald-200 font-bold text-sm drop-shadow-sm tracking-wide">{banner.subtitle}</p>}
               </div>
               
               {/* Actions */}
               <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button onClick={(e) => { e.stopPropagation(); handleEditBanner(banner); }} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 flex items-center justify-center hover:text-emerald-600 shadow-sm transition-colors border border-white/20" title="Edit">
                     <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteBanner(banner._id); }} className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 flex items-center justify-center hover:text-red-600 shadow-sm transition-colors border border-white/20" title="Delete">
                     <Trash2 className="w-4 h-4" />
                  </button>
               </div>
            </div>
            
            <div className="p-4 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600 truncate max-w-[250px]">{banner.link || "No Target URL"}</span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
            </div>
          </div>
        ))}
      </div>

      {filteredBanners.length === 0 && !showBannerForm && (
        <div className="bg-white rounded-3xl border border-slate-200/80 border-dashed p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-slate-50 border border-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
             <ImageIcon className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No Active Campaigns</h3>
          <p className="text-sm font-medium text-slate-500 mb-8 max-w-md mx-auto">Upload visually striking banners to engage your customers and drive sales.</p>
          <button
             onClick={handleAddBanner}
             className="px-6 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
             <Plus className="w-4 h-4" /> Launch Campaign
          </button>
        </div>
      )}
    </div>
  );
}
