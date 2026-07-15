import React, { useState, useEffect, useMemo } from "react";
import api from "../api/axios";
import { toast } from "sonner";
import { AdminReturnCard } from "../components/returns/AdminReturnCard";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { CheckCircle2, Clock, Truck, RotateCcw, Package, XCircle, Search, FilterX, RefreshCcw, Repeat } from "lucide-react";

export const AdminReturnsList = () => {
  const [returns, setReturns] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filters and Search
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        const { data } = await api.get("/admin/returns");
        setReturns(data.returns);
        setAnalytics(data.analytics);
      } catch (error) {
        toast.error("Failed to fetch returns data");
      } finally {
        setLoading(false);
      }
    };
    fetchReturns();
  }, []);

  const statCards = [
    { name: 'Total Requests', value: analytics?.totalReturns || 0, icon: Package, color: 'text-gray-700', bg: 'bg-gray-100' },
    { name: 'Pending Review', value: analytics?.pendingReview || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Approved', value: analytics?.approved || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Rejected', value: analytics?.rejected || 0, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
    { name: 'Pickup Scheduled', value: analytics?.pickupScheduled || 0, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Pickup Completed', value: analytics?.pickupCompleted || 0, icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Products Received', value: analytics?.productsReceived || 0, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Inspection Pending', value: analytics?.inspectionPending || 0, icon: Search, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Refund Processing', value: analytics?.refundProcessing || 0, icon: RotateCcw, color: 'text-teal-600', bg: 'bg-teal-100' },
    { name: 'Refund Completed', value: analytics?.refundCompleted || 0, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Replacement Requests', value: analytics?.replacementRequests || 0, icon: RefreshCcw, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { name: 'Exchange Requests', value: analytics?.exchangeRequests || 0, icon: Repeat, color: 'text-fuchsia-600', bg: 'bg-fuchsia-100' },
  ];

  const filteredReturns = useMemo(() => {
    let result = returns;
    
    // Status Filter
    if (filter !== "All") {
      result = result.filter(r => r.status === filter);
    }
    
    // Search Query
    if (searchQuery.trim() !== "") {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.returnNumber?.toLowerCase().includes(lowerQuery) ||
        r.user?.name?.toLowerCase().includes(lowerQuery) ||
        r.product?.name?.toLowerCase().includes(lowerQuery)
      );
    }
    
    return result;
  }, [returns, filter, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#F8FAFC]">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex font-sans">
      <AdminSidebar activeTab="returns" setActiveTab={() => {}} />
      
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 bg-[#F8FAFC]">
        
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Returns Management</h2>
        </header>

        {/* Main Content */}
        <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-8 relative z-0 animate-in fade-in duration-500">
          
          {/* Analytics Dashboard Grid */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mb-8">
            {statCards.map((stat) => (
              <div 
                key={stat.name} 
                onClick={() => setFilter(stat.name === 'Total Requests' ? 'All' : stat.name)}
                className={`relative bg-white p-5 rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden group
                  ${filter === stat.name || (stat.name === 'Total Requests' && filter === 'All')
                    ? 'border-gray-900 shadow-md scale-[1.02]' 
                    : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-300'
                  }
                `}
              >
                <div className="flex flex-col justify-between h-full gap-4 relative z-10">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} transition-transform duration-300 group-hover:scale-110`}>
                    <stat.icon className="w-6 h-6" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-xs font-semibold text-gray-500 tracking-wide uppercase leading-tight">{stat.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {filter === "All" ? "All Returns" : `${filter} Returns`}
                <span className="bg-gray-100 text-gray-600 py-1 px-3 rounded-full text-sm font-bold">
                  {filteredReturns.length}
                </span>
              </h2>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search ID, Customer, or Product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-200 focus:bg-white focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900"
                />
              </div>

              {/* Clear Filters Button */}
              {(filter !== "All" || searchQuery !== "") && (
                <button
                  onClick={() => {
                    setFilter("All");
                    setSearchQuery("");
                  }}
                  className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-red-100 transition-colors whitespace-nowrap"
                >
                  <FilterX className="w-4 h-4" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* List of Returns */}
          <div className="space-y-4">
            {filteredReturns.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No Returns Found</h3>
                <p className="text-gray-500 font-medium">
                  We couldn't find any return requests matching your search or filter.
                </p>
                {(filter !== "All" || searchQuery !== "") && (
                  <button 
                    onClick={() => { setFilter("All"); setSearchQuery(""); }}
                    className="mt-6 bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredReturns.map((returnReq) => (
                  <AdminReturnCard key={returnReq._id} returnReq={returnReq} />
                ))}
              </div>
            )}
          </div>
          
        </main>
      </div>
    </div>
  );
};
