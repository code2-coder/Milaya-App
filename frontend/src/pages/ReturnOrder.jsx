import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { toast } from "sonner";
import { MediaUploader } from "../components/returns/MediaUploader";
import api from "../api/axios";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PackageOpen, ShieldAlert, ArrowLeft, RefreshCw, CreditCard, Repeat } from "lucide-react";
import { useSearchParams } from "react-router";

export const ReturnOrder = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [returnType, setReturnType] = useState("Refund");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState([]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.order);
        
        const itemId = searchParams.get("item");
        if (itemId) {
          setSelectedItem(itemId);
        }
      } catch (error) {
        toast.error("Failed to load order details");
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate, searchParams]);

  // Reset quantity when item changes
  useEffect(() => {
    if (selectedItem) {
      setQuantity(1);
    }
  }, [selectedItem]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) return toast.error("Please select an item to return");
    if (!reason) return toast.error("Please select a return reason");
    if (!description.trim()) return toast.error("Please provide a description");
    
    const hasVideo = media.some(m => m.type === "video");
    if (!hasVideo) return toast.error("An unboxing video is mandatory for returns");

    const item = order.orderItems.find(i => i._id === selectedItem);

    setSubmitting(true);
    try {
      await api.post("/returns", {
        orderId: order._id,
        orderItemId: item._id,
        productId: item.product,
        quantity: parseInt(quantity),
        returnType,
        reason,
        description,
        media
      });
      toast.success("Return request submitted successfully");
      navigate("/account/returns");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit return request");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex justify-center items-center">
           <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const selectedItemData = order?.orderItems.find(i => i._id === selectedItem);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 pt-[160px] lg:pt-[180px]">
        
        <div className="mb-6">
          <button 
            onClick={() => navigate("/orders")}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Request Return or Exchange</h1>
          <p className="mt-2 text-gray-500">Order #{order?._id.slice(-8).toUpperCase()}</p>
        </div>

        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Step 1: Item Selection */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">1</span>
                  <h3 className="text-lg font-semibold text-gray-900">Select Item & Quantity</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="item" className="block text-sm font-medium text-gray-700 mb-2">
                      Item to Return
                    </label>
                    <select
                      id="item"
                      className="block w-full rounded-xl border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-primary shadow-sm"
                      value={selectedItem}
                      onChange={(e) => setSelectedItem(e.target.value)}
                    >
                      <option value="">Choose an item</option>
                      {order?.orderItems.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedItemData && (
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <select
                        id="quantity"
                        className="block w-full rounded-xl border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-primary shadow-sm"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                      >
                        {[...Array(selectedItemData.quantity)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Resolution Type */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">2</span>
                  <h3 className="text-lg font-semibold text-gray-900">How would you like this resolved?</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none ${returnType === 'Refund' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <input type="radio" name="returnType" value="Refund" className="sr-only" checked={returnType === 'Refund'} onChange={() => setReturnType('Refund')} />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="flex items-center gap-2 text-sm font-medium text-gray-900"><CreditCard className="w-4 h-4 text-primary" /> Refund</span>
                        <span className="mt-1 text-xs text-gray-500">Money back to original payment method.</span>
                      </span>
                    </span>
                  </label>

                  <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none ${returnType === 'Replacement' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <input type="radio" name="returnType" value="Replacement" className="sr-only" checked={returnType === 'Replacement'} onChange={() => setReturnType('Replacement')} />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="flex items-center gap-2 text-sm font-medium text-gray-900"><RefreshCw className="w-4 h-4 text-primary" /> Replacement</span>
                        <span className="mt-1 text-xs text-gray-500">Get the exact same item again.</span>
                      </span>
                    </span>
                  </label>
                  
                  <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none ${returnType === 'Exchange' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <input type="radio" name="returnType" value="Exchange" className="sr-only" checked={returnType === 'Exchange'} onChange={() => setReturnType('Exchange')} />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="flex items-center gap-2 text-sm font-medium text-gray-900"><Repeat className="w-4 h-4 text-primary" /> Exchange</span>
                        <span className="mt-1 text-xs text-gray-500">Exchange for a different size/color.</span>
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              {/* Step 3: Reason & Proof */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">3</span>
                  <h3 className="text-lg font-semibold text-gray-900">Reason & Proof</h3>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Return
                  </label>
                  <select
                    id="reason"
                    className="block w-full rounded-xl border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-primary shadow-sm"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="">Select a reason</option>
                    <option value="Defective/Damaged">Defective/Damaged</option>
                    <option value="Wrong Item Received">Wrong Item Received</option>
                    <option value="Size Issue">Size Issue</option>
                    <option value="Quality Not as Expected">Quality Not as Expected</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description
                  </label>
                  <textarea
                    id="description"
                    rows={4}
                    className="block w-full rounded-xl border-gray-200 px-4 py-3 text-sm focus:border-primary focus:ring-primary shadow-sm"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Please describe the issue in detail..."
                  />
                </div>
                
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-amber-800">Unboxing Video is Mandatory</h4>
                    <p className="text-xs text-amber-700 mt-1">
                      To process your request quickly, please upload a clear continuous video showing the unboxing of the package.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unboxing Video <span className="text-red-500">*</span>
                    </label>
                    <MediaUploader
                      type="video"
                      maxFiles={1}
                      maxSizeMB={200}
                      onUpload={(newMedia) => setMedia([...media.filter(m => m.type !== "video"), ...newMedia])}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Images (Optional)
                    </label>
                    <MediaUploader
                      type="image"
                      maxFiles={3}
                      maxSizeMB={5}
                      onUpload={(newMedia) => setMedia([...media.filter(m => m.type !== "image"), ...newMedia])}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate("/orders")}
                  className="px-6 py-3 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
