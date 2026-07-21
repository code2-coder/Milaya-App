import { useEffect, useState } from "react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../utils/priceUtils";
import { useCart } from "../context/CartContext";
import { Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import api from "../api/axios";

export function Orders() {
  const { user } = useAuth();

  const { clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/me/orders");
        // Backend returns "orders" with totalAmount, orderStatus, orderItems
        // We map them to the format expected by the UI
        const ordersList = data.data?.orders || data.orders || [];
        const mappedOrders = ordersList.map(o => ({
          id: o._id,
          createdAt: o.createdAt,
          deliveredAt: o.deliveredAt,
          status: o.orderStatus.toLowerCase(),
          total: o.totalAmount,
          trackingId: o.trackingId,
          trackingUrl: o.trackingUrl,
          awbNumber: o.awbNumber,
          courierName: o.courierName,
          shippingInfo: o.shippingInfo,
          items: o.orderItems.map(item => ({
            id: item._id,
            product: { 
              id: item.product, 
              name: item.name, 
              image: item.image, 
              price: item.price 
            },
            quantity: item.quantity,
            size: item.size,
            returnActive: item.returnActive
          }))
        }));
        setOrders(mappedOrders.reverse());
      } catch (error) {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    const verifyStripeAndFetch = async () => {
      const sessionId = searchParams.get("session_id");

      
      await fetchOrders();
    };

    verifyStripeAndFetch();
  }, [user, navigate, searchParams, setSearchParams, clearCart]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "processing":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "shipped":
        return <Truck className="w-5 h-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
    }
  };

  const getReturnInfo = (order, item) => {
    if (item.returnActive) {
      return { 
        hasReturn: true, 
        returnId: item.returnActive._id || item.returnActive, 
        status: item.returnActive.status,
        returnType: item.returnActive.returnType,
        refundAmount: item.returnActive.refundAmount,
        eligible: false
      };
    }

    if (order.status !== 'delivered') {
      return { eligible: false, message: "Returns available after delivery", hasReturn: false };
    }
    
    // Calculate eligibility
    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : new Date(order.createdAt);
    if (!order.deliveredAt) {
      deliveryDate.setDate(deliveryDate.getDate() + 3); // Approx delivery if no deliveredAt
    }
    
    const expiryDate = new Date(deliveryDate);
    expiryDate.setDate(expiryDate.getDate() + 7); // 7-day return policy
    
    const now = new Date();
    if (now > expiryDate) {
      return { eligible: false, message: "Return window closed", hasReturn: false };
    }
    
    const daysLeft = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24));
    return { eligible: true, message: `${daysLeft} days left to return`, hasReturn: false };
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-10 sm:pb-16 pt-[160px] lg:pt-[180px]">
        <div className="flex items-center justify-between mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">My Orders</h1>
          <span className="text-sm font-medium text-gray-500 bg-white border border-gray-200 px-3 py-1 rounded-full">{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 sm:p-16 text-center shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
              <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto text-sm sm:text-base">
              Start shopping to place your first order and track its progress here.
            </p>
            <button
              onClick={() => navigate("/shop")}
              className="bg-gray-900 text-white font-medium text-sm sm:text-base px-8 py-3.5 rounded-xl hover:bg-black transition-colors shadow-sm"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-gray-900 text-lg">ORDER {order.id.slice(-8).toUpperCase()}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border w-fit ${
                          order.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                          order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Placed on {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-500 mb-0.5">Total Amount</p>
                    <p className="font-bold text-gray-900 text-xl mb-2">{formatPrice(order.total)}</p>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        Delivery Address
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        <span className="font-medium text-gray-900 block mb-1">{order.shippingInfo?.fullName || "Not Provided"}</span>
                        {order.shippingInfo?.address}, {order.shippingInfo?.city} <br/>
                        {order.shippingInfo?.country} - {order.shippingInfo?.zipCode} <br/>
                        <span className="mt-2 block text-gray-500">
                          Phone: <span className="text-gray-700">{order.shippingInfo?.phoneNo}</span>
                          {order.shippingInfo?.altPhoneNo && <span> | Alt: <span className="text-gray-700">{order.shippingInfo?.altPhoneNo}</span></span>}
                        </span>
                      </p>
                    </div>
                    
                    {order.trackingId ? (
                      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-5 shadow-sm flex flex-col justify-center text-white">
                        <div className="flex items-center gap-2 mb-3">
                          <Truck className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Tracking</span>
                        </div>
                        <div className="mb-3 space-y-2">
                          {order.courierName && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Courier Provider</p>
                              <p className="text-white font-medium text-sm">{order.courierName}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Tracking Number</p>
                            <p className="text-white font-mono font-bold text-base">{order.trackingId}</p>
                          </div>
                          {order.awbNumber && (
                            <div>
                              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">AWB Number</p>
                              <p className="text-white font-mono font-medium text-sm">{order.awbNumber}</p>
                            </div>
                          )}
                        </div>
                        {order.trackingUrl ? (
                          <button 
                            onClick={() => window.open(order.trackingUrl, '_blank')}
                            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold rounded-lg transition-colors mt-1"
                          >
                            <Truck className="w-4 h-4" />
                            Track Package
                          </button>
                        ) : (
                          <p className="text-xs text-gray-400 mt-1">Use the tracking number on your courier's website.</p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 flex flex-col justify-center items-center text-center">
                         <Clock className="w-6 h-6 text-gray-400 mb-2" />
                         <p className="text-sm text-gray-500">Tracking information will be available once your order ships.</p>
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-100 pb-2">Order Items</h4>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => {
                      const returnInfo = getReturnInfo(order, item);
                      return (
                      <div
                        key={`${item.product.id}-${idx}`}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white border border-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center p-2">
                          <img
                            src={item.product.image || "https://placehold.co/200x200?text=No+Image"}
                            alt={item.product.name}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 mb-3">
                            {item.size && (
                              <span>Size: <span className="font-medium text-gray-700">{item.size}</span></span>
                            )}
                            <span>Qty: <span className="font-medium text-gray-700">{item.quantity}</span></span>
                          </div>
                          
                          {/* RETURN UI INLINE WITH PRODUCT */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {returnInfo.hasReturn ? (
                              <>
                                <span className={`px-2 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                                  returnInfo.status === 'Refund Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                  returnInfo.status === 'Replacement Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  returnInfo.status === 'Exchange Completed' ? 'bg-teal-50 text-teal-700 border-teal-200' :
                                  returnInfo.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                  {returnInfo.status} ({returnInfo.returnType})
                                </span>
                                
                                {returnInfo.status === 'Refund Completed' && returnInfo.refundAmount > 0 && (
                                  <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-md border border-green-200">
                                    Refunded: {formatPrice(returnInfo.refundAmount)}
                                  </span>
                                )}

                                <span className="text-xs font-medium text-gray-500 font-mono">
                                  ID: {returnInfo.returnId.slice(-6).toUpperCase()}
                                </span>

                                <button 
                                  onClick={() => navigate(`/account/returns/${returnInfo.returnId}`)}
                                  className="ml-auto sm:ml-0 text-xs font-medium text-primary hover:text-primary-dark underline underline-offset-2 transition-colors"
                                >
                                  View Details
                                </button>
                              </>
                            ) : returnInfo.eligible ? (
                              <>
                                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">{returnInfo.message}</span>
                                <button 
                                  onClick={() => navigate(`/orders/${order.id}/return?item=${item.id}`)}
                                  className="ml-auto sm:ml-0 px-3 py-1.5 text-xs font-medium text-white bg-primary hover:bg-primary-dark rounded-md transition-colors shadow-sm whitespace-nowrap"
                                >
                                  Request Return
                                </button>
                              </>
                            ) : (
                              <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                {returnInfo.message}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-left sm:text-right shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-gray-100 flex sm:block justify-between items-center">
                          <p className="text-xs text-gray-500 sm:mt-1 block sm:hidden">
                            {formatPrice(item.product.price)} × {item.quantity}
                          </p>
                          <div>
                             <p className="font-semibold text-gray-900 text-right">
                               {formatPrice(item.product.price * item.quantity)}
                             </p>
                             <p className="text-xs text-gray-500 mt-1 hidden sm:block text-right">
                               {formatPrice(item.product.price)} each
                             </p>
                          </div>
                        </div>
                      </div>
                    )})}
                  </div>

                </div>
              </div>
            )})}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
