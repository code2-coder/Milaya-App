import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import api from "../api/axios";
import { Search, Bell, HelpCircle } from "lucide-react";


// Import Refactored Components
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { DashboardTab } from "../components/admin/DashboardTab";
import { OrdersTab } from "../components/admin/OrdersTab";
import { ProductsTab } from "../components/admin/ProductsTab";
import { BannersTab } from "../components/admin/BannersTab";
import { CategoriesTab } from "../components/admin/CategoriesTab";
import { AdPostersTab } from "../components/admin/AdPostersTab";
import { AdminSettingsPanel } from "../components/AdminSettingsPanel";
import { PagesTab } from "../components/admin/PagesTab";

import { ReviewsTab } from "../components/admin/ReviewsTab";

export function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || "dashboard");

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  const [globalSearch, setGlobalSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [adPosters, setAdPosters] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Clear search when switching tabs
  useEffect(() => {
    setGlobalSearch("");
  }, [activeTab]);

  // Helper function to format INR cleanly
  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  // Load backend data
  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [ordersRes, productsRes, bannersRes, categoriesRes, adPostersRes, sizesRes, attributesRes] = await Promise.all([
          api.get("/admin/orders"),
          api.get("/admin/products"),
          api.get("/banners"),
          api.get("/categories"),
          api.get("/ad-posters"),
          api.get("/sizes").catch(err => {
             console.warn("Sizes API not available on this server yet.");
             return { data: { sizes: [] } };
          }),
          api.get("/attributes").catch(err => ({ data: { attributes: [] } }))
        ]);
        const ordersData = ordersRes.data.data?.orders || ordersRes.data.orders || [];
        setOrders([...ordersData].reverse());
        setProducts(productsRes.data.data?.products || productsRes.data.products || []);
        setBanners(bannersRes.data.data?.banners || bannersRes.data.banners || []);
        setAdPosters(adPostersRes.data.data?.adPosters || adPostersRes.data.adPosters || []);
        setCategories(categoriesRes.data.data?.categories || categoriesRes.data.categories || []);
        setSizes(sizesRes.data.data?.sizes || sizesRes.data.sizes || []);
        setAttributes(attributesRes.data.data?.attributes || attributesRes.data.attributes || []);
      } catch (error) {
        toast.error("Failed to fetch admin data.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin, navigate]);

  // Global Actions (Orders)
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}`, { status: newStatus });
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, orderStatus: newStatus } : order
      ));
      toast.success("Order status updated!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      await api.delete(`/admin/orders/${orderId}`);
      setOrders(orders.filter(order => order._id !== orderId));
      toast.success("Order deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete order");
    }
  };

  if (!user || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-white flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64 bg-gray-50">
        
        {/* Top Navigation Bar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
          {/* Search Bar */}
          <div className="flex-1 max-w-xl relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder={
                activeTab === "products" ? "Search product catalogue..." :
                activeTab === "orders" ? "Search orders, clients..." :
                activeTab === "categories" ? "Search categories..." :
                activeTab === "attributes" ? "Search attributes..." :
                "Search here..."
              }
              className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-900 transition-all placeholder-gray-400 text-gray-900"
            />
          </div>

            {/* Right Actions & Profile */}
          <div className="flex items-center space-x-4 ml-4">
            <button className="text-gray-400 hover:text-gray-900 transition-colors relative p-2 hover:bg-gray-50 rounded-lg">
               <Bell className="w-5 h-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-50 rounded-lg">
               <HelpCircle className="w-5 h-5" />
            </button>
            
            <div className="h-6 w-px bg-gray-200 mx-2"></div>
            
            <div className="flex items-center space-x-3 cursor-pointer p-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group">
               <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name || "Admin User"}</p>
                  <p className="text-[11px] font-semibold text-gray-500 leading-none">{user?.role === "admin" ? "Store Owner" : "Admin"}</p>
               </div>
               <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-900 overflow-hidden ring-2 ring-transparent group-hover:ring-gray-200 transition-all flex items-center justify-center text-white shadow-sm">
                     <img src={user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || "Admin")}&background=111827&color=fff&bold=true`} alt={user?.name || "Admin"} className="w-full h-full object-cover" />
                  </div>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
               </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-[1400px] mx-auto p-6 md:p-10 relative z-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
              <p className="text-gray-500 font-medium animate-pulse tracking-wide uppercase text-xs">Loading data...</p>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500 ease-out">
              {activeTab === "dashboard" && (
                <DashboardTab orders={orders} products={products} setActiveTab={setActiveTab} />
              )}

              {activeTab === "orders" && (
                <OrdersTab 
                   orders={orders} 
                   formatINR={formatINR} 
                   updateOrderStatus={updateOrderStatus} 
                   handleDeleteOrder={handleDeleteOrder} 
                   globalSearch={globalSearch}
                   setGlobalSearch={setGlobalSearch}
                />
              )}

              {activeTab === "products" && (
                <ProductsTab 
                   products={products}
                   setProducts={setProducts}
                   categories={categories}
                   setCategories={setCategories}
                   sizes={sizes}
                   setSizes={setSizes}
                   attributes={attributes}
                   setAttributes={setAttributes}
                   formatINR={formatINR}
                   globalSearch={globalSearch}
                   setGlobalSearch={setGlobalSearch}
                />
              )}

              {activeTab === "banners" && (
                <BannersTab 
                   banners={banners} 
                   setBanners={setBanners} 
                   globalSearch={globalSearch}
                />
              )}

              {activeTab === "ad-posters" && (
                <AdPostersTab 
                   adPosters={adPosters} 
                   setAdPosters={setAdPosters} 
                   globalSearch={globalSearch}
                />
              )}

              {activeTab === "categories" && (
                <CategoriesTab 
                   categories={categories} 
                   setCategories={setCategories} 
                   globalSearch={globalSearch}
                />
              )}

              {activeTab === "pages" && (
                <PagesTab />
              )}



              {activeTab === "reviews" && (
                <ReviewsTab />
              )}

              {activeTab === "settings" && (
                <AdminSettingsPanel />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
