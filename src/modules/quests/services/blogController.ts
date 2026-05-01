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
import { isFirebaseConfigured } from '../../../core/firebase/firebaseConfig';
import * as dbService from './dbService';
import { firebaseBlogService } from './firebaseBlogService';
import { blogActivityService } from './blogActivityService';

const API_URL = 'http://localhost:3000/blog';

// const localRestaurants: Restaurant[] = [...SEED_RESTAURANTS];

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
  const normalizePosts = (posts: Post[]): Post[] =>
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
      console.log(`[Firebase] Fetched ${fbPosts.length} posts`);
      return normalizePosts(fbPosts);
    } catch (e) {
      console.warn("[Firebase] getPosts failed", e);
    }
  }

  return [];
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
  photoUrls?: string[],
  parentId?: string
): Promise<Post> => {
  // Bước 1: Thử NestJS API
  try {
    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, content, photoUrls, parentId }),
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
        parentId: parentId || undefined
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

  throw new Error("Không thể thêm bình luận. Vui lòng kiểm tra kết nối.");
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

  // Bước 3: Cập nhật (Fallback cuối cùng)
  return optimisticPost;
};

// ---------------------------------------------------------------------------
// Restaurant Cache — localStorage + incremental sync
// ---------------------------------------------------------------------------
/**
 * Đọc restaurants từ IndexedDB (Tốc độ cao, không nghẽn UI)
 */
const getCachedRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const all = await dbService.getAllItems<Restaurant>();
    // Filter out mock IDs if they somehow persisted in cache (rest- or v7-)
    return all.filter(r => !r.id.startsWith('rest-') && !r.id.startsWith('v7-'));
  } catch (e) {
    console.error('Failed to get restaurants from IndexedDB', e);
    return [];
  }
};

/**
 * Lưu restaurants vào IndexedDB
 */
const setCachedRestaurants = async (restaurants: Restaurant[]): Promise<void> => {
  try {
    await dbService.saveItems(restaurants);
  } catch (e) {
    console.warn('Failed to cache restaurants to IndexedDB', e);
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
  // Bước 1: Đọc từ cache cục bộ trước (Sử dụng IndexedDB)
  const cached = await getCachedRestaurants();
  const lastSyncedAt = localStorage.getItem(LAST_SYNCED_KEY) || '';

  // Trigger background sync WITHOUT awaiting it for the caller
  // This allows the UI to render the 8,500 cached items instantly
  (async () => {
    try {
      let url = `${API_URL}/restaurants`;
      if (lastSyncedAt) {
        url += `?since=${encodeURIComponent(lastSyncedAt)}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const apiUpdates = await response.json();

        if (Array.isArray(apiUpdates) && apiUpdates.length > 0) {
          console.log(`[API] Received ${apiUpdates.length} updates for restaurants`);
          await setCachedRestaurants(apiUpdates);
          localStorage.setItem(LAST_SYNCED_KEY, new Date().toISOString());
        } else if (cached.length < 10 && lastSyncedAt) {
           // Fallback for missing updatedAt field
           const fullResponse = await fetch(`${API_URL}/restaurants`);
           if (fullResponse.ok) {
             const allRests = await fullResponse.json();
             if (Array.isArray(allRests)) await setCachedRestaurants(allRests);
           }
        }
      }
    } catch (e) {
      console.warn("[Background Sync] Failed", e);
    }
  })();

  // Return the cached data immediately for fast load
  if (cached.length > 0) {
    return cached;
  }

  // Final fallback (Mock/Static list)
  return [];
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
