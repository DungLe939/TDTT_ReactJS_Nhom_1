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
    .replace(/Cholon/gi, 'Chợ Lớn')
    .replace(/Giang Vo/gi, 'Giảng Võ')
    .replace(/Cua Nam/gi, 'Cửa Nam')
    .replace(/An Khanh/gi, 'An Khánh')
    .replace(/Hoa Hung/gi, 'Hòa Hưng')
    .replace(/An Nhon/gi, 'An Nhơn')
    .replace(/Nguyen Thai Son/gi, 'Nguyễn Thái Sơn')
    .replace(/Tran Hung Dao/gi, 'Trần Hưng Đạo')
    .replace(/Vong Duc/gi, 'Vọng Đức')
    .replace(/Pasteur/gi, 'Pasteur')
    .replace(/Luu Dinh Le/gi, 'Lưu Đình Lễ')
    .replace(/Truong Son/gi, 'Trường Sơn')
    .replace(/Nguyen Chi Thanh/gi, 'Nguyễn Chí Thanh');
};

const RestaurantCard = ({ restaurant, onVisit }: RestaurantCardProps) => {
  const [visited, setVisited] = useState(false);

  const renderLocation = (restaurant: any) => {
    let locStr = '';
    if (restaurant.address) {
      locStr = restaurant.address;
    } else {
      const loc = restaurant.location;
      if (!loc) locStr = 'Chưa cập nhật địa chỉ';
      else if (typeof loc === 'string') locStr = loc;
      else if (typeof loc === 'object') {
        if (loc.address || loc.name) locStr = loc.address || loc.name;
        else if (loc.coordinates) locStr = 'Xem trên bản đồ';
        else locStr = 'Vị trí trên bản đồ';
      } else {
        locStr = String(loc);
      }
    }
    return normalizeAddress(locStr);
  };

  const renderOpeningHours = (hours: any) => {
    if (!hours) return 'Chưa cập nhật giờ mở cửa';
    if (typeof hours === 'string') return hours;
    if (typeof hours === 'object') {
      const open = hours.open || '???';
      const close = hours.close || '???';
      return `${open} - ${close}`;
    }
    return String(hours);
  };

  const handleVisit = () => {
    setVisited(true);
    onVisit(restaurant.id);
    setTimeout(() => setVisited(false), 600);
  };

  const tags: string[] = [];
  if (restaurant.cuisineType && typeof restaurant.cuisineType === 'string' && isNaN(Number(restaurant.cuisineType))) {
    tags.push(restaurant.cuisineType);
  }
  if (restaurant.priceRange && typeof restaurant.priceRange === 'string' && isNaN(Number(restaurant.priceRange))) {
    tags.push(restaurant.priceRange);
  }

  return (
    <div className="bg-white rounded-3xl p-5 border border-neutral-100 shadow-[0_2px_15px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group" id={`restaurant-${restaurant.id}`}>
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-bold text-neutral-900 text-[15px] leading-snug group-hover:text-orange-500 transition-colors">
          {restaurant.name}
        </h4>
        <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-0.5 rounded-lg text-xs font-bold shrink-0 shadow-sm border border-amber-100/50">
          <Star className="w-3.5 h-3.5 fill-current" />
          {restaurant.rating}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map((tag, idx) => (
          <span key={idx} className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-md tracking-wider">
            #{tag.toUpperCase()}
          </span>
        ))}
      </div>

      <div className="space-y-2.5 mb-5 text-[13px]">
        <div className="flex items-start gap-2.5 text-neutral-500 font-medium leading-relaxed">
          <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
          <span>{renderLocation(restaurant)}</span>
        </div>
        <div className="flex items-center gap-2.5 text-neutral-500 font-medium">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{renderOpeningHours(restaurant.openingHours)}</span>
        </div>
      </div>

      <button
        className={`w-full py-2.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-sm ${
          visited 
            ? 'bg-orange-500 text-white shadow-orange-500/30' 
            : 'bg-neutral-50 text-neutral-600 hover:bg-orange-500 hover:text-white border border-neutral-100'
        }`}
        onClick={handleVisit}
        id={`visit-btn-${restaurant.id}`}
      >
        <Footprints className={`w-4 h-4 ${visited ? 'animate-bounce' : ''}`} />
        {visited ? 'Đã lưu ghé thăm' : 'Ghé thăm'}
      </button>
    </div>
  );
};

export default RestaurantCard;
