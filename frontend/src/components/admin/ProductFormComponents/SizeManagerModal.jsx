import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import api from "../../../api/axios";
import { toast } from 'sonner';

export default function SizeManagerModal({ isOpen, onClose }) {
  const [sizes, setSizes] = useState([]);
  const [newSize, setNewSize] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchSizes();
  }, [isOpen]);

  const fetchSizes = async () => {
    try {
      const { data } = await api.get('/sizes');
      setSizes(data.sizes);
    } catch (err) {
      toast.error("Failed to load sizes");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newSize.trim()) return;
    setLoading(true);
    try {
      await api.post('/admin/sizes', { name: newSize.trim() });
      setNewSize('');
      fetchSizes();
      toast.success("Size added");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add size");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this size?")) return;
    try {
      await api.delete(`/admin/sizes/${id}`);
      fetchSizes();
      toast.success("Size deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Manage Global Sizes</h3>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6">
          <form onSubmit={handleAdd} className="flex gap-2 mb-6">
            <input 
              value={newSize} 
              onChange={e => setNewSize(e.target.value)} 
              placeholder="e.g. XL, 10, Free Size" 
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gray-900" 
            />
            <button type="submit" disabled={loading} className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-colors disabled:opacity-50 flex items-center gap-1">
              <Plus className="w-4 h-4"/> Add
            </button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
            {sizes.map(size => (
              <div key={size._id} className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl group hover:border-gray-300 transition-colors">
                <span className="font-bold text-gray-800 text-sm">{size.name}</span>
                <button onClick={() => handleDelete(size._id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            ))}
            {sizes.length === 0 && <p className="text-center text-sm text-gray-500 py-4">No sizes found.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}