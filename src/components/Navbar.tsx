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
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg">
              <img 
                src={logoImg} 
                alt="Kobbi Labs" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white tracking-tight leading-none">
                Kobbi <span className="text-primary">Labs</span>
              </span>
              <span className="text-[9px] font-medium text-gray-400 uppercase tracking-widest mt-1">
                Innovate • Build • Transform
              </span>
            </div>
          </Link>

          {/* Navigation Links - Scrollable/Visible on all screens */}
          <div className="flex flex-1 justify-center px-1 sm:px-6">
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide max-w-full">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-[8px] min-[380px]:text-[10px] sm:text-[12px] font-black uppercase tracking-tighter sm:tracking-wider transition-all flex items-center gap-0.5 hover:text-primary shrink-0 py-1",
                    location.pathname === link.path ? "text-primary border-b-2 border-primary" : "text-white"
                  )}
                >
                  {link.name}
                  {link.hasDropdown && <ChevronDown className="w-2 h-2 sm:w-3 sm:h-3" />}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 sm:space-x-5">
            <Link to="/cart" className="relative group p-1.5 sm:p-2 rounded-full hover:bg-white/5 transition-all">
              <ShoppingCart className={cn(
                "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                cartItems.length > 0 ? "text-primary" : "text-white"
              )} />
              {cartItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[8px] sm:text-[10px] font-black w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                  {cartItems.length}
                </span>
              )}
            </Link>

            <button className="text-white hover:text-primary transition-colors p-1.5 sm:p-2">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <Link to="/contact" className="block shrink-0">
              <button className="bg-primary hover:bg-primary-dark text-white px-2.5 sm:px-5 py-1.5 sm:py-2.5 rounded-full text-[8px] sm:text-xs font-black transition-all shadow-lg flex items-center gap-1 active:scale-95">
                <span className="hidden min-[400px]:inline">Get a Quote</span>
                <span className="min-[400px]:hidden">Quote</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </button>
            </Link>

            {/* Mobile Menu Toggle - Only shown on very narrow screens if needed, but horizontal scroll is primary */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-white hover:text-primary p-1 transition-colors shrink-0"
            >
              {isOpen ? <X className="w-5 h-5 sm:w-7 sm:h-7" /> : <Menu className="w-5 h-5 sm:w-7 sm:h-7" />}
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
            <div className="px-6 py-8 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "block py-4 px-4 rounded-2xl text-xl font-black uppercase tracking-tight transition-all active:scale-95 active:bg-white/5",
                    location.pathname === link.path ? "text-primary bg-primary/5" : "text-white hover:text-primary"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-gray-800 mt-4">
                <Link to="/contact" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-primary/20 active:scale-95 transition-transform">
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
