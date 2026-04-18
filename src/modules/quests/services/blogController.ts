// =============================================================================
// BLOG CONTROLLER — IBlogController implementation
// Supports both Firebase (if configured) and NestJS API Backend (fallback)
// =============================================================================

import type {
  Post,
  Restaurant,
  PostFilter,
  CuisineType,
  Comment,
} from '../types/quest.types';

import type { CreatePostDto } from '../types/blog.types';

import { SEED_POSTS, SEED_RESTAURANTS } from './mockData';
import { blogActivityService } from './blogActivityService';
import { firebaseBlogService } from './firebaseBlogService';
import { isFirebaseConfigured } from '../../../core/firebase/firebaseConfig';

const API_URL = 'http://localhost:3000/blog';

const localRestaurants: Restaurant[] = [...SEED_RESTAURANTS];

const createPost = async (dto: CreatePostDto): Promise<Post> => {
  if (isFirebaseConfigured) {
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
    if (!created) throw new Error("Failed to create post via Firebase");
    
    // Log activity
    blogActivityService.logActivity({
      userId: dto.authorId,
      type: 'POST_CREATED',
      targetId: created.id,
      metadata: { tags: dto.tags },
    });
    
    return created;
  } else {
    // NestJS API
    try {
      const response = await fetch(`${API_URL}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dto),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("NestJS API failed, using local fallback", e);
    }

    // Local fallback
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
    
    // TRICK: Lưu trực tiếp vào SEED_POSTS để refreshPosts lấy được dữ liệu mới
    SEED_POSTS.unshift(newPost); 
    
    return newPost;
  }
};

const getPosts = async (filter?: PostFilter): Promise<Post[]> => {
  if (isFirebaseConfigured) {
    return await firebaseBlogService.getPosts(filter);
  }

  // NestJS API
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
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("NestJS API failed, falling back to local filtering", e);
  }

  // Local fallback with filtering logic
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
  if (isFirebaseConfigured) {
    await firebaseBlogService.toggleLikePost(postId, userId, alreadyLiked);
    
    if (!alreadyLiked) {
      blogActivityService.logActivity({
        userId,
        type: 'POST_LIKED',
        targetId: postId,
        metadata: { likedPostAuthorId: post.authorId },
      });
    }

    return {
      ...post,
      likesCount: alreadyLiked ? Math.max(0, post.likesCount - 1) : post.likesCount + 1,
      likedByUserIds: alreadyLiked 
          ? post.likedByUserIds.filter(id => id !== userId) 
          : [...post.likedByUserIds, userId]
    };
  } else {
    // NestJS API
    const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    if (!response.ok) throw new Error('API Error');
    return await response.json();
  }
};

const addComment = async (
  userId: string, 
  postId: string, 
  content: string, 
  post: Post,
  photoUrls?: string[]
): Promise<Post> => {
  if (isFirebaseConfigured) {
    const newComment: Comment = {
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
  } else {
    // NestJS API
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, content, photoUrls }),
      });
      if (response.ok) return await response.json();
    } catch (e) {
      console.warn("NestJS API failed, using local fallback for comment", e);
    }

    // Local fallback
    const newComment: Comment = {
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
  }
};

const toggleLikeComment = async (
  userId: string, 
  postId: string, 
  commentId: string,
  post: Post
): Promise<Post> => {
  // Tìm bình luận cần xử lý
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

  const updatedPost = { ...post, comments: updatedComments };

  if (isFirebaseConfigured) {
    // Giả định service firebase đã hỗ trợ cập nhật bình luận cụ thể
    // firebaseBlogService.updateComments(postId, updatedComments);
  }

  // Cập nhật SEED_POSTS cho Mock Data
  const postIndex = SEED_POSTS.findIndex(p => p.id === postId);
  if (postIndex !== -1) {
    SEED_POSTS[postIndex] = updatedPost;
  }

  return updatedPost;
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

/**
 * Lấy danh sách restaurants:
 * 1. Trả về cache ngay lập tức (nếu có)
 * 2. Fetch từ Firebase, so sánh ID → chỉ thêm restaurants mới
 * 3. Cập nhật cache
 */
const getRestaurants = async (): Promise<Restaurant[]> => {
  // Bước 1: Đọc cache trước
  const cached = getCachedRestaurants();

  try {
    if (isFirebaseConfigured) {
      const fbRestaurants = await firebaseBlogService.getRestaurants();

      if (fbRestaurants && fbRestaurants.length > 0) {
        if (cached.length === 0) {
          // Lần đầu: chưa có cache → lưu toàn bộ
          console.log(`[Cache] Lần đầu — lưu ${fbRestaurants.length} restaurants vào localStorage`);
          setCachedRestaurants(fbRestaurants);
          return fbRestaurants;
        }

        // Lần sau: so sánh ID để tìm restaurants mới
        const cachedIds = new Set(cached.map(r => r.id));
        const newRestaurants = fbRestaurants.filter(r => !cachedIds.has(r.id));

        if (newRestaurants.length > 0) {
          console.log(`[Cache] Tìm thấy ${newRestaurants.length} restaurants mới, cập nhật cache`);
          const merged = [...cached, ...newRestaurants];
          setCachedRestaurants(merged);
          return merged;
        }

        // Không có gì mới → trả cache
        console.log(`[Cache] Không có restaurants mới — dùng cache (${cached.length})`);
        return cached;
      }
    }
  } catch (e) {
    console.warn("Firebase getRestaurants failed, using cache/fallback", e);
  }

  // Nếu có cache → dùng cache (offline-friendly)
  if (cached.length > 0) return cached;

  // Fallback cuối cùng: mock data
  return [...localRestaurants];
};

const visitRestaurant = async (userId: string, restaurantId: string, cuisineType: CuisineType): Promise<void> => {
  if (isFirebaseConfigured) {
      blogActivityService.logActivity({
        userId,
        type: 'RESTAURANT_VISITED',
        targetId: restaurantId,
        metadata: { cuisineType },
      });
  } else {
      // NestJS API
      await fetch(`${API_URL}/visit-restaurant`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, restaurantId, cuisineType }),
      });
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
