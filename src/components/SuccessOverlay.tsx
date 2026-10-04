import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

interface SuccessOverlayProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export default function SuccessOverlay({ show, onClose, title = "Success!", message = "Action completed successfully." }: SuccessOverlayProps) {
  useEffect(() => {
    if (show) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563eb', '#14b8a6', '#f59e0b']
      });
      
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            key="success-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white/40 backdrop-blur-md"
          />
          <motion.div
            key="success-content"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="relative bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100 flex flex-col items-center text-center max-w-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="bg-green-100 p-4 rounded-full mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 break-words leading-tight">{title}</h3>
            <p className="text-gray-600 font-medium break-words leading-relaxed">{message}</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
