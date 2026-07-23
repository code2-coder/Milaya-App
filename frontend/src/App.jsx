import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CategoryProvider } from "./context/CategoryContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Toaster } from "sonner";
import { router } from "./routes";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { useState, useEffect } from "react";

export default function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(() => setIsAppLoading(false), 500);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {isAppLoading && (
        <div className={`fixed inset-0 z-[9999] bg-[#030303] flex flex-col items-center justify-center transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${fadeOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"}`}>
          <style>
            {`
              @keyframes spin-slow {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
              @keyframes spin-reverse {
                from { transform: rotate(360deg); }
                to { transform: rotate(0deg); }
              }
              @keyframes float-logo {
                0%, 100% { transform: scale(1.1) translateY(0); filter: drop-shadow(0px 0px 15px rgba(255,255,255,0.05)); }
                50% { transform: scale(1.15) translateY(-4px); filter: drop-shadow(0px 10px 25px rgba(255,255,255,0.15)); }
              }
              @keyframes progress-line {
                0% { width: 0%; left: 0; opacity: 0; }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { width: 100%; left: 100%; opacity: 0; }
              }
            `}
          </style>
          
          {/* Subtle ambient light in the center */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_0%,transparent_40%)]"></div>

           <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 mb-2">
             {/* Elegant SVG Rings */}
             <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
               {/* Outer track */}
               <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
               {/* Outer spinner */}
               <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="0.75" strokeDasharray="50 250" strokeLinecap="round" className="origin-center" style={{ animation: 'spin-slow 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
               
               {/* Inner track */}
               <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
               {/* Inner spinner */}
               <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="30 250" strokeLinecap="round" className="origin-center" style={{ animation: 'spin-reverse 4s linear infinite' }} />
               
               {/* Innermost subtle track */}
               <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.25" strokeDasharray="2 4" className="origin-center" style={{ animation: 'spin-slow 10s linear infinite' }} />
             </svg>
             
             {/* Glowing Aura behind logo */}
             <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-32 h-32 md:w-48 md:h-48 bg-white/5 rounded-full blur-2xl" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></div>
             </div>
             
             {/* Logo in center */}
             <img 
               src="/updatelogo-removebg-preview.png" 
               alt="Milaya Clothing" 
               className="w-32 h-32 md:w-44 md:h-44 object-contain relative z-10" 
               style={{ animation: 'float-logo 4s ease-in-out infinite' }}
             />
           </div>
           
           <div className="flex flex-col items-center gap-6 z-10 relative">
             <p className="text-[10px] md:text-[11px] tracking-[0.5em] md:tracking-[0.7em] uppercase font-bold text-white/80" style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>
               Curating Excellence
             </p>
             
             {/* Minimalist Progress Line */}
             <div className="w-40 md:w-56 h-[1px] bg-white/10 relative overflow-hidden rounded-full">
                <div className="absolute top-0 left-0 h-full bg-white/80 rounded-full" style={{ animation: 'progress-line 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}></div>
             </div>
           </div>
        </div>
      )}
      <AuthProvider>
        <CategoryProvider>
          <CartProvider>
              <WishlistProvider>
                <RouterProvider router={router} />
                <WhatsAppButton />
                <Toaster 
                  position="top-center"
                  expand={false}
                  richColors={false}
                  toastOptions={{
                    duration: 4000,
                    className: 'group flex items-start gap-4 p-4 rounded-xl shadow-2xl border font-sans w-full max-w-sm transition-all duration-300',
                    classNames: {
                      toast: 'bg-white border-gray-100 text-obsidian',
                      title: 'text-[13px] font-bold uppercase tracking-widest',
                      description: 'text-xs text-gray-500 mt-1',
                      actionButton: 'bg-[#B8934E] text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider',
                      cancelButton: 'bg-gray-100 text-obsidian px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider',
                      success: 'bg-[#FAFDFB] border-[#D1EADC] text-[#006622] [&_[data-title]]:text-[#006622] [&_[data-icon]]:text-[#006622]',
                      error: 'bg-[#FEFAFA] border-[#FAD2D2] text-[#800000] [&_[data-title]]:text-[#800000] [&_[data-icon]]:text-[#800000]',
                      warning: 'bg-[#FFFEFA] border-[#FDECC8] text-[#996B00] [&_[data-title]]:text-[#996B00] [&_[data-icon]]:text-[#996B00]',
                      info: 'bg-[#FAFCFF] border-[#D2E6FA] text-[#004A99] [&_[data-title]]:text-[#004A99] [&_[data-icon]]:text-[#004A99]',
                    }
                  }}
                />
              </WishlistProvider>
            </CartProvider>
        </CategoryProvider>
      </AuthProvider>
    </>
  );
}
