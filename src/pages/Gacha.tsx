import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dices, RefreshCw, MapPin, ChefHat } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import confetti from 'canvas-confetti';

const foodOptions = [
  { name: 'Phở Bò', type: 'Món nước', region: 'Việt Nam', emoji: '🍜', img: 'https://images.unsplash.com/photo-1701480253822-1842236c9a97?auto=format&fit=crop&q=80&w=400' },
  { name: 'Gỏi Cuốn', type: '', region: '', emoji: '', img: '' },
  { name: 'Bún Bò Huế', type: '', region: '', emoji: '', img: '' },
  { name: 'Bánh Mì', type: '', region: '', emoji: '', img: '' },
  { name: 'Bún Chả', type: 'Món khô', region: 'Việt Nam', emoji: '', img: '' },
];

export const Gacha = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<typeof foodOptions[0] | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const { isLoggedIn } = useAuth();

  const handleSpin = () => {
    if (!isLoggedIn && spinCount >= 2) {
      alert("Bạn đã hết lượt quay thử. Hãy đăng nhập để quay không giới hạn!");
      return;
    }

    setIsSpinning(true);
    setResult(null);

    // Fake spin animation duration
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * foodOptions.length);
      setResult(foodOptions[randomIndex]);
      setIsSpinning(false);
      setSpinCount(prev => prev + 1);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f97316', '#fbbf24', '#ef4444']
      });
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto text-center space-y-12 py-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-neutral-800 dark:text-white flex items-center justify-center gap-3">
          <Dices className="w-10 h-10 text-purple-500" />
          Gacha Món Ăn
        </h1>
        <p className="text-neutral-600 dark:text-gray-400 text-lg">
          Không biết ăn gì hôm nay? Nhấn nút và để vòng quay nhân phẩm quyết định!
        </p>
        {!isLoggedIn && (
          <p className="text-sm font-medium text-amber-600 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 inline-block px-4 py-1 rounded-full">
            Tài khoản khách: Còn {Math.max(0, 2 - spinCount)} lượt quay
          </p>
        )}
      </div>

      <div className="relative h-[400px] flex items-center justify-center">
        {/* Slot Machine Display */}
        <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border-4 border-purple-200 dark:border-purple-900/30 overflow-hidden relative">

          {/* Header */}
          <div className="bg-purple-100 dark:bg-purple-900/20 p-3 text-center border-b-4 border-purple-200 dark:border-purple-900/30">
            <h2 className="font-bold text-purple-800 dark:text-purple-300 tracking-wider">HÔM NAY ĂN GÌ?</h2>
          </div>

          <div className="h-[280px] bg-neutral-50 dark:bg-slate-950 flex items-center justify-center relative overflow-hidden p-6">
            <AnimatePresence mode="wait">
              {!isSpinning && !result && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center text-neutral-400 dark:text-gray-500"
                >
                  <ChefHat className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Sẵn sàng quay!</p>
                </motion.div>
              )}

              {isSpinning && (
                <motion.div
                  key="spinning"
                  animate={{
                    y: [-100, 100],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.2,
                    ease: "linear"
                  }}
                  className="text-6xl"
                >
                  🍱
                </motion.div>
              )}

              {result && !isSpinning && (
                <motion.div
                  key="result"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="w-full h-full flex flex-col items-center justify-center space-y-4"
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg relative">
                    <img src={result.img} alt={result.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/10"></div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-neutral-800 dark:text-white mb-1 flex items-center justify-center gap-2">
                      {result.name} <span className="text-2xl">{result.emoji}</span>
                    </h3>
                    <div className="flex items-center justify-center gap-4 text-sm font-medium text-neutral-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><ChefHat className="w-4 h-4" /> {result.type}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {result.region}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div>
        <button
          onClick={handleSpin}
          disabled={isSpinning || (!isLoggedIn && spinCount >= 2)}
          className={`
            relative overflow-hidden group px-12 py-5 rounded-full text-xl font-bold text-white shadow-xl transition-all
            ${isSpinning || (!isLoggedIn && spinCount >= 2) ? 'bg-neutral-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 hover:shadow-purple-500/30'}
          `}
        >
          {isSpinning ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin" /> Đang chọn...
            </span>
          ) : (
            'QUAY NGAY!'
          )}

          {/* Shine effect */}
          {!isSpinning && (
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          )}
        </button>
      </div>

    </div>
  );
};
