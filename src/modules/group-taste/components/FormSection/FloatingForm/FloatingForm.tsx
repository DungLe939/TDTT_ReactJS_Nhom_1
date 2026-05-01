import React from 'react';
import { motion } from 'motion/react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import './FloatingForm.css';

interface FloatingFormProps {
  searchInput: string;
  setSearchInput: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
  loading: boolean;
  locationKeyword?: string;
}

const SUGGESTIONS = [
  'Quận 1, TP.HCM',
  'Hà Nội',
  'Đà Nẵng',
  'Phố cổ Hội An',
  'Đà Lạt, Lâm Đồng',
  'Vũng Tàu',
  'Phú Quốc, Kiên Giang',
  'Nha Trang, Khánh Hòa',
  'Huế',
  'Sapa, Lào Cai'
];

export const FloatingForm: React.FC<FloatingFormProps> = ({
  searchInput,
  setSearchInput,
  onSearch,
  loading,
  locationKeyword
}) => {
  return (
    <motion.div 
      className="floating-form-wrapper"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="floating-form-card">
        
        <h2 className="floating-form-title">
          Bạn muốn đi đâu cùng nhóm?
        </h2>

        <form onSubmit={onSearch} className="floating-form-content">
          <div className="input-group-premium">
            <div className="input-icon-wrapper">
              <MapPin className="w-5 h-5 text-neutral-400" />
            </div>
            <input
              type="text"
              list="floating-suggestions"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Nhập địa điểm (VD: Hồ Chí Minh, Đà Lạt...)"
              className="premium-input"
              disabled={loading}
            />
            <datalist id="floating-suggestions">
              {SUGGESTIONS.map(s => <option key={s} value={s} />)}
            </datalist>
          </div>

          <motion.button
            type="submit"
            disabled={!searchInput.trim() || loading}
            className="premium-submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>Tìm quán ngay</span>
          </motion.button>
        </form>


        {locationKeyword && (
          <div className="location-badge-premium mt-4">
            <div className="pulse-dot"></div>
            <span>Đang xem nhà hàng tại <strong>{locationKeyword}</strong></span>
          </div>
        )}
      </div>
    </motion.div>
  );
};
