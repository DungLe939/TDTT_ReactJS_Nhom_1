import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, X, Store, Clock, Utensils, Navigation } from 'lucide-react';
import { formatPrice } from '../../utils/math.utils';
import { groupTasteApiService } from '../../../../services/groupTaste.service';
import { GoongDetailMap } from '../DetailMap/GoongDetailMap';

interface RestaurantDetailProps {
  restaurant: {
    id: string;
    name: string;
    address?: string;
    cover_image?: string;
    lat?: number;
    lng?: number;
    opening_hours?: { open?: string; close?: string } | string;
    openingHours?: string;
  };
  onClose: () => void;
  onDishClick?: (dish: any) => void;
  onShopClick?: (shop: any) => void;
  userLocation?: { lat: number; lng: number };
}

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
  const imgUrl = food?.image_url || food?.imageUrl || '';
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

export const RestaurantDetail: React.FC<RestaurantDetailProps> = ({
  restaurant,
  onClose,
  onDishClick,
  onShopClick,
  userLocation,
}) => {
  const [loadingMenu, setLoadingMenu] = useState(true);
  const [menu, setMenu] = useState<any[]>([]);
  const [similarRestaurants, setSimilarRestaurants] = useState<any[]>([]);
  const [currentShop, setCurrentShop] = useState<any>(restaurant);
  const [modalFood, setModalFood] = useState<any | null>(null);

  // Sync khi prop restaurant thay đổi
  useEffect(() => {
    setCurrentShop(restaurant);
    setMenu([]);
    setSimilarRestaurants([]);
  }, [restaurant]);

  // Fetch chi tiết nhà hàng + menu
  useEffect(() => {
    const fetchMenuAndShop = async () => {
      setLoadingMenu(true);
      try {
        const data = await groupTasteApiService.getRestaurantDetail(
          restaurant.id,
          userLocation?.lat,
          userLocation?.lng,
        );
        if (data) {
          setMenu(data.menu || []);
          setCurrentShop((prev: any) => ({ ...prev, ...data }));
        }
      } catch (error) {
        // ignore error
      } finally {
        setLoadingMenu(false);
      }
    };

    const fetchSimilar = async () => {
      try {
        const data = await groupTasteApiService.getSimilarRestaurants(restaurant.id);
        setSimilarRestaurants(data || []);
      } catch (error) {
        // ignore error
      }
    };

    fetchMenuAndShop();
    fetchSimilar();
  }, [restaurant.id]);

  const coverImage = currentShop?.cover_image || restaurant.cover_image || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80`;
  const openingHoursText = formatOpeningHours(
    currentShop?.opening_hours || restaurant.opening_hours || currentShop?.openingHours
  );

  const selectedForMap = {
    id: currentShop?.id || restaurant.id || 'selected-shop',
    name: currentShop?.name || restaurant.name,
    lat: currentShop?.lat || restaurant.lat || 10.762622,
    lng: currentShop?.lng || restaurant.lng || 106.660172,
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

      {/* ─── LEFT COLUMN: INFORMATION ─── */}
      <div className="w-full lg:w-[55%] h-full overflow-y-auto bg-white relative custom-scrollbar flex flex-col">

        {/* Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-neutral-100 px-5 py-3.5 flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest truncate flex items-center gap-2">
            <Store className="w-4 h-4 text-orange-500" /> Thông tin nhà hàng
          </h2>
        </div>

        <div className="flex-1 flex flex-col">

          {/* ── Cover Image ── */}
          {coverImage && (
            <div className="w-full h-52 overflow-hidden relative shrink-0">
              <img
                src={coverImage}
                alt={currentShop?.name || restaurant.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5">
                <h1 className="text-2xl font-black text-white leading-tight drop-shadow">
                  {currentShop?.name || restaurant.name}
                </h1>
              </div>
            </div>
          )}

          {/* ── Shop Info ── */}
          <div className="p-5 border-b border-neutral-100 space-y-3">
            {!coverImage && (
              <h1 className="text-xl font-black text-slate-900">{currentShop?.name || restaurant.name}</h1>
            )}
            {(currentShop?.address || restaurant.address) && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">{currentShop?.address || restaurant.address}</p>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <Clock className="w-4 h-4 text-blue-500 shrink-0" />
              {openingHoursText}
            </div>
            {/* Price range nếu có */}
            {currentShop?.price_range?.display && (
              <p className="text-sm font-bold text-emerald-600">
                Khoảng giá: {currentShop.price_range.display}
              </p>
            )}
          </div>

          {/* ── MENU ── */}
          <div className="p-5 border-b border-neutral-100">
            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-500" /> Thực đơn
            </h3>

            {loadingMenu ? (
              <div className="flex justify-center py-8">
                <div className="w-7 h-7 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
              </div>
            ) : menu && menu.length > 0 ? (
              <div
                className="space-y-2 overflow-y-auto custom-scrollbar pr-1"
                style={{ maxHeight: '400px' }}
              >
                {menu.map((item: any, idx: number) => {
                  const imgUrl = item?.image_url || item?.imageUrl || '';
                  return (
                    <button
                      key={item.id || idx}
                      onClick={() => {
                        if (onDishClick) {
                          onDishClick({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            restaurant: { id: currentShop?.id || restaurant.id, name: currentShop?.name || restaurant.name },
                          });
                        } else {
                          setModalFood(item);
                        }
                      }}
                      className="w-full flex items-center gap-3 p-3 bg-neutral-50 hover:bg-orange-50 rounded-2xl transition-colors group text-left"
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-200">
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={item.name}
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
                        <p className="font-bold text-slate-800 text-sm truncate group-hover:text-orange-600 transition-colors">{item.name}</p>
                        {item.description && (
                          <p className="text-xs text-slate-400 truncate">{item.description}</p>
                        )}
                        <p className="text-sm font-black text-orange-600 mt-0.5">{formatPrice(item.price || 0)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-neutral-50 rounded-2xl">
                <p className="text-sm text-slate-400 font-medium">Chưa có thông tin thực đơn.</p>
              </div>
            )}
          </div>

          {/* ── NHÀ HÀNG TƯƠNG TỰ ── */}
          {similarRestaurants && similarRestaurants.length > 0 && (
            <div className="p-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">NHÀ HÀNG TƯƠNG TỰ</p>
              <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                {similarRestaurants.map((rs) => (
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
        <GoongDetailMap userLocation={userLocation} selectedRestaurant={selectedForMap} />
        <div className="lg:hidden absolute top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-1.5">
          <Navigation className="w-3 h-3" /> Bản đồ chỉ đường
        </div>
      </div>
    </motion.div>
  );
};
