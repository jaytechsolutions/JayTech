import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, Search, Sparkles, BookOpen, Code2, CreditCard, Award, MessageCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface FAQItem {
  id: string;
  category: 'all' | 'services' | 'training' | 'payments' | 'certificates';
  question: string;
  answer: string;
  badge?: string;
}

const FAQ_DATA: FAQItem[] = [
  // Training
  {
    id: 'tr-1',
    category: 'training',
    badge: 'Trending Course',
    question: 'What is included in the Data Analysis with Power BI course?',
    answer: 'The Data Analysis course covers data cleaning, statistical modeling, DAX formulas, interactive visual dashboards, business intelligence reporting, and real-world case studies using Microsoft Power BI. You gain lifetime access to all datasets, practice exercises, and an official verified certificate upon completion.'
  },
  {
    id: 'tr-2',
    category: 'training',
    question: 'Are the training schedules fixed or self-paced?',
    answer: 'All our training courses are 100% self-paced and on-demand! There are no rigid lecture timetables or deadlines. You can watch the lessons, repeat tricky concepts, and submit assignments whenever your work and family schedule permits.'
  },
  {
    id: 'tr-3',
    category: 'training',
    question: 'What courses are currently open for enrollment?',
    answer: 'We currently offer 6 specialized IT courses:\n• Generative AI (GHS 400)\n• Data Analysis with Power BI (GHS 400)\n• Microsoft Excel Advanced (GHS 350)\n• Microsoft PowerPoint Presentation Design (GHS 250)\n• Basic Computing & Digital Literacy (GHS 250)\n• Microsoft Word Professional (GHS 200)\n\nEach course is led by our experienced instructor Joseph Amponsah.'
  },
  {
    id: 'tr-4',
    category: 'training',
    question: 'Do I get access to downloadable practice files and exercises?',
    answer: 'Yes! Every lesson provides downloadable source materials including Excel workbooks, Power BI (.pbix) templates, prompt engineering cheatsheets, and exercise datasets to ensure practical, hands-on learning.'
  },

  // Services
  {
    id: 'sv-1',
    category: 'services',
    question: 'What software development services does JayTech Solutions offer?',
    answer: 'We deliver full-cycle software engineering:\n• Custom Websites (Responsive, SEO-optimized landing pages & business portfolios)\n• Web Applications (Cloud systems, secure multi-user portals, databases)\n• Mobile Applications (Cross-platform iOS and Android apps)\n• Enterprise Database Architecture (High availability & security hardening)\n• Data Analytics & BI Dashboards\n• Social Media Strategy & Management'
  },
  {
    id: 'sv-2',
    category: 'services',
    question: 'How do I request a custom software quote or consultation?',
    answer: 'You can submit your project requirements through our Services page by selecting a service and clicking "Order / Request Quote", or by filling out our Contact form. You can also chat directly with Joseph Amponsah on WhatsApp at +233 24 586 2205.'
  },
  {
    id: 'sv-3',
    category: 'services',
    question: 'Can I start with a basic website package and upgrade later?',
    answer: 'Yes! Our software architecture is modular and scalable. We can launch your initial minimum viable product (MVP) or website, and later add e-commerce checkout, client portals, mobile applications, or AI features as your business scales.'
  },

  // Payments
  {
    id: 'pm-1',
    category: 'payments',
    badge: 'Instant Activation',
    question: 'What payment methods do you accept for courses and software services?',
    answer: 'All payments are powered securely by Paystack in Ghanaian Cedis (GHS). We accept:\n• Mobile Money: MTN MoMo, Telecel Cash, and AT Money\n• Bank Cards: Visa and Mastercard\n\nCourse activations are instant upon successful transaction.'
  },
  {
    id: 'pm-2',
    category: 'payments',
    question: 'Will I receive an official receipt after payment?',
    answer: 'Yes! As soon as your Paystack transaction is completed, an automated confirmation receipt is sent to your registered email address with your unique transaction reference code and enrollment details.'
  },

  // Certificates
  {
    id: 'cr-1',
    category: 'certificates',
    badge: 'Official Credential',
    question: 'Are JayTech certificates verified and recognized?',
    answer: 'Yes! Every course graduate receives an official JayTech Solutions Certificate of Completion featuring an encrypted unique Verification ID and verifiable QR code that employers or institutions can scan to confirm your credential.'
  },
  {
    id: 'cr-2',
    category: 'certificates',
    question: 'How do I download my certificate once I finish a course?',
    answer: 'Simply log in to your Student Dashboard, navigate to your enrolled course, complete all lesson checkpoints, and click "Generate Certificate". You can download a high-resolution print-ready PDF certificate instantly.'
  }
];

export default function FAQSection() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'services' | 'training' | 'payments' | 'certificates'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({ 'tr-1': true, 'sv-1': true });

  const categories = [
    { id: 'all', label: 'All Inquiries', icon: HelpCircle },
    { id: 'training', label: 'Tech Training & Power BI', icon: BookOpen },
    { id: 'services', label: 'Software Services', icon: Code2 },
    { id: 'payments', label: 'Paystack & MoMo', icon: CreditCard },
    { id: 'certificates', label: 'Certificates', icon: Award },
  ];

  const filteredFAQs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    filteredFAQs.forEach((item) => { allOpen[item.id] = true; });
    setOpenIds(allOpen);
  };

  const collapseAll = () => {
    setOpenIds({});
  };

  return (
    <section className="py-24 bg-white border-t border-gray-100" id="faq">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-100/60 shadow-sm">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span>Interactive Knowledge Base</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Find immediate answers regarding our software development services, self-paced training curriculum, Power BI modules, and Paystack Mobile Money payments.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="space-y-4 mb-10">
          <div className="relative max-w-xl mx-auto">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions (e.g., Power BI, certificate, MoMo, schedule)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500 px-2 pt-2">
            <span>Showing {filteredFAQs.length} questions</span>
            <div className="space-x-3">
              <button onClick={expandAll} className="hover:text-blue-600 font-semibold">Expand All</button>
              <span>•</span>
              <button onClick={collapseAll} className="hover:text-blue-600 font-semibold">Collapse All</button>
            </div>
          </div>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq) => {
              const isOpen = !!openIds[faq.id];
              return (
                <div
                  key={faq.id}
                  className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                    isOpen
                      ? 'bg-white border-blue-200 shadow-md shadow-blue-500/5'
                      : 'bg-gray-50/70 hover:bg-gray-50 border-gray-200/80'
                  }`}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full p-6 text-left flex items-start justify-between gap-4 focus:outline-none"
                  >
                    <div className="space-y-1.5 pr-2">
                      {faq.badge && (
                        <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                          {faq.badge}
                        </span>
                      )}
                      <h4 className={`text-base sm:text-lg font-bold leading-snug transition-colors ${
                        isOpen ? 'text-blue-600' : 'text-gray-900 hover:text-blue-600'
                      }`}>
                        {faq.question}
                      </h4>
                    </div>

                    <div className={`p-2 rounded-xl transition-all flex-shrink-0 mt-0.5 ${
                      isOpen ? 'bg-blue-50 text-blue-600 rotate-180' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <ChevronDown className="w-4 h-4 transition-transform duration-300" />
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-gray-600 leading-relaxed border-t border-gray-100/60 whitespace-pre-line">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
              <HelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-bold">No questions matching your search</p>
              <p className="text-xs text-gray-500 mt-1">Try searching for broader keywords like "course", "payment", or "app".</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* Quick Contact Assistance Banner */}
        <div className="mt-14 p-8 sm:p-10 bg-gradient-to-tr from-slate-900 via-blue-950 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold">Have a specific question not listed here?</h3>
            <p className="text-sm text-slate-300 max-w-xl">
              Our support team and instructor Joseph Amponsah are available to answer your technical and enrollment inquiries directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="https://wa.me/233245862205"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-emerald-900/30"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Joseph</span>
            </a>
            <Link
              to="/contact"
              className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md"
            >
              <span>Send Support Inquiry</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
