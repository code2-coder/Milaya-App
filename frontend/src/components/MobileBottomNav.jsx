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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe px-4 pb-4 pt-2 pointer-events-none">
      <div className="bg-white/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-gray-100/50 rounded-full flex items-center justify-between h-[68px] px-3 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              to={item.path} 
              className="relative z-10 flex-shrink-0"
              style={{ flexBasis: isActive ? 'auto' : 'auto' }}
            >
              <motion.div 
                className={`relative flex items-center justify-center px-4 py-3 rounded-full transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 hover:text-gray-600'}`}
                whileTap={{ scale: 0.92 }}
              >
                {/* Active Indicator Background Pill */}
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-pill" 
                    className="absolute inset-0 bg-black rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  />
                )}
                
                {/* Icon Container */}
                <div className="relative flex items-center">
                  <Icon strokeWidth={isActive ? 2.5 : 2} className={`w-[22px] h-[22px] transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                  
                  {/* Badge */}
                  {item.badge > 0 && (
                    <motion.span 
                      initial={{ scale: 0, opacity: 0 }} 
                      animate={{ scale: 1, opacity: 1 }} 
                      className={`absolute -top-2 -right-3 font-black text-[10px] w-5 h-5 min-w-[20px] flex items-center justify-center rounded-full border-2 shadow-sm z-20 ${
                        isActive 
                          ? 'bg-white text-black border-black' 
                          : 'bg-black text-white border-white'
                      }`}
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                </div>

                {/* Animated Text Label */}
                {isActive && (
                  <motion.span 
                    initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ width: "auto", opacity: 1, marginLeft: 8 }}
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="text-[11px] tracking-widest uppercase font-bold overflow-hidden whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
