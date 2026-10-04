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
  Phone,
  Mail,
  Archive,
  CheckSquare,
  Send
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
import StudentCoursesDashboard from '../components/StudentCoursesDashboard';
import { CreditCard, Lock } from 'lucide-react';
import logoImg from '../assets/images/kobbi_labs_final_logo_1790937512033.jpg';

import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const { formatPrice } = useCurrency();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => {
    setSearchParams(prev => {
      prev.set('tab', tab);
      return prev;
    });
  };

  const adminSubTab = (searchParams.get('adminTab') as 'enrollments' | 'users' | 'inquiries' | 'subscribers') || 'enrollments';
  const setAdminSubTab = (subTab: string) => {
    setSearchParams(prev => {
      prev.set('adminTab', subTab);
      return prev;
    });
  };

  const [role, setRole] = useState<string | null>(null);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const isAdmin = role === 'admin' || 
    user?.email?.toLowerCase() === 'kobbilabs@gmail.com' || 
    user?.email?.toLowerCase() === 'kobbijaysoftware@gmail.com';

  useEffect(() => {
    if (user) {
      const path = `users/${user.uid}`;
      getDoc(doc(db, 'users', user.uid)).then(async snap => {
        if (snap.exists()) {
          setRole(snap.data().role);
        } else {
          const isUserAdmin = 
            user.email?.toLowerCase() === 'kobbilabs@gmail.com' || 
            user.email?.toLowerCase() === 'kobbijaysoftware@gmail.com';
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

  // For admin: also count unseen pending orders and new inquiries
  const ordersSummaryQuery = isAdmin ? query(collection(db, 'orders')) : null;
  const inquiriesSummaryQuery = isAdmin ? query(collection(db, 'inquiries'), where('status', '==', 'new')) : null;
  
  const [ordersSummarySnap] = useCollection(ordersSummaryQuery);
  const [inquiriesSummarySnap] = useCollection(inquiriesSummaryQuery);

  const unseenPendingOrdersCount = useMemo(() => {
    if (!isAdmin || !ordersSummarySnap) return 0;
    return ordersSummarySnap.docs.filter(d => !d.data().adminSeen && (d.data().status === 'pending' || d.data().status === 'submitted')).length;
  }, [isAdmin, ordersSummarySnap]);

  const newInquiriesCount = useMemo(() => {
    if (!isAdmin || !inquiriesSummarySnap) return 0;
    return inquiriesSummarySnap.docs.length;
  }, [isAdmin, inquiriesSummarySnap]);

  const totalAlertsCount = unreadNotifications.length + unseenPendingOrdersCount + newInquiriesCount;
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
    <div className="min-h-screen pt-16 md:pt-[112px] pb-12 bg-gray-50 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border border-white ring-4 ring-blue-50 shrink-0">
              <img 
                src={logoImg} 
                alt="Kobbi Labs Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                  {isAdmin ? 'Admin Command Hub' : 'Student Portal'}
                </h1>
                {isAdmin && (
                  <span className="bg-red-100 text-red-700 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-red-200">
                    Administrator
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-sm font-medium mt-0.5">
                {isAdmin 
                  ? `Kobbi Labs Central Management • ${user.email}`
                  : `Welcome back, ${user.displayName || user.email?.split('@')[0] || 'Student'}`}
              </p>
            </div>
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

                      {/* New Inquiries banner for admin */}
                      {isAdmin && newInquiriesCount > 0 && (
                        <div 
                          onClick={() => {
                            setActiveTab('training');
                            setAdminSubTab('inquiries');
                            setShowNotifMenu(false);
                          }}
                          className="p-3 bg-blue-50 border-b border-blue-200 text-blue-800 text-xs font-bold flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            <span>{newInquiriesCount} new client inquiries received!</span>
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
              <span>{isAdmin ? 'Manage Students & Classes' : 'My Registered Classes'}</span>
            </button>
            {isAdmin && (
              <Fragment key="admin-nav-extras">
                <button
                  onClick={() => { setActiveTab('training'); setAdminSubTab('inquiries'); }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer",
                    activeTab === 'training' && adminSubTab === 'inquiries' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Mail className="w-5 h-5" />
                  <span>Client Inquiries</span>
                </button>
                <button
                  onClick={() => { setActiveTab('training'); setAdminSubTab('subscribers'); }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all cursor-pointer",
                    activeTab === 'training' && adminSubTab === 'subscribers' ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" : "bg-white text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Send className="w-5 h-5" />
                  <span>Newsletter List</span>
                </button>
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
                  adminSubTab={adminSubTab}
                  setAdminSubTab={setAdminSubTab}
                />
              )}
              {activeTab === 'reviews' && isAdmin && <ReviewsManager key="reviews" />}
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

  const [orders] = useCollectionData(ordersQuery);
  const [enrollments] = useCollectionData(enrollmentsQuery);

  const pendingOrders = useMemo(() => {
    return (orders || []).filter((o: any) => o.status === 'pending' || o.status === 'submitted' || !o.adminSeen);
  }, [orders]);

  const activeStudents = useMemo(() => {
    return (enrollments || []).filter((e: any) => e.status === 'approved' || e.status === 'paid');
  }, [enrollments]);
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
          message: `Your service order for "${serviceTitle}" has been seen and acknowledged by Kobbi Labs admin! Our technical team is reviewing your project requirements.`,
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
          message: `Your order for "${serviceTitle}" has been officially approved by Kobbi Labs admin!`,
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
            message: `Your order for "${order.serviceTitle}" has been officially approved by Kobbi Labs admin!`,
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
        <div className="bg-white rounded-3xl p-8 text-slate-900 shadow-lg border border-blue-100 relative overflow-hidden">
          {/* Decorative background accent */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 opacity-50" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Kobbi Labs • Command Center
              </span>
              <h2 className="text-2xl md:text-3xl font-black mt-3 text-slate-950">Administrator Overview</h2>
              <p className="text-slate-700 font-bold text-sm mt-1 max-w-xl">
                Manage incoming client orders, approve course enrollments, and monitor customer reviews.
              </p>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {pendingOrders.length > 0 && (
                <button
                  onClick={handleOverviewApproveAll}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer active:scale-95"
                  title="Approve all pending orders immediately"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve All Orders ({pendingOrders.length})</span>
                </button>
              )}
              <button
                onClick={() => onNavigateTab && onNavigateTab('orders')}
                className="px-4 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-primary/20 flex items-center space-x-1.5 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Manage Orders ({orders?.length || 0})</span>
              </button>
              <button
                onClick={() => onNavigateTab && onNavigateTab('training')}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-slate-900/10 flex items-center space-x-1.5 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Students & Classes</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back to Kobbi Labs!</h3>
            <p className="text-gray-600 text-sm">
              Track your registered classes, Course Codes, and submitted software service orders.
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
          message: `Your service order for "${order.serviceTitle}" has been seen and acknowledged by Kobbi Labs admin! Our technical team is reviewing your project requirements.`,
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
          message: `Your order for "${order.serviceTitle}" has been officially approved by Kobbi Labs admin!`,
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
                message: `Your order for "${order.serviceTitle}" has been officially approved by Kobbi Labs admin!`,
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
    
    // Header - Kobbi Labs, Koforidua, Ghana
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text('KOBBI LABS', 105, 20, { align: 'center' });
    
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
    doc.text('Thank you for choosing Kobbi Labs!', 105, finalY + 44, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Processed securely via Paystack Payment Gateway', 105, finalY + 50, { align: 'center' });
    doc.text('Kobbi Labs • Koforidua, Ghana • All Rights Reserved', 105, finalY + 56, { align: 'center' });
    
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
                  <p className="text-xs text-gray-500">Kobbi Labs Management Action</p>
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


function Training({ role, userId, adminSubTab: parentAdminSubTab, setAdminSubTab: setParentAdminSubTab }: any) {
  const isAdmin = role === 'admin';
  const { formatPrice } = useCurrency();
  const [certModalCourse, setCertModalCourse] = useState<{ id: string; title: string; userName?: string } | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [localAdminSubTab, setLocalAdminSubTab] = useState<'enrollments' | 'users' | 'inquiries'>('enrollments');
  
  const adminSubTab = parentAdminSubTab || localAdminSubTab;
  const setAdminSubTab = setParentAdminSubTab || setLocalAdminSubTab;

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

  // Query inquiries for admin
  const inquiriesQuery = isAdmin ? query(collection(db, 'inquiries'), orderBy('createdAt', 'desc')) : null;
  const [inquiriesSnap, loadingInquiries] = useCollection(inquiriesQuery);

  const inquiriesList = useMemo<any[]>(() => {
    if (!inquiriesSnap) return [];
    return inquiriesSnap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));
  }, [inquiriesSnap]);

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

  // Filtered inquiries for admin
  const filteredInquiries = useMemo(() => {
    if (!inquiriesList) return [];
    const q = searchQuery.toLowerCase().trim();
    if (!q) return inquiriesList;
    return inquiriesList.filter((i: any) => 
      i.name?.toLowerCase().includes(q) || 
      i.email?.toLowerCase().includes(q) ||
      i.subject?.toLowerCase().includes(q) ||
      i.message?.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q)
    );
  }, [inquiriesList, searchQuery]);

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
          message: `Your enrollment for "${targetTitle}" has been approved by admin! You now have full access to our online classes. Please check your email for the official WhatsApp group link.`,
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

  // Admin marks inquiry as read/replied
  const handleInquiryStatus = async (id: string, status: string) => {
    setProcessingId(id);
    try {
      await updateDoc(doc(db, 'inquiries', id), { status });
      setToast({ type: 'success', message: `Inquiry marked as ${status}.` });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to update inquiry status.' });
    } finally {
      setProcessingId(null);
    }
  };

  // Admin deletes inquiry
  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Permanently delete this inquiry?')) return;
    setProcessingId(id);
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      setToast({ type: 'success', message: 'Inquiry deleted successfully.' });
    } catch (err) {
      console.error(err);
      setToast({ type: 'error', message: 'Failed to delete inquiry.' });
    } finally {
      setProcessingId(null);
    }
  };

  const downloadReceipt = (en: any) => {
    const doc = new jsPDF();
    const formattedAmount = `GH₵ ${Number(en.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    
    // Header - Kobbi Labs, Koforidua, Ghana
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text('KOBBI LABS', 105, 20, { align: 'center' });
    
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
    doc.text('Thank you for choosing Kobbi Labs!', 105, finalY + 45, { align: 'center' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text('Processed securely via Paystack Payment Gateway', 105, finalY + 51, { align: 'center' });
    doc.text('Kobbi Labs • Koforidua, Ghana • All Rights Reserved', 105, finalY + 57, { align: 'center' });
    
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
            <button
              onClick={() => { setAdminSubTab('inquiries'); setSearchQuery(''); }}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer",
                adminSubTab === 'inquiries'
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <Mail className="w-4 h-4" />
              <span>Client Inquiries</span>
              {inquiriesList.filter(i => i.status === 'new').length > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-black animate-pulse">
                  {inquiriesList.filter(i => i.status === 'new').length} New
                </span>
              )}
            </button>
            <button
              onClick={() => { setAdminSubTab('subscribers'); setSearchQuery(''); }}
              className={cn(
                "flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer",
                adminSubTab === 'subscribers'
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <Send className="w-4 h-4" />
              <span>Subscribers</span>
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
      {role === 'admin' ? (
        <motion.div 
          key="enrollments-view-admin"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Student Course Enrollments
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Review course applications, activate approvals, or delete student records.
              </p>
            </div>

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
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Student / Reference</th>
                  <th className="px-6 py-4">Course Access Code</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEnrollments.length > 0 ? (
                  filteredEnrollments.map((en: any, idx: number) => {
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
                            Interactive Online Class
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

                        {/* Access Code */}
                        <td className="px-6 py-4">
                          {isApproved ? (
                            <div className="w-full max-w-xs">
                              <div className="flex items-center space-x-2">
                                <span className="bg-blue-50 text-blue-700 font-mono text-sm px-3 py-1.5 rounded-lg border border-blue-100 font-black">
                                  {en.enrollmentCode || 'KL-WAITING'}
                                </span>
                                <Lock className="w-3.5 h-3.5 text-blue-400" />
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1">Use this code for class verification</p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Locked until approved</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
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
                      </td>
                    </tr>
                  ) : null
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      ) : (
        <StudentCoursesDashboard 
          enrollments={enrollments}
          onDownloadReceipt={downloadReceipt}
          onOpenCertificate={(en) => setCertModalCourse({ id: en.courseId, title: en.courseTitle, userName: en.userName })}
        />
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

      {/* VIEW 3: CLIENT INQUIRIES MANAGEMENT (ADMIN ONLY) */}
      {role === 'admin' && adminSubTab === 'inquiries' && (
        <motion.div 
          key="inquiries-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Incoming Client Inquiries</h3>
              <p className="text-xs text-gray-500 mt-1">
                Manage questions submitted via the contact form. These are saved here instead of only being sent to Gmail.
              </p>
            </div>
            <div className="text-xs font-semibold text-gray-500">
              Total Inquiries: {filteredInquiries.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Sender & Contact</th>
                  <th className="px-6 py-4">Inquiry Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInquiries.length > 0 ? (
                  filteredInquiries.map((inq: any, idx: number) => {
                    const isNew = inq.status === 'new';
                    const inqRowKey = `inquiry-row-${inq.id || idx}`;

                    return (
                      <tr key={inqRowKey} className={cn("hover:bg-gray-50/80 transition-colors", isNew ? "bg-blue-50/30" : "")}>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900">{inq.name}</div>
                          <div className="text-xs text-blue-600 font-medium">{inq.email}</div>
                          <div className="text-[10px] text-gray-500 mt-1 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {inq.phone}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{inq.category}</div>
                          <div className="text-sm font-bold text-gray-900 mb-1">{inq.subject}</div>
                          <p className="text-xs text-gray-600 line-clamp-2 max-w-md italic">"{inq.message}"</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                            isNew ? "bg-blue-100 text-blue-700" : inq.status === 'replied' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                          )}>
                            {inq.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {isNew ? (
                              <button
                                onClick={() => handleInquiryStatus(inq.id, 'read')}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                title="Mark as Read"
                              >
                                <CheckSquare className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleInquiryStatus(inq.id, 'new')}
                                className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-all"
                                title="Mark as New"
                              >
                                <Archive className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              title="Delete Inquiry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr key="empty-inquiries">
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 font-bold">
                      No inquiries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* VIEW 4: NEWSLETTER SUBSCRIBERS (ADMIN ONLY) */}
      {role === 'admin' && adminSubTab === 'subscribers' && (
        <SubscribersManager />
      )}

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

function SubscribersManager() {
  const [subs] = useCollectionData(query(collection(db, 'newsletter_subscribers'), orderBy('subscribedAt', 'desc')), { idField: 'id' } as any);

  const handleDelete = async (id: string) => {
    if (confirm('Delete subscriber?')) await deleteDoc(doc(db, 'newsletter_subscribers', id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Newsletter Subscribers</h3>
          <p className="text-xs text-gray-500 mt-1">Manage users who have signed up for the newsletter.</p>
        </div>
        <div className="text-xs font-semibold text-gray-500">
          Total Subscribers: {subs?.length || 0}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Subscribed At</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subs?.map((sub: any) => (
              <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{sub.email}</td>
                <td className="px-6 py-4 text-xs text-gray-500">
                  {sub.subscribedAt?.toDate ? sub.subscribedAt.toDate().toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(sub.id)} 
                    className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {subs?.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-400 font-medium">No subscribers yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
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
