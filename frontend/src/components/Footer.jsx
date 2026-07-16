import React from 'react';
import { Link } from 'react-router';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  MapPin, 
  Phone, 
  Mail, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useCategory } from '../context/CategoryContext';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { categories } = useCategory();

  return (
    <footer className="w-full bg-black text-white font-sans pt-16 border-t border-stone-800">
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MAIN FOOTER COLUMNS (4 Columns for better spacing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          
          {/* Column 1: Brand Story & Contact */}
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-8 block">
               <div className="w-32 h-32 rounded-2xl bg-white flex items-center justify-center shadow-lg overflow-hidden">
                 <img src="/logo.jpeg" alt="Milaya Clothing" className="w-[85%] h-[85%] object-contain" />
               </div>
            </Link>
            <p className="text-stone-300 font-light text-[14px] leading-relaxed mb-8">
              Crafting timeless clothing that beautifully blends tradition, elegance, and exceptional craftsmanship. Designed to celebrate life's most cherished moments.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-4 text-stone-400 text-[14px] font-light">
                <MapPin className="w-5 h-5 text-white mt-0.5 shrink-0" />
                <span>Aluva, Ernakulam, Kerala, India</span>
              </li>
              <li className="flex items-start gap-4 text-stone-400 text-[14px] font-light">
                <Phone className="w-5 h-5 text-white mt-0.5 shrink-0" />
                <a href="tel:+919544174140" className="hover:text-white transition-colors">+91 95441 74140</a>
              </li>

              <li className="flex items-center gap-4 text-stone-400 text-[14px] font-light">
                <Mail className="w-5 h-5 text-white shrink-0" />
                <a href="mailto:milayfashion@gmail.com" className="hover:text-white transition-colors">milayfashion@gmail.com</a>
              </li>
            </ul>
            <div className="flex items-center gap-5 mt-2">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a 
                  key={i} 
                  href="#" 
                  className="text-stone-400 hover:text-white transition-all duration-300 transform hover:-translate-y-1 hover:scale-110"
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col">
            <h4 className="font-serif text-[20px] text-white mb-8 border-b border-stone-800 pb-4">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: 'Home', path: '/' },
                { name: 'Shop All', path: '/shop' },
                { name: 'New Arrivals', path: '/shop?sort=newest' },
                { name: 'Best Sellers', path: '/shop?sort=bestsellers' },
                { name: 'About Us', path: '/about' },
                { name: 'Contact Us', path: '/contact' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-stone-400 text-[14px] hover:text-white transition-colors duration-300 flex items-center group w-fit">
                    <ChevronRight className="w-4 h-4 text-white opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2" />
                    <span className="font-light">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="flex flex-col">
            <h4 className="font-serif text-[20px] text-white mb-8 border-b border-stone-800 pb-4">Support</h4>
            <ul className="space-y-4">
              {[
                { name: 'FAQs', path: '/faqs' },
                { name: 'Shipping Policy', path: '/shipping-policy' },
                { name: 'Return & Exchange Policy', path: '/return-policy' },
                { name: 'Privacy Policy', path: '/privacy' },
                { name: 'Terms & Conditions', path: '/terms' },
                { name: 'Track Your Order', path: '/orders' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-stone-400 text-[14px] hover:text-white transition-colors duration-300 flex items-center group w-fit">
                    <ChevronRight className="w-4 h-4 text-white opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2" />
                    <span className="font-light">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Featured Collections */}
          <div className="flex flex-col">
            <h4 className="font-serif text-[20px] text-white mb-8 border-b border-stone-800 pb-4">Collections</h4>
            <ul className="space-y-4">
              {(categories || [])
                .filter(c => !c.parentCategory)
                .map((cat) => (
                <li key={cat._id}>
                  <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="text-stone-400 text-[14px] hover:text-white transition-colors duration-300 flex items-center group gap-3 w-fit">
                    <span className="text-[10px] text-white opacity-70 group-hover:opacity-100 transition-all">✦</span>
                    <span className="font-light">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="border-t border-stone-800 pt-8 pb-10 flex flex-col items-center justify-center relative mt-8 text-center">
          
          <div className="flex items-center gap-3 mb-8 text-white">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-stone-400 opacity-60" />
            <span className="font-serif italic text-[14px] md:text-[16px] tracking-wider text-stone-300">
              Crafted with Tradition <span className="text-stone-700 mx-1.5">•</span> Designed for Timeless Elegance <span className="text-stone-700 mx-1.5">•</span> Worn with Pride
            </span>
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-stone-400 opacity-60" />
          </div>

          <div className="flex flex-col items-center gap-3">
            <p className="text-stone-500 text-[13px] font-light tracking-wider uppercase">
               © {currentYear} Milaya Clothing. All Rights Reserved.
            </p>
            <p className="text-stone-500 text-[12px] font-light tracking-wide">
              Thoughtfully Designed & Developed with <span className="inline-block animate-pulse text-rose-500 mx-0.5" style={{ animationDuration: '2s' }}>❤️</span> by <a href="#" className="text-stone-300 font-medium tracking-wider hover:text-white transition-colors duration-300">CodeFusionProjects</a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}
