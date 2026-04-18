import React, { useEffect, useCallback, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { useLocation } from './hooks/useLocation';
import { useGroupTaste } from './hooks/useGroupTaste';
import { useRestaurants } from './hooks/useRestaurants';
import { LocationBar } from './components/LocationBar';
import { UserInputForm } from './components/UserInputForm';
import { RecommendationButton } from './components/RecommendationButton';
import { RestaurantList } from './components/RestaurantList';
import { MapView } from './components/MapView';
import { ShareGroup } from './components/ShareGroup';
import { LocationSearch } from './components/LocationSearch';
import { HeroBanner } from './components/HeroBanner/HeroBanner';
import type { Restaurant } from './types';

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
    <div className="pb-12">
      <HeroBanner />

      <div className="max-w-2xl mx-auto space-y-6 px-4 mt-6">
        {/* Nhắc nhở người dùng: Giao diện banner đã thay thế Header cũ */}

        {/* Location Bar */}
        <LocationBar
          location={userLocation}
          loading={locationLoading}
          error={locationError}
          hasRealLocation={hasRealLocation}
          onRequestLocation={requestLocation}
        />

        {/* Location Search — quét nhà hàng theo khu vực */}
        <LocationSearch
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          onSearch={handleSearchLocation}
          loading={loading}
          hasResult={!!result}
          hasSearchedLocation={hasSearchedLocation}
          locationKeyword={locationKeyword}
        />

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
    </div>
  );
};
