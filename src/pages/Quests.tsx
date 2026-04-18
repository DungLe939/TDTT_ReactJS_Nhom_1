import { useState, useEffect } from 'react';
import type { AchievementWithProgress } from '../modules/quests/types/quest.types';
import { useAuth } from '../modules/auth/context/AuthContext';
import { getAchievementsForUser } from '../modules/quests/services/achievementService';



import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, MapPin, Camera, Users, Gift, Crown, Heart, MessageCircle, Share2, MoreHorizontal, Send } from 'lucide-react';


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
]


const LEADERBOARD = [
  { rank: 1, name: 'Linh Nguyễn', level: 24, xp: '12.4k' },
  { rank: 2, name: 'Hoàng Trần', level: 21, xp: '10.2k' },
  { rank: 3, name: 'Traveler (Bạn)', level: 15, xp: '7.5k', isUser: true },
  { rank: 4, name: 'Minh Phạm', level: 14, xp: '6.8k' },
  { rank: 5, name: 'Hương Lê', level: 12, xp: '5.1k' },
];

type CommentType = {
  id: number;
  user: string;
  content: string;
  time: string;
};

type PostType = {
  id: number;
  user: string;
  avatar: string;
  time: string;
  content: string;
  image?: string;
  likes: number;
  comments: CommentType[];
  isLiked: boolean;
};

const INITIAL_FEED: PostType[] = [
  {
    id: 1,
    user: 'Linh Nguyễn',
    avatar: 'L',
    time: '2 giờ trước',
    content: 'Vừa hoàn thành nhiệm vụ "Thợ Săn Ẩm Thực" tại chợ đêm! Các món ăn đường phố ở đây quá tuyệt vời 🥰🍲',
    image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=600&h=400',
    likes: 124,
    comments: [
      { id: 1, user: 'Hoàng Trần', content: 'Ngon quá bạn ơi!', time: '1 giờ trước' }
    ],
    isLiked: true,
  },
  {
    id: 2,
    user: 'Hoàng Trần',
    avatar: 'H',
    time: '5 giờ trước',
    content: 'Có ai biết quán bún cá nào ngon ở quận 1 không ạ? Đang làm nhiệm vụ mà bí quá 😅',
    likes: 45,
    comments: [],
    isLiked: false,
  }
];

export const Quests = () => {
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getAchievementsForUser(user.id)
      .then(setAchievements)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const [activeTab, setActiveTab] = useState<'quests' | 'leaderboard' | 'feed'>('quests');
  const [feed, setFeed] = useState<PostType[]>(INITIAL_FEED);
  const [newPost, setNewPost] = useState('');
  const [commentText, setCommentText] = useState<{ [key: number]: string }>({});
  const [openComments, setOpenComments] = useState<{ [key: number]: boolean }>({});

  const handleLike = (postId: number) => {
    setFeed(feed.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: number) => {
    const text = commentText[postId];
    if (!text || text.trim() === '') return;

    setFeed(feed.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, { id: Date.now(), user: 'Traveler (Bạn)', content: text, time: 'Vừa xong' }]
        };
      }
      return post;
    }));

    setCommentText({ ...commentText, [postId]: '' });
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    const newPostObj = {
      id: Date.now(),
      user: 'Traveler (Bạn)',
      avatar: 'T',
      time: 'Vừa xong',
      content: newPost,
      likes: 0,
      comments: [],
      isLiked: false
    };
    setFeed([newPostObj, ...feed]);
    setNewPost('');
  };

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
      <div className="flex gap-2 p-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('quests')}
          className={`shrink-0 flex-1 min-w-[max-content] py-2 px-4 rounded-xl font-semibold text-sm transition-all ${activeTab === 'quests' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
        >
          Nhiệm vụ
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`shrink-0 flex-1 min-w-[max-content] py-2 px-4 rounded-xl font-semibold text-sm transition-all ${activeTab === 'leaderboard' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
        >
          Xếp hạng
        </button>
        <button
          onClick={() => setActiveTab('feed')}
          className={`shrink-0 flex-1 min-w-[max-content] py-2 px-4 rounded-xl font-semibold text-sm transition-all ${activeTab === 'feed' ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-neutral-500 hover:bg-neutral-100'
            }`}
        >
          Cộng đồng
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
              {loading ? (
                <div className="text-center text-neutral-400 py-8">Đang tải...</div>
              ) : (
                achievements.map((ach: AchievementWithProgress) => (
                  <div key={ach.id} className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100">
                    <div className="flex gap-4">
                      {/* icon is now an emoji string from the DB, not JSX */}
                      <div className="w-12 h-12 bg-neutral-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        {ach.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-neutral-800">{ach.name}</h3>
                          {ach.reward?.type === 'points' && (
                            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                              +{ach.reward.value} XP
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-neutral-500 mt-1">{ach.description}</p>

                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            <Gift className="w-3.5 h-3.5" /> {ach.reward?.description ?? '—'}
                          </div>
                          <div className="text-xs font-semibold text-neutral-400">
                            {ach.progress.currentCount}/{ach.progress.requiredCount}
                          </div>
                        </div>

                        <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-3">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all"
                            style={{ width: `${ach.progress.progressPercent}%` }}
                          />
                        </div>

                        {/* <button className={`w-full mt-4 py-2 rounded-xl text-sm font-semibold transition-all ${ach.progress.isCompleted
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200'
                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}>
                          {ach.progress.isCompleted ? 'Nhận thưởng' : 'Tham gia'}
                        </button> */}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          ) : activeTab === 'leaderboard' ? (
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
          ) : (
            <motion.div
              key="feed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold shrink-0">
                  T
                </div>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handlePost()}
                    placeholder="Bạn đang nghĩ gì về món ăn hôm nay?"
                    className="flex-1 bg-neutral-100 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button onClick={handlePost} className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white hover:bg-orange-600 shrink-0">
                    <Send className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

              {feed.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-white font-bold shrink-0">
                          {post.avatar}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-800 text-sm">{post.user}</p>
                          <p className="text-xs text-neutral-500">{post.time}</p>
                        </div>
                      </div>
                      <button className="text-neutral-400 hover:text-neutral-600 p-1">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </div>

                    <p className="text-sm text-neutral-700 mb-3">{post.content}</p>
                  </div>

                  {post.image && (
                    <img src={post.image} alt="Post media" className="w-full h-48 object-cover" />
                  )}

                  <div className="p-4 border-t border-neutral-50">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex gap-3">
                        <span>{post.comments.length} bình luận</span>
                        <span>0 chia sẻ</span>
                      </div>
                    </div>

                    <div className="flex pt-2 border-t border-neutral-100">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${post.isLiked ? 'text-red-500 hover:bg-red-50' : 'text-neutral-500 hover:bg-neutral-50'}`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-red-500' : ''}`} /> Thích
                      </button>
                      <button
                        onClick={() => setOpenComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                        className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" /> Bình luận
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors">
                        <Share2 className="w-5 h-5" /> Chia sẻ
                      </button>
                    </div>

                    {/* Comments Section */}
                    {openComments[post.id] && (
                      <div className="mt-4 space-y-3">
                        {post.comments.map(comment => (
                          <div key={comment.id} className="flex gap-2">
                            <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {comment.user.charAt(0)}
                            </div>
                            <div className="flex-1 bg-neutral-100 rounded-2xl rounded-tl-none p-3">
                              <p className="font-bold text-neutral-800 text-xs">{comment.user}</p>
                              <p className="text-sm text-neutral-700 mt-1">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-2 items-center pt-2">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs shrink-0">
                            T
                          </div>
                          <div className="flex-1 flex bg-neutral-100 rounded-full pr-1">
                            <input
                              type="text"
                              value={commentText[post.id] || ''}
                              onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                              placeholder="Viết bình luận..."
                              className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              className="w-8 h-8 self-center rounded-full flex items-center justify-center text-orange-500 hover:bg-orange-100 transition-colors"
                            >
                              <Send className="w-4 h-4 ml-0.5 mt-0.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
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