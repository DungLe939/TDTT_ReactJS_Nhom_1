// =============================================================================
// PostList — Danh sách bài viết
// =============================================================================

import type { Post, DemoUser, Restaurant } from '../../types/quest.types';
import PostCard from '../PostCard/PostCard';

interface PostListProps {
  posts: Post[];
  demoUsers: DemoUser[];
  restaurants: Restaurant[];
  currentUser: DemoUser;
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string, photoUrls?: string[]) => void;
  onLikeComment: (postId: string, commentId: string) => void;
  hasLiked: (post: Post) => boolean;
}
const PostList = ({ 
  posts, demoUsers, restaurants, currentUser, 
  onLike, onComment, onLikeComment, hasLiked 
}: PostListProps) => {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-neutral-100 flex flex-col items-center justify-center text-center gap-3">
        <span className="text-4xl">📭</span>
        <p className="text-neutral-500 font-medium">Chưa có bài viết nào. Hãy viết bài đầu tiên!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          author={demoUsers.find((u) => u.id === post.authorId)}
          restaurant={restaurants.find((r) => r.id === post.restaurantId)}
          liked={hasLiked(post)}
          currentUser={currentUser}
          demoUsers={demoUsers}
          onLike={onLike}
          onComment={onComment}
          onLikeComment={onLikeComment}
        />
      ))}
    </div>
  );
};

export default PostList;
