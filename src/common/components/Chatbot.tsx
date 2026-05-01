import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Send, Bot, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { db } from '@/core/firebase/firebaseConfig';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  getDocs,
  doc,
  writeBatch
} from 'firebase/firestore';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp?: any;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // DeepSeek API Config
  const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
  const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

  // ─── Load Chat History from Firestore ───────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn || !user || !db) {
      setMessages([
        { 
          id: 'welcome', 
          type: 'bot', 
          text: 'Xin chào! Tôi là trợ lý ẩm thực AI. Bạn muốn tìm hiểu về món ăn nào hay cần gợi ý quán ăn ở đâu?' 
        }
      ]);
      return;
    }

    const q = query(
      collection(db, 'chatBotHistory', user.id, 'messages'),
      orderBy('timestamp', 'asc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      
      if (history.length === 0) {
        setMessages([
          { 
            id: 'welcome', 
            type: 'bot', 
            text: `Chào ${user.name}! Tôi là trợ lý ẩm thực AI. Tôi có thể giúp gì cho bạn hôm nay?` 
          }
        ]);
      } else {
        setMessages(history);
      }
    });

    return () => unsubscribe();
  }, [isLoggedIn, user]);

  // ─── Auto Scroll ────────────────────────────────────────────────────────
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // ─── AI Response Logic (DeepSeek) ────────────────────────────────────────
  const getAIResponse = async (userText: string) => {
    try {
      const systemPrompt = `Bạn là trợ lý ẩm thực thông minh của TasteTrekker. 
      Bạn chuyên về ẩm thực Việt Nam, đặc sản vùng miền và tư vấn quán ăn.
      Thông tin người dùng: Tên: ${user?.name || 'Khách'}, Dị ứng: ${user?.allergies?.join(', ') || 'Không'}.
      Hãy trả lời thân thiện, ngắn gọn và hữu ích.`;

      const response = await axios.post(
        DEEPSEEK_URL,
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-5).map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: userText }
          ],
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek Error:', error);
      return 'Xin lỗi, tôi đang gặp chút vấn đề kỹ thuật. Bạn thử lại sau nhé!';
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input.trim();
    setInput('');
    setIsTyping(true);

    // 1. Add User Message
    if (isLoggedIn && user && db) {
      await addDoc(collection(db, 'chatBotHistory', user.id, 'messages'), {
        type: 'user',
        text: userText,
        timestamp: serverTimestamp()
      });
    } else {
      setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: userText }]);
    }

    // 2. Get AI Response
    const aiText = await getAIResponse(userText);
    setIsTyping(false);

    // 3. Add Bot Message
    if (isLoggedIn && user && db) {
      await addDoc(collection(db, 'chatBotHistory', user.id, 'messages'), {
        type: 'bot',
        text: aiText,
        timestamp: serverTimestamp()
      });
    } else {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', text: aiText }]);
    }
  };

  const clearHistory = async () => {
    if (!isLoggedIn || !user || !db) return;
    if (!confirm('Bạn có muốn xóa toàn bộ lịch sử trò chuyện?')) return;

    try {
      const messagesRef = collection(db, 'chatBotHistory', user.id, 'messages');
      const snapshot = await getDocs(messagesRef);
      const batch = writeBatch(db);
      snapshot.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (error) {
      console.error('Clear history error:', error);
    }
  };

  const getDateLabel = (timestamp: any) => {
    if (!timestamp) return null;
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) return 'Hôm nay';
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-transform hover:scale-105 z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
            filter: ["drop-shadow(0 0 0px #fff)", "drop-shadow(0 0 4px #fff)", "drop-shadow(0 0 0px #fff)"]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="w-6 h-6" />
        </motion.div>
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[550px] max-h-[calc(100vh-100px)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-neutral-200 dark:border-white/10"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-md">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">Trợ lý AI TasteTrekker</h3>
                  <span className="text-[10px] text-white/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    Đang trực tuyến
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isLoggedIn && messages.length > 1 && (
                  <button onClick={clearHistory} className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Xóa lịch sử">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-neutral-50 dark:bg-slate-950 flex flex-col gap-4 scrollbar-thin">
              {messages.map((msg, index) => {
                const currentDateLabel = getDateLabel(msg.timestamp);
                const prevDateLabel = index > 0 ? getDateLabel(messages[index - 1].timestamp) : null;
                const showDateDivider = currentDateLabel && currentDateLabel !== prevDateLabel;

                return (
                  <React.Fragment key={msg.id}>
                    {showDateDivider && (
                      <div className="flex justify-center my-2">
                        <span className="text-[10px] bg-neutral-200 dark:bg-slate-800 text-neutral-500 dark:text-gray-400 px-3 py-1 rounded-full uppercase tracking-wider font-bold">
                          {currentDateLabel}
                        </span>
                      </div>
                    )}
                    <div className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        {msg.type === 'bot' && (
                          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                          msg.type === 'user'
                            ? 'bg-orange-500 text-white rounded-tr-none'
                            : 'bg-white dark:bg-slate-800 text-neutral-800 dark:text-white border border-neutral-200 dark:border-white/10 rounded-tl-none'
                        }`}>
                          {msg.type === 'bot' ? (
                            <ReactMarkdown
                              components={{
                                p: ({...props}) => <p className="mb-2 last:mb-0 leading-relaxed" {...props} />,
                                ul: ({...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                ol: ({...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                li: ({...props}) => <li className="mb-1" {...props} />,
                                strong: ({...props}) => <strong className="font-bold text-orange-600 dark:text-orange-400" {...props} />,
                                h1: ({...props}) => <h1 className="text-lg font-bold mb-2" {...props} />,
                                h2: ({...props}) => <h2 className="text-base font-bold mb-2" {...props} />,
                                h3: ({...props}) => <h3 className="text-sm font-bold mb-1" {...props} />,
                              }}
                            >
                              {msg.text}
                            </ReactMarkdown>
                          ) : (
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          )}
                        </div>
                      </div>
                      {msg.timestamp && (
                        <span className={`text-[10px] text-neutral-400 mt-1 px-2 ${msg.type === 'user' ? 'mr-0' : 'ml-10'}`}>
                          {formatTime(msg.timestamp)}
                        </span>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-neutral-200 dark:border-white/10 shadow-sm flex gap-1">
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                    <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-neutral-400 rounded-full" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-neutral-200 dark:border-white/10">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isLoggedIn ? "Hỏi tôi về ẩm thực..." : "Đăng nhập để lưu lịch sử chat..."}
                  disabled={isTyping}
                  className="flex-1 pl-4 pr-12 py-3 bg-neutral-100 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:text-white transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 w-9 h-9 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center text-white disabled:bg-neutral-300 dark:disabled:bg-slate-700 transition-all shadow-lg shadow-orange-500/20"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
              {!isLoggedIn && (
                <p className="text-[10px] text-center text-neutral-400 mt-2">
                  Bạn đang dùng chế độ khách. Lịch sử sẽ không được lưu.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
