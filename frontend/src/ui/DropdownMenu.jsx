import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { User, Package, LayoutDashboard, LogOut, ChevronRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function DropdownMenu({ className = '' }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { user, logout, isAdmin } = useAuth();

    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onClick);
            document.removeEventListener('keydown', onKey);
        };
    }, []);

    return (
        <div className={`relative ${className}`} ref={ref}>
            <button
                onClick={() => setOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                className="relative flex items-center justify-center p-2 text-black transition-colors duration-300 group focus:outline-none"
                title="Account"
            >
                <User className="w-[22px] h-[22px] group-hover:scale-110 transition-transform duration-300" strokeWidth={2.5} />
            </button>
 
            {open && (
                <div 
                    role="menu" 
                    aria-label="Account menu" 
                    className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 shadow-xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-200 transform origin-top-right"
                >
                    <div className="p-6 text-center border-b border-gray-100 mb-2 bg-gray-50 rounded-xl">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-900 rounded-full flex items-center justify-center shadow-sm border-2 border-white">
                            {user?.avatar?.url ? (
                                <img src={user.avatar.url} alt={user.name || "User"} className="w-full h-full object-cover rounded-full" />
                            ) : user ? (
                                <span className="text-2xl text-white font-medium">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                            ) : (
                                <User className="w-8 h-8 text-white" />
                            )}
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900">
                            {user ? `Welcome, ${(user.name || "User").split(' ')[0]}` : "Welcome"}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium mt-1.5 px-2">
                            {user ? "Manage your exclusive collections and orders." : "Sign in to access your collections and fast checkout."}
                        </p>
                    </div>
                    
                    {user ? (
                        <div className="flex flex-col gap-1">
                            <Link 
                                to="/account"
                                onClick={() => setOpen(false)}
                                className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-3 text-gray-700">
                                    <div className="p-2 bg-white border border-gray-100 rounded-lg group-hover:border-gray-200 transition-colors">
                                        <User className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                    </div>
                                    <span className="text-sm font-medium">My Account</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                            </Link>
                            
                            <Link 
                                to="/orders"
                                onClick={() => setOpen(false)}
                                className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center space-x-3 text-gray-700">
                                    <div className="p-2 bg-white border border-gray-100 rounded-lg group-hover:border-gray-200 transition-colors">
                                        <Package className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                    </div>
                                    <span className="text-sm font-medium">My Orders</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                            </Link>
                            
                            {isAdmin && (
                                <Link 
                                    to="/admin"
                                    onClick={() => setOpen(false)}
                                    className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3 text-gray-700">
                                        <div className="p-2 bg-white border border-gray-100 rounded-lg group-hover:border-gray-200 transition-colors">
                                            <LayoutDashboard className="w-4 h-4 text-gray-400 group-hover:text-gray-900 transition-colors" />
                                        </div>
                                        <span className="text-sm font-medium">Admin Dashboard</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors" />
                                </Link>
                            )}

                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <button 
                                    onClick={() => {
                                        setOpen(false);
                                        logout();
                                    }}
                                    className="group w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3 text-red-600">
                                        <div className="p-2 bg-white border border-red-100 rounded-lg group-hover:border-red-200 transition-colors">
                                            <LogOut className="w-4 h-4 text-red-500" />
                                        </div>
                                        <span className="text-sm font-medium">Sign Out</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-2 space-y-2">
                            <button 
                                onClick={() => window.location.href = `${(import.meta.env.VITE_API_URL || 'https://milaya.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google`} 
                                className="w-full group flex items-center justify-center space-x-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
                            </button>
                            
                            <Link 
                                to="/login"
                                onClick={() => setOpen(false)}
                                className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-colors focus:outline-none"
                            >
                                <span className="text-sm font-medium">Sign in with Email</span>
                            </Link>
                            
                            <div className="pt-2 text-center">
                                <Link 
                                    to="/register" 
                                    onClick={() => setOpen(false)}
                                    className="inline-block text-xs text-gray-500 hover:text-gray-900 font-medium hover:underline transition-colors py-2"
                                >
                                    Create an Account
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DropdownMenu;
