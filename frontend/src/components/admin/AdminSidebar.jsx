import { 
    LayoutDashboard, 
    ShoppingCart, 
    Package, 
    Image as ImageIcon, 
    Tags, 
    LogOut,
    Menu,
    X,
    FileText,
    Settings,
    Plus,
    ListFilter,
    RotateCcw,
    Truck,
    Coins,
    Star
  } from "lucide-react";
  import { useState } from "react";
  import { useNavigate, useLocation, Link } from "react-router";
  
  export function AdminSidebar({ activeTab, setActiveTab }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
  
    const menuItems = [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "orders", label: "Orders", icon: ShoppingCart },
      { id: "products", label: "Products", icon: Package },
      { id: "returns", label: "Returns", icon: RotateCcw, link: "/admin/returns" },
      { id: "shipping", label: "Shipping", icon: Truck, link: "/admin/shipping" },
      { id: "banners", label: "Banners", icon: ImageIcon },
      { id: "reviews", label: "Reviews", icon: Star },
      { id: "ad-posters", label: "Ads Posters", icon: FileText },
      { id: "categories", label: "Categories", icon: Tags },
      { id: "pages", label: "Manage Terms & Conditions", icon: FileText },

    ];
  
    const navContent = (
      <div className="flex flex-col h-full bg-white w-64 border-r border-gray-100">
        {/* Branding */}
        <div className="px-6 py-8 border-b border-gray-100">
          <Link
            to="/"
            className="group inline-block"
            title="Go to Home"
          >
            <h2 className="text-xl font-bold text-gray-900 tracking-tight transition-colors duration-200 group-hover:text-amber-600">
              Milaya
            </h2>
          </Link>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.15em] uppercase mt-1">Admin Portal</p>
        </div>
        
        {/* Navigation */}
        <div className="px-4 py-6 flex-1 overflow-y-auto">
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === "shipping" && location.pathname.startsWith("/admin/shipping")) || (item.id === "returns" && location.pathname.startsWith("/admin/returns"));
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.link) {
                      navigate(item.link);
                    } else {
                      if (location.pathname !== '/admin') {
                        navigate('/admin', { state: { activeTab: item.id } });
                      } else {
                        setActiveTab(item.id);
                      }
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? "bg-gray-100 text-gray-900 font-medium" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-gray-900" : "text-gray-400"}`} />
                  <span className="text-sm font-medium tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
  
        {/* Bottom Actions */}
        <div className="px-4 pb-6 space-y-2">

  

          <button 
             onClick={() => navigate("/")}
             className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    );
  
    return (
      <>
        {/* Mobile menu button */}
        <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white z-50 flex items-center px-4 justify-between border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="font-bold text-gray-900 tracking-tight transition-colors duration-200 hover:text-amber-600"
              title="Go to Home"
            >
              Milaya
            </Link>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-500 hover:text-gray-900 focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
  
        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div 
              className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl border-r border-gray-100">
              {navContent}
            </div>
          </div>
        )}
  
        {/* Desktop sidebar */}
        <div className="hidden lg:flex flex-col w-64 fixed inset-y-0 z-30">
          {navContent}
        </div>
      </>
    );
  }
  
