import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Smartphone, Database, PenTool, Layout, GraduationCap, Send, Clock, DollarSign, X, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

import SuccessOverlay from '../components/SuccessOverlay';
import ServiceCard from '../components/ServiceCard';
import FAQSection from '../components/FAQSection';

import serviceWebDev from '../assets/images/service_web_dev_1791113708173.jpg';
import serviceMobileApp from '../assets/images/service_mobile_app_1791113723459.jpg';
import serviceDataAnalysis from '../assets/images/service_data_analysis_1791113737387.jpg';
import serviceBranding from '../assets/images/service_branding_1791113749847.jpg';
import serviceSoftwareSolutions from '../assets/images/service_software_solutions_1791113764337.jpg';

const services = [
  {
    id: 'web-dev',
    title: 'Web development',
    desc: 'Modern, fast and responsive websites for your brand or business.',
    icon: Globe,
    image: serviceWebDev,
    color: 'bg-purple-100 text-purple-600',
    features: ['Custom Design', 'SEO Optimized', 'Mobile Responsive', 'Contact Forms']
  },
  {
    id: 'mobile-app',
    title: 'Mobile app development',
    desc: 'Powerful Android & iOS apps for your ideas.',
    icon: Smartphone,
    image: serviceMobileApp,
    color: 'bg-blue-100 text-blue-600',
    features: ['Android & iOS', 'Push Notifications', 'App Store Ready', 'Offline Support']
  },
  {
    id: 'data-analytics',
    title: 'Data analysis and visualization',
    desc: 'Turn your data into meaningful insights and smart decisions.',
    icon: Database,
    image: serviceDataAnalysis,
    color: 'bg-emerald-100 text-emerald-600',
    features: ['Custom Dashboards', 'Business Intelligence', 'Data Strategy', 'Reporting']
  },
  {
    id: 'design-branding',
    title: 'Graphic design and branding',
    desc: 'Creative designs that make your brand stand out.',
    icon: PenTool,
    image: serviceBranding,
    color: 'bg-pink-100 text-pink-600',
    features: ['Logo Design', 'Brand Identity', 'Marketing Materials', 'UI/UX Design']
  },
  {
    id: 'software-solutions',
    title: 'Software solution',
    desc: 'Custom software for businesses, schools, churches and institutions.',
    icon: Layout,
    image: serviceSoftwareSolutions,
    color: 'bg-orange-100 text-orange-600',
    features: ['Custom Systems', 'Cloud Integration', 'Automation', 'Scalable Architecture']
  }
];

export default function Services() {
  const [user] = useAuthState(auth);
  const { formatPrice } = useCurrency();
  const [selectedService, setSelectedService] = useState<any>(null);
  const [details, setDetails] = useState('');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [timeline, setTimeline] = useState('2-4 weeks');
  const [budget, setBudget] = useState('GH₵ 3,000 - 6,000');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const serviceParam = searchParams.get('service');
    if (serviceParam) {
      const match = services.find(s => s.id === serviceParam);
      if (match) setSelectedService(match);
    }
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      if (user.displayName && !userName) setUserName(user.displayName);
      if (user.email && !userEmail) setUserEmail(user.email);
    }
  }, [user]);

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!selectedService || !userName.trim() || !userPhone.trim() || !userEmail.trim() || !details.trim()) {
      setFormError('Please fill in all required fields (Name, Phone, Email, and Project Details).');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        userId: user ? user.uid : 'guest',
        userName: userName.trim(),
        userPhone: userPhone.trim(),
        userEmail: userEmail.trim(),
        serviceId: selectedService.id,
        serviceTitle: selectedService.title,
        details: details.trim(),
        timeline: timeline,
        budget: budget,
        amount: 0, 
        status: 'pending',
        adminSeen: false,
        seenAt: null,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Send real-time notification for admin to blink notification icon
      await addDoc(collection(db, 'notifications'), {
        title: `New Order: ${selectedService.title}`,
        message: `New client order submitted by ${userName.trim()} (${userPhone.trim()}) for "${selectedService.title}". Project timeline: ${timeline}. Please review and confirm seen.`,
        orderId: docRef.id,
        type: 'admin_new_order',
        read: false,
        createdAt: serverTimestamp()
      });

      setSelectedService(null);
      setDetails('');
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2800);
    } catch (err: any) {
      console.error('Order Error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'orders');
      setFormError('Failed to submit order. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 sm:pt-40 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-5xl font-black text-slate-950 mb-4 tracking-tight leading-tight"
          >
            Professional <span className="text-primary">Software Solutions</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-xl text-slate-900 font-bold max-w-2xl mx-auto leading-relaxed"
          >
            Choose from our range of expert software services. Submit your project requirements directly to our admin team for review and fast confirmation.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={() => {
                setFormError(null);
                setSelectedService(services[0]);
              }}
              className="px-8 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Send className="w-4 h-4" />
              <span>Request a Custom Quote</span>
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <ServiceCard
              key={service.id}
              service={service}
              index={idx}
              onOrder={(s) => setSelectedService(s)}
            />
          ))}
        </div>
      </div>

      {/* Enhanced Order Details Modal */}
      <AnimatePresence>
        {selectedService && (
          <div key="order-modal-container" className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              key="order-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />
            <motion.div
              key="order-content"
              initial={{ opacity: 0, scale: 0.93, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 20 }}
              className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-gray-100"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
                <button
                  onClick={() => setSelectedService(null)}
                  className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider block mb-1">
                  Kobbi Labs • Service Request Form
                </span>
                <h3 className="text-2xl font-black text-white">Order {selectedService.title}</h3>
                <p className="text-sm text-gray-300 mt-1">
                  Submit your details below. The administrator will review and acknowledge your order.
                </p>
              </div>

              <div className="p-6 md:p-8 overflow-y-auto space-y-5">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-bold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Selected Service *
                    </label>
                    <select
                      value={selectedService.id}
                      onChange={(e) => {
                        const found = services.find(s => s.id === e.target.value);
                        if (found) setSelectedService(found);
                      }}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold text-gray-900 transition-all cursor-pointer"
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Your Full Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="e.g. John Mensah"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Telephone / WhatsApp *
                      </label>
                      <input
                        required
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                        placeholder="024XXXXXXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        <Clock className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
                        Target Timeline
                      </label>
                      <select
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all cursor-pointer"
                      >
                        <option value="Urgent (< 1 week)">Urgent (&lt; 1 week)</option>
                        <option value="1 - 2 weeks">1 - 2 weeks</option>
                        <option value="2 - 4 weeks">2 - 4 weeks</option>
                        <option value="1 - 3 months">1 - 3 months</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        <DollarSign className="w-3.5 h-3.5 inline mr-1 text-green-600" />
                        Estimated Budget
                      </label>
                      <select
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all cursor-pointer"
                      >
                        <option value="GH₵ 1,000 - 3,000">GH₵ 1,000 - 3,000</option>
                        <option value="GH₵ 3,000 - 6,000">GH₵ 3,000 - 6,000</option>
                        <option value="GH₵ 6,000 - 15,000">GH₵ 6,000 - 15,000</option>
                        <option value="GH₵ 15,000+">GH₵ 15,000+</option>
                        <option value="Custom / Quote Needed">Custom / Quote Needed</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Project Requirements & Features *
                    </label>
                    <textarea
                      required
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none h-28 resize-none text-sm font-medium transition-all"
                      placeholder="Describe what you need: pages, target audience, specific features, design preferences, integrations..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="px-6 py-3.5 border border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !details.trim() || !userName.trim() || !userPhone.trim() || !userEmail.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/20 cursor-pointer text-sm"
                    >
                      {loading ? (
                        <span>Submitting...</span>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Submit Order to Admin</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <SuccessOverlay 
        show={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        title="Order Submitted Successfully!"
        message="Your service order has been sent to the Kobbi Labs admin dashboard. The administrator will review and acknowledge your request promptly."
      />

      {/* Interactive FAQ Section to answer software development and quote inquiries */}
      <FAQSection />
    </div>
  );
}
