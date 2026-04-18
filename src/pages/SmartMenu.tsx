import { useState } from 'react';
import { Camera, RefreshCw, Languages, ShieldAlert, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const TRANSLATED_ITEMS = [
  {
    id: 1,
    original: 'Khao Soi',
    translated: 'Mì Cà ri Dừa',
    image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&q=80&w=200&h=200',
    popularity: 95,
    allergens: ['Đậu phộng', 'Hải sản (mắm tép)'],
    spicyLevel: 2,
    desc: 'Món mì đặc sản miền Bắc Thái Lan, nước dùng cà ri dừa béo ngậy ăn kèm mì chiên giòn.'
  },
  {
    id: 2,
    original: 'Som Tum',
    translated: 'Gỏi Đu đủ Thái',
    image: 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?auto=format&fit=crop&q=80&w=200&h=200',
    popularity: 88,
    allergens: ['Tôm khô', 'Đậu phộng'],
    spicyLevel: 3,
    desc: 'Gỏi đu đủ xanh bào sợi trộn gia vị chua cay mặn ngọt đặc trưng.'
  }
];

export const SmartMenu = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 2500);
  };

  const reset = () => setHasScanned(false);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-neutral-100 flex flex-col max-w-lg mx-auto border-x border-neutral-200">

      {/* Top Bar */}
      <div className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10 relative">
        <h1 className="font-bold text-neutral-800 text-lg flex items-center gap-2">
          <Languages className="w-5 h-5 text-orange-500" /> Menu AI
        </h1>
        <div className="flex bg-neutral-100 rounded-lg p-1">
          <button
            onClick={() => setLang('vi')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'vi' ? 'bg-white shadow-sm text-orange-600' : 'text-neutral-500'}`}
          >
            VI
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${lang === 'en' ? 'bg-white shadow-sm text-orange-600' : 'text-neutral-500'}`}
          >
            EN
          </button>
        </div>
      </div>

      {!hasScanned ? (
        <div className="flex-1 relative bg-black flex items-center justify-center">
          <img src="https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?auto=format&fit=crop&q=80" alt="Menu background" className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale" />

          <div className="relative z-10 w-[80%] aspect-[3/4] border-2 border-white/40 rounded-xl flex items-center justify-center bg-black/20 backdrop-blur-sm overflow-hidden">
            {isScanning && (
              <motion.div
                initial={{ top: '-10%' }}
                animate={{ top: '110%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-8 bg-gradient-to-b from-transparent via-orange-500/50 to-orange-500 blur-sm"
              />
            )}

            <div className="absolute inset-0 p-4">
              <div className="w-full h-full border border-dashed border-white/50 rounded-lg relative">
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-orange-500"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-orange-500"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-orange-500"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-orange-500"></div>
              </div>
            </div>

            <div className="text-center">
              <Camera className="w-10 h-10 text-white/80 mx-auto mb-2" />
              <p className="text-white/90 text-sm font-medium">Đưa menu vào khung hình</p>
              <p className="text-white/60 text-xs mt-1 px-4">Hỗ trợ nhận diện cả chữ viết tay</p>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 flex justify-center z-10">
            <button
              onClick={handleScan}
              disabled={isScanning}
              className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2 ${isScanning ? 'bg-orange-600 text-white opacity-80' : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}
            >
              {isScanning ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /> Đang dịch...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Quét Menu</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 bg-neutral-50">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h2 className="text-sm font-bold text-neutral-500 uppercase">Kết quả bản dịch</h2>
              <p className="text-xs text-neutral-400">Đã tìm thấy 2 món nổi bật</p>
            </div>
            <button onClick={reset} className="text-sm text-orange-600 font-semibold hover:underline">
              Quét lại
            </button>
          </div>

          {TRANSLATED_ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
              <div className="h-32 w-full relative">
                <img src={item.image} alt={item.translated} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded-md text-xs font-bold backdrop-blur-sm flex items-center gap-1">
                  🔥 {item.popularity}% yêu thích
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg text-neutral-800">{lang === 'vi' ? item.translated : item.original}</h3>
                  <div className="flex gap-0.5">
                    {[...Array(3)].map((_, i) => (
                      <span key={i} className={`text-xs ${i < item.spicyLevel ? 'text-red-500' : 'text-neutral-200'}`}>🌶️</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-neutral-400 mb-3">{lang === 'vi' ? item.original : item.translated}</p>

                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{item.desc}</p>

                {item.allergens.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Cảnh báo dị ứng</p>
                      <p className="text-xs text-amber-700 mt-0.5">{item.allergens.join(', ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};