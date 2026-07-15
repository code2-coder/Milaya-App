import { Home, Heart, ShoppingBag, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { motion } from 'motion/react';

export const MobileBottomNav = () => {
  const location = useLocation();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    { name: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartCount },
    { name: 'Account', path: '/account', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-300 ${isActive ? 'text-[#800000]' : 'text-black'}`}
            >
              <div className="relative">
                <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                {item.badge > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    className="absolute -top-1.5 -right-2 bg-[#800000] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white"
                  >
                    {item.badge}
                  </motion.span>
                )}
              </div>
              <span className="text-[9px] tracking-widest uppercase transition-all duration-300 font-bold">
                {item.name}
              </span>
              {isActive && (
                <motion.div layoutId="mobile-nav-indicator" className="absolute top-0 w-8 h-[2px] bg-[#800000] rounded-b-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
