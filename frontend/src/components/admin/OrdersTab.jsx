import React, { useState } from "react";
import { 
  Search, Trash2, ChevronDown, ChevronUp, MapPin, Phone, Mail, Package, AlertCircle, 
  Download, Truck, CheckCircle2, AlertTriangle, Filter, ChevronLeft, ChevronRight, X
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";

export function OrdersTab({ orders, formatINR, updateOrderStatus, handleDeleteOrder, globalSearch, setGlobalSearch }) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All Orders");


  const pendingCount = orders.filter(o => o.orderStatus === "Pending" || o.orderStatus === "Processing").length;
  const inTransitCount = orders.filter(o => o.orderStatus === "Shipped").length;
  
  // A simplistic mock for "Completed Today"
  const completedTodayCount = orders.filter(o => o.orderStatus === "Delivered").length;
  // A simplistic mock for "Flagged"
  const flaggedCount = orders.filter(o => o.orderStatus === "Cancelled").length;

  const filteredOrders = orders.filter(order => {
     const matchesSearch = order._id?.toLowerCase().includes(globalSearch?.toLowerCase() || "") ||
       (order.shippingInfo?.fullName || order.user?.name || "")?.toLowerCase().includes(globalSearch?.toLowerCase() || "") ||
       (order.user?.email || "")?.toLowerCase().includes(globalSearch?.toLowerCase() || "");
       
     if (statusFilter !== "All Orders" && order.orderStatus !== statusFilter) {
        return false;
     }
     
     return matchesSearch;
  });

  const toggleRow = (orderId) => {
    if (expandedOrder === orderId) {
       setExpandedOrder(null);
    } else {
       setExpandedOrder(orderId);
    }
  };

  const getStatusStyle = (status) => {
     switch(status) {
        case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'Processing': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'Shipped': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case 'Cancelled': return 'bg-red-50 text-red-700 border-red-200';
        default: return 'bg-amber-50 text-amber-700 border-amber-200';
     }
  };

  const clearFilters = () => {
     if(setGlobalSearch) setGlobalSearch("");
     setStatusFilter("All Orders");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Order Operations</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Manage, track, and process global luxury shipments.</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200/80 text-emerald-600 rounded-xl hover:bg-emerald-50 transition-colors text-sm font-bold shadow-sm">
               <Download className="w-4 h-4" />
               Export CSV
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white rounded-xl transition-all text-sm font-bold shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] hover:-translate-y-0.5">
               <Truck className="w-4 h-4" />
               Ship Selected
            </button>
         </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100/50">
               <Package className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Pending Orders</p>
               <h3 className="text-3xl font-black text-slate-900">{pendingCount}</h3>
            </div>
         </div>
         <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100/50">
               <Package className="w-6 h-6 text-blue-500" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">In Transit</p>
               <h3 className="text-3xl font-black text-slate-900">{inTransitCount}</h3>
            </div>
         </div>
         <div className="bg-[#0B0F19] rounded-2xl p-6 shadow-xl flex items-center gap-5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:bg-emerald-500/20 transition-colors duration-500"></div>
            <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 backdrop-blur-md relative z-10">
               <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">Completed Today</p>
               <h3 className="text-3xl font-black text-white">{completedTodayCount}</h3>
            </div>
         </div>
         <div className="bg-white rounded-2xl p-6 border border-slate-200/60 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-red-50 flex items-center justify-center border border-red-100/50">
               <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
               <p className="text-[10px] font-bold text-red-600/80 uppercase tracking-[0.2em] mb-1">Flagged</p>
               <h3 className="text-3xl font-black text-red-600">{flaggedCount}</h3>
            </div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
         {/* Filters Bar */}
         <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
               <div className="relative">
                  <select 
                     value={statusFilter}
                     onChange={e => setStatusFilter(e.target.value)}
                     className="pl-4 pr-10 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm font-bold text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                  >
                     <option value="All Orders">Status: All Orders</option>
                     <option value="Pending">Pending</option>
                     <option value="Processing">Processing</option>
                     <option value="Shipped">Shipped</option>
                     <option value="Delivered">Delivered</option>
                     <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
               </div>
               <div className="relative hidden sm:block">
                  <button className="flex items-center gap-2 pl-4 pr-5 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                     Time: Last 30 Days <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
               </div>
               
               <div className="relative flex-1 sm:w-72 sm:flex-none ml-0 sm:ml-2">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                     type="text"
                     value={globalSearch}
                     onChange={e => setGlobalSearch(e.target.value)}
                     placeholder="Search orders..."
                     className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder-slate-400 text-slate-700 shadow-sm"
                  />
                  {globalSearch && (
                     <button onClick={() => setGlobalSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-4 h-4" />
                     </button>
                  )}
               </div>
            </div>
            <div className="text-sm text-slate-500 font-medium bg-white px-4 py-2 rounded-lg border border-slate-200/60 shadow-sm">
               Showing <span className="font-bold text-slate-800">{filteredOrders.length}</span> orders
            </div>
         </div>

         {/* Table or Empty State */}
         {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto flex-1">
               <table className="w-full border-collapse text-left">
                  <thead>
                     <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-10"></th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredOrders.map(order => {
                        const isExpanded = expandedOrder === order._id;
                        return (
                           <React.Fragment key={order._id}>
                              <tr className={`hover:bg-slate-50/50 transition-colors group cursor-pointer ${isExpanded ? 'bg-slate-50/80' : ''}`} onClick={() => toggleRow(order._id)}>
                                 <td className="px-6 py-5">
                                    <button className="text-slate-400 hover:text-emerald-600 transition-colors p-1.5 bg-white rounded-md border border-slate-200 shadow-sm">
                                       {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                 </td>
                                 <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="text-slate-800 font-black text-sm font-mono tracking-wider">
                                      {order._id.substring(order._id.length - 8).toUpperCase()}
                                    </span>
                                 </td>
                                 <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                       <span className="font-bold text-slate-800 text-sm">
                                         {order.shippingInfo?.fullName || order.user?.name || "Guest User"}
                                       </span>
                                       <span className="text-slate-500 text-xs mt-0.5 font-medium">
                                         {order.user?.email || "No Email"}
                                       </span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                                    {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                 </td>
                                 <td className="px-6 py-5 whitespace-nowrap">
                                    <span className="font-black text-slate-900 text-[15px]">
                                       {formatINR(order.totalAmount)}
                                    </span>
                                 </td>
                                 <td className="px-6 py-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="relative inline-block w-36">
                                       <select
                                          value={order.orderStatus}
                                          onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                          className={`w-full appearance-none pl-3 pr-8 py-2 rounded-lg text-xs font-bold border cursor-pointer focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all uppercase tracking-wider ${getStatusStyle(order.orderStatus)}`}
                                       >
                                          <option value="Pending">Pending</option>
                                          <option value="Processing">Processing</option>
                                          <option value="Shipped">Shipped</option>
                                          <option value="Delivered">Delivered</option>
                                          <option value="Cancelled">Cancelled</option>
                                       </select>
                                       <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50 text-slate-800" />
                                    </div>
                                 </td>
                                 <td className="px-6 py-5 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                       onClick={() => handleDeleteOrder(order._id)} 
                                       className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                       <Trash2 className="w-4 h-4"/>
                                    </button>
                                 </td>
                              </tr>
                              
                              {/* Expanded Row Content */}
                              {isExpanded && (
                                 <tr>
                                    <td colSpan="7" className="p-0 border-b border-slate-200">
                                       <div className="bg-slate-50/80 p-6 md:p-8 animate-in slide-in-from-top-2 fade-in duration-300 border-t border-slate-100 shadow-inner">
                                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                             <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                                                <h4 className="font-black text-slate-800 text-sm mb-5 flex items-center pb-3 border-b border-slate-100 uppercase tracking-widest">
                                                   <MapPin className="w-4 h-4 text-emerald-500 mr-2" /> Shipping Details
                                                </h4>
                                                <div className="space-y-2.5 text-sm">
                                                   <p className="text-slate-800 font-bold">{order.shippingInfo?.fullName}</p>
                                                   <p className="text-slate-600 font-medium">{order.shippingInfo?.address}</p>
                                                   <p className="text-slate-600 font-medium">{order.shippingInfo?.city}, {order.shippingInfo?.zipCode}</p>
                                                   <p className="text-slate-600 font-medium">{order.shippingInfo?.country}</p>
                                                   <div className="pt-3 mt-3 border-t border-slate-100 text-slate-600 flex items-center font-medium bg-slate-50 p-2 rounded-lg">
                                                      <Phone className="w-4 h-4 mr-2 text-slate-400" />
                                                      {order.shippingInfo?.phoneNo}
                                                   </div>
                                                </div>
                                             </div>
                                             
                                             <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                                                <h4 className="font-black text-slate-800 text-sm mb-5 flex items-center pb-3 border-b border-slate-100 uppercase tracking-widest">
                                                   <Package className="w-4 h-4 text-emerald-500 mr-2" /> Ordered Items
                                                </h4>
                                                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                                                   {order.orderItems?.map(item => {
                                                      if (!item) return null;
                                                      return (
                                                         <div key={item.product || Math.random()} className="flex justify-between items-center bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                                                            <div className="flex items-center text-sm">
                                                               <div className="bg-white text-slate-800 font-black px-2.5 py-1 rounded-md border border-slate-200 shadow-sm mr-4 text-xs">
                                                                  {item.quantity || 1}x
                                                               </div>
                                                               <span className="text-slate-800 font-bold">
                                                                  {item.name || "Unknown Item"}
                                                                  {item.size && <span className="ml-2 px-2 py-0.5 bg-slate-200/50 text-[10px] text-slate-600 rounded uppercase tracking-widest">Size: {item.size}</span>}
                                                               </span>
                                                            </div>
                                                            <span className="font-black text-slate-900 text-[15px]">
                                                               {formatINR(item.price || 0)}
                                                            </span>
                                                         </div>
                                                      )
                                                   })}
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center px-2">
                                                   <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Total Paid</span>
                                                   <span className="font-black text-emerald-600 text-xl">{formatINR(order.totalAmount)}</span>
                                                </div>
                                             </div>
                                          </div>
                                       </div>
                                    </td>
                                 </tr>
                              )}
                           </React.Fragment>
                        )
                     })}
                  </tbody>
               </table>
            </div>
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
               <div className="w-48 h-48 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mb-6 relative">
                  <div className="absolute inset-0 bg-indigo-50/50 rounded-full blur-xl"></div>
                  <Package className="w-16 h-16 text-slate-300 relative z-10" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">No matching orders found</h3>
               <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                  We couldn't find any orders matching your current search or filter criteria. Try adjusting your parameters or clear all filters to see everything.
               </p>
               <button 
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-6 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-xl text-sm font-bold hover:bg-emerald-50 transition-colors shadow-sm"
               >
                  <Filter className="w-4 h-4" />
                  Clear All Filters
               </button>
            </div>
         )}

         {/* Bottom Bar */}
         <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
               <span>Rows per page:</span>
               <select className="border border-slate-200 rounded-lg px-2 py-1 bg-white font-bold focus:outline-none focus:border-emerald-500 cursor-pointer">
                  <option>10</option>
                  <option>20</option>
                  <option>50</option>
               </select>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-sm text-slate-600 font-medium">Page 1 of 1</span>
               <div className="flex gap-1">
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed">
                     <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed">
                     <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>
      </div>
      

    </div>
  );
}
