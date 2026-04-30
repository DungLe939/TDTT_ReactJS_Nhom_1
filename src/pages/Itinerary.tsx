import { useState } from 'react';
import { Navigation, Filter, MapPin, AlertTriangle, RefreshCw, Plus, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DATES = [12, 13, 14, 15, 16, 17, 18];

const MEALS = [
  { id: 1, type: 'Sáng', time: '08:00', name: 'Bún Bò Huế Mụ Rơi', rating: 4.8, img: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=200&h=200', tag: 'Món nước' },
  { id: 2, type: 'Trưa', time: '12:30', name: 'Cơm Niêu Singapore', rating: 4.5, img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&q=80&w=200&h=200', tag: 'Cơm', warning: true },
  { id: 3, type: 'Tối', time: '19:00', name: 'Hải sản Biển Đông', rating: 4.7, img: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200&h=200', tag: 'Hải sản' },
];

export const Itinerary = () => {
  const [activeDay, setActiveDay] = useState(1);

  return (
    <div className="max-w-4xl mx-auto pb-20">

      {/* Header & Map Overview */}
      <div className="bg-white dark:bg-slate-900 rounded-b-3xl shadow-sm overflow-hidden border-b border-neutral-200 dark:border-white/10 mb-6">
        <div className="relative h-48 bg-neutral-200 dark:bg-slate-800">
          <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80" alt="Map" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

          {/* Heatmap indicators */}
          <div className="absolute top-10 left-1/4 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></div>
          <div className="absolute top-20 left-1/2 w-4 h-4 rounded-full bg-yellow-400 border-2 border-white shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
          <div className="absolute bottom-12 right-1/4 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>

          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
            <div>
              <h1 className="text-2xl font-bold">Lịch trình Food Tour</h1>
              <p className="text-sm opacity-90 flex items-center gap-1"><MapPin className="w-4 h-4" /> Đà Nẵng, 3 ngày</p>
            </div>
            <button className="bg-white/20 dark:bg-slate-800/40 backdrop-blur-md p-2 rounded-xl border border-white/30 dark:border-white/20">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Scroll */}
        <div className="flex overflow-x-auto hide-scrollbar p-4 gap-3">
          {DATES.map((date, idx) => (
            <button
              key={date}
              onClick={() => setActiveDay(idx)}
              className={`flex flex-col items-center min-w-[3.5rem] p-2 rounded-2xl transition-all ${activeDay === idx
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-none'
                  : 'bg-neutral-50 dark:bg-slate-800 text-neutral-500 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-orange-950/30'
                }`}
            >
              <span className="text-xs font-semibold mb-1">{DAYS[idx]}</span>
              <span className={`text-lg font-bold ${activeDay === idx ? 'text-white' : 'text-neutral-800 dark:text-white'}`}>{date}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Plan Content */}
      <div className="px-4 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-bold text-neutral-800 dark:text-white text-lg">Hôm nay ăn gì?</h2>
          <button className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/30 px-3 py-1.5 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" /> Tạo lại
          </button>
        </div>

        {MEALS.map((meal) => (
          <motion.div
            key={meal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-neutral-100 dark:border-white/10 flex gap-4 relative overflow-hidden"
          >
            {meal.warning && (
              <div className="absolute top-0 right-0 left-0 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs px-3 py-1 flex items-center gap-1 font-medium border-b border-red-100 dark:border-red-900/30">
                <AlertTriangle className="w-3 h-3" /> Món này hơi giống món trưa qua, bạn có muốn đổi?
                <button className="ml-auto text-red-700 dark:text-red-300 underline font-bold">Đổi món</button>
              </div>
            )}

            <div className={`w-24 h-24 rounded-xl overflow-hidden shrink-0 ${meal.warning ? 'mt-6' : ''}`}>
              <img src={meal.img} alt={meal.name} className="w-full h-full object-cover" />
            </div>

            <div className={`flex-1 py-1 flex flex-col justify-between ${meal.warning ? 'mt-6' : ''}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-white bg-neutral-800 dark:bg-slate-700 px-2 py-0.5 rounded-md uppercase tracking-wider">{meal.type}</span>
                  <span className="text-xs text-neutral-500 dark:text-gray-400 flex items-center gap-0.5"><Clock className="w-3 h-3" /> {meal.time}</span>
                </div>
                <h3 className="font-bold text-neutral-800 dark:text-white leading-tight">{meal.name}</h3>
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 px-2 py-1 rounded-lg">
                  {meal.tag}
                </span>
                <button className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-slate-800 flex items-center justify-center text-neutral-600 dark:text-gray-300 hover:bg-orange-100 dark:hover:bg-orange-900/50 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  <Navigation className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        <button className="w-full border-2 border-dashed border-neutral-300 dark:border-white/20 text-neutral-500 dark:text-gray-400 rounded-2xl py-4 flex items-center justify-center gap-2 font-medium hover:border-orange-300 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">
          <Plus className="w-5 h-5" /> Thêm bữa ăn phụ
        </button>
      </div>

    </div>
  );
};