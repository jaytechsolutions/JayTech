import { Facebook, Instagram, Youtube, Mail, Github, Twitter, Send, Phone, MapPin, Linkedin, CheckCircle2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/images/kobbi_labs_final_logo_1790937512033.jpg';
import { useState } from 'react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z"/>
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      // Check if already exists
      const q = query(collection(db, 'newsletter_subscribers'), where('email', '==', email.toLowerCase().trim()));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        setStatus('success');
        setEmail('');
        return;
      }

      await addDoc(collection(db, 'newsletter_subscribers'), {
        email: email.toLowerCase().trim(),
        subscribedAt: serverTimestamp()
      });

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      console.error('Subscription error:', err);
      setErrorMsg('Failed to subscribe. Please try again.');
      setStatus('error');
    }
  };

  return (
    <footer className="bg-navy text-gray-400 pt-20 pb-10 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="relative w-10 h-10 overflow-hidden rounded-lg shrink-0">
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
                <span className="text-[9px] font-medium text-gray-500 uppercase tracking-widest mt-1">
                  Innovate • Build • Transform
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-4 text-xs font-medium">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link to="/portfolio" className="hover:text-primary transition-colors">Portfolio</Link></li>
            </ul>
          </div>

          {/* More Links */}
          <div>
            <h3 className="text-transparent mb-6">.</h3>
            <ul className="space-y-4 text-xs font-medium">
              <li><Link to="/training" className="hover:text-primary transition-colors">Courses</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-4 text-xs font-medium">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>024 586 2205 (WhatsApp)</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <span>020 416 8810 (Call Only)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="truncate">kobbilabs@gmail.com</span>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Koforidua, Ghana</span>
              </li>
            </ul>
          </div>

          {/* Follow Us & Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-sm mb-6 uppercase tracking-wider">Follow Us</h3>
            <div className="flex space-x-4 mb-8">
              <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"><XIcon /></a>
              <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"><Youtube className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors p-2 rounded-full hover:bg-white/5"><Linkedin className="w-4 h-4" /></a>
            </div>

            <h3 className="text-white font-bold text-sm mb-4">Subscribe to Our Newsletter</h3>
            <p className="text-[10px] mb-4">Get the latest updates, tips and offers.</p>
            <form onSubmit={handleSubscribe} className="relative mb-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address" 
                disabled={status === 'loading' || status === 'success'}
                className="w-full bg-white/5 border border-gray-800 rounded-full py-3 px-5 text-xs focus:outline-none focus:border-primary transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className="absolute right-1 top-1 bottom-1 aspect-square bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center transition-all disabled:bg-gray-600 disabled:opacity-50"
              >
                {status === 'loading' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
            {status === 'success' && (
              <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-bold animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Successfully subscribed!</span>
              </div>
            )}
            {status === 'error' && (
              <p className="text-[10px] text-red-400 font-bold">{errorMsg}</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-medium">© {new Date().getFullYear()} Kobbi Labs. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-[10px] font-medium">
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
