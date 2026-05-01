// =============================================================================
// BLOG ACTIVITY SERVICE — IBlogService implementation
// Writes ActivityLog + fires events to IAchievementEventHandler
// =============================================================================

import type {
  ActivityLog,
  BlogActivityType,
  ActivityEvent,
  Tag,
  CuisineType,
} from '../types/quest.types';

import type { IAchievementEventHandler } from '../types/blog.types';

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------

let activityLogs: ActivityLog[] = [];
let nextId = 1;

// ---------------------------------------------------------------------------
// Achievement handler (injectable — set by the quests module)
// ---------------------------------------------------------------------------

let achievementHandler: IAchievementEventHandler | null = null;

/**
 * Cho phép module quests đăng ký handler để nhận activity events
 */
const registerAchievementHandler = (handler: IAchievementEventHandler): void => {
  achievementHandler = handler;
};

// ---------------------------------------------------------------------------
// Core: logActivity (IBlogService)
// ---------------------------------------------------------------------------

interface LogActivityParams {
  userId: string;
  type: BlogActivityType;
  targetId: string;
  metadata?: {
    cuisineType?: CuisineType;
    tags?: Tag[];
    likedPostAuthorId?: string;
  };
}

/**
 * Ghi activity log và trigger achievement event
 */
const logActivity = (params: LogActivityParams): ActivityLog => {
  const log: ActivityLog = {
    id: `log-${nextId++}`,
    userId: params.userId,
    type: params.type,
    targetId: params.targetId,
    occurredAt: new Date().toISOString(),
    metadata: params.metadata,
  };

  activityLogs = [...activityLogs, log];

  // Fire event to achievement system (Diagram 1: IBlogService → calls → IAchievementEventHandler)
  if (achievementHandler) {
    const event: ActivityEvent = {
      userId: params.userId,
      type: params.type,
      occurredAt: log.occurredAt,
      payload: {
        postId: params.type === 'POST_CREATED' || params.type === 'POST_LIKED'
          ? params.targetId : undefined,
        restaurantId: params.type === 'RESTAURANT_VISITED'
          ? params.targetId : undefined,
        cuisineType: params.metadata?.cuisineType,
        tags: params.metadata?.tags,
      },
    };
    achievementHandler.handleActivityEvent(event);
  }

  return log;
};

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

const getActivityLogs = (userId?: string): ActivityLog[] => {
  if (userId) {
    return activityLogs.filter((log) => log.userId === userId);
  }
  return [...activityLogs];
};

// ---------------------------------------------------------------------------
// Reset (for testing)
// ---------------------------------------------------------------------------

const resetActivityLogs = (): void => {
  activityLogs = [];
  nextId = 1;
};

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const blogActivityService = {
  logActivity,
  getActivityLogs,
  resetActivityLogs,
  registerAchievementHandler,
};
