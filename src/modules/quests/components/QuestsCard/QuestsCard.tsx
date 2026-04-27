import { motion } from 'motion/react';
import { CheckCircle2, Ticket, Award, Coins, Sparkles } from 'lucide-react';
import type { AchievementWithProgress } from '@/modules/quests/types/quest.types';

// ─── helpers ────────────────────────────────────────────────────────────────

function rewardIcon(type: string) {
    switch (type) {
        case 'voucher': return <Ticket className="w-3.5 h-3.5" />;
        case 'badge': return <Award className="w-3.5 h-3.5" />;
        case 'points': return <Coins className="w-3.5 h-3.5" />;
        default: return <Sparkles className="w-3.5 h-3.5" />;
    }
}

function rewardColors(type: string) {
    switch (type) {
        case 'voucher': return 'bg-violet-50 text-violet-600 border-violet-200';
        case 'badge': return 'bg-amber-50  text-amber-600  border-amber-200';
        case 'points': return 'bg-sky-50    text-sky-600    border-sky-200';
        default: return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
}

// ─── sub-components ──────────────────────────────────────────────────────────

export function QuestCard({ ach, index }: { ach: AchievementWithProgress; index: number }) {
    const completed = ach.progress.isCompleted;
    const pct = ach.progress.progressPercent;
    const cur = ach.progress.currentCount;
    const req = ach.progress.requiredCount;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className={`relative overflow-hidden rounded-3xl border transition-all duration-300
        ${completed
                    ? 'bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-emerald-100 shadow-sm'
                    : 'bg-white border-neutral-100 shadow-sm hover:shadow-md hover:border-orange-100'}`}
        >
            {/* completed ribbon */}
            {completed && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> HOÀN THÀNH
                </div>
            )}

            <div className="p-4 flex gap-4">
                {/* icon */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner
          ${completed ? 'bg-emerald-100' : 'bg-orange-50'}`}>
                    {ach.icon || '🍜'}
                </div>

                <div className="flex-1 min-w-0">
                    {/* title */}
                    <h3 className={`font-extrabold text-base leading-tight
            ${completed ? 'text-emerald-800' : 'text-neutral-800'}`}>
                        {ach.name}
                    </h3>

                    {/* description */}
                    <p className="text-sm text-neutral-500 mt-1 leading-snug line-clamp-2">
                        {ach.description}
                    </p>

                    {/* reward chip */}
                    {ach.reward && (
                        <div className={`inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold
              px-2.5 py-1 rounded-xl border ${rewardColors(ach.reward.type)}`}>
                            {rewardIcon(ach.reward.type)}
                            {ach.reward.description}
                        </div>
                    )}
                </div>
            </div>

            {/* progress section */}
            <div className="px-4 pb-4">
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-semibold text-neutral-400">Tiến độ</span>
                    <span className={`text-xs font-black tabular-nums
            ${completed ? 'text-emerald-600' : 'text-orange-500'}`}>
                        {cur} / {req}
                    </span>
                </div>

                {/* track */}
                <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full ${completed
                            ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                            : 'bg-gradient-to-r from-orange-400 to-red-500'}`}
                    />
                </div>
            </div>
        </motion.div>
    );
}