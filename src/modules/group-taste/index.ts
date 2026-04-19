/**
 * Module Group Taste — Public API
 *
 * Barrel exports cho tất cả types, hooks, và component chính.
 */

// Types
export type {
  UserPreference,
  Restaurant,
  ScoreResult,
  UserScoreDetail,
  GeoLocation,
  GroupRecommendationResponse,
} from './types';

// Hooks
export { useLocation } from './hooks/useLocation';
export { useGroupTaste } from './hooks/useGroupTaste';
export type { GroupUser } from './hooks/useGroupTaste';
export { useRestaurants } from './hooks/useRestaurants';

// Main Page Component
export { GroupTastePage } from './GroupTastePage';
