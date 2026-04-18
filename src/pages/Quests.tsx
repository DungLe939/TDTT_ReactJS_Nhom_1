import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, Star, Flame, CheckCircle2, Lock,
  ChevronRight, Ticket, Award, Coins, Sparkles, Target
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAchievementsForUser } from '@/modules/quests/services/achievementService';
import type { AchievementWithProgress } from '@/modules/quests/types/quest.types';

// ─── helpers ────────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'active' | 'completed';

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

function StatBadge({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex-1 bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm border border-white/20">
      <p className={`text-2xl font-black ${accent}`}>{value}</p>
      <p className="text-white/70 text-xs mt-0.5 font-medium">{label}</p>
    </div>
  );
}

function QuestCard({ ach, index }: { ach: AchievementWithProgress; index: number }) {
  const completed = ach.progress.isCompleted;
  const pct = ach.progress.progressPercent;
  const cur = ach.progress.currentCount;
  const req = ach.progress.requiredCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: 'easeOut' }}
      className={`relative overflow-hidden rounded-3xl border transition-shadow
        ${completed
          ? 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200 shadow-sm shadow-emerald-100'
          : 'bg-white border-neutral-100 shadow-sm hover:shadow-md'}`}
    >
      {/* completed ribbon */}
      {completed && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
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
              {completed && <span className="ml-1 opacity-60">· Đã nhận</span>}
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
        <div className="w-full h-2.5 bg-neutral-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.06 + 0.2 }}
            className={`h-full rounded-full ${completed
              ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
              : 'bg-gradient-to-r from-orange-400 to-red-500'}`}
          />
        </div>

        {/* step dots for small requiredCount */}
        {req <= 10 && (
          <div className="flex gap-1 mt-2">
            {Array.from({ length: req }).map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full transition-colors
                ${i < cur
                  ? completed ? 'bg-emerald-400' : 'bg-orange-400'
                  : 'bg-neutral-200'}`}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ tab }: { tab: FilterTab }) {
  const messages: Record<FilterTab, { emoji: string; text: string }> = {
    all: { emoji: '🍽️', text: 'Chưa có nhiệm vụ nào. Quay lại sau nhé!' },
    active: { emoji: '🎯', text: 'Bạn đã hoàn thành tất cả nhiệm vụ rồi!' },
    completed: { emoji: '🏁', text: 'Hãy bắt đầu khám phá để nhận thưởng!' },
  };
  const { emoji, text } = messages[tab];
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-3">{emoji}</span>
      <p className="text-neutral-400 font-medium text-sm">{text}</p>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export const Quests = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>('all');

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getAchievementsForUser(user.id)
      .then(setAchievements)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const completed = achievements.filter(a => a.progress.isCompleted);
  const active = achievements.filter(a => !a.progress.isCompleted);

  const visible =
    tab === 'all' ? achievements :
      tab === 'active' ? active :
    /* completed */       completed;

  // rough XP sum from points rewards as a stand-in for total score
  const totalXP = completed.reduce((sum, a) =>
    a.reward?.type === 'points' ? sum + a.reward.value : sum, 0);

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: 'Tất cả', count: achievements.length },
    { key: 'active', label: 'Đang làm', count: active.length },
    { key: 'completed', label: 'Hoàn thành', count: completed.length },
  ];

  return (
    <div className="max-w-md mx-auto min-h-screen bg-neutral-50 pb-24">

      {/* ── header ── */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 px-5 pt-10 pb-8 rounded-b-[2.5rem] shadow-lg overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -left-6 w-32 h-32 bg-white/5 rounded-full" />

        <div className="relative">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-white/70 text-sm font-medium">Xin chào,</p>
              <h1 className="text-white text-2xl font-black tracking-tight">
                {user?.name ?? 'Nhà thám hiểm'} 👋
              </h1>
            </div>
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
              <span className="text-white font-bold text-sm">{totalXP.toLocaleString()} XP</span>
            </div>
          </div>

          {/* progress to next level — visual only for now */}
          <div className="mb-5">
            <div className="flex justify-between text-white/80 text-xs mb-1.5 font-medium">
              <span className="flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-yellow-300" /> Ẩm thực gia</span>
              <span>{completed.length} / {achievements.length} nhiệm vụ</span>
            </div>
            <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: achievements.length ? `${(completed.length / achievements.length) * 100}%` : '0%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-full"
              />
            </div>
          </div>

          {/* stat row */}
          <div className="flex gap-2">
            <StatBadge label="Đang làm" value={active.length} accent="text-white" />
            <StatBadge label="Hoàn thành" value={completed.length} accent="text-yellow-300" />
            <StatBadge label="Phần thưởng" value={completed.length} accent="text-white" />
          </div>
        </div>
      </div>

      {/* ── filter tabs ── */}
      <div className="flex gap-2 px-4 mt-5">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`relative flex-1 py-2 rounded-xl text-sm font-bold transition-all
              ${tab === t.key
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-neutral-500 border border-neutral-100 hover:border-orange-200'}`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-xs font-black
                ${tab === t.key ? 'text-white/80' : 'text-orange-400'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── section label ── */}
      <div className="flex items-center gap-2 px-4 mt-5 mb-3">
        <Target className="w-4 h-4 text-orange-500" />
        <h2 className="text-neutral-700 font-extrabold text-sm uppercase tracking-wider">
          {tab === 'all' && 'Tất cả nhiệm vụ'}
          {tab === 'active' && 'Đang thực hiện'}
          {tab === 'completed' && 'Đã hoàn thành'}
        </h2>
        <div className="flex-1 h-px bg-neutral-200" />
      </div>

      {/* ── quest list ── */}
      <div className="px-4 space-y-3">
        {loading ? (
          // skeleton
          achievements.map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-neutral-100 p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-14 h-14 bg-neutral-100 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-100 rounded-lg w-2/3" />
                  <div className="h-3 bg-neutral-100 rounded-lg w-full" />
                  <div className="h-3 bg-neutral-100 rounded-lg w-1/2" />
                </div>
              </div>
              <div className="mt-4 h-2.5 bg-neutral-100 rounded-full" />
            </div>
          ))
        ) : visible.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {visible.map((ach, i) => (
                <QuestCard key={ach.id} ach={ach} index={i} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* ── tip banner ── */}
      {!loading && active.length > 0 && tab !== 'completed' && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mx-4 mt-5 bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-3"
        >
          <span className="text-2xl">💡</span>
          <p className="text-orange-700 text-xs font-medium leading-snug flex-1">
            Đăng bài, check-in nhà hàng, hoặc sử dụng tính năng quét món ăn để tự động cập nhật tiến độ!
          </p>
          <ChevronRight className="w-4 h-4 text-orange-400 shrink-0" />
        </motion.div>
      )}

      {/* ── completed celebration ── */}
      {!loading && completed.length > 0 && tab === 'completed' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-4 mt-5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl px-4 py-4 flex items-center gap-3 shadow-md shadow-emerald-100"
        >
          <Trophy className="w-8 h-8 text-yellow-300 shrink-0" />
          <div>
            <p className="text-white font-extrabold text-sm">
              {completed.length} nhiệm vụ hoàn thành!
            </p>
            <p className="text-white/70 text-xs mt-0.5">
              Phần thưởng đã được hệ thống tự động ghi nhận.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
