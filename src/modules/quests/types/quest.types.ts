// =============================================================================
// FEATURE 5 — SHARED TYPES
// =============================================================================

// ---------------------------------------------------------------------------
// Primitive enums / unions
// ---------------------------------------------------------------------------

export type CuisineType =
  | 'japanese' | 'vietnamese' | 'italian' | 'korean'
  | 'chinese' | 'thai' | 'french' | 'indian';

export type Tag =
  // Cuisine
  | 'japanese' | 'vietnamese' | 'italian' | 'korean'
  | 'chinese' | 'thai' | 'french' | 'indian' | 'american'
  // Food type
  | 'street-food' | 'cafe' | 'fine-dining' | 'buffet'
  | 'fast-food' | 'bbq' | 'hotpot' | 'bakery' | 'seafood'
  // Price tier
  | 'budget' | 'mid-range' | 'expensive' | 'students'
  // Dietary
  | 'vegetarian' | 'vegan' | 'halal' | 'healthy'
  // Meal type
  | 'breakfast' | 'lunch' | 'dinner' | 'brunch' | 'late-night' | 'all-day'
  // Vibe / Space
  | 'chill' | 'rooftop' | 'air-conditioned' | 'modern' | 'vintage'
  | 'workspace' | 'pet-friendly' | 'date-night' | 'family'
  // Features
  | 'home-made' | 'traditional' | 'fusion' | 'delivery';

export const ALL_TAGS: Tag[] = [
  'japanese', 'vietnamese', 'italian', 'korean', 'chinese', 'thai', 'french', 'indian', 'american',
  'street-food', 'cafe', 'fine-dining', 'buffet', 'fast-food', 'bbq', 'hotpot', 'bakery', 'seafood',
  'budget', 'mid-range', 'expensive', 'students',
  'vegetarian', 'vegan', 'halal', 'healthy',
  'breakfast', 'lunch', 'dinner', 'brunch', 'late-night', 'all-day',
  'chill', 'rooftop', 'air-conditioned', 'modern', 'vintage', 'workspace', 'pet-friendly', 'date-night', 'family',
  'home-made', 'traditional', 'fusion', 'delivery',
];


export type BlogActivityType =
  | 'POST_CREATED'
  | 'RESTAURANT_VISITED'
  | 'POST_LIKED';

export type CrossFeatureActivityType =
  | 'FOOD_SCANNED'
  | 'MENU_TRANSLATED'
  | 'SCHEDULE_COMPLETED'
  | 'GROUP_TASTE_USED';

export type ActivityEventType = BlogActivityType | CrossFeatureActivityType;

// ---------------------------------------------------------------------------
// Blog entities
// ---------------------------------------------------------------------------

export interface BlogComment {
  id: string;
  authorId: string;
  content: string;
  photoUrls?: string[];
  createdAt: string; // ISO string
  likesCount: number;
  likedByUserIds: string[];
  parentId?: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  tags: Tag[];
  restaurantId?: string;
  photoUrls?: string[];
  createdAt: string; // ISO string (JSON-serializable)
  likesCount: number;
  likedByUserIds: string[]; // track who liked for dedup
  comments: BlogComment[];
}

export interface Restaurant {
  id: string;
  name: string;
  cuisineType: CuisineType;
  location: string;
  address?: string;
  priceRange: 'budget' | 'mid-range' | 'fine-dining';
  rating: number; // 1–5
  openingHours: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  type: BlogActivityType;
  targetId: string;
  occurredAt: string; // ISO string
  metadata?: {
    cuisineType?: CuisineType;
    tags?: Tag[];
    likedPostAuthorId?: string;
  };
}

// ---------------------------------------------------------------------------
// Achievement entities
// ---------------------------------------------------------------------------

export type RewardType = 'voucher' | 'badge' | 'points';

export interface Reward {
  id: string;
  type: RewardType;
  value: number;
  description: string;
  validForDays?: number;
  expiresAt?: string;
  icon?: string; // emoji
}

export interface AchievementCondition {
  eventType: ActivityEventType;
  requiredCount: number;
  filters?: {
    cuisineType?: CuisineType;
    withinDays?: number;
    tag?: Tag;
  };
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  condition: AchievementCondition;
  rewardId: string;
  isActive: boolean;
}

export interface ProgressTracker {
  userId: string;
  achievementId: string;
  currentCount: number;
  requiredCount: number;
  progressPercent: number;
  isCompleted: boolean;
  completedAt?: string; // ISO string
}

export interface AchievementWithProgress extends Achievement {
  progress: ProgressTracker;
  reward: Reward;
}

export interface UserReward {
  id: string;
  userId: string;
  rewardId: string;
  achievementId: string;
  issuedAt: string; // ISO string
  expiresAt?: string;
  isUsed: boolean;
}

export interface UserRewardResolved extends UserReward {
  reward: Reward;
  achievementName: string;
}

export interface UserStats {
  xp: number;
  level: number;
  levelTitle: string;
  xpToNextLevel: number;
  progressPercent: number;
}

export interface Badge {
  id: string;
  name: string;
  icon?: string;
  description: string;
}


// ---------------------------------------------------------------------------
// Activity event (fired into achievement system)
// ---------------------------------------------------------------------------

export interface ActivityEvent {
  userId: string;
  type: ActivityEventType;
  occurredAt: string; // ISO string
  payload: {
    restaurantId?: string;
    cuisineType?: CuisineType;
    postId?: string;
    tags?: Tag[];
    scannedFoodId?: string;
    translatedMenuId?: string;
    completedScheduleId?: string;
    groupSessionId?: string;
  };
}

// ---------------------------------------------------------------------------
// Toast notification (UI-level, from achievement system)
// ---------------------------------------------------------------------------

export interface AchievementNotification {
  id: string;
  achievementName: string;
  rewardDescription: string;
  rewardType: RewardType;
  icon: string;
}

// ---------------------------------------------------------------------------
// Demo users (for user-switcher, to demo multi-user progress)
// ---------------------------------------------------------------------------

export interface DemoUser {
  id: string;
  username: string;
  avatar: string; // emoji
  level: number;
  points: number;
  achievements: string[];
  foodPreferences?: Tag[];
  budget?: 'budget' | 'mid-range' | 'fine-dining';
}

// ---------------------------------------------------------------------------
// Post filter state
// ---------------------------------------------------------------------------

export interface PostFilter {
  tags: Tag[];
  restaurantId?: string;
  authorId?: string;
}