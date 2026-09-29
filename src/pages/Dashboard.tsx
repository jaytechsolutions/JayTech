import { useState, useEffect, useMemo, useRef, Fragment } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection, useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import axios from 'axios';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { 
  LayoutDashboard, 
  Package, 
  GraduationCap, 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Plus, 
  Star,
  Shield,
  Clock,
  ExternalLink,
  MessageSquare,
  Award,
  Download,
  Check,
  Users,
  Search,
  AlertCircle,
  UserCheck,
  Bell,
  BellRing,
  ArrowRight,
  Upload,
  FileVideo,
  Video,
  Film,
  Eye,
  Smartphone,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { useCurrency } from '../contexts/CurrencyContext';
import { setDoc } from 'firebase/firestore';
import { courses } from '../data/courses';
import CertificateModal from '../components/CertificateModal';
import PaystackPaymentModal from '../components/PaystackPaymentModal';
import { CreditCard, Lock } from 'lucide-react';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const { formatPrice } = useCurrency();
  const [role, setRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const isAdmin = role === 'admin' || 
    user?.email?.toLowerCase() === 'jaytechsolutions.net@gmail.com' || 
    user?.email?.toLowerCase() === 'kobbijaysoftware@gmail.com';

  useEffect(() => {
    if (user) {
      const path = `users/${user.uid}`;
      getDoc(doc(db, 'users', user.uid)).then(async snap => {
        if (snap.exists()) {
          setRole(snap.data().role);
        } else {
          const isUserAdmin = user.email?.toLowerCase() === 'jaytechsolutions.net@gmail.com' || user.email?.toLowerCase() === 'kobbijaysoftware@gmail.com';
          const defaultRole = isUserAdmin ? 'admin' : 'user';
          try {
            await setDoc(doc(db, 'users', user.uid), {
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email,
              role: defaultRole,
              createdAt: serverTimestamp(),
            });
            setRole(defaultRole);
          } catch (createErr) {
            console.error('Failed to create default user doc:', createErr);
          }
        }
      }).catch(err => {
        handleFirestoreError(err, OperationType.GET, path);
      });
    }
  }, [user]);

  // Real-time notifications: for admin, query all notifications; for user, query user notifications
  const notifQuery = user 
    ? (isAdmin ? query(collection(db, 'notifications')) : query(collection(db, 'notifications'), where('userId', '==', user.uid)))
    : null;
  const [notifSnap] = useCollection(notifQuery);
  const notifications = useMemo<any[]>(() => {
    if (!notifSnap) return [];
    return notifSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
  }, [notifSnap]);

  const unreadNotifications = useMemo<any[]>(() => {
    return notifications.filter((n: any) => !n.read);
  }, [notifications]);

  // For admin: also count unseen pending orders
  const ordersSummaryQuery = isAdmin ? query(collection(db, 'orders')) : null;
  const [ordersSummarySnap] = useCollection(ordersSummaryQuery);
  const unseenPendingOrdersCount = useMemo(() => {
    if (!isAdmin || !ordersSummarySnap) return 0;
    return ordersSummarySnap.docs.filter(d => !d.data().adminSeen && (d.data().status === 'pending' || d.data().status === 'submitted')).length;
  }, [isAdmin, ordersSummarySnap]);

  const totalAlertsCount = unreadNotifications.length + unseenPendingOrdersCount;
  const shouldBellBlink = totalAlertsCount > 0;

  const markNotificationAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unread = notifications.filter((n: any) => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'notifications', n.id), { read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  if (!user) return <div className="pt-24 text-center">Loading...</div>;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-extrabold text-gray-900">
                {isAdmin ? 'JayTech Admin Command Hub' : 'Student Dashboard'}
              </h1>
              {isAdmin && (
                <span className="bg-red-100 text-red-700 text-xs font-black uppercase px-2.5 py-1 rounded-full border border-red-200">
                  Administrator
                </span>
              )}
            </div>
            <p className="text-gray-600 mt-1">
              {isAdmin 
                ? `Logged in as Admin: ${user.email} • Full business & academy management active`
                : `Welcome back, ${user.displayName || user.email?.split('@')[0] || 'Student'}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Notification Bell with Blinking Alarm for Admin */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className={cn(
                  "relative p-3 rounded-2xl transition-all cursor-pointer shadow-sm border",
                  shouldBellBlink
                    ? "bg-red-50 border-red-300 text-red-600 animate-alarm-blink shadow-lg shadow-red-500/20 ring-4 ring-red-500/40"
                    : "bg-white border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300"
                )}
                title={shouldBellBlink ? `${totalAlertsCount} unread notifications or pending orders!` : "Notifications"}
              >
                {shouldBellBlink ? (
                  <BellRing className="w-5 h-5 text-red-600 animate-bounce" />
                ) : (
                  <Bell className="w-5 h-5" />
                )}
                {shouldBellBlink && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-5 w-5 bg-red-600 text-white text-[10px] font-black items-center justify-center shadow-md">
                      {totalAlertsCount > 9 ? '9+' : totalAlertsCount}
                    </span>
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              <AnimatePresence>
                {showNotifMenu && (
                  <motion.div
                    key="notif-dropdown"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <div className="font-bold text-gray-900 flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-blue-600" />
                        <span>Notifications</span>
                        {totalAlertsCount > 0 && (
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-bold">
                            {totalAlertsCount} new
                          </span>
                        )}
                      </div>
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={markAllNotificationsAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Unseen pending orders banner for admin */}
                    {isAdmin && unseenPendingOrdersCount > 0 && (
                      <div 
                        onClick={() => {
                          setActiveTab('orders');
                          setShowNotifMenu(false);
                        }}
                        className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs font-bold flex items-center justify-between cursor-pointer hover:bg-red-100 transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4 text-red-600" />
                          <span>{unseenPendingOrdersCount} new service orders need review!</span>
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
                              "p-4 transition-colors text-left",
                              !n.read ? "bg-blue-50/50" : "hover:bg-gray-50"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-bold text-sm text-gray-900">{n.title}</h5>
                              {!n.read && (
                                <button
                                  onClick={() => markNotificationAsRead(n.id)}
                                  className="text-[10px] text-blue-600 font-bold hover:underline shrink-0 cursor-pointer"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                            <div className="flex items-center justify-between mt-2 pt-1">
                              <span className="text-[10px] text-gray-400">
                                {n.createdAt?.toDate ? n.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                              </span>
                              {n.courseId && (
                                <button
                                  onClick={() => {
                                    markNotificationAsRead(n.id);
                                    setActiveTab('training');
                                    setShowNotifMenu(false);
                                  }}
                                  className="text-[10px] font-bold text-blue-600 hover:underline flex items-center cursor-pointer"
                                >
                                  <span>Go to Course</span>
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-400 text-xs">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAdmin && (
              <div className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                <Shield className="w-4 h-4" />
                <span>ADMIN ACCESS</span>
              </div>
            )}
          </div>
        </header>

        {/* Real-time Course Approval Notification Banner for Student */}
        {unreadNotifications.some((n: any) => n.type === 'course_approved' || n.type === 'enrollment_approved') && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 sm:p-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-extrabold text-base tracking-tight">Your Course Has Been Approved! 🎉</h4>
                <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                  {unreadNotifications.find((n: any) => n.type === 'course_approved' || n.type === 'enrollment_approved')?.message}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => {
                  unreadNotifications.forEach(n => markNotificationAsRead(n.id));
                  setActiveTab('training');
                }}
                className="px-4 py-2.5 bg-white text-emerald-800 font-bold rounded-xl text-xs hover:bg-emerald-50 transition-colors shadow-sm cursor-pointer"
              >
                Go to My Learning
              </button>
              <button
                onClick={() => unreadNotifications.forEach(n => markNotificationAsRead(n.id))}
                className="p-2 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Dismiss"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <aside className="lg:col-span-1 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all",
                activeTab === 'overview' ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-100"
              )}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer",
                activeTab === 'orders' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white text-gray-700 hover:bg-gray-100"
              )}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5" />
                <span>{isAdmin ? 'Orders Management' : 'My Orders'}</span>
              </div>
              {isAdmin && unseenPendingOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {unseenPendingOrdersCount} new
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer",
                activeTab === 'training' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white text-gray-700 hover:bg-gray-100"
              )}
            >
              <GraduationCap className="w-5 h-5" />
              <span>{isAdmin ? 'Manage Students & Courses' : 'My Courses'}</span>
            </button>
            {isAdmin && (
              <Fragment key="admin-nav-videos">
                <button
                  onClick={() => setActiveTab('videos')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer",
                    activeTab === 'videos' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Videos Management</span>
                </button>
              </Fragment>
            )}
            {isAdmin && (
              <Fragment key="admin-nav-extras">
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer",
                    activeTab === 'reviews' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Star className="w-5 h-5" />
                  <span>Reviews Approval</span>
                </button>
              </Fragment>
            )}
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <Overview 
                  key="overview" 
                  role={isAdmin ? 'admin' : (role || 'student')} 
                  userId={user.uid} 
                  onNavigateTab={setActiveTab} 
                />
              )}
              {activeTab === 'orders' && (
                <Orders 
                  key="orders" 
                  role={isAdmin ? 'admin' : (role || 'student')} 
                  userId={user.uid} 
                />
              )}
              {activeTab === 'training' && (
                <Training 
                  key="training" 
                  role={isAdmin ? 'admin' : (role || 'student')} 
                  userId={user.uid} 
                />
              )}
              {activeTab === 'reviews' && isAdmin && <ReviewsManager key="reviews" />}
              {activeTab === 'videos' && isAdmin && <VideosManager key="videos" />}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function Overview({ role, userId, onNavigateTab }: any) {
  const isAdmin = role === 'admin';
  const [overviewToast, setOverviewToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (overviewToast) {
      const timer = setTimeout(() => setOverviewToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [overviewToast]);

  const ordersQuery = isAdmin 
    ? query(collection(db, 'orders'))
    : query(collection(db, 'orders'), where('userId', '==', userId));
  
  const enrollmentsQuery = isAdmin
    ? query(collection(db, 'enrollments'))
    : query(collection(db, 'enrollments'), where('userId', '==', userId));

  const videosQuery = query(collection(db, 'videos'));

  const [orders] = useCollectionData(ordersQuery);
  const [enrollments] = useCollectionData(enrollmentsQuery);
  const [videos] = useCollectionData(videosQuery);

  const pendingOrders = useMemo(() => {
    return (orders || []).filter((o: any) => o.status === 'pending' || o.status === 'submitted' || !o.adminSeen);
  }, [orders]);

  const activeStudents = useMemo(() => {
    return (enrollments || []).filter((e: any) => e.status === 'approved' || e.status === 'paid');
  }, [enrollments]);

  // Admin Quick Action: Confirm Seen directly from Overview
  const handleOverviewConfirmSeen = async (orderId: string, serviceTitle: string, clientUserId?: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        adminSeen: true,
        seenAt: serverTimestamp()
      });

      if (clientUserId && clientUserId !== 'guest') {
        await addDoc(collection(db, 'notifications'), {
          userId: clientUserId,
          title: 'Order Seen & Acknowledged ✅',
          message: `Your service order for "${serviceTitle}" has been seen and acknowledged by JayTech Solutions admin! Our technical team is reviewing your project requirements.`,
          orderId: orderId,
          type: 'order_acknowledged',
          read: false,
          createdAt: serverTimestamp()
        });
      }
      setOverviewToast({ message: `Order for "${serviceTitle}" confirmed as seen! Client notified.`, type: 'success' });
    } catch (err) {
      console.error(err);
      setOverviewToast({ message: 'Failed to update order.', type: 'error' });
    }
  };

  // Admin Quick Action: Approve directly from Overview
  const handleOverviewApprove = async (orderId: string, serviceTitle: string, clientUserId?: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'approved',
        adminSeen: true,
        approvedAt: serverTimestamp()
      });

      if (clientUserId && clientUserId !== 'guest') {
        await addDoc(collection(db, 'notifications'), {
          userId: clientUserId,
          title: 'Service Order Approved! 🎉',
          message: `Your order for "${serviceTitle}" has been officially approved by JayTech Solutions admin!`,
          orderId: orderId,
          type: 'order_approved',
          read: false,
          createdAt: serverTimestamp()
        });
      }
      setOverviewToast({ message: `Order for "${serviceTitle}" approved!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setOverviewToast({ message: 'Failed to approve order.', type: 'error' });
    }
  };

  // Admin Quick Action: Approve All Pending from Overview
  const handleOverviewApproveAll = async () => {
    if (pendingOrders.length === 0) {
      setOverviewToast({ message: 'No pending orders to approve.', type: 'success' });
      return;
    }

    try {
      await Promise.all(pendingOrders.map(async (order: any) => {
        if (!order.id) return;
        await updateDoc(doc(db, 'orders', order.id), {
          status: 'approved',
          adminSeen: true,
          approvedAt: serverTimestamp()
        });

        if (order.userId && order.userId !== 'guest') {
          await addDoc(collection(db, 'notifications'), {
            userId: order.userId,
            title: 'Service Order Approved! 🎉',
            message: `Your order for "${order.serviceTitle}" has been officially approved by JayTech Solutions admin!`,
            orderId: order.id,
            type: 'order_approved',
            read: false,
            createdAt: serverTimestamp()
          });
        }
      }));

      setOverviewToast({ message: `Successfully approved all ${pendingOrders.length} pending orders!`, type: 'success' });
    } catch (err) {
      console.error(err);
      setOverviewToast({ message: 'Failed to approve all orders.', type: 'error' });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Overview Toast Banner */}
      <AnimatePresence>
        {overviewToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "p-4 rounded-2xl flex items-center justify-between text-xs font-bold border shadow-sm",
              overviewToast.type === 'success' 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-red-50 text-red-800 border-red-200"
            )}
          >
            <div className="flex items-center space-x-2.5">
              {overviewToast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{overviewToast.message}</span>
            </div>
            <button onClick={() => setOverviewToast(null)} className="p-1 hover:opacity-70 cursor-pointer">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Command Banner */}
      {isAdmin ? (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-8 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-blue-400/30">
                JayTech Solutions • Command Center
              </span>
              <h2 className="text-2xl md:text-3xl font-black mt-3">Administrator Overview</h2>
              <p className="text-gray-300 text-sm mt-1 max-w-xl">
                Manage incoming client orders, approve course enrollments, control video lectures, and monitor customer reviews.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {pendingOrders.length > 0 && (
                <button
                  onClick={handleOverviewApproveAll}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  title="Approve all pending orders immediately"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve All Orders ({pendingOrders.length})</span>
                </button>
              )}
              <button
                onClick={() => onNavigateTab && onNavigateTab('orders')}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Manage Orders ({orders?.length || 0})</span>
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('training')}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Students & Courses</span>
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('videos')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all backdrop-blur-sm flex items-center space-x-1.5 cursor-pointer"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Videos Library ({videos?.length || 0})</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back to JayTech!</h3>
            <p className="text-gray-600 text-sm">
              Track your course progress, launch video tutorials, and track your submitted software service orders.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('orders')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Package className="w-4 h-4" />
            <span>View My Orders</span>
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div 
          onClick={() => onNavigateTab && onNavigateTab('orders')}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-blue-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Orders</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{orders?.length || 0}</div>
          {isAdmin && pendingOrders.length > 0 ? (
            <span className="inline-block mt-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
              ● {pendingOrders.length} pending review
            </span>
          ) : (
            <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              All Orders Up to Date
            </span>
          )}
        </div>

        <div 
          onClick={() => onNavigateTab && onNavigateTab('training')}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {isAdmin ? 'Active Students' : 'My Courses'}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {isAdmin ? activeStudents.length : enrollments?.length || 0}
          </div>
          <span className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Active Enrollments
          </span>
        </div>

        <div 
          onClick={() => onNavigateTab && onNavigateTab('videos')}
          className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-purple-200 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Videos Library</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <PlayCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">{videos?.length || 0}</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
            Published Lessons
          </span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</span>
            <div className="p-2 bg-green-50 text-green-600 rounded-xl">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-green-700">Online</div>
          <span className="inline-block mt-1 text-[11px] font-bold text-gray-500">
            System Fully Operational
          </span>
        </div>
      </div>

      {/* Admin Exclusive: Recent Orders Needing Attention Panel */}
      {isAdmin && pendingOrders.length > 0 && (
        <div className="bg-white rounded-3xl border border-red-200 shadow-sm overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <h4 className="font-extrabold text-sm text-red-950">
                New Service Orders Requiring Immediate Attention ({pendingOrders.length})
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('orders')}
              className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center space-x-1 cursor-pointer"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {pendingOrders.slice(0, 5).map((order: any, idx: number) => (
              <div key={`overview-order-${order.id || idx}`} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/80 transition-colors">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-gray-900">{order.serviceTitle}</span>
                    {!order.adminSeen ? (
                      <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full animate-pulse">
                        Unseen
                      </span>
                    ) : (
                      <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Seen
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Client: <strong className="text-gray-700">{order.userName || 'Client'}</strong> ({order.userPhone || order.userEmail || 'No contact'}) • Budget: {order.budget || 'Custom'}
                  </p>
                  {order.details && (
                    <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5 italic">
                      "{order.details}"
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {!order.adminSeen && order.id && (
                    <button
                      onClick={() => handleOverviewConfirmSeen(order.id, order.serviceTitle, order.userId)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm shadow-teal-600/20"
                      title="Confirm to client that admin has seen the order"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Confirm Seen</span>
                    </button>
                  )}

                  {order.status !== 'approved' && order.id && (
                    <button
                      onClick={() => handleOverviewApprove(order.id, order.serviceTitle, order.userId)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm shadow-emerald-600/20"
                      title="Approve this order"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Orders({ role, userId }: any) {
  const isAdmin = role === 'admin';
  const { formatPrice } = useCurrency();
  const [filter, setFilter] = useState<'all' | 'pending' | 'acknowledged' | 'approved' | 'paid'>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    confirmVariant?: 'danger' | 'success';
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const orderQuery = isAdmin 
    ? query(collection(db, 'orders'))
    : query(collection(db, 'orders'), where('userId', '==', userId));
  
  const [ordersSnap, loading] = useCollection(orderQuery);
  const orders = useMemo(() => {
    if (!ordersSnap) return [];
    return ordersSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })).sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
  }, [ordersSnap]);

  const [payingOrder, setPayingOrder] = useState<any>(null);

  const pendingOrders = useMemo(() => {
    return orders.filter((o: any) => o.status === 'pending' || o.status === 'submitted' || o.status === 'acknowledged' || o.status === 'pending-verification' || !o.adminSeen);
  }, [orders]);

  const unapprovedOrders = useMemo(() => {
    return orders.filter((o: any) => o.status !== 'approved' && o.status !== 'paid');
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') return orders;
    if (filter === 'pending') return orders.filter((o: any) => o.status === 'pending' || o.status === 'submitted' || !o.adminSeen);
    if (filter === 'acknowledged') return orders.filter((o: any) => o.status === 'acknowledged' || o.adminSeen);
    if (filter === 'approved') return orders.filter((o: any) => o.status === 'approved');
    if (filter === 'paid') return orders.filter((o: any) => o.status === 'paid');
    return orders;
  }, [orders, filter]);

  // Admin: Confirm Order Seen
  const handleConfirmSeen = async (order: any) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        adminSeen: true,
        status: order.status === 'pending' ? 'acknowledged' : order.status,
        seenAt: serverTimestamp()
      });

      if (order.userId && order.userId !== 'guest') {
        await addDoc(collection(db, 'notifications'), {
          userId: order.userId,
          title: 'Order Seen & Acknowledged ✅',
          message: `Your service order for "${order.serviceTitle}" has been seen and acknowledged by JayTech Solutions admin! Our technical team is reviewing your project requirements.`,
          orderId: order.id,
          type: 'order_acknowledged',
          read: false,
          createdAt: serverTimestamp()
        });
      }
      setToast({ message: `Order for "${order.serviceTitle}" confirmed as seen! Client has been notified.`, type: 'success' });
    } catch (err) {
      console.error('Failed to confirm order seen:', err);
      setToast({ message: 'Failed to update order status.', type: 'error' });
    }
  };

  // Admin: Approve Single Order
  const handleStatus = async (order: any, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', order.id), { 
        status,
        adminSeen: true,
        approvedAt: serverTimestamp()
      });

      if (status === 'approved' && order.userId && order.userId !== 'guest') {
        await addDoc(collection(db, 'notifications'), {
          userId: order.userId,
          title: 'Service Order Approved! 🎉',
          message: `Your order for "${order.serviceTitle}" has been officially approved by JayTech Solutions admin!`,
          orderId: order.id,
          type: 'order_approved',
          read: false,
          createdAt: serverTimestamp()
        });
      }
      setToast({ message: `Order for "${order.serviceTitle}" marked as "${status}".`, type: 'success' });
    } catch (err) {
      console.error('Failed to update status:', err);
      setToast({ message: 'Failed to update order status.', type: 'error' });
    }
  };

  // Admin: Approve ALL Pending Orders
  const handleApproveAllOrders = () => {
    const targets = pendingOrders.length > 0 ? pendingOrders : unapprovedOrders;
    if (targets.length === 0) {
      setToast({ message: 'All orders are already approved!', type: 'success' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Approve All Orders',
      message: `Are you sure you want to approve all ${targets.length} pending orders? This will update their status to Approved and notify every client.`,
      confirmLabel: `Approve All (${targets.length})`,
      confirmVariant: 'success',
      onConfirm: async () => {
        try {
          await Promise.all(targets.map(async (order: any) => {
            await updateDoc(doc(db, 'orders', order.id), { 
              status: 'approved',
              adminSeen: true,
              approvedAt: serverTimestamp()
            });

            if (order.userId && order.userId !== 'guest') {
              await addDoc(collection(db, 'notifications'), {
                userId: order.userId,
                title: 'Service Order Approved! 🎉',
                message: `Your order for "${order.serviceTitle}" has been officially approved by JayTech Solutions admin!`,
                orderId: order.id,
                type: 'order_approved',
                read: false,
                createdAt: serverTimestamp()
              });
            }
          }));

          setToast({ message: `Successfully approved all ${targets.length} pending orders!`, type: 'success' });
        } catch (err) {
          console.error('Failed to approve all orders:', err);
          setToast({ message: 'Failed to approve all orders. Please try again.', type: 'error' });
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  // Admin: Delete Single Order
  const handleDelete = (id: string, serviceTitle?: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Order',
      message: `Are you sure you want to permanently delete the order for "${serviceTitle || 'this service'}"?`,
      confirmLabel: 'Delete Order',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'orders', id));
          setToast({ message: 'Order permanently deleted.', type: 'success' });
        } catch (err) {
          console.error('Delete order error:', err);
          setToast({ message: 'Failed to delete order.', type: 'error' });
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  // Admin: Delete ALL Orders
  const handleDeleteAllOrders = () => {
    if (!orders || orders.length === 0) {
      setToast({ message: 'No orders found to delete.', type: 'error' });
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: 'Delete All Orders',
      message: `WARNING: Are you sure you want to delete ALL ${orders.length} orders? This cannot be undone and will remove every order from the database.`,
      confirmLabel: `Delete All (${orders.length})`,
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          await Promise.all(orders.map((o: any) => deleteDoc(doc(db, 'orders', o.id))));
          setToast({ message: `Successfully deleted all ${orders.length} orders.`, type: 'success' });
        } catch (err) {
          console.error('Failed to delete all orders:', err);
          setToast({ message: 'Failed to delete all orders.', type: 'error' });
        } finally {
          setConfirmModal(null);
        }
      }
    });
  };

  const handleOrderPaymentSuccess = async (reference: string) => {
    if (!payingOrder) return;
    try {
      await updateDoc(doc(db, 'orders', payingOrder.id), {
        status: 'paid',
        paymentMethod: 'Paystack',
        paymentReference: reference,
        paidAt: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        userId: payingOrder.userId,
        title: 'Order Payment Confirmed!',
        message: `Payment of GH₵ ${payingOrder.amount} for "${payingOrder.serviceTitle}" confirmed via Paystack. Ref: ${reference}.`,
        type: 'order_paid',
        read: false,
        createdAt: serverTimestamp()
      });

      setPayingOrder(null);
    } catch (e: any) {
      console.error('Error updating paid order:', e);
      alert('Payment confirmed! Record updated.');
      setPayingOrder(null);
    }
  };

  const downloadReceipt = (item: any, type: 'course' | 'service') => {
    const doc = new jsPDF();
    const title = type === 'course' ? item.courseTitle : item.serviceTitle;
    const formattedAmount = `GH₵ ${Number(item.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Header - JayTech Solutions, Koforidua, Ghana
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text('JAYTECH SOLUTIONS', 105, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Official Technology Solutions & Training', 105, 27, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Koforidua, Ghana • Digital Solutions', 105, 33, { align: 'center' });
    
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(type === 'course' ? 'OFFICIAL COURSE ENROLLMENT RECEIPT' : 'OFFICIAL SERVICE ORDER PAYMENT RECEIPT', 105, 43, { align: 'center' });
    
    // Decorative line
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 48, 190, 48);

    // Receipt Details
    const id = item.id || 'N/A';
    const receiptNum = `REC-${id.substring(0, 8).toUpperCase()}`;
    const date = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
    const customerName = item.userName || auth.currentUser?.displayName || 'Customer';
    const refNum = item.paymentReference || id.substring(0, 8).toUpperCase();
    const method = item.paymentMethod || 'Paystack';

    // Customer & Bill To
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('BILLED TO (CLIENT):', 20, 58);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(customerName, 20, 65);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(auth.currentUser?.email || item.userEmail || '', 20, 71);
    doc.text(`Contact: ${item.userPhone || customerName}`, 20, 77);

    // Receipt Metadata
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('PAYMENT DETAILS:', 120, 58);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30);
    doc.text(`Receipt ID: ${receiptNum}`, 120, 65);
    doc.text(`Gateway Ref: ${refNum}`, 120, 71);
    doc.text(`Date: ${date}`, 120, 77);
    doc.text(`Processor: ${method}`, 120, 83);
    
    autoTable(doc, {
      startY: 92,
      head: [[type === 'course' ? 'Course Title' : 'Service Title', 'Payment Gateway', 'Gateway Reference', 'Amount Paid']],
      body: [
        [
          title,
          method,
          refNum,
          formattedAmount
        ]
      ],
      headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
      theme: 'striped',
      margin: { left: 20, right: 20 }
    });
    
    // Footer
    const finalY = (doc as any).lastAutoTable.finalY || 140;

    // Total Highlight Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, finalY + 8, 70, 22, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('TOTAL AMOUNT PAID:', 125, finalY + 16);
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(formattedAmount, 185, finalY + 16, { align: 'right' });
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52);
    doc.text('✓ PAYSTACK VERIFIED & CONFIRMED', 185, finalY + 23, { align: 'right' });

    doc.setDrawColor(226, 232, 240);
    doc.line(20, finalY + 35, 190, finalY + 35);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Thank you for choosing JayTech Solutions!', 105, finalY + 44, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Processed securely via Paystack Payment Gateway', 105, finalY + 50, { align: 'center' });
    doc.text('JayTech Solutions • Koforidua, Ghana • All Rights Reserved', 105, finalY + 56, { align: 'center' });
    
    doc.save(`Receipt_${title.replace(/\s+/g, '_')}_${receiptNum}.pdf`);
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header & Bulk Actions Toolbar */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-gray-900">
            {isAdmin ? 'Client Service Orders & Form Submissions' : 'My Orders'}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {isAdmin 
              ? 'Review client project requirements, confirm seen, and approve orders.' 
              : 'Track your requested services and download official receipts.'}
          </p>
        </div>

        {/* Admin Action Buttons: Approve All & Delete All, or Client Action */}
        {isAdmin ? (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleApproveAllOrders}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center space-x-1.5 cursor-pointer active:scale-95"
              title="Approve all pending orders at once"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approve All Orders ({pendingOrders.length > 0 ? pendingOrders.length : unapprovedOrders.length})</span>
            </button>

            <button
              onClick={handleDeleteAllOrders}
              disabled={orders.length === 0}
              className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-40 active:scale-95 flex items-center space-x-1.5"
              title="Delete all orders from database"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All Orders</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => window.location.href = '/services'}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Order Another Service</span>
          </button>
        )}
      </div>

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className={cn(
              "mx-6 mt-4 p-4 rounded-2xl flex items-center justify-between text-xs font-bold border shadow-sm",
              toast.type === 'success' 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-red-50 text-red-800 border-red-200"
            )}
          >
            <div className="flex items-center space-x-2.5">
              {toast.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="p-1 hover:opacity-70 cursor-pointer">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 flex flex-wrap gap-2 text-xs font-bold">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
            filter === 'all' ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          All ({orders.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
            filter === 'pending' ? "bg-amber-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          Pending Review ({pendingOrders.length})
        </button>
        <button
          onClick={() => setFilter('acknowledged')}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
            filter === 'acknowledged' ? "bg-teal-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          Seen / Acknowledged ({orders.filter((o: any) => o.adminSeen || o.status === 'acknowledged').length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
            filter === 'approved' ? "bg-emerald-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          Approved ({orders.filter((o: any) => o.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={cn(
            "px-3 py-1.5 rounded-lg transition-all cursor-pointer",
            filter === 'paid' ? "bg-purple-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-100"
          )}
        >
          Paid ({orders.filter((o: any) => o.status === 'paid').length})
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Service & Requirements</th>
              <th className="px-6 py-4">Client Contact</th>
              <th className="px-6 py-4">Timeline & Budget</th>
              <th className="px-6 py-4">Status & Review</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredOrders && filteredOrders.length > 0 ? (
              filteredOrders.map((order: any, idx: number) => {
                const isPaid = order.status === 'paid';
                const isApproved = order.status === 'approved';
                const isAcknowledged = order.status === 'acknowledged' || order.adminSeen;
                const isPending = !isApproved && !isPaid;

                return (
                  <tr key={`order-row-${order.id || idx}-${idx}`} className="hover:bg-gray-50/80 transition-colors">
                    {/* Service & Requirements */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-extrabold text-gray-900">{order.serviceTitle}</div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                        {order.details || 'No details provided.'}
                      </p>
                      {order.details && order.details.length > 60 && (
                        <button
                          onClick={() => setSelectedOrderDetails(order)}
                          className="text-[11px] text-blue-600 font-bold hover:underline mt-1 cursor-pointer"
                        >
                          View Full Brief →
                        </button>
                      )}
                    </td>

                    {/* Client Info */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{order.userName || 'Client'}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {order.userPhone && (
                          <a href={`tel:${order.userPhone}`} className="text-blue-600 hover:underline block font-semibold">
                            📞 {order.userPhone}
                          </a>
                        )}
                        {order.userEmail && (
                          <a href={`mailto:${order.userEmail}`} className="text-gray-500 hover:underline block truncate max-w-xs">
                            ✉️ {order.userEmail}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Timeline & Budget */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <span className="inline-flex items-center text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md font-medium">
                          <Clock className="w-3 h-3 mr-1 text-blue-600" />
                          {order.timeline || 'Flexible'}
                        </span>
                        <div className="text-xs font-bold text-emerald-700">
                          {order.amount > 0 ? formatPrice(order.amount) : (order.budget || 'Custom Quote')}
                        </div>
                      </div>
                    </td>

                    {/* Status & Review */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <span className={cn(
                          "inline-block px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider",
                          isPaid && "bg-purple-100 text-purple-800",
                          isApproved && !isPaid && "bg-emerald-100 text-emerald-800",
                          isAcknowledged && !isApproved && !isPaid && "bg-teal-100 text-teal-800",
                          !isAcknowledged && !isApproved && !isPaid && "bg-amber-100 text-amber-800"
                        )}>
                          {isPaid ? 'Paid' : isApproved ? 'Approved' : isAcknowledged ? 'Acknowledged' : 'Pending Review'}
                        </span>

                        {order.adminSeen ? (
                          <div className="text-[10px] text-emerald-700 font-bold flex items-center">
                            <Check className="w-3 h-3 mr-0.5 text-emerald-600" />
                            <span>Seen by Admin</span>
                          </div>
                        ) : (
                          <div className="text-[10px] text-amber-600 font-bold animate-pulse">
                            ● Unseen New Order
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Admin: Confirm Seen Button */}
                        {isAdmin && !order.adminSeen && (
                          <button
                            onClick={() => handleConfirmSeen(order)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm shadow-teal-600/20"
                            title="Confirm to client that admin has seen the order"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Confirm Seen</span>
                          </button>
                        )}

                        {/* Admin: Approve Order Button */}
                        {isAdmin && order.status !== 'approved' && order.status !== 'paid' && (
                          <button 
                            onClick={() => handleStatus(order, 'approved')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm shadow-emerald-600/20"
                            title="Approve this order"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Customer: Pay with Paystack (if price is quoted) */}
                        {!isAdmin && order.status === 'pending' && order.amount > 0 && (
                          <button
                            onClick={() => setPayingOrder(order)}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay with Paystack</span>
                          </button>
                        )}

                        {/* Download Receipt */}
                        {(order.status === 'approved' || order.status === 'paid') && (
                          <button 
                            onClick={() => downloadReceipt(order, 'service')}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-blue-200"
                            title="Download Official Receipt (PDF)"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}

                        {/* Admin: Delete Order Button */}
                        {isAdmin && (
                          <button 
                            onClick={() => handleDelete(order.id, order.serviceTitle)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-red-200"
                            title="Delete this order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr key="empty-orders-row">
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                  <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  No orders found under "{filter}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paystack Payment Modal */}
      {payingOrder && (
        <PaystackPaymentModal
          isOpen={!!payingOrder}
          onClose={() => setPayingOrder(null)}
          title={payingOrder.serviceTitle || 'Service Order'}
          amount={payingOrder.amount}
          customerEmail={payingOrder.userEmail || ''}
          customerName={payingOrder.userName || ''}
          onSuccess={handleOrderPaymentSuccess}
        />
      )}

      {/* Full Order Brief Modal */}
      <AnimatePresence>
        {selectedOrderDetails && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSelectedOrderDetails(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10 border border-gray-100"
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h4 className="text-xl font-black text-gray-900">{selectedOrderDetails.serviceTitle}</h4>
                <button onClick={() => setSelectedOrderDetails(null)} className="p-1 rounded-full hover:bg-gray-100">
                  <XCircle className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-sm">
                <div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Client</span>
                  <p className="font-bold text-gray-900">{selectedOrderDetails.userName} ({selectedOrderDetails.userPhone})</p>
                  <p className="text-xs text-gray-500">{selectedOrderDetails.userEmail}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Timeline</span>
                    <span className="font-bold text-gray-800">{selectedOrderDetails.timeline || 'Flexible'}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <span className="text-[10px] font-bold text-gray-400 uppercase block">Budget</span>
                    <span className="font-bold text-emerald-700">{selectedOrderDetails.budget || 'Custom Quote'}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Full Project Requirements</span>
                  <div className="bg-gray-50 p-4 rounded-2xl text-xs text-gray-700 leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
                    {selectedOrderDetails.details}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end space-x-2">
                {isAdmin && !selectedOrderDetails.adminSeen && (
                  <button
                    onClick={() => {
                      handleConfirmSeen(selectedOrderDetails);
                      setSelectedOrderDetails(null);
                    }}
                    className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
                  >
                    Confirm Seen & Acknowledge
                  </button>
                )}
                <button
                  onClick={() => setSelectedOrderDetails(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Universal Action Confirm Modal */}
      <AnimatePresence>
        {confirmModal && confirmModal.isOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmModal(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl z-10 border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                  confirmModal.confirmVariant === 'danger' ? "bg-red-50 text-red-600 border border-red-200" : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                )}>
                  {confirmModal.confirmVariant === 'danger' ? <Trash2 className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-lg font-black text-gray-900">{confirmModal.title}</h4>
                  <p className="text-xs text-gray-500">JayTech Solutions Management Action</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                {confirmModal.message}
              </p>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => confirmModal.onConfirm()}
                  className={cn(
                    "flex-1 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95",
                    confirmModal.confirmVariant === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
                  )}
                >
                  {confirmModal.confirmLabel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


function Training({ role, userId }: any) {
  const isAdmin = role === 'admin';
  const { formatPrice } = useCurrency();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [certModalCourse, setCertModalCourse] = useState<{ id: string; title: string; userName?: string } | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminSubTab, setAdminSubTab] = useState<'enrollments' | 'users'>('enrollments');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-dismiss toast after 4s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Query enrollments
  const enrollmentQuery = isAdmin
    ? query(collection(db, 'enrollments'))
    : query(collection(db, 'enrollments'), where('userId', '==', userId));
  
  const [enrollmentSnap, loadingEnrollments] = useCollection(enrollmentQuery);

  // Sort enrollments in-memory
  const enrollments = useMemo<any[]>(() => {
    if (!enrollmentSnap) return [];
    return enrollmentSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })).sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
  }, [enrollmentSnap]);

  // Query users for admin user management
  const usersQuery = isAdmin ? query(collection(db, 'users')) : null;
  const [usersSnap, loadingUsers] = useCollection(usersQuery);

  const usersList = useMemo<any[]>(() => {
    if (!usersSnap) return [];
    return usersSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })).sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
  }, [usersSnap]);

  const [progressSnap] = useCollection(query(collection(db, 'progress'), where('userId', '==', userId)));
  const allProgress = useMemo(() => progressSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [], [progressSnap]);

  const [videosSnap] = useCollection(collection(db, 'videos'));
  const allVideos = useMemo(() => videosSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [], [videosSnap]);

  // Filtered enrollments for admin/student
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((en: any) => {
      const matchesStatus = statusFilter === 'all' || en.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = !q || 
        en.courseTitle?.toLowerCase().includes(q) || 
        en.userName?.toLowerCase().includes(q) ||
        en.paymentReference?.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [enrollments, statusFilter, searchQuery]);

  // Filtered users for admin
  const filteredUsers = useMemo(() => {
    if (!usersList) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return usersList;
    return usersList.filter((u: any) => 
      u.name?.toLowerCase().includes(q) || 
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  }, [usersList, searchQuery]);

  // Admin handles student enrollment status (Approve / Reject) with real-time notification to student
  const handleStatus = async (id: string, status: string, courseTitle?: string, studentName?: string) => {
    setProcessingId(id);
    try {
      const targetEnrollment = enrollments.find((e: any) => e.id === id);
      const studentUserId = targetEnrollment?.userId || (id.includes('_') ? id.split('_')[0] : null);
      const targetTitle = courseTitle || targetEnrollment?.courseTitle || 'Training Course';
      const targetCourseId = targetEnrollment?.courseId || (id.includes('_') ? id.split('_')[1] : '');

      await setDoc(doc(db, 'enrollments', id), { 
        status,
        ...(status === 'approved' ? { approvedAt: serverTimestamp() } : {})
      }, { merge: true });

      // Dispatch notification directly to student's dashboard
      if (status === 'approved' && studentUserId) {
        await addDoc(collection(db, 'notifications'), {
          userId: studentUserId,
          title: 'Course Approved! 🎉',
          message: `Your enrollment for "${targetTitle}" has been approved by admin! You now have full access to course videos and materials.`,
          courseId: targetCourseId,
          courseTitle: targetTitle,
          type: 'course_approved',
          read: false,
          createdAt: serverTimestamp()
        });
      }

      setToast({
        type: 'success',
        message: status === 'approved' 
          ? `Approved ${studentName || 'student'} for "${targetTitle}". Student notified on their dashboard!`
          : `Enrollment status updated to ${status}.`
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `enrollments/${id}`);
      setToast({ type: 'error', message: 'Failed to update enrollment. Please try again.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Student cancels their own course enrollment
  const handleCancel = async (id: string, courseTitle?: string) => {
    const target = enrollments.find((e: any) => e.id === id);
    const targetTitle = courseTitle || 'this course';
    if (!confirm(`Are you sure you want to unenroll from "${targetTitle}"?`)) {
      return;
    }

    setCancellingId(id);
    try {
      await deleteDoc(doc(db, 'enrollments', id));

      await addDoc(collection(db, 'notifications'), {
        userId: userId,
        title: 'Course Unenrolled',
        message: `Your enrollment in "${targetTitle}" has been cancelled.`,
        courseId: target?.courseId || '',
        courseTitle: targetTitle,
        type: 'course_cancelled',
        read: false,
        createdAt: serverTimestamp()
      });

      setToast({
        type: 'success',
        message: `Course "${targetTitle}" has been unenrolled successfully.`
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `enrollments/${id}`);
      setToast({ type: 'error', message: 'Failed to cancel course. Please try again.' });
    } finally {
      setCancellingId(null);
    }
  };

  // Admin deletes an enrollment record
  const handleDeleteEnrollment = async (id: string, courseTitle?: string, studentName?: string) => {
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, 'enrollments', id));
      setToast({
        type: 'success',
        message: `Enrollment record for ${studentName || 'student'} in "${courseTitle || 'course'}" deleted.`
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `enrollments/${id}`);
      setToast({ type: 'error', message: 'Failed to delete enrollment record.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Admin approves a registered user with notification
  const handleApproveUser = async (targetUserId: string, userName?: string) => {
    setProcessingId(targetUserId);
    try {
      await updateDoc(doc(db, 'users', targetUserId), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });

      // Send notification to user
      await addDoc(collection(db, 'notifications'), {
        userId: targetUserId,
        title: 'Student Account Approved! ✅',
        message: 'Your student account has been approved by the administrator.',
        type: 'account_approved',
        read: false,
        createdAt: serverTimestamp()
      });

      setToast({
        type: 'success',
        message: `User "${userName || 'User'}" has been approved!`
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${targetUserId}`);
      setToast({ type: 'error', message: 'Failed to approve user. Please try again.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Admin deletes a registered user
  const handleDeleteUser = async (targetUserId: string, userEmail?: string) => {
    if (auth.currentUser && auth.currentUser.email === userEmail) {
      alert('You cannot delete your own admin account.');
      return;
    }
    setProcessingId(targetUserId);
    try {
      await deleteDoc(doc(db, 'users', targetUserId));
      setToast({
        type: 'success',
        message: `User account "${userEmail}" deleted successfully.`
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `users/${targetUserId}`);
      setToast({ type: 'error', message: 'Failed to delete user account.' });
    } finally {
      setProcessingId(null);
    }
  };

  const getProgress = (courseId: string) => {
    if (!allVideos || !allProgress) return 0;
    const courseVideos = allVideos.filter((v: any) => v.courseId === courseId);
    if (courseVideos.length === 0) return 0;
    const completedCount = allProgress.filter((p: any) => p.courseId === courseId && p.completed).length;
    return Math.round((completedCount / courseVideos.length) * 100);
  };

  const downloadReceipt = (en: any) => {
    const doc = new jsPDF();
    const formattedAmount = `GH₵ ${Number(en.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Header - Kobbyjay Software Services, Koforidua, Ghana
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text('KOBBYJAY SOFTWARE SERVICES', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(75, 85, 99);
    doc.text('Koforidua, Ghana', 105, 27, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Software and Digital Solutions', 105, 33, { align: 'center' });
    
    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text('OFFICIAL ENROLLMENT CONFIRMATION', 105, 43, { align: 'center' });

    // Decorative line
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 48, 190, 48);
    
    // Receipt & Student Details
    const id = en.id || 'N/A';
    const receiptNum = `ENR-${id.substring(0, 8).toUpperCase()}`;
    const date = en.createdAt?.toDate ? en.createdAt.toDate().toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');
    const studentName = en.userName || auth.currentUser?.displayName || 'Student';
    const referenceNum = en.id?.substring(0, 10).toUpperCase() || id.substring(0, 10).toUpperCase();
    const studentEmail = en.userEmail || auth.currentUser?.email || '';

    // Left Column: Student Details & Billed To
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('STUDENT DETAILS:', 20, 58);
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 24, 39);
    doc.text(studentName, 20, 65);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70);
    doc.text(`Student Name: ${studentName}`, 20, 72);
    if (studentEmail) {
      doc.text(`Email: ${studentEmail}`, 20, 78);
    }

    // Right Column: Reference & Receipt Number
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('ENROLLMENT DETAILS:', 120, 58);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30);
    const method = en.paymentMethod || 'Paystack';

    doc.text(`Receipt Number: ${receiptNum}`, 120, 65);
    doc.text(`Gateway Reference: ${referenceNum}`, 120, 72);
    doc.text(`Date Issued: ${date}`, 120, 78);
    doc.text(`Payment Gateway: ${method}`, 120, 84);
    
    // Table - Course Title, Payment Method, Reference, Amount
    autoTable(doc, {
      startY: 92,
      head: [['Course Title', 'Payment Gateway', 'Gateway Reference', 'Amount Paid']],
      body: [
        [
          en.courseTitle || 'Training Course',
          method,
          referenceNum,
          formattedAmount
        ]
      ],
      headStyles: { 
        fillColor: [37, 99, 235],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 10
      },
      bodyStyles: {
        fontSize: 10,
        textColor: [30, 41, 59]
      },
      columnStyles: {
        0: { cellWidth: 65 },
        1: { cellWidth: 50 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35, halign: 'right' }
      },
      theme: 'striped',
      margin: { left: 20, right: 20 }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 135;

    // Total Highlight Box
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(120, finalY + 8, 70, 22, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100);
    doc.text('TOTAL AMOUNT PAID:', 125, finalY + 16);
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(formattedAmount, 185, finalY + 16, { align: 'right' });
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52); // green-800
    doc.text('✓ PAYSTACK VERIFIED & CONFIRMED', 185, finalY + 23, { align: 'right' });

    // Thank the user section
    doc.setDrawColor(226, 232, 240);
    doc.line(20, finalY + 36, 190, finalY + 36);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Thank you for choosing JayTech Solutions!', 105, finalY + 45, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Processed securely via Paystack Payment Gateway', 105, finalY + 51, { align: 'center' });
    doc.text('JayTech Solutions • Koforidua, Ghana • All Rights Reserved', 105, finalY + 57, { align: 'center' });
    
    doc.save(`Receipt_${(en.courseTitle || 'Course').replace(/\s+/g, '_')}_${receiptNum}.pdf`);
  };

  const pendingCount = useMemo(() => {
    return enrollments.filter((e: any) => e.status === 'pending').length;
  }, [enrollments]);

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast-banner"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={cn(
              "p-4 rounded-2xl flex items-center justify-between shadow-md border text-sm font-medium",
              toast.type === 'success' 
                ? "bg-green-50 text-green-900 border-green-200" 
                : "bg-red-50 text-red-900 border-red-200"
            )}
          >
            <div className="flex items-center space-x-2">
              {toast.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-gray-700 p-1"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Sub Navigation */}
      {role === 'admin' && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => { setAdminSubTab('enrollments'); setSearchQuery(''); }}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer",
                adminSubTab === 'enrollments'
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Course Enrollments</span>
              <span className={cn(
                "ml-1 text-xs px-2 py-0.5 rounded-full font-black",
                adminSubTab === 'enrollments' ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              )}>
                {enrollments.length}
              </span>
              {pendingCount > 0 && (
                <span className="bg-yellow-400 text-gray-900 text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </button>
            <button
              onClick={() => { setAdminSubTab('users'); setSearchQuery(''); }}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer",
                adminSubTab === 'users'
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <Users className="w-4 h-4" />
              <span>Registered Users & Students</span>
              <span className={cn(
                "ml-1 text-xs px-2 py-0.5 rounded-full font-black",
                adminSubTab === 'users' ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              )}>
                {usersList.length}
              </span>
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={adminSubTab === 'enrollments' ? "Search student or course..." : "Search users..."}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>
      )}

      {/* VIEW 1: ENROLLMENTS TABLE (Students & Admin) */}
      {(role !== 'admin' || adminSubTab === 'enrollments') && (
        <motion.div 
          key="enrollments-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {role === 'admin' ? 'Student Course Enrollments' : 'My Learning & Enrolled Courses'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {role === 'admin' 
                  ? 'Review course applications, activate approvals, or delete student records.' 
                  : 'Track your course progress, download official receipts, or launch video tutorials.'}
              </p>
            </div>

            {role === 'admin' && (
              <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
                    statusFilter === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  All ({enrollments.length})
                </button>
                <button
                  onClick={() => setStatusFilter('pending')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
                    statusFilter === 'pending' ? "bg-white text-yellow-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setStatusFilter('approved')}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
                    statusFilter === 'approved' ? "bg-white text-green-700 shadow-sm font-bold" : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  Approved
                </button>
              </div>
            )}
          </div>

          {/* Student Status Guidance Banner */}
          {role !== 'admin' && enrollments.some((e: any) => e.status === 'approved' || e.status === 'paid') && (
            <div className="mx-6 mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4 text-emerald-900">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Course Enrollment Approved! 🎉</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Your enrollment has been approved by admin. You now have full access to watch videos and complete lessons.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">{role === 'admin' ? 'Student / Reference' : 'Status & Info'}</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEnrollments.length > 0 ? (
                  filteredEnrollments.map((en: any, idx: number) => {
                    const progress = getProgress(en.courseId);
                    const courseData = courses.find(c => c.id === en.courseId);
                    const isApproved = en.status === 'approved' || en.status === 'paid';
                    const isPending = en.status === 'pending';
                    const isCancelled = en.status === 'cancelled';
                    const enrollmentRowKey = `enrollment-row-${en.id || idx}-${idx}`;

                    return (
                      <tr key={enrollmentRowKey} className="hover:bg-gray-50/80 transition-colors">
                        {/* Course Info */}
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{en.courseTitle}</div>
                          <div className="text-[11px] text-teal-600 font-semibold mt-1">
                            Self-Paced Flexible Access
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                              isApproved && "bg-green-100 text-green-800",
                              isPending && "bg-yellow-100 text-yellow-800",
                              isCancelled && "bg-gray-100 text-gray-600"
                            )}>
                              {isApproved ? 'Enrolled' : isPending ? 'Pending' : en.status}
                            </span>
                          </div>
                        </td>

                        {/* Student Info */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-gray-900">{en.userName || 'Student'}</div>
                          {en.userEmail && <div className="text-xs text-gray-500">{en.userEmail}</div>}
                          {en.userPhone && (
                            <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-1">
                              <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <a 
                                href={`https://wa.me/${en.userPhone.replace(/[^0-9]/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="hover:underline flex items-center gap-1 font-mono"
                                title="Open WhatsApp chat with student"
                              >
                                <span>{en.userPhone}</span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-sans font-bold">WhatsApp</span>
                              </a>
                            </div>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <span className="text-[10px] text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                              ID: {en.id?.substring(0, 10).toUpperCase()}
                            </span>
                          </div>
                        </td>

                        {/* Progress */}
                        <td className="px-6 py-4">
                          {isApproved ? (
                            <div className="w-full max-w-xs">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-gray-600">{progress}% Completed</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  className="bg-blue-600 h-2 rounded-full"
                                />
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Locked until approved</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {role === 'admin' ? (
                            /* ADMIN ACTIONS */
                            <div className="flex items-center justify-end space-x-2">
                              {/* ACTIVE APPROVE BUTTON FOR ADMIN */}
                              {!isApproved ? (
                                <button 
                                  key={`approve-${en.id}`}
                                  disabled={processingId === en.id}
                                  onClick={() => handleStatus(en.id, 'approved', en.courseTitle, en.userName)}
                                  className="flex items-center space-x-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-green-600/20 active:scale-95 cursor-pointer disabled:opacity-50"
                                  title="Approve Student Enrollment"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{processingId === en.id ? 'Approving...' : 'Approve Student'}</span>
                                </button>
                              ) : (
                                <div className="flex items-center space-x-1.5">
                                  <span className="inline-flex items-center text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-xl text-xs font-bold">
                                    <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                                    <span>Approved</span>
                                  </span>
                                  <button
                                    onClick={() => downloadReceipt(en)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Download Student Payment Receipt"
                                  >
                                    <Download className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setCertModalCourse({ id: en.courseId, title: en.courseTitle, userName: en.userName })}
                                    className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                                    title="View / Issue Student Certificate"
                                  >
                                    <Award className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleStatus(en.id, 'pending', en.courseTitle, en.userName)}
                                    className="text-[10px] text-gray-400 hover:text-gray-600 underline px-1 py-0.5"
                                    title="Reset back to pending"
                                  >
                                    Reset
                                  </button>
                                </div>
                              )}

                              {/* DELETE ENROLLMENT BUTTON FOR ADMIN */}
                              <button 
                                key={`del-${en.id}`}
                                disabled={processingId === en.id}
                                onClick={() => handleDeleteEnrollment(en.id, en.courseTitle, en.userName)}
                                className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors cursor-pointer"
                                title="Delete Enrollment"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            /* STUDENT ACTIONS */
                            <div className="flex flex-col items-end space-y-2">
                              {isApproved && (
                                <button 
                                  key={`watch-${en.id}`}
                                  onClick={() => setSelectedCourse({ id: en.courseId, title: en.courseTitle })}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                                >
                                  <PlayCircle className="w-4 h-4" />
                                  <span>Watch Videos</span>
                                </button>
                              )}

                              {isApproved && (
                                <button 
                                  key={`cert-${en.id}`}
                                  onClick={() => setCertModalCourse({ id: en.courseId, title: en.courseTitle, userName: en.userName })}
                                  className={cn(
                                    "flex items-center space-x-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-sm",
                                    progress === 100 
                                      ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-amber-500/20 active:scale-95" 
                                      : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
                                  )}
                                  title="View, customize and download your official certificate"
                                >
                                  <Award className="w-3.5 h-3.5 text-amber-400" />
                                  <span>{progress === 100 ? 'Claim Certificate 🎓' : 'Certificate'}</span>
                                </button>
                              )}

                              {isApproved && (
                                <button 
                                  key={`receipt-${en.id}`}
                                  onClick={() => downloadReceipt(en)}
                                  className="flex items-center space-x-1.5 text-blue-600 font-semibold text-xs hover:underline cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Receipt</span>
                                </button>
                              )}

                              {/* ACTIVE CANCEL COURSE BUTTON ONLY FOR PENDING / UNAPPROVED COURSES */}
                              {!isApproved && en.status !== 'cancelled' && (
                                <button 
                                  key={`cancel-${en.id}`}
                                  disabled={cancellingId === en.id}
                                  onClick={() => handleCancel(en.id, en.courseTitle)}
                                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200/80 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                                  title="Cancel this pending enrollment"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>{cancellingId === en.id ? 'Cancelling...' : 'Cancel Course'}</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  !loadingEnrollments ? (
                    <tr key="empty-enrollments-row">
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-semibold text-gray-700">No course enrollments found.</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {role === 'admin' 
                            ? 'No students match the current filter or search criteria.' 
                            : 'You have not enrolled in any training courses yet.'}
                        </p>
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* VIEW 2: REGISTERED USERS & STUDENTS DIRECTORY (ADMIN ONLY) */}
      {role === 'admin' && adminSubTab === 'users' && (
        <motion.div 
          key="users-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Registered Students & Users Directory</h3>
              <p className="text-xs text-gray-500 mt-1">
                Manage registered user accounts: approve user accounts or delete users from the system.
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-500">
              Total Users: {filteredUsers.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Account Status</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">User Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u: any, idx: number) => {
                    const isUserApproved = u.status === 'approved';
                    const isSelf = auth.currentUser && auth.currentUser.email === u.email;
                    const userRowKey = `user-row-${u.id || idx}-${idx}`;

                    return (
                      <tr key={userRowKey} className="hover:bg-gray-50/80 transition-colors">
                        {/* Name & Email */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                              {u.name ? u.name.charAt(0).toUpperCase() : u.email?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 flex items-center space-x-2">
                                <span>{u.name || 'Unnamed Student'}</span>
                                {isSelf && (
                                  <span className="bg-blue-100 text-blue-800 text-[10px] px-1.5 py-0.5 rounded font-bold">You</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-block px-2.5 py-1 rounded-lg text-xs font-bold uppercase",
                            u.role === 'admin' ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"
                          )}>
                            {u.role || 'user'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold",
                            isUserApproved ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          )}>
                            {isUserApproved ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Approved
                              </>
                            ) : (
                              'Pending Approval'
                            )}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4 text-xs text-gray-500">
                          {u.createdAt?.toDate ? u.createdAt.toDate().toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Actions: Approve / Delete User */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* APPROVE USER BUTTON */}
                            {!isUserApproved ? (
                              <button
                                key={`approve-user-${u.id}`}
                                disabled={processingId === u.id}
                                onClick={() => handleApproveUser(u.id, u.name || u.email)}
                                className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                                title="Approve User Account"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{processingId === u.id ? 'Approving...' : 'Approve User'}</span>
                              </button>
                            ) : (
                              <span className="text-xs text-green-600 font-semibold flex items-center mr-2">
                                <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                                Active
                              </span>
                            )}

                            {/* DELETE USER BUTTON */}
                            <button
                              key={`delete-user-${u.id}`}
                              disabled={isSelf || processingId === u.id}
                              onClick={() => handleDeleteUser(u.id, u.email)}
                              className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                              title={isSelf ? "You cannot delete your own account" : "Delete User Account"}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  !loadingUsers ? (
                    <tr key="empty-users-row">
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                        <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="font-semibold text-gray-700">No users found.</p>
                        <p className="text-xs text-gray-400 mt-1">Try adjusting your search query.</p>
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedCourse && (
          <VideoPlayer 
            key="video-player"
            courseId={selectedCourse.id} 
            courseTitle={selectedCourse.title}
            userId={userId}
            role={role}
            onOpenCertificate={() => setCertModalCourse({ id: selectedCourse.id, title: selectedCourse.title })}
            onClose={() => setSelectedCourse(null)} 
          />
        )}
      </AnimatePresence>

      {/* Official Certificate Modal */}
      {certModalCourse && (
        <CertificateModal
          isOpen={!!certModalCourse}
          onClose={() => setCertModalCourse(null)}
          courseTitle={certModalCourse.title}
          courseId={certModalCourse.id}
          defaultStudentName={certModalCourse.userName || auth.currentUser?.displayName || 'Student Name'}
        />
      )}
    </div>
  );
}

function VideoPlayer({ courseId, courseTitle, userId, role, onOpenCertificate, onClose }: any) {
  const videoQuery = query(collection(db, 'videos'), where('courseId', '==', courseId));
  const [videosSnap, loading] = useCollection(videoQuery);
  const videos = useMemo<any[]>(() => {
    if (!videosSnap) return [];
    return videosSnap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeA - timeB;
      });
  }, [videosSnap]);
  const [activeVideo, setActiveVideo] = useState<any>(null);

  const progressQuery = query(collection(db, 'progress'), where('userId', '==', userId), where('courseId', '==', courseId));
  const [progressSnap] = useCollection(progressQuery);
  const progressData = useMemo<any[]>(() => progressSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [], [progressSnap]);

  useEffect(() => {
    if (videos && videos.length > 0 && !activeVideo) {
      setActiveVideo(videos[0]);
    } else if (videos && activeVideo && !videos.some((v: any) => v.id === activeVideo.id)) {
      setActiveVideo(videos[0] || null);
    }
  }, [videos, activeVideo]);

  const toggleComplete = async (vidId?: string) => {
    const targetVideoId = vidId || activeVideo?.id;
    if (!targetVideoId) {
      console.warn('Cannot mark complete without valid videoId');
      return;
    }
    const progressId = `${userId}_${courseId}_${targetVideoId}`;
    const isCompleted = progressData?.find((p: any) => p.videoId === targetVideoId)?.completed;
    
    try {
      await setDoc(doc(db, 'progress', progressId), {
        userId,
        courseId,
        videoId: targetVideoId,
        completed: !isCompleted,
        updatedAt: serverTimestamp()
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `progress/${progressId}`);
    }
  };

  const completedCount = useMemo(() => {
    return videos.filter((v: any) => progressData?.some((p: any) => p.videoId === v.id && p.completed)).length;
  }, [videos, progressData]);

  const progressPercent = videos.length > 0 ? Math.round((completedCount / videos.length) * 100) : 0;
  const isCourseCompleted = videos.length > 0 && completedCount === videos.length;

  const [confirmDeleteVid, setConfirmDeleteVid] = useState(false);

  const handleDeleteCurrentVideo = async () => {
    if (!activeVideo?.id) return;
    if (!confirmDeleteVid) {
      setConfirmDeleteVid(true);
      setTimeout(() => setConfirmDeleteVid(false), 5000);
      return;
    }
    const vidId = activeVideo.id;
    const vidUrl = activeVideo.videoUrl;
    try {
      await deleteDoc(doc(db, 'videos', vidId));
      if (vidUrl) {
        axios.post('/api/delete-video', { videoUrl: vidUrl }).catch(() => {});
      }
      setActiveVideo(null);
      setConfirmDeleteVid(false);
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `videos/${vidId}`);
    }
  };

  const isActiveCompleted = activeVideo ? progressData?.find((p: any) => p.videoId === activeVideo.id)?.completed : false;

  return (
    <div key="video-player-container" className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
      <div key="video-backdrop" className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <motion.div 
        key="video-content"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] z-10 border border-gray-200"
      >
        {/* Left Column: Player & Active Lesson */}
        <div className="flex-grow bg-black relative flex flex-col">
          {/* Top Progress & Completion Ribbon */}
          <div className="bg-gray-950 px-4 py-2.5 border-b border-gray-800 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-white">
              <span className="font-bold text-blue-400">{courseTitle || 'Training Course'}</span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-300 font-medium">
                {completedCount} of {videos.length} Lessons Completed ({progressPercent}%)
              </span>
            </div>
            {isCourseCompleted && (
              <button
                onClick={onOpenCertificate}
                className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-lg font-black text-xs shadow-md animate-pulse cursor-pointer hover:from-amber-400 hover:to-amber-500"
                title="Claim your official verified certificate"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Claim Certificate 🎓</span>
              </button>
            )}
          </div>

          {activeVideo ? (
            <div className="flex-grow flex flex-col justify-between">
              {/* Video Element */}
              <div className="flex-grow bg-black flex items-center justify-center p-2">
                <video
                  key={activeVideo.id || activeVideo.videoUrl}
                  src={activeVideo.videoUrl}
                  className="w-full max-h-[60vh] object-contain rounded-xl"
                  controls
                  autoPlay
                  title={activeVideo.title}
                />
              </div>

              {/* Player Toolbar */}
              <div className="p-4 bg-gray-900 border-t border-gray-800 flex flex-wrap justify-between items-center gap-3">
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-base truncate max-w-md">{activeVideo.title}</h3>
                  <p className="text-xs text-gray-400 line-clamp-1">{activeVideo.description || 'Hands-on practical lesson'}</p>
                </div>

                <div className="flex items-center space-x-2.5">
                  {/* Mark as Completed Button */}
                  <button 
                    onClick={() => toggleComplete(activeVideo.id)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer",
                      isActiveCompleted
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-green-600/20"
                        : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                    )}
                  >
                    {isActiveCompleted ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-white" />
                        <span>Completed ✓</span>
                      </>
                    ) : (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-white/60" />
                        <span>Mark as Completed</span>
                      </>
                    )}
                  </button>

                  {/* Admin Delete Video Button */}
                  {role === 'admin' && (
                    <button
                      onClick={handleDeleteCurrentVideo}
                      className="p-2.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-500/30"
                      title="Admin: Delete this video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-grow text-white text-center p-12">
              <div>
                <PlayCircle className="w-20 h-20 mx-auto mb-4 text-blue-500 opacity-60 animate-pulse" />
                <p className="text-xl font-bold">Select a Lesson</p>
                <p className="text-gray-400 mt-2 text-sm max-w-sm mx-auto">
                  {videos.length > 0 
                    ? 'Pick a video tutorial from the playlist on the right to start learning.' 
                    : 'No lessons uploaded for this course yet.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Lessons Playlist Sidebar */}
        <div className="w-full md:w-88 border-l border-gray-200 bg-gray-50 flex flex-col h-full">
          {/* Playlist Header */}
          <div className="p-5 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-base font-bold text-gray-900">Course Lessons</h4>
              <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold border border-blue-200">
                {videos?.length || 0} Lessons
              </span>
            </div>
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] font-bold text-gray-500">
                <span>Course Progress</span>
                <span className="text-blue-600 font-extrabold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lessons List */}
          <div className="p-4 space-y-2.5 overflow-y-auto flex-grow">
            {loading ? (
              <p className="text-xs text-gray-500 text-center py-6">Loading lessons...</p>
            ) : videos?.map((vid: any, idx: number) => {
              const isCompleted = progressData?.find((p: any) => p.videoId === vid.id)?.completed;
              const isSelected = activeVideo?.id === vid.id;

              return (
                <div
                  key={vid.id || `lesson-item-${idx}`}
                  className={cn(
                    "p-3 rounded-2xl transition-all border flex items-center justify-between gap-3 text-left group",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-900 border-gray-200 hover:border-blue-300"
                  )}
                >
                  <button
                    onClick={() => setActiveVideo(vid)}
                    className="flex items-start space-x-3 min-w-0 flex-grow cursor-pointer text-left"
                  >
                    <div className={cn(
                      "p-2 rounded-xl shrink-0 mt-0.5",
                      isSelected ? "bg-white/20" : "bg-gray-100 text-gray-600"
                    )}>
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-xs font-bold truncate", isSelected ? "text-white" : "text-gray-900")}>
                        {idx + 1}. {vid.title}
                      </p>
                      <p className={cn(
                        "text-[10px] line-clamp-1 mt-0.5",
                        isSelected ? "text-blue-100" : "text-gray-400"
                      )}>
                        {vid.description || 'Lesson video'}
                      </p>
                    </div>
                  </button>

                  {/* Mark as Complete Quick-Toggle Checkbox */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(vid.id);
                    }}
                    className={cn(
                      "p-1.5 rounded-lg shrink-0 transition-colors cursor-pointer",
                      isCompleted 
                        ? (isSelected ? "text-emerald-300 hover:text-white" : "text-green-600 hover:bg-green-50")
                        : (isSelected ? "text-white/60 hover:text-white" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100")
                    )}
                    title={isCompleted ? "Mark incomplete" : "Mark completed"}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 fill-current" />
                    ) : (
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2",
                        isSelected ? "border-white/50" : "border-gray-400"
                      )} />
                    )}
                  </button>
                </div>
              );
            })}

            {videos?.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <PlayCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">No lessons uploaded yet for this course.</p>
              </div>
            )}
          </div>

          {/* Certificate Quick Access Footer */}
          {isCourseCompleted && (
            <div className="p-4 bg-amber-50 border-t border-amber-200">
              <button
                onClick={onOpenCertificate}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-95"
              >
                <Award className="w-4 h-4" />
                <span>View & Download Certificate</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 bg-black/40 hover:bg-black/70 p-2 rounded-full text-white transition-colors backdrop-blur-sm z-20 cursor-pointer"
          title="Close player"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </motion.div>
    </div>
  );
}

function ReviewsManager() {
  const [reviews, loading] = useCollectionData(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')), { idField: 'id' } as any);

  const handleApprove = async (id: string) => {
    if (confirm('Approve this review for public display?')) {
      await updateDoc(doc(db, 'reviews', id), { approved: true });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete review?')) await deleteDoc(doc(db, 'reviews', id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
    >
      <h3 className="text-xl font-bold mb-6">Manage Reviews</h3>
      <div className="space-y-4">
        {reviews?.map((rev: any) => (
          <div key={rev.id} className="p-4 border border-gray-100 rounded-2xl flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold">{rev.userName}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={cn("w-3 h-3", i < rev.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 text-sm italic">"{rev.content}"</p>
              {!rev.approved && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">PENDING APPROVAL</span>}
            </div>
            <div className="flex space-x-2">
              {!rev.approved && (
                <button onClick={() => handleApprove(rev.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                </button>
              )}
              <button onClick={() => handleDelete(rev.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function VideosManager() {
  const [courseId, setCourseId] = useState('gen-ai');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState(false);
  const [previewModalVideo, setPreviewModalVideo] = useState<any | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<any | null>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videosSnap, loadingVideos] = useCollection(collection(db, 'videos'));
  const rawVideos = useMemo<any[]>(() => videosSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [], [videosSnap]);

  const videos = useMemo(() => {
    return rawVideos
      .filter((v: any) => !deletedIds.includes(v.id))
      .sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
        return timeB - timeA;
      });
  }, [rawVideos, deletedIds]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const coursesList = [
    { id: 'gen-ai', title: 'Generative AI' },
    { id: 'data-analysis', title: 'Data Analysis' },
    { id: 'ms-excel', title: 'Microsoft Excel' },
    { id: 'ms-word', title: 'Microsoft Word' },
    { id: 'ms-powerpoint', title: 'Microsoft PowerPoint' },
    { id: 'basic-computing', title: 'Basic Computing' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      if (!title.trim()) {
        const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleRemoveFile = () => {
    setVideoFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile) {
      setToastMessage('Please select an MP4 or VLC video file to upload.');
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const res = await axios.post('/api/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.min(95, Math.round((progressEvent.loaded * 90) / progressEvent.total));
            setUploadProgress(percent);
          }
        }
      });

      setUploadProgress(98);

      const uploadedUrl = res.data?.url;
      const uploadedFileName = res.data?.fileName || videoFile.name;
      const uploadedFileSize = res.data?.fileSize || videoFile.size;

      await addDoc(collection(db, 'videos'), {
        courseId,
        title: title.trim() || uploadedFileName,
        description: description.trim(),
        videoUrl: uploadedUrl,
        fileName: uploadedFileName,
        fileSize: uploadedFileSize,
        videoFormat: 'VLC / MP4 Video',
        createdAt: serverTimestamp()
      });

      setUploadProgress(100);
      setTitle('');
      setDescription('');
      handleRemoveFile();
      setToastMessage('MP4 / VLC video uploaded and published successfully!');
    } catch (err: any) {
      console.error('Video upload failed:', err);
      setToastMessage('Failed to upload video file. Please check server status and try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const executeDeleteVideo = async (targetVideo?: any) => {
    const vid = targetVideo || videoToDelete;
    if (!vid?.id) return;
    const { id, title: vidTitle, videoUrl } = vid;

    // 1. Immediately vanish from UI so it is gone from the library right away
    setDeletedIds(prev => Array.from(new Set([...prev, id])));
    setVideoToDelete(null);
    if (previewModalVideo?.id === id) {
      setPreviewModalVideo(null);
    }

    // 2. Delete from Firestore database
    try {
      await deleteDoc(doc(db, 'videos', id));
    } catch (err: any) {
      console.error('Firestore delete error:', err);
      handleFirestoreError(err, OperationType.DELETE, `videos/${id}`);
    }

    // 3. Delete physical file from server storage
    try {
      const urlToDelete = videoUrl || rawVideos.find((v: any) => v.id === id)?.videoUrl;
      if (urlToDelete) {
        await axios.post('/api/delete-video', { videoUrl: urlToDelete });
      }
    } catch (err) {
      console.error('File cleanup error:', err);
    }

    setToastMessage(`Video "${vidTitle || 'Lesson'}" was successfully deleted and vanished from the library.`);
  };

  const handleDelete = (id: string, vidTitle?: string, vidUrl?: string) => {
    const target = rawVideos.find((v: any) => v.id === id) || { id, title: vidTitle, videoUrl: vidUrl };
    setVideoToDelete(target);
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="space-y-8">
      {/* Action Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center justify-between text-xs font-bold shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-600 hover:text-emerald-900">
              <XCircle className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Upload Training Video (MP4 / VLC)</h3>
            <p className="text-xs text-gray-500">
              Upload local MP4 or VLC default video files directly from your computer without any links or URLs.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Course</label>
              <select 
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              >
                {coursesList.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lesson / Video Title</label>
              <input 
                required
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Lesson 1: Introduction & Fundamentals"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-24"
              placeholder="What practical skills will students learn in this video tutorial?"
            />
          </div>

          {/* DIRECT MP4 / VLC VIDEO FILE UPLOAD (NO LINK / URL INPUT) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-1.5 flex items-center justify-between">
              <span>Select MP4 Video File (VLC Default Video)</span>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Direct File Upload • No Link Required
              </span>
            </label>

            <input 
              ref={fileInputRef}
              type="file" 
              accept="video/mp4,video/x-m4v,video/*,.mp4,.mkv,.avi,.mov,.webm" 
              onChange={handleFileChange}
              className="hidden" 
              id="training-video-file-input"
            />

            {!videoFile ? (
              <label 
                htmlFor="training-video-file-input"
                className="border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50/40 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 mb-3 group-hover:scale-110 transition-transform">
                  <FileVideo className="w-8 h-8" />
                </div>
                <p className="font-bold text-gray-800 text-sm mb-1">Click to select MP4 / VLC video from your computer</p>
                <p className="text-xs text-gray-500 mb-3">Accepts standard VLC formats (.mp4, .mkv, .mov, .avi, .webm) up to 1GB</p>
                <span className="px-4 py-2 bg-blue-600 group-hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-1.5 shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Browse Video Files</span>
                </span>
              </label>
            ) : (
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/70">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <Film className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-sm">{videoFile.name}</p>
                      <p className="text-xs text-gray-500 flex items-center space-x-2">
                        <span className="font-semibold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-[10px]">
                          VLC / MP4 Video
                        </span>
                        <span>{formatFileSize(videoFile.size)}</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleRemoveFile}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors"
                  >
                    Change Video
                  </button>
                </div>

                {previewUrl && (
                  <div className="rounded-xl overflow-hidden bg-black border border-gray-200">
                    <div className="px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <PlayCircle className="w-3.5 h-3.5 text-blue-400" />
                        <span>VLC / MP4 Player Preview</span>
                      </span>
                      <span className="text-[10px] text-gray-400">Ready to publish</span>
                    </div>
                    <video 
                      src={previewUrl} 
                      controls 
                      className="w-full max-h-64 object-contain bg-black"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* UPLOAD PROGRESS BAR */}
          {uploading && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-blue-900">
                <span className="flex items-center space-x-1.5">
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Uploading MP4 video to training portal...</span>
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-[11px] text-blue-700 font-medium">
                Please wait while your VLC / MP4 video file is securely saved to the training video library.
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={uploading || !videoFile}
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-blue-500/20"
          >
            <Upload className="w-5 h-5" />
            <span>{uploading ? `Uploading MP4 Video (${uploadProgress}%)...` : 'Upload & Publish Video'}</span>
          </button>
        </form>
      </motion.div>

      {/* VIDEOS LIBRARY */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
      >
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Videos Library</h3>
          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {videos?.length || 0} Videos Published
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Video Info</th>
                <th className="px-6 py-4">Course</th>
                <th className="px-6 py-4">File Details</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {videos && videos.length > 0 ? (
                videos.map((vid: any, idx: number) => (
                  <tr key={`video-row-${vid.id || idx}-${idx}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{vid.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{vid.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold uppercase">
                        {coursesList.find(c => c.id === vid.courseId)?.title || vid.courseId}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 rounded font-semibold text-[11px] inline-flex items-center">
                          <Film className="w-3 h-3 mr-1 text-orange-500" />
                          VLC / MP4
                        </span>
                        {vid.fileSize && (
                          <span className="text-xs text-gray-400">({formatFileSize(vid.fileSize)})</span>
                        )}
                      </div>
                      {vid.fileName && (
                        <p className="text-[10px] text-gray-400 truncate max-w-xs mt-0.5">{vid.fileName}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {vid.createdAt?.toDate ? vid.createdAt.toDate().toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button 
                          onClick={() => setPreviewModalVideo(vid)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all inline-flex items-center space-x-1 cursor-pointer"
                          title="Watch / Test Video"
                        >
                          <PlayCircle className="w-3.5 h-3.5" />
                          <span>Play</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(vid.id, vid.title, vid.videoUrl)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200/80 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
                          title="Delete this uploaded video"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr key="empty-videos-row">
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">
                    <Film className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    No videos uploaded yet. Select an MP4 video above to publish.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* CONFIRM DELETE MODAL: INSTANT VANISH & PERMANENT DELETE */}
      <AnimatePresence>
        {videoToDelete && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setVideoToDelete(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-md w-full z-10 p-6 border border-gray-100"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 mb-4 mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 text-center mb-1">
                Delete Video from Library?
              </h4>
              <p className="text-xs text-gray-500 text-center mb-5 leading-relaxed">
                Are you sure you want to delete <strong className="text-gray-900">"{videoToDelete.title}"</strong>?<br/>
                It will immediately vanish and be permanently removed from the video library and server.
              </p>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setVideoToDelete(null)}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => executeDeleteVideo(videoToDelete)}
                  className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-500/20 transition-all flex items-center justify-center space-x-1.5 cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete & Vanish</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADMIN VIDEO PREVIEW MODAL */}
      <AnimatePresence>
        {previewModalVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
              onClick={() => setPreviewModalVideo(null)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-3xl w-full z-10"
            >
              <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Film className="w-5 h-5 text-orange-400" />
                  <h4 className="font-bold text-sm truncate max-w-md">{previewModalVideo.title}</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleDelete(previewModalVideo.id, previewModalVideo.title, previewModalVideo.videoUrl)}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    title="Delete this video"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Video</span>
                  </button>
                  <button 
                    onClick={() => setPreviewModalVideo(null)}
                    className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="bg-black flex items-center justify-center aspect-video">
                <video 
                  src={previewModalVideo.videoUrl} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
                <span>{previewModalVideo.description}</span>
                <span className="font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded">
                  VLC / MP4 Player
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
