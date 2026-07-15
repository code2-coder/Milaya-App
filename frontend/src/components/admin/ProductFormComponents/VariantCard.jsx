import React, { useState, useRef, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown, Search, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import VariantImageUploader from './VariantImageUploader';
import NestedSizeManager from './NestedSizeManager';

const STANDARD_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Green', hex: '#00FF00' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Premium', hex: '#FFD700' },
  { name: 'Rose Premium', hex: '#B76E79' },
  { name: 'Platinum', hex: '#E5E4E2' },
  { name: 'Champagne', hex: '#F7E7CE' },
  { name: 'Emerald', hex: '#50C878' },
  { name: 'Ruby', hex: '#E0115F' },
  { name: 'Sapphire', hex: '#0F52BA' },
  { name: 'Amethyst', hex: '#9966CC' },
  { name: 'Turquoise', hex: '#40E0D0' },
  { name: 'Pearl', hex: '#EAE0C8' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Midnight Blue', hex: '#191970' },
  { name: 'Charcoal', hex: '#36454F' }
];

function ColorSearchSelect({ index, field, register, setValue, watch, attributes = [], onCreateAttr, onEditAttr, onDeleteAttr }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  // Edit / Create States
  const [isCreating, setIsCreating] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  
  const [editingId, setEditingId] = useState(null);
  const [editColorName, setEditColorName] = useState('');
  const [editColorHex, setEditColorHex] = useState('#000000');

  const currentValue = watch(`variants.${index}.colorHex`) || field.colorHex;

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsCreating(false);
        setEditingId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const customColors = (attributes || [])
    .filter(a => a.type === 'colorHex')
    .map(a => {
      const parts = a.value.split('|');
      const hex = parts[0];
      const name = parts.length > 1 ? parts[1] : hex;
      return { _id: a._id, name, hex, isCustom: true };
    });

  const ALL_COLORS = [...STANDARD_COLORS, ...customColors];

  const filteredColors = ALL_COLORS.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.hex.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newColorName.trim() || !newColorHex) return;
    if (onCreateAttr) {
      await onCreateAttr('colorHex', 'Color', `${newColorHex}|${newColorName.trim()}`);
    }
    setIsCreating(false);
    setNewColorName('');
    setNewColorHex('#000000');
  };

  const handleEditSave = async (id) => {
    if (!editColorName.trim() || !editColorHex) return;
    if (onEditAttr) {
      await onEditAttr(id, `${editColorHex}|${editColorName.trim()}`);
    }
    setEditingId(null);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this custom color?")) {
      if (onDeleteAttr) await onDeleteAttr(id);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <input type="hidden" {...register(`variants.${index}.colorHex`)} defaultValue={field.colorHex} />
      
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white cursor-pointer focus:ring-1 focus:ring-gray-900 transition-all"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: currentValue }}></div>
          <span className="font-medium text-gray-700">{currentValue ? (ALL_COLORS.find(c => c.hex.toLowerCase() === currentValue.toLowerCase())?.name || currentValue) : "Select Color"}</span>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ maxHeight: '300px' }}>
          <div className="p-2 border-b border-gray-50 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search color..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              />
            </div>
            <button 
              type="button" 
              onClick={() => setIsCreating(true)}
              className="p-1.5 bg-gray-900 text-white rounded hover:bg-black transition-colors"
              title="Create new color"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
            {isCreating ? (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 m-1">
                <h4 className="text-xs font-bold text-gray-700 mb-2">Create Custom Color</h4>
                <div className="space-y-2">
                  <input type="text" placeholder="Color Name" value={newColorName} onChange={e => setNewColorName(e.target.value)} className="w-full text-sm px-2 py-1.5 border border-gray-300 rounded outline-none focus:border-gray-900" />
                  <div className="flex items-center gap-2">
                    <input type="color" value={newColorHex} onChange={e => setNewColorHex(e.target.value)} className="w-8 h-8 p-0.5 border border-gray-300 rounded cursor-pointer" />
                    <input type="text" value={newColorHex} onChange={e => setNewColorHex(e.target.value)} className="flex-1 text-sm px-2 py-1.5 border border-gray-300 rounded outline-none focus:border-gray-900 uppercase font-mono" />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button type="button" onClick={() => setIsCreating(false)} className="px-2 py-1 text-xs text-gray-600 bg-gray-200 rounded hover:bg-gray-300 font-semibold">Cancel</button>
                    <button type="button" onClick={handleCreate} className="px-2 py-1 text-xs text-white bg-gray-900 rounded hover:bg-black font-semibold">Save</button>
                  </div>
                </div>
              </div>
            ) : filteredColors.length > 0 ? (
              filteredColors.map(color => (
                <div key={color.isCustom ? color._id : color.hex}>
                  {editingId === color._id && color.isCustom ? (
                     <div className="p-2 bg-gray-50 rounded-lg border border-gray-200 m-1 flex flex-col gap-2" onClick={e => e.stopPropagation()}>
                        <input type="text" placeholder="Color Name" value={editColorName} onChange={e => setEditColorName(e.target.value)} className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded outline-none focus:border-gray-900" />
                        <div className="flex items-center gap-2">
                          <input type="color" value={editColorHex} onChange={e => setEditColorHex(e.target.value)} className="w-6 h-6 p-0 border border-gray-300 rounded cursor-pointer" />
                          <input type="text" value={editColorHex} onChange={e => setEditColorHex(e.target.value)} className="flex-1 text-xs px-2 py-1.5 border border-gray-300 rounded outline-none focus:border-gray-900 uppercase font-mono" />
                        </div>
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => setEditingId(null)} className="p-1 text-gray-500 bg-gray-200 rounded hover:bg-gray-300"><X className="w-3 h-3" /></button>
                          <button type="button" onClick={() => handleEditSave(color._id)} className="p-1 text-white bg-gray-900 rounded hover:bg-black"><Check className="w-3 h-3" /></button>
                        </div>
                     </div>
                  ) : (
                    <div
                      onClick={() => {
                        setValue(`variants.${index}.colorHex`, color.hex, { shouldDirty: true });
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="w-4 h-4 rounded border border-gray-200 shrink-0" style={{ backgroundColor: color.hex }}></div>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">{color.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                        {color.isCustom ? (
                          <>
                            <button type="button" onClick={(e) => { e.stopPropagation(); setEditColorName(color.name); setEditColorHex(color.hex); setEditingId(color._id); }} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-white rounded transition-colors" title="Edit">
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button type="button" onClick={(e) => handleDelete(color._id, e)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-colors" title="Delete">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 font-mono pr-1">{color.hex}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-2 py-3 text-center text-sm text-gray-500">
                No colors found. Use '+' to add one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VariantCard({ index, field = {}, attributes, onCreateAttr, onEditAttr, onDeleteAttr }) {
  const { register, setValue, watch, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-gray-100">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Variant / Color Name *</label>
          <input {...register(`variants.${index}.variantName`, { required: true })} defaultValue={field.variantName} placeholder="e.g. Midnight Black" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-gray-900 outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Color Hex</label>
          <ColorSearchSelect 
            index={index} 
            field={field} 
            register={register} 
            setValue={setValue} 
            watch={watch} 
            attributes={attributes}
            onCreateAttr={onCreateAttr}
            onEditAttr={onEditAttr}
            onDeleteAttr={onDeleteAttr}
          />
        </div>
      </div>

      <div>
        <VariantImageUploader index={index} />
      </div>

      <NestedSizeManager variantIndex={index} />
    </div>
  );
}