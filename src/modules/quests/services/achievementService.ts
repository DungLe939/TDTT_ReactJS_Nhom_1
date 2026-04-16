import axios from 'axios';
import type { AchievementWithProgress, UserRewardResolved } from '../types/quest.types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

const api = axios.create({ baseURL: BASE_URL });

/**
 * GET /achievements/user/:userId
 * Returns all achievements with the user's current progress.
 */
export async function getAchievementsForUser(userId: string): Promise<AchievementWithProgress[]> {
  const { data } = await api.get<AchievementWithProgress[]>(`/achievements/user/${userId}`);
  return data;
}

/**
 * GET /rewards/user/:userId
 * Returns all rewards earned by the user.
 */
export async function getUserRewards(userId: string): Promise<UserRewardResolved[]> {
  const { data } = await api.get<UserRewardResolved[]>(`/rewards/user/${userId}`);
  return data;
}

/**
 * POST /rewards/redeem
 * Marks a voucher as used.
 */
export async function redeemVoucher(
  userId: string,
  userRewardId: string,
): Promise<{ success: boolean; discountPercent?: number; message: string }> {
  const { data } = await api.post('/rewards/redeem', { userId, userRewardId });
  return data;
}
