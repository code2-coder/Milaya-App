import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import api from "../api/axios";
import { toast } from "sonner";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { ArrowLeft, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Truck } from "lucide-react";

export const AdminCouriers = () => {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", contactPerson: "", phoneNumber: "", email: "", website: "" });

  const fetchCouriers = async () => {
    try {
      const { data } = await api.get("/admin/couriers");
      setCouriers(data.couriers || []);
    } catch {
      toast.error("Failed to fetch couriers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCouriers(); }, []);

  const resetForm = () => {
    setForm({ name: "", contactPerson: "", phoneNumber: "", email: "", website: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Courier name is required");
    try {
      if (editingId) {
        await api.put(`/admin/couriers/${editingId}`, form);
        toast.success("Courier updated");
      } else {
        await api.post("/admin/couriers", form);
        toast.success("Courier added");
      }
      resetForm();
      fetchCouriers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save courier");
    }
  };

  const handleEdit = (courier) => {
    setForm({
      name: courier.name,
      contactPerson: courier.contactPerson || "",
      phoneNumber: courier.phoneNumber || "",
      email: courier.email || "",
      website: courier.website || "",
    });
    setEditingId(courier._id);
    setShowForm(true);
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/admin/couriers/${id}/toggle`);
      fetchCouriers();
      toast.success("Courier status updated");
    } catch {
      toast.error("Failed to toggle courier");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this courier provider?")) return;
    try {
      await api.delete(`/admin/couriers/${id}`);
      toast.success("Courier deleted");
      fetchCouriers();
    } catch {
      toast.error("Failed to delete courier");
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900/20";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex font-sans">
      <AdminSidebar activeTab="shipping" setActiveTab={() => {}} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 bg-[#F8FAFC]">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Link to="/admin/shipping" className="p-2 rounded-xl hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
            <h2 className="text-xl font-bold text-gray-900">Courier Management</h2>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" /> Add Courier
          </button>
        </header>

        <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-8 space-y-6">
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                {editingId ? "Edit Courier" : "Add New Courier"}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Courier Name *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required /></div>
                <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Contact Person</label>
                  <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Phone Number</label>
                  <input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} /></div>
                <div className="md:col-span-2"><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Website</label>
                  <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className={inputClass} /></div>
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={resetForm} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold">{editingId ? "Update" : "Add Courier"}</button>
              </div>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Courier Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Phone</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {couriers.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                    <Truck className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No couriers added yet
                  </td></tr>
                ) : couriers.map((c) => (
                  <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                    <td className="px-4 py-3 text-gray-600">{c.contactPerson || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.phoneNumber || "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{c.email || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Edit"><Pencil className="w-4 h-4 text-gray-600" /></button>
                        <button onClick={() => handleToggle(c._id)} className="p-1.5 rounded-lg hover:bg-gray-100" title="Toggle">
                          {c.isActive ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                        </button>
                        <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg hover:bg-red-50" title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCouriers;
