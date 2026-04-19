import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/modules/auth/services/firebase';

// Interface of User (mở rộng từ Firebase User)
interface User {
  id: string;
  name: string;
  email: string;
  photoURL: string | null;
  allergies: string[];
  role: 'user' | 'admin';
}

// Interface of AuthContext
interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  // Email/Password Auth
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  // Social Auth
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
  // Profile
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  // Logout
  logout: () => Promise<void>;
  // Manual Login (Simulation/Role-based)
  login: (role: 'user' | 'admin') => void;
}

// Helper: Chuyển đổi Firebase User sang User interface của app
const mapFirebaseUser = (firebaseUser: FirebaseUser): User => ({
  id: firebaseUser.uid,
  name: firebaseUser.displayName || 'Người dùng',
  email: firebaseUser.email || '',
  photoURL: firebaseUser.photoURL,
  allergies: [], // Sau này có thể lấy từ Firestore
  role: 'user', // Mặc định là user, sau này có thể check từ custom claims hoặc Firestore
});

// Create Context for Authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Component AuthProvider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lắng nghe thay đổi trạng thái đăng nhập từ Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        setUser(mapFirebaseUser(fbUser));
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup listener khi component unmount
    return () => unsubscribe();
  }, []);

  // Đăng nhập bằng Email/Password
  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // Đăng ký tài khoản mới bằng Email/Password
  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Cập nhật displayName sau khi tạo tài khoản
    await updateProfile(userCredential.user, { displayName });
    // Cập nhật lại state với displayName mới
    setUser(mapFirebaseUser({ ...userCredential.user, displayName } as FirebaseUser));
  };

  // Đăng nhập bằng Google
  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  // Đăng nhập bằng GitHub
  const loginWithGithub = async () => {
    await signInWithPopup(auth, githubProvider);
  };

  // Cập nhật thông tin profile
  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName, photoURL: photoURL || auth.currentUser.photoURL });
    // Cập nhật lại state
    setUser(mapFirebaseUser(auth.currentUser));
  };

  // Gửi email reset mật khẩu
  const sendPasswordReset = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Đăng xuất
  const logout = async () => {
    await signOut(auth);
  };

  // Đăng nhập thủ công (Simulated)
  const login = (role: 'user' | 'admin') => {
    setUser({
      id: 'simulated-id',
      name: role === 'admin' ? 'Administrator' : 'User',
      email: role === 'admin' ? 'admin@example.com' : 'user@example.com',
      photoURL: null,
      allergies: [],
      role: role,
    });
  };

  const isAdmin = user?.role === 'admin';

  return (
    // !! là để chuyển đổi user thành boolean, nếu user tồn tại thì isLoggedIn sẽ là true, ngược lại sẽ là false
    // Có context rồi thì mình phải đi phát đi (Provider)
    // Nó phát xuống props cho các children
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoggedIn: !!user,
        isAdmin,
        isLoading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginWithGithub,
        updateUserProfile,
        sendPasswordReset,
        logout,
        login,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Tạo ra Custom Hook để sử dụng AuthContext
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth bắt buộc phải được đặt bên trong <AuthProvider>. Bạn quên bọc nó rồi');
  }
  return context;
};
