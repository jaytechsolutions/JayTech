import { motion } from 'motion/react';
import { 
  GraduationCap, 
  MessageSquare, 
  Award, 
  Download, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useCurrency } from '../contexts/CurrencyContext';

interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  status: string;
  enrollmentCode?: string;
  userName?: string;
  userPhone?: string;
  createdAt: any;
}

interface StudentCoursesDashboardProps {
  enrollments: Enrollment[];
  onDownloadReceipt: (en: Enrollment) => void;
  onOpenCertificate: (en: Enrollment) => void;
}

export default function StudentCoursesDashboard({ 
  enrollments, 
  onDownloadReceipt, 
  onOpenCertificate 
}: StudentCoursesDashboardProps) {
  const { formatPrice } = useCurrency();

  const approvedEnrollments = enrollments.filter(en => en.status === 'approved' || en.status === 'paid');
  const pendingEnrollments = enrollments.filter(en => en.status === 'pending');

  if (enrollments.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Registered Courses Yet</h3>
        <p className="text-gray-500 max-w-sm mx-auto mb-8">
          You haven't registered for any tech training courses. Start your learning journey today with our interactive online classes.
        </p>
        <a 
          href="/training" 
          className="inline-flex items-center space-x-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <span>Browse All Courses</span>
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header Stats / Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-6 text-white shadow-xl shadow-primary/10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full">Academy</span>
          </div>
          <div className="text-3xl font-black mb-1">{approvedEnrollments.length}</div>
          <p className="text-blue-100 text-sm font-medium">Active Courses</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-50 rounded-xl">
              <MessageSquare className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Community</span>
          </div>
          <div className="text-2xl font-black text-gray-900 mb-1">WhatsApp Hub</div>
          <p className="text-gray-500 text-sm font-medium">Direct Instructor Guidance</p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 rounded-xl">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Success</span>
          </div>
          <div className="text-2xl font-black text-gray-900 mb-1">Certificates</div>
          <p className="text-gray-500 text-sm font-medium">Verified Official Credentials</p>
        </div>
      </div>

      {/* Active Courses Grid */}
      <section>
        <div className="flex items-center justify-between mb-6 px-2">
          <div>
            <h2 className="text-2xl font-black text-gray-900">My Registered Classes</h2>
            <p className="text-sm text-gray-500 mt-1">Access your course codes and join live sessions.</p>
          </div>
          {pendingEnrollments.length > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-[10px] font-black px-3 py-1 rounded-full border border-yellow-200 animate-pulse">
              {pendingEnrollments.length} PENDING APPROVAL
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {approvedEnrollments.map((en, idx) => (
            <motion.div
              key={en.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden flex flex-col group hover:border-blue-200 transition-all"
            >
              <div className="p-8 flex-grow">
                <div className="flex items-start justify-between mb-6">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                      {en.courseTitle}
                    </h3>
                    <div className="flex items-center space-x-2 text-teal-600 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Online Class Active</span>
                    </div>
                  </div>
                  <div className="shrink-0 w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                </div>

                {/* Access Code Box */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Lock className="w-20 h-20" />
                  </div>
                  <div className="relative z-10">
                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Your Unique Course Code</div>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl font-mono font-black tracking-widest text-white">
                        {en.enrollmentCode || 'KL-PROCESSING'}
                      </span>
                      <div className="p-1.5 bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer" title="Copy code">
                        <Smartphone className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-3 flex items-center">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                      Present this code for group verification
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => onDownloadReceipt(en)}
                    className="flex items-center justify-center space-x-2 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-2xl text-xs font-bold transition-all border border-gray-200 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-primary" />
                    <span>Receipt</span>
                  </button>
                  <button
                    onClick={() => onOpenCertificate(en)}
                    className="flex items-center justify-center space-x-2 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-2xl text-xs font-bold transition-all border border-amber-200 active:scale-95 cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Certificate</span>
                  </button>
                </div>
              </div>

              {/* Action Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider leading-none">Class Platform</div>
                    <div className="text-xs font-bold text-gray-700">Official WhatsApp Group</div>
                  </div>
                </div>
                <a 
                  href="https://wa.me/233245862205"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center space-x-2 cursor-pointer"
                >
                  <span>JOIN CLASS NOW</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          ))}

          {/* Pending Enrollments */}
          {pendingEnrollments.map((en, idx) => (
            <div
              key={en.id}
              className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center space-y-4 opacity-80"
            >
              <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 border border-yellow-100">
                <Smartphone className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{en.courseTitle}</h4>
                <p className="text-xs text-gray-500 mt-1 max-w-[200px]">We are verifying your registration. Access code will appear shortly.</p>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-yellow-700 bg-yellow-100 px-3 py-1 rounded-full">
                Verification in Progress
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Help / Instructions */}
      <section className="bg-blue-50/50 rounded-[3rem] p-8 md:p-12 border border-blue-100 flex flex-col md:flex-row items-center gap-8">
        <div className="shrink-0 w-24 h-24 bg-white rounded-3xl shadow-xl shadow-blue-500/10 flex items-center justify-center text-blue-600">
          <Smartphone className="w-12 h-12" />
        </div>
        <div className="flex-grow text-center md:text-left">
          <h4 className="text-xl font-black text-gray-900 mb-2">How to Join Your Interactive Classes</h4>
          <p className="text-sm text-gray-600 leading-relaxed max-w-2xl">
            1. Copy your unique **Course Access Code**. 2. Click the **Join Class** button to enter the official Kobbi Labs WhatsApp group. 3. Provide your code to the instructor for verification. 4. Live session links (Google Meet/Zoom) will be shared directly in the group.
          </p>
        </div>
        <div className="shrink-0">
          <a 
            href="https://wa.me/233245862205" 
            className="flex items-center space-x-2 text-blue-600 font-black text-sm hover:underline cursor-pointer"
          >
            <span>Talk to Support</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
