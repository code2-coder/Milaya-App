import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Link, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function AuthPopup() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // If user is already logged in, do not show
    if (user) return;

    // Check if the user has already dismissed it this session
    const hasSeenPopup = sessionStorage.getItem('hasSeenAuthPopup');
    if (hasSeenPopup) return;

    // Don't show on login or register pages
    if (location.pathname === '/login' || location.pathname === '/register') return;

    // Show after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, location.pathname]);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('hasSeenAuthPopup', 'true');
  };

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col items-center p-8 z-10 text-center"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-24 h-24 mb-4">
              <img 
                src="/loginlogo-removebg-preview.png" 
                alt="Milaya Logo" 
                className="w-full h-full object-contain filter drop-shadow-sm scale-125"
              />
            </div>

            <h2 className="text-3xl font-serif text-[#1A050A] mb-3">Join Milaya</h2>
            <p className="text-gray-500 font-light text-sm mb-8 leading-relaxed px-4">
              Create an account to unlock exclusive collections, early access to sales, and personalized recommendations.
            </p>

            <div className="w-full flex flex-col gap-3">
              <Link 
                to="/register" 
                onClick={handleClose}
                className="w-full bg-[#1A050A] text-white py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-widest hover:bg-[#2D0D18] hover:shadow-lg transition-all duration-300 flex items-center justify-center"
              >
                Create Account
              </Link>
              <Link 
                to="/login" 
                onClick={handleClose}
                className="w-full bg-transparent text-[#1A050A] py-3.5 rounded-xl text-[13px] font-bold uppercase tracking-widest border border-[#1A050A]/20 hover:border-[#1A050A] hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
              >
                Sign In
              </Link>
            </div>
            
            <p className="text-[11px] text-gray-400 mt-6 max-w-[280px]">
              By continuing, you agree to Milaya's <Link to="/terms" onClick={handleClose} className="underline hover:text-black">Terms of Service</Link> and <Link to="/privacy" onClick={handleClose} className="underline hover:text-black">Privacy Policy</Link>.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
