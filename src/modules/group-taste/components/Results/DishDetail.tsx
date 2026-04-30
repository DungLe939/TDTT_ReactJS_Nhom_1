import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, Utensils, Store, Clock, Navigation, Route } from 'lucide-react';
import { formatPrice } from '../../utils/math.utils';
import type { DishDetailResponse } from '../../types';
import { GoongDetailMap } from '../DetailMap/GoongDetailMap';
import { groupTasteApiService } from '../../../../services/groupTaste.service';

interface DishDetailProps {
  detail: DishDetailResponse;
  loading?: boolean;
  onClose: () => void;
  onShopClick?: (shop: any) => void;
  userLocation?: { lat: number; lng: number };
  users?: any[];
}

/** Lấy URL ảnh món ăn, fallback về ảnh đồ ăn mặc định nếu trống */
const getDishImageUrl = (item: any): string => {
  const url = item?.image_url || item?.imageUrl;
  if (url && url.startsWith('http')) return url;
  return `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80`;
};

/** Format giờ mở cửa từ opening_hours object hoặc string */
const formatOpeningHours = (opening_hours?: { open?: string; close?: string } | string | null): string => {
  if (!opening_hours) return 'Không rõ giờ mở cửa';
  if (typeof opening_hours === 'string') return opening_hours;
  const { open, close } = opening_hours;
  if (open && close) return `${open} - ${close}`;
  if (open) return `Mở lúc ${open}`;
  return 'Không rõ giờ mở cửa';
};

/** Modal xem chi tiết một món ăn đơn lẻ */
const FoodDetailModal: React.FC<{ food: any; onClose: () => void }> = ({ food, onClose }) => {
  const imgUrl = getDishImageUrl(food);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {imgUrl && (
          <div className="w-full h-52 overflow-hidden">
            <img
              src={imgUrl}
              alt={food.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=80`;
              }}
            />
          </div>
        )}
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-black text-slate-900">{food.name}</h3>
          {food.description && (
            <p className="text-sm text-slate-500 leading-relaxed">{food.description}</p>
          )}
          <p className="text-xl font-black text-orange-600">{formatPrice(food.price || 0)}</p>
          {food.category && (
            <span className="inline-block px-3 py-1 bg-orange-50 text-orange-600 text-xs font-bold rounded-full">
              {food.category}
            </span>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-colors mt-2"
          >
            Đóng
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const DishDetail: React.FC<DishDetailProps> = ({
  detail,
  onClose,
  onShopClick,
  userLocation,
  users = [],
}) => {
  const [currentDetail, setCurrentDetail] = useState<DishDetailResponse>(detail);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [modalFood, setModalFood] = useState<any | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const { selectedFood, shop, dish, restaurant, menu, relatedFoods, recommendedShops, map: mapData } = currentDetail;

  const currentDish = selectedFood || dish;
  const currentShop = shop || restaurant;
  const currentDescription = (currentDish as any)?.description;

  // Ảnh món ăn từ data thật
  const dishImgUrl = getDishImageUrl(currentDish);

  // Giờ mở cửa
  const openingHoursText = formatOpeningHours(
    (currentShop as any)?.opening_hours || (currentShop as any)?.openingHours
  );

  // Sync khi prop thay đổi
  useEffect(() => {
    const propDishId = detail.selectedFood?.id || detail.dish?.id;
    const currentDishId = currentDetail.selectedFood?.id || currentDetail.dish?.id;
    if (propDishId !== currentDishId) {
      setCurrentDetail(detail);
    }
  }, [detail]);

  const handleFoodClick = async (food: any) => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setIsLoadingContent(true);
    try {
      const restaurantId = food.shop?.id || (currentShop as any)?.id;
      if (!restaurantId) throw new Error('Không tìm thấy ID nhà hàng');
      const data = await groupTasteApiService.getDishDetail(
        restaurantId,
        food.id,
        userLocation || { lat: 10.7626, lng: 106.6602 },
        users,
      );
      setCurrentDetail(data);
    } catch (error: any) {
      // ignore error
    } finally {
      setIsLoadingContent(false);
    }
  };

  if (!currentDish || !currentShop) return null;

  const selectedForMap = {
    id: (currentShop as any)?.id || 'selected-shop',
    name: currentShop?.name || 'Nhà hàng',
    lat: (currentShop as any)?.lat || 10.762622,
    lng: (currentShop as any)?.lng || 106.660172,
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="w-full h-full relative bg-white flex flex-col lg:flex-row overflow-hidden"
    >
      {/* Modal chi tiết món ăn */}
      <AnimatePresence>
        {modalFood && <FoodDetailModal food={modalFood} onClose={() => setModalFood(null)} />}
      </AnimatePresence>

      {/* ─── LEFT COLUMN: INFORMATION (Scrollable) ─── */}
      <div ref={scrollContainerRef} className="w-full lg:w-[55%] h-full overflow-y-auto bg-white relative custom-scrollbar flex flex-col">

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 px-5 py-3.5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-sm font-black text-slate-800 truncate uppercase tracking-widest">CHI TIẾT MÓN ĂN</h2>
        </div>

        <div className="flex-1 flex flex-col">

          {/* ── DISH INFO ── */}
          <div className="p-5 flex gap-4 items-start border-b border-neutral-100">
            {/* Ảnh món ăn */}
            {dishImgUrl ? (
              <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden shrink-0 bg-neutral-100">
                <img
                  src={dishImgUrl}
                  alt={currentDish.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = `https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=500&q=80`;
                  }}
                />
              </div>
            ) : (
              <div className="w-[120px] h-[120px] rounded-2xl shrink-0 bg-orange-50 flex items-center justify-center">
                <Utensils className="w-8 h-8 text-orange-300" />
              </div>
            )}

            {/* Thông tin */}
            <div className="flex-1 min-w-0 space-y-2">
              <span className="inline-block px-2.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                ĐỀ XUẤT
              </span>
              <h1 className="text-lg font-black text-slate-900 leading-tight">{currentDish?.name}</h1>
              <p className="text-lg font-black text-orange-600">{formatPrice(currentDish?.price || 0)}</p>
              {currentDescription && (
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{currentDescription}</p>
              )}
              {(currentDish as any)?.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {(currentDish as any).tags.map((t: string) => (
                    <span key={t} className="px-2 py-0.5 bg-neutral-100 text-slate-500 rounded text-[9px] font-bold">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RESTAURANT INFO ── */}
          <div className="p-5 border-b border-neutral-100 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" /> THÔNG TIN NHÀ HÀNG
            </p>
            <h3 className="font-black text-slate-900 text-base">{currentShop?.name}</h3>
            {currentShop?.address && (
              <p className="text-sm text-slate-500 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                {currentShop.address}
              </p>
            )}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              {openingHoursText}
            </div>
            {/* Khoảng cách */}
            {mapData && (
              <div className="flex gap-3 pt-1">
                <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-xl text-xs font-bold text-orange-700">
                  <Route className="w-3.5 h-3.5" /> {mapData.distance}
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl text-xs font-bold text-blue-700">
                  <Clock className="w-3.5 h-3.5" /> {mapData.duration}
                </div>
              </div>
            )}
          </div>

          {/* ── MENU (max-height scroll) ── */}
          {menu && menu.length > 0 && (
            <div className="p-5 border-b border-neutral-100">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-500" /> THỰC ĐƠN QUÁN
              </h3>
              <div
                className="space-y-2 overflow-y-auto custom-scrollbar pr-1"
                style={{ maxHeight: '400px' }}
              >
                {menu.map((m) => {
                  const mImg = getDishImageUrl(m);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setModalFood(m)}
                      className="w-full flex items-center gap-3 p-3 bg-neutral-50 hover:bg-orange-50 rounded-2xl transition-colors group text-left"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-200">
                        {mImg ? (
                          <img
                            src={mImg}
                            alt={m.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-400">
                            <Utensils className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate group-hover:text-orange-600 transition-colors">{m.name}</p>
                        {m.description && <p className="text-xs text-slate-400 truncate">{m.description}</p>}
                        <p className="text-sm font-black text-orange-600 mt-0.5">{formatPrice(m.price || 0)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── MÓN ĂN TƯƠNG TỰ ── */}
          {relatedFoods && relatedFoods.length > 0 && (
            <div className="p-5 border-b border-neutral-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">MÓN ĂN TƯƠNG TỰ</p>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {relatedFoods.map((f) => {
                  const fImg = getDishImageUrl(f);
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleFoodClick(f)}
                      className="w-36 shrink-0 text-left group"
                    >
                      <div className="w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100 mb-2">
                        {fImg ? (
                          <img
                            src={fImg}
                            alt={f.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = `https://images.unsplash.com/photo-1476224489421-4ac359f47d7b?w=500&q=80`;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300">
                            <Utensils className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-800 truncate">{f.name}</p>
                      <p className="text-[11px] font-black text-orange-500">{formatPrice(f.price || 0)}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── NHÀ HÀNG TƯƠNG TỰ ── */}
          {recommendedShops && recommendedShops.length > 0 && (
            <div className="p-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">NHÀ HÀNG TƯƠNG TỰ</p>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {recommendedShops.map((rs) => (
                  <button
                    key={rs.id}
                    onClick={() => onShopClick?.(rs)}
                    className="w-44 shrink-0 p-3 bg-white border border-neutral-100 hover:border-orange-200 hover:shadow-md rounded-2xl transition-all text-left space-y-1.5"
                  >
                    {rs.cover_image ? (
                      <div className="w-full h-20 rounded-xl overflow-hidden">
                        <img 
                          src={rs.cover_image} 
                          alt={rs.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80'; }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-20 rounded-xl bg-blue-50 flex items-center justify-center">
                        <Store className="w-6 h-6 text-blue-400" />
                      </div>
                    )}
                    <p className="text-xs font-black text-slate-800 truncate">{rs.name}</p>
                    {rs.address && <p className="text-[10px] text-slate-400 truncate">{rs.address}</p>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT COLUMN: MAP ─── */}
      <div className="w-full lg:w-[45%] h-[360px] lg:h-full bg-neutral-100 relative">
        {isLoadingContent && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-20">
            <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
          </div>
        )}
        <GoongDetailMap userLocation={userLocation} selectedRestaurant={selectedForMap} />
        <div className="lg:hidden absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
          <Navigation className="w-3 h-3" /> Chỉ đường
        </div>
      </div>
    </motion.div>
  );
};
