// =============================================================================
// useBlog — Async hook cho Blog System
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { blogController } from '../services/blogController';
import { DEMO_USERS } from '../services/mockData';
import type { Post, Restaurant, PostFilter, Tag, DemoUser } from '../types/quest.types';
import type { CreatePostDto } from '../types/blog.types';

export const useBlog = () => {
  const { user: authUser, isLoggedIn } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filter, setFilter] = useState<PostFilter>({ tags: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Adapter: Convert Auth User to Blog-compatible DemoUser or static Guest
  const currentUser: DemoUser = authUser ? {
    id: authUser.id,
    username: authUser.name,
    avatar: authUser.role === 'admin' ? '🛡️' : '👤',
    level: 1,
    points: 0,
    achievements: []
  } : {
    id: 'guest',
    username: 'Khách',
    avatar: '👣',
    level: 0,
    points: 0,
    achievements: []
  };

  const demoUsers = DEMO_USERS;

  // Load ban đầu (Restaurants + Posts)
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      // Fetch restaurants independently
      blogController.getRestaurants()
        .then(setRestaurants)
        .catch(err => console.error("Failed to load restaurants:", err));

      // Fetch posts independently
      blogController.getPosts()
        .then(setPosts)
        .catch(err => console.error("Failed to load posts:", err))
        .finally(() => setIsLoading(false));
    };
    initData();
  }, []);

  // Refresh data
  const refreshPosts = useCallback(async (newFilter?: PostFilter) => {
    const activeFilter = newFilter ?? filter;
    const hasActiveFilter = activeFilter.tags.length > 0
      || activeFilter.restaurantId
      || activeFilter.authorId;

    try {
      const fetched = await blogController.getPosts(hasActiveFilter ? activeFilter : undefined);
      setPosts(fetched);
    } catch (e) {
      console.error(e);
    }
  }, [filter]);

  const createPost = useCallback(async (dto: Omit<CreatePostDto, 'authorId'>) => {
    try {
      await blogController.createPost({ ...dto, authorId: currentUser.id });
      await refreshPosts();
    } catch (e) {
      console.error(e);
    }
  }, [currentUser.id, refreshPosts]);

  const toggleLike = useCallback(async (postId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    // Optimistic UI update
    const alreadyLiked = targetPost.likedByUserIds.includes(currentUser.id);
    setPosts((prev) => prev.map((p) => {
      if (p.id === postId) {
        return alreadyLiked
          ? { ...p, likesCount: Math.max(0, p.likesCount - 1), likedByUserIds: p.likedByUserIds.filter(id => id !== currentUser.id) }
          : { ...p, likesCount: p.likesCount + 1, likedByUserIds: [...p.likedByUserIds, currentUser.id] };
      }
      return p;
    }));

    try {
      await blogController.toggleLikePost(currentUser.id, postId, targetPost);
    } catch (e) {
      console.error("Reverting like due to error", e);
      await refreshPosts(); // Revert on failure
    }
  }, [currentUser.id, posts, refreshPosts]);

  const addComment = useCallback(async (postId: string, content: string, photoUrls?: string[], parentId?: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    try {
      await blogController.addComment(currentUser.id, postId, content, targetPost, photoUrls, parentId);
      await refreshPosts(); // Fetch new comment
    } catch (e) {
      console.error(e);
    }
  }, [currentUser.id, posts, refreshPosts]);

  const toggleLikeComment = useCallback(async (postId: string, commentId: string) => {
    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    try {
      await blogController.toggleLikeComment(currentUser.id, postId, commentId, targetPost);
      await refreshPosts();
    } catch (e) {
      console.error(e);
    }
  }, [currentUser.id, posts, refreshPosts]);

  const visitRestaurant = useCallback((restaurantId: string) => {
    const restaurant = restaurants.find((r) => r.id === restaurantId);
    if (restaurant) {
      blogController.visitRestaurant(currentUser.id, restaurantId, restaurant.cuisineType);
    }
  }, [currentUser.id, restaurants]);

  const updateFilter = useCallback((newFilter: PostFilter) => {
    setFilter(newFilter);
    refreshPosts(newFilter);
  }, [refreshPosts]);

  const toggleFilterTag = useCallback((tag: Tag) => {
    const newTags = filter.tags.includes(tag)
      ? filter.tags.filter((t) => t !== tag)
      : [...filter.tags, tag];
    updateFilter({ ...filter, tags: newTags });
  }, [filter, updateFilter]);

  const clearFilter = useCallback(() => {
    updateFilter({ tags: [] });
  }, [updateFilter]);

  const hasLiked = useCallback((post: Post) => {
    return post.likedByUserIds.includes(currentUser.id);
  }, [currentUser.id]);

  return {
    posts,
    restaurants,
    filter,
    currentUser,
    isLoggedIn,
    isLoading,
    createPost,
    toggleLike,
    addComment,
    toggleLikeComment,
    visitRestaurant,
    updateFilter,
    toggleFilterTag,
    clearFilter,
    hasLiked,
  };
};
