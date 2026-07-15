import { 
  Package, 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Calendar,
  Download,
  AlertCircle,
  TrendingDown,
  Activity,
  Award
} from "lucide-react";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export function DashboardTab({ orders = [], products = [], setActiveTab }) {
  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.orderStatus === "Pending" || o.orderStatus === "Processing"
  ).length;

  const deliveredOrders = orders.filter((o) => o.orderStatus === "Delivered").length;
  const fulfillmentRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Calculate top performing segment (most common category in products)
  const categoryCounts = products.reduce((acc, p) => {
     const catName = p.category?.name || p.category;
     if (catName) {
        acc[catName] = (acc[catName] || 0) + 1;
     }
     return acc;
  }, {});
  let topCategory = "N/A";
  let maxCount = 0;
  for (const [category, count] of Object.entries(categoryCounts)) {
     if (count > maxCount) {
        maxCount = count;
        topCategory = category;
     }
  }

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(amount || 0);
  };

  // Process chart data from orders
  const processChartData = () => {
     if (!orders || orders.length === 0) return [];
     
     // Get last 7 days including today
     const data = [];
     for(let i=6; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
        const displayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Find orders on this date
        const dayOrders = orders.filter(o => {
           if(!o.createdAt) return false;
           return o.createdAt.startsWith(dateStr);
        });
        
        const revenue = dayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        data.push({
           name: displayStr,
           revenue: revenue,
           orders: dayOrders.length
        });
     }
     return data;
  };

  const chartData = processChartData();

  const handleExport = () => {
    if (!orders || orders.length === 0) {
       alert("No data to export");
       return;
    }
    
    const headers = ["Order ID", "Date", "Customer Name", "Status", "Total Amount", "Payment Method"];
    const csvContent = [
      headers.join(","),
      ...orders.map(o => {
         const customerName = o.shippingInfo?.fullName || o.user?.name || "Guest";
         return [
           o._id || o.id,
           o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-US') : 'N/A',
           customerName,
           o.orderStatus,
           o.totalAmount || 0,
           o.paymentMethod || 'N/A'
         ].map(val => `"${val}"`).join(",");
      })
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `store_orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
         <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-[15px] font-medium text-gray-500 mt-2">Welcome back. Here is your luxury boutique's performance today.</p>
         </div>
         <div className="flex items-center gap-3">
            <button className="flex items-center gap-2.5 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-semibold shadow-sm hover:shadow active:scale-95">
               <Calendar className="w-4 h-4 text-gray-400" />
               Last 30 Days
            </button>
            <button 
               onClick={handleExport}
               className="flex items-center gap-2.5 px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl transition-all text-sm font-semibold shadow-sm hover:shadow-md active:scale-95"
            >
               <Download className="w-4 h-4" />
               Export Data
            </button>
         </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
           <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                 <IndianRupee className="w-5 h-5 transition-colors" />
              </div>
              <span className="flex items-center text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100">
                 +12.5%
              </span>
           </div>
           <div className="relative z-10">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">Total Revenue</p>
              <h3 className="text-[2rem] leading-none font-bold text-gray-900 tracking-tight">{formatINR(totalRevenue)}</h3>
           </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
           <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                 <ShoppingBag className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <span className="flex items-center text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100">
                 +4.2%
              </span>
           </div>
           <div className="relative z-10">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">Total Orders</p>
              <h3 className="text-[2rem] leading-none font-bold text-gray-900 tracking-tight">{totalOrders}</h3>
           </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
           <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 group-hover:bg-red-600 group-hover:text-white transition-all duration-300">
                 <AlertCircle className="w-5 h-5 text-red-500 group-hover:text-white transition-colors" />
              </div>
              <span className="flex items-center text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100">
                 {pendingOrders} Urgent
              </span>
           </div>
           <div className="relative z-10">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">Pending Orders</p>
              <h3 className="text-[2rem] leading-none font-bold text-gray-900 tracking-tight">{pendingOrders}</h3>
           </div>
        </div>

        {/* Live Inventory */}
        <div className="bg-white rounded-2xl p-7 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
           <div className="flex justify-between items-start mb-8 relative z-10">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                 <Package className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <span className="flex items-center text-xs font-bold bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full border border-gray-200">
                 Active
              </span>
           </div>
           <div className="relative z-10">
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">Live Inventory</p>
              <h3 className="text-[2rem] leading-none font-bold text-gray-900 tracking-tight">{products.length}</h3>
           </div>
        </div>
      </div>

      {/* Content Split */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pt-2">
         {/* Revenue Analytics Chart */}
         <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[460px]">
            <div className="p-7 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl">
               <div>
                  <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
                  <p className="text-sm font-medium text-gray-500 mt-1">Daily revenue over the last 7 days</p>
               </div>
               <button 
                  onClick={() => setActiveTab && setActiveTab('orders')}
                  className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50"
               >
                  View Report
               </button>
            </div>
            <div className="flex-1 min-h-[350px] min-w-0 p-6 pt-10 pb-6 w-full">
               {chartData.length > 0 && chartData.some(d => d.revenue > 0) ? (
                 <ResponsiveContainer width="100%" height={350}>
                   <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#111827" stopOpacity={0.08}/>
                         <stop offset="95%" stopColor="#111827" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f3f4f6" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }} dy={12} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }} tickFormatter={(val) => `₹${val/1000}k`} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: '1px solid #f3f4f6', boxShadow: '0 4px 15px -3px rgba(0, 0, 0, 0.1), 0 2px 6px -2px rgba(0, 0, 0, 0.05)', padding: '12px 16px' }}
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                        labelStyle={{ color: '#111827', fontWeight: '800', fontSize: '14px', marginBottom: '8px' }}
                        itemStyle={{ color: '#4b5563', fontSize: '14px', fontWeight: '500' }}
                     />
                     <Area type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" activeDot={{ r: 6, strokeWidth: 0, fill: '#111827' }} />
                   </AreaChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-center">
                   <div className="w-20 h-20 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-6">
                      <TrendingUp className="w-10 h-10 text-gray-300" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
                   <p className="text-sm font-medium text-gray-500 max-w-sm mx-auto">Analytics will populate here once you start receiving orders in the last 7 days.</p>
                 </div>
               )}
            </div>
         </div>

         {/* Store Performance */}
         <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-[460px] relative">
            <div className="p-7 pb-4">
               <h2 className="text-lg font-bold text-gray-900">Store Metrics</h2>
               <p className="text-sm font-medium text-gray-500 mt-1">Real-time business performance</p>
            </div>
            
            <div className="p-7 space-y-10 flex-1">
               {/* Metric 1 */}
               <div className="group">
                  <div className="flex justify-between items-end mb-3">
                     <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{fulfillmentRate}%</h3>
                     <div className="p-2 bg-green-50 rounded-lg group-hover:scale-110 transition-transform">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                     </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-500 mb-4 tracking-wide">Fulfillment Rate</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${fulfillmentRate}%` }}></div>
                  </div>
               </div>

               {/* Metric 2 */}
               <div className="group">
                  <div className="flex justify-between items-end mb-3">
                     <h3 className="text-3xl font-bold text-gray-900 tracking-tight">{formatINR(averageOrderValue)}</h3>
                     <div className="p-2 bg-blue-50 rounded-lg group-hover:scale-110 transition-transform">
                        <IndianRupee className="w-5 h-5 text-blue-600" />
                     </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-500 mb-4 tracking-wide">Average Order Value</p>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out w-[100%]"></div>
                  </div>
               </div>
            </div>


         </div>
      </div>
    </div>
  );
}
