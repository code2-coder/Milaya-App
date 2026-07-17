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
        <div className={`fixed inset-0 z-[9999] bg-[#FCFAF8] flex flex-col items-center justify-center transition-all duration-[1000ms] ease-in-out ${fadeOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"}`}>
           <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80">
             {/* Expanding glowing ripples */}
             <div className="absolute inset-0 bg-[#800000]/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
             <div className="absolute inset-4 md:inset-8 bg-[#800000]/5 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1s' }}></div>
             
             {/* Elegant spinning rings */}
             <div className="absolute inset-10 md:inset-16 rounded-full border-[1px] border-dashed border-[#B8934E]/50 animate-[spin_10s_linear_infinite]"></div>
             <div className="absolute inset-14 md:inset-20 rounded-full border-[1px] border-stone-200 border-t-[#800000] border-l-transparent animate-[spin_3s_ease-in-out_infinite]"></div>
             
             {/* Logo in center */}
             <img 
               src="/loginlogo-removebg-preview.png" 
               alt="Milaya Clothing" 
               className="w-28 h-28 md:w-40 md:h-40 object-contain scale-[1.5] relative z-10 animate-[pulse_4s_ease-in-out_infinite]" 
               style={{ filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.05))' }}
             />
           </div>
           
           <div className="mt-6 md:mt-8 flex flex-col items-center gap-4">
             <div className="flex gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#800000] animate-bounce" style={{ animationDuration: '1s' }}></div>
               <div className="w-1.5 h-1.5 rounded-full bg-[#B8934E] animate-bounce" style={{ animationDuration: '1s', animationDelay: '0.2s' }}></div>
               <div className="w-1.5 h-1.5 rounded-full bg-black animate-bounce" style={{ animationDuration: '1s', animationDelay: '0.4s' }}></div>
             </div>
             <p className="text-[10px] md:text-xs tracking-[0.4em] uppercase font-light text-stone-500 animate-pulse" style={{ animationDuration: '3s' }}>
               Welcome to Milaya
             </p>
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
