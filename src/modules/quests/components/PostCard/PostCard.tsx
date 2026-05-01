import { useState, useRef } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Smile, Camera, X, MapPin } from 'lucide-react';
import type { Post, DemoUser, Restaurant } from '../../types/quest.types';

interface PostCardProps {
  post: Post;
  author: DemoUser | undefined;
  restaurant: Restaurant | undefined;
  liked: boolean;
  currentUser: DemoUser;
  demoUsers: DemoUser[];
  onLike: (postId: string) => void;
  onComment: (postId: string, content: string, photos: string[], parentId?: string) => void;
  onLikeComment: (postId: string, commentId: string) => void;
}

const formatRelativeTime = (isoString: string): string => {
  if (!isoString) return 'Vừa xong';
  const dateObj = new Date(isoString);
  if (isNaN(dateObj.getTime())) return 'Thời gian không hợp lệ';

  const diff = Date.now() - dateObj.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return dateObj.toLocaleDateString('vi-VN');
};

const PostCard = ({ 
  post, author, restaurant, liked, currentUser, demoUsers, 
  onLike, onComment, onLikeComment 
}: PostCardProps) => {
  const [animating, setAnimating] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [commentPhotos, setCommentPhotos] = useState<string[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyingTo, setReplyingTo] = useState<{ id: string, username: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const QUICK_EMOJIS = ['😊', '😍', '👍', '🔥', '👏', '🤤', '💯', '❤️'];

  const handleLike = () => {
    if (!liked) {
      setAnimating(true);
      setTimeout(() => setAnimating(false), 400);
    }
    onLike(post.id);
  };

  const handlePhotoUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCommentPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const addEmoji = (emoji: string) => {
    setCommentText(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmitComment = () => {
    if (!commentText.trim() && commentPhotos.length === 0) return;
    onComment(post.id, commentText.trim(), commentPhotos, replyingTo?.id);
    setCommentText('');
    setCommentPhotos([]);
    setReplyingTo(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmitComment();
    }
  };

  const getUser = (userId: string) => demoUsers.find((u) => u.id === userId);

  // Safety checks
  const photoUrls = post.photoUrls || [];
  const tags = post.tags || [];
  const comments = post.comments || [];

  return (
    <article className="bg-white rounded-3xl shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-neutral-100 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
            {author?.avatar ?? '👤'}
          </div>
          <div>
            <h4 className="font-bold text-neutral-900 text-sm leading-tight">
              {author?.username ?? 'Người dùng ẩn danh'}
            </h4>
            <span className="text-xs text-neutral-400 font-medium">
              {formatRelativeTime(post.createdAt)}
            </span>
          </div>
        </div>
        <button className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 rounded-full hover:bg-neutral-50">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-neutral-800 text-[15px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag) => (
              <span 
                key={tag} 
                className="text-[10px] font-black text-orange-500 bg-orange-50 px-2 py-1 rounded-lg uppercase tracking-wider"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Photos */}
      {photoUrls.length > 0 && (
        <div className={`px-4 pb-3 grid gap-2 ${photoUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {photoUrls.map((url, index) => (
            <div 
              key={index} 
              className={`relative rounded-2xl overflow-hidden cursor-pointer group ${photoUrls.length > 2 && index === 0 ? 'row-span-2 aspect-[4/5]' : 'aspect-square'}`}
              onClick={() => setSelectedImg(url)}
            >
              <img src={url} alt={`Post content ${index}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Overlay */}
      {selectedImg && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedImg(null)}
        >
          <button className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImg} alt="Enlarged" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </div>
      )}

      {restaurant && (
        <div className="px-4 mb-4 flex flex-col gap-1.5 py-1">
          <div className="flex items-center gap-1.5 text-sm font-black text-orange-600">
            <MapPin className="w-3.5 h-3.5 fill-orange-50" /> {restaurant.name.toUpperCase()}
          </div>
          <div className="text-[11px] text-neutral-500 font-bold ml-5 leading-tight">
            {restaurant.address || 
             (typeof restaurant.location === 'string' ? restaurant.location : '') || 
             (restaurant.location as any)?.address || 
             (restaurant.location as any)?.name || 
             'Chưa định vị địa chỉ'}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="px-4 py-2 border-t border-neutral-50 flex items-center justify-between text-neutral-500">
        <div className="flex gap-4">
          <button 
            className={`flex items-center gap-2 text-sm font-bold transition-all ${liked ? 'text-red-500' : 'hover:text-red-400'} ${currentUser.id === 'guest' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => currentUser.id !== 'guest' && handleLike()}
            title={currentUser.id === 'guest' ? 'Đăng nhập để thích bài viết' : ''}
          >
            <div className={`transition-transform ${animating ? 'scale-150' : 'scale-100'}`}>
              <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            </div>
            {post.likesCount}
          </button>
          <button 
            className={`flex items-center gap-2 text-sm font-bold transition-colors ${showComments ? 'text-orange-500' : 'hover:text-orange-400'}`}
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="w-5 h-5" />
            {comments.length}
          </button>
        </div>
        <div className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest hidden sm:block">
          {currentUser.id === 'guest' ? 'Đăng nhập để tương tác' : 'Cảm ơn bạn đã đóng góp'}
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="bg-neutral-50 border-t border-neutral-100 p-4 transition-all animate-in slide-in-from-top-4 duration-300">
          <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {comments.filter(c => !c.parentId).map((comment) => {
              const commentAuthor = getUser(comment.authorId);
              const isCommentLiked = comment.likedByUserIds?.includes(currentUser.id) ?? false;
              const likesCount = comment.likesCount ?? 0;
              const commentPhotos = comment.photoUrls || [];
              const replies = comments.filter(c => c.parentId === comment.id);

              return (
                <div key={comment.id} className="flex flex-col">
                  {/* Root Comment */}
                  <div className="flex gap-3 group relative">
                    {/* Connecting line for replies */}
                    {replies.length > 0 && (
                      <div className="absolute left-[15px] top-[40px] bottom-0 w-[2px] bg-neutral-100" />
                    )}
                    
                    <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-white font-bold text-xs shrink-0 mt-1 shadow-sm relative z-10">
                      {commentAuthor?.avatar ?? '👤'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-1">
                        <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm border border-neutral-100 w-fit max-w-[90%]">
                          <span className="block font-bold text-neutral-900 text-xs mb-1">
                            {commentAuthor?.username ?? 'Người dùng ẩn danh'}
                          </span>
                          <p className="text-sm text-neutral-700 leading-relaxed">{comment.content}</p>
                          
                          {commentPhotos.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {commentPhotos.map((url, i) => (
                                <img 
                                  key={i} 
                                  src={url} 
                                  alt="Comment" 
                                  className="w-20 h-20 object-cover rounded-xl cursor-pointer border border-neutral-100"
                                  onClick={() => setSelectedImg(url)} 
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 text-neutral-300 hover:text-neutral-500 transition-opacity p-2 self-center">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-4 mt-1.5 ml-2 pb-2">
                        <span className="text-[10px] font-medium text-neutral-400">
                          {formatRelativeTime(comment.createdAt)}
                        </span>
                        <button 
                          className={`text-[11px] font-bold transition-colors ${isCommentLiked ? 'text-red-500' : 'text-neutral-500 hover:text-neutral-800'}`}
                          onClick={() => onLikeComment(post.id, comment.id)}
                        >
                          Thích
                        </button>
                        <button 
                          className="text-[11px] font-bold text-neutral-500 hover:text-neutral-800 transition-colors"
                          onClick={() => {
                            setReplyingTo({ id: comment.id, username: commentAuthor?.username || 'Người dùng ẩn danh' });
                            inputRef.current?.focus();
                          }}
                        >
                          Trả lời
                        </button>
                        {likesCount > 0 && (
                          <div className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded-full shadow-sm text-[10px] font-bold text-red-500 border border-neutral-50">
                            <Heart className="w-2.5 h-2.5 fill-current" /> {likesCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {replies.length > 0 && (
                    <div className="flex flex-col mt-1 ml-[15px]">
                      {replies.map((reply, idx) => {
                        const replyAuthor = getUser(reply.authorId);
                        const isReplyLiked = reply.likedByUserIds?.includes(currentUser.id) ?? false;
                        const isLast = idx === replies.length - 1;
                        
                        return (
                          <div key={reply.id} className="flex gap-2 group relative">
                            {/* Curved branch line */}
                            <div className="absolute -left-[14px] top-0 bottom-0 w-[2px] bg-neutral-100" />
                            <div className={`absolute -left-[14px] top-0 h-[22px] w-[14px] border-l-2 border-b-2 border-neutral-100 rounded-bl-xl`} />
                            
                            <div className="pl-3 flex gap-2 w-full pb-3">
                              <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-white font-bold text-[10px] shrink-0 mt-1 shadow-sm relative z-10 border-2 border-white">
                                {replyAuthor?.avatar ?? '👤'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-2xl rounded-tl-none p-2.5 shadow-sm border border-neutral-100 w-fit max-w-[95%]">
                                  <span className="block font-bold text-neutral-900 text-[11px] mb-0.5">
                                    {replyAuthor?.username ?? 'Người dùng ẩn danh'}
                                  </span>
                                  <p className="text-xs text-neutral-700 leading-relaxed">
                                    <span className="font-bold text-neutral-900 mr-1.5 cursor-pointer hover:underline">
                                      {commentAuthor?.username}
                                    </span>
                                    {reply.content}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 mt-1 ml-2">
                                  <span className="text-[9px] font-medium text-neutral-400">
                                    {formatRelativeTime(reply.createdAt)}
                                  </span>
                                  <button 
                                    className={`text-[10px] font-bold transition-colors ${isReplyLiked ? 'text-orange-500' : 'text-neutral-500 hover:text-neutral-800'}`}
                                    onClick={() => onLikeComment(post.id, reply.id)}
                                  >
                                    Thích
                                  </button>
                                  <button 
                                    className="text-[10px] font-bold text-neutral-500 hover:text-neutral-800 transition-colors"
                                    onClick={() => {
                                      setReplyingTo({ id: comment.id, username: replyAuthor?.username || 'Người dùng ẩn danh' });
                                      inputRef.current?.focus();
                                    }}
                                  >
                                    Trả lời
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Comment input area */}
          <div className="flex gap-3 pt-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
              {currentUser.avatar}
            </div>
            <div className="flex-1 flex flex-col pt-0.5">
              {replyingTo && (
                <div className="flex items-center justify-between px-3 py-1 bg-neutral-100 rounded-t-xl text-[10px] border-x border-t border-neutral-200">
                  <span className="text-neutral-500 font-bold">
                    Đang trả lời <span className="text-orange-500">@{replyingTo.username}</span>
                  </span>
                  <button 
                    onClick={() => setReplyingTo(null)}
                    className="text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <div className={`bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden relative group-focus-within:border-orange-300 transition-colors ${replyingTo ? 'rounded-t-none' : ''}`}>
                {/* Preview Photos */}
                {commentPhotos.length > 0 && (
                  <div className="flex gap-2 p-3 bg-neutral-50/50 border-b border-neutral-100 items-center overflow-x-auto">
                    {commentPhotos.map((url, i) => (
                      <div key={i} className="relative shrink-0">
                        <img src={url} alt="Preview" className="w-14 h-14 rounded-xl object-cover border border-white shadow-sm" />
                        <button 
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-100 shadow-sm"
                          onClick={() => setCommentPhotos(ps => ps.filter((_, idx) => idx !== i))}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button 
                      className="w-14 h-14 rounded-xl border-2 border-dashed border-neutral-200 flex items-center justify-center text-neutral-300 hover:text-orange-400 hover:border-orange-200 transition-colors"
                      onClick={handlePhotoUpload}
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <div className="flex items-center pr-2 group">
                  <input
                    ref={inputRef}
                    type="text"
                    className={`flex-1 bg-transparent px-4 py-2.5 text-sm outline-none placeholder-neutral-400 ${currentUser.id === 'guest' ? 'cursor-not-allowed' : ''}`}
                    placeholder={currentUser.id === 'guest' ? 'Đăng nhập để bình luận...' : (replyingTo ? `Trả lời @${replyingTo.username}...` : "Viết bình luận...")}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={currentUser.id === 'guest'}
                  />
                  
                  <div className="flex items-center gap-0.5">
                    <div className="relative">
                      <button 
                        className={`p-2 transition-colors ${showEmojiPicker ? 'text-orange-500' : 'text-neutral-400 hover:text-neutral-600'} ${currentUser.id === 'guest' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => currentUser.id !== 'guest' && setShowEmojiPicker(!showEmojiPicker)}
                        disabled={currentUser.id === 'guest'}
                      >
                        <Smile className="w-5 h-5" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-2xl shadow-xl border border-neutral-100 p-2 z-20 w-max max-w-[200px]">
                          <div className="text-[10px] font-bold text-neutral-300 uppercase px-2 py-1 mb-1">Mọi người hay dùng</div>
                          <div className="flex flex-wrap gap-1">
                            {QUICK_EMOJIS.map(e => (
                              <button 
                                key={e} 
                                onClick={() => addEmoji(e)}
                                className="text-xl hover:scale-110 transition-transform p-1.5 rounded-lg hover:bg-neutral-50"
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      className={`p-2 text-neutral-400 hover:text-neutral-600 transition-colors ${currentUser.id === 'guest' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => currentUser.id !== 'guest' && handlePhotoUpload()}
                      disabled={currentUser.id === 'guest'}
                    >
                      <Camera className="w-5 h-5" />
                    </button>
                    <button
                      className={`p-2 transition-all ${(!commentText.trim() && commentPhotos.length === 0) || currentUser.id === 'guest' ? 'text-neutral-200 cursor-not-allowed' : 'text-orange-500 hover:scale-110 active:scale-95'}`}
                      onClick={handleSubmitComment}
                      disabled={(!commentText.trim() && commentPhotos.length === 0) || currentUser.id === 'guest'}
                    >
                      <Send className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleFileChange} />
        </div>
      )}
    </article>
  );
};

export default PostCard;
