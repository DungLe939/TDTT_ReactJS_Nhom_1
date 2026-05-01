/**
 * Module Group Taste — Public API
 *
 * Barrel exports cho tất cả types, hooks, và component chính.
 */

// Types
export type {
  UserPreference,
  Restaurant,
  RestaurantSummary,
  Dish,
  DishInfo,
  DishDetailResponse,
  ScoreResult,
  GeoLocation,
  GroupRecommendationResponse,
} from './types';

// Hooks
export { useLocation } from './hooks/useLocation';
export { useGroupTaste } from './hooks/useGroupTaste';
export type { GroupUser } from './hooks/useGroupTaste';
// Main Page Component
export { GroupTastePage } from './GroupTastePage';
