import { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, updateDoc, collection, query, where } from 'firebase/firestore';
import { Menu, X, LogOut, Shield, Bell, BellRing, Sparkles, ArrowRight, Package, CheckCheck, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useCurrency } from '../contexts/CurrencyContext';

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [role, setRole] = useState<string | null>(null);
  const { formatPrice } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getDoc(doc(db, 'users', user.uid)).then((snap) => {
        if (snap.exists()) setRole(snap.data().role);
      });
    } else {
      setRole(null);
    }
  }, [user]);

  // Close notifications dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const isAdmin = role === 'admin' || 
    user?.email?.toLowerCase() === 'jaytechsolutions.net@gmail.com' || 
    user?.email?.toLowerCase() === 'kobbijaysoftware@gmail.com';

  // Notifications query: admin receives all system alerts; students receive their own notifications
  const notifQuery = user 
    ? (isAdmin ? query(collection(db, 'notifications')) : query(collection(db, 'notifications'), where('userId', '==', user.uid)))
    : null;
  const [notifSnap] = useCollection(notifQuery);

  const notifications = useMemo<any[]>(() => {
    if (!notifSnap) return [];
    return notifSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
  }, [notifSnap]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // For admin: also check for unseen pending orders
  const ordersQuery = isAdmin ? query(collection(db, 'orders')) : null;
  const [ordersSnap] = useCollection(ordersQuery);
  const unseenOrdersCount = useMemo(() => {
    if (!isAdmin || !ordersSnap) return 0;
    return ordersSnap.docs.filter(d => !d.data().adminSeen && (d.data().status === 'pending' || d.data().status === 'submitted')).length;
  }, [isAdmin, ordersSnap]);

  const totalAlerts = unreadCount + (isAdmin ? unseenOrdersCount : 0);
  const shouldBlink = totalAlerts > 0;

  const markAsRead = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Course', path: '/training' },
    { name: 'Contact', path: '/contact' },
  ];

  if (user) {
    navLinks.push({ name: 'Dashboard', path: '/dashboard' });
  }

  const handleLogout = () => {
    auth.signOut();
    setIsOpen(false);
    setShowNotifications(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent tracking-tight">
              JayTech Solutions
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'text-sm font-semibold transition-colors hover:text-blue-600 relative py-1',
                  location.pathname === link.path ? 'text-blue-600' : 'text-gray-600'
                )}
              >
                {link.name}
                {location.pathname === link.path && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
                )}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center space-x-3.5">
                {/* Real-Time Notification Bell with Dropdown Menu for Users & Admin */}
                <div className="relative" ref={notifDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={cn(
                      "relative p-2.5 rounded-xl transition-all cursor-pointer border",
                      shouldBlink 
                        ? "bg-red-50 text-red-600 border-red-300 animate-alarm-blink shadow-lg shadow-red-500/20 ring-2 ring-red-500/40" 
                        : "bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-gray-200 border-transparent"
                    )}
                    title={shouldBlink ? `${totalAlerts} new notifications!` : "Notifications"}
                  >
                    {shouldBlink ? (
                      <BellRing className="w-5 h-5 text-red-600 animate-bounce" />
                    ) : (
                      <Bell className="w-5 h-5" />
                    )}
                    {shouldBlink && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-white text-[9px] font-black items-center justify-center">
                          {totalAlerts > 9 ? '9+' : totalAlerts}
                        </span>
                      </span>
                    )}
                  </button>

                  {/* Dropdown Panel */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                      >
                        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Bell className="w-4 h-4 text-blue-600" />
                            <span className="font-bold text-gray-900 text-sm">Notifications</span>
                            {totalAlerts > 0 && (
                              <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
                                {totalAlerts} new
                              </span>
                            )}
                          </div>
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        {/* Unseen pending orders banner for admin */}
                        {isAdmin && unseenOrdersCount > 0 && (
                          <div 
                            onClick={() => {
                              setShowNotifications(false);
                              navigate('/dashboard');
                            }}
                            className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs font-bold flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <Package className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{unseenOrdersCount} service order(s) pending review!</span>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        )}

                        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                          {notifications.length > 0 ? (
                            notifications.map((n: any) => (
                              <div
                                key={n.id}
                                className={cn(
                                  "p-3.5 transition-colors text-left",
                                  !n.read ? "bg-blue-50/50" : "hover:bg-gray-50"
                                )}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h5 className="font-bold text-xs text-gray-900 leading-snug">{n.title}</h5>
                                  {!n.read && (
                                    <button
                                      onClick={(e) => markAsRead(e, n.id)}
                                      className="text-[10px] text-blue-600 font-bold hover:underline shrink-0 cursor-pointer"
                                    >
                                      Mark read
                                    </button>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                                <div className="flex items-center justify-between mt-2 pt-1">
                                  <span className="text-[9px] text-gray-400">
                                    {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }) : 'Just now'}
                                  </span>
                                  <button
                                    onClick={() => {
                                      setShowNotifications(false);
                                      navigate('/dashboard');
                                    }}
                                    className="text-[10px] text-teal-600 hover:text-teal-800 font-bold flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>View</span>
                                    <ArrowRight className="w-2.5 h-2.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center text-xs text-gray-500">
                              No notifications yet.
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                          <button
                            onClick={() => {
                              setShowNotifications(false);
                              navigate('/dashboard');
                            }}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                          >
                            Open Full Dashboard
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isAdmin && (
                  <span className="flex items-center text-[11px] font-black uppercase tracking-wider text-red-700 bg-red-100/80 px-2.5 py-1 rounded-xl border border-red-200">
                    <Shield className="w-3.5 h-3.5 mr-1 text-red-600" /> ADMIN
                  </span>
                )}
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && (
              <button
                onClick={() => navigate('/dashboard')}
                className={cn(
                  "p-2 rounded-xl border relative transition-all",
                  shouldBlink ? "bg-red-50 text-red-600 border-red-300 animate-alarm-blink" : "bg-gray-100 text-gray-600 border-gray-200"
                )}
                title="Notifications"
              >
                {shouldBlink ? <BellRing className="w-5 h-5 text-red-600" /> : <Bell className="w-5 h-5" />}
                {shouldBlink && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full text-white text-[8px] flex items-center justify-center font-bold">
                    {totalAlerts > 9 ? '9+' : totalAlerts}
                  </span>
                )}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-gray-900 p-2 rounded-xl focus:outline-none bg-gray-50"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200 px-4 pt-3 pb-6 space-y-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'block px-3 py-2.5 rounded-xl text-base font-semibold',
                  location.pathname === link.path ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                {isAdmin && (
                  <div className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
                    <Shield className="w-4 h-4 mr-1.5" /> ADMINISTRATOR ACCESS
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                onClick={() => setIsOpen(false)}
                className="block text-center bg-blue-600 text-white py-3 rounded-xl font-bold"
              >
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
