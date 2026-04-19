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

export const SEED_RESTAURANTS: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Phở Thìn',
    cuisineType: 'vietnamese',
    location: '13 Lò Đúc, Hai Bà Trưng, Hà Nội',
    priceRange: 'budget',
    rating: 4.7,
    openingHours: '06:00 – 22:00',
  },
  {
    id: 'rest-2',
    name: 'Sushi Tei',
    cuisineType: 'japanese',
    location: '72 Trần Hưng Đạo, Q1, TP.HCM',
    priceRange: 'mid-range',
    rating: 4.4,
    openingHours: '11:00 – 22:00',
  },
  {
    id: 'rest-3',
    name: 'Bún Chả Hương Liên',
    cuisineType: 'vietnamese',
    location: '24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội',
    priceRange: 'budget',
    rating: 4.8,
    openingHours: '08:00 – 20:00',
  },
  {
    id: 'rest-4',
    name: 'Sakura Japanese Restaurant',
    cuisineType: 'japanese',
    location: '55 Pasteur, Q3, TP.HCM',
    priceRange: 'fine-dining',
    rating: 4.6,
    openingHours: '11:30 – 22:30',
  },
  {
    id: 'rest-5',
    name: 'Cơm Tấm Sài Gòn',
    cuisineType: 'vietnamese',
    location: '84 Đinh Tiên Hoàng, Q1, TP.HCM',
    priceRange: 'budget',
    rating: 4.5,
    openingHours: '07:00 – 21:00',
  },
];

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
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
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

export const SEED_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'user-2',
    content: 'Vừa thử sushi ở Sushi Tei, ngon tuyệt vời! Cá hồi tươi, cơm dẻo vừa phải 🍣. Giá hơi cao nhưng xứng đáng!',
    tags: ['japanese', 'fine-dining'],
    restaurantId: 'rest-2',
    createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
    likesCount: 3,
    likedByUserIds: ['user-1', 'user-3', 'user-2'],
    comments: [],
  },
  {
    id: 'post-2',
    authorId: 'user-1',
    content: 'Phở Thìn buổi sáng là không thể thiếu ☀️ Nước dùng đậm đà, thịt bò mềm. Chỉ 50k/bát mà no đến tận trưa!',
    tags: ['vietnamese', 'budget', 'breakfast'],
    restaurantId: 'rest-1',
    createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
    likesCount: 5,
    likedByUserIds: ['user-2', 'user-3'],
    comments: [],
  },
  {
    id: 'post-3',
    authorId: 'user-3',
    content: 'Bún chả Hương Liên nổi tiếng từ thời ông Obama ghé thăm 😄 Chả nướng thơm, bún tươi, nước mắm chua ngọt rất chuẩn vị.',
    tags: ['vietnamese', 'lunch', 'budget'],
    restaurantId: 'rest-3',
    createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    likesCount: 8,
    likedByUserIds: ['user-1', 'user-2'],
    comments: [],
  },
  {
    id: 'post-4',
    authorId: 'user-2',
    content: 'Sakura Restaurant có set lunch khá ổn áp, khoảng 300k/người. Không gian yên tĩnh, phù hợp cho buổi ăn trưa với đối tác.',
    tags: ['japanese', 'lunch', 'fine-dining'],
    restaurantId: 'rest-4',
    createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likesCount: 2,
    likedByUserIds: ['user-3'],
    comments: [],
  },
  {
    id: 'post-5',
    authorId: 'user-1',
    content: 'Cơm Tấm Sài Gòn — linh hồn của bữa sáng miền Nam 🍳 Sườn nướng vàng ươm, trứng ốp la, bì và mỡ hành. Quá đã!',
    tags: ['vietnamese', 'street-food', 'breakfast', 'budget'],
    restaurantId: 'rest-5',
    createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likesCount: 6,
    likedByUserIds: ['user-2', 'user-3'],
    comments: [],
  },
];
