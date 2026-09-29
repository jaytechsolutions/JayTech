import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left hover:text-blue-600 transition-colors focus:outline-none group"
      >
        <span className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors pr-8">
          {question}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-500 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-600' : ''}`} 
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-gray-600 leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSection() {
  const faqs = [
    {
      question: "What service packages do you offer?",
      answer: "We offer a variety of packages ranging from basic website development to complex enterprise software solutions. Our services include Web Development, Mobile App Development, Data Analytics, and Social Media Management. Each package is tailored to meet specific business needs and can be customized upon request."
    },
    {
      question: "How do I enroll in the training programs?",
      answer: "Enrolling is simple! Navigate to the 'Tech Training' section, select your preferred course, and click 'Enroll & Pay'. Pay securely via Paystack, and your full course access is activated immediately with lifetime access to all learning materials."
    },
    {
      question: "What payment methods are supported?",
      answer: "We support secure online payments powered by Paystack. You can pay using Mobile Money (MTN MoMo, Telecel Cash, AT Money) or Bank Cards (Visa and Mastercard) in Ghanaian Cedis (GHS)."
    },
    {
      question: "What is the schedule for the tech training sessions?",
      answer: "All courses are completely self-paced and flexible with no rigid time frames! You can learn at your own convenience, rewatch video lessons as often as you like, and complete hands-on assignments whenever your schedule allows."
    },
    {
      question: "Can I upgrade my service package later?",
      answer: "Yes, absolutely! We understand that businesses grow. You can start with a basic package and upgrade to a more comprehensive one at any time. Our team will ensure a smooth transition of your data and services."
    },
    {
      question: "Do you offer certificates after training?",
      answer: "Yes, all our training programs conclude with a final assessment and a professional certificate of completion. This certificate validates your technical skills and project experience with JayTech Solutions."
    },
    {
      question: "Are the training sessions online or physical?",
      answer: "We offer both! We have virtual instructor-led sessions for remote learners and physical hands-on training at our tech hub. You can choose the mode of learning that best fits your schedule and location during registration."
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-4">
            <HelpCircle className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Common Inquiries</h2>
          <p className="text-xl text-gray-600">
            Everything you need to know about our service packages, courses, and Paystack payments.
          </p>
        </div>

        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Still have questions? <a href="mailto:jaytechsolutions.net@gmail.com" className="text-blue-600 font-semibold hover:underline">Contact our support team</a>
          </p>
        </div>
      </div>
    </section>
  );
}
