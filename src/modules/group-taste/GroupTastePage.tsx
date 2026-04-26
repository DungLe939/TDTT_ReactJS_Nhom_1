import React, { useEffect, useCallback, useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, ChefHat } from 'lucide-react';
import { useLocation } from './hooks/useLocation';
import { useGroupTaste } from './hooks/useGroupTaste';
import { RestaurantList } from './components/Results/RestaurantList';
import { HeroBanner } from './components/HeroBanner/HeroBanner';
import { FormSection } from './components/FormSection/FormSection';
import { DishDetail } from './components/Results/DishDetail';
import { RestaurantDetail } from './components/Results/RestaurantDetail';
import { groupTasteApiService } from '../../services/groupTaste.service';
import type { DishInfo, DishDetailResponse } from './types';

import bgImage from './assets/background.jpg';

/**
 * GroupTastePage — Trang chính cho feature "Ăn gì nhóm?"
 *
 * Data flow:
 *   1. User nhập khu vực → searchLocation() → backend nạp nhà hàng vào Firestore
 *   2. User thêm thành viên → fetchRecommendations() → nhận DishInfo[] (không có location)
 *   3. User click món → getDishDetail() → nhận DishDetailResponse (có lat/lng/address)
 *   4. DishDetail hiển thị Google Maps iframe + nút Chỉ đường
 *   5. MapView fly đến vị trí nhà hàng được chọn
 */
export const GroupTastePage: React.FC = () => {
  const {
    location: userLocation,
  } = useLocation();

  const {
    users,
    result,
    loading,
    error,
    searchCoords,
    addUser,
    removeUser,
    fetchRecommendations,
    resetAll,
    setUsers,
  } = useGroupTaste();


  // ── State ──
  const [groupId, setGroupId] = useState<string | null>(null);

  /** Món đang được chọn trong danh sách (để highlight card) */
  const [selectedDish, setSelectedDish] = useState<DishInfo | null>(null);

  /** Chi tiết đầy đủ sau khi fetch từ dish-detail API */
  const [selectedDetail, setSelectedDetail] = useState<DishDetailResponse | null>(null);

  /** Đang fetch dish detail */
  const [detailLoading, setDetailLoading] = useState(false);

  /** View hiện tại đang hiển thị */
  const [currentView, setCurrentView] = useState<'main' | 'dishDetail' | 'restaurantDetail'>('main');

  /** Nhà hàng đang được chọn để xem chi tiết */
  const [selectedRestaurant, setSelectedRestaurant] = useState<any>(null);

  // ── Refs for scroll ──
  const resultsSectionRef = React.useRef<HTMLDivElement>(null);

  /** Cuộn xuống kết quả khi có data */
  useEffect(() => {
    if (result && !loading) {
      setTimeout(() => {
        resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    }
  }, [result, loading]);

  /** Cuộn xuống chi tiết khi chọn món - ĐÃ CHUYỂN SANG MODAL, KHÔNG CẦN SCROLL */


  /**
   * Click vào món ăn:
   * 1. Highlight card ngay lập tức
   * 2. Gọi API /group/dish-detail để lấy lat/lng/address
   * 3. Hiển thị DishDetail panel + scroll lên map
   */
  const handleDishClick = useCallback(
    async (dish: DishInfo) => {
      // Toggle deselect in main list
      if (selectedDish?.id === dish.id && currentView === 'main') {
        setSelectedDish(null);
        setSelectedDetail(null);
        return;
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setSelectedDish(dish);
      setSelectedDetail(null);
      setDetailLoading(true);
      setCurrentView('dishDetail');

      const currentLocation = searchCoords ?? userLocation ?? { lat: 10.7626, lng: 106.6602 };

      try {
        const detail = await groupTasteApiService.getDishDetail(
          dish.restaurant.id,
          dish.id,
          currentLocation,
          users,
        );
        setSelectedDetail(detail);
      } catch (_err) {
        // Log error or show a toast if needed
      } finally {
        setDetailLoading(false);
      }
    },
    [selectedDish, searchCoords, userLocation, users],
  );


  const handleReset = useCallback(() => {
    resetAll();
    setSelectedDish(null);
    setSelectedDetail(null);
    setSelectedRestaurant(null);
    setCurrentView('main');
  }, [resetAll]);

  const handleGroupCreated = useCallback((newGroupId: string) => {
    setGroupId(newGroupId);
  }, []);

  return (
    <div className="min-h-screen selection:bg-orange-200">
      {/* ─── SECTION 1: Hero + Map ─── */}
      <div className="relative w-full overflow-visible">
        {/* Background */}
        <div
          className="absolute inset-0 z-0 pointer-events-none bg-cover bg-center bg-no-repeat"
          style={{
            backgroundColor: '#ffffff',
            width: '100vw',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <HeroBanner />

          <div className="py-8">

          </div>
        </div>
      </div>

      {currentView === 'dishDetail' && (
        <div className="w-full h-screen fixed inset-0 z-50 bg-white">
          {detailLoading && !selectedDetail ? (
            <div className="flex items-center justify-center h-full bg-white">
              <div className="flex items-center gap-4 p-6 bg-white rounded-3xl shadow-2xl border border-neutral-100">
                <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <p className="font-bold text-slate-700">Đang chuẩn bị thực đơn...</p>
              </div>
            </div>
          ) : selectedDetail ? (
            <DishDetail
              detail={selectedDetail}
              loading={detailLoading}
              onClose={() => {
                setSelectedDish(null);
                setSelectedDetail(null);
                setCurrentView('main');
              }}
              onShopClick={(restaurant) => {
                setCurrentView('restaurantDetail');
                setSelectedRestaurant(restaurant);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              userLocation={userLocation || searchCoords}
              users={users}
            />
          ) : null}
        </div>
      )}

      {currentView === 'restaurantDetail' && selectedRestaurant && (
        <div className="w-full h-screen fixed inset-0 z-50 bg-white">
          <RestaurantDetail
            restaurant={selectedRestaurant}
            onClose={() => {
              setCurrentView('dishDetail');
              // Có thể giữ selectedRestaurant hoặc không, nhưng quay lại dishDetail
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onDishClick={handleDishClick} // Allow going to another dish
            onShopClick={(r) => {
              setSelectedRestaurant(r);
              setCurrentView('restaurantDetail');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            userLocation={userLocation || searchCoords || { lat: 10.7626, lng: 106.6602 }}
          />
        </div>
      )}

      <div className={currentView === 'main' ? 'block' : 'hidden'}>
        {/* ─── SECTION 2: Form + Results ─── */}
        <div className="relative w-full">
          {/* Background */}
          <div
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgImage})`,
              width: '100vw',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundAttachment: 'fixed',
            }}
          />

          <div className="relative z-10 py-32">
            {/* Form */}
            <div id="scan-section">
              <FormSection
                loading={loading}
                users={users}
                setUsers={setUsers}
                addUser={addUser}
                removeUser={removeUser}
                userLocation={userLocation}
                fetchRecommendations={fetchRecommendations}
                groupId={groupId}
                onGroupCreated={handleGroupCreated}
              />
            </div>

            {/* Results */}
            <main className="mt-24" ref={resultsSectionRef}>
              <div className="max-w-6xl mx-auto px-6">
                <motion.section
                  className="space-y-12"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                >
                  {(result || loading) && (
                    <div className="text-center mb-16">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <ChefHat className="w-8 h-8 text-orange-400" />
                        <h2 className="text-4xl font-black text-white drop-shadow-lg uppercase tracking-wider">
                          KẾT QUẢ PHÙ HỢP
                        </h2>
                      </div>
                      <p className="text-white/80 uppercase tracking-[0.2em] text-xs font-bold">
                        Dựa trên tinh hoa khẩu vị của cả nhóm • Click vào món để xem chi tiết
                      </p>
                      <div className="w-16 h-1.5 bg-orange-500 mx-auto rounded-full mt-6" />
                    </div>
                  )}

                  <RestaurantList
                    result={result}
                    loading={loading}
                    error={error}
                    users={users}
                    selectedDish={selectedDish}
                    onDishClick={handleDishClick}
                    allergies={Array.from(new Set(users.flatMap(u => u.allergies || [])))}
                  />

                  {(result || error) && !loading && (
                    <motion.div
                      className="flex justify-center pt-12"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <button
                        type="button"
                        onClick={handleReset}
                        className="group px-10 py-6 bg-white/90 backdrop-blur-md border-2 border-orange-100 text-slate-800 font-black text-lg rounded-[24px] hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all shadow-2xl flex items-center gap-4"
                      >
                        <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-700" />
                        LÀM MỚI KẾ HOẠCH
                      </button>
                    </motion.div>
                  )}
                </motion.section>
              </div>
            </main>
          </div>
        </div>

      </div>
    </div>
  );
};
