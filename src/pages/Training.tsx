import { useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { collection, addDoc, serverTimestamp, doc, deleteDoc, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, PlayCircle, CheckCircle, XCircle, ArrowRight, CheckCircle2, Users, ShoppingCart, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCurrency } from '../contexts/CurrencyContext';
import { useCart } from '../contexts/CartContext';

import FAQSection from '../components/FAQSection';
import { courses } from '../data/courses';

export default function Training() {
  const [user] = useAuthState(auth);
  const { formatPrice } = useCurrency();
  const { cartItems, addToCart, removeFromCart, isInCart, totalAmount } = useCart();
  const [cancellingCourseId, setCancellingCourseId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Query user enrollments to show real-time enrollment status
  const enrollmentQuery = user ? query(collection(db, 'enrollments'), where('userId', '==', user.uid)) : null;
  const [enrollmentSnap] = useCollection(enrollmentQuery);
  const enrolledList = useMemo<any[]>(() => {
    if (!enrollmentSnap) return [];
    return enrollmentSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  }, [enrollmentSnap]);

  const handleCancelEnrollment = async (e: React.MouseEvent, courseId: string, courseTitle: string) => {
    e.stopPropagation();
    if (!user) return;

    const enrollmentId = `${user.uid}_${courseId}`;
    setCancellingCourseId(courseId);
    try {
      await deleteDoc(doc(db, 'enrollments', enrollmentId));
      await addDoc(collection(db, 'notifications'), {
        userId: user.uid,
        title: 'Course Unenrolled',
        message: `You have successfully unenrolled from "${courseTitle}".`,
        courseId: courseId,
        courseTitle: courseTitle,
        type: 'course_cancelled',
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `enrollments/${enrollmentId}`);
    } finally {
      setCancellingCourseId(null);
    }
  };

  const handleEnrollClick = (course: typeof courses[0]) => {
    addToCart(course);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen pt-28 md:pt-40 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between my-8 md:my-16 gap-8">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl min-[400px]:text-4xl sm:text-5xl font-black text-slate-950 mb-4 md:mb-6 tracking-tight leading-tight break-words"
            >
              Interactive <span className="text-primary italic">Online Classes</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-base sm:text-xl text-slate-900 font-bold leading-relaxed"
            >
              Master in-demand tech skills through our live online classes. Register now to receive your unique Course Code and join our WhatsApp learning community for instructor guidance and professional certification.
            </motion.p>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-6 md:p-8 rounded-[32px] flex items-center space-x-4 shadow-sm">
            <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-600/20">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-slate-950 font-black text-xl leading-none mb-1 uppercase tracking-tighter">Interactive Classes</h4>
              <p className="text-blue-700 font-black text-[10px] uppercase tracking-widest">WhatsApp Learning • Live Sessions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => {
            const enrolled = enrolledList.find((en: any) => en.courseId === course.id);
            const isEnrolledApproved = enrolled && (enrolled.status === 'approved' || enrolled.status === 'paid');
            const inCart = isInCart(course.id);

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "service-card-hover group bg-white border rounded-3xl overflow-hidden hover:shadow-2xl transition-all relative flex flex-col",
                  inCart ? "border-primary ring-2 ring-primary/20 shadow-xl" : "border-gray-100 hover:border-primary/40"
                )}
              >
                {/* Active Status Badges */}
                {isEnrolledApproved && (
                  <div className="absolute top-4 right-4 bg-emerald-600 text-white px-3 py-1 rounded-full z-10 text-[10px] font-black uppercase tracking-widest flex items-center space-x-1 shadow-md">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Enrolled & Paid</span>
                  </div>
                )}
                {!enrolled && inCart && (
                  <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full z-10 shadow-lg">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                )}
                
                <div className="h-48 overflow-hidden relative">
                  <img 
                    src={course.image} 
                    alt={course.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                    <div className={cn(
                      "p-3 rounded-xl transition-colors",
                      inCart || isEnrolledApproved ? "bg-primary text-white" : "bg-white/95 text-primary backdrop-blur-sm"
                    )}>
                      <course.icon className="w-6 h-6" />
                    </div>
                    <div className="text-right text-white">
                      <span className="block text-lg font-black bg-primary/95 px-3 py-1 rounded-lg text-white shadow-md">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-2xl font-black text-slate-950 mb-3 tracking-tighter">{course.title}</h3>
                  <p className="text-slate-900 font-bold mb-6 line-clamp-2 text-sm leading-relaxed">{course.desc}</p>
                  
                  <div className="space-y-3 mb-8 flex-grow">
                    {course.features.map((f, i) => (
                      <div key={i} className="flex items-center text-sm font-black text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-primary mr-2.5 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* Button Actions */}
                  {enrolled ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 shadow-md shadow-primary/20 cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>Go to My Learning</span>
                      </button>
                      <button
                        disabled={cancellingCourseId === course.id}
                        onClick={(e) => handleCancelEnrollment(e, course.id, course.title)}
                        className="w-full py-2.5 bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-2xl font-medium text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border border-gray-200 disabled:opacity-50"
                        title="Unenroll from this course"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{cancellingCourseId === course.id ? 'Unenrolling...' : 'Unenroll from Course'}</span>
                      </button>
                    </div>
                  ) : inCart ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => navigate('/cart')}
                        className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-primary/20 cursor-pointer"
                      >
                        <ShoppingCart className="w-5 h-5" />
                        <span>Go to Cart</span>
                      </button>
                      <button
                        onClick={() => removeFromCart(course.id)}
                        className="w-full py-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-2xl font-medium text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border border-gray-200"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Remove from Cart</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleEnrollClick(course)}
                        className="w-full py-4 bg-gray-900 hover:bg-primary text-white rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-gray-900/10"
                      >
                        <BookOpen className="w-5 h-5" />
                        <span>Enroll & Pay ({formatPrice(course.price)})</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                      <button
                        onClick={() => addToCart(course)}
                        className="w-full py-2.5 bg-white text-slate-600 hover:bg-gray-50 rounded-2xl font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border border-gray-200"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Floating Cart Summary */}
        <AnimatePresence>
          {cartItems.length > 0 && (
            <motion.div
              key="floating-summary"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            >
              <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-blue-100 backdrop-blur-xl bg-white/95">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-black text-slate-950">{cartItems.length} Courses in Cart</span>
                    <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase shadow-sm">
                      Total: {formatPrice(totalAmount)}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm font-bold">
                    {cartItems.map(c => c.title).join(' • ')}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/cart')}
                  className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-5 h-5" />
                  <span>Go to Cart & Pay</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Interactive FAQ Section */}
      <FAQSection />
    </div>
  );
}
