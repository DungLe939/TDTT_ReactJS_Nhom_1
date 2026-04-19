import axios from 'axios';
import type {
  AchievementWithProgress,
  UserRewardResolved,
  Reward,
  Achievement,
  RewardType,
  ActivityEventType,
  CuisineType,
  Tag,
} from '../types/quest.types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });

// ─── User endpoints ──────────────────────────────────────────────────────────

export async function getAchievementsForUser(userId: string): Promise<AchievementWithProgress[]> {
  const { data } = await api.get<AchievementWithProgress[]>(`/achievements/user/${userId}`);
  return data;
}

export async function getUserRewards(userId: string): Promise<UserRewardResolved[]> {
  const { data } = await api.get<UserRewardResolved[]>(`/rewards/user/${userId}`);
  return data;
}

export async function redeemVoucher(
  userId: string,
  userRewardId: string,
): Promise<{ success: boolean; discountPercent?: number; message: string }> {
  const { data } = await api.post('/rewards/redeem', { userId, userRewardId });
  return data;
}

// ─── Admin endpoints ─────────────────────────────────────────────────────────

/**
 * GET /rewards
 * Fetch all defined rewards (for the rewardId dropdown in achievement creation).
 */
export async function getAllRewards(): Promise<Reward[]> {
  const { data } = await api.get<Reward[]>('/rewards');
  return data;
}

/**
 * POST /rewards
 * Define a new reward. Admin only.
 */
export async function createReward(payload: {
  type: RewardType;
  value: number;
  description: string;
  expiresAt?: string; // ISO string
}): Promise<Reward> {
  const { data } = await api.post<Reward>('/rewards', payload);
  return data;
}

/**
 * POST /achievements
 * Define a new achievement. Admin only.
 */
export async function createAchievement(payload: {
  name: string;
  description: string;
  icon: string;
  rewardId: string;
  isActive: boolean;
  condition: {
    eventType: ActivityEventType;
    requiredCount: number;
    filters?: {
      cuisineType?: CuisineType;
      withinDays?: number;
      tag?: Tag;
    };
  };
}): Promise<Achievement> {
  const { data } = await api.post<Achievement>('/achievements', payload);
  return data;
}