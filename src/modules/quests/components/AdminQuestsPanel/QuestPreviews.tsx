import type { Reward, RewardType } from '../../types/quest.types';
import { rewardTypeBadge, rewardTypeIcon } from '../../constants/admin.constants';

/**
 * Thẻ xem trước Reward/Achievement sẽ được tạo
 */
export function PreviewQuestCard({ icon, name, description, reward, requiredCount, eventType, isActive }: {
    icon: string; name: string; description: string; reward: Reward | null;
    requiredCount: string; eventType: string; isActive: boolean;
}) {
    const req = Number(requiredCount) || 1;
    return (
        <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
            <div className={`absolute top-0 left-0 right-0 h-1 ${isActive ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-neutral-200'}`} />
            <div className="p-4 flex gap-3 mt-1">
                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl shrink-0">
                    {icon || '🍜'}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-neutral-800 leading-tight">
                        {name || <span className="text-neutral-300">Tên nhiệm vụ...</span>}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5 line-clamp-2">
                        {description || <span className="text-neutral-300">Mô tả...</span>}
                    </p>
                    {reward && (
                        <div className={`inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold
              px-2 py-0.5 rounded-lg border ${rewardTypeBadge(reward.type)}`}>
                            {rewardTypeIcon(reward.type)} {reward.description}
                        </div>
                    )}
                </div>
            </div>
            <div className="px-4 pb-3">
                <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-neutral-400 font-semibold">Tiến độ</span>
                    <span className="font-black text-orange-500">0 / {req}</span>
                </div>
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full w-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full" />
                </div>
                {req <= 10 && (
                    <div className="flex gap-1 mt-1.5">
                        {Array.from({ length: req }).map((_, i) => (
                            <div key={i} className="flex-1 h-1 rounded-full bg-neutral-200" />
                        ))}
                    </div>
                )}
                {eventType && (
                    <p className="text-[9px] text-neutral-400 mt-1.5">
                        Trigger: <code className="bg-neutral-100 px-1 rounded">{eventType}</code>
                    </p>
                )}
            </div>
            {!isActive && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                    <span className="text-xs font-bold text-neutral-400 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
                        Nháp — chưa kích hoạt
                    </span>
                </div>
            )}
        </div>
    );
}

export function PreviewRewardCard({ type, description, value, validForDays }: {
    type: RewardType; description: string; value: string; validForDays: string;
}) {
    return (
        <div className={`rounded-2xl border p-4 ${rewardTypeBadge(type)}`}>
            <div className="flex items-center gap-2 mb-2">
                {rewardTypeIcon(type)}
                <span className="text-xs font-black uppercase tracking-widest">{type}</span>
                {value && (
                    <span className="ml-auto text-sm font-black">
                        {type === 'voucher' ? `${value}% off` : type === 'points' ? `${value} XP` : `×${value}`}
                    </span>
                )}
            </div>
            <p className="text-sm font-semibold leading-snug">
                {description || <span className="opacity-40">Mô tả reward...</span>}
            </p>
            {validForDays && (
                <p className="text-[11px] opacity-60 mt-2 font-medium">
                    Thời hạn: {validForDays} ngày
                </p>
            )}
        </div>
    );
}
