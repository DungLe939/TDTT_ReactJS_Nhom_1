import { useState, useEffect } from 'react';
import type { DemoUser, UserStats, UserRewardResolved } from '../../types/quest.types';
import { Flame, Award } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router';
import { getUserStats } from '../../services/achievementService';
import { getUserRewards } from '../../services/achievementService';

interface UserAchievementCardProps {
  user: DemoUser;
}

const UserAchievementCard = ({ user }: UserAchievementCardProps) => {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);

  const handleCardClick = () => {
    if (!isLoggedIn) navigate('/auth');
  };

  const displayUser = isLoggedIn ? user : {
    id: 'guest',
    username: 'Khách',
    avatar: '👣', // Feet icon as requested in image
  };

  // fetch user's stats
  // If not logged in, we use a "Guest" profile for display
  useEffect(() => {
    if (!isLoggedIn) return;
    getUserStats(displayUser.id).then(setStats).catch(() => setStats(null));
  }, [displayUser.id, isLoggedIn]);

  // fetch badges
  const [badges, setBadges] = useState<UserRewardResolved[]>([]);
  const [badgeLoading, setBadgeLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) return;
    setBadgeLoading(true);
    getUserRewards(displayUser.id)
      .then(rewards => {
        const badgeOnly = rewards.filter(r => r.reward.type === 'badge');
        setBadges(badgeOnly);
      })
      .catch(console.error)
      .finally(() => setBadgeLoading(false));
  }, [displayUser.id, isLoggedIn]);

  if (!stats) {
    return (
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-100 flex flex-col w-full">
        {/* Banner skeleton */}
        <div className="h-24 bg-neutral-100 animate-pulse relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-neutral-200 animate-pulse" />
          </div>
        </div>

        <div className="pt-12 px-6 pb-6 flex flex-col gap-4">
          {/* Name + level */}
          <div className="flex flex-col gap-2 mt-1">
            <div className="h-5 w-32 bg-neutral-100 rounded-lg animate-pulse" />
            <div className="h-3 w-20 bg-neutral-100 rounded-lg animate-pulse" />
          </div>

          {/* Progress bar */}
          <div className="mt-2 flex flex-col gap-2">
            <div className="h-3 w-24 bg-neutral-100 rounded-lg animate-pulse" />
            <div className="w-full h-3 bg-neutral-100 rounded-full animate-pulse" />
          </div>

          {/* Badges */}
          <div className="mt-4 pt-4 border-t border-neutral-50 flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-14 h-14 rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-100 flex flex-col w-full group transition-all ${!isLoggedIn ? 'cursor-pointer hover:shadow-md' : ''}`}
      onClick={handleCardClick}
    >
      {/* Premium Banner */}
      <div className="h-24 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 relative">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center opacity-20 mix-blend-overlay" />
        <div className="absolute -bottom-10 left-6">
          <div className="w-20 h-20 rounded-2xl bg-white p-1.5 shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center text-4xl shadow-inner">
              {displayUser.avatar}
            </div>
          </div>
        </div>
      </div>

      {/* User Info Section */}
      <div className="pt-12 px-6 pb-6 flex flex-col">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <h3 className="font-black text-neutral-800 text-xl tracking-tight truncate">{displayUser.username}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase tracking-widest border border-orange-100 whitespace-nowrap">
                Cấp {stats.level}
              </span>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                {stats.levelTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[11px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
              <Flame className="w-3.5 h-3.5 text-orange-500" />Tiến trình cấp độ
            </span>
            {stats.level < 5 && (
              <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 whitespace-nowrap ml-2">
                +{stats.xpToNextLevel} XP
              </span>
            )}
          </div>
          <div className="w-full bg-neutral-100 h-3 rounded-full overflow-hidden p-0.5 border border-neutral-50 shadow-inner">
            <div
              className="bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: `${stats.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Badges Section */}
        <div className="mt-4 pt-4 border-t border-neutral-50 flex flex-col gap-3">
          <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2 whitespace-nowrap flex-shrink-0">
            <Award className="w-3.5 h-3.5 text-orange-500" /> Huy hiệu đạt được
            {badges.length > 0 && (
              <span className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100 whitespace-nowrap ml-2">
                {badges.length}
              </span>
            )}
          </h4>
          <div className="flex flex-wrap gap-2.5 max-h-28 overflow-y-auto pr-1 custom-scrollbar">
            {badges.length > 0 ? (
              badges.map(badge => (
                <div
                  title={badge.reward.description}
                  key={badge.id}
                  className="flex flex-col items-center gap-1 px-3 py-2 bg-neutral-50/50 border border-neutral-100 rounded-2xl hover:bg-white hover:shadow-md hover:border-orange-100 transition-all duration-300 group/badge"
                >
                  <span className="text-xl group-hover/badge:scale-125 transition-transform">
                    {badge.reward.icon || '🏅'}
                  </span>
                  <span className="text-[9px] font-black text-neutral-500 uppercase tracking-tighter w-full text-center truncate">{badge.reward.description}</span>
                </div>
              ))
            ) : (
              <div className="w-full py-4 text-center border-2 border-dashed border-neutral-100 rounded-2xl">
                <p className="text-[11px] text-neutral-300 font-bold italic whitespace-nowrap">Chưa có danh hiệu nào</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAchievementCard;
