import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
   MapPin,
   X,
   Star,
   Utensils,
   Store,
   ChevronRight,
   MessageSquare,
   ThumbsUp,
   Navigation,
   Clock,
   Route,
} from 'lucide-react';
import { formatPrice } from '../../utils/math.utils';
import type { DishDetailResponse } from '../../types';
import { LeafletDetailMap } from '../DetailMap/LeafletDetailMap';
import { groupTasteApiService } from '../../../../services/groupTaste.service';

interface DishDetailProps {
   detail: DishDetailResponse;
   loading?: boolean;
   onClose: () => void;
   onShopClick?: (shop: any) => void;
   userLocation?: { lat: number; lng: number };
   users?: any[];
}

/**
 * DishDetail — Refactored to SIDE-BY-SIDE Layout.
 * Left: Information (ShopeeFood Style)
 * Right: Map (Leaflet)
 */
export const DishDetail: React.FC<DishDetailProps> = ({
   detail,
   onClose,
   onShopClick,
   userLocation,
   users = []
}) => {
   const [currentDetail, setCurrentDetail] = useState<DishDetailResponse>(detail);
   const [isLoadingContent, setIsLoadingContent] = useState(false);
   const scrollContainerRef = React.useRef<HTMLDivElement>(null);

   const { selectedFood, shop, dish, restaurant, menu, relatedFoods, recommendedShops, map: mapData } = currentDetail;

   const currentDish = selectedFood || dish;
   const currentShop = shop || restaurant;
   const currentDescription = (currentDish as any)?.description || "Thưởng thức hương vị ẩm thực tinh tế, món ăn được chế biến từ những nguyên liệu tươi ngon nhất trong ngày.";

   // Sync with prop when it changes (e.g. when opening a new dish modal from outside)
   useEffect(() => {
      const propDishId = detail.selectedFood?.id || detail.dish?.id;
      const currentDishId = currentDetail.selectedFood?.id || currentDetail.dish?.id;
      
      if (propDishId !== currentDishId) {
         setCurrentDetail(detail);
      }
   }, [detail]);

   // Load new dish or shop
   const handleFoodClick = async (food: any) => {
      scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      setIsLoadingContent(true);
      try {
         // If related food has shop id, use it. Otherwise use current shop
         const restaurantId = food.shop?.id || (currentShop as any)?.id || (currentShop as any)?.restaurantId;
         if (!restaurantId) throw new Error('Không tìm thấy ID nhà hàng');
         const data = await groupTasteApiService.getDishDetail(restaurantId, food.id, userLocation || { lat: 10.7626, lng: 106.6602 }, users);
         setCurrentDetail(data);
      } catch (error: any) {
         console.error(`Lỗi khi truy vấn Data Connect cho món ăn: ${error.message}`);
      } finally {
         setIsLoadingContent(false);
      }
   };

   const handleShopClick = async (rs: any) => {
      if (onShopClick) {
         onShopClick(rs);
      }
   };

   if (!currentDish || !currentShop) return null;

   const dishImage = `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80`;

    const selectedForMap = {
       id: (currentShop as any)?.id || 'selected-shop',
       name: currentShop?.name || 'Nhà hàng',
       lat: currentShop?.lat || 10.762622,
       lng: currentShop?.lng || 106.660172,
       rating: currentShop?.rating || 4.0,
    };

   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         className="w-full h-full relative bg-white flex flex-col lg:flex-row overflow-hidden"
      >
         {/* ─── LEFT COLUMN: INFORMATION (Scrollable) ─── */}
         <div ref={scrollContainerRef} className="w-full lg:w-[55%] h-full overflow-y-auto bg-white relative custom-scrollbar flex flex-col">

            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button
                     onClick={onClose}
                     className="p-2 hover:bg-neutral-50 rounded-full transition-colors"
                  >
                     <X className="w-6 h-6 text-slate-400" />
                  </button>
                  <div>
                     <h2 className="text-sm font-black text-slate-800 truncate max-w-[200px] uppercase tracking-tighter">CHI TIẾT MÓN ĂN</h2>
                  </div>
               </div>
            </div>

            <div className="p-6 lg:p-10 space-y-12 flex-1">
               {/* Main Dish Info */}
               <section className="space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                     <div className="w-full md:w-48 aspect-square rounded-3xl overflow-hidden shadow-xl border border-neutral-100 shrink-0 bg-neutral-50">
                        <img src={dishImage} alt={currentDish.name} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1 space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                           <ThumbsUp className="w-3.5 h-3.5" /> ĐỀ XUẤT
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 leading-tight">{currentDish?.name || 'Tên món ăn'}</h1>
                        <div className="flex items-center gap-4">
                           <span className="text-2xl font-black text-emerald-600">{formatPrice(currentDish?.price || 0)}</span>
                           <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full text-amber-600 font-bold text-sm">
                              <Star className="w-4 h-4 fill-amber-500" />
                              {currentDish.rating?.toFixed(1) || '4.5'}
                           </div>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
                           {currentDescription}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2">
                           {currentDish?.tags?.map((t: string) => (
                              <span key={t} className="px-2 py-1 bg-neutral-100 text-slate-500 rounded-md text-[9px] font-bold uppercase tracking-widest">
                                 #{t}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>
               </section>

               {/* Restaurant Info */}
               <section className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 space-y-6">
                  <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">
                     <Store className="w-4 h-4" /> THÔNG TIN NHÀ HÀNG
                  </div>
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                     <div className="space-y-3">
                        <h3 className="text-2xl font-black text-slate-900">{currentShop?.name || 'Tên nhà hàng'}</h3>
                        <p className="text-sm text-slate-500 flex items-start gap-2 max-w-sm">
                           <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                           {currentShop?.address || 'Quận 1, Thành phố Hồ Chí Minh'}
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                              <Clock className="w-4 h-4 text-blue-400" /> {currentShop?.openingHours || '08:00 - 22:00'}
                           </div>
                           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                              <MessageSquare className="w-4 h-4 text-emerald-400" /> {currentShop?.totalReviews || '120'} đánh giá
                           </div>
                        </div>
                     </div>

                     {mapData && (
                        <div className="flex flex-col gap-2">
                           <div className="px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                                 <Route className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khoảng cách</p>
                                 <p className="text-sm font-black text-slate-800">{mapData?.distance || '0.0 km'}</p>
                              </div>
                           </div>
                           <div className="px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
                                 <Clock className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</p>
                                 <p className="text-sm font-black text-slate-800">{mapData?.duration || '0 phút'}</p>
                              </div>
                           </div>
                        </div>
                     )}
                  </div>
               </section>

               {/* Menu Section */}
               {menu && menu.length > 0 && (
                  <section className="space-y-6">
                     <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                        <Utensils className="w-5 h-5 text-orange-500" /> THỰC ĐƠN QUÁN
                     </h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menu?.map((m) => (
                           <div key={m.id} className="p-4 bg-white rounded-2xl border border-neutral-100 hover:border-orange-200 hover:shadow-lg transition-all flex items-center gap-4 group">
                              <div className="w-14 h-14 bg-neutral-100 rounded-xl overflow-hidden shrink-0">
                                 <img src={`https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                              </div>
                              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleFoodClick(m)}>
                                 <p className="font-bold text-slate-800 text-sm truncate">{m.name}</p>
                                 <p className="font-black text-emerald-600 text-xs mt-1">{formatPrice(m.price)}</p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </section>
               )}

               {/* Recommendations (Horizontal lists) */}
               <section className="space-y-10 pt-6">
                  <div className="space-y-6">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between">
                        MÓN ĂN TƯƠNG TỰ
                        <ChevronRight className="w-4 h-4" />
                     </h4>
                     <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {relatedFoods?.map(f => (
                           <div key={f.id} className="w-40 shrink-0 space-y-3 cursor-pointer group" onClick={() => handleFoodClick(f)}>
                              <div className="aspect-square rounded-2xl overflow-hidden bg-neutral-100">
                                 <img src={`https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="" />
                              </div>
                              <p className="text-xs font-bold text-slate-800 truncate">{f.name || 'Món ăn'}</p>
                              <p className="text-[10px] font-black text-orange-500">{formatPrice(f.price || 0)}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-6">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between">
                        NHÀ HÀNG TƯƠNG TỰ
                        <ChevronRight className="w-4 h-4" />
                     </h4>
                     <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {recommendedShops?.map(rs => (
                           <div key={rs.id} className="w-48 shrink-0 p-4 bg-white rounded-2xl border border-neutral-100 hover:shadow-xl transition-all space-y-3 cursor-pointer" onClick={() => handleShopClick(rs)}>
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                 <Store className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-black text-slate-800 truncate">{rs.name}</p>
                              <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                                 <Star className="w-3 h-3 fill-amber-500" /> {rs.rating?.toFixed(1) || '4.0'}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </section>

               <footer className="py-12 border-t border-neutral-100 text-center">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">HƯƠNG VỊ BẢN ĐỊA</p>
               </footer>
            </div>
         </div>

         {/* ─── RIGHT COLUMN: MAP (Fixed/Side-by-Side) ─── */}
         <div className="w-full lg:w-[45%] h-[400px] lg:h-full bg-neutral-100 relative">
            {isLoadingContent && (
               <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-1000">
                  <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
               </div>
            )}
            <LeafletDetailMap
               userLocation={userLocation}
               selectedRestaurant={selectedForMap}
            />

            {/* Mobile Map Expand/Indicator */}
            <div className="lg:hidden absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
               <Navigation className="w-3 h-3" /> Chỉ đường bản đồ
            </div>
         </div>

      </motion.div>
   );
};
