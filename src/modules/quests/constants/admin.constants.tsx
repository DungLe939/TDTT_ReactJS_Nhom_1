import type { Reward, RewardType, ActivityEventType, CuisineType } from '../types/quest.types';
import { Ticket, Award, Coins } from 'lucide-react';

export { ALL_TAGS } from '../types/quest.types';

export const REWARD_TYPES: RewardType[] = ['voucher', 'badge', 'points'];

export const ACTIVITY_EVENT_TYPES: { value: ActivityEventType; source: string }[] = [
    { value: 'POST_CREATED', source: 'Blog' },
    { value: 'RESTAURANT_VISITED', source: 'Blog' },
    { value: 'POST_LIKED', source: 'Blog' },
    { value: 'FOOD_SCANNED', source: 'Feature 2' },
    { value: 'MENU_TRANSLATED', source: 'Feature 3' },
    { value: 'SCHEDULE_COMPLETED', source: 'Feature 1' },
    { value: 'GROUP_TASTE_USED', source: 'Feature 4' },
];

export const CUISINE_TYPES: CuisineType[] = [
    'japanese', 'vietnamese', 'italian', 'korean',
    'chinese', 'thai', 'french', 'indian',
];

export const COMMON_ICONS = [
    '🍜', '🍣', '🍕', '🌮', '🍔', '🥗', '🍱', '🥘',
    '🍛', '🍝', '🏆', '⭐', '🔥', '🎯', '💎', '🎖️',
    '🧋', '🍦', '🍩', '🎉',
];


export function rewardTypeIcon(type: RewardType) {
    switch (type) {
        case 'voucher': return <Ticket className="w-4 h-4" />;
        case 'badge': return <Award className="w-4 h-4" />;
        case 'points': return <Coins className="w-4 h-4" />;
    }
}

export function rewardTypeBadge(type: RewardType) {
    switch (type) {
        case 'voucher': return 'bg-violet-100 text-violet-700 border-violet-200';
        case 'badge': return 'bg-amber-100  text-amber-700  border-amber-200';
        case 'points': return 'bg-sky-100    text-sky-700    border-sky-200';
    }
}

export function rewardValueLabel(r: Reward) {
    switch (r.type) {
        case 'voucher': return `${r.value}% off`;
        case 'points': return `${r.value} XP`;
        case 'badge': return `×${r.value}`;
    }
}