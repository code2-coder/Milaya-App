import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function CreatableSelect({ 
  value, 
  onChange, 
  options = [], 
  onCreate,
  onEdit,
  onDelete,
  placeholder = "Select...", 
  label = "Option"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter(opt => 
    opt.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if search term perfectly matches an existing option (case-insensitive)
  const isExactMatch = options.some(opt => 
    opt.value.toLowerCase() === searchTerm.toLowerCase().trim()
  );

  const handleSelect = (selectedValue) => {
    onChange(selectedValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCreate = async () => {
    if (!searchTerm.trim()) return;
    await onCreate(searchTerm.trim());
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleEditClick = (e, opt) => {
    e.stopPropagation();
    setEditingId(opt._id);
    setEditValue(opt.value);
  };

  const handleSaveEdit = async (e, opt) => {
    e.stopPropagation();
    if (editValue.trim() && editValue.trim() !== opt.value) {
      await onEdit(opt._id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleDeleteClick = async (e, opt) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete '${opt.value}'?`)) {
      await onDelete(opt._id);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Select Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-gray-200 px-3 py-2.5 rounded-xl text-sm bg-gray-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 outline-none transition-all font-medium text-gray-900"
      >
        <span className={value ? "text-gray-900" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden"
          >
            {/* Search / Create Input */}
            <div className="p-2 border-b border-gray-50 bg-gray-50/50">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder={`Search or add new ${label.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8934E]/20 focus:border-[#B8934E] transition-all"
                />
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
              {/* "Create New" Option */}
              {searchTerm.trim() !== '' && !isExactMatch && (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-[#B8934E] hover:bg-[#B8934E]/5 rounded-lg transition-colors group"
                >
                  <span className="flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add "{searchTerm.trim()}"
                  </span>
                </button>
              )}

              {/* Existing Options */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <div
                    key={opt._id}
                    className={`relative w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors group cursor-pointer ${
                      value === opt.value
                        ? 'bg-gray-50 text-gray-900 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                    }`}
                    onClick={() => {
                       if (editingId !== opt._id) handleSelect(opt.value);
                    }}
                  >
                    {editingId === opt._id ? (
                      <div className="flex w-full items-center gap-2" onClick={e => e.stopPropagation()}>
                        <input 
                           autoFocus
                           type="text" 
                           value={editValue} 
                           onChange={e => setEditValue(e.target.value)} 
                           onKeyDown={e => {
                              if (e.key === 'Enter') handleSaveEdit(e, opt);
                              if (e.key === 'Escape') setEditingId(null);
                           }}
                           className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-[#B8934E]"
                        />
                        <button onClick={(e) => handleSaveEdit(e, opt)} className="p-1.5 text-white bg-[#B8934E] rounded hover:bg-[#a18144]">
                           <Check className="w-3 h-3" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="p-1.5 text-gray-500 bg-gray-100 rounded hover:bg-gray-200">
                           <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="flex-1 truncate pr-4">{opt.value}</span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 relative" onClick={e => e.stopPropagation()}>
                          {(onEdit || onDelete) && (
                            <>
                              {onEdit && (
                                <button type="button" onClick={(e) => handleEditClick(e, opt)} className="p-1.5 text-gray-400 hover:text-[#B8934E] hover:bg-white rounded transition-colors" title="Edit">
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {onDelete && (
                                <button type="button" onClick={(e) => handleDeleteClick(e, opt)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white rounded transition-colors" title="Delete">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Check mark for selected */}
                        {value === opt.value && editingId !== opt._id && (
                          <div className="pl-2 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity absolute right-3 pointer-events-none">
                            <Check className="w-4 h-4 text-[#B8934E]" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              ) : (
                searchTerm.trim() === '' && (
                  <div className="px-3 py-4 text-sm text-center text-gray-400 font-medium">
                    No options found. Type to add a new one.
                  </div>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
