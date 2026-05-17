import type {
  Achievement,
  DemoUser,
  Post,
  Restaurant,
  Reward,
} from '../types/quest.types';

// ---------------------------------------------------------------------------
// Demo users (for user-switcher dropdown)
// ---------------------------------------------------------------------------

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-1',
    username: 'Nguyen Van A',
    avatar: '🧑‍🍳',
    level: 3,
    points: 150,
    achievements: ['ach-1', 'ach-2'],
    foodPreferences: ['vietnamese', 'street-food', 'budget'],
    budget: 'budget',
  },
  {
    id: 'user-2',
    username: 'Tran Thi B',
    avatar: '🍜',
    level: 5,
    points: 280,
    achievements: ['ach-1', 'ach-4', 'ach-5'],
    foodPreferences: ['japanese', 'korean', 'mid-range'],
    budget: 'mid-range',
  },
  {
    id: 'user-3',
    username: 'Dang Thanh C',
    avatar: '🍽️',
    level: 2,
    points: 90,
    achievements: ['ach-1'],
    foodPreferences: ['french', 'fine-dining', 'vegetarian'],
    budget: 'fine-dining',
  },
];

// ---------------------------------------------------------------------------
// Seed restaurants
// ---------------------------------------------------------------------------

export const SEED_RESTAURANTS: Restaurant[] = [];

// ---------------------------------------------------------------------------
// Seed rewards
// ---------------------------------------------------------------------------

export const SEED_REWARDS: Reward[] = [
  { id: 'reward-1', type: 'badge', value: 0, description: 'Huy hiệu: Người Đăng Đầu Tiên 🏅' },
  { id: 'reward-2', type: 'points', value: 50, description: '50 điểm thưởng ⭐' },
  { id: 'reward-3', type: 'points', value: 100, description: '100 điểm thưởng ⭐⭐' },
  { id: 'reward-4', type: 'points', value: 50, description: '50 điểm thưởng ⭐' },
  {
    id: 'reward-5', type: 'voucher', value: 10, description: 'Voucher giảm 10% 🎫',
    validForDays: 30
  },
  { id: 'reward-6', type: 'badge', value: 0, description: 'Huy hiệu: Tín Đồ Ramen 🍜' },
  { id: 'reward-7', type: 'points', value: 75, description: '75 điểm thưởng ⭐' },
  { id: 'reward-8', type: 'badge', value: 0, description: 'Huy hiệu: Thám Tử Ẩm Thực 🔍' },
];

// ---------------------------------------------------------------------------
// Seed achievements
// ---------------------------------------------------------------------------

export const SEED_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1', name: 'First Post!', icon: '📝',
    description: 'Đăng bài viết đầu tiên của bạn',
    condition: { eventType: 'POST_CREATED', requiredCount: 1 },
    rewardId: 'reward-1', isActive: true,
  },
  {
    id: 'ach-2', name: 'Food Explorer', icon: '🗺️',
    description: 'Ghé thăm 3 nhà hàng',
    condition: { eventType: 'RESTAURANT_VISITED', requiredCount: 3 },
    rewardId: 'reward-2', isActive: true,
  },
  {
    id: 'ach-3', name: 'Foodie', icon: '🍴',
    description: 'Ghé thăm 10 nhà hàng',
    condition: { eventType: 'RESTAURANT_VISITED', requiredCount: 10 },
    rewardId: 'reward-3', isActive: true,
  },
  {
    id: 'ach-4', name: 'Social Butterfly', icon: '🦋',
    description: 'Thích 5 bài viết của người khác',
    condition: { eventType: 'POST_LIKED', requiredCount: 5 },
    rewardId: 'reward-4', isActive: true,
  },
  {
    id: 'ach-5', name: 'Japanese Aficionado', icon: '🍣',
    description: 'Ghé thăm 3 nhà hàng Nhật Bản',
    condition: { eventType: 'RESTAURANT_VISITED', requiredCount: 3, filters: { cuisineType: 'japanese' } },
    rewardId: 'reward-5', isActive: true,
  },
  {
    id: 'ach-6', name: 'Ramen Lover', icon: '🍜',
    description: 'Đăng 3 bài viết gắn thẻ "japanese"',
    condition: { eventType: 'POST_CREATED', requiredCount: 3, filters: { tag: 'japanese' } },
    rewardId: 'reward-6', isActive: true,
  },
  {
    id: 'ach-7', name: 'Street Food King', icon: '🛵',
    description: 'Ghé thăm 5 quán ăn đường phố',
    condition: { eventType: 'RESTAURANT_VISITED', requiredCount: 5, filters: { tag: 'street-food' } },
    rewardId: 'reward-7', isActive: true,
  },
  {
    id: 'ach-8', name: 'Scanner', icon: '🔍',
    description: 'Nhận diện 1 món ăn bằng camera (Feature 2)',
    condition: { eventType: 'FOOD_SCANNED', requiredCount: 1 },
    rewardId: 'reward-8', isActive: true,
  },
];

// ---------------------------------------------------------------------------
// Seed posts
// ---------------------------------------------------------------------------

const now = Date.now();

export const SEED_POSTS: Post[] = [];
