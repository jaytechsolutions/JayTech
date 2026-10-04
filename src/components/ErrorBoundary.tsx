import React, { Component, ErrorInfo, ReactNode } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.logErrorToFirestore(error, errorInfo);
  }

  private async logErrorToFirestore(error: Error, errorInfo: ErrorInfo) {
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'error_logs'), {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to log error to Firestore:', err);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
          <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-[32px] shadow-xl border border-gray-100 text-center">
            <div className="flex justify-center">
              <div className="p-4 bg-red-50 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-red-600" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-950 tracking-tight">Oops! Something went wrong</h1>
              <p className="text-slate-600 text-sm leading-relaxed">
                We've encountered an unexpected error. Don't worry, our team has been notified and we're looking into it.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-4 bg-gray-100 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-xs font-mono text-red-600 font-bold">{this.state.error.message}</p>
                <pre className="text-[10px] text-gray-500 mt-2 font-mono">{this.state.error.stack}</pre>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Page</span>
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Go Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
