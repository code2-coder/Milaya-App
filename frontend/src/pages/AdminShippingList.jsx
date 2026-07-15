import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router";
import api from "../api/axios";
import { toast } from "sonner";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { ShipmentStatusBadge, formatDate, formatDateTime, exportToCSV, SHIPMENT_STATUSES } from "../components/shipping/shippingUtils";
import { useAuth } from "../context/AuthContext";
import {
  Package, Truck, Clock, CheckCircle2, XCircle, RotateCcw, Search, FilterX,
  Plus, Download, Trash2, RefreshCw, Eye, Pencil, Copy, Printer, ChevronDown,
  MapPin, ArrowUpDown,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

const CHART_COLORS = ["#1e293b", "#B8934E", "#059669", "#2563eb", "#d97706", "#7c3aed", "#0891b2", "#be123c"];

const STAT_CARDS = [
  { key: "totalShipments", label: "Total Shipments", icon: Package, filter: null },
  { key: "pendingDispatch", label: "Pending Dispatch", icon: Clock, filter: "Shipment Created" },
  { key: "packed", label: "Packed", icon: Package, filter: "Packed" },
  { key: "readyForPickup", label: "Ready for Pickup", icon: Truck, filter: "Ready for Pickup" },
  { key: "dispatched", label: "Dispatched", icon: Truck, filter: "Dispatched" },
  { key: "inTransit", label: "In Transit", icon: Truck, filter: "In Transit" },
  { key: "outForDelivery", label: "Out for Delivery", icon: MapPin, filter: "Out for Delivery" },
  { key: "delivered", label: "Delivered", icon: CheckCircle2, filter: "Delivered" },
  { key: "returned", label: "Returned", icon: RotateCcw, filter: "Returned" },
  { key: "cancelled", label: "Cancelled", icon: XCircle, filter: "Cancelled" },
];

export const AdminShippingList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courierFilter, setCourierFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stateFilter, setStateFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkCourier, setBulkCourier] = useState("");
  const [statusModal, setStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusRemark, setStatusRemark] = useState("");

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      if (courierFilter) params.set("courier", courierFilter);
      if (paymentFilter) params.set("paymentType", paymentFilter);
      if (dateFrom) params.set("dateFrom", dateFrom);
      if (dateTo) params.set("dateTo", dateTo);
      if (stateFilter) params.set("state", stateFilter);
      if (cityFilter) params.set("city", cityFilter);
      params.set("sort", sortBy);

      const [shipRes, courierRes] = await Promise.all([
        api.get(`/admin/shipments?${params}`),
        api.get("/admin/couriers"),
      ]);
      setShipments(shipRes.data.shipments || []);
      setAnalytics(shipRes.data.analytics);
      setCharts(shipRes.data.charts);
      setCouriers(courierRes.data.couriers || []);
    } catch {
      toast.error("Failed to fetch shipping data");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter, courierFilter, paymentFilter, dateFrom, dateTo, stateFilter, cityFilter, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchData, searchQuery ? 400 : 0);
    return () => clearTimeout(timer);
  }, [fetchData, searchQuery]);

  const toggleSelect = (id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === shipments.length ? [] : shipments.map((s) => s._id));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Archive this shipment record?")) return;
    try {
      await api.delete(`/admin/shipments/${id}`);
      toast.success("Shipment archived");
      fetchData();
    } catch {
      toast.error("Failed to archive shipment");
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const { data } = await api.post(`/admin/shipments/${id}/duplicate`);
      toast.success("Shipment duplicated");
      navigate(`/admin/shipping/${data.shipment._id}`);
    } catch {
      toast.error("Failed to duplicate shipment");
    }
  };

  const handleBulkAction = async (action) => {
    if (!selected.length) return toast.error("No shipments selected");
    try {
      const payload = { ids: selected, action };
      if (action === "updateStatus") payload.status = bulkStatus;
      if (action === "changeCourier") payload.courierProvider = bulkCourier;
      if (action === "delete" && !window.confirm(`Archive ${selected.length} shipments?`)) return;

      await api.post("/admin/shipments/bulk", payload);
      toast.success("Bulk action completed");
      setSelected([]);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Bulk action failed");
    }
  };

  const handleStatusUpdate = async () => {
    if (!statusModal || !newStatus) return;
    try {
      await api.patch(`/admin/shipments/${statusModal}/status`, {
        status: newStatus,
        remark: statusRemark,
      });
      toast.success("Status updated");
      setStatusModal(null);
      setNewStatus("");
      setStatusRemark("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleExport = () => exportToCSV(shipments);

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
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-8 sticky top-0 z-20 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Shipping Management</h2>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/couriers"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Truck className="w-4 h-4" /> Couriers
            </Link>
            {isAdmin && (
              <Link
                to="/admin/shipping/create"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800"
              >
                <Plus className="w-4 h-4" /> Create Shipment
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {STAT_CARDS.map((stat) => {
              const Icon = stat.icon;
              const value = analytics?.[stat.key] ?? 0;
              const isActive = statusFilter === (stat.filter || "");
              return (
                <button
                  key={stat.key}
                  onClick={() => setStatusFilter(stat.filter || "")}
                  className={`bg-white p-4 rounded-2xl border text-left transition-all ${
                    isActive ? "border-gray-900 shadow-md scale-[1.02]" : "border-gray-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  <Icon className="w-5 h-5 text-gray-500 mb-2" />
                  <p className="text-2xl font-black text-gray-900">{value}</p>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-1">{stat.label}</p>
                </button>
              );
            })}
          </div>

          {/* Charts */}
          {charts && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Daily Shipments</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={charts.daily}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#1e293b" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Monthly Shipments</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={charts.monthly}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#B8934E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Courier-wise Shipments</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={charts.courierWise} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={100} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#059669" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Delivery Status Distribution</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={charts.statusDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, percent }) => `${name.substring(0, 12)}${name.length > 12 ? "…" : ""} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {charts.statusDistribution.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-gray-900">
                Shipment Records
                <span className="ml-2 bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-sm">{shipments.length}</span>
              </h3>
              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                <div className="relative flex-1 min-w-[200px] lg:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search ID, order, customer, tracking..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2.5 outline-none"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="dispatch">Dispatch Date</option>
                  <option value="delivery">Delivery Date</option>
                </select>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <FilterX className="w-4 h-4" /> Filters
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
                </button>
                {isAdmin && (
                  <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    <Download className="w-4 h-4" /> Export
                  </button>
                )}
                <button onClick={fetchData} className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50">
                  <RefreshCw className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-gray-100">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2">
                  <option value="">All Statuses</option>
                  {SHIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={courierFilter} onChange={(e) => setCourierFilter(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2">
                  <option value="">All Couriers</option>
                  {couriers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2">
                  <option value="">All Payment Types</option>
                  <option value="Prepaid">Prepaid</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2" placeholder="From" />
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2" placeholder="To" />
                <input type="text" value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} placeholder="State" className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2" />
                <input type="text" value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} placeholder="City" className="bg-gray-50 border border-gray-200 text-sm rounded-xl px-3 py-2" />
                <button
                  onClick={() => { setStatusFilter(""); setCourierFilter(""); setPaymentFilter(""); setDateFrom(""); setDateTo(""); setStateFilter(""); setCityFilter(""); setSearchQuery(""); }}
                  className="text-sm text-red-600 font-semibold hover:text-red-700"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Bulk Actions */}
            {selected.length > 0 && isAdmin && (
              <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-sm font-semibold text-gray-700">{selected.length} selected</span>
                <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="text-sm rounded-lg border border-gray-200 px-3 py-1.5">
                  <option value="">Update Status...</option>
                  {SHIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <button onClick={() => handleBulkAction("updateStatus")} disabled={!bulkStatus} className="text-sm px-3 py-1.5 rounded-lg bg-gray-900 text-white disabled:opacity-50">Apply Status</button>
                <select value={bulkCourier} onChange={(e) => setBulkCourier(e.target.value)} className="text-sm rounded-lg border border-gray-200 px-3 py-1.5">
                  <option value="">Change Courier...</option>
                  {couriers.filter((c) => c.isActive).map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
                <button onClick={() => handleBulkAction("changeCourier")} disabled={!bulkCourier} className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white disabled:opacity-50">Apply Courier</button>
                <button onClick={() => handleBulkAction("delete")} className="text-sm px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Archive
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {isAdmin && (
                      <th className="px-4 py-3 text-left">
                        <input type="checkbox" checked={selected.length === shipments.length && shipments.length > 0} onChange={toggleSelectAll} className="rounded" />
                      </th>
                    )}
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Shipment ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Order ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Customer</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Courier</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Tracking</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Payment</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Dispatch</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Est. Delivery</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 11 : 10} className="px-4 py-12 text-center text-gray-500">
                        No shipment records found. {isAdmin && <Link to="/admin/shipping/create" className="text-gray-900 font-semibold underline">Create one</Link>}
                      </td>
                    </tr>
                  ) : (
                    shipments.map((s) => (
                      <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        {isAdmin && (
                          <td className="px-4 py-3">
                            <input type="checkbox" checked={selected.includes(s._id)} onChange={() => toggleSelect(s._id)} className="rounded" />
                          </td>
                        )}
                        <td className="px-4 py-3 font-mono text-xs font-semibold text-gray-900">{s.shipmentId}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">{String(s.order?._id || s.order).slice(-8).toUpperCase()}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{s.customerName}</p>
                          <p className="text-xs text-gray-500">{s.customerPhone}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{s.courierName || "—"}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-mono">{s.trackingNumber || "—"}</p>
                          {s.awbNumber && <p className="text-xs text-gray-400">AWB: {s.awbNumber}</p>}
                        </td>
                        <td className="px-4 py-3"><ShipmentStatusBadge status={s.status} /></td>
                        <td className="px-4 py-3 text-gray-700">{s.paymentType}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(s.dispatchDate)}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(s.estimatedDeliveryDate)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button onClick={() => navigate(`/admin/shipping/${s._id}`)} title="View" className="p-1.5 rounded-lg hover:bg-gray-100"><Eye className="w-4 h-4 text-gray-600" /></button>
                            {isAdmin && (
                              <>
                                <button onClick={() => navigate(`/admin/shipping/${s._id}/edit`)} title="Edit" className="p-1.5 rounded-lg hover:bg-gray-100"><Pencil className="w-4 h-4 text-gray-600" /></button>
                                <button onClick={() => { setStatusModal(s._id); setNewStatus(s.status); }} title="Update Status" className="p-1.5 rounded-lg hover:bg-gray-100"><ArrowUpDown className="w-4 h-4 text-gray-600" /></button>
                                <button onClick={() => navigate(`/admin/shipping/${s._id}/label`)} title="Print Label" className="p-1.5 rounded-lg hover:bg-gray-100"><Printer className="w-4 h-4 text-gray-600" /></button>
                                <button onClick={() => handleDuplicate(s._id)} title="Duplicate" className="p-1.5 rounded-lg hover:bg-gray-100"><Copy className="w-4 h-4 text-gray-600" /></button>
                                <button onClick={() => handleDelete(s._id)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-500" /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {/* Spacer to provide 300px vertical scroll room below the table */}
          <div style={{ height: "300px" }} aria-hidden="true" />
        </main>
      </div>

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Update Shipment Status</h3>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm">
              {SHIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <textarea
              value={statusRemark}
              onChange={(e) => setStatusRemark(e.target.value)}
              placeholder="Remark (optional)"
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setStatusModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</button>
              <button onClick={handleStatusUpdate} className="px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShippingList;
