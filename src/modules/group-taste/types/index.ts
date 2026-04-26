/**
 * Types cho module Group Taste — mapping từ Backend Response DTOs.
 *
 * Đồng bộ với Backend NestJS:
 *   - GroupRecommendationResponseDto  → GroupRecommendationResponse
 *   - DishInfoDto                     → DishInfo (flat, từ danh sách gợi ý)
 *   - DishDetailResponseDto           → DishDetailResponse (từ /group/dish-detail)
 *   - RestaurantSummaryDto            → RestaurantSummary
 */

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface UserPreference {
  id: string;
  tasteVector: number[];
  budget: number;
  location: GeoLocation;
}

/**
 * Thông tin nhà hàng tóm tắt — mapping từ Backend RestaurantSummaryDto.
 * Chỉ có id + name (không có location, vì đó là dữ liệu của dish-detail endpoint).
 */
export interface RestaurantSummary {
  id: string;
  name: string;
}

/**
 * Mapping từ Backend RestaurantInfoDto (dùng trong các luồng cũ nếu cần).
 * Giữ lại để backward-compat.
 */
export interface Restaurant {
  id: string;
  name: string;
  price?: number;
  rating?: number;
  location: GeoLocation;
  distance?: number;
  tags?: string[];
  address?: string;
  lat?: number;           // legacy/fallback
  lng?: number;           // legacy/fallback
}

/**
 * Món ăn trong danh sách gợi ý — mapping từ Backend DishInfoDto.
 *
 * ⚠️ QUAN TRỌNG: restaurant chỉ có id + name, KHÔNG có location.
 * Để lấy location, gọi endpoint /group/dish-detail.
 */
export interface DishInfo {
  id: string;
  name: string;
  price: number;
  rating: number;
  tags?: string[];
  restaurant: RestaurantSummary;
  /** Score từ engine (0-1) */
  score?: number;
  /** Score từ engine (raw hoặc 0-1) */
  finalScore?: number;
  avgSimilarity?: number;
  minSimilarity?: number;
  /** % độ phù hợp (0-100) để hiển thị progress bar */
  matchPercentage?: number;
  /** Rating trung bình kỳ vọng của nhóm */
  avgGroupRating?: number;
  /** Khoảng cách tới nhà hàng (km) */
  distance?: number;
  /** Danh sách lý do đề xuất (explainability) */
  matchedReasons?: string[];
}

/**
 * Mapping từ Backend DishDetailResponseDto.
 * Trả về khi gọi POST /group/dish-detail
 */
export interface DishDetailResponse {
  dish?: {
    id: string;
    name: string;
    price: number;
    description?: string;
    rating: number;
    tags?: string[];
  };
  restaurant?: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    rating: number;
    openingHours?: string;
    totalReviews?: number;
  };
  map: {
    google_map_link: string;
    direction_link: string;
    distance: string;   // e.g. "5.2 km"
    duration: string;   // e.g. "15 phút"
  };
  selectedFood?: {
    id: string;
    name: string;
    price: number;
    rating: number;
    groupName: string;
    tags?: string[];
  };
  shop?: {
    id: string;
    name: string;
    address: string;
    rating: number;
    lat: number;
    lng: number;
    openingHours?: string;
    totalReviews?: number;
  };
  menu?: {
    id: string;
    name: string;
    price: number;
    rating: number;
    imageUrl?: string;
  }[];
  relatedFoods?: {
    id: string;
    name: string;
    price: number;
    rating: number;
    groupName: string;
    shop: { id: string; name: string; };
  }[];
  recommendedShops?: {
    id: string;
    name: string;
    address: string;
    rating: number;
    lat: number;
    lng: number;
  }[];
}

/**
 * UserScoreDetail — mapping từ Backend UserScoreDetailDto.
 */
export interface UserScoreDetail {
  userId: string;
  similarity: number;
}

/**
 * ScoreResult — Cấu trúc tương thích ngược nếu cần.
 * Trong thực tế API trả về DishInfo[] trực tiếp.
 */
export interface ScoreResult {
  dish: DishInfo;
  avgSimilarity: number;
  minSimilarity: number;
  finalScore: number;
  userScores: UserScoreDetail[];
}

/**
 * Mapping từ Backend GroupRecommendationResponseDto.
 * dishes là mảng DishInfo flat (không nested trong ScoreResult).
 */
export interface GroupRecommendationResponse {
  dishes: DishInfo[];
  totalCandidates: number;
  filteredCount: number;
}

/**
 * Alias để dùng trong DishDetail component.
 * Là Dish đầy đủ sau khi đã fetch từ dish-detail endpoint.
 */
export interface Dish {
  id: string;
  name: string;
  price: number;
  rating: number;
  tags?: string[];
  description?: string;
  imageUrl?: string;
  restaurant: Restaurant;
}
