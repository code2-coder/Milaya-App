import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { toast } from "sonner";
import api from "../api/axios";
import { ReturnStatusBadge } from "../components/returns/ReturnStatusBadge";
import { ReturnTimeline } from "../components/returns/ReturnTimeline";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { ArrowLeft, Package, CreditCard, RefreshCw, CalendarDays, FileText } from "lucide-react";

export const ReturnDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [returnReq, setReturnReq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReturnDetails = async () => {
      try {
        const { data } = await api.get(`/returns/${id}`);
        setReturnReq(data.return);
      } catch (error) {
        toast.error("Failed to load return details");
        navigate("/account/returns");
      } finally {
        setLoading(false);
      }
    };
    fetchReturnDetails();
  }, [id, navigate]);

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

  if (!returnReq) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Return Request Not Found</h2>
            <Link to="/account/returns" className="text-primary hover:underline">Back to My Returns</Link>
          </div>
        </div>
      </div>
    );
  }

  const videos = returnReq.media?.filter(m => m.type === "video") || [];
  const images = returnReq.media?.filter(m => m.type === "image") || [];
  const returnType = returnReq.returnType || "Refund"; // Default if not present

  // Mock expected date logic based on current status
  let expectedDateMsg = "";
  if (returnReq.status !== "Return Closed" && returnReq.status !== "Refund Completed" && returnReq.status !== "Rejected") {
    const date = new Date(returnReq.createdAt);
    date.setDate(date.getDate() + 7);
    expectedDateMsg = `Expected by ${date.toLocaleDateString()}`;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 pt-[160px] lg:pt-[180px]">
        <div className="mb-6">
          <button 
            onClick={() => navigate("/account/returns")}
            className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Returns
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Return Details
            </h1>
            <p className="mt-1 text-gray-500">ID: {returnReq.returnNumber}</p>
          </div>
          <div className="mt-2 sm:mt-0 flex flex-col items-start sm:items-end gap-2">
            <ReturnStatusBadge status={returnReq.status} />
            {expectedDateMsg && <span className="text-sm font-medium text-gray-600 bg-white border px-3 py-1 rounded-full">{expectedDateMsg}</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            
            {/* Timeline */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-gray-400" />
                Track Status
              </h3>
              <ReturnTimeline timeline={returnReq.timeline} />
            </div>

            {/* Product & Return Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  Product Information
                </h3>
                <div className="flex items-center gap-4">
                  {returnReq.product?.image ? (
                    <img src={returnReq.product.image} alt={returnReq.product.name} className="w-20 h-20 rounded-xl object-cover border border-gray-100" />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{returnReq.product?.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">Quantity: {returnReq.quantity}</p>
                    <p className="text-sm text-gray-500 mt-1">Order ID: <span className="font-mono">#{returnReq.order?._id?.slice(-8).toUpperCase()}</span></p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 sm:p-8 bg-gray-50/50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  Return Reason
                </h3>
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Reason</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">{returnReq.reason}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Description</dt>
                    <dd className="mt-1 text-sm text-gray-900 bg-white p-4 rounded-xl border border-gray-100">{returnReq.description}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Media section */}
            {(videos.length > 0 || images.length > 0) && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Provided Proof</h3>
                
                {videos.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Unboxing Video</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videos.map((vid, idx) => (
                        <video key={idx} src={vid.url} controls className="w-full rounded-xl border border-gray-200 bg-black" />
                      ))}
                    </div>
                  </div>
                )}
                
                {images.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Images</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {images.map((img, idx) => (
                        <a key={idx} href={img.url} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                          <img src={img.url} alt={`Return issue ${idx}`} className="w-full h-32 object-cover rounded-xl border border-gray-200" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            
            {/* Resolution Details Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2 pb-4 border-b border-gray-100">
                {returnType === "Refund" ? (
                  <><CreditCard className="w-5 h-5 text-gray-400" /> Refund Details</>
                ) : (
                  <><RefreshCw className="w-5 h-5 text-gray-400" /> {returnType} Details</>
                )}
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Resolution Type</span>
                  <span className="text-sm font-medium text-gray-900">{returnType}</span>
                </div>
                
                {returnType === "Refund" ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Refund Method</span>
                      <span className="text-sm font-medium text-gray-900">{returnReq.refundMethod || "Original Payment"}</span>
                    </div>
                    {returnReq.refundAmount && (
                      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                        <span className="text-base font-semibold text-gray-900">Total Refund</span>
                        <span className="text-lg font-bold text-emerald-600">₹{returnReq.refundAmount}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Replacement Item</span>
                      <span className="text-sm font-medium text-gray-900 text-right max-w-[150px] truncate">{returnReq.product?.name}</span>
                    </div>
                    {/* Mock tracking info for replacements if they were approved */}
                    {returnReq.status === "Replacement Shipped" && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-1">Tracking Number</p>
                        <p className="text-sm font-mono font-medium text-gray-900">TRK987654321</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Admin Remarks */}
            {returnReq.adminRemarks && (
              <div className={`rounded-2xl p-6 border ${returnReq.status === 'Rejected' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'}`}>
                <h4 className={`text-sm font-semibold mb-2 ${returnReq.status === 'Rejected' ? 'text-red-800' : 'text-blue-800'}`}>
                  Message from Support
                </h4>
                <p className={`text-sm ${returnReq.status === 'Rejected' ? 'text-red-700' : 'text-blue-700'}`}>
                  {returnReq.adminRemarks}
                </p>
              </div>
            )}

            {/* Help Card */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Need help with your return?</h4>
              <p className="text-sm text-gray-500 mb-4">Our support team is available 24/7 to assist you with your request.</p>
              <Link to="/contact" className="text-sm font-medium text-primary hover:text-primary-dark">
                Contact Support &rarr;
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
