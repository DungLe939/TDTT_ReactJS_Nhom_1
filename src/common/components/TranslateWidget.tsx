import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Languages, X, ArrowLeftRight, Activity } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';

export const TranslateWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceLang, setSourceLang] = useState<'EN' | 'VI'>('EN');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const { isLoggedIn } = useAuth();

  const handleSwapLang = () => {
    setSourceLang(lang => lang === 'EN' ? 'VI' : 'EN');
    // Swap the text as well for better UX
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    // Mock API call
    setTimeout(() => {
      setIsTranslating(false);
      if (!isLoggedIn) {
        setTranslatedText('Vui lòng đăng nhập để sử dụng tính năng dịch không giới hạn.');
        return;
      }
      
      const targetLang = sourceLang === 'EN' ? 'VI' : 'EN';
      if (targetLang === 'VI') {
        setTranslatedText(`[Bản dịch tiếng Việt mô phỏng mẫu từ AI] -> ${sourceText}`);
      } else {
        setTranslatedText(`[Mock English Translation from AI] -> ${sourceText}`);
      }
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-transform hover:scale-105 z-50 ${isOpen ? 'hidden' : 'block'}`}
      >
        <Languages className="w-6 h-6" />
      </button>

      {/* Translate Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[600px] max-w-[calc(100vw-32px)] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-neutral-200 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Languages className="w-6 h-6" />
                <span className="font-semibold text-lg">Dịch Văn Bản Thông Minh</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex flex-col md:flex-row h-full">
              {/* Source Panel */}
              <div className="flex-1 p-4 border-b md:border-b-0 md:border-r border-neutral-200 flex flex-col">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-neutral-700 text-sm">{sourceLang === 'EN' ? 'Tiếng Anh' : 'Tiếng Việt'}</span>
                </div>
                <textarea
                  className="flex-1 w-full min-h-[150px] resize-none focus:outline-none text-neutral-800 text-base"
                  placeholder="Nhập văn bản cần dịch..."
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                />
              </div>

              {/* Center Swap Button (Mobile: Middle, Desktop: Vertical Middle) */}
              <div className="relative flex items-center justify-center -my-3 md:-mx-3 md:my-0 z-10">
                <button
                  onClick={handleSwapLang}
                  className="bg-white hover:bg-neutral-50 shadow-md border border-neutral-200 p-2 rounded-full text-orange-500 transition-colors"
                  title="Đảo ngôn ngữ"
                >
                  <ArrowLeftRight className="w-5 h-5" />
                </button>
              </div>

              {/* Target Panel */}
              <div className="flex-1 p-4 bg-neutral-50 flex flex-col">
                 <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-neutral-700 text-sm">{sourceLang === 'EN' ? 'Tiếng Việt' : 'Tiếng Anh'}</span>
                </div>
                <div className="flex-1 w-full min-h-[150px] text-neutral-700 text-base overflow-y-auto whitespace-pre-wrap">
                  {translatedText || <span className="text-neutral-400 italic">Bản dịch sẽ xuất hiện ở đây...</span>}
                </div>
              </div>
            </div>

            {/* Footer Action */}
            <div className="p-4 bg-white border-t border-neutral-200 flex justify-end">
              <button
                onClick={handleTranslate}
                disabled={!sourceText.trim() || isTranslating}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-neutral-300 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                {isTranslating ? (
                  <><Activity className="w-5 h-5 animate-pulse" /> Đang dịch...</>
                ) : (
                  'Dịch'
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
