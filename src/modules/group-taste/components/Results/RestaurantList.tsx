import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  DollarSign,
  BarChart3,
  Users,
  ChevronDown,
  MapPin,
  Trophy,
  Tag,
  ChefHat,
  Route,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';
import { formatPrice, toPercent } from '../../utils/math.utils';
import type { GroupRecommendationResponse, DishInfo } from '../../types';
import type { GroupUser } from '../../hooks/useGroupTaste';

interface RestaurantListProps {
  result: GroupRecommendationResponse | null;
  loading: boolean;
  error: string | null;
  users: GroupUser[];
  /** Dish đang được chọn (để highlight card) */
  selectedDish?: DishInfo | null;
  /** Callback khi click vào 1 món ăn */
  onDishClick?: (dish: DishInfo) => void;
  /** Danh sách dị ứng */
  allergies?: string[];
}

/** Fallback images theo index */
const DISH_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=200&h=200',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=200&h=200',
];

export const RestaurantList: React.FC<RestaurantListProps> = ({
  result,
  loading,
  error,
  users,
  onDishClick,
  selectedDish,
  allergies = [],
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);


  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-14 h-14 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
        <p className="font-medium text-neutral-600 animate-pulse text-sm">
          Đang tính toán dung hòa khẩu vị nhóm...
        </p>
      </div>
    );
  }

  /* ─── Error state ─── */
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 text-red-600 p-5 rounded-2xl text-center border border-red-200"
      >
        <p className="font-medium text-sm">{error}</p>
        <p className="text-xs mt-1 text-red-400">Vui lòng thử lại hoặc kiểm tra kết nối mạng.</p>
      </motion.div>
    );
  }

  if (!result) return null;

  const dishes: DishInfo[] = Array.isArray(result.dishes) ? result.dishes : [];
  const totalCandidates = result.totalCandidates ?? 0;
  const filteredCount = result.filteredCount ?? 0;

  // Allergy filtering logic
  const checkIsUnsafe = (dish: DishInfo) => {
    if (!allergies || allergies.length === 0) return false;
    const tagsStr = (dish.tags || []).join(' ');
    const searchStr = `${dish.name || ''} ${tagsStr}`.toLowerCase();
    return allergies.some(allergy => allergy && searchStr.includes(allergy.toLowerCase()));
  };

  // Only show safe dishes or highlight them? User said both.
  // I'll show all but mark unsafe ones clearly. 
  // Optionally filter strictly:
  // const safeDishes = dishes.filter(d => !checkIsUnsafe(d));

  /* ─── Empty state ─── */
  if (dishes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-orange-50 p-8 rounded-2xl text-center border border-orange-100"
      >
        <MapPin className="w-10 h-10 text-orange-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-neutral-800 mb-1">Không tìm thấy món ăn nào</h3>
        <p className="text-neutral-500 text-sm">
          Không có món ăn phù hợp với yêu cầu của nhóm. Hãy thử điều chỉnh ngân sách hoặc khẩu vị!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

      {/* Stats header */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-500" />
          Món ăn đề xuất
        </h2>
        <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg">
          {filteredCount}/{totalCandidates} món phù hợp
        </span>
      </div>

      {/* Dish cards */}
      {dishes.map((dish: DishInfo, index: number) => {
        const isTop = index === 0;
        const isSelected = selectedDish?.id === dish.id;
        const isExpanded = expandedId === dish.id;

        // Recommendation fields từ backend
        // Xử lý linh hoạt: matchPercentage (0-100), score (0-1), hoặc finalScore (0-1)
        // Priority: matchPercentage > score (0-1) > finalScore
        const rawScore = dish.matchPercentage ?? 
                         ((dish.score !== undefined) ? dish.score * 100 : 
                         ((dish.finalScore !== undefined) ? (dish.finalScore <= 1.1 ? dish.finalScore * 100 : dish.finalScore) : 0));
          
        // Clamp 0-100 and round for UI
        const displayScore = Math.min(100, Math.max(0, Math.round(rawScore)));
        
        const distanceKm = dish.distance;
        const avgGroupRating = dish.avgGroupRating;
        const reasons = dish.matchedReasons ?? [];

        // Ưu tiên ảnh từ dữ liệu thật
        const realImageUrl = dish.image_url || dish.imageUrl;
        const imageUrl = (realImageUrl && realImageUrl.startsWith('http')) 
          ? realImageUrl 
          : DISH_IMAGES[index % DISH_IMAGES.length];

        return (
          <motion.div
            key={dish.id ?? index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
              scale: 1.015,
              boxShadow: '0 12px 28px -5px rgba(0,0,0,0.12)',
            }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.05 }}
            layout
            onClick={() => onDishClick?.(dish)}
            className={`bg-white rounded-2xl p-5 cursor-pointer relative overflow-hidden transition-all duration-300 ${
              isSelected
                ? 'border-2 border-orange-500 ring-4 ring-orange-100 shadow-xl'
                : isTop
                  ? 'border-2 border-orange-300 shadow-lg'
                  : 'border border-neutral-100 hover:border-neutral-200'
            }`}
          >
            {/* Score badge */}
            <div
              className={`absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10 ${
                displayScore >= 70
                  ? 'bg-orange-600'
                  : displayScore >= 50
                    ? 'bg-amber-500'
                    : 'bg-neutral-400'
              }`}
            >
              {displayScore}%
            </div>

            {/* Allergy Warning Badge */}
            {checkIsUnsafe(dish) && (
              <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-br-xl z-20 shadow-lg animate-pulse flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> CẢNH BÁO DỊ ỨNG
              </div>
            )}

            {/* Click hint when selected */}
            {isSelected && (
              <div className="absolute top-0 left-0 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10">
                ĐÃ CHỌN
              </div>
            )}

            {/* Main content row */}
            <div className="flex gap-4 mt-1">
              {/* Thumbnail */}
              <div className="w-20 h-20 bg-neutral-200 rounded-xl overflow-hidden shrink-0">
                <img
                  src={imageUrl}
                  alt={dish.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = DISH_IMAGES[index % DISH_IMAGES.length];
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className={`font-black text-slate-800 truncate ${isTop ? 'text-xl' : 'text-lg'}`}>
                  {isTop && <span className="text-orange-500 mr-1">🏆</span>}
                  {dish.name ?? 'Không tên món'}
                </h3>

                {/* Restaurant name */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 mt-0.5 uppercase tracking-wide">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{dish.restaurant?.name ?? 'Không rõ nhà hàng'}</span>
                </div>

                {/* Price & Rating */}
                <div className="flex items-center gap-3 text-xs text-neutral-500 mt-2">
                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                    <DollarSign className="w-3 h-3" />
                    {formatPrice(dish.price ?? 0)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    {dish.rating?.toFixed(1) ?? 'N/A'}
                  </span>
                </div>

                {/* Tags */}
                {dish.tags && dish.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dish.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-lg text-[10px] font-bold border border-orange-100"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Match % progress bar */}
            <div className="mt-4 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-slate-400 uppercase tracking-wider">Độ phù hợp nhóm</span>
                <span
                  className={`font-black ${
                    displayScore >= 80 ? 'text-emerald-600' : displayScore >= 60 ? 'text-orange-500' : 'text-amber-500'
                  }`}
                >
                  {displayScore}%
                </span>
              </div>
              <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${displayScore}%` }}
                  transition={{ duration: 0.9, ease: 'easeOut', delay: index * 0.05 + 0.2 }}
                  className={`h-full rounded-full ${
                    displayScore >= 80
                      ? 'bg-linear-to-r from-emerald-400 to-emerald-500'
                      : displayScore >= 60
                        ? 'bg-linear-to-r from-orange-400 to-amber-400'
                        : 'bg-linear-to-r from-amber-300 to-yellow-400'
                  }`}
                />
              </div>
            </div>


            {/* Info pills: Distance + Rating */}
            <div className="flex flex-wrap gap-2 mt-3">
              {distanceKm !== undefined && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                  <Route className="w-2.5 h-2.5" />
                  {distanceKm} km
                </span>
              )}
              {avgGroupRating !== undefined && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                  TB nhóm: {avgGroupRating.toFixed(1)}
                </span>
              )}
            </div>

            {/* matchedReasons badges */}
            {reasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {reasons.map((reason, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full"
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {reason}
                  </span>
                ))}
              </div>
            )}


            {/* User compatibility avatars — chỉ hiển thị nếu có users */}
            {users.length > 0 && (
              <div className="flex -space-x-1.5 mt-3 px-1">
                {users.map((u) => {
                  const approxScore = (displayScore / 100);
                  const good = approxScore >= 0.5;
                  return (
                    <div
                      key={u.id}
                      className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black shadow-sm ${
                        good ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                      title={`${u.name}: ~${toPercent(approxScore)}%`}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedId(isExpanded ? null : dish.id);
              }}
              className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {isExpanded ? 'ẨN CHI TIẾT' : 'PHÂN TÍCH ĐIỂM SỐ'}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Expandable score breakdown */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-4">
                    {/* Score grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div className="bg-orange-50 p-3 rounded-2xl text-center border border-orange-100">
                        <div className="text-neutral-500 mb-1 font-medium">Phù hợp</div>
                        <div className="font-black text-orange-600 text-lg">{displayScore}%</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-2xl text-center border border-blue-100">
                        <div className="text-neutral-500 mb-1 font-medium">Khoảng cách</div>
                        <div className="font-black text-blue-600 text-lg">
                          {distanceKm !== undefined ? `${distanceKm} km` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-2xl text-center border border-emerald-100 col-span-2 lg:col-span-1">
                        <div className="text-neutral-500 mb-1 font-medium">Rating</div>
                        <div className="font-black text-emerald-600 text-lg">
                          ⭐ {dish.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    {/* Per-user bar chart */}
                    {users.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Users className="w-3 h-3" /> Ước tính độ hài lòng từng người
                        </h4>
                        <div className="space-y-2">
                          {users.map((u) => {
                            // Giả lập hoặc dùng matchPct thực tế nếu backend có chi tiết
                            const pct = displayScore; // Use group score as proxy for per-user satisfaction
                            return (
                              <div key={u.id} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[9px] font-black shrink-0">
                                  {u.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-[11px] font-bold text-slate-700 w-20 truncate">
                                  {u.name}
                                </span>
                                <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                    className={`h-full rounded-full ${
                                      pct >= 75
                                        ? 'bg-emerald-500'
                                        : pct >= 50
                                          ? 'bg-amber-400'
                                          : 'bg-red-400'
                                    }`}
                                  />
                                </div>
                                <span className="text-[10px] font-black text-slate-800 w-8 text-right">
                                  {pct}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* CTA hint */}
                    <p className="text-[10px] text-center text-slate-400 font-medium pt-1">
                      <ChefHat className="w-3 h-3 inline mr-1" />
                      Click vào món để xem chi tiết nhà hàng & thực đơn
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
