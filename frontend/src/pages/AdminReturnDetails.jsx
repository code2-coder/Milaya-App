import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import api from "../api/axios";
import { toast } from "sonner";
import { ReturnStatusBadge } from "../components/returns/ReturnStatusBadge";
import { ReturnTimeline } from "../components/returns/ReturnTimeline";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { ArrowLeft, User, Package, HelpCircle, FileText, Camera, Video, Calendar, IndianRupee, Save, Truck, CreditCard, RefreshCw } from "lucide-react";

export const AdminReturnDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Form states
  const [newStatus, setNewStatus] = useState("");
  const [adminRemarks, setAdminRemarks] = useState("");
  
  // Refund
  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("");
  const [refundReference, setRefundReference] = useState("");
  
  // Pickup
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [courierPartner, setCourierPartner] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [pickupRemarks, setPickupRemarks] = useState("");
  
  // Replacement / Exchange
  const [replacementProduct, setReplacementProduct] = useState("");
  const [shippingProgress, setShippingProgress] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/admin/returns/${id}`);
        const ret = data.return;
        setReturnReq(ret);
        setNewStatus(ret.status);
        setAdminRemarks(ret.adminRemarks || "");
        
        setRefundAmount(ret.refundAmount || "");
        setRefundMethod(ret.refundMethod || "Original Payment");
        setRefundReference(ret.refundTransactionReference || "");
        
        if (ret.pickupDate) setPickupDate(new Date(ret.pickupDate).toISOString().split('T')[0]);
        setPickupTime(ret.pickupTime || "");
        setCourierPartner(ret.courierPartner || "");
        setTrackingNumber(ret.trackingNumber || "");
        setPickupRemarks(ret.pickupRemarks || "");
        
        setReplacementProduct(ret.replacementProduct || "");
        setShippingProgress(ret.shippingProgress || "");
        
      } catch (error) {
        toast.error("Failed to fetch return details");
        navigate("/admin/returns");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, navigate]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const payload = {
        status: newStatus,
        adminRemarks,
        refundAmount: Number(refundAmount),
        refundMethod,
        refundTransactionReference: refundReference,
        pickupDate: pickupDate || undefined,
        pickupTime,
        courierPartner,
        trackingNumber,
        pickupRemarks,
        replacementProduct,
        shippingProgress
      };

      const { data } = await api.patch(`/admin/returns/${id}`, payload);
      setReturnReq(data.return);
      toast.success("Return updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update return");
    } finally {
      setUpdating(false);
    }
  };

  const handleAction = async (actionStatus) => {
    setNewStatus(actionStatus);
    // Auto-save when an action button is clicked, or let the user click save manually.
    // We will let the user review and click save to apply changes.
    toast.info(`Status changed to ${actionStatus}. Don't forget to Save Changes.`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const videos = returnReq.media?.filter(m => m.type === "video") || [];
  const images = returnReq.media?.filter(m => m.type === "image") || [];
  const returnType = returnReq.returnType || "Refund";

  return (
    <div className="min-h-screen bg-white flex font-sans">
      <AdminSidebar activeTab="returns" setActiveTab={() => {}} />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 bg-[#F8FAFC]">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/returns" 
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Return Management</h2>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-[1500px] mx-auto p-6 md:p-8 relative z-0 animate-in fade-in duration-500">
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1 tracking-wide uppercase">Return ID</p>
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl font-mono">
                {returnReq.returnNumber}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500">Current Status:</span>
              <ReturnStatusBadge status={returnReq.status} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
            
            {/* Left Column: Details & Media */}
            <div className="xl:col-span-7 space-y-8">
              
              {/* Request Information */}
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-400" />
                    Request Information
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Customer</p>
                        <p className="text-base font-bold text-gray-900 mt-1">{returnReq.user?.name}</p>
                        <p className="text-sm text-gray-500">{returnReq.user?.email}</p>
                        <p className="text-sm text-gray-500">{returnReq.user?.phone || "No phone provided"}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <Package className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Product Details</p>
                        <p className="text-base font-bold text-gray-900 mt-1">{returnReq.product?.name}</p>
                        <p className="text-sm text-gray-500 mt-1">Quantity: <span className="font-semibold text-gray-900">{returnReq.quantity || 1}</span></p>
                        <p className="text-sm text-gray-500 mt-1">Order ID: <span className="font-mono">#{returnReq.order?._id?.slice(-8).toUpperCase()}</span></p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Reason & Resolution</p>
                        <p className="text-base font-bold text-gray-900 mt-1">{returnReq.reason}</p>
                        <p className="text-sm text-gray-500 mt-1">Type: <span className="font-semibold text-gray-900">{returnType}</span></p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 md:col-span-2">
                      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div className="w-full">
                        <p className="text-sm font-medium text-gray-500">Description</p>
                        <p className="text-sm text-gray-700 mt-1 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[80px]">
                          {returnReq.description || <span className="italic text-gray-400">No description provided</span>}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* Media Section */}
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-gray-400" />
                    Evidence (Media)
                  </h3>
                </div>
                <div className="p-6 space-y-8">
                  {videos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                        <Video className="w-4 h-4 text-rose-500" />
                        Unboxing Video
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        {videos.map((vid, idx) => (
                          <div key={idx} className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-200 shadow-sm aspect-video max-w-2xl">
                            <video src={vid.url} controls className="w-full h-full object-contain" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {images.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                        <Camera className="w-4 h-4 text-blue-500" />
                        Images
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                          <a href={img.url} target="_blank" rel="noreferrer" key={idx} className="group relative block rounded-2xl overflow-hidden shadow-sm border border-gray-200 aspect-square">
                            <img src={img.url} alt="Evidence" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {videos.length === 0 && images.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Camera className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium">No media evidence provided</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Timeline */}
              <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    Activity Log (Timeline)
                  </h3>
                </div>
                <div className="p-6">
                  <ReturnTimeline timeline={returnReq.timeline} />
                </div>
              </div>
            </div>

            {/* Right Column: Admin Actions */}
            <div className="xl:col-span-5 space-y-8">
              <form onSubmit={handleUpdateStatus} className="space-y-6">
                
                {/* Status Update Panel */}
                <div className="bg-white shadow-lg border-2 border-gray-900 rounded-2xl overflow-hidden">
                  <div className="px-6 py-5 bg-gray-900 text-white flex justify-between items-center">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <Save className="w-5 h-5 opacity-70" />
                      Update Status
                    </h3>
                    <button
                      type="submit"
                      disabled={updating}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
                    >
                      {updating ? 'Saving...' : 'Save All Changes'}
                    </button>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Current Status Phase</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 font-medium cursor-pointer"
                      >
                        <optgroup label="Review Phase">
                          <option value="Pending Review">Pending Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </optgroup>
                        <optgroup label="Logistics Phase">
                          <option value="Pickup Scheduled">Pickup Scheduled</option>
                          <option value="Pickup Completed">Pickup Completed</option>
                          <option value="Product Received">Product Received</option>
                          <option value="Quality Inspection">Quality Inspection</option>
                        </optgroup>
                        {returnType === "Refund" && (
                          <optgroup label="Refund Phase">
                            <option value="Refund Processing">Refund Processing</option>
                            <option value="Refund Completed">Refund Completed</option>
                          </optgroup>
                        )}
                        {(returnType === "Replacement" || returnType === "Exchange") && (
                          <optgroup label="Exchange/Replace Phase">
                            <option value="Replacement Preparing">Preparing {returnType}</option>
                            <option value="Replacement Shipped">{returnType} Shipped</option>
                            <option value="Replacement Delivered">{returnType} Delivered</option>
                            <option value="Exchange Approved">Exchange Approved</option>
                            <option value="Exchange Shipped">Exchange Shipped</option>
                            <option value="Exchange Delivered">Exchange Delivered</option>
                          </optgroup>
                        )}
                        <optgroup label="Final">
                          <option value="Return Closed">Closed</option>
                        </optgroup>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        Admin Remarks to Customer
                      </label>
                      <textarea
                        rows={3}
                        value={adminRemarks}
                        onChange={(e) => setAdminRemarks(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 outline-none focus:bg-white focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 font-medium resize-none"
                        placeholder="E.g., Your return has been approved. Our delivery partner will contact you..."
                      />
                    </div>
                  </div>
                </div>

                {/* Pickup Details Panel */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-gray-500" /> Pickup Logistics
                    </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Pickup Date</label>
                        <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Pickup Time</label>
                        <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Courier Partner</label>
                        <input type="text" value={courierPartner} onChange={(e) => setCourierPartner(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm" placeholder="E.g. BlueDart" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tracking Number</label>
                        <input type="text" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm" placeholder="AWB Number" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Pickup Remarks</label>
                      <input type="text" value={pickupRemarks} onChange={(e) => setPickupRemarks(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm" placeholder="Internal notes for pickup..." />
                    </div>
                  </div>
                </div>

                {/* Conditional Resolution Panel */}
                {returnType === "Refund" ? (
                  <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-500" /> Refund Management
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Refund Amount (₹)</label>
                        <input type="number" value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm font-bold text-emerald-600" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Refund Method</label>
                          <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm">
                            <option value="Original Payment">Original Payment</option>
                            <option value="Store Wallet">Store Wallet</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="UPI">UPI</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Transaction Ref</label>
                          <input type="text" value={refundReference} onChange={(e) => setRefundReference(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm" placeholder="TXN ID" />
                        </div>
                      </div>
                      
                      <div className="pt-4 flex gap-2">
                        <button type="button" onClick={() => handleAction("Refund Processing")} className="flex-1 bg-teal-50 text-teal-700 py-2 rounded-lg text-sm font-bold hover:bg-teal-100 transition-colors">Start Refund</button>
                        <button type="button" onClick={() => handleAction("Refund Completed")} className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">Complete Refund</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <RefreshCw className="w-5 h-5 text-gray-500" /> {returnType} Logistics
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Assigned Product/Variant</label>
                        <input type="text" value={replacementProduct} onChange={(e) => setReplacementProduct(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm" placeholder="E.g. Same product / Size L" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Shipping Progress (Tracking Info)</label>
                        <textarea rows={2} value={shippingProgress} onChange={(e) => setShippingProgress(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-900 text-sm" placeholder="Courier Name & Tracking Number..." />
                      </div>
                      
                      <div className="pt-4 flex gap-2">
                        <button type="button" onClick={() => handleAction("Replacement Preparing")} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">Preparing</button>
                        <button type="button" onClick={() => handleAction("Replacement Shipped")} className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-colors">Shipped</button>
                      </div>
                    </div>
                  </div>
                )}

              </form>
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};
