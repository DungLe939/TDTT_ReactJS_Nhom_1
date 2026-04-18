import { useState } from 'react';
import { Star, MapPin, Clock, Footprints } from 'lucide-react';
import type { Restaurant } from '../../types/quest.types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onVisit: (restaurantId: string) => void;
}

const normalizeAddress = (addr: string): string => {
  if (!addr) return '';
  return addr
    .replace(/Ho Chi Minh City/gi, 'TP. Hồ Chí Minh')
    .replace(/Hanoi/gi, 'Hà Nội')
    .replace(/Saigon/gi, 'Sài Gòn')
    .replace(/Street/gi, 'Đường')
    .replace(/Ward/gi, 'Phường')
    .replace(/District/gi, 'Quận')
    .replace(/Nguyen Thai Son/gi, 'Nguyễn Thái Sơn')
    .replace(/Tran Hung Dao/gi, 'Trần Hưng Đạo')
    .replace(/Nguyen Chi Thanh/gi, 'Nguyễn Chí Thanh');
};

const RestaurantCard = ({ restaurant, onVisit }: RestaurantCardProps) => {
  const [visited, setVisited] = useState(false);

  const renderLocation = (restaurant: any) => {
    let locStr = restaurant.address || restaurant.location || 'Chưa cập nhật địa chỉ';
    if (typeof locStr === 'object') locStr = locStr.address || locStr.name || 'Vị trí trên bản đồ';
    return normalizeAddress(String(locStr));
  };

  const renderOpeningHours = (hours: any) => {
    if (!hours) return 'Chưa cập nhật';
    if (typeof hours === 'string') return hours;
    if (typeof hours === 'object') return `${hours.open || '???'} - ${hours.close || '???'}`;
    return String(hours);
  };

  const handleVisit = () => {
    setVisited(true);
    onVisit(restaurant.id);
    setTimeout(() => setVisited(false), 600);
  };

  const tags = [restaurant.cuisineType, restaurant.priceRange].filter(Boolean);

  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group flex flex-col h-full">
      {/* Content */}
      <div className="p-4 flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h4 className="font-black text-neutral-800 text-sm leading-tight truncate group-hover:text-orange-500 transition-colors">
            {restaurant.name}
          </h4>
          <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 border border-orange-100">
            <Star className="w-3 h-3 fill-current" />
            {restaurant.rating}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map((tag, idx) => (
            <span key={idx} className="text-[9px] font-black text-neutral-400 border border-neutral-100 px-1.5 py-0.5 rounded-md uppercase tracking-widest group-hover:border-orange-200 group-hover:text-orange-500 transition-colors">
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-1.5 mb-4 text-[12px] flex-1">
          <div className="flex items-start gap-2 text-neutral-500 font-medium line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-neutral-300 shrink-0 mt-0.5" />
            <span>{renderLocation(restaurant)}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400 font-bold">
            <Clock className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
            <span>{renderOpeningHours(restaurant.openingHours)}</span>
          </div>
        </div>

        <button
          onClick={handleVisit}
          className={`w-full py-2 rounded-xl font-black text-[11px] uppercase tracking-wider flex justify-center items-center gap-2 transition-all shadow-sm ${visited
              ? 'bg-orange-500 text-white shadow-orange-500/25'
              : 'bg-neutral-50 text-neutral-500 hover:bg-orange-500 hover:text-white border border-neutral-100'
            }`}
        >
          <Footprints className={`w-3.5 h-3.5 ${visited ? 'animate-bounce' : ''}`} />
          {visited ? 'Đã lưu' : 'Ghé thăm'}
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;
