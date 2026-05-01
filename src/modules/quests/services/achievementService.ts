import axios from 'axios';
import type { Tag, CuisineType } from '../types/quest.types';
import type {
  AchievementWithProgress,
  UserRewardResolved,
  Reward,
  Achievement,
  RewardType,
  ActivityEventType,
  UserStats,
} from '../types/quest.types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const api = axios.create({ baseURL: BASE_URL });

// ─── User endpoints ──────────────────────────────────────────────────────────

export async function getUserStats(userId: string): Promise<UserStats> {
  const { data } = await api.get<UserStats>(`/users/${userId}/stats`);
  return data;
}

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

export async function getAllRewards(): Promise<Reward[]> {
  const { data } = await api.get<Reward[]>('/rewards');
  return data;
}

export async function createReward(payload: {
  type: RewardType;
  value: number;
  description: string;
  validForDays?: number;
}): Promise<Reward> {
  const { data } = await api.post<Reward>('/rewards', payload);
  return data;
}

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

export const achievementService = {
  getAchievementsForUser,
  getUserStats,
  getUserRewards,
  redeemVoucher,
  getAllRewards,
  createReward,
  createAchievement
};
