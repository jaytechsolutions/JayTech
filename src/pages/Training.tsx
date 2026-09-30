import { useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollection } from 'react-firebase-hooks/firestore';
import axios from 'axios';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { collection, addDoc, serverTimestamp, setDoc, doc, deleteDoc, query, where } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, PlayCircle, CheckCircle, Award, XCircle, ArrowRight, Sparkles, CheckCircle2, ShieldCheck, CreditCard, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useCurrency } from '../contexts/CurrencyContext';

import SuccessOverlay from '../components/SuccessOverlay';
import PaystackPaymentModal from '../components/PaystackPaymentModal';
import FAQSection from '../components/FAQSection';
import { courses } from '../data/courses';

export default function Training() {
  const [user] = useAuthState(auth);
  const { formatPrice } = useCurrency();
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [cancellingCourseId, setCancellingCourseId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successCourseTitle, setSuccessCourseTitle] = useState('');
  const [checkoutTarget, setCheckoutTarget] = useState<typeof courses | null>(null);
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
      setSelectedCourses(prev => prev.filter(c => c !== courseId));
    } catch (err: any) {
      handleFirestoreError(err, OperationType.DELETE, `enrollments/${enrollmentId}`);
    } finally {
      setCancellingCourseId(null);
    }
  };

  const getSelectedData = () => {
    return courses.filter(c => selectedCourses.includes(c.id));
  };

  const toggleCourse = (id: string) => {
    setSelectedCourses(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const dropCourse = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedCourses(prev => prev.filter(c => c !== id));
  };

  const startCheckout = (targetCourses: typeof courses) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (targetCourses.length === 0) return;
    setCheckoutTarget(targetCourses);
  };

  const handlePaystackSuccess = async (reference: string, studentData?: { name?: string; email?: string; phone?: string }) => {
    if (!user || !checkoutTarget) return;

    try {
      const studentName = studentData?.name || user.displayName || user.email?.split('@')[0] || 'Student';
      const studentEmail = studentData?.email || user.email || '';
      const studentPhone = studentData?.phone || '';

      const promises = checkoutTarget.map(course => {
        const enrollmentId = `${user.uid}_${course.id}`;
        return setDoc(doc(db, 'enrollments', enrollmentId), {
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
          paidAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });
      });

      await Promise.all(promises);

      for (const course of checkoutTarget) {
        // Notification for the student
        await addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          title: 'Enrollment Confirmed via Paystack!',
          message: `Your payment of ${formatPrice(course.price)} via Paystack was confirmed! Ref: ${reference}. WhatsApp: ${studentPhone || 'Not provided'}. Full course access has been activated.`,
          courseId: course.id,
          courseTitle: course.title,
          type: 'course_payment_confirmed',
          read: false,
          createdAt: serverTimestamp()
        });

        // Notification for admin
        await addDoc(collection(db, 'notifications'), {
          title: `New Student Enrolled: ${course.title}`,
          message: `${studentName} (${studentPhone ? `WhatsApp: ${studentPhone}, ` : ''}${studentEmail}) has paid ${formatPrice(course.price)} via Paystack for "${course.title}". Ref: ${reference}.`,
          courseId: course.id,
          type: 'admin_new_enrollment',
          read: false,
          createdAt: serverTimestamp()
        });
      }

      // Automatic Email Message from jaytechsolutions.net@gmail.com to student after payment
      try {
        await axios.post('/api/send-enrollment-email', {
          studentEmail: studentEmail || user.email,
          studentName: studentName,
          courses: checkoutTarget.map(c => ({ title: c.title, price: c.price })),
          totalAmount: checkoutTarget.reduce((sum, c) => sum + c.price, 0),
          paymentReference: reference,
          phone: studentPhone
        });
      } catch (mailErr) {
        console.warn('Auto enrollment email dispatch notice:', mailErr);
      }

      setSuccessCourseTitle(checkoutTarget.map(c => c.title).join(', '));
      setSelectedCourses([]);
      setShowSuccess(true);
      setCheckoutTarget(null);
      setTimeout(() => navigate('/dashboard'), 2400);
    } catch (err: any) {
      console.error('Enrollment Payment Error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'enrollments');
    }
  };

  const totalSelectedAmount = useMemo(() => {
    return getSelectedData().reduce((sum, c) => sum + c.price, 0);
  }, [selectedCourses]);

  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            >
              Professional <span className="text-blue-600">Tech Training</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-gray-600"
            >
              Master in-demand tech skills at your own pace. High-quality curriculums with lifetime video access, practical projects, and professional certification upon completion.
            </motion.p>
          </div>

          <div className="bg-teal-50 border border-teal-100 p-6 rounded-3xl flex items-center space-x-4 shadow-sm">
            <div className="bg-teal-600 p-3 rounded-2xl text-white">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-teal-950 font-black text-xl leading-none mb-1">SELF-PACED ACCESS</h4>
              <p className="text-teal-700 font-bold text-sm">Flexible Learning • No Fixed Schedules</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course, idx) => {
            const enrolled = enrolledList.find((en: any) => en.courseId === course.id);
            const isEnrolledApproved = enrolled && (enrolled.status === 'approved' || enrolled.status === 'paid');

            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={cn(
                  "service-card-hover group bg-white border rounded-3xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer relative flex flex-col",
                  selectedCourses.includes(course.id) ? "border-teal-600 ring-2 ring-teal-600/20 shadow-xl" : "border-gray-100 hover:border-teal-200"
                )}
                onClick={() => {
                  if (!enrolled) {
                    toggleCourse(course.id);
                  }
                }}
              >
                {/* Active Status Badges */}
                {isEnrolledApproved && (
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full z-10 text-xs font-bold flex items-center space-x-1 shadow-md">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Enrolled & Paid</span>
                  </div>
                )}
                {!enrolled && selectedCourses.includes(course.id) && (
                  <div className="absolute top-4 right-4 bg-teal-600 text-white p-1 rounded-full z-10">
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
                      selectedCourses.includes(course.id) || isEnrolledApproved ? "bg-teal-600 text-white" : "bg-white/90 text-teal-600 backdrop-blur-sm"
                    )}>
                      <course.icon className="w-6 h-6" />
                    </div>
                    <div className="text-right text-white">
                      <span className="block text-lg font-black bg-teal-600/90 px-3 py-1 rounded-full text-white shadow-md">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-8 flex-grow flex flex-col">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-6 line-clamp-2">{course.desc}</p>
                  
                  <div className="space-y-3 mb-8 flex-grow">
                    {course.features.map((f, i) => (
                      <div key={i} className="flex items-center text-sm font-medium text-gray-500">
                        <CheckCircle2 className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />
                        {f}
                      </div>
                    ))}
                  </div>

                  {/* Button Actions */}
                  {enrolled ? (
                    <div className="space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/dashboard');
                        }}
                        className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 shadow-md shadow-teal-500/20 cursor-pointer"
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
                      <div className="text-center py-1">
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200 inline-flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1 text-green-600" />
                          Enrollment Active
                        </span>
                      </div>
                    </div>
                  ) : selectedCourses.includes(course.id) ? (
                    <div className="space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startCheckout([course]);
                        }}
                        className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 cursor-pointer"
                      >
                        <Lock className="w-5 h-5" />
                        <span>Pay {formatPrice(course.price)} with Paystack</span>
                      </button>
                      <button
                        onClick={(e) => dropCourse(e, course.id)}
                        className="w-full py-2.5 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-2xl font-medium text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer border border-gray-200"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Deselect Course</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startCheckout([course]);
                        }}
                        className="w-full py-4 bg-gray-900 hover:bg-teal-600 text-white rounded-2xl font-bold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md shadow-gray-900/10"
                      >
                        <BookOpen className="w-5 h-5" />
                        <span>Enroll & Pay ({formatPrice(course.price)})</span>
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Floating Multi-Course Enroll Summary */}
        <AnimatePresence>
          {selectedCourses.length > 0 && (
            <motion.div
              key="floating-summary"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
            >
              <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 backdrop-blur-xl bg-gray-900/95">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold">{selectedCourses.length} Courses Selected</span>
                    <span className="bg-teal-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                      Total: {formatPrice(totalSelectedAmount)}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    {getSelectedData().map(c => c.title).join(' • ')}
                  </p>
                </div>
                <button
                  onClick={() => startCheckout(getSelectedData())}
                  className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Lock className="w-5 h-5" />
                  <span>Pay {formatPrice(totalSelectedAmount)} via Paystack</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Paystack Payment Modal */}
      {checkoutTarget && (
        <PaystackPaymentModal
          isOpen={!!checkoutTarget}
          onClose={() => setCheckoutTarget(null)}
          title={checkoutTarget.length === 1 ? checkoutTarget[0].title : `${checkoutTarget.length} Courses Bundle`}
          amount={checkoutTarget.reduce((sum, c) => sum + c.price, 0)}
          customerEmail=""
          customerName={user?.displayName || ''}
          onSuccess={handlePaystackSuccess}
        />
      )}

      <SuccessOverlay 
        show={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        title="Payment & Enrollment Confirmed!"
        message={`Payment confirmed via Paystack. You are now officially enrolled in ${successCourseTitle || 'your selected courses'}. Redirecting to your learning dashboard...`}
      />

      {/* Interactive FAQ Section to answer common training and payment questions */}
      <FAQSection />
    </div>
  );
}
