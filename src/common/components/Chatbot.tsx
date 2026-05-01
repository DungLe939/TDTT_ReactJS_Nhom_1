import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquareText, X, Send, Bot } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', type: 'bot', text: 'Xin chào! Tôi là trợ lý ẩm thực AI. Bạn muốn tìm hiểu về món ăn nào hay cần gợi ý quán ăn ở đâu?' }
  ]);
  const [input, setInput] = useState('');
  const { isLoggedIn, user } = useAuth();

  const handleSend = () => {
    if (!input.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), type: 'user', text: input };
    setMessages(prev => [...prev, newMsg]);
    setInput('');

    // Mock bot response
    setTimeout(() => {
      let responseText = "Đang xử lý...";
      if (!isLoggedIn) {
        responseText = "Để nhận gợi ý cá nhân hóa và chính xác nhất theo khẩu vị, bạn nên đăng nhập nhé!";
      } else if (user?.allergies && user.allergies.length > 0) {
        responseText = `Tôi đã lưu ý bạn bị dị ứng với ${user.allergies.join(', ')}. Đây là một số gợi ý an toàn cho bạn...`;
      } else {
        responseText = "Tuyệt vời, món này rất phổ biến! Bạn có muốn tôi chỉ đường đến quán gần nhất không?";
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: responseText
      }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-transform hover:scale-105 z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <MessageSquareText className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-48px)] h-[500px] max-h-[calc(100vh-100px)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-neutral-200"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-6 h-6" />
                <span className="font-semibold">Trợ lý AI TasteTrekker</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-neutral-50 flex flex-col gap-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.type === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-orange-600" />
                    </div>
                  )}
                  <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${msg.type === 'user'
                      ? 'bg-orange-500 text-white rounded-tr-none'
                      : 'bg-white text-neutral-800 border border-neutral-200 rounded-tl-none'
                    }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-neutral-200 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2 bg-neutral-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white disabled:bg-neutral-300 transition-colors"
              >
                <Send className="w-4 h-4 ml-1" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
