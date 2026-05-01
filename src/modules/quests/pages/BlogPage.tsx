import { useNavigate } from 'react-router';
import { MessageCircle } from 'lucide-react';
import { useBlog } from '../hooks/useBlog';
import CreatePostForm from '../components/CreatePostForm/CreatePostForm';
import PostList from '../components/PostList/PostList';
import PostFilter from '../components/PostFilter/PostFilter';
import RestaurantCard from '../components/RestaurantCard/RestaurantCard';
import UserAchievementCard from '../components/UserAchievementCard/UserAchievementCard';

const BlogPage = () => {
  const {
    posts, restaurants, filter, currentUser, isLoading, isLoggedIn,
    createPost, toggleLike, addComment, toggleLikeComment, visitRestaurant,
    toggleFilterTag, clearFilter, hasLiked,
  } = useBlog();

  const navigate = useNavigate();

  return (
    <div className="max-w-[1400px] mx-auto w-full pt-4 pb-20">
      {/* 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-[90px] h-fit">
          <UserAchievementCard user={currentUser} />
        </aside>

        {/* Center Main Feed */}
        <div className="col-span-1 lg:col-span-6 flex flex-col gap-6">
          {/* Create Post Flow */}
          {isLoggedIn ? (
            <CreatePostForm 
              currentUser={currentUser} restaurants={restaurants} onSubmit={createPost} 
            />
          ) : (
            <div 
              className="bg-white rounded-3xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-neutral-100 flex flex-col items-center text-center gap-4 cursor-pointer hover:bg-neutral-50 transition-all group"
              onClick={() => navigate('/auth')}
            >
              <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Chia sẻ cảm nhận của bạn</h3>
                <p className="text-sm text-neutral-500 font-medium">Đăng nhập để đăng bài và tương tác với cộng đồng nhé!</p>
              </div>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-orange-500/20 transition-all">
                Đăng nhập ngay
              </button>
            </div>
          )}
          
          {isLoading && posts.length === 0 && (
            <div className="text-center py-10 text-neutral-500 font-medium animate-pulse">
              ⏳ Đang tải nội dung...
            </div>
          )}

          <PostList 
            posts={posts} demoUsers={[]} restaurants={restaurants} currentUser={currentUser}
            onLike={toggleLike} onComment={(pid, content, photos) => addComment(pid, content, photos)}
            onLikeComment={toggleLikeComment} hasLiked={hasLiked}
          />
        </div>


        {/* Right Sidebar */}
        <aside className="hidden lg:flex lg:col-span-3 flex-col gap-6 sticky top-[90px] h-[calc(100vh-120px)]">
          <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-neutral-100 overflow-hidden flex flex-col shrink-0 max-h-[40%]">
            <PostFilter activeTags={filter.tags} onToggleTag={toggleFilterTag} onClear={clearFilter} />
          </div>
          <div className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-neutral-100 overflow-hidden flex flex-col flex-1">
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <span className="font-bold text-neutral-800 text-sm tracking-wide uppercase flex items-center gap-2">
                🌟 Đề xuất cho bạn
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {restaurants.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} onVisit={visitRestaurant} />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default BlogPage;
