import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Phone, Bot, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';
import { cn } from '../lib/utils';
import { generateKobbiLabsReply } from '../lib/chatBotEngine';
import { Logo } from '../assets/BrandingAssets';
import logoImg from '../assets/images/kobbi_labs_final_logo_1790937512033.jpg';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const QUICK_QUESTIONS = [
  '📊 Power BI Course Details',
  '🤖 Generative AI Training',
  '🌐 Website Development Quote',
  '📱 Mobile App Development',
  '💳 Paystack & MoMo Info',
  '📍 Hub Location & Contact',
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      content: 'Hello! I am **Kora**, your Kobbi Labs Assistant. How can I help you with our software engineering services or training courses today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendQuery = async (queryText: string) => {
    const userMessage = queryText.trim();
    if (!userMessage || loading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Send to server with a 6-second timeout for rapid failover
      const response = await axios.post(
        '/api/chat',
        {
          prompt: userMessage,
          history: messages.slice(-5)
        },
        {
          timeout: 6000,
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.data && typeof response.data.response === 'string' && response.data.response.trim()) {
        setMessages(prev => [...prev, { role: 'ai', content: response.data.response.trim() }]);
      } else {
        // Fallback to local intelligent knowledge engine
        const fallback = generateKobbiLabsReply(userMessage);
        setMessages(prev => [...prev, { role: 'ai', content: fallback }]);
      }
    } catch (error) {
      // In case of network timeout, server 503, or offline state,
      // respond seamlessly using the Kobbi Labs knowledge engine.
      const fallback = generateKobbiLabsReply(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  const resetChat = () => {
    setMessages([
      {
        role: 'ai',
        content: 'Hello! I am your **Kobbi Labs AI Assistant**. How can I help you with our software engineering services or self-paced tech training courses today?'
      }
    ]);
  };

  // Helper to format simple markdown (**bold**, bullet points, line breaks)
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Handle bold text syntax **text**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <span key={idx} className="block leading-relaxed">
          {formattedLine}
        </span>
      );
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-20 right-0 w-84 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col h-[530px] max-h-[75vh]"
            >
              {/* Header */}
              <div className="bg-[#05070a] p-5 text-white flex items-center justify-between shrink-0 shadow-sm relative overflow-hidden">
                {/* Decorative glow matching logo */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary/20 blur-2xl rounded-full" />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-accent/20 blur-2xl rounded-full" />
                
                <div className="flex items-center space-x-3 relative z-10">
                  <div className="w-11 h-11 rounded-md overflow-hidden shadow-lg border border-white/10 ring-2 ring-white/5">
                    <img 
                      src={logoImg} 
                      alt="Kobbi AI Logo" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tighter leading-none mb-1 uppercase">Kobbi<span className="text-primary">AI</span></h3>
                    <p className="text-primary text-[9px] font-black uppercase tracking-widest flex items-center">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />
                      Uniting People + Tech
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={resetChat}
                    title="Restart Conversation"
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    title="Close Chat"
                    className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Chat Area */}
              <div 
                ref={scrollRef}
                className="flex-grow p-4 overflow-y-auto bg-slate-50/70 space-y-3.5 text-xs sm:text-sm"
              >
                {/* Fast Action Channels */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <a
                    href="https://wa.me/233245862205"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Desk</span>
                  </a>
                  <a
                    href="tel:0204168810"
                    className="flex items-center justify-center space-x-2 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all border border-blue-200/60"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call 0204168810</span>
                  </a>
                </div>

                {/* Quick Topic Prompts */}
                {messages.length <= 2 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Suggested Questions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {QUICK_QUESTIONS.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendQuery(q)}
                          disabled={loading}
                          className="px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg border border-gray-200 text-[11px] font-medium transition-all shadow-2xs text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-grow h-px bg-gray-200" />
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Kobbi Labs Intelligence</span>
                  <div className="flex-grow h-px bg-gray-200" />
                </div>

                {/* Messages List */}
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col",
                      msg.role === 'user' ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[88%] p-3.5 rounded-2xl shadow-xs transition-all",
                        msg.role === 'user' 
                          ? "bg-blue-600 text-white rounded-tr-none font-medium" 
                          : "bg-white text-slate-700 border border-gray-100 rounded-tl-none shadow-sm"
                      )}
                    >
                      {renderMessageContent(msg.content)}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-center space-x-2 text-gray-500 text-xs font-medium bg-white p-2.5 rounded-xl w-fit border border-gray-100 shadow-xs">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Kobbi Labs AI is thinking...</span>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <form onSubmit={handleSend} className="p-3.5 bg-white border-t border-gray-100 shrink-0">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about courses, quotes, or services..."
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 outline-none transition-all text-xs sm:text-sm text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-40 disabled:bg-gray-300"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Kobbi AI Assistant"
          className={cn(
            "flex items-center space-x-3 px-6 h-14 rounded-full shadow-2xl transition-all border group",
            isOpen 
              ? 'bg-white text-primary border-gray-200 shadow-primary/20' 
              : 'bg-[#05070a] text-white border-white/10 shadow-primary/40 ring-4 ring-white/5'
          )}
        >
          <div className={cn(
            "flex items-center justify-center shrink-0",
            !isOpen && "group-hover:scale-110 transition-transform"
          )}>
            {isOpen ? <X className="w-6 h-6" /> : <div className="w-8 h-8 rounded-md overflow-hidden"><img src={logoImg} className="w-full h-full object-cover" /></div>}
          </div>
          {!isOpen && (
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Kobbi AI</span>
              <span className="text-xs font-black uppercase tracking-widest whitespace-nowrap">Chat with AI</span>
            </div>
          )}
        </motion.button>
      </div>
    </>
  );
}
