import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Star,
  DollarSign,
  BarChart3,
  Users,
  Check,
  ChevronDown,
  MapPin,
  Trophy,
  Navigation,
  Tag,
} from 'lucide-react';
import { formatPrice, toPercent } from '../utils/math.utils';
import type { ScoreResult, GroupRecommendationResponse, Restaurant } from '../types';

interface RestaurantListProps {
  result: GroupRecommendationResponse | null;
  loading: boolean;
  error: string | null;
  onRestaurantClick?: (restaurant: Restaurant) => void;
  selectedRestaurant?: Restaurant | null;
  onRestaurantHover?: (id: string | null) => void;
}


const RESTAURANT_IMAGES: Record<string, string> = {
  r1: 'https://images.unsplash.com/photo-1544025162-811114bd4b2b?auto=format&fit=crop&q=80&w=200&h=200',
  r2: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=200&h=200',
  r3: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80&w=200&h=200',
  r4: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&q=80&w=200&h=200',
  r5: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&q=80&w=200&h=200',
  r6: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=200&h=200',
  r7: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=200&h=200',
  r8: 'https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&q=80&w=200&h=200',
};

export const RestaurantList: React.FC<RestaurantListProps> = ({
  result,
  loading,
  error,
  onRestaurantClick,
  selectedRestaurant,
  onRestaurantHover,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  const { recommendations, totalCandidates, filteredCount } = result;

  if (recommendations?.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-orange-50 p-8 rounded-2xl text-center border border-orange-100"
      >
        <MapPin className="w-10 h-10 text-orange-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-neutral-800 mb-1">Không tìm thấy kết quả</h3>
        <p className="text-neutral-500 text-sm">
          Không có nhà hàng phù hợp với tất cả thành viên. Hãy thử điều chỉnh ngân sách hoặc khẩu vị!
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* Stats summary */}
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-neutral-800 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-orange-500" />
          Đề xuất hàng đầu
        </h2>
        <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-1 rounded-lg">
          {filteredCount ?? 0}/{totalCandidates ?? 0} quán phù hợp
        </span>
      </div>

      {/* Restaurant cards */}
      {recommendations?.map((scored: ScoreResult, index: number) => {
        const { restaurant, finalScore, avgSimilarity, minSimilarity, userScores } = scored;
        const isTop = index === 0;
        const scorePercent = toPercent(finalScore);
        const imageUrl = RESTAURANT_IMAGES[restaurant?.id] ?? null;
        const isExpanded = expandedId === restaurant?.id;

        return (
          <motion.div
            key={restaurant?.id ?? index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.03, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.2, ease: 'easeOut', delay: index * 0.05 }}
            layout
            onClick={() => onRestaurantClick?.(restaurant)}
            onMouseEnter={() => onRestaurantHover?.(restaurant?.id ?? null)}
            onMouseLeave={() => onRestaurantHover?.(null)}
            className={`bg-white rounded-2xl p-4 cursor-pointer relative overflow-hidden transition-all duration-300 ${
              selectedRestaurant?.id === restaurant?.id
                ? 'border-2 border-blue-400 ring-4 ring-blue-50 bg-blue-50/50 scale-[1.02]'
                : isTop
                  ? 'border-2 border-orange-200 ring-2 ring-orange-50 hover:bg-orange-50/50 hover:border-orange-300'
                  : 'border border-neutral-100 hover:bg-neutral-50 hover:border-neutral-200 hover:shadow-md'
            }`}
          >
            {/* Score badge */}
            <div
              className={`absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-lg ${
                scorePercent >= 70
                  ? 'bg-orange-500'
                  : scorePercent >= 50
                    ? 'bg-amber-500'
                    : 'bg-neutral-400'
              }`}
            >
              {scorePercent}%
            </div>

            {/* Main content */}
            <div className="flex gap-4 mt-1">
              <div className="w-16 h-16 bg-neutral-200 rounded-xl overflow-hidden shrink-0">
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt={restaurant?.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-neutral-800 ${isTop ? 'text-lg' : 'text-base'}`}>
                  {isTop && <span className="text-orange-500 mr-1">🏆</span>}
                  {restaurant?.name ?? 'Không tên'}
                </h3>
                <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" /> {restaurant?.rating?.toFixed(1) ?? 'N/A'}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {formatPrice(restaurant?.price ?? 0)}
                  </span>
                  {restaurant?.distance != null && (
                    <span className="flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-blue-400" />
                      {restaurant.distance < 1
                        ? `${Math.round(restaurant.distance * 1000)}m`
                        : `${restaurant.distance.toFixed(1)}km`}
                    </span>
                  )}
                </div>

                {/* Tags */}
                {restaurant?.tags && restaurant.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {restaurant.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[10px] font-medium"
                      >
                        <Tag className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* User compatibility indicators */}
                {userScores && userScores.length > 0 && (
                  <div className="flex -space-x-1.5 mt-2">
                    {userScores.map((us) => {
                      const good = us?.similarity >= 0.5;
                      return (
                        <div
                          key={us?.userId}
                          className={`w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold ${
                            good ? 'bg-emerald-500' : 'bg-amber-400'
                          }`}
                          title={`${us?.userId}: ${toPercent(us?.similarity ?? 0)}%`}
                        >
                          {good ? <Check className="w-2.5 h-2.5" /> : '?'}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Expand button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedId(isExpanded ? null : (restaurant?.id ?? null));
              }}
              className="w-full mt-3 py-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {isExpanded ? 'Ẩn chi tiết' : 'Xem chi tiết điểm'}
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Detail panel */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 mt-3 border-t border-neutral-100 space-y-3">
                    {/* Score breakdown */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-orange-50 p-2 rounded-lg text-center">
                        <div className="text-neutral-500 mb-1">Điểm tổng hợp</div>
                        <div className="font-bold text-orange-600 text-lg">{scorePercent}%</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg text-center">
                        <div className="text-neutral-500 mb-1">TB nhóm</div>
                        <div className="font-bold text-blue-600 text-lg">
                          {toPercent(avgSimilarity ?? 0)}%
                        </div>
                      </div>
                      <div className="bg-emerald-50 p-2 rounded-lg text-center">
                        <div className="text-neutral-500 mb-1">Min (Least Misery)</div>
                        <div className="font-bold text-emerald-600 text-lg">
                          {toPercent(minSimilarity ?? 0)}%
                        </div>
                      </div>
                      <div className="bg-purple-50 p-2 rounded-lg text-center">
                        <div className="text-neutral-500 mb-1">Khoảng cách</div>
                        <div className="font-bold text-purple-600">
                          {restaurant?.distance != null
                            ? restaurant.distance < 1
                              ? `${Math.round(restaurant.distance * 1000)}m`
                              : `${restaurant.distance.toFixed(2)}km`
                            : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Per-user scores */}
                    {userScores && userScores.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-500 mb-2 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Điểm từng thành viên
                        </h4>
                        {userScores.map((us) => {
                          const pct = toPercent(us?.similarity ?? 0);
                          return (
                            <div key={us?.userId} className="flex items-center gap-2 mb-1.5">
                              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                                {(us?.userId ?? '?').charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs text-neutral-600 w-12 truncate">
                                {us?.userId ?? 'N/A'}
                              </span>
                              <div className="flex-1 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.6, delay: 0.1 }}
                                  className={`h-full rounded-full ${
                                    pct >= 70
                                      ? 'bg-emerald-500'
                                      : pct >= 50
                                        ? 'bg-amber-400'
                                        : 'bg-red-400'
                                  }`}
                                />
                              </div>
                              <span className="text-xs font-bold text-neutral-700 w-8 text-right">
                                {pct}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
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
