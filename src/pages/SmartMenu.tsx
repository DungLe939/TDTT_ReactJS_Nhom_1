import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeftRight, X, Copy, Check, Sparkles, Smile, Frown, Meh, Activity, Lightbulb, LightbulbOff, Bot, History, Trash2, PanelLeftClose, PanelLeftOpen, Soup, Sun, Moon, ChevronUp, ChevronDown } from 'lucide-react';

interface TranslationHistory {
  id: string;
  sourceText: string;
  translatedText: string;
  lang: 'vi' | 'en';
  sentiment: { label: string, score: number } | null;
  timestamp: Date;
}

export const SmartMenu = () => {
  // ----------------------------------------------------------------------
  // [STATE CỦA COMPONENT]
  // ----------------------------------------------------------------------
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sentiment, setSentiment] = useState<{ label: string, score: number } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // States mới cho tính năng Sidebar và History
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Theo dõi bộ chia đôi màn hình
  const [leftWidth, setLeftWidth] = useState(50); // Mặc định 50%
  const containerRef = useRef<HTMLDivElement>(null);
  const historyScrollRef = useRef<HTMLDivElement>(null);

  const scrollHistory = (direction: 'up' | 'down') => {
    if (historyScrollRef.current) {
      historyScrollRef.current.scrollBy({ top: direction === 'down' ? 200 : -200, behavior: 'smooth' });
    }
  };

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
       if (containerRef.current) {
         const containerRect = containerRef.current.getBoundingClientRect();
         const newLeftWidth = ((mouseMoveEvent.clientX - containerRect.left) / containerRect.width) * 100;
         if (newLeftWidth > 20 && newLeftWidth < 80) { // Giới hạn kéo từ 20% đến 80%
           setLeftWidth(newLeftWidth);
         }
       }
    };
    const handleMouseUp = () => {
       document.removeEventListener('mousemove', handleMouseMove);
       document.removeEventListener('mouseup', handleMouseUp);
       document.body.style.cursor = 'default';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
  }, []);

  // Xử lý mũi tên chuột thanh cuộn
  const handleTextareaMouseMove = (e: React.MouseEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.offsetX > e.currentTarget.clientWidth) {
      e.currentTarget.style.cursor = 'default';
    } else {
      e.currentTarget.style.cursor = 'text';
    }
  };

  // Theo dõi vị trí chuột
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Tải lịch sử từ LocalStorage nếu có
  useEffect(() => {
    const savedHistory = localStorage.getItem('translationHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        setHistory(parsed);
      } catch (e) {
        console.error("No valid history found");
      }
    }
  }, []);

  // Lưu lịch sử vào LocalStorage mỗi khi history thay đổi
  useEffect(() => {
    localStorage.setItem('translationHistory', JSON.stringify(history));
  }, [history]);
  // ----------------------------------------------------------------------

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Pinggy-No-Screen': 'true'
        },
        body: JSON.stringify({
          text: sourceText,
          method: lang === 'vi' ? 'en2vi' : 'vi2en'
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const textHienThi = result.data.output || result.data.translated_text || (typeof result.data === 'string' ? result.data : "Không tìm thấy nội dung dịch");
        setTranslatedText(textHienThi);

        const currentSentiment = result.data.sentiment || null;
        setSentiment(currentSentiment);

        // Lưu vào lịch sử khi dịch thành công
        const newItem: TranslationHistory = {
          id: Date.now().toString(),
          sourceText,
          translatedText: textHienThi,
          lang,
          sentiment: currentSentiment,
          timestamp: new Date()
        };
        setHistory(prev => [newItem, ...prev]);

      } else {
        setTranslatedText("Lỗi: " + (result.error || "Không có kết quả"));
      }
    } catch (error: any) {
      console.error(error);
      setTranslatedText("Lỗi mạng: Không thể kết nối.");
    } finally {
      setIsTranslating(false);
    }
  };

  const clearText = () => {
    setSourceText('');
    setTranslatedText('');
    setSentiment(null);
  };

  const copyToClipboard = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const loadHistoryItem = (item: TranslationHistory) => {
    setSourceText(item.sourceText);
    setTranslatedText(item.translatedText);
    setLang(item.lang);
    setSentiment(item.sentiment);
  };

  return (
    <div className={`h-[calc(100vh-4rem)] min-h-[600px] flex p-2 md:p-6 gap-6 max-w-7xl mx-auto transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-slate-200' : 'bg-[#fffaf5] text-neutral-800'}`}>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #fdba74; border-radius: 20px; }
      `}</style>
      
      {/* Sidebar Lịch sử */}
      <div className={`transition-all duration-500 flex flex-col overflow-hidden shrink-0 min-h-0
        ${isHistoryOpen ? 'w-full md:w-80 opacity-100' : 'w-0 opacity-0 hidden md:flex'} 
        rounded-3xl shadow-lg border ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-slate-900/50' : 'bg-white border-orange-100 shadow-orange-500/5'}`}>
        
        <div className={`p-4 xl:p-5 flex justify-between items-center border-b ${isDarkMode ? 'border-slate-700' : 'border-orange-50'}`}>
          <h2 className="font-bold whitespace-nowrap text-orange-500 flex items-center gap-2.5 text-lg">
             <History className="w-5 h-5 bg-orange-100 text-orange-600 rounded-md p-0.5" /> Lịch Sử
          </h2>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} title="Xóa lịch sử" className="p-2 rounded-full hover:bg-rose-50 text-rose-400 hover:text-rose-500 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        
        <div className="flex-1 relative min-h-0 flex flex-col">
            {/* Mặt nạ làm nhòe trên & Nút Cuộn */}
            <div className={`absolute top-0 left-0 right-3 h-14 pointer-events-none z-[5] flex justify-center pt-1 bg-gradient-to-b ${isDarkMode ? 'from-slate-900 via-slate-900/90 to-transparent' : 'from-[#fffaf5] via-[#fffaf5]/90 to-transparent'}`}>
              {history.length > 4 && (
                <button onClick={() => scrollHistory('up')} className={`pointer-events-auto mt-1 w-8 h-8 flex items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-90 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600' : 'bg-white hover:bg-orange-50 text-orange-500 border border-orange-200'}`}>
                   <ChevronUp className="w-5 h-5" />
                </button>
              )}
            </div>

            <div ref={historyScrollRef} className="flex-1 overflow-y-auto p-3 pt-6 pb-6 space-y-4 custom-scrollbar">
              {history.map(item => (
                <div key={item.id} onClick={() => loadHistoryItem(item)} 
                     className={`cursor-pointer group p-3.5 rounded-2xl border transition-all duration-500 hover:-translate-y-0.5 hover:shadow-md 
                     ${isDarkMode ? 'border-slate-700 hover:border-orange-500/40 bg-slate-800 hover:bg-slate-700' : 'border-neutral-100 hover:border-orange-300 bg-[#fffaf5] hover:bg-orange-50/50'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-sm">
                      {item.lang === 'vi' ? 'EN ➔ VI' : 'VI ➔ EN'}
                    </span>
                    {item.sentiment && (
                      <span className={`text-[10px] items-center flex gap-1 font-semibold ${item.sentiment.label === 'POS' ? 'text-emerald-500' : item.sentiment.label === 'NEG' ? 'text-rose-500' : 'text-blue-500'}`}>
                          {item.sentiment.label === 'POS' ? <Smile className="w-3 h-3"/> : item.sentiment.label === 'NEG' ? <Frown className="w-3 h-3"/> : <Meh className="w-3 h-3"/>}
                          {Math.round(item.sentiment.score * 100)}%
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-medium line-clamp-2 leading-relaxed ${isDarkMode ? 'text-slate-300 group-hover:text-slate-100' : 'text-neutral-600 group-hover:text-neutral-900'}`}>
                    {item.sourceText}
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 opacity-60">
                  <Activity className="w-10 h-10 mb-3 text-orange-200" />
                  <p className="text-sm font-medium">Bạn chưa dịch đoạn nào</p>
                </div>
              )}
            </div>

            {/* Mặt nạ làm nhòe dưới */}
            {history.length > 0 && (
              <div className={`absolute bottom-0 left-0 right-3 h-14 pointer-events-none z-[5] flex justify-center items-end pb-1 bg-gradient-to-t ${isDarkMode ? 'from-slate-900 via-slate-900/90 to-transparent' : 'from-[#fffaf5] via-[#fffaf5]/90 to-transparent'}`}>
                {history.length > 4 && (
                   <button onClick={() => scrollHistory('down')} className={`pointer-events-auto mb-1 w-8 h-8 flex items-center justify-center rounded-full shadow-sm backdrop-blur-md transition-all hover:scale-110 active:scale-90 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600' : 'bg-white hover:bg-orange-50 text-orange-500 border border-orange-200'}`}>
                     <ChevronDown className="w-5 h-5" />
                   </button>
                )}
              </div>
            )}
        </div>
      </div>

      {/* Bear Ears Wrapper */}
      <div className="flex-1 flex flex-col relative min-h-0 pt-6 lg:pt-0">
        
        {/* Tai gấu trái */}
        <div className={`hidden lg:flex absolute -top-10 left-[8%] w-24 h-24 rounded-full border z-0 transition-colors duration-500 items-start pt-3 justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-orange-200 shadow-[0_-8px_15px_rgba(249,115,22,0.05)]'}`}>
           <div className={`w-12 h-12 rounded-full transition-colors duration-500 ${isDarkMode ? 'bg-slate-700' : 'bg-orange-100'}`} />
        </div>
        
        {/* Tai gấu phải */}
        <div className={`hidden lg:flex absolute -top-10 right-[8%] w-24 h-24 rounded-full border z-0 transition-colors duration-500 items-start pt-3 justify-center ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-orange-200 shadow-[0_-8px_15px_rgba(249,115,22,0.05)]'}`}>
           <div className={`w-12 h-12 rounded-full transition-colors duration-500 ${isDarkMode ? 'bg-slate-700' : 'bg-orange-100'}`} />
        </div>

        {/* Main Translation Concept */}
        <div className={`flex-1 flex flex-col rounded-3xl min-h-0 shadow-xl relative z-10 overflow-hidden transition-all duration-500 border ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-slate-900/50' : 'bg-white border-orange-200 shadow-orange-500/10'}`}>
        
        {/* Header Tweak */}
        <div className={`px-4 xl:px-6 py-4 flex justify-between items-center z-10 relative border-b transition-colors duration-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-gradient-to-r from-orange-50/50 to-white border-orange-50'}`}>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsHistoryOpen(!isHistoryOpen)} 
              className={`p-2 hidden md:block rounded-xl border shadow-sm transition-all hover:scale-105 active:scale-95 ${isDarkMode ? 'border-slate-600 hover:bg-slate-700 text-slate-300' : 'bg-white border-orange-100 hover:border-orange-300 text-orange-500'}`}
              title="Toggle Sidebar"
            >
              {isHistoryOpen ? <PanelLeftClose className="w-5 h-5"/> : <PanelLeftOpen className="w-5 h-5"/>}
            </button>

            <h1 className="font-extrabold text-xl flex items-center gap-2">
              <Bot 
                className="w-7 h-7 text-orange-500 drop-shadow-sm transition-transform duration-75" 
                style={{ transform: `translate(${mousePos.x}px, ${mousePos.y}px) rotate(${mousePos.x * 2}deg)` }}
              /> 
              <span className="bg-gradient-to-r from-orange-500 to-rose-400 bg-clip-text text-transparent">Thông Dịch Viên</span>
            </h1>
          </div>

          <div className="flex flex-row gap-4 items-center">
             {/* Ngôn ngữ Toggle */}
             <div className={`flex items-center rounded-full p-1 border shadow-inner transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-neutral-100/80 border-neutral-200'}`}>
               <div className={`px-3 py-1.5 text-xs font-bold w-16 text-center select-none ${isDarkMode ? 'text-slate-300' : 'text-neutral-700'}`}>{lang === 'vi' ? 'Anh' : 'Việt'}</div>
               <button
                 onClick={() => {
                   setLang(lang === 'vi' ? 'en' : 'vi');
                   setSourceText(translatedText);
                   setTranslatedText(sourceText);
                 }}
                 className="p-1.5 rounded-full shadow-md hover:scale-110 active:scale-90 transition-all bg-gradient-to-r from-orange-400 to-orange-500 text-white"
                 title="Đảo ngôn ngữ"
               >
                 <ArrowLeftRight className="w-4 h-4" />
               </button>
               <div className={`px-3 py-1.5 text-xs font-bold w-16 text-center select-none ${isDarkMode ? 'text-slate-300' : 'text-neutral-700'}`}>{lang === 'vi' ? 'Việt' : 'Anh'}</div>
             </div>

            {/* Dark Mode Switch */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`relative flex items-center w-14 h-7 rounded-full transition-colors duration-300 shadow-inner border mx-2 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-orange-200 border-orange-300'}`}
              title="Đổi chế độ sáng tối"
            >
              <div className={`absolute top-[1.5px] w-6 h-6 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isDarkMode ? 'left-[26px] bg-slate-900 border border-slate-600' : 'left-[1.5px] bg-white border border-orange-100'}`}>
                {isDarkMode ? <Moon className="w-3.5 h-3.5 text-slate-300" /> : <Sun className="w-4 h-4 text-orange-500" />}
              </div>
            </button>
          </div>
        </div>

        {/* Areas */}
        <div ref={containerRef} className="flex-1 flex flex-col md:flex-row h-full relative min-h-0">
          {/* Source Area */}
          <div style={{ width: window.innerWidth >= 768 ? `${leftWidth}%` : '100%' }} className={`p-5 md:p-8 flex flex-col relative transition-colors duration-500 border-b md:border-b-0 md:border-r ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-orange-100/50'}`}>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              onMouseMove={handleTextareaMouseMove}
              placeholder={lang === 'vi' ? "Nhập văn bản tiếng Anh cần dịch..." : "Nhập văn bản tiếng Việt cần dịch..."}
              className={`w-full flex-1 resize-none outline-none text-base md:text-lg font-medium bg-transparent transition-colors duration-500 custom-scrollbar ${isDarkMode ? 'text-white placeholder-slate-600' : 'text-neutral-800 placeholder-neutral-300'}`}
            />
            {sourceText && (
              <button onClick={clearText} className={`absolute top-6 right-6 p-2 rounded-full transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}`}>
                <X className="w-4 h-4" />
              </button>
            )}
            
            <div className={`mt-4 pt-4 border-t flex justify-between items-center transition-colors duration-500 ${isDarkMode ? 'border-slate-700' : 'border-neutral-100'}`}>
              <div className="flex items-center gap-3 hover:scale-105 transition-all duration-300 origin-left cursor-default">
                <div className="relative flex items-center justify-center w-10 h-10">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="20" cy="20" r="16" fill="transparent" stroke={isDarkMode ? "#334155" : "#f3f4f6"} strokeWidth="4" />
                    <circle cx="20" cy="20" r="16" fill="transparent" stroke={sourceText.length > 1900 ? "#ef4444" : "#f97316"} strokeWidth="4" strokeDasharray="100.5" strokeDashoffset={Math.max(0, 100.5 - (sourceText.length / 2000) * 100.5)} strokeLinecap="round" className="transition-all duration-300" />
                  </svg>
                  <span className={`absolute text-[9px] font-bold ${sourceText.length > 2000 ? 'text-red-500' : (isDarkMode ? 'text-slate-400' : 'text-neutral-400')}`}>
                    {Math.round(sourceText.length/2000 * 100)}%
                  </span>
                </div>
                <span className={`text-sm font-semibold ${sourceText.length > 2000 ? 'text-rose-500' : (isDarkMode ? 'text-slate-500' : 'text-neutral-400')}`}>
                  {sourceText.length} / 2000
                </span>
              </div>
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !sourceText.trim()}
                className={`px-8 py-3 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2 ${isTranslating || !sourceText.trim()
                  ? (isDarkMode ? 'bg-slate-700 text-slate-500' : 'bg-neutral-100 text-neutral-400 opacity-70')
                  : 'bg-gradient-to-tr from-orange-600 to-rose-500 text-white hover:shadow-orange-500/30 hover:scale-105 active:scale-95'
                  }`}
              >
                {isTranslating ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Đang dịch</> : <><Sparkles className="w-5 h-5" /> Dịch ngay</>}
              </button>
            </div>
          </div>

          {/* Draggable Divider (Resizer) */}
          <div 
            onMouseDown={startResizing}
            className="hidden md:flex w-3 cursor-col-resize hover:bg-orange-400/20 active:bg-orange-400/40 bg-transparent flex-col justify-center items-center z-20 group transition-colors -ml-1.5 -mr-1.5"
            title="Kéo để thay đổi kích thước"
          >
            <div className={`h-12 w-1.5 rounded-full transition-colors ${isDarkMode ? 'bg-slate-600 group-hover:bg-orange-500' : 'bg-neutral-200 group-hover:bg-orange-400'}`} />
          </div>

          {/* Target Area */}
          <div style={{ width: window.innerWidth >= 768 ? `${100 - leftWidth}%` : '100%' }} className={`p-5 md:p-8 flex flex-col relative transition-colors duration-500 ${isDarkMode ? 'bg-slate-850 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-800 to-slate-900' : 'bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-50/50 to-white'}`}>
            
            {/* Center decorative soup icon */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none opacity-[0.03]">
              <Soup 
                className="w-64 h-64 text-orange-900 transition-transform duration-75"
                style={{ transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px) rotate(${mousePos.x * 0.1}deg)` }}
              />
            </div>

            {/* Sentiment Badge */}
            {sentiment && (
              <div className="flex justify-end mb-4 relative z-10">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-sm transition-all duration-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-orange-100/50'}`}>
                  <span className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-neutral-400'}`}>Giọng văn</span>
                  <div className={`flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-xl ${sentiment.label === 'POS' ? 'bg-emerald-100 text-emerald-600' : sentiment.label === 'NEG' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                    {sentiment.label === 'POS' ? <Smile className="w-4 h-4"/> : sentiment.label === 'NEG' ? <Frown className="w-4 h-4"/> : <Meh className="w-4 h-4"/>}
                    {sentiment.label === 'POS' ? 'Tích cực' : sentiment.label === 'NEG' ? 'Tiêu cực' : 'Trung lập'}
                    <span className="opacity-70">({Math.round(sentiment.score * 100)}%)</span>
                  </div>
                </div>
              </div>
            )}

            <textarea
              readOnly
              value={translatedText}
              onMouseMove={handleTextareaMouseMove}
              placeholder="Bản dịch sẽ xuất hiện ở đây..."
              className={`w-full flex-1 resize-none outline-none text-base md:text-lg font-medium bg-transparent transition-colors duration-500 relative z-10 custom-scrollbar ${isDarkMode ? 'text-orange-400 placeholder-slate-700' : 'text-orange-600 placeholder-orange-200/50'}`}
            />
            
            {translatedText && (
              <div className="flex justify-end mt-4 relative z-10">
                <button
                  onClick={copyToClipboard}
                  className={`px-5 py-2.5 rounded-2xl font-bold border shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95 hover:-translate-y-0.5 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-300 hover:text-orange-400 hover:border-orange-500/50' : 'bg-white border-orange-200 text-orange-600 hover:bg-orange-50'}`}
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                  {copied ? <span className="text-emerald-500">Đã lưu</span> : <span>Sao chép</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};