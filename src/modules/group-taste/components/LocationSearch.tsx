import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Search, Loader2, CheckCircle } from 'lucide-react';

interface LocationSearchProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
  loading: boolean;
  hasResult: boolean;
  hasSearchedLocation: boolean;
  locationKeyword: string;
}

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

export const LocationSearch: React.FC<LocationSearchProps> = ({
  searchInput,
  setSearchInput,
  onSearch,
  loading,
  hasResult,
  hasSearchedLocation,
  locationKeyword,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <form onSubmit={onSearch} className="flex gap-2">
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
          {loading && !hasResult ? (
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
  );
};
