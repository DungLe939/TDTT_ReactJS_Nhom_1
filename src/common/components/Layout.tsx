import type { ReactNode } from 'react';
import { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router';
import {
    Menu,
    Search,
    User as UserIcon,
    X,
    Sun,
    Moon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { Chatbot } from './Chatbot';
import { DesktopSidebar, MobileSidebar } from './Sidebar';
import { getNavSections } from './SidebarConfig';

/**
 * Layout component chính của ứng dụng.
 * Kết hợp Sidebar điều hướng, Header tìm kiếm/user và các hiệu ứng nền cao cấp.
 */
export const Layout = () => {
    const { isLoggedIn, user, isAdmin, isLoading } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy các section điều hướng dựa trên quyền admin
    const navSections = getNavSections(isAdmin);

    // Flatten danh sách item để phục vụ hiển thị trên mobile horizontal menu
    const allNavigableItems = navSections
        .flatMap((section) => section.items)
        .filter((item): item is { path: string; label: string; icon: ReactNode; description: string; disabled?: boolean; badge?: string } => !item.disabled && Boolean(item.path));

    /**
     * Kiểm tra path hiện tại có đang active không
     */
    const isPathActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const activePageLabel = allNavigableItems.find((item) => isPathActive(item.path))?.label ?? 'TasteTrekker';

    // Render Sidebar item cho menu ngang trên tablet/mobile
    const renderHorizontalNavItem = (item: any) => {
        return (
            <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                    `flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm transition duration-200 border border-transparent ${isActive
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500 dark:border-white/5'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-orange-50 hover:text-orange-600 dark:bg-slate-800 dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white'
                    }`
                }
            >
                {item.icon}
                {item.label}
            </NavLink>
        );
    };

    // Màn hình loading khi chưa xác thực xong
    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-slate-900">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
                    <p className="text-sm text-neutral-500 dark:text-gray-500">Đang tải...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex flex-col font-sans bg-gray-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Background Wrapper (Premium effects từ nhánh hiện tại) */}
            <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-gradient-to-br from-neutral-50 via-orange-50/40 to-amber-50/50 dark:from-slate-950 dark:via-orange-950/20 dark:to-slate-900">
                {/* Full Page Blurred Image */}
                <div
                    className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-[0.08] blur-[24px]"
                />

                {/* Ambient Glow Tones (SaaS/Luxury effect) */}
                <div className="absolute -top-[10%] -right-[5%] w-[45vw] h-[45vw] rounded-full bg-orange-400/20 blur-[120px] mix-blend-multiply dark:bg-orange-600/10" />
                <div className="absolute top-[40%] -left-[10%] w-[40vw] h-[40vw] rounded-full bg-amber-400/15 blur-[100px] mix-blend-multiply dark:bg-amber-600/10" />
                <div className="absolute -bottom-[10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-yellow-300/15 blur-[120px] mix-blend-multiply dark:bg-yellow-600/5" />

                {/* AI Subtle Radial Grid Overlay */}
                <div
                    className="absolute inset-0 opacity-[0.12] dark:opacity-[0.05]"
                    style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.8) 1px, transparent 0)', backgroundSize: '32px 32px' }}
                />
            </div>

            <div className="mx-auto flex min-h-screen w-full max-w-[1600px] relative z-10">
                {/* Sidebar Desktop */}
                <DesktopSidebar />

                <div className="flex min-h-screen flex-1 flex-col">
                    {/* Header */}
                    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md transition-all duration-200 shadow-sm dark:border-white/10 dark:bg-slate-900/80">
                        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
                            {/* Mobile Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                                className="rounded-xl p-2 text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground lg:hidden"
                                aria-label="Mở menu điều hướng"
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>

                            {/* Mobile Logo & Branding */}
                            <button onClick={() => navigate('/')} className="flex items-center gap-2 lg:hidden">
                                <div className="w-9 h-9 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
                                    <img src="/Logo.jpg" alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-base font-bold text-neutral-900 dark:text-white">
                                    Hương Vị <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">Bản Địa</span>
                                </span>
                            </button>

                            {/* Desktop Workspace Label */}
                            <div className="hidden lg:block">
                                <p className="text-xs uppercase tracking-[0.18em] text-neutral-400 dark:text-gray-500">Workspace</p>
                                <p className="text-sm font-semibold text-neutral-900 dark:text-white">{activePageLabel}</p>
                            </div>

                            {/* Search Bar */}
                            <div className="relative ml-auto hidden w-full max-w-xs sm:block lg:max-w-md">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-gray-500" />
                                <input
                                    type="search"
                                    placeholder="Tìm món, quán hoặc hành trình..."
                                    className="h-10 w-full rounded-xl border border-orange-100 bg-white pl-10 pr-3 text-sm text-neutral-700 outline-none transition-all placeholder:text-neutral-400 focus:border-orange-300 focus:ring-4 focus:ring-orange-100 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-orange-500/50 dark:focus:ring-orange-500/20"
                                />
                            </div>

                            {/* Quick Actions */}
                            <button
                                onClick={() => navigate('/scan')}
                                className="hidden rounded-xl bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-orange-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/20 md:inline-flex"
                            >
                                Quét nhanh
                            </button>

                            {/* Theme Toggle */}
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="hidden items-center justify-center rounded-xl p-2 text-neutral-600 transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 sm:flex dark:text-gray-300 dark:hover:bg-slate-700 dark:hover:text-white hover:scale-105"
                                aria-label="Đổi giao diện Sáng/Tối"
                            >
                                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>

                            {/* User Profile */}
                            {isLoggedIn ? (
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="hidden items-center gap-2 rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm text-neutral-600 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50 hover:shadow-md sm:flex dark:border-white/10 dark:bg-slate-800 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-slate-700 dark:hover:text-white dark:hover:shadow-black/30"
                                >
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.name}
                                            referrerPolicy="no-referrer"
                                            className="h-7 w-7 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-slate-700 dark:text-orange-500">
                                            <UserIcon className="h-4 w-4" />
                                        </div>
                                    )}
                                    <span className="hidden xl:block font-medium">{user?.name}</span>
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="hidden rounded-xl border border-orange-200 px-3 py-2 text-sm font-semibold text-orange-600 transition-all duration-200 hover:bg-orange-50 sm:inline-flex dark:border-white/10 dark:text-gray-300 dark:hover:bg-slate-800 dark:hover:text-white hover:scale-[1.02]"
                                >
                                    Đăng nhập
                                </button>
                            )}
                        </div>

                        {/* Tablet/Horizontal Mobile Nav */}
                        <div className="hidden border-t border-orange-100/80 px-4 py-2 md:block lg:hidden dark:border-white/10">
                            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                {allNavigableItems.map(renderHorizontalNavItem)}
                            </div>
                        </div>

                        {/* Sidebar Mobile */}
                        {isMobileMenuOpen ? <MobileSidebar setIsMobileMenuOpen={setIsMobileMenuOpen} /> : null}
                    </header>

                    {/* Main Content Area */}
                    <main className="flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
                        <div className="mx-auto w-full">
                            <Outlet />
                        </div>
                    </main>
                </div>
            </div>

            {/* Chatbot Overlay */}
            <Chatbot />
        </div>
    );
};

