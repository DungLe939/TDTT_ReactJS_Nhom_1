// =============================================================================
// BLOG SYSTEM — DTOs & Interfaces
// Blog-specific types, DTOs cho IBlogController
// =============================================================================

import type { Tag, CuisineType, ActivityEvent } from './quest.types';

// ---------------------------------------------------------------------------
// DTOs (Data Transfer Objects) — used by blogController
// ---------------------------------------------------------------------------

export interface CreatePostDto {
  authorId: string;
  content: string;
  tags: Tag[];
  restaurantId?: string;
  photoUrls?: string[];
}

export interface LikePostDto {
  userId: string;
  postId: string;
}

export interface VisitRestaurantDto {
  userId: string;
  restaurantId: string;
  cuisineType: CuisineType;
}

// ---------------------------------------------------------------------------
// Achievement Event Handler Interface (chuẩn bị cho tích hợp module quests)
// ---------------------------------------------------------------------------

export interface IAchievementEventHandler {
  handleActivityEvent(event: ActivityEvent): void;
}
