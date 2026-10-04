import { useState, useMemo } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { auth, db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { Star, MessageSquare, Send } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import SuccessOverlay from './SuccessOverlay';

export default function ReviewSection() {
  const [user] = useAuthState(auth);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const reviewsQuery = query(
    collection(db, 'reviews'),
    where('approved', '==', true)
  );
  const [rawReviews, loading] = useCollectionData(reviewsQuery, { idField: 'id' } as any);

  const reviews = useMemo(() => {
    if (!rawReviews) return [];
    return [...rawReviews].sort((a: any, b: any) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
      return timeB - timeA;
    });
  }, [rawReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        content,
        rating,
        approved: false, // Admin needs to approve
        createdAt: serverTimestamp(),
      });
      setContent('');
      setRating(5);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock initial reviews as requested
  const mockReviews = [
    { id: 'm1', userName: 'Samuel Mensah', content: 'Excellent web development service. Highly recommended!', rating: 5 },
    { id: 'm2', userName: 'Grace Adama', content: 'The AI training was eye-opening. The Kobbi Labs team are exceptional instructors.', rating: 5 },
    { id: 'm3', userName: 'John Doe', content: 'Fixed our database issues in no time. Very professional.', rating: 4 },
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">What Our Clients Say</h2>
          <p className="mt-4 text-lg text-gray-600">Read reviews from our satisfied clients and students.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {(reviews?.length ? reviews : mockReviews).map((review: any, idx) => (
            <motion.div
              key={review.id || idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-4 h-4',
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    )}
                  />
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">"{review.content}"</p>
              <div className="font-semibold text-gray-900">— {review.userName}</div>
            </motion.div>
          ))}
        </div>

        {user ? (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Write a Review
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className={cn(
                        'p-1 transition-colors',
                        s <= rating ? 'text-yellow-400' : 'text-gray-300'
                      )}
                    >
                      <Star className={cn('w-8 h-8', s <= rating && 'fill-yellow-400')} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Experience</label>
                <textarea
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  placeholder="Share your thoughts..."
                  rows={4}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Post Review</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-gray-600">Please <Link to="/auth" className="text-blue-600 font-semibold underline">sign in</Link> to leave a review.</p>
          </div>
        )}
      </div>

      <SuccessOverlay 
        show={showSuccess} 
        onClose={() => setShowSuccess(false)} 
        title="Review Submitted!"
        message="Thank you for your feedback. It will appear after admin approval."
      />
    </div>
  );
}

// Internal link helper since I didn't import it
function Link({ to, children, className }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={to} className={className}>
      {children}
    </a>
  );
}
