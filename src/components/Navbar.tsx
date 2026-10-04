import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Menu, X, Search, ChevronDown, ArrowRight, ShoppingCart } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCart } from '../contexts/CartContext';

import logoImg from '../assets/images/kobbi_labs_final_logo_1790937512033.jpg';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const { cartItems } = useCart();
  const [role, setRole] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((snap) => {
        if (snap.exists()) setRole(snap.data().role);
      });
    } else {
      setRole(null);
    }
  }, [user]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services', hasDropdown: true },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Courses', path: '/training' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled ? "bg-[#05070a]/95 backdrop-blur-md py-3 border-gray-800/50" : "bg-[#05070a] py-5 border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-2.5 group shrink-0">
            <div className="relative w-9 h-9 overflow-hidden rounded-lg">
              <img 
                src={logoImg} 
                alt="Kobbi Labs" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-none">
                Kobbi <span className="text-primary">Labs</span>
              </span>
              <span className="text-[8px] font-medium text-gray-400 uppercase tracking-widest mt-1">
                Innovate • Build • Transform
              </span>
            </div>
          </Link>

          {/* Navigation Links - Scrollable on mobile, flex on desktop */}
          <div className="flex-1 flex justify-center px-2 sm:px-6 overflow-hidden">
            <div className="flex items-center space-x-3 sm:space-x-6 lg:space-x-8 overflow-x-auto scrollbar-hide py-1 px-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-[8px] sm:text-[10px] lg:text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1 hover:text-primary shrink-0",
                    location.pathname === link.path ? "text-primary border-b border-primary" : "text-white"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-4">
            <Link to="/cart" className="relative group p-1.5 rounded-full hover:bg-white/5 transition-all">
              <ShoppingCart className={cn(
                "w-4 h-4 sm:w-[18px] sm:h-[18px] transition-colors",
                cartItems.length > 0 ? "text-primary" : "text-white"
              )} />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[7px] sm:text-[9px] font-black w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  {cartItems.length}
                </span>
              )}
            </Link>

            <button className="text-white hover:text-primary transition-colors p-1.5">
              <Search className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
            
            <Link to="/contact" className="block shrink-0">
              <button className="bg-primary hover:bg-primary-dark text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-[7px] min-[400px]:text-[8px] sm:text-[11px] font-black transition-all shadow-lg flex items-center gap-1 active:scale-95">
                <span className="hidden min-[400px]:inline">Get a Quote</span>
                <span className="min-[400px]:hidden">Quote</span>
                <ArrowRight className="w-2 h-2 sm:w-3 sm:h-3" />
              </button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white hover:text-primary p-1 transition-colors shrink-0"
            >
              {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-[#05070a] border-t border-gray-800 overflow-hidden"
          >
            <div className="px-5 py-6 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block py-3 px-4 rounded-xl text-lg font-black uppercase tracking-tight transition-all active:scale-95 active:bg-white/5",
                    location.pathname === link.path ? "text-primary bg-primary/5" : "text-white hover:text-primary"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-gray-800 mt-3">
                <Link to="/contact" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-transform">
                    Get a Quote
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
