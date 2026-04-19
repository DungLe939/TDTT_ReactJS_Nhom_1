import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy, Star, Flame, CheckCircle2, Lock,
  ChevronRight, Ticket, Award, Coins, Sparkles, Target, MessageSquare,
  Tag as TagIcon, X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { getAchievementsForUser } from '@/modules/quests/services/achievementService';
import type { AchievementWithProgress } from '@/modules/quests/types/quest.types';
import { useBlog } from '@/modules/quests/hooks/useBlog';
import CreatePostForm from '@/modules/quests/components/CreatePostForm/CreatePostForm';
import PostList from '@/modules/quests/components/PostList/PostList';
import PostFilter from '@/modules/quests/components/PostFilter/PostFilter';
import RestaurantCard from '@/modules/quests/components/RestaurantCard/RestaurantCard';
import UserAchievementCard from '@/modules/quests/components/UserAchievementCard/UserAchievementCard';
import AuthGuardCard from '@/modules/quests/components/AuthGuardCard/AuthGuardCard';

// ─── helpers ────────────────────────────────────────────────────────────────

type FilterTab = 'community' | 'all' | 'active' | 'completed';

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

function QuestCard({ ach, index }: { ach: AchievementWithProgress; index: number }) {
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
      {completed && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          <CheckCircle2 className="w-3 h-3" /> HOÀN THÀNH
        </div>
      )}

      <div className="p-4 flex gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 shadow-inner
          ${completed ? 'bg-emerald-100' : 'bg-orange-50'}`}>
          {ach.icon || '🍜'}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-extrabold text-base leading-tight
            ${completed ? 'text-emerald-800' : 'text-neutral-800'}`}>
            {ach.name}
          </h3>
          <p className="text-sm text-neutral-500 mt-1 leading-snug line-clamp-2">
            {ach.description}
          </p>
          {ach.reward && (
            <div className={`inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold
              px-2.5 py-1 rounded-xl border ${rewardColors(ach.reward.type)}`}>
              {rewardIcon(ach.reward.type)}
              {ach.reward.description}
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-neutral-400">Tiến độ</span>
          <span className={`text-xs font-black tabular-nums
            ${completed ? 'text-emerald-600' : 'text-orange-500'}`}>
            {cur} / {req}
          </span>
        </div>
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

function EmptyState({ tab }: { tab: FilterTab }) {
  const messages: Record<string, { emoji: string; text: string }> = {
    all: { emoji: '🍽️', text: 'Chưa có nhiệm vụ nào. Quay lại sau nhé!' },
    active: { emoji: '🎯', text: 'Bạn đã hoàn thành tất cả nhiệm vụ rồi!' },
    completed: { emoji: '🏁', text: 'Hãy bắt đầu khám phá để nhận thưởng!' },
    community: { emoji: '📮', text: 'Chưa có bài viết nào. Hãy viết bài đầu tiên!' },
  };
  const { emoji, text } = messages[tab] || messages.all;
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
      <span className="text-5xl mb-4 grayscale opacity-40">{emoji}</span>
      <p className="text-neutral-400 font-bold text-sm tracking-tight">{text}</p>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export const Quests = () => {
  const { user, isLoggedIn } = useAuth();
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<FilterTab>('community');
  const [visibleRestaurants, setVisibleRestaurants] = useState(2);

  const {
    posts, restaurants, filter, currentUser, isLoading: blogLoading,
    createPost, toggleLike, addComment, toggleLikeComment, visitRestaurant,
    toggleFilterTag, clearFilter, hasLiked,
  } = useBlog();

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
        tab === 'completed' ? completed : [];

  const TABS: { key: FilterTab; label: string; count?: number; icon: any }[] = [
    { key: 'community', label: 'Cộng đồng', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'all', label: 'Tất cả', count: achievements.length, icon: <Trophy className="w-4 h-4" /> },
    { key: 'active', label: 'Đang làm', count: active.length, icon: <Target className="w-4 h-4" /> },
    { key: 'completed', label: 'Xong', count: completed.length, icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-[1500px] mx-auto w-full pt-4 pb-20 px-4 sm:px-6 lg:px-8">
      
      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* left column - profile & stats */}
        <aside className="lg:col-span-3 flex flex-col gap-6 sticky top-[90px]">
          <UserAchievementCard user={currentUser} />
          
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-neutral-100">
            <h4 className="text-[11px] font-black text-neutral-800 uppercase tracking-widest mb-4 flex items-center gap-2 pl-3 border-l-4 border-orange-500 h-4 min-h-[16px]">
               Tóm tắt tiến độ
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-600">Nhiệm vụ xong</span>
                <span className="text-sm font-black text-emerald-600">{completed.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-neutral-600">Đang thực hiện</span>
                <span className="text-sm font-black text-orange-500">{active.length}</span>
              </div>
            </div>
            <div className="mt-5 pt-5 border-t border-neutral-50 flex flex-col gap-3">
               <p className="text-[10px] text-neutral-400 font-medium leading-relaxed">
                 Tham gia cộng đồng và hoàn thành nhiệm vụ để nhận những ưu đãi ẩm thực hấp dẫn nhất!
               </p>
            </div>
          </div>
        </aside>

        {/* center column - feed & lists */}
        <main className="lg:col-span-6 flex flex-col gap-6">
          
          {/* Tab Switcher */}
          <div className="bg-white/70 backdrop-blur-md p-1.5 rounded-3xl border border-white/50 shadow-sm flex gap-1 items-center sticky top-[90px] z-20">
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-bold transition-all
                  ${tab === t.key
                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'text-neutral-500 hover:bg-neutral-50'}`}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
                {t.count !== undefined && (
                  <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-md font-black
                    ${tab === t.key ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-400'}`}>
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
                       <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                       <p className="text-sm font-bold text-neutral-400">Đang kết nối cộng đồng...</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <EmptyState tab="community" />
                  ) : (
                    <PostList 
                      posts={posts} demoUsers={[]} restaurants={restaurants} currentUser={currentUser}
                      onLike={toggleLike} onComment={(pid, content, photos) => addComment(pid, content, photos)}
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
              ) : (
                <div className="space-y-4">
                  {loading ? (
                     Array.from({ length: 3 }).map((_, i) => (
                       <div key={i} className="bg-white h-32 rounded-3xl border border-neutral-100 animate-pulse" />
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
            <h4 className="text-[11px] font-black text-neutral-800 uppercase tracking-widest flex items-center gap-2 pl-3 border-l-4 border-orange-500 h-4 min-h-[16px] mb-1">
               Đề xuất cho bạn
            </h4>
            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 flex flex-col max-h-[460px] overflow-hidden">
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
              <h4 className="text-[11px] font-black text-neutral-800 uppercase tracking-widest flex items-center gap-2">
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

            <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
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
