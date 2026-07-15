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
    <footer className="w-full bg-white font-sans pt-16 border-t border-[#B8934E]/20">
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* MAIN FOOTER COLUMNS (4 Columns for better spacing) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20">
          
          {/* Column 1: Brand Story & Contact */}
          <div className="flex flex-col items-start">
            <Link to="/" className="mb-8 block">
               <div className="w-32 h-32 rounded-2xl bg-white border-2 border-[#B8934E]/30 flex items-center justify-center shadow-md overflow-hidden">
                 <img src="/logo.jpeg" alt="Milaya Clothing" className="w-[85%] h-[85%] object-contain" />
               </div>
            </Link>
            <p className="text-gray-600 font-light text-[14px] leading-relaxed mb-8">
              Crafting timeless clothing that beautifully blends tradition, elegance, and exceptional craftsmanship. Designed to celebrate life's most cherished moments.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-4 text-gray-700 text-[14px] font-light">
                <MapPin className="w-5 h-5 text-[#B8934E] mt-0.5 shrink-0" />
                <span>Vrindavan, District Mathura Uttar Pradesh, India 281121</span>
              </li>
              <li className="flex items-start gap-4 text-gray-700 text-[14px] font-light">
                <Phone className="w-5 h-5 text-[#B8934E] mt-0.5 shrink-0" />
                <a href="tel:+919152350955" className="hover:text-[#B8934E] transition-colors">+91 91523 50955</a>
              </li>

              <li className="flex items-center gap-4 text-gray-700 text-[14px] font-light">
                <Mail className="w-5 h-5 text-[#B8934E] shrink-0" />
                <a href="mailto:info@milaya.com" className="hover:text-[#B8934E] transition-colors">info@milaya.com</a>
              </li>
            </ul>
            <div className="flex items-center gap-3">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-[#B8934E]/30 hover:bg-[#B8934E] hover:text-white text-[#B8934E] transition-all duration-300 shadow-sm hover:shadow-md">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="flex flex-col">
            <h4 className="font-serif text-[20px] text-gray-900 mb-8 border-b border-gray-100 pb-4">Quick Links</h4>
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
                  <Link to={link.path} className="text-gray-600 text-[14px] hover:text-[#B8934E] transition-colors duration-300 flex items-center group w-fit">
                    <ChevronRight className="w-4 h-4 text-[#B8934E] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2" />
                    <span className="font-light">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Customer Support */}
          <div className="flex flex-col">
            <h4 className="font-serif text-[20px] text-gray-900 mb-8 border-b border-gray-100 pb-4">Support</h4>
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
                  <Link to={link.path} className="text-gray-600 text-[14px] hover:text-[#B8934E] transition-colors duration-300 flex items-center group w-fit">
                    <ChevronRight className="w-4 h-4 text-[#B8934E] opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 mr-2" />
                    <span className="font-light">{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Featured Collections */}
          <div className="flex flex-col">
            <h4 className="font-serif text-[20px] text-gray-900 mb-8 border-b border-gray-100 pb-4">Collections</h4>
            <ul className="space-y-4">
              {(categories || [])
                .filter(c => !c.parentCategory)
                .map((cat) => (
                <li key={cat._id}>
                  <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} className="text-gray-600 text-[14px] hover:text-[#B8934E] transition-colors duration-300 flex items-center group gap-3 w-fit">
                    <span className="text-[10px] text-[#B8934E] opacity-70 group-hover:opacity-100 transition-all">✦</span>
                    <span className="font-light">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* BOTTOM FOOTER */}
        <div className="border-t border-gray-100 py-8 flex flex-col items-center justify-center relative mt-8">
          
          <div className="flex items-center gap-3 mb-6 text-[#B8934E]">
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
            <span className="font-serif italic text-[16px] tracking-wide text-gray-800">
              Crafted with Tradition • Designed with Elegance • Trusted for Generations
            </span>
            <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          </div>

          <p className="text-gray-500 text-[13px] font-light tracking-wide">
             © {currentYear} Milaya Clothing. All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
