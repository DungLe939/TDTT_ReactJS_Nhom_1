import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, MapPin, Camera, Users, Gift, Crown } from 'lucide-react';

const MOCK_QUESTS = [
  {
    id: 1,
    title: 'Thợ Săn Ẩm Thực',
    description: 'Chụp ảnh 3 món ăn đường phố bất kỳ.',
    reward: 'Voucher giảm 15%',
    progress: 2,
    total: 3,
    icon: <Camera className="w-6 h-6 text-amber-500" />,
    xp: 50,
  },
  {
    id: 2,
    title: 'Bậc Thầy Chợ Đêm',
    description: 'Check-in tại Chợ Đêm Đà Lạt sau 19:00.',
    reward: 'Free 1 Đồ uống',
    progress: 0,
    total: 1,
    icon: <MapPin className="w-6 h-6 text-red-500" />,
    xp: 100,
  },
  {
    id: 3,
    title: 'Team Sành Ăn',
    description: 'Đi ăn cùng 3 người bạn và sử dụng tính năng "Nhóm ăn".',
    reward: 'Giảm thêm 5% cho cả nhóm',
    progress: 0,
    total: 1,
    icon: <Users className="w-6 h-6 text-blue-500" />,
    xp: 150,
  },
];

const LEADERBOARD = [
  { rank: 1, name: 'Linh Nguyễn', level: 24, xp: '12.4k' },
  { rank: 2, name: 'Hoàng Trần', level: 21, xp: '10.2k' },
  { rank: 3, name: 'Traveler (Bạn)', level: 15, xp: '7.5k', isUser: true },
  { rank: 4, name: 'Minh Phạm', level: 14, xp: '6.8k' },
  { rank: 5, name: 'Hương Lê', level: 12, xp: '5.1k' },
];

export const Quests = () => {
  const [activeTab, setActiveTab] = useState<'quests' | 'leaderboard'>('quests');

  return (
    <div className="max-w-md mx-auto min-h-screen bg-neutral-50 pb-20">
      {/* Header & User Stats */}
      <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 text-white rounded-b-[2rem] shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6" /> Food Quests
          </h1>
          <div className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" /> 1,250 Điểm
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/20">
          <div className="flex justify-between items-end mb-2">
            <div>
              <p className="text-white/80 text-sm">Level hiện tại</p>
              <p className="text-3xl font-bold">15</p>
            </div>
            <div className="text-right">
              <p className="text-white/80 text-sm mb-1">Thực Thần Tập Sự</p>
              <p className="text-xs">7,500 / 10,000 XP</p>
            </div>
          </div>
          {/* XP Bar */}
          <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '75%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-4">
        <button
          onClick={() => setActiveTab('quests')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${activeTab === 'quests' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
        >
          Nhiệm vụ
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${activeTab === 'leaderboard' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
        >
          Bảng xếp hạng
        </button>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {activeTab === 'quests' ? (
            <motion.div
              key="quests"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {MOCK_QUESTS.map((quest) => (
                <div key={quest.id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center shrink-0">
                      {quest.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-neutral-800">{quest.title}</h3>
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">+{quest.xp} XP</span>
                      </div>
                      <p className="text-sm text-neutral-500 mt-1">{quest.description}</p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                          <Gift className="w-3.5 h-3.5" /> {quest.reward}
                        </div>
                        <div className="text-xs font-semibold text-neutral-400">
                          {quest.progress}/{quest.total}
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-3">
                        <div
                          className="h-full bg-orange-500 rounded-full transition-all"
                          style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                        />
                      </div>

                      <button className={`w-full mt-4 py-2 rounded-xl text-sm font-semibold transition-all ${quest.progress === quest.total
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                        }`}>
                        {quest.progress === quest.total ? 'Nhận thưởng' : 'Tham gia'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden"
            >
              {LEADERBOARD.map((user, index) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-4 p-4 ${index !== LEADERBOARD.length - 1 ? 'border-b border-neutral-100' : ''
                    } ${user.isUser ? 'bg-orange-50/50' : ''}`}
                >
                  <div className="w-8 text-center font-bold text-lg">
                    {user.rank === 1 ? <Crown className="w-6 h-6 text-yellow-500 mx-auto" /> :
                      user.rank === 2 ? <span className="text-neutral-400">2</span> :
                        user.rank === 3 ? <span className="text-amber-600">3</span> :
                          <span className="text-neutral-400">{user.rank}</span>}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-white font-bold shrink-0">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${user.isUser ? 'text-orange-600' : 'text-neutral-800'}`}>
                      {user.name}
                    </p>
                    <p className="text-xs text-neutral-500">Level {user.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neutral-700">{user.xp}</p>
                    <p className="text-[10px] text-neutral-400 uppercase">XP</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};