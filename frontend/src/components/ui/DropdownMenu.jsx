import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";
import { User, Package, LayoutDashboard, LogOut, ChevronRight, Mail, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

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
                className="relative flex items-center justify-center p-2 text-black hover:text-gray-600 transition-colors duration-300 group focus:outline-none"
                title="Account"
            >
                <User className="w-[22px] h-[22px] group-hover:scale-110 transition-transform duration-300" strokeWidth={2} />
            </button>
 
            {open && (
                <div 
                    role="menu" 
                    aria-label="Account menu" 
                    className="absolute right-0 mt-3 w-[340px] bg-white/95 backdrop-blur-xl border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300 transform origin-top-right overflow-hidden"
                >
                    <div className="p-6 text-center border-b border-gray-100 mb-2 relative overflow-hidden rounded-t-xl">
                        {/* Decorative background element */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-gray-50/50 to-transparent -z-10" />
                        
                        <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 p-0.5 transition-transform hover:scale-105 duration-300">
                            <div className="w-full h-full bg-gradient-to-tr from-gray-900 to-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                                {user?.avatar?.url ? (
                                    <img src={user.avatar.url} alt={user.name || "User"} className="w-full h-full object-cover rounded-full" />
                                ) : user ? (
                                    <span className="text-xl text-white font-medium">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                                ) : (
                                    <User className="w-7 h-7 text-white/90" strokeWidth={1.5} />
                                )}
                            </div>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 tracking-tight">
                            {user ? `Welcome back, ${(user.name || "User").split(' ')[0]}` : "Welcome"}
                        </h4>
                        <p className="text-[13px] text-gray-500 mt-2 px-2 leading-relaxed">
                            {user ? "Manage your exclusive collections and orders." : "Sign in to access your saved collections and fast checkout."}
                        </p>
                    </div>
                    
                    {user ? (
                        <div className="flex flex-col gap-1 p-1">
                            <Link 
                                to="/account"
                                onClick={() => setOpen(false)}
                                className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                            >
                                <div className="flex items-center space-x-3 text-gray-600 group-hover:text-gray-900 transition-colors">
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">My Account</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors group-hover:translate-x-1 duration-200" />
                            </Link>
                            
                            <Link 
                                to="/orders"
                                onClick={() => setOpen(false)}
                                className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                            >
                                <div className="flex items-center space-x-3 text-gray-600 group-hover:text-gray-900 transition-colors">
                                    <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <Package className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">My Orders</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors group-hover:translate-x-1 duration-200" />
                            </Link>
                            
                            {isAdmin && (
                                <Link 
                                    to="/admin"
                                    onClick={() => setOpen(false)}
                                    className="group flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3 text-gray-600 group-hover:text-gray-900 transition-colors">
                                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                                            <LayoutDashboard className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Admin Dashboard</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-900 transition-colors group-hover:translate-x-1 duration-200" />
                                </Link>
                            )}

                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <button 
                                    onClick={() => {
                                        setOpen(false);
                                        logout();
                                    }}
                                    className="group w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-red-50 transition-all duration-200"
                                >
                                    <div className="flex items-center space-x-3 text-gray-500 group-hover:text-red-600 transition-colors">
                                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-red-100 transition-all">
                                            <LogOut className="w-4 h-4" />
                                        </div>
                                        <span className="text-sm font-medium">Sign Out</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 space-y-3 mt-1">
                            <button 
                                onClick={() => window.location.href = `${(import.meta.env.VITE_API_URL || 'https://milaya-app.onrender.com/api/v1').replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google`} 
                                className="w-full group flex items-center justify-center space-x-3 px-4 py-3 bg-white border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none rounded-xl shadow-sm hover:shadow active:scale-[0.98]"
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                            
                            <div className="relative flex items-center py-2">
                                <div className="flex-grow border-t border-gray-100"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-medium">OR</span>
                                <div className="flex-grow border-t border-gray-100"></div>
                            </div>

                            <Link 
                                to="/login"
                                onClick={() => setOpen(false)}
                                className="w-full group flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white font-medium text-sm hover:bg-black transition-all focus:outline-none rounded-xl shadow-md hover:shadow-lg active:scale-[0.98]"
                            >
                                <Mail className="w-4 h-4 text-gray-300 group-hover:text-white transition-colors" />
                                <span>Sign in with Email</span>
                            </Link>
                            
                            <div className="pt-4 pb-2 text-center">
                                <p className="text-sm text-gray-500">
                                    New here?{' '}
                                    <Link 
                                        to="/register" 
                                        onClick={() => setOpen(false)}
                                        className="text-gray-900 font-semibold hover:text-black hover:underline transition-colors inline-flex items-center space-x-1"
                                    >
                                        <span>Create an account</span>
                                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    </Link>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DropdownMenu;
