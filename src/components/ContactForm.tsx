import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, Mail, Phone, MapPin, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import axios from 'axios';

interface ContactFormProps {
  defaultCategory?: string;
  defaultSubject?: string;
  title?: string;
  subtitle?: string;
}

export default function ContactForm({
  defaultCategory = 'Software Development',
  defaultSubject = '',
  title = 'Send an Inquiry to Our Support Team',
  subtitle = 'Have questions about a software project, course enrollment, or custom IT consultation? Fill out the form below and Joseph Amponsah and the team will get back to you promptly.'
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: defaultCategory,
    subject: defaultSubject,
    message: '',
    honeypot: '', // anti-bot spam prevention
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState<string | null>(null);

  const categories = [
    'Software Development (Web & Cloud)',
    'Mobile App Development (iOS & Android)',
    'Tech Training & Power BI Certification',
    'Enterprise Database Management',
    'Course Enrollment & Payment Assistance',
    'Custom IT Consulting & Corporate Training',
    'General Inquiry'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic client validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Please provide your name (at least 2 characters).');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      setError('Please provide a valid email address so we can reply to you.');
      return;
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      setError('Please write a message with at least 10 characters describing your inquiry.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/contact-inquiry', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        category: formData.category,
        subject: formData.subject.trim() || `${formData.category} Inquiry`,
        message: formData.message.trim(),
        honeypot: formData.honeypot,
      });

      if (response.data.success) {
        setSuccess(true);
        setSuccessMsg(response.data.message || 'Your inquiry has been sent to our support desk.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          category: defaultCategory,
          subject: '',
          message: '',
          honeypot: '',
        });
      }
    } catch (err: any) {
      console.error('Contact submit error:', err);
      const serverMsg = err.response?.data?.error || 'Unable to submit your inquiry at this moment. Please reach out via WhatsApp at +233 24 586 2205 or call 0204168810.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="p-8 sm:p-10 lg:p-12">
        <div className="max-w-2xl mb-8">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold tracking-wide uppercase mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Direct Support Dispatch</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h3>
          <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {success ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-emerald-900">Inquiry Dispatched Successfully!</h4>
            <p className="text-emerald-700 text-sm max-w-md mx-auto leading-relaxed">
              {successMsg}
            </p>
            <p className="text-xs text-emerald-600">
              A copy has been routed to <strong>jaytechsolutions.net@gmail.com</strong>, and our instructor Joseph Amponsah will review it shortly.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                Send Another Inquiry
              </button>
              <a
                href="https://wa.me/233245862205"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition-all"
              >
                Chat on WhatsApp Now
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-red-700 text-sm animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Anti-spam honeypot (hidden from real users) */}
            <input
              type="text"
              name="honeypot"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel Mensah"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Phone / WhatsApp Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +233 24 586 2205"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Area of Interest / Service
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Inquiry Subject
              </label>
              <input
                type="text"
                placeholder="e.g. Question about Data Analysis with Power BI course / Custom Mobile App Quote"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Detailed Message <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                placeholder="Describe your project requirements, questions about schedule or syllabus, or how we can assist you..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-medium resize-y"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Typical response time: Within 2 to 4 hours</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Inquiry</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Support Direct Contacts Footer */}
      <div className="bg-gray-50 border-t border-gray-100 px-8 sm:px-12 py-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-600">
        <div className="flex items-center space-x-2.5">
          <Mail className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="truncate">jaytechsolutions.net@gmail.com</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <Phone className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>+233 24 586 2205 / 0204168810</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span>Koforidua, Eastern Region, Ghana</span>
        </div>
      </div>
    </div>
  );
}
