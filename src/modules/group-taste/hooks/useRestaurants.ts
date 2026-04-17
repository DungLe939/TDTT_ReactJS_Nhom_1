import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import type { ScoreResult, GeoLocation } from '../types';

interface UseRestaurantsReturn {
  /** Danh sách nhà hàng từ kết quả recommendation */
  restaurants: ScoreResult[];
  /** Các nhà hàng được highlight (top recommendations) */
  highlighted: ScoreResult[];
  /** Set recommendations từ API result */
  setFromRecommendations: (recommendations: ScoreResult[]) => void;
  /** Clear danh sách */
  clearRestaurants: () => void;
  /** Tính toạ độ trung tâm */
  center: GeoLocation;
}

/** Toạ độ mặc định: Quận 1, TP.HCM */
const DEFAULT_CENTER: GeoLocation = { lat: 10.7626, lng: 106.6602 };

/** Số lượng top nhà hàng được highlight trên map */
const TOP_HIGHLIGHT_COUNT = 3;

/**
 * useRestaurants — Hook quản lý danh sách nhà hàng từ kết quả API.
 *
 * - Nhận recommendations từ API → tách restaurants
 * - Tính center cho map view
 * - Highlight top N cho map markers
 * - Debounce cập nhật tránh re-render liên tục
 */
export const useRestaurants = (
  userLocation?: GeoLocation,
): UseRestaurantsReturn => {
  const [restaurants, setRestaurants] = useState<ScoreResult[]>([]);
  const [recommendationCenter, setRecommendationCenter] = useState<GeoLocation | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  const setFromRecommendations = useCallback(
    (recommendations: ScoreResult[]) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        setRestaurants(recommendations);

        if (recommendations.length > 0) {
          const lats = recommendations.map((r) => r.restaurant.location.lat);
          const lngs = recommendations.map((r) => r.restaurant.location.lng);
          setRecommendationCenter({
            lat: lats.reduce((a, b) => a + b, 0) / lats.length,
            lng: lngs.reduce((a, b) => a + b, 0) / lngs.length,
          });
        } else {
          setRecommendationCenter(null);
        }
      }, 150);
    },
    [],
  );

  const clearRestaurants = useCallback(() => {
    setRestaurants([]);
    setRecommendationCenter(null);
  }, []);

  const highlighted = restaurants.slice(0, TOP_HIGHLIGHT_COUNT);
  const center = useMemo(
    () => recommendationCenter ?? userLocation ?? DEFAULT_CENTER,
    [recommendationCenter, userLocation],
  );

  return {
    restaurants,
    highlighted,
    setFromRecommendations,
    clearRestaurants,
    center,
  };
};
