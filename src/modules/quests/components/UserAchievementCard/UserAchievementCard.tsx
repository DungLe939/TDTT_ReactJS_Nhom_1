import { useMemo } from 'react';
import type { DemoUser } from '../../types/quest.types';
import { achievementService } from '../../services/achievementService';

interface UserAchievementCardProps {
  user: DemoUser;
}

const UserAchievementCard = ({ user }: UserAchievementCardProps) => {
  const stats = useMemo(() => achievementService.calculateStats(user.id), [user.id]);

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-neutral-100 flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-2xl font-bold shadow-md shrink-0">
          {user.avatar}
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold text-neutral-900 text-lg">{user.username}</h3>
          <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2 py-1 rounded-md w-fit mt-1">Cấp {stats.level}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm font-semibold">
          <span className="text-neutral-800">{stats.xp} XP</span>
          {stats.level < 5 && <span className="text-neutral-400 text-xs text-right">Lên cấp: {stats.xpToNextLevel} XP</span>}
        </div>
        <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-1000" 
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4 border-t border-neutral-100">
        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Huy hiệu đạt được</h4>
        <div className="flex flex-wrap gap-2">
          {stats.badges.length > 0 ? (
            stats.badges.map(badge => (
              <div key={badge.id} className="flex gap-1 items-center bg-neutral-50 border border-neutral-100 rounded-lg px-2 py-1.5" title={badge.description}>
                <span className="text-base">{badge.icon}</span>
                <span className="text-xs font-bold text-neutral-600">{badge.name}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-400 italic">Chỉnh chưa có danh hiệu nào</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserAchievementCard;
