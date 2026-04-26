import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
   MapPin,
   X,
   Star,
   Store,
   Clock,
   MessageSquare,
   Navigation,
   Utensils,
   ChevronRight,
   Route
} from 'lucide-react';
import { formatPrice } from '../../utils/math.utils';
import { groupTasteApiService } from '../../../../services/groupTaste.service';
import { LeafletDetailMap } from '../DetailMap/LeafletDetailMap';

interface RestaurantDetailProps {
   restaurant: {
      id: string;
      name: string;
      address?: string;
      rating?: number;
   };
   onClose: () => void;
   onDishClick?: (dish: any) => void;
   onShopClick?: (shop: any) => void;
   userLocation?: { lat: number; lng: number };
}

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

   // Update initial UI when prop changes (e.g., clicking similar restaurant)
   useEffect(() => {
      setCurrentShop(restaurant);
      setMenu([]); // Clear old menu
      setSimilarRestaurants([]); // Clear old similar
   }, [restaurant]);

   useEffect(() => {
      const fetchMenuAndShop = async () => {
         setLoadingMenu(true);
         try {
            const data = await groupTasteApiService.getRestaurantDetail(
               restaurant.id,
               userLocation?.lat,
               userLocation?.lng
            );
            if (data) {
               setMenu(data.menu || []);
               setCurrentShop((prev: any) => ({ ...prev, ...data }));
            }
         } catch (error) {
            console.error('Error fetching restaurant detail:', error);
         } finally {
            setLoadingMenu(false);
         }
      };

      const fetchSimilar = async () => {
         try {
            const data = await groupTasteApiService.getSimilarRestaurants(restaurant.id);
            setSimilarRestaurants(data || []);
         } catch (error) {
            console.error('Error fetching similar restaurants:', error);
         }
      };

      fetchMenuAndShop();
      fetchSimilar();
   }, [restaurant.id]);

   const shopImage = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80`;

   const selectedForMap = {
      id: currentShop?.id || 'selected-shop',
      name: currentShop?.name || restaurant.name,
      lat: currentShop?.lat || (restaurant as any).lat || (restaurant as any).location?.lat || 10.762622,
      lng: currentShop?.lng || (restaurant as any).lng || (restaurant as any).location?.lng || 106.660172,
      rating: currentShop?.rating || restaurant.rating || 4.0,
   };

   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 0.95 }}
         className="w-full h-full relative bg-white flex flex-col lg:flex-row overflow-hidden"
      >
         {/* ─── LEFT COLUMN: INFORMATION ─── */}
         <div className="w-full lg:w-[55%] h-full overflow-y-auto bg-white relative custom-scrollbar flex flex-col">
            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <button
                     onClick={onClose}
                     className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition-colors"
                  >
                     <X className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-black text-slate-800 line-clamp-1 flex items-center gap-2">
                     <Store className="w-5 h-5 text-orange-500" />
                     Thông tin nhà hàng
                  </h2>
               </div>
            </div>

            <div className="p-6 md:p-8 flex-1 flex flex-col gap-8 pb-32 lg:pb-8">

               {/* Hero Image */}
               <div className="w-full h-[250px] md:h-[320px] rounded-3xl overflow-hidden relative shadow-lg group shrink-0">
                  <img
                     src={shopImage}
                     alt={currentShop?.name}
                     className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                     onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80'; }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl">
                     <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                     <span className="font-black text-slate-800">{currentShop?.rating?.toFixed(1) || '4.5'}</span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-6 left-6 right-6">
                     <h1 className="text-3xl font-black text-white mb-2 leading-tight drop-shadow-md">
                        {currentShop?.name || restaurant.name}
                     </h1>
                  </div>
               </div>

               {/* Shop Details */}
               <div className="bg-neutral-50 rounded-3xl p-6 border border-neutral-100 space-y-4">
                  <div className="flex items-start gap-3">
                     <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                     <p className="text-slate-600 font-medium">
                        {currentShop?.address || restaurant.address || 'Quận 1, TP. Hồ Chí Minh'}
                     </p>
                  </div>
                  <div className="flex items-center gap-6 pt-2 border-t border-neutral-200">
                     <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Clock className="w-4 h-4 text-blue-500" /> {currentShop?.openingHours || '08:00 - 22:00'}
                     </div>
                     <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                        <MessageSquare className="w-4 h-4 text-emerald-500" /> {currentShop?.totalReviews || '120'} đánh giá
                     </div>
                  </div>
               </div>

               {/* Map Info Cards (Distance/Duration) */}
               {currentShop?.map && (
                  <div className="flex flex-wrap gap-4">
                     <div className="flex-1 min-w-[140px] px-4 py-3 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500">
                           <Route className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Khoảng cách</p>
                           <p className="text-sm font-black text-slate-800">{currentShop?.map?.distance || '0.0 km'}</p>
                        </div>
                     </div>
                     <div className="flex-1 min-w-[140px] px-4 py-3 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-500">
                           <Clock className="w-5 h-5" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian</p>
                           <p className="text-sm font-black text-slate-800">{currentShop?.map?.duration || '0 mins'}</p>
                        </div>
                     </div>
                  </div>
               )}

               {/* Menu Section */}
               <section>
                  <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
                     <Utensils className="w-6 h-6 text-orange-500" />
                     Thực đơn nhà hàng
                  </h3>

                  {loadingMenu ? (
                     <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                     </div>
                  ) : menu && menu.length > 0 ? (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menu.map((item: any, idx: number) => (
                           <div
                              key={item.id || idx}
                              onClick={() => {
                                 if (onDishClick) {
                                    // Chúng ta cần một object có định dạng tương thích DishInfo
                                    onDishClick({
                                       id: item.id,
                                       name: item.name,
                                       price: item.price,
                                       restaurant: { id: currentShop.id, name: currentShop.name }
                                    });
                                 }
                              }}
                              className="group bg-white border border-neutral-100 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:border-orange-200 hover:shadow-md transition-all active:scale-[0.98]"
                           >
                              <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center shrink-0 overflow-hidden">
                                 <img
                                    src={`https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80`}
                                    alt={item.name}
                                    className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                 />
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-bold text-slate-800 line-clamp-2 group-hover:text-orange-600 transition-colors">
                                    {item.name}
                                 </h4>
                                 <p className="text-orange-600 font-bold mt-1">
                                    {formatPrice(item.price || 0)}
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  ) : (
                     <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-100 text-center">
                        <p className="text-slate-500 font-medium">Chưa có thông tin thực đơn cho nhà hàng này.</p>
                     </div>
                  )}
               </section>

               {similarRestaurants && similarRestaurants.length > 0 && (
                  <section className="space-y-6 pt-6 border-t border-neutral-100">
                     <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] flex items-center justify-between">
                        NHÀ HÀNG TƯƠNG TỰ
                        <ChevronRight className="w-4 h-4" />
                     </h4>
                     <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                        {similarRestaurants.map(rs => (
                           <div 
                              key={rs.id} 
                              className="w-48 shrink-0 p-4 bg-white rounded-2xl border border-neutral-100 hover:shadow-xl transition-all space-y-3 cursor-pointer" 
                              onClick={() => {
                                 if (onShopClick) onShopClick(rs);
                              }}
                           >
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
                  </section>
               )}

               <footer className="py-12 border-t border-neutral-100 text-center mt-auto">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.5em]">HƯƠNG VỊ BẢN ĐỊA</p>
               </footer>
            </div>
         </div>

         {/* ─── RIGHT COLUMN: MAP ─── */}
         <div className="w-full lg:w-[45%] h-[400px] lg:h-full bg-neutral-100 relative">
            <LeafletDetailMap
               userLocation={userLocation}
               selectedRestaurant={selectedForMap}
            />

            <div className="lg:hidden absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 z-1000">
               <Navigation className="w-3 h-3" /> Bản đồ chỉ đường
            </div>
         </div>
      </motion.div>
   );
};
