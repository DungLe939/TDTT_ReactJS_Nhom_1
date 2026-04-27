import { createContext, useContext, useState, type ReactNode } from 'react';

// Interface of User
interface User {
    id: string;
    name: string;
    allergies: string[];
    role: 'user' | 'admin';
}

// Interface of AuthContext
interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    isAdmin: boolean;
    login: (role?: 'user' | 'admin') => void;
    logout: () => void;
}

// Create Context for Authentication
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Component AuthProvider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Hàm login giả lập
    const login = (role: 'user' | 'admin' = 'user') => {
        // Mock login
        setUser({
            id: role === 'admin' ? '999' : '1',
            name: role === 'admin' ? 'Quản trị viên' : 'Traveler',
            allergies: role === 'admin' ? [] : ['Peanuts', 'Shellfish'],
            role: role,
        });
    };

    // Hàm logout
    const logout = () => {
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';

    return (
        // !! là để chuyển đổi user thành boolean, nếu user tồn tại thì isLoggedIn sẽ là true, ngược lại sẽ là false
        // Có context rồi thì mình phải đi phát đi (Provider)
        // Nó phát xuống props cho các children 
        <AuthContext.Provider value={{ user, isLoggedIn: !!user, isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Tạo ra Custom Hook để sử dụng AuthContext
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth bắt buộc phải được đặt bên trong <AuthProvider>. Bạn quên bọc nó rồi');
    }
    return context;
};
