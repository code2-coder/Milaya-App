import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router";
import api from "../api/axios";
import { toast } from "sonner";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { ShipmentStatusBadge, formatDate, formatDateTime, SHIPMENT_STATUSES } from "../components/shipping/shippingUtils";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft, User, MapPin, Package, Truck, Clock, Save, Printer,
  MessageSquare, FileText, RotateCcw, Activity, Pencil,
} from "lucide-react";

const Section = ({ title, icon: Icon, children }) => (
  <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
      <Icon className="w-4 h-4 text-gray-500" /> {title}
    </h3>
    {children}
  </section>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-900 text-right">{value || "—"}</span>
  </div>
);

export const AdminShippingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.endsWith("/edit");
  const { isAdmin } = useAuth();

  const [shipment, setShipment] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusRemark, setStatusRemark] = useState("");
  const [newNote, setNewNote] = useState("");
  const [returnForm, setReturnForm] = useState({});
  const [proofForm, setProofForm] = useState({ type: "Delivery Photo", url: "" });

  const fetchShipment = async () => {
    try {
      const [shipRes, courierRes] = await Promise.all([
        api.get(`/admin/shipments/${id}`),
        api.get("/admin/couriers"),
      ]);
      const s = shipRes.data.shipment;
      setShipment(s);
      setEditForm({
        shipmentId: s.shipmentId || "",
        customerName: s.customerName, customerPhone: s.customerPhone, customerEmail: s.customerEmail,
        courierProvider: s.courierProvider?._id || s.courierProvider || "",
        trackingNumber: s.trackingNumber || "", awbNumber: s.awbNumber || "",
        shippingMethod: s.shippingMethod, packageWeight: s.packageWeight || "",
        packageDimensions: s.packageDimensions || "", numberOfPackages: s.numberOfPackages,
        dispatchDate: s.dispatchDate ? new Date(s.dispatchDate).toISOString().split("T")[0] : "",
        estimatedDeliveryDate: s.estimatedDeliveryDate ? new Date(s.estimatedDeliveryDate).toISOString().split("T")[0] : "",
        deliveredDate: s.deliveredDate ? new Date(s.deliveredDate).toISOString().split("T")[0] : "",
        paymentType: s.paymentType, remarks: s.remarks || "", specialInstructions: s.specialInstructions || "",
        shippingAddress: { ...s.shippingAddress },
      });
      setNewStatus(s.status);
      setReturnForm(s.returnInfo || {});
      setCouriers(courierRes.data.couriers || []);
    } catch {
      toast.error("Failed to load shipment");
      navigate("/admin/shipping");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipment(); }, [id]);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/admin/shipments/${id}`, editForm);
      setShipment(data.shipment);
      toast.success("Shipment updated");
      navigate(`/admin/shipping/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const { data } = await api.patch(`/admin/shipments/${id}/status`, { status: newStatus, remark: statusRemark });
      setShipment(data.shipment);
      toast.success("Status updated");
      setStatusRemark("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    try {
      const { data } = await api.post(`/admin/shipments/${id}/notes`, { note: newNote });
      setShipment(data.shipment);
      setNewNote("");
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    }
  };

  const handleAddProof = async () => {
    if (!proofForm.url.trim()) return toast.error("Proof URL is required");
    try {
      const { data } = await api.post(`/admin/shipments/${id}/delivery-proof`, proofForm);
      setShipment(data.shipment);
      setProofForm({ type: "Delivery Photo", url: "" });
      toast.success("Delivery proof uploaded");
    } catch {
      toast.error("Failed to upload proof");
    }
  };

  const handleSaveReturn = async () => {
    try {
      const { data } = await api.put(`/admin/shipments/${id}`, { returnInfo: returnForm });
      setShipment(data.shipment);
      toast.success("Return info saved");
    } catch {
      toast.error("Failed to save return info");
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

  if (!shipment) return null;

  const addr = shipment.shippingAddress;
  const order = shipment.order;

  if (isEditMode && isAdmin && editForm) {
    return (
      <div className="min-h-screen bg-white flex font-sans">
        <AdminSidebar activeTab="shipping" setActiveTab={() => {}} />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-64 bg-[#F8FAFC]">
          <header className="h-20 bg-white border-b border-gray-100 flex items-center gap-4 px-6 md:px-8 sticky top-0 z-20">
            <Link to={`/admin/shipping/${id}`} className="p-2 rounded-xl hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
            <h2 className="text-xl font-bold text-gray-900">Edit Shipment — {shipment.shipmentId}</h2>
          </header>
          <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-8 space-y-6">
            <Section title="Customer & Courier" icon={User}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Shipment ID</label>
                  <input value={editForm.shipmentId} onChange={(e) => setEditForm({ ...editForm, shipmentId: e.target.value })} className={`${inputClass} font-mono font-bold`} />
                </div>
                <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Customer Name</label>
                  <input value={editForm.customerName} onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Phone</label>
                  <input value={editForm.customerPhone} onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Courier</label>
                  <select value={editForm.courierProvider} onChange={(e) => setEditForm({ ...editForm, courierProvider: e.target.value })} className={inputClass}>
                    <option value="">Select...</option>
                    {couriers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select></div>
                <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Tracking Number</label>
                  <input value={editForm.trackingNumber} onChange={(e) => setEditForm({ ...editForm, trackingNumber: e.target.value })} className={inputClass} /></div>
                <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">AWB Number</label>
                  <input value={editForm.awbNumber} onChange={(e) => setEditForm({ ...editForm, awbNumber: e.target.value })} className={inputClass} /></div>
              </div>
            </Section>
            <div className="flex gap-3 justify-end pb-8">
              <Link to={`/admin/shipping/${id}`} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold">Cancel</Link>
              <button onClick={handleSaveEdit} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </main>
        </div>
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
            <div>
              <h2 className="text-xl font-bold text-gray-900">{shipment.shipmentId}</h2>
              <ShipmentStatusBadge status={shipment.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/admin/shipping/${id}/label`} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">
              <Printer className="w-4 h-4" /> Print Label
            </Link>
            {isAdmin && (
              <Link to={`/admin/shipping/${id}/edit`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800">
                <Pencil className="w-4 h-4" /> Edit
              </Link>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Section title="Customer Information" icon={User}>
              <InfoRow label="Name" value={shipment.customerName} />
              <InfoRow label="Email" value={shipment.customerEmail} />
              <InfoRow label="Mobile" value={shipment.customerPhone} />
            </Section>

            <Section title="Shipping Address" icon={MapPin}>
              <p className="text-sm text-gray-900 leading-relaxed">
                {addr.fullName}<br />
                {addr.addressLine1}{addr.addressLine2 && `, ${addr.addressLine2}`}<br />
                {addr.landmark && `${addr.landmark}, `}{addr.city}, {addr.state} {addr.pincode}<br />
                {addr.country}<br />
                <span className="text-gray-500">Mobile: {addr.mobileNumber}</span>
              </p>
            </Section>

            <Section title="Order Information" icon={Package}>
              <InfoRow label="Order ID" value={String(order?._id || order).slice(-8).toUpperCase()} />
              <InfoRow label="Order Value" value={order?.totalAmount ? `₹${order.totalAmount.toLocaleString("en-IN")}` : "—"} />
              <InfoRow label="Payment Method" value={order?.paymentMethod} />
              {order?.orderItems?.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Products</p>
                  {order.orderItems.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                      <span>{item.name} {item.size && `(${item.size})`}</span>
                      <span className="text-gray-500">Qty: {item.quantity} — ₹{item.price?.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="Courier Information" icon={Truck}>
              <InfoRow label="Courier Provider" value={shipment.courierName} />
              <InfoRow label="Tracking Number" value={shipment.trackingNumber} />
              <InfoRow label="AWB Number" value={shipment.awbNumber} />
              <InfoRow label="Shipping Method" value={shipment.shippingMethod} />
              <InfoRow label="Package Weight" value={shipment.packageWeight} />
              <InfoRow label="Dimensions" value={shipment.packageDimensions} />
              <InfoRow label="Packages" value={shipment.numberOfPackages} />
            </Section>

            {/* Shipment Timeline */}
            <Section title="Shipment Timeline" icon={Clock}>
              <div className="space-y-0">
                {(shipment.statusHistory || []).slice().reverse().map((entry, i) => (
                  <div key={i} className="flex gap-4 pb-4 relative">
                    {i < shipment.statusHistory.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="w-4 h-4 rounded-full bg-gray-900 shrink-0 mt-0.5 z-10" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <ShipmentStatusBadge status={entry.status} />
                        <span className="text-xs text-gray-500">{formatDate(entry.date)} {entry.time}</span>
                      </div>
                      {entry.remark && <p className="text-sm text-gray-600 mt-1">{entry.remark}</p>}
                      {entry.adminName && <p className="text-xs text-gray-400 mt-0.5">By {entry.adminName}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Return Management */}
            {(shipment.status === "Returned" || shipment.status === "Return Received" || shipment.returnInfo?.returnDate) && isAdmin && (
              <Section title="Return Management" icon={RotateCcw}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Return Date</label>
                    <input type="date" value={returnForm.returnDate ? new Date(returnForm.returnDate).toISOString().split("T")[0] : ""} onChange={(e) => setReturnForm({ ...returnForm, returnDate: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Package Condition</label>
                    <select value={returnForm.packageCondition || ""} onChange={(e) => setReturnForm({ ...returnForm, packageCondition: e.target.value })} className={inputClass}>
                      <option value="">Select...</option>
                      {["Good", "Damaged", "Partial", "Missing Items"].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select></div>
                  <div className="md:col-span-2"><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Return Reason</label>
                    <input value={returnForm.returnReason || ""} onChange={(e) => setReturnForm({ ...returnForm, returnReason: e.target.value })} className={inputClass} /></div>
                  <div><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Refund Status</label>
                    <select value={returnForm.refundStatus || "Not Applicable"} onChange={(e) => setReturnForm({ ...returnForm, refundStatus: e.target.value })} className={inputClass}>
                      {["Pending", "Processed", "Not Applicable"].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select></div>
                  <div className="md:col-span-2"><label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Internal Remarks</label>
                    <textarea value={returnForm.internalRemarks || ""} onChange={(e) => setReturnForm({ ...returnForm, internalRemarks: e.target.value })} rows={2} className={`${inputClass} resize-none`} /></div>
                </div>
                <button onClick={handleSaveReturn} className="mt-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-semibold">Save Return Info</button>
              </Section>
            )}

            {/* Activity Log */}
            <Section title="Activity Log" icon={Activity}>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(shipment.activityLog || []).slice().reverse().map((log, i) => (
                  <div key={i} className="text-sm border-b border-gray-50 pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900">{log.action}</span>
                      <span className="text-xs text-gray-400">{formatDateTime(log.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{log.adminName}</p>
                    {(log.previousValue || log.newValue) && (
                      <p className="text-xs text-gray-400 mt-0.5">{log.previousValue} → {log.newValue}</p>
                    )}
                  </div>
                ))}
                {!shipment.activityLog?.length && <p className="text-sm text-gray-400">No activity recorded yet.</p>}
              </div>
            </Section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Section title="Update Status" icon={Clock}>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className={inputClass}>
                {SHIPMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <textarea value={statusRemark} onChange={(e) => setStatusRemark(e.target.value)} placeholder="Remark..." rows={2} className={`${inputClass} resize-none mt-2`} />
              <button onClick={handleStatusUpdate} className="w-full mt-2 px-4 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold">Update Status</button>
            </Section>

            <Section title="Shipment Notes" icon={MessageSquare}>
              <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {(shipment.notes || []).slice().reverse().map((n, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-sm text-gray-900">{n.note}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.adminName} — {formatDateTime(n.createdAt)}</p>
                  </div>
                ))}
              </div>
              <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add internal note..." rows={2} className={`${inputClass} resize-none`} />
              <button onClick={handleAddNote} className="w-full mt-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">Add Note</button>
            </Section>

            {isAdmin && (
              <Section title="Delivery Proof" icon={FileText}>
                <div className="space-y-2 mb-3">
                  {(shipment.deliveryProof || []).map((p, i) => (
                    <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
                      {p.type} — {formatDateTime(p.createdAt)}
                    </a>
                  ))}
                </div>
                <select value={proofForm.type} onChange={(e) => setProofForm({ ...proofForm, type: e.target.value })} className={inputClass}>
                  {["Delivery Photo", "Signed Receipt", "POD Document"].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <div className="mt-2">
                  <input 
                    type="file" 
                    accept="image/*,application/pdf"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if(!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (reader.readyState === 2) {
                          setProofForm({ ...proofForm, url: reader.result });
                        }
                      };
                      reader.readAsDataURL(file);
                    }} 
                    className={inputClass} 
                  />
                </div>
                {proofForm.url && proofForm.url.startsWith("data:image") && (
                  <img src={proofForm.url} alt="Proof preview" className="w-full h-32 object-cover rounded-xl mt-2 border border-gray-200" />
                )}
                {proofForm.url && !proofForm.url.startsWith("data:image") && proofForm.url.startsWith("data:") && (
                  <div className="text-sm text-emerald-600 font-semibold mt-2 px-2">Document selected</div>
                )}
                <button onClick={handleAddProof} className="w-full mt-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50">Upload Proof</button>
              </Section>
            )}

            <Section title="Key Dates" icon={Clock}>
              <InfoRow label="Order Date" value={formatDate(shipment.orderDate)} />
              <InfoRow label="Packing Date" value={formatDate(shipment.packingDate)} />
              <InfoRow label="Dispatch Date" value={formatDate(shipment.dispatchDate)} />
              <InfoRow label="Est. Delivery" value={formatDate(shipment.estimatedDeliveryDate)} />
              <InfoRow label="Delivered Date" value={formatDate(shipment.deliveredDate)} />
              <InfoRow label="Created By" value={shipment.createdByName} />
              <InfoRow label="Last Updated" value={formatDateTime(shipment.updatedAt)} />
            </Section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminShippingDetails;
