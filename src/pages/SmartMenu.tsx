import { useState } from 'react';
import { Languages, ArrowLeftRight, X, Copy, Check, Sparkles, Smile, Frown, Meh, Activity, Lightbulb, LightbulbOff, Bot } from 'lucide-react';

export const SmartMenu = () => {
  // ----------------------------------------------------------------------
  // [STATE CỦA COMPONENT] - Ghi chú dành cho team
  // ----------------------------------------------------------------------
  // lang: Quản lý ngôn ngữ Đích đến ('vi' = Dịch sang tiếng Việt, 'en' = Dịch sang tiếng Anh)
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  // sourceText: Nội dung chữ người dùng gõ vào khung trên
  const [sourceText, setSourceText] = useState('');

  // translatedText: Nội dung chữ đã được AI trả về ở khung dưới
  const [translatedText, setTranslatedText] = useState('');

  // isTranslating: Trạng thái cờ (boolean) báo hiệu đang gọi API Pinggy để hiện Loading spinner
  const [isTranslating, setIsTranslating] = useState(false);

  // copied: Trạng thái UI cho biểu tượng copy (hiển thị dấu tích ✅ sau khi copy thành công)
  const [copied, setCopied] = useState(false);

  // sentiment: Dữ liệu phân tích cảm xúc trích xuất từ AI Backend (vd: {label: 'POS', score: 0.99})
  const [sentiment, setSentiment] = useState<{ label: string, score: number } | null>(null);

  // isDarkMode: Trạng thái cờ chuyển đổi Giao diện Tối/Sáng thông qua cái nút gạt (Lamp switch)
  const [isDarkMode, setIsDarkMode] = useState(false);
  // ----------------------------------------------------------------------

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);

    // ----------------------------------------------------------------------
    // [HƯỚNG DẪN DÀNH CHO NHÓM] - CÁCH TÍCH HỢP ĐƯỜNG DẪN PINGGY (API PATH)
    // ----------------------------------------------------------------------
    // 1. Nếu chạy hoàn toàn trên máy cá nhân (Localhost):
    //    Đường dẫn mặc định sẽ là: http://localhost:3000
    //
    // 2. Nếu dùng Pinggy để Public server cho người khác xài qua điện thoại:
    //    Bạn thay đường dẫn Pinggy vào cái link chữ màu đục ở dòng bên dưới, 
    //    hoặc tốt nhất là tạo một file tên là ".env" tại thư mục TDTT_ReactJS_Nhom_1
    //    rồi ghi vào đó: VITE_API_URL=https://quyet-mat-khau-gi-do.a.pinggy.link
    // ----------------------------------------------------------------------
    const API_URL = import.meta.env.VITE_API_URL || "https://rraid-103-249-22-29.run.pinggy-free.link";
    // ----------------------------------------------------------------------

    try {
      const response = await fetch(`${API_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Pinggy-No-Screen': 'true' // Bỏ qua trang cảnh báo của Pinggy Free
        },
        body: JSON.stringify({
          text: sourceText,
          // 'vi' tức là đích đến tiếng Việt => Anh dịch sang Việt (en2vi)
          method: lang === 'vi' ? 'en2vi' : 'vi2en'
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Cập nhật đúng trường dữ liệu trả về từ API của bạn: result.data.output
        const textHienThi = result.data.output || result.data.translated_text || (typeof result.data === 'string' ? result.data : "Không tìm thấy nội dung dịch");
        setTranslatedText(textHienThi);

        // Đọc thêm trường sentiment từ mô hình AI (nếu có)
        if (result.data.sentiment) {
          setSentiment(result.data.sentiment);
        } else {
          setSentiment(null);
        }
      } else {
        setTranslatedText("Lỗi: " + (result.error || "Không có kết quả"));
      }
    } catch (error: any) {
      console.error(error);
      setTranslatedText("Lỗi mạng: Không thể kết nối. Xin hãy kiểm tra lại server Backend hoặc đường link Pinggy đã đúng chưa.");
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

  return (
    <div className={`relative min-h-[calc(100vh-4rem)] flex flex-col max-w-lg mx-auto border-x transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-neutral-100 border-neutral-200'}`}>

      {/* Top Bar */}
      <div className={`px-4 py-3 flex justify-between items-center shadow-sm z-10 relative transition-colors duration-500 ${isDarkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-white'}`}>
        <div className="flex flex-col gap-1.5">
          <h1 className={`font-bold text-lg flex items-center gap-2 transition-colors duration-500 ${isDarkMode ? 'text-slate-100' : 'text-neutral-800'}`}>
            <Bot className="w-6 h-6 text-orange-500 animate-bounce" /> Thông Dịch Viên
          </h1>
          {/* Cầu dao đèn tối/sáng */}
          <div className="flex items-center gap-2">
            <LightbulbOff className={`w-4 h-4 transition-colors ${isDarkMode ? 'text-blue-400 animate-pulse' : 'text-neutral-300'}`} />
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 shadow-inner ${isDarkMode ? 'bg-slate-600' : 'bg-orange-200'}`}
              title="Gạt trái để Tắt đèn (Dark Mode) - Gạt phải để Bật đèn (Light Mode)"
            >
              <div className={`absolute top-1 w-4 h-4 rounded-full shadow-md transition-all duration-300 ${isDarkMode ? 'left-1 bg-slate-300' : 'left-7 bg-white'}`} />
            </button>
            <Lightbulb className={`w-4 h-4 transition-colors ${!isDarkMode ? 'text-yellow-500 animate-[pulse_2s_ease-in-out_infinite]' : 'text-slate-500'}`} />
          </div>
        </div>

        <div className={`flex items-center rounded-full p-1 border shadow-inner transition-colors duration-500 ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-neutral-100 border-neutral-200'}`}>
          <div className={`px-3 py-1 text-xs font-bold w-16 text-center select-none transition-colors ${isDarkMode ? 'text-slate-300' : 'text-neutral-700'}`}>
            {lang === 'vi' ? 'Anh' : 'Việt'}
          </div>

          <button
            onClick={() => {
              setLang(lang === 'vi' ? 'en' : 'vi');
              setSourceText(translatedText);
              setTranslatedText(sourceText);
            }}
            className={`p-1.5 rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all ${isDarkMode ? 'bg-slate-800 text-orange-400 hover:bg-slate-700' : 'bg-white text-orange-500 hover:bg-orange-50'}`}
            title="Đảo ngôn ngữ"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <div className={`px-3 py-1 text-xs font-bold w-16 text-center select-none transition-colors ${isDarkMode ? 'text-slate-300' : 'text-neutral-700'}`}>
            {lang === 'vi' ? 'Việt' : 'Anh'}
          </div>
        </div>
      </div>

      {/* Translation Interface */}
      <div className="flex-1 flex flex-col">
        {/* Source Text Area */}
        <div className={`flex-1 p-5 border-b relative shadow-sm z-0 flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-neutral-200'}`}>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder={lang === 'vi' ? "Nhập văn bản tiếng Anh cần dịch..." : "Nhập văn bản tiếng Việt cần dịch..."}
            className={`w-full flex-1 resize-none outline-none text-xl md:text-2xl bg-transparent transition-colors duration-500 ${isDarkMode ? 'text-white placeholder-slate-500' : 'text-neutral-800 placeholder-neutral-300'}`}
          />

          {sourceText && (
            <button
              onClick={clearText}
              className={`absolute top-5 right-5 transition-colors p-1 rounded-full ${isDarkMode ? 'text-slate-400 hover:text-slate-200 bg-slate-700' : 'text-neutral-300 hover:text-neutral-500 bg-white'}`}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className={`flex justify-between items-center mt-2 border-t pt-3 transition-colors duration-500 ${isDarkMode ? 'border-slate-700' : 'border-neutral-100'}`}>
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-8 h-8">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="16" cy="16" r="14" fill="transparent" stroke={isDarkMode ? "#334155" : "#f3f4f6"} strokeWidth="3" />
                  <circle cx="16" cy="16" r="14" fill="transparent" stroke={sourceText.length > 1900 ? "#ef4444" : "#f97316"} strokeWidth="3" strokeDasharray="88" strokeDashoffset={Math.max(0, 88 - (sourceText.length / 2000) * 88)} strokeLinecap="round" className="transition-all duration-300" />
                </svg>
                <span className={`absolute text-[9px] font-bold ${sourceText.length > 2000 ? 'text-red-500' : (isDarkMode ? 'text-slate-400' : 'text-neutral-400')}`}>{sourceText.length}</span>
              </div>
              <span className={`text-xs font-medium hidden sm:inline ${isDarkMode ? 'text-slate-500' : 'text-neutral-400'}`}>/ 2000 ký tự</span>
            </div>
            <button
              onClick={handleTranslate}
              disabled={isTranslating || !sourceText.trim()}
              className={`px-6 py-2 rounded-full font-bold shadow-md transition-all flex items-center gap-2 ${isTranslating || !sourceText.trim()
                ? (isDarkMode ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-neutral-200 text-neutral-400 cursor-not-allowed')
                : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:shadow-lg hover:-translate-y-0.5'
                }`}
            >
              {isTranslating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Đang dịch...
                </span>
              ) : (
                <><Sparkles className="w-4 h-4 group-hover:animate-ping" /> Dịch</>
              )}
            </button>
          </div>
        </div>

        {/* Target Text Area */}
        <div className={`flex-1 p-5 relative flex flex-col items-start border-t transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700' : 'bg-gradient-to-b from-[#F9FAFB] to-white border-neutral-100'}`}>
          <textarea
            readOnly
            value={translatedText}
            placeholder="Bản dịch sẽ xuất hiện ở đây..."
            className={`w-full flex-1 resize-none outline-none text-lg md:text-xl font-medium bg-transparent transition-colors duration-500 ${isDarkMode ? 'text-orange-400 placeholder-slate-600' : 'text-orange-600 placeholder-orange-200/60'}`}
          />

          {sentiment && (
            <div className={`mt-4 mb-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] transition-all duration-500 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-neutral-100'}`}>
              <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-neutral-500'}`}>Giọng văn:</span>
              <div className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${sentiment.label === 'POS' ? (isDarkMode ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700') :
                sentiment.label === 'NEG' ? (isDarkMode ? 'bg-rose-900/50 text-rose-400' : 'bg-rose-100 text-rose-700') :
                  (isDarkMode ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-700')
                }`}>
                {sentiment.label === 'POS' ? <Smile className="w-3.5 h-3.5" /> :
                  sentiment.label === 'NEG' ? <Frown className="w-3.5 h-3.5" /> :
                    <Meh className="w-3.5 h-3.5" />}
                {sentiment.label === 'POS' ? 'Tích cực' :
                  sentiment.label === 'NEG' ? 'Tiêu cực' : 'Trung lập'}
                <span className="opacity-70 ml-0.5 font-medium">({Math.round(sentiment.score * 100)}%)</span>
              </div>
            </div>
          )}

          {translatedText && (
            <div className="absolute bottom-5 right-5 flex gap-2">
              <button
                onClick={copyToClipboard}
                className={`p-2.5 rounded-full border shadow-sm transition-all flex items-center gap-1 ${isDarkMode ? 'bg-slate-800 border-slate-600 text-slate-400 hover:text-orange-400 hover:border-orange-500/50' : 'bg-white border-neutral-200 text-neutral-500 hover:text-orange-500 hover:border-orange-200'}`}
                title="Sao chép"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied && <span className="text-xs font-bold text-green-500 pr-1">Đã chép</span>}
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};