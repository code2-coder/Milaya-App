import { RouterProvider } from "react-router";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CategoryProvider } from "./context/CategoryContext";
import { WishlistProvider } from "./context/WishlistContext";
import { Toaster } from "sonner";
import { router } from "./routes";
import { WhatsAppButton } from "./components/WhatsAppButton";

export default function App() {
  return (
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
  );
}
