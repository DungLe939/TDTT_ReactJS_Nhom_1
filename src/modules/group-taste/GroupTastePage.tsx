import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { RefreshCw, Utensils, Search, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { useLocation } from './hooks/useLocation';
import { useGroupTaste } from './hooks/useGroupTaste';
import { useRestaurants } from './hooks/useRestaurants';
import { LocationBar } from './components/LocationBar';
import { UserInputForm } from './components/UserInputForm';
import { RecommendationButton } from './components/RecommendationButton';
import { RestaurantList } from './components/RestaurantList';
import { MapView } from './components/MapView';
import { ShareGroup } from './components/ShareGroup';
import type { Restaurant } from './types';

const LOCATION_SUGGESTIONS = [
  'Quận 1, Hồ Chí Minh',
  'Quận 2, Hồ Chí Minh',
  'Quận 3, Hồ Chí Minh',
  'Quận 7, Hồ Chí Minh',
  'Phố đi bộ Nguyễn Huệ',
  'Landmark 81',
  'Hồ Bán Nguyệt, Q7',
  'Đà Nẵng',
  'Hà Nội',
];

/**
 * GroupTastePage — Trang chính cho feature "Ăn gì nhóm?"
 *
 * Flow hoàn chỉnh:
 * 1. Location: Tự động lấy vị trí → fallback manual
 * 2. Search: User nhập khu vực → gọi searchLocation → populate Firestore
 * 3. User Input: Thêm thành viên (tên, budget, sở thích)
 * 4. Map: Hiển thị vị trí hiện tại + nhà hàng
 * 5. Recommendation: Gọi POST /restaurants/recommend/group
 * 6. Results: Top 3-5 nhà hàng + highlight trên map
 * 7. Share: Tạo link chia sẻ nhóm
 *
 * Architecture:
 * - useLocation → quản lý geolocation
 * - useGroupTaste → quản lý users + API calls + searchLocation
 * - useRestaurants → quản lý restaurant data cho map
 */
export const GroupTastePage: React.FC = () => {
  const {
    location: userLocation,
    loading: locationLoading,
    error: locationError,
    hasRealLocation,
    requestLocation,
  } = useLocation();

  const {
    users,
    result,
    loading,
    error,
    locationKeyword,
    hasSearchedLocation,
    searchCoords,
    addUser,
    removeUser,
    fetchRecommendations,
    resetAll,
    setUsers,
    searchLocation,
    setSearchCoords,
  } = useGroupTaste();

  const {
    restaurants,
    highlighted,
    setFromRecommendations,
    clearRestaurants,
    center,
  } = useRestaurants(searchCoords ?? userLocation);

  const [groupId, setGroupId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [hoveredRestaurantId, setHoveredRestaurantId] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Scroll to map when a restaurant is selected
  useEffect(() => {
    if (selectedRestaurant && mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedRestaurant]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    setSearchCoords({ lat, lng });
    setSearchInput('📍 Vị trí tùy chọn trên bản đồ');
  }, [setSearchCoords]);

  /** Sync kết quả recommendation vào restaurant hook */
  useEffect(() => {
    if (result?.recommendations) {
      setFromRecommendations(result.recommendations);
    }
  }, [result, setFromRecommendations]);

  const handleReset = useCallback(() => {
    resetAll();
    clearRestaurants();
  }, [resetAll, clearRestaurants]);

  const handleGroupCreated = useCallback((newGroupId: string) => {
    setGroupId(newGroupId);
  }, []);

  /**
   * Xử lý tìm kiếm khu vực.
   * Gọi searchLocation để populate Firestore với nhà hàng gần keyword.
   */
  const handleSearchLocation = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchInput.trim()) return;
      await searchLocation(searchInput.trim());
    },
    [searchInput, searchLocation],
  );

  return (
    <div className="max-w-2xl mx-auto pb-8 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-sm shadow-orange-200">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Ăn gì nhóm?</h1>
            <p className="text-neutral-500 text-sm">
              Dung hòa khẩu vị để tìm nhà hàng hoàn hảo cho cả team
            </p>
          </div>
        </div>
      </motion.div>

      {/* Location Bar */}
      <LocationBar
        location={userLocation}
        loading={locationLoading}
        error={locationError}
        hasRealLocation={hasRealLocation}
        onRequestLocation={requestLocation}
      />

      {/* Location Search — quét nhà hàng theo khu vực */}
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <form
          onSubmit={handleSearchLocation}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              list="location-suggestions"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập khu vực (VD: Quận 1, Đà Nẵng...)"
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm bg-white"
              disabled={loading}
            />
            <datalist id="location-suggestions">
              {LOCATION_SUGGESTIONS.map((location) => (
                <option key={location} value={location} />
              ))}
            </datalist>
          </div>
          <button
            type="submit"
            disabled={!searchInput.trim() || loading}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-1.5 shrink-0 ${
              !searchInput.trim() || loading
                ? 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-200 active:scale-95'
            }`}
          >
            {loading && !result ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Quét quán
          </button>
        </form>

        {/* Status message */}
        {hasSearchedLocation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium border border-emerald-100"
          >
            <CheckCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Đã quét nhà hàng khu vực <strong>"{locationKeyword}"</strong> — sẵn sàng gợi ý!
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Map — luôn hiển thị, cập nhật khi có kết quả */}
      <div ref={mapRef}>
        <MapView
          center={center}
          userLocation={hasRealLocation ? userLocation : undefined}
          restaurants={restaurants}
          highlighted={highlighted}
          selectedRestaurant={selectedRestaurant}
          hoveredRestaurantId={hoveredRestaurantId}
          onMapClick={handleMapClick}
        />
      </div>

      {/* User Input */}
      <UserInputForm
        users={users}
        setUsers={setUsers}
        addUser={addUser}
        removeUser={removeUser}
        defaultLocation={userLocation}
      />

      {/* Share Group */}
      <ShareGroup
        userCount={users.length}
        groupId={groupId}
        onGroupCreated={handleGroupCreated}
      />

      {/* Recommendation Button */}
      <RecommendationButton
        onClick={() => fetchRecommendations(searchInput)}
        loading={loading}
        disabled={users.length === 0}
        userCount={users.length}
      />

      {/* Results */}
      <RestaurantList
        result={result}
        loading={loading}
        error={error}
        selectedRestaurant={selectedRestaurant}
        onRestaurantClick={setSelectedRestaurant}
        onRestaurantHover={setHoveredRestaurantId}
      />

      {/* Reset Button */}
      {(result || error) && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại với nhóm khác
          </button>
        </motion.div>
      )}
    </div>
  );
};
