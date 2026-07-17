import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import api from "../api/axios";
import { toast } from "sonner";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { ArrowLeft, Save, Printer } from "lucide-react";

const emptyAddress = {
  fullName: "", mobileNumber: "", addressLine1: "", addressLine2: "",
  landmark: "", city: "", state: "", country: "India", pincode: "",
};


export const AdminShippingCreate = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [form, setForm] = useState({
    shipmentId: "",
    customerName: "", customerPhone: "", customerEmail: "",
    shippingAddress: { ...emptyAddress },
    courierProvider: "", trackingNumber: "", awbNumber: "",
    shippingMethod: "standard", packageWeight: "", packageDimensions: "",
    numberOfPackages: 1, orderDate: "", packingDate: "", dispatchDate: "",
    estimatedDeliveryDate: "", deliveredDate: "", paymentType: "Prepaid",
    remarks: "", specialInstructions: "",
  });

  useEffect(() => {
    Promise.all([
      api.get("/admin/shipments/orders"),
      api.get("/admin/couriers?activeOnly=true"),
    ]).then(([orderRes, courierRes]) => {
      setOrders(orderRes.data.orders || []);
      setCouriers(courierRes.data.couriers || []);
    }).catch(() => toast.error("Failed to load form data"));
  }, []);

  const handleOrderSelect = (orderId) => {
    setSelectedOrderId(orderId);
    const order = orders.find((o) => o._id === orderId);
    if (!order) return;

    // Prefer user's default saved address for richer data (includes state, landmark, altPhone, etc.)
    const userAddresses = order.user?.addresses || [];
    const defaultAddr = userAddresses.find((a) => a.isDefault) || userAddresses[0] || null;

    setForm((prev) => ({
      ...prev,
      shipmentId: prev.shipmentId, // keep existing generated ID
      customerName: order.shippingInfo?.fullName || order.user?.name || "",
      customerPhone: order.shippingInfo?.phoneNo || order.user?.phoneNumber || "",
      customerEmail: order.user?.email || "",
      shippingAddress: {
        fullName:    defaultAddr?.fullName    || order.shippingInfo?.fullName    || "",
        mobileNumber: defaultAddr?.phoneNo   || order.shippingInfo?.phoneNo     || "",
        addressLine1: defaultAddr?.address   || order.shippingInfo?.address     || "",
        landmark: defaultAddr?.landmark      || order.shippingInfo?.landmark    || "",
        city:     defaultAddr?.city          || order.shippingInfo?.city        || "",
        state:    defaultAddr?.state         || order.shippingInfo?.state       || "",
        country:  defaultAddr?.country       || order.shippingInfo?.country     || "India",
        pincode:  defaultAddr?.zipCode       || order.shippingInfo?.zipCode     || "",
      },
      paymentType: order.paymentMethod === "COD" ? "Cash on Delivery" : "Prepaid",
      shippingMethod: order.shippingMethod || "standard",
      orderDate: order.createdAt ? new Date(order.createdAt).toISOString().split("T")[0] : "",
    }));
  };

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateAddress = (field, value) =>
    setForm((prev) => ({ ...prev, shippingAddress: { ...prev.shippingAddress, [field]: value } }));

  const handleSubmit = async (printLabel = false) => {
    if (!selectedOrderId) return toast.error("Please select an order");
    setSaving(true);
    try {
      const payload = { ...form, orderId: selectedOrderId };
      const { data } = await api.post("/admin/shipments", payload);
      toast.success("Shipment created successfully");
      if (printLabel) {
        navigate(`/admin/shipping/${data.shipment._id}/label`);
      } else {
        navigate(`/admin/shipping/${data.shipment._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create shipment");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-gray-900/20 focus:bg-white";
  const labelClass = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <div className="min-h-screen bg-white flex font-sans">
      <AdminSidebar activeTab="shipping" setActiveTab={() => {}} />
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 bg-[#F8FAFC]">
        <header className="h-20 bg-white border-b border-gray-100 flex items-center gap-4 px-6 md:px-8 sticky top-0 z-20">
          <Link to="/admin/shipping" className="p-2 rounded-xl hover:bg-gray-100"><ArrowLeft className="w-5 h-5" /></Link>
          <h2 className="text-xl font-bold text-gray-900">Create Shipment</h2>
        </header>

        <main className="flex-1 max-w-4xl mx-auto w-full p-6 md:p-8 space-y-6">
          {/* Order Selection */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Order Details</h3>
            <div>
              <label className={labelClass}>Select Order *</label>
              <select value={selectedOrderId} onChange={(e) => handleOrderSelect(e.target.value)} className={inputClass}>
                <option value="">Choose an order...</option>
                {orders.map((o) => (
                  <option key={o._id} value={o._id}>
                    {String(o._id).slice(-8).toUpperCase()} — {o.shippingInfo?.fullName} — ₹{o.totalAmount?.toLocaleString("en-IN")}
                  </option>
                ))}
              </select>
            </div>
            {selectedOrderId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                <div>
                  <label className={labelClass}>Order ID (System Generated)</label>
                  <div className="flex flex-col">
                    <div className="w-full bg-slate-100 border border-slate-200 text-sm rounded-xl px-4 py-2.5 text-slate-600 font-mono font-bold flex items-center select-all shadow-inner">
                      #{selectedOrderId.slice(-8).toUpperCase()}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-mono">Full Ref: {selectedOrderId}</span>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Shipment ID *</label>
                  <input 
                    value={form.shipmentId} 
                    onChange={(e) => updateField("shipmentId", e.target.value)} 
                    placeholder="Enter Shipment ID manually"
                    className={`${inputClass} font-mono font-bold`}
                  />
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div><label className={labelClass}>Customer Name</label><input value={form.customerName} onChange={(e) => updateField("customerName", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Customer Phone</label><input value={form.customerPhone} onChange={(e) => updateField("customerPhone", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Customer Email</label><input value={form.customerEmail} onChange={(e) => updateField("customerEmail", e.target.value)} className={inputClass} /></div>
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Shipping Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Full Name</label><input value={form.shippingAddress.fullName} onChange={(e) => updateAddress("fullName", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Mobile Number</label><input value={form.shippingAddress.mobileNumber} onChange={(e) => updateAddress("mobileNumber", e.target.value)} className={inputClass} /></div>
              <div className="md:col-span-2"><label className={labelClass}>Street Address</label><input value={form.shippingAddress.addressLine1} onChange={(e) => updateAddress("addressLine1", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Landmark</label><input value={form.shippingAddress.landmark} onChange={(e) => updateAddress("landmark", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>City</label><input value={form.shippingAddress.city} onChange={(e) => updateAddress("city", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>State</label><input value={form.shippingAddress.state} onChange={(e) => updateAddress("state", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Country</label><input value={form.shippingAddress.country} onChange={(e) => updateAddress("country", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Pincode</label><input value={form.shippingAddress.pincode} onChange={(e) => updateAddress("pincode", e.target.value)} className={inputClass} /></div>
            </div>
          </section>

          {/* Courier Details */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Courier Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Courier Provider</label>
                <select value={form.courierProvider} onChange={(e) => updateField("courierProvider", e.target.value)} className={inputClass}>
                  <option value="">Select courier...</option>
                  {couriers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className={labelClass}>Shipping Method</label>
                <select value={form.shippingMethod} onChange={(e) => updateField("shippingMethod", e.target.value)} className={inputClass}>
                  <option value="standard">Standard</option><option value="express">Express</option>
                  <option value="surface">Surface</option><option value="air">Air</option><option value="other">Other</option>
                </select>
              </div>
              <div><label className={labelClass}>Tracking Number</label><input value={form.trackingNumber} onChange={(e) => updateField("trackingNumber", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>AWB Number</label><input value={form.awbNumber} onChange={(e) => updateField("awbNumber", e.target.value)} className={inputClass} /></div>
              <div><label className={labelClass}>Package Weight</label><input value={form.packageWeight} onChange={(e) => updateField("packageWeight", e.target.value)} placeholder="e.g. 0.5 kg" className={inputClass} /></div>
              <div><label className={labelClass}>Package Dimensions</label><input value={form.packageDimensions} onChange={(e) => updateField("packageDimensions", e.target.value)} placeholder="L x W x H cm" className={inputClass} /></div>
              <div><label className={labelClass}>Number of Packages</label><input type="number" min={1} value={form.numberOfPackages} onChange={(e) => updateField("numberOfPackages", Number(e.target.value))} className={inputClass} /></div>
            </div>
          </section>

          {/* Dates & Payment */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Shipment Dates & Payment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["orderDate", "packingDate", "dispatchDate", "estimatedDeliveryDate", "deliveredDate"].map((field) => (
                <div key={field}>
                  <label className={labelClass}>{field.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</label>
                  <input type="date" value={form[field]} onChange={(e) => updateField(field, e.target.value)} className={inputClass} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Payment Type</label>
                <select value={form.paymentType} onChange={(e) => updateField("paymentType", e.target.value)} className={inputClass}>
                  <option value="Prepaid">Prepaid</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                </select>
              </div>
            </div>
          </section>

          {/* Notes */}
          <section className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Internal Notes</h3>
            <div><label className={labelClass}>Remarks</label><textarea value={form.remarks} onChange={(e) => updateField("remarks", e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
            <div><label className={labelClass}>Special Instructions</label><textarea value={form.specialInstructions} onChange={(e) => updateField("specialInstructions", e.target.value)} rows={2} className={`${inputClass} resize-none`} /></div>
          </section>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-end pb-8">
            <Link to="/admin/shipping" className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</Link>
            <button onClick={() => handleSubmit(false)} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Shipment"}
            </button>
            <button onClick={() => handleSubmit(true)} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700 disabled:opacity-50">
              <Printer className="w-4 h-4" /> Save & Print Label
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminShippingCreate;
