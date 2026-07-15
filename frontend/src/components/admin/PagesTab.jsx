import React, { useState, useEffect } from "react";
import { 
  FileText, Plus, Trash2, Save, ArrowUp, ArrowDown, HelpCircle, AlertCircle, Edit2, Globe, Eye,
  Truck, ShieldCheck, Clock, RefreshCcw, HandPlatter
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

// Map icon stbottoms to their actual components
const iconMap = {
  Truck,
  ShieldCheck,
  Clock,
  RefreshCcw,
  HandPlatter,
  AlertCircle
};

export function PagesTab() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [pageTitle, setPageTitle] = useState("");
  const [pageSubtitle, setPageSubtitle] = useState("");
  const [highlights, setHighlights] = useState([]);
  const [sections, setSections] = useState([]);

  // Fetch all pages at startup
  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get("/pages");
      const uniquePages = [];
      const seenSlugs = new Set();
      if (data.pages) {
        data.pages.forEach(p => {
          if (!seenSlugs.has(p.slug)) {
            seenSlugs.add(p.slug);
            uniquePages.push(p);
          }
        });
      }
      setPages(uniquePages);
      // Auto-select first page if available
      if (uniquePages.length > 0) {
        handleSelectPage(uniquePages[0].slug);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load page configurations");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Fetch single page detail on select
  const handleSelectPage = async (slug) => {
    setIsLoading(true);
    try {
      const { data } = await api.get(`/pages/${slug}`);
      const page = data.page;
      setSelectedPage(page);
      setPageTitle(page.title);
      setPageSubtitle(page.subtitle || "");
      setHighlights(page.highlights || []);
      setSections(page.sections || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch page details");
    } finally {
      setIsLoading(false);
    }
  };

  // Add/Delete highlight block
  const handleAddHighlight = () => {
    setHighlights(prev => [
      ...prev,
      { title: "New Highlight", content: "Enter description here...", iconName: "Truck" }
    ]);
  };

  const handleUpdateHighlight = (index, field, value) => {
    setHighlights(prev => prev.map((item, idx) => 
      idx === index ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteHighlight = (index) => {
    setHighlights(prev => prev.filter((_, idx) => idx !== index));
  };

  // Add/Delete/Move section block
  const handleAddSection = () => {
    setSections(prev => [
      ...prev,
      { title: "New Section Title", content: "Enter paragraph content here..." }
    ]);
  };

  const handleUpdateSection = (index, field, value) => {
    setSections(prev => prev.map((item, idx) => 
      idx === index ? { ...item, [field]: value } : item
    ));
  };

  const handleDeleteSection = (index) => {
    setSections(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleMoveSection = (index, direction) => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === sections.length - 1) return;

    const swapIdx = direction === "up" ? index - 1 : index + 1;
    setSections(prev => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[swapIdx];
      updated[swapIdx] = temp;
      return updated;
    });
  };

  // Save changes to backend
  const handleSavePage = async () => {
    if (!selectedPage) return;
    if (!pageTitle.trim()) {
      toast.error("Page Title cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: pageTitle,
        subtitle: pageSubtitle,
        highlights,
        sections,
      };

      const { data } = await api.put(`/pages/${selectedPage.slug}`, payload);
      toast.success(`${pageTitle} updated successfully!`);
      
      // Update local pages list titles if changed
      setPages(prev => prev.map(p => 
        p.slug === selectedPage.slug ? { ...p, title: pageTitle } : p
      ));
      setSelectedPage(data.page);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update page content");
    } finally {
      setIsSaving(false);
    }
  };

  // Helper mapping for friendly page titles/paths
  const getPageLink = (slug) => {
    if (slug === "shipping-policy") return "/shipping-policy";
    if (slug === "return-policy") return "/return-policy";
    if (slug === "privacy") return "/privacy";
    if (slug === "terms") return "/terms";
    return `/${slug}`;
  };

  return (
    <div className="space-y-8 select-none">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 border-b border-stone-100 pb-6">
        <div>
          <h2 className="text-2xl font-serif text-[#0A0204] tracking-tight">Manage Terms & Conditions</h2>
          <p className="text-xs text-stone-500 font-light mt-1">Configure user agreements, shipping timelines, returns policies, and privacy terms.</p>
        </div>
        {selectedPage && (
          <a 
            href={getPageLink(selectedPage.slug)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[#B8934E]/30 rounded-xl text-xs font-semibold text-[#B8934E] hover:bg-[#B8934E]/5 active:scale-[0.98] transition-all bg-white shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            View Live Store Page
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Page Selector List */}
        <div className="lg:col-span-4 space-y-5">
          <h3 className="text-xs font-bold text-stone-500 uppercase tracking-widest pl-1">Page Directory</h3>
          
          {isLoading && pages.length === 0 ? (
            <div className="p-12 text-center bg-white border border-stone-100 rounded-3xl shadow-sm">
              <div className="w-6 h-6 border-2 border-stone-200 border-t-[#B8934E] rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-xs text-stone-400 font-light">Loading directories...</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pages.map((p) => {
                const isSelected = selectedPage?.slug === p.slug;
                return (
                  <button
                    key={p.slug}
                    onClick={() => handleSelectPage(p.slug)}
                    className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-300 flex items-center justify-between group transform ${
                      isSelected 
                        ? "bg-gradient-to-r from-stone-900 via-stone-850 to-stone-800 border-stone-900 text-white shadow-md border-l-4 border-l-[#B8934E] translate-x-1" 
                        : "bg-white border-stone-100/80 text-stone-700 hover:bg-stone-50 hover:border-stone-200 hover:translate-x-1 shadow-sm"
                    }`}
                  >
                    <div>
                      <h4 className="font-serif text-sm tracking-wide transition-colors group-hover:text-[#B8934E]">{p.title}</h4>
                      <p className={`text-[9px] font-mono tracking-wider mt-1.5 uppercase ${isSelected ? "text-stone-400" : "text-stone-400"}`}>
                        /{p.slug}
                      </p>
                    </div>
                    <FileText className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isSelected ? "text-[#B8934E]" : "text-stone-300"}`} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Quick Notice Panel */}
          <div className="bg-[#FAF8F5] border border-[#B8934E]/15 rounded-2xl p-5 flex gap-4 text-stone-600 shadow-sm">
            <AlertCircle className="w-5 h-5 text-[#B8934E]/60 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <h5 className="text-xs font-bold text-stone-850">Dynamic Publishing</h5>
              <p className="text-[11px] font-light leading-relaxed text-stone-500">
                Updating content here modifies live storefront rules instantly. Ensure terms comply with your shipping and payment gateway partners.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Page Form Editor */}
        <div className="lg:col-span-8">
          {isLoading && !selectedPage ? (
            <div className="bg-white border border-stone-100 rounded-3xl p-16 text-center shadow-sm">
              <div className="w-8 h-8 border-2 border-stone-200 border-t-[#B8934E] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-stone-500 font-light animate-pulse">Loading content schema...</p>
            </div>
          ) : selectedPage ? (
            <div className="bg-white border border-stone-100 rounded-3xl shadow-sm overflow-hidden flex flex-col transition-all duration-300 hover:shadow-md">
              
              {/* Form Body */}
              <div className="p-6 md:p-8 space-y-8 flex-1">
                
                {/* Section Header */}
                <div className="border-b border-stone-100 pb-4">
                  <span className="text-[10px] font-bold tracking-widest text-[#B8934E] uppercase">Page Metadata</span>
                  <h3 className="text-lg font-serif text-[#0A0204] mt-0.5">Edit Header Details</h3>
                </div>

                {/* Meta Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 focus-within:text-[#B8934E] transition-colors">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Page Header Title</label>
                    <input 
                      type="text"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="e.g. Shipping Policy"
                      className="w-full bg-stone-50/50 hover:bg-stone-50/80 border border-stone-200 focus:border-[#B8934E] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#B8934E]/10 transition-all text-stone-900 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Page Slug (Read-Only)</label>
                    <input 
                      type="text"
                      value={selectedPage.slug}
                      disabled
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm cursor-not-allowed text-stone-400 font-mono"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5 focus-within:text-[#B8934E] transition-colors">
                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Page Subtitle / Last Updated Description</label>
                    <input 
                      type="text"
                      value={pageSubtitle}
                      onChange={(e) => setPageSubtitle(e.target.value)}
                      placeholder="e.g. Everything you need to know about our secure delivery process"
                      className="w-full bg-stone-50/50 hover:bg-stone-50/80 border border-stone-200 focus:border-[#B8934E] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-4 focus:ring-[#B8934E]/10 transition-all text-stone-900 font-light"
                    />
                  </div>
                </div>

                {/* Highlights (Cards) - Conditionally render for shipping and return policy */}
                {selectedPage.slug.includes("policy") && (
                  <div className="space-y-6 pt-6 border-t border-stone-100">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                      <div>
                        <span className="text-[10px] font-bold tracking-widest text-[#B8934E] uppercase">Visual Blocks</span>
                        <h4 className="text-base font-serif text-[#0A0204]">Highlight Grid Cards</h4>
                      </div>
                      <button
                        onClick={handleAddHighlight}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B8934E]/5 hover:bg-[#B8934E]/10 text-xs font-semibold text-[#B8934E] rounded-xl transition-all active:scale-[0.97]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Card
                      </button>
                    </div>

                    {highlights.length === 0 ? (
                      <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                        <p className="text-xs text-stone-400 font-light">No highlight cards configured for this page.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {highlights.map((h, index) => {
                          const IconComponent = iconMap[h.iconName] || FileText;
                          return (
                            <div key={index} className="p-5 border border-stone-200/80 bg-stone-50/40 rounded-2xl shadow-sm space-y-4 hover:border-stone-300 transition-colors">
                              <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-1">
                                <div className="flex items-center gap-2">
                                  <div className="bg-[#B8934E]/10 p-1.5 rounded-lg text-[#B8934E]">
                                    <IconComponent className="w-3.5 h-3.5" />
                                  </div>
                                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                    Card #{index + 1}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteHighlight(index)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-650 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Delete Card"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="space-y-3">
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-wider text-stone-450">Card Icon</label>
                                  <select
                                    value={h.iconName || ""}
                                    onChange={(e) => handleUpdateHighlight(index, "iconName", e.target.value)}
                                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#B8934E]/10"
                                  >
                                    <option value="Truck">Truck (Delivery)</option>
                                    <option value="ShieldCheck">Shield Check (Insurance)</option>
                                    <option value="Clock">Clock (Time)</option>
                                    <option value="RefreshCcw">Refresh (Returns)</option>
                                    <option value="HandPlatter">Hand (Lifetime Exchange)</option>
                                    <option value="AlertCircle">Alert (Alerts)</option>
                                  </select>
                                </div>
                                
                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-wider text-stone-450">Card Title</label>
                                  <input
                                    type="text"
                                    value={h.title}
                                    onChange={(e) => handleUpdateHighlight(index, "title", e.target.value)}
                                    placeholder="e.g. Free Delivery"
                                    className="w-full bg-white border border-stone-200 focus:border-[#B8934E] rounded-xl px-3 py-1.5 text-xs focus:outline-none text-stone-900 font-bold"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] font-bold uppercase tracking-wider text-stone-450">Card Description</label>
                                  <textarea
                                    value={h.content}
                                    onChange={(e) => handleUpdateHighlight(index, "content", e.target.value)}
                                    placeholder="e.g. Free shipping on orders over ₹10k"
                                    rows="2"
                                    className="w-full bg-white border border-stone-200 focus:border-[#B8934E] rounded-xl px-3 py-1.5 text-xs focus:outline-none text-stone-600 font-light resize-none"
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Body Sections (Paragraphs / Accordions) */}
                <div className="space-y-6 pt-6 border-t border-stone-100">
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#B8934E] uppercase">Narrative Content</span>
                      <h4 className="text-base font-serif text-[#0A0204]">Policy Sections</h4>
                    </div>
                    <button
                      onClick={handleAddSection}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B8934E]/5 hover:bg-[#B8934E]/10 text-xs font-semibold text-[#B8934E] rounded-xl transition-all active:scale-[0.97]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Section
                    </button>
                  </div>

                  {sections.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                      <p className="text-xs text-stone-400 font-light">No policy sections configured. Add one to display paragraphs on this page.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {sections.map((s, index) => (
                        <div key={index} className="p-5 border border-stone-200 bg-white rounded-2xl shadow-sm space-y-4 hover:border-stone-300 transition-colors">
                          
                          <div className="flex items-center justify-between border-b border-stone-100 pb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="bg-[#B8934E]/15 text-[#B8934E] px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                                Section #{index + 1}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleMoveSection(index, "up")}
                                disabled={index === 0}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-20 transition-all"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleMoveSection(index, "down")}
                                disabled={index === sections.length - 1}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 hover:bg-stone-50 disabled:opacity-20 transition-all"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <div className="w-px h-3.5 bg-stone-200 mx-1"></div>
                              <button
                                onClick={() => handleDeleteSection(index)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                title="Delete Section"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="space-y-1.5 focus-within:text-[#B8934E] transition-colors">
                              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Section Header Title</label>
                              <input
                                type="text"
                                value={s.title}
                                onChange={(e) => handleUpdateSection(index, "title", e.target.value)}
                                placeholder="e.g. 1. Terms of Service"
                                className="w-full bg-stone-50/50 hover:bg-stone-50/80 border border-stone-200 focus:border-[#B8934E] rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-[#B8934E]/10 transition-all text-stone-950"
                              />
                            </div>

                            <div className="space-y-1.5 focus-within:text-[#B8934E] transition-colors">
                              <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Paragraph Content</label>
                              <textarea
                                value={s.content}
                                onChange={(e) => handleUpdateSection(index, "content", e.target.value)}
                                placeholder="Enter paragraph policy text here..."
                                rows="5"
                                className="w-full bg-stone-50/50 hover:bg-stone-50/80 border border-stone-200 focus:border-[#B8934E] rounded-xl px-4 py-2.5 text-xs font-light leading-relaxed focus:outline-none focus:ring-4 focus:ring-[#B8934E]/10 transition-all text-stone-600 resize-y"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Action Footer */}
              <div className="border-t border-stone-100 px-6 py-5 bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-[11px] text-stone-400 font-light">
                  Last saved: {selectedPage.updatedAt ? new Date(selectedPage.updatedAt).toLocaleString() : "Never"}
                </span>
                <button
                  onClick={handleSavePage}
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#B8934E] hover:bg-[#A37F3F] active:scale-[0.98] disabled:bg-stone-300 rounded-xl text-xs font-bold text-white tracking-widest uppercase transition-all shadow-md hover:shadow-lg hover:shadow-[#B8934E]/20"
                >
                  {isSaving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Save Page Changes
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-stone-100 rounded-3xl p-16 text-center shadow-sm">
              <FileText className="w-10 h-10 text-stone-200 mx-auto mb-3" />
              <p className="text-sm text-stone-500 font-light">No page configuration selected.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
