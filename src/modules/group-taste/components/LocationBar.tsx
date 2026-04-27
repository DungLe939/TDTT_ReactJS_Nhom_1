import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import type { GeoLocation } from '../types';

interface LocationBarProps {
  location: GeoLocation;
  loading: boolean;
  error: string | null;
  hasRealLocation: boolean;
  onRequestLocation: () => void;
}

/**
 * LocationBar — Thanh hiển thị vị trí hiện tại.
 *
 * Hiển thị:
 * - Đã định vị thành công → toạ độ + badge xanh
 * - Đang tải → loading spinner
 * - Chưa có vị trí → nút "Lấy vị trí của tôi"
 * - Lỗi → thông báo + nút thử lại
 */
export const LocationBar: React.FC<LocationBarProps> = ({
  location,
  loading,
  error,
  hasRealLocation,
  onRequestLocation,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
        hasRealLocation
          ? 'bg-emerald-50 border-emerald-100'
          : error
            ? 'bg-amber-50 border-amber-100'
            : 'bg-neutral-50 border-neutral-100'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
            hasRealLocation
              ? 'bg-emerald-500 text-white'
              : 'bg-neutral-200 text-neutral-500'
          }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4" />
          )}
        </div>

        <div className="min-w-0">
          {loading ? (
            <p className="text-sm text-neutral-600 animate-pulse">Đang xác định vị trí...</p>
          ) : hasRealLocation ? (
            <>
              <p className="text-sm font-medium text-emerald-700">Đã xác định vị trí</p>
              <p className="text-xs text-emerald-500 truncate">
                {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            </>
          ) : error ? (
            <>
              <p className="text-sm font-medium text-amber-700">Chưa có vị trí</p>
              <p className="text-xs text-amber-500 truncate">{error}</p>
            </>
          ) : (
            <p className="text-sm text-neutral-600">Đang dùng vị trí mặc định (Q.1, HCM)</p>
          )}
        </div>
      </div>

      {!loading && !hasRealLocation && (
        <button
          type="button"
          onClick={onRequestLocation}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-all active:scale-95 shadow-sm"
        >
          <Navigation className="w-3 h-3" />
          Lấy vị trí
        </button>
      )}
    </motion.div>
  );
};
