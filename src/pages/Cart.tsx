import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ShoppingCart, ArrowLeft, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { auth, db } from '../lib/firebase';
import PaystackPaymentModal from '../components/PaystackPaymentModal';
import SuccessOverlay from '../components/SuccessOverlay';
import { collection, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
import axios from 'axios';

export default function Cart() {
  const [user] = useAuthState(auth);
  const { cartItems, removeFromCart, clearCart, totalAmount } = useCart();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [checkoutTarget, setCheckoutTarget] = useState<any[] | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successCourseTitle, setSuccessCourseTitle] = useState('');

  const handlePaystackSuccess = async (reference: string, studentData?: { name?: string; email?: string; phone?: string }) => {
    if (!user || !cartItems.length) return;

    try {
      const studentName = studentData?.name || user.displayName || user.email?.split('@')[0] || 'Student';
      const studentEmail = studentData?.email || user.email || '';
      const studentPhone = studentData?.phone || '';

      const promises = cartItems.map(course => {
        const enrollmentId = `${user.uid}_${course.id}`;
        const enrollmentCode = `KL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        
        return (async () => {
          await setDoc(doc(db, 'enrollments', enrollmentId), {
            userId: user.uid,
            userName: studentName,
            userEmail: studentEmail,
            userPhone: studentPhone,
            courseId: course.id,
            courseTitle: course.title,
            status: 'paid',
            amount: course.price,
            paymentMethod: 'Paystack',
            paymentReference: reference,
            enrollmentCode,
            paidAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          });

          // Notification for the student
          await addDoc(collection(db, 'notifications'), {
            userId: user.uid,
            title: 'Class Registration Confirmed!',
            message: `Your payment for ${course.title} via Paystack was confirmed! Your Course Code is: ${enrollmentCode}. An admin will contact you on WhatsApp (${studentPhone || 'your registered number'}) to add you to the class group.`,
            courseId: course.id,
            courseTitle: course.title,
            type: 'course_payment_confirmed',
            read: false,
            createdAt: serverTimestamp()
          });

          // Notification for the admin
          await addDoc(collection(db, 'notifications'), {
            title: `New Course Enrollment: ${course.title}`,
            message: `New student ${studentName} (${studentPhone || studentEmail}) has enrolled and paid for "${course.title}". Gateway Ref: ${reference}. Enrollment Code: ${enrollmentCode}.`,
            courseId: course.id,
            userId: user.uid,
            type: 'admin_new_enrollment',
            read: false,
            createdAt: serverTimestamp()
          });

          return { title: course.title, price: course.price, code: enrollmentCode };
        })();
      });

      const enrolledResults = await Promise.all(promises);

      // Automatic Email Message
      try {
        await axios.post('/api/send-enrollment-email', {
          studentEmail: studentEmail || user.email,
          studentName: studentName,
          courses: enrolledResults.map(r => ({ title: r.title, price: r.price })),
          totalAmount: enrolledResults.reduce((sum, r) => sum + r.price, 0),
          paymentReference: reference,
          phone: studentPhone,
          enrollmentCode: enrolledResults[0].code
        });
      } catch (mailErr) {
        console.warn('Auto enrollment email dispatch notice:', mailErr);
      }

      setSuccessCourseTitle(cartItems.map(c => c.title).join(', '));
      clearCart();
      setShowSuccess(true);
      setCheckoutTarget(null);
      setTimeout(() => navigate('/dashboard'), 2400);
    } catch (err: any) {
      console.error('Enrollment Payment Error:', err);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
            <ShoppingCart className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-950">Your cart is empty</h2>
          <p className="text-slate-600 font-bold">
            You haven't added any courses to your cart yet. Explore our training programs to get started.
          </p>
          <button
            onClick={() => navigate('/training')}
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-primary/20"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Training</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center space-x-4 mb-12">
          <button
            onClick={() => navigate('/training')}
            className="p-2 bg-white rounded-xl text-slate-600 hover:text-primary transition-colors border border-gray-100 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-black text-slate-950 tracking-tight">Your Course Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-center gap-6"
                >
                  <div className="w-full sm:w-32 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-xl font-black text-slate-950 mb-1">{item.title}</h3>
                    <p className="text-slate-500 text-sm font-bold line-clamp-1">{item.desc}</p>
                    <div className="mt-2 flex items-center justify-center sm:justify-start space-x-4 text-xs font-black uppercase tracking-widest text-primary">
                      <span className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Live Online Class</span>
                      <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 italic">Certificate Included</span>
                    </div>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center gap-4 sm:items-end w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                    <div className="text-xl font-black text-slate-950 flex-grow sm:flex-grow-0 text-left sm:text-right">
                      {formatPrice(item.price)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors group"
                      title="Remove from cart"
                    >
                      <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-xl sticky top-32">
              <h2 className="text-2xl font-black text-slate-950 mb-8 tracking-tight">Order Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-600 font-bold">
                  <span>Subtotal ({cartItems.length} courses)</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-bold text-sm">
                  <span>Course Activation Fee</span>
                  <span className="uppercase tracking-widest text-[10px] font-black">Included</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-black text-slate-950">Total Amount</span>
                  <span className="text-2xl font-black text-primary">{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <button
                  onClick={() => {
                    if (!user) {
                      navigate('/auth?redirect=/cart');
                      return;
                    }
                    setCheckoutTarget(cartItems);
                  }}
                  className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-lg transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-3 active:scale-95"
                >
                  <Lock className="w-5 h-5" />
                  <span>Secure Checkout</span>
                </button>
                
                <div className="flex items-center justify-center space-x-4">
                  <img src="https://paystack.com/assets/payment/cards.png" alt="Payment Methods" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" />
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                      Instant enrollment code generation after successful Paystack verification.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                      Secure payment processing supporting MoMo and Bank Cards.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paystack Payment Modal */}
      {checkoutTarget && (
        <PaystackPaymentModal
          isOpen={!!checkoutTarget}
          onClose={() => setCheckoutTarget(null)}
          title={checkoutTarget.length === 1 ? checkoutTarget[0].title : `${checkoutTarget.length} Courses Bundle`}
          amount={totalAmount}
          customerEmail={user?.email || ''}
          customerName={user?.displayName || ''}
          onSuccess={handlePaystackSuccess}
        />
      )}

      <SuccessOverlay 
        show={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        title="Payment Successful! 🎉"
        message={`You have successfully enrolled in: ${successCourseTitle}. Your course codes have been sent to your email. You can now access them from your dashboard.`}
      />
    </div>
  );
}
