import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ThumbsDown, UserPlus, Check, Sparkles, RefreshCw, ChevronRight } from 'lucide-react';

const MOCK_MEMBERS = [
  { id: 1, name: 'Bạn', avatar: 'B' },
  { id: 2, name: 'Linh', avatar: 'L' },
  { id: 3, name: 'Minh', avatar: 'M' },
];

const PREFERENCE_OPTIONS = [
  'Đồ nướng', 'Hải sản', 'Món nước', 'Ăn vặt', 'Đồ chay', 'Cơm', 'Đồ ngọt'
];

export const GroupTaste = () => {
  const [step, setStep] = useState(1);
  const [likes, setLikes] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setIsCalculating(true);
      setTimeout(() => {
        setIsCalculating(false);
        setStep(4);
      }, 2000);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-neutral-50 pb-20">
      <div className="bg-white p-6 rounded-b-[2rem] shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-neutral-800 mb-2">Ăn gì nhóm?</h1>
        <p className="text-neutral-500 text-sm">Dung hòa khẩu vị của cả team để chọn món ăn hoàn hảo nhất.</p>

        {/* Members List */}
        <div className="flex items-center gap-3 mt-6 overflow-x-auto pb-2">
          {MOCK_MEMBERS.map(m => (
            <div key={m.id} className="flex flex-col items-center gap-1 shrink-0">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white ring-2 ring-orange-100">
                {m.avatar}
              </div>
              <span className="text-xs font-medium text-neutral-600">{m.name}</span>
            </div>
          ))}
          <button className="flex flex-col items-center gap-1 shrink-0 ml-2">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center border-2 border-dashed border-neutral-300 hover:border-orange-400 hover:text-orange-500 transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-neutral-500">Thêm</span>
          </button>
        </div>
      </div>

      <div className="px-6">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-neutral-800">
                  <Heart className="w-5 h-5 text-red-500" /> Bạn bè của bạn thích gì?
                </h2>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setLikes(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt])}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${likes.includes(opt) ? 'bg-red-500 text-white shadow-md' : 'bg-white text-neutral-600 border border-neutral-200'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-neutral-800">
                  <ThumbsDown className="w-5 h-5 text-neutral-400" /> Nhóm của bạn muốn tránh món nào?
                </h2>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => setDislikes(prev => prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt])}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${dislikes.includes(opt) ? 'bg-neutral-800 text-white shadow-md' : 'bg-white text-neutral-600 border border-neutral-200'
                        }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-orange-50 p-6 rounded-2xl text-center border border-orange-100">
                <Sparkles className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-neutral-800 mb-2">Đã sẵn sàng!</h2>
                <p className="text-neutral-600 text-sm mb-4">
                  Hệ thống AI sẽ phân tích dựa trên khẩu vị của 3 thành viên để đưa ra những lựa chọn tốt nhất.
                </p>
              </div>
            </motion.div>
          )}

          {isCalculating && (
            <motion.div
              key="calculating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 space-y-4"
            >
              <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin"></div>
              <p className="font-medium text-neutral-600 animate-pulse">Đang tìm điểm chung...</p>
            </motion.div>
          )}

          {step === 4 && !isCalculating && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <h2 className="font-bold text-neutral-800">Đề xuất hàng đầu cho nhóm:</h2>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-orange-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Độ phù hợp: 98%
                </div>
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-neutral-200 rounded-xl overflow-hidden shrink-0">
                    <img src="https://images.unsplash.com/photo-1544025162-811114bd4b2b?auto=format&fit=crop&q=80&w=200&h=200" alt="Lẩu Bò" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-neutral-800">Lẩu Bò Ba Toa</h3>
                    <p className="text-sm text-neutral-500 mb-2">Thích hợp cho team thích đồ nước, né hải sản.</p>
                    <div className="flex -space-x-2">
                      {MOCK_MEMBERS.map(m => (
                        <div key={m.id} className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                          <Check className="w-3 h-3" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors">
                  Chốt đơn ngay
                </button>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-sm border border-neutral-100 opacity-80">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-neutral-800">Quán Nướng ngói Cu Đức</h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">85%</span>
                </div>
                <p className="text-sm text-neutral-500 mb-3">Linh hơi ngần ngại vì mùi khói, nhưng Minh và Bạn cực thích đồ nướng.</p>
                <button className="w-full py-2 bg-neutral-100 text-neutral-700 rounded-xl text-sm font-semibold">
                  Xem bình chọn
                </button>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-orange-600">
                <RefreshCw className="w-4 h-4" /> Tìm thêm lựa chọn
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && !isCalculating && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-neutral-50 to-transparent">
            <button
              onClick={handleNext}
              className="w-full max-w-md mx-auto bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-2xl font-semibold shadow-lg shadow-orange-200 flex items-center justify-center gap-2 transition-colors"
            >
              {step === 3 ? 'Tìm món chung' : 'Tiếp tục'}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};