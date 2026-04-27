/**
 * Types cho module Group Taste — mapping từ Backend Response DTOs.
 *
 * Đã đồng bộ với Backend:
 *   - GroupRecommendationResponseDto
 *   - ScoreResultDto
 *   - RestaurantInfoDto (bao gồm distance + tags)
 *   - UserScoreDetailDto
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
 * Mapping từ Backend RestaurantInfoDto.
 * Bao gồm distance (km) và tags từ Firestore.
 */
export interface Restaurant {
  id: string;
  name: string;
  price: number;
  rating: number;
  location: GeoLocation;
  /** Khoảng cách từ vị trí nhóm (km) */
  distance: number;
  /** Tags bổ sung: gia_dinh, yen_tinh... */
  tags?: string[];
  /** Optional — chỉ có khi dùng mock data local */
  tasteVector?: number[];
}

/**
 * Mapping từ Backend UserScoreDetailDto.
 */
export interface UserScoreDetail {
  userId: string;
  similarity: number;
}

/**
 * Mapping từ Backend ScoreResultDto.
 */
export interface ScoreResult {
  restaurant: Restaurant;
  avgSimilarity: number;
  minSimilarity: number;
  finalScore: number;
  userScores: UserScoreDetail[];
}

/**
 * Mapping từ Backend GroupRecommendationResponseDto.
 */
export interface GroupRecommendationResponse {
  recommendations: ScoreResult[];
  totalCandidates: number;
  filteredCount: number;
}
