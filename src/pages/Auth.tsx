import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc, collection, query, limit } from 'firebase/firestore';
import { 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  PlayCircle, 
  Star, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  KeyRound, 
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCollection } from 'react-firebase-hooks/firestore';
import SuccessOverlay from '../components/SuccessOverlay';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');

  const navigate = useNavigate();

  const [videosSnap] = useCollection(query(collection(db, 'videos'), limit(3)));
  const videos = useMemo(() => videosSnap?.docs.map(d => ({ id: d.id, ...d.data() })) || [], [videosSnap]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userRef = doc(db, 'users', user.uid);
      let userSnap;
      try {
        userSnap = await getDoc(userRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        return;
      }
      
      if (!userSnap.exists()) {
        const userEmailLower = user.email?.toLowerCase();
        const isAdmin = userEmailLower === 'jaytechsolutions.net@gmail.com' || userEmailLower === 'kobbijaysoftware@gmail.com';
        try {
          await setDoc(userRef, {
            name: user.displayName,
            email: user.email,
            role: isAdmin ? 'admin' : 'user',
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
          return;
        }
      }
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google Sign-In.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(user, { displayName: name.trim() });
        
        // Determine role: if email matches either admin email, grant admin
        const emailLower = email.trim().toLowerCase();
        const isAdmin = emailLower === 'jaytechsolutions.net@gmail.com' || emailLower === 'kobbijaysoftware@gmail.com';
        
        await setDoc(doc(db, 'users', user.uid), {
          name: name.trim(),
          email: email.trim(),
          role: isAdmin ? 'admin' : 'user',
          createdAt: serverTimestamp(),
        });
      }
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError('Please enter a valid email address.');
      return;
    }
    setResetLoading(true);
    setResetMessage('');
    setResetError('');
    try {
      await sendPasswordResetEmail(auth, resetEmail.trim());
      setResetMessage('Password reset link sent successfully! Please check your inbox (and spam folder) to set your new password.');
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setResetError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setResetError('Invalid email format. Please check and try again.');
      } else {
        setResetError(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Course Previews Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-8"
        >
          <div>
            <h2 className="text-4xl font-black text-gray-900 mb-4">Master New Skills with Our Courses</h2>
            <p className="text-xl text-gray-600">Get access to premium practical video modules and resources after joining our community.</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center">
              <PlayCircle className="w-4 h-4 mr-2" />
              Latest Course Sessions
            </h3>
            <div className="grid gap-6">
              {videos?.map((vid: any, idx: number) => (
                <motion.div 
                  key={vid.id || `auth-vid-${idx}`} 
                  whileHover={{ scale: 1.02 }}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center space-x-6 group cursor-pointer"
                >
                  <div className="relative w-24 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors overflow-hidden">
                    <PlayCircle className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base mb-1">{vid.title}</h4>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{vid.description}</p>
                  </div>
                </motion.div>
              ))}
              {(!videos || videos.length === 0) && (
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 p-8 rounded-[2.5rem] border border-blue-100 text-blue-700 text-sm leading-relaxed shadow-inner">
                  <div className="font-bold text-base mb-2">Premium Practical Learning</div>
                  Generative AI, Data Analysis, Microsoft Office Suite, and Web Development courses are available with full certification. Sign in to browse your curriculum.
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={`auth-student-avatar-${i}`} className="w-10 h-10 rounded-full border-2 border-white bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
                  {i === 1 ? 'JA' : i === 2 ? 'SM' : i === 3 ? 'GA' : 'KD'}
                </div>
              ))}
            </div>
            <div className="text-sm">
              <div className="flex text-yellow-400 mb-1">
                {[1, 2, 3, 4, 5].map(i => <Star key={`auth-rating-star-${i}`} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="font-bold text-gray-900">Join 500+ professionals & students</p>
            </div>
          </div>
        </motion.div>

        {/* Authentication Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 justify-self-center lg:justify-self-end"
        >
          {showForgotPassword ? (
            /* Forgot Password View */
            <div>
              <div className="bg-slate-900 p-8 text-center text-white relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setResetMessage('');
                    setResetError('');
                  }}
                  className="absolute left-6 top-8 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Back to login"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-400/30">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Reset Password</h2>
                <p className="mt-1 text-xs text-gray-300">
                  Enter your email address to receive a secure password reset link.
                </p>
              </div>

              <div className="p-8">
                {resetError && (
                  <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-200 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                {resetMessage && (
                  <div className="mb-4 p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{resetMessage}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordReset} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Account Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {resetLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Reset Link...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Send Password Reset Link</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetMessage('');
                      setResetError('');
                    }}
                    className="w-full py-2.5 text-xs text-gray-600 hover:text-blue-600 font-bold transition-colors cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Sign In / Sign Up View */
            <div>
              <div className="bg-blue-600 p-8 text-center text-white">
                <h2 className="text-3xl font-bold">{isLogin ? 'Welcome Back' : 'Join JayTech Solutions'}</h2>
                <p className="mt-2 text-blue-100 text-sm">
                  {isLogin ? 'Sign in to access your course and project dashboard' : 'Create an account to get started'}
                </p>
              </div>

              <div className="p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                            placeholder="John Doe"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  {/* Password with Show/Hide Toggle and Forgot Password button */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Password
                      </label>
                      {isLogin && (
                        <button
                          type="button"
                          onClick={() => {
                            setResetEmail(email);
                            setShowForgotPassword(true);
                            setResetMessage('');
                            setResetError('');
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                        >
                          Forgot Password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium"
                        placeholder="••••••••"
                      />
                      {/* Show / Hide Password Button */}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Please wait...</span>
                      </>
                    ) : (
                      <>
                        {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                        <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 flex items-center justify-between">
                  <span className="border-b w-1/5 lg:w-1/4"></span>
                  <span className="text-[11px] text-center text-gray-400 uppercase font-semibold">or continue with</span>
                  <span className="border-b w-1/5 lg:w-1/4"></span>
                </div>

                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="mt-6 w-full flex items-center justify-center space-x-3 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 disabled:opacity-50 cursor-pointer text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.09-3.71 1.09-2.85 0-5.27-1.92-6.13-4.51H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.87 14.15c-.22-.66-.35-1.36-.35-2.15s.13-1.49.35-2.15V7.01H2.18C1.4 8.58 1 10.24 1 12s.4 3.42 1.18 4.99l3.69-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.01l3.69 2.84c.86-2.59 3.28-4.51 6.13-4.51z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <div className="mt-8 text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError('');
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                  >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <SuccessOverlay 
        show={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        title={isLogin ? "Welcome Back!" : "Account Created!"}
        message={isLogin ? "Redirecting to your dashboard..." : "Welcome to the JayTech Solutions community."}
      />
    </div>
  );
}
