import { useState, useEffect, useCallback } from 'react';
import type { GeoLocation } from '../types';

/** Toạ độ mặc định: Quận 1, TP.HCM */
const DEFAULT_LOCATION: GeoLocation = { lat: 10.7626, lng: 106.6602 };

interface UseLocationReturn {
  /** Vị trí hiện tại (thật hoặc fallback) */
  location: GeoLocation;
  /** Đang trong quá trình lấy vị trí */
  loading: boolean;
  /** Lỗi khi lấy vị trí (nếu có) */
  error: string | null;
  /** Đã lấy được vị trí thật chưa */
  hasRealLocation: boolean;
  /** Gọi lại để lấy vị trí thủ công */
  requestLocation: () => void;
}

/**
 * useLocation — Custom hook tự động + manual lấy vị trí người dùng.
 *
 * Flow:
 * 1. Component mount → tự động gọi navigator.geolocation
 * 2. Nếu user từ chối → hiển thị fallback + nút "Lấy vị trí của tôi"
 * 3. Cache vị trí trong state, tránh gọi lại mỗi render
 */
export const useLocation = (): UseLocationReturn => {
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasRealLocation, setHasRealLocation] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Trình duyệt không hỗ trợ định vị.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: GeoLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        setHasRealLocation(true);
        setLoading(false);
      },
      (err) => {
        const messages: Record<number, string> = {
          1: 'Bạn đã từ chối quyền truy cập vị trí.',
          2: 'Không xác định được vị trí hiện tại.',
          3: 'Hết thời gian chờ lấy vị trí.',
        };
        setError(messages[err.code] ?? 'Không thể lấy vị trí.');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // Cache 5 phút
      },
    );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      requestLocation();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [requestLocation]);

  return {
    location,
    loading,
    error,
    hasRealLocation,
    requestLocation,
  };
};
