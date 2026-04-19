// =============================================================================
// BLOG CONTROLLER — IBlogController implementation
// Supports both Firebase (if configured) and NestJS API Backend (fallback)
// =============================================================================

import type {
  Post,
  Restaurant,
  PostFilter,
  CuisineType,
  BlogComment,
} from '../types/quest.types';

import type { CreatePostDto } from '../types/blog.types';

import { SEED_POSTS, SEED_RESTAURANTS } from './mockData';
import { blogActivityService } from './blogActivityService';
import { firebaseBlogService } from './firebaseBlogService';
import { isFirebaseConfigured } from '../../../core/firebase/firebaseConfig';

const API_URL = 'http://localhost:3000/blog';

const localRestaurants: Restaurant[] = [...SEED_RESTAURANTS];

const createPost = async (dto: CreatePostDto): Promise<Post> => {
  // Bước 1: Thử NestJS API
  try {
    const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
    });
    if (response.ok) {
      const created = await response.json();
      console.log(`[API] Post created via NestJS backend: ${created.id}`);
      return { ...created, comments: created.comments || [] };
    }
  } catch (e) {
    console.warn("[API] NestJS createPost failed, trying next source...", e);
  }

  // Bước 2: Thử Firebase
  if (isFirebaseConfigured) {
    try {
      const created = await firebaseBlogService.createPost({
          authorId: dto.authorId,
          content: dto.content,
          tags: dto.tags,
          restaurantId: dto.restaurantId,
          photoUrls: dto.photoUrls,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          likedByUserIds: [],
          comments: [],
      });
      if (created) {
        blogActivityService.logActivity({
          userId: dto.authorId,
          type: 'POST_CREATED',
          targetId: created.id,
          metadata: { tags: dto.tags },
        });
        return created;
      }
    } catch (e) {
      console.warn("[Firebase] createPost failed", e);
    }
  }

  // Bước 3: Local fallback
  console.log("[Mock] Creating post locally");
  const newPost: Post = {
    id: `post-${Date.now()}`,
    authorId: dto.authorId,
    content: dto.content,
    tags: dto.tags,
    restaurantId: dto.restaurantId,
    photoUrls: dto.photoUrls || [],
    createdAt: new Date().toISOString(),
    likesCount: 0,
    likedByUserIds: [],
    comments: [],
  };
  
  SEED_POSTS.unshift(newPost); 
  return newPost;
};


const getPosts = async (filter?: PostFilter): Promise<Post[]> => {
  // Helper: normalize posts from API (ensure comments array exists)
  const normalizePosts = (posts: any[]): Post[] =>
    posts.map(p => ({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags : [],
      likedByUserIds: Array.isArray(p.likedByUserIds) ? p.likedByUserIds : [],
      comments: Array.isArray(p.comments) ? p.comments : [],
      photoUrls: Array.isArray(p.photoUrls) ? p.photoUrls : [],
      likesCount: typeof p.likesCount === 'number' ? p.likesCount : 0,
    }));

  // Bước 1: Thử NestJS API
  try {
    let url = `${API_URL}/posts`;
    const queryParams = new URLSearchParams();
    if (filter?.authorId) queryParams.append('authorId', filter.authorId);
    if (filter?.restaurantId) queryParams.append('restaurantId', filter.restaurantId);
    if (filter?.tags) {
        filter.tags.forEach(tag => queryParams.append('tags', tag));
    }
    
    const queryString = queryParams.toString();
    if (queryString) {
        url += `?${queryString}`;
    }

    const response = await fetch(url);
    if (response.ok) {
      const apiPosts = await response.json();
      if (Array.isArray(apiPosts)) {
        console.log(`[API] Fetched ${apiPosts.length} posts từ NestJS backend`);
        return normalizePosts(apiPosts);
      }
    }
  } catch (e) {
    console.warn("[API] NestJS posts failed, trying next source...", e);
  }

  // Bước 2: Thử Firebase
  if (isFirebaseConfigured) {
    try {
      const fbPosts = await firebaseBlogService.getPosts(filter);
      if (fbPosts.length > 0) {
        console.log(`[Firebase] Fetched ${fbPosts.length} posts`);
        return normalizePosts(fbPosts);
      }
    } catch (e) {
      console.warn("[Firebase] getPosts failed", e);
    }
  }

  // Bước 3: Local fallback with filtering logic
  console.log(`[Mock] Dùng ${SEED_POSTS.length} posts từ mock data`);
  let filtered = [...SEED_POSTS];

  if (filter) {
    if (filter.authorId) {
      filtered = filtered.filter(p => p.authorId === filter.authorId);
    }
    if (filter.restaurantId) {
      filtered = filtered.filter(p => p.restaurantId === filter.restaurantId);
    }
    if (filter.tags && filter.tags.length > 0) {
      filtered = filtered.filter(p => 
        filter.tags!.every(tag => p.tags.includes(tag))
      );
    }
  }

  return filtered;
};


const toggleLikePost = async (userId: string, postId: string, post: Post): Promise<Post> => {
  const alreadyLiked = post.likedByUserIds.includes(userId);
  const optimisticResult: Post = {
    ...post,
    likesCount: alreadyLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1,
    likedByUserIds: alreadyLiked 
        ? post.likedByUserIds.filter(id => id !== userId) 
        : [...post.likedByUserIds, userId]
  };

  // Bước 1: Thử NestJS API
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (response.ok) {
      const result = await response.json();
      console.log(`[API] Like toggled via NestJS backend`);
      return { ...result, comments: result.comments || [] };
    }
  } catch (e) {
    console.warn("[API] NestJS toggleLike failed, trying next...", e);
  }

  // Bước 2: Thử Firebase
  if (isFirebaseConfigured) {
    try {
      await firebaseBlogService.toggleLikePost(postId, userId, alreadyLiked);
      if (!alreadyLiked) {
        blogActivityService.logActivity({
          userId,
          type: 'POST_LIKED',
          targetId: postId,
          metadata: { likedPostAuthorId: post.authorId },
        });
      }
      return optimisticResult;
    } catch (e) {
      console.warn("[Firebase] toggleLike failed", e);
    }
  }

  // Bước 3: Return optimistic result (mock fallback)
  return optimisticResult;
};


const addComment = async (
  userId: string, 
  postId: string, 
  content: string, 
  post: Post,
  photoUrls?: string[]
): Promise<Post> => {
  // Bước 1: Thử NestJS API
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content, photoUrls }),
    });
    if (response.ok) {
      const result = await response.json();
      console.log(`[API] Comment added via NestJS backend`);
      return { ...result, comments: result.comments || [] };
    }
  } catch (e) {
    console.warn("[API] NestJS addComment failed, trying next...", e);
  }

  // Bước 2: Thử Firebase
  if (isFirebaseConfigured) {
    try {
      const newComment: BlogComment = {
        id: `cmt-${Date.now()}`,
        authorId: userId,
        content,
        photoUrls: photoUrls || [],
        likesCount: 0,
        likedByUserIds: [],
        createdAt: new Date().toISOString(),
      };
      await firebaseBlogService.addComment(postId, newComment);
      return {
        ...post,
        comments: [...post.comments, newComment],
      };
    } catch (e) {
      console.warn("[Firebase] addComment failed", e);
    }
  }

  // Bước 3: Local fallback
  console.log("[Mock] Adding comment locally");
  const newComment: BlogComment = {
    id: `cmt-${Date.now()}`,
    authorId: userId,
    content,
    photoUrls: photoUrls || [],
    likesCount: 0,
    likedByUserIds: [],
    createdAt: new Date().toISOString(),
  };

  const postIndex = SEED_POSTS.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    const updatedPost = {
      ...SEED_POSTS[postIndex],
      comments: [...SEED_POSTS[postIndex].comments, newComment]
    };
    SEED_POSTS[postIndex] = updatedPost;
    return updatedPost;
  }

  return {
    ...post,
    comments: [...post.comments, newComment],
  };
};


const toggleLikeComment = async (
  userId: string, 
  postId: string, 
  commentId: string,
  post: Post
): Promise<Post> => {
  // Tìm bình luận cần xử lý (Optimistic UI)
  const updatedComments = post.comments.map(comment => {
    if (comment.id === commentId) {
      const alreadyLiked = comment.likedByUserIds.includes(userId);
      return {
        ...comment,
        likesCount: alreadyLiked ? Math.max(0, comment.likesCount - 1) : comment.likesCount + 1,
        likedByUserIds: alreadyLiked 
          ? comment.likedByUserIds.filter(id => id !== userId)
          : [...comment.likedByUserIds, userId]
      };
    }
    return comment;
  });

  const optimisticPost = { ...post, comments: updatedComments };

  // Bước 1: Thử NestJS API
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (response.ok) {
      const result = await response.json();
      console.log(`[API] Comment like toggled via NestJS backend`);
      return { ...result, comments: result.comments || [] };
    }
  } catch (e) {
    console.warn("[API] NestJS toggleLikeComment failed, trying next source...", e);
  }

  // Bước 2: Thử Firebase (nếu được cấu hình - hiện tại code logic Firebase cho comment like chưa tách riêng service)
  if (isFirebaseConfigured) {
    // Firebase fallback logic could be added here if needed
  }

  // Bước 3: Cập nhật Mock Data (Fallback cuối cùng)
  const postIndex = SEED_POSTS.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    SEED_POSTS[postIndex] = optimisticPost;
  }

  return optimisticPost;
};

// ---------------------------------------------------------------------------
// Restaurant Cache — localStorage + incremental sync
// ---------------------------------------------------------------------------
const CACHE_KEY = 'cached_restaurants';

/**
 * Đọc restaurants từ localStorage (instant, không cần mạng)
 */
const getCachedRestaurants = (): Restaurant[] => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Restaurant[];
  } catch {
    return [];
  }
};

/**
 * Lưu restaurants vào localStorage
 */
const setCachedRestaurants = (restaurants: Restaurant[]): void => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(restaurants));
  } catch (e) {
    console.warn('Failed to cache restaurants to localStorage', e);
  }
};

const LAST_SYNCED_KEY = 'restaurants_last_synced';

/**
 * Lấy danh sách restaurants:
 * 1. Đọc từ Cache (Instant UX)
 * 2. Gọi NestJS API để lấy dữ liệu CẬP NHẬT (Incremental Sync)
 * 3. Hợp nhất (Merge) dữ liệu mới vào Cache
 * 4. Fallback Firebase/Mock nếu API lỗi
 */
const getRestaurants = async (): Promise<Restaurant[]> => {
  // Bước 1: Đọc từ cache cục bộ trước (để UI có dữ liệu ngay lập tức)
  let cached = getCachedRestaurants();
  const lastSyncedAt = localStorage.getItem(LAST_SYNCED_KEY) || '';

  // Bước 2: Thử NestJS API lấy các bản ghi thay đổi (Incremental Sync)
  try {
    let url = `${API_URL}/restaurants`;
    if (lastSyncedAt) {
      url += `?since=${encodeURIComponent(lastSyncedAt)}`;
    }

    const response = await fetch(url);
    if (response.ok) {
      const apiUpdates = await response.json();
      
      if (Array.isArray(apiUpdates) && apiUpdates.length > 0) {
        
        // Hợp nhất dữ liệu: Dùng Map để ghi đè các ID cũ bằng dữ liệu mới hoặc thêm ID mới
        const restaurantMap = new Map(cached.map(r => [r.id, r]));
        apiUpdates.forEach(r => restaurantMap.set(r.id, r));
        
        const merged = Array.from(restaurantMap.values());
        
        // Lưu lại vào cache
        setCachedRestaurants(merged);
        localStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString());
        
        return merged;
      } else {
        console.log(`[API] Không có cập nhật mới nào từ ${lastSyncedAt}`);
        if (cached.length > 0) return cached;
      }
    }
  } catch (e) {
    console.warn("[API] NestJS incremental sync failed, trying fallback...", e);
  }

  // Bước 3: Thử Firebase (nếu được cấu hình và API thất bại)
  try {
    if (isFirebaseConfigured) {
      const fbRestaurants = await firebaseBlogService.getRestaurants();
      if (fbRestaurants && fbRestaurants.length > 0) {
        setCachedRestaurants(fbRestaurants);
        return fbRestaurants;
      }
    }
  } catch (e) {
    console.warn("[Firebase] getRestaurants failed", e);
  }

  // Bước 4: Trả về kết quả cuối cùng (Cache hoặc Mock)
  if (cached.length > 0) {
    console.log(`[Cache] Dùng ${cached.length} nhà hàng từ localStorage`);
    return cached;
  }

  console.log(`[Mock] Dùng ${localRestaurants.length} nhà hàng từ mock data`);
  return [...localRestaurants];
};


const visitRestaurant = async (userId: string, restaurantId: string, cuisineType: CuisineType): Promise<void> => {
  // Bước 1: Thử NestJS API
  try {
    const response = await fetch(`${API_URL}/visit-restaurant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, restaurantId, cuisineType }),
    });
    if (response.ok) {
      console.log(`[API] Restaurant visit logged via NestJS backend`);
      return;
    }
  } catch (e) {
    console.warn("[API] NestJS visit-restaurant failed, trying next source...", e);
  }

  // Bước 2: Thử Firebase
  if (isFirebaseConfigured) {
    try {
      blogActivityService.logActivity({
        userId,
        type: 'RESTAURANT_VISITED',
        targetId: restaurantId,
        metadata: { cuisineType },
      });
      console.log(`[Firebase] Restaurant visit logged`);
    } catch (e) {
      console.warn("[Firebase] visit-restaurant failed", e);
    }
  }
};

export const blogController = {
  createPost,
  getPosts,
  toggleLikePost,
  addComment,
  toggleLikeComment,
  getRestaurants,
  visitRestaurant,
};
