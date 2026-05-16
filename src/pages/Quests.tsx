import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, CheckCircle2, Target, MessageSquare, X, AlertCircle, Ticket } from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';

import { getAchievementsForUser } from '@/modules/quests/services/achievementService';
import type { AchievementWithProgress, UserRewardResolved } from '@/modules/quests/types/quest.types';
import { QuestCard } from '@/modules/quests/components/QuestsCard/QuestsCard';
import { useBlog } from '@/modules/quests/hooks/useBlog';
import CreatePostForm from '@/modules/quests/components/CreatePostForm/CreatePostForm';
import PostList from '@/modules/quests/components/PostList/PostList';
import PostFilter from '@/modules/quests/components/PostFilter/PostFilter';
import RestaurantCard from '@/modules/quests/components/RestaurantCard/RestaurantCard';
import UserAchievementCard from '@/modules/quests/components/UserAchievementCard/UserAchievementCard';
import AuthGuardCard from '@/modules/quests/components/AuthGuardCard/AuthGuardCard';
import VoucherTab from '@/modules/quests/components/VoucherTab/VoucherTab';
import { getUserRewards } from '@/modules/quests/services/achievementService';

// ─── helpers ────────────────────────────────────────────────────────────────

type FilterTab = 'community' | 'all' | 'active' | 'completed' | 'vouchers';

function EmptyState({ tab }: { tab: FilterTab }) {
  const messages: Record<string, { emoji: string; text: string }> = {
    all: { emoji: '🍽️', text: 'Chưa có nhiệm vụ nào. Quay lại sau nhé!' },
    active: { emoji: '🎯', text: 'Bạn đã hoàn thành tất cả nhiệm vụ rồi!' },
    completed: { emoji: '🏁', text: 'Hãy bắt đầu khám phá để nhận thưởng!' },
    community: { emoji: '📮', text: 'Chưa có bài viết nào. Hãy viết bài đầu tiên!' },
  };
  const { emoji, text } = messages[tab] || messages.all;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-neutral-200 dark:border-white/20">
      <span className="text-5xl mb-4 grayscale opacity-40">{emoji}</span>
      <p className="text-neutral-400 font-bold text-sm tracking-tight">{text}</p>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export const Quests = () => {
  const { user, isLoggedIn } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>('community');
  const [visibleRestaurants, setVisibleRestaurants] = useState(10);

  const {
    posts, restaurants, filter, currentUser, isLoading: blogLoading,
    createPost, toggleLike, addComment, toggleLikeComment, visitRestaurant,
    toggleFilterTag, clearFilter, hasLiked,
  } = useBlog();

  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // fetch achievements
  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getAchievementsForUser(user.id)
      .then((data) => {
        setAchievements(data);
        setQuotaExceeded(false);
      })
      .catch((err) => {
        if (err?.response?.status === 500 || err?.message?.includes('quota')) {
          setQuotaExceeded(true);
        }
      })
      .finally(() => setLoading(false));
  }, [user?.id]);

  const completed = achievements.filter(a => a.progress.isCompleted);
  const active = achievements.filter(a => !a.progress.isCompleted);
  const visible =
    tab === 'all' ? achievements :
      tab === 'active' ? active :
        tab === 'completed' ? completed : [];

  // fetch vouchers
  const [vouchers, setVouchers] = useState<UserRewardResolved[]>([]);
  const [voucherLoading, setVoucherLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;
    setVoucherLoading(true);
    getUserRewards(currentUser.id)
      .then(rewards => {
        const voucherOnly = rewards.filter(r => r.reward.type === 'voucher' && !r.isUsed);
        setVouchers(voucherOnly);
      })
      .catch(console.error)
      .finally(() => setVoucherLoading(false));
  }, [currentUser.id, isLoggedIn]);

  const validVoucherCount = useMemo(() =>
    vouchers.filter(v => {
      const ts = v.expiresAt as { _seconds: number } | undefined;
      return !ts || new Date(ts._seconds * 1000) > new Date();
    }).length
    , [vouchers]);

  // tabs
  const TABS: { key: FilterTab; label: string; count?: number; icon: any }[] = [
    { key: 'community', label: 'Cộng đồng', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'all', label: 'Tất cả', count: achievements.length, icon: <Trophy className="w-4 h-4" /> },
    { key: 'active', label: 'Đang làm', count: active.length, icon: <Target className="w-4 h-4" /> },
    { key: 'completed', label: 'Xong', count: completed.length, icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'vouchers', label: 'Voucher', count: validVoucherCount || undefined, icon: <Ticket className="w-4 h-4" /> },

  ];

  return (
    <div className="max-w-[1500px] mx-auto w-full pt-4 pb-20 px-4 sm:px-6 lg:px-8">

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* left column - profile & stats */}
        <aside className="lg:col-span-3 flex flex-col gap-6 sticky top-[90px]">
          <UserAchievementCard user={currentUser} />

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-neutral-100 dark:border-white/10">
            <h4 className="text-[11px] font-black text-neutral-800 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2 pl-3 border-l-4 border-orange-500 h-4 min-h-[16px]">
              Tóm tắt tiến độ
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-600 dark:text-gray-400">Nhiệm vụ xong</span>
                <span className="text-sm font-black text-emerald-600">{completed.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-600 dark:text-gray-400">Đang thực hiện</span>
                <span className="text-sm font-black text-orange-500">{active.length}</span>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-neutral-50 dark:border-white/10 flex flex-col gap-3">
              <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                Tham gia cộng đồng và hoàn thành nhiệm vụ để nhận những ưu đãi ẩm thực hấp dẫn nhất!
              </p>
            </div>
          </div>
        </aside>

        {/* center column - feed & quest lists */}
        <main className="lg:col-span-6 flex flex-col gap-6">

          {/* Tab Switcher */}
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-1.5 rounded-3xl border border-white/50 dark:border-white/10 shadow-sm flex gap-1 items-center sticky top-[90px] z-20">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap
        ${tab === t.key
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-neutral-500 dark:text-gray-400 hover:bg-neutral-50 dark:hover:bg-slate-800'}`}
              >
                {t.icon}
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md font-black
           ${tab === t.key ? 'bg-white/20 text-white' : 'bg-neutral-100 dark:bg-slate-700 text-neutral-400 dark:text-gray-500'}`}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col gap-6"
            >
              {tab === 'community' ? (
                <>
                  <CreatePostForm
                    currentUser={currentUser} restaurants={restaurants} onSubmit={createPost}
                  />
                  {blogLoading && posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="w-10 h-10 border-4 border-orange-200 dark:border-orange-900/30 border-t-orange-500 rounded-full animate-spin" />
                      <p className="text-sm font-bold text-neutral-400 dark:text-gray-500">Đang kết nối cộng đồng...</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <EmptyState tab="community" />
                  ) : (
                    <PostList
                      posts={posts} demoUsers={[]} restaurants={restaurants} currentUser={currentUser}
                      onLike={toggleLike} onComment={(pid, content, photos, parentId) => addComment(pid, content, photos, parentId)}
                      onLikeComment={toggleLikeComment} hasLiked={hasLiked}
                    />
                  )}
                </>
              ) : !isLoggedIn ? (
                <div className="py-8">
                  <AuthGuardCard
                    title="Đăng nhập để nhận nhiệm vụ"
                    description="Hãy đăng nhập để tham gia hành trình khám phá ẩm thực, chinh phục thử thách và nhận những phần quà hấp dẫn!"
                    icon={<Trophy className="w-10 h-10 text-orange-500" />}
                  />
                </div>
              ) : tab === 'vouchers' ? (
                <VoucherTab
                  userId={currentUser.id}
                  vouchers={vouchers}
                  loading={voucherLoading}
                  onVouchersChange={setVouchers}
                />
              ) : quotaExceeded ? (
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl px-4 py-3 flex items-center gap-3">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Tiến độ của bạn tạm thời không thể tải. Hãy thử lại sau ít phút nhé!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="bg-white dark:bg-slate-900 h-32 rounded-3xl border border-neutral-100 dark:border-white/10 animate-pulse" />
                    ))
                  ) : visible.length === 0 ? (
                    <EmptyState tab={tab} />
                  ) : (
                    visible.map((ach, i) => (
                      <QuestCard key={ach.id} ach={ach} index={i} />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* right column - discovery & filters */}
        <aside className="lg:col-span-3 flex flex-col gap-6 sticky top-[90px]">

          {/* Recommended Restaurants */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[11px] font-black text-neutral-800 dark:text-white uppercase tracking-widest flex items-center gap-2 pl-3 border-l-4 border-orange-500 h-4 min-h-[16px] mb-1">
              Đề xuất cho bạn
            </h4>
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-neutral-100 dark:border-white/10 flex flex-col max-h-[460px] overflow-hidden">
              <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {restaurants.slice(0, visibleRestaurants).map((r) => (
                  <RestaurantCard key={r.id} restaurant={r} onVisit={visitRestaurant} />
                ))}
                {visibleRestaurants < restaurants.length && (
                  <button
                    onClick={() => setVisibleRestaurants(prev => prev + 3)}
                    className="w-full py-2 text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
                  >
                    Xem thêm địa điểm
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Post Filter (only for community) */}
          <div className={`transition-all duration-500 overflow-hidden flex flex-col gap-3
             ${tab === 'community' ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0 mb-[-1.5rem]'}`}>

            <div className="flex items-center justify-between pl-3 border-l-4 border-orange-500 h-4 min-h-[16px] mb-1">
              <h4 className="text-[11px] font-black text-neutral-800 dark:text-white uppercase tracking-widest flex items-center gap-2">
                Lọc theo thẻ
                {filter.tags.length > 0 && (
                  <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded-full rotate-3 shadow-sm">
                    {filter.tags.length}
                  </span>
                )}
              </h4>
              {filter.tags.length > 0 && (
                <button
                  onClick={clearFilter}
                  className="text-[9px] font-black text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Xóa lọc
                </button>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-neutral-100 dark:border-white/10 overflow-hidden">
              <PostFilter activeTags={filter.tags} onToggleTag={toggleFilterTag} onClear={clearFilter} />
            </div>
          </div>

          {/* Tip of the day */}
          <div className="bg-gradient-to-br from-neutral-800 to-black rounded-3xl p-5 text-white relative overflow-hidden group mt-2">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all duration-700" />
            <h5 className="text-[11px] font-black uppercase tracking-widest text-orange-500 mb-2 pl-3 border-l-2 border-orange-500/30">Mẹo nhỏ</h5>
            <p className="text-[11px] font-medium leading-relaxed text-neutral-300">
              Chụp ảnh món ăn và gắn thẻ nhà hàng khi đăng bài để tăng 50% cơ hội nhận được huy hiệu "Nhà báo ẩm thực"!
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
};
