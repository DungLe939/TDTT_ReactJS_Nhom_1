// import {
//   collection,
//   getDocs,
//   addDoc,
//   updateDoc,
//   doc,
//   query,
//   where,
//   orderBy,
//   arrayUnion,
//   arrayRemove,
//   increment,
// } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../../core/firebase/firebaseConfig';
import type { Post, Restaurant, PostFilter, Comment } from '../types/quest.types';

// Stubs for firebase functions since they are commented out above
const collection = (...args: any[]) => ({}) as any;
const query = (...args: any[]) => ({}) as any;
const orderBy = (...args: any[]) => ({}) as any;
const where = (...args: any[]) => ({}) as any;
const getDocs = (...args: any[]) => ({ docs: [] }) as any;
const addDoc = (...args: any[]) => ({ id: 'new-id' }) as any;
const doc = (...args: any[]) => ({}) as any;
const updateDoc = (...args: any[]) => Promise.resolve();
const arrayUnion = (...args: any[]) => [];
const arrayRemove = (...args: any[]) => [];
const increment = (...args: any[]) => 0;


export const firebaseBlogService = {
  getPosts: async (filter?: PostFilter): Promise<Post[]> => {
    if (!isFirebaseConfigured || !db) return [];
    
    try {
      let q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

      if (filter?.restaurantId) {
        q = query(q, where('restaurantId', '==', filter.restaurantId));
      }
      if (filter?.authorId) {
        q = query(q, where('authorId', '==', filter.authorId));
      }
      if (filter?.tags && filter.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', filter.tags));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        
        let createdAt = data.createdAt;
        if (createdAt && typeof createdAt.toDate === 'function') {
           createdAt = createdAt.toDate().toISOString();
        }

        return {
          ...data,
          id: doc.id,
          createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
          tags: Array.isArray(data.tags) ? data.tags : [],
          likedByUserIds: Array.isArray(data.likedByUserIds) ? data.likedByUserIds : [],
          comments: Array.isArray(data.comments) ? data.comments.map((c: any) => ({
            ...c,
            createdAt: c.createdAt && typeof c.createdAt.toDate === 'function'
              ? c.createdAt.toDate().toISOString()
              : (typeof c.createdAt === 'string' ? c.createdAt : new Date().toISOString())
          })) : [],
          likesCount: typeof data.likesCount === 'number' ? data.likesCount : 0
        } as Post;
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      return [];
    }
  },

  createPost: async (postData: Omit<Post, 'id'>): Promise<Post | null> => {
    if (!isFirebaseConfigured || !db) return null;

    try {
      const docRef = await addDoc(collection(db, 'posts'), postData);
      return { ...postData, id: docRef.id };
    } catch (error) {
       console.error("Error creating post:", error);
       return null;
    }
  },

  toggleLikePost: async (postId: string, userId: string, alreadyLiked: boolean): Promise<void> => {
     if (!isFirebaseConfigured || !db) return;

     try {
       const postRef = doc(db, 'posts', postId);
       if (alreadyLiked) {
         await updateDoc(postRef, {
           likedByUserIds: arrayRemove(userId),
           likesCount: increment(-1)
         });
       } else {
         await updateDoc(postRef, {
           likedByUserIds: arrayUnion(userId),
           likesCount: increment(1)
         });
       }
     } catch (error) {
       console.error("Error toggling like:", error);
     }
  },

  addComment: async (postId: string, comment: Comment): Promise<void> => {
    if (!isFirebaseConfigured || !db) return;

    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        comments: arrayUnion(comment)
      });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  },

  getRestaurants: async (): Promise<Restaurant[]> => {
      if (!isFirebaseConfigured || !db) return [];
      
      try {
        const querySnapshot = await getDocs(collection(db, 'restaurants'));
         return querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Restaurant[];
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        return [];
      }
  }
}
