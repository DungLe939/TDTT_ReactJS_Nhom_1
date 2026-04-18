import type { ActivityLog, Tag, CuisineType } from '../types/quest.types';
import { blogActivityService } from './blogActivityService';

export interface UserStats {
  xp: number;
  level: number;
  xpToNextLevel: number;
  progressPercent: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

const XP_PER_POST = 20;
const XP_PER_VISIT = 15;
const XP_PER_LIKE = 5;

const LEVELS = [
  { level: 1, minXp: 0, maxXp: 100 },
  { level: 2, minXp: 100, maxXp: 300 },
  { level: 3, minXp: 300, maxXp: 600 },
  { level: 4, minXp: 600, maxXp: 1000 },
  { level: 5, minXp: 1000, maxXp: 99999 },
];

const calculateStats = (userId: string): UserStats => {
  const logs = blogActivityService.getActivityLogs(userId);
  
  let xp = 0;
  let postCount = 0;
  let visitCount = 0;
  let likeCount = 0;

  logs.forEach(log => {
    switch (log.type) {
      case 'POST_CREATED':
        xp += XP_PER_POST;
        postCount++;
        break;
      case 'RESTAURANT_VISITED':
        xp += XP_PER_VISIT;
        visitCount++;
        break;
      case 'POST_LIKED':
        xp += XP_PER_LIKE;
        likeCount++;
        break;
    }
  });

  // Calculate Level
  const currentLevelInfo = LEVELS.find(l => xp >= l.minXp && xp < l.maxXp) || LEVELS[LEVELS.length - 1];
  const level = currentLevelInfo.level;
  const xpInCurrentLevel = xp - currentLevelInfo.minXp;
  const xpNeededForCurrentRange = currentLevelInfo.maxXp - currentLevelInfo.minXp;
  const progressPercent = level === 5 ? 100 : Math.min(100, (xpInCurrentLevel / xpNeededForCurrentRange) * 100);
  const xpToNextLevel = level === 5 ? 0 : currentLevelInfo.maxXp - xp;

  // Calculate Badges
  const badges: Badge[] = [];
  if (xp > 0) badges.push({ id: 'newbie', name: 'Người mới', icon: '🌱', description: 'Bắt đầu hành trình ẩm thực' });
  if (postCount >= 3) badges.push({ id: 'food-journalist', name: 'Nhà báo ẩm thực', icon: '✍️', description: 'Đã đăng 3 bài viết trở lên' });
  if (visitCount >= 2) badges.push({ id: 'explorer', name: 'Nhà thám hiểm', icon: '🗺️', description: 'Ghé thăm 2 nhà hàng trở lên' });
  if (xp >= 200) badges.push({ id: 'pro-foodie', name: 'Chuyên gia ẩm thực', icon: '🏆', description: 'Đạt trên 200 điểm XP' });

  return {
    xp,
    level,
    xpToNextLevel,
    progressPercent,
    badges
  };
};

export const achievementService = {
  calculateStats
};
