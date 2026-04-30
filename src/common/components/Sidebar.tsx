import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import {
    Search,
    ChevronLeft,
    ChevronRight,
    LogOut,
    User as UserIcon,
    ScanFace,
    Zap
} from 'lucide-react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { toast } from 'sonner';
import { getNavSections } from './SidebarConfig';
import type { NavItem, NavSection } from './SidebarConfig';

/**
 * Component Sidebar dành cho giao diện màn hình lớn (Desktop).
 * Quản lý trạng thái đóng/mở sidebar và xử lý hiển thị danh sách chức năng.
 */
export const DesktopSidebar = () => {
    const { isLoggedIn, user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Trạng thái thu gọn/mở rộng của Sidebar, mặc định ưu tiên lấy từ localStorage để giữ nguyên trải nghiệm
    const [isExpanded, setIsExpanded] = useState<boolean>(() => {
        const saved = localStorage.getItem('sidebar_expanded');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        localStorage.setItem('sidebar_expanded', JSON.stringify(isExpanded));
    }, [isExpanded]);

    /**
     * Xử lý hành động đăng xuất người dùng.
     */
    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Đăng xuất thành công!');
            navigate('/');
        } catch {
            toast.error('Đăng xuất thất bại. Vui lòng thử lại.');
        }
    };

    const navSections = getNavSections(isAdmin);

    /**
     * Kiểm tra xem một đường dẫn path có đang là trang hiện tại hay không.
     * Hỗ trợ cho cả nested routes bằng cách dùng startsWith.
     * @param path - Đường dẫn của menu item.
     * @returns boolean - true nếu đúng là trang hiện tại.
     */
    const isPathActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    /**
     * Hàm render cho từng menu item.
     * Hiển thị khác nhau tùy thuộc vào trạng thái `isExpanded` và item có bị `disabled` (vd: các chức năng Soon) hay không.
     * @param item - Dữ liệu của 1 menu item cần render
     */
    const renderSidebarItem = (item: NavItem) => {
        const itemContent = (
            <>
                <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 
                    ${isPathActive(item.path || '')
                        ? 'bg-orange-500 text-white shadow-sm dark:shadow-orange-500/20'
                        : 'bg-white/80 text-neutral-500 group-hover:bg-orange-100 group-hover:text-orange-600 dark:bg-slate-800 dark:text-gray-400 dark:group-hover:bg-slate-700 dark:group-hover:text-white'
                    }`}
                >
                    {item.icon}
                </span>
                {isExpanded && (
                    <div className="min-w-0 flex-1 transition-opacity duration-200">
                        <p className="truncate text-sm font-semibold">{item.label}</p>
                        <p className="truncate text-xs text-neutral-500">{item.description}</p>
                    </div>
                )}
                {isExpanded && item.badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${item.badgeColor || 'bg-amber-100 text-amber-700'}`}>
                        {item.badge}
                    </span>
                )}
            </>
        );

        // Render cho các tính năng chưa hoàn thiện (disabled) hoặc không có đường dẫn (path)
        if (item.disabled || !item.path) {
            return (
                <div
                    title={!isExpanded ? item.label : undefined}
                    className={`group relative flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-neutral-400 opacity-80 ${isExpanded ? '' : 'justify-center'} dark:bg-slate-800/50 dark:border-white/5`}
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 dark:bg-slate-800/80 dark:text-gray-500">
                        {item.icon}
                    </span>
                    {isExpanded && (
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-neutral-500 dark:text-gray-500">{item.label}</p>
                            <p className="truncate text-xs text-neutral-400 dark:text-gray-600">{item.description}</p>
                        </div>
                    )}
                    {isExpanded && item.badge && (
                        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                            {item.badge}
                        </span>
                    )}
                </div>
            );
        }

        // Render cho các tính năng có thể click chuyển trang
        return (
            <NavLink
                to={item.path}
                end={item.path === '/'}
                title={!isExpanded ? item.label : undefined}
                className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ease-in-out border border-transparent ${isActive
                        ? 'bg-primary/10 text-primary shadow-sm dark:bg-slate-800 dark:text-white dark:border-white/5'
                        : 'text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:text-gray-300 dark:hover:bg-slate-800/50 dark:hover:text-white'
                    } ${isExpanded ? '' : 'justify-center'}`
                }
            >
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <div className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-orange-500" />
                        )}
                        {itemContent}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <aside
            className={`hidden border-r border-gray-200 bg-white dark:bg-slate-900 dark:border-white/10 lg:flex lg:flex-col transition-all duration-300 ease-in-out z-50 ${isExpanded ? 'w-[280px]' : 'w-[88px]'
                }`}
        >
            <div className="sticky top-0 flex h-screen flex-col">
                {/* Header */}
                <div className="relative flex items-center justify-between border-b border-gray-200 dark:border-white/10 px-4 py-5 h-[85px]">
                    <button onClick={() => navigate('/')} className={`group flex items-center gap-3 text-left w-full ${isExpanded ? '' : 'justify-center'}`}>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-xl font-bold text-white shadow-lg shadow-orange-200 dark:shadow-none transition-transform group-hover:scale-105">
                            T
                        </div>
                        {isExpanded && (
                            <div className="min-w-0 transition-opacity duration-200">
                                <p className="truncate text-lg font-bold text-neutral-900 dark:text-white">TasteTrekker</p>
                                <p className="truncate text-xs uppercase tracking-[0.16em] text-orange-500">Food Explorer</p>
                            </div>
                        )}
                    </button>
                    {/* Toggle Button */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="absolute -right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-orange-200 bg-white text-neutral-500 shadow-sm hover:bg-orange-50 hover:text-orange-600 z-10 transition-transform dark:bg-slate-800 dark:border-white/10 dark:text-gray-400 dark:hover:bg-slate-700 dark:hover:text-white"
                    >
                        {isExpanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>
                </div>

                {/* Search & Quick Actions (Only when expanded) */}
                <div className={`border-b border-orange-50/50 dark:border-white/10 px-4 py-3 space-y-3 transition-opacity duration-200 ${isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'}`}>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-gray-500" />
                        <input
                            type="search"
                            placeholder="Tìm kiếm..."
                            className="h-9 w-full rounded-lg border border-orange-100 bg-neutral-50/50 pl-9 pr-3 text-sm text-neutral-700 outline-none transition-all placeholder:text-neutral-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100/50 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-orange-500/50 dark:focus:ring-orange-500/20"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-100/50 px-2 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-all hover:scale-[1.02] dark:bg-orange-500/10 dark:text-orange-500 dark:hover:bg-orange-500/20" onClick={() => navigate('/scan')}>
                            <ScanFace className="h-3.5 w-3.5" /> Quét nhanh
                        </button>
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-500 px-2 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 shadow-sm shadow-orange-200 transition-colors" disabled>
                            <Zap className="h-3.5 w-3.5" /> Đặt món
                        </button>
                    </div>
                </div>

                {/* Navigation List */}
                <div className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
                    <div className="space-y-6">
                        {navSections.map((section) => (
                            <section key={section.title} className="space-y-2">
                                {isExpanded ? (
                                    <h2 className="px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400 dark:text-gray-500">
                                        {section.title}
                                    </h2>
                                ) : (
                                    <div className="h-px w-8 mx-auto bg-neutral-200 dark:bg-white/10 my-4 rounded-full" />
                                )}
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <div key={`${section.title}-${item.label}`}>{renderSidebarItem(item)}</div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                {/* Footer / User Profile */}
                <div className="border-t border-orange-100 dark:border-white/10 p-4">
                    {isLoggedIn ? (
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/profile')}
                                className={`flex w-full items-center gap-3 rounded-xl bg-orange-50/50 hover:bg-orange-100/80 transition-all hover:scale-[1.02] dark:bg-slate-800 dark:hover:bg-slate-700 ${isExpanded ? 'px-3 py-2' : 'justify-center py-2'}`}
                                title={!isExpanded ? 'Hồ sơ' : undefined}
                            >
                                <div className="relative">
                                    {user?.photoURL ? (
                                        <img
                                            src={user.photoURL}
                                            alt={user.name}
                                            referrerPolicy="no-referrer"
                                            className="h-10 w-10 shrink-0 rounded-full object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                                        />
                                    ) : (
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-200 text-orange-700 border-2 border-white dark:border-slate-800 shadow-sm dark:bg-orange-500/20 dark:text-orange-500">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500"></div>
                                </div>

                                {isExpanded && (
                                    <div className="min-w-0 flex-1 text-left">
                                        <p className="truncate text-sm font-bold text-neutral-800 dark:text-white">{user?.name}</p>
                                        <p className="truncate text-[11px] font-medium text-orange-600 dark:text-orange-500">Hội viên Vàng • 2.4k pts</p>
                                    </div>
                                )}
                            </button>
                            {isExpanded && (
                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50/50 px-3 py-2 text-sm font-semibold text-red-600 transition-all hover:bg-red-100 hover:border-red-200 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 hover:scale-[1.02]"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Đăng xuất
                                </button>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/auth')}
                            className={`w-full rounded-xl bg-orange-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 shadow-sm ${isExpanded ? 'px-4' : 'px-0 flex justify-center'}`}
                            title={!isExpanded ? 'Đăng nhập' : undefined}
                        >
                            {isExpanded ? 'Đăng nhập' : <UserIcon className="h-5 w-5" />}
                        </button>
                    )}
                </div>
            </div>
        </aside>
    );
};

/**
 * Component Sidebar dành riêng cho giao diện điện thoại (Mobile) được mở ra dưới dạng drawer.
 * @param setIsMobileMenuOpen - Hàm callback để đóng menu drawer khi người dùng click vào chuyển trang.
 */
export const MobileSidebar = ({ setIsMobileMenuOpen }: { setIsMobileMenuOpen: (val: boolean) => void }) => {
    const { isLoggedIn, user, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Xử lý đăng xuất ở màn mobile, sau đó đóng drawer.
     */
    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Đăng xuất thành công!');
            setIsMobileMenuOpen(false);
            navigate('/');
        } catch {
            toast.error('Đăng xuất thất bại. Vui lòng thử lại.');
        }
    };

    const navSections = getNavSections(isAdmin);

    /**
     * Kiểm tra xem đường dẫn có đang active không (tương tự như ở DesktopSidebar).
     */
    const isPathActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    /**
     * Hàm render cho từng menu item ở mobile, không phụ thuộc vào isExpanded do mobile luôn hiển thị full text.
     */
    const renderSidebarItem = (item: NavItem) => {
        const itemContent = (
            <>
                <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all duration-200 
                    ${isPathActive(item.path || '')
                        ? 'bg-orange-500 text-white shadow-sm dark:shadow-orange-500/20'
                        : 'bg-white/80 text-neutral-500 group-hover:bg-orange-100 group-hover:text-orange-600 dark:bg-slate-800 dark:text-gray-400 dark:group-hover:bg-slate-700 dark:group-hover:text-white'
                    }`}
                >
                    {item.icon}
                </span>
                <div className="min-w-0 flex-1 transition-opacity duration-200">
                    <p className="truncate text-sm font-semibold">{item.label}</p>
                    <p className="truncate text-xs text-neutral-500">{item.description}</p>
                </div>
                {item.badge && (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${item.badgeColor || 'bg-amber-100 text-amber-700'}`}>
                        {item.badge}
                    </span>
                )}
            </>
        );

        // Xử lý các tính năng disabled giống như desktop nhưng không bận tâm logic isExpanded
        if (item.disabled || !item.path) {
            return (
                <div className="group relative flex items-center gap-3 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 px-3 py-2.5 text-neutral-400 opacity-80 dark:bg-slate-800/50 dark:border-white/5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-400 dark:bg-slate-800/80 dark:text-gray-500">
                        {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-neutral-500 dark:text-gray-500">{item.label}</p>
                        <p className="truncate text-xs text-neutral-400 dark:text-gray-600">{item.description}</p>
                    </div>
                    {item.badge && (
                        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
                            {item.badge}
                        </span>
                    )}
                </div>
            );
        }

        return (
            <NavLink
                to={item.path}
                end={item.path === '/'}
                // Tự động đóng drawer khi click vào 1 trang mới
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition duration-200 ease-in-out border border-transparent ${isActive
                        ? 'bg-orange-50 text-orange-700 shadow-sm shadow-orange-100/50 dark:bg-slate-800 dark:text-white dark:shadow-black/30 dark:border-white/5'
                        : 'text-neutral-600 hover:bg-orange-50/50 hover:text-orange-600 dark:text-gray-300 dark:hover:bg-slate-800/50 dark:hover:text-white'
                    }`
                }
            >
                {({ isActive }) => (
                    <>
                        {isActive && (
                            <div className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-orange-500" />
                        )}
                        {itemContent}
                    </>
                )}
            </NavLink>
        );
    };

    return (
        <div className="space-y-5 border-t border-orange-100 px-4 py-4 md:hidden custom-scrollbar max-h-[80vh] overflow-y-auto dark:border-white/10 dark:bg-slate-900">
             <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 dark:text-gray-500" />
                <input
                    type="search"
                    placeholder="Tìm kiếm..."
                    className="h-10 w-full rounded-xl border border-orange-100 bg-neutral-50/50 pl-10 pr-3 text-sm text-neutral-700 outline-none transition-all placeholder:text-neutral-400 focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100/50 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:placeholder-gray-500 dark:focus:border-orange-500/50 dark:focus:ring-orange-500/20"
                />
            </div>
            {navSections.map((section) => (
                <section key={`mobile-${section.title}`} className="space-y-2">
                    <h2 className="px-2 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-400">
                        {section.title}
                    </h2>
                    <div className="space-y-1">
                        {section.items.map((item) => (
                            <div key={`mobile-${section.title}-${item.label}`}>
                                {renderSidebarItem(item)}
                            </div>
                        ))}
                    </div>
                </section>
            ))}

            {isLoggedIn ? (
                <div className="flex flex-col gap-3 border-t border-orange-100 dark:border-white/10 pt-5 pb-4">
                     <button
                        onClick={() => {
                            navigate('/profile');
                            setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 rounded-xl bg-orange-50 dark:bg-slate-800 p-3 transition-all hover:scale-[1.02]"
                    >
                        {user?.photoURL ? (
                             <img
                                src={user.photoURL}
                                alt={user.name}
                                referrerPolicy="no-referrer"
                                className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
                            />
                        ) : (
                             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-200 text-orange-700 border-2 border-white dark:border-slate-700 shadow-sm dark:bg-orange-500/20 dark:text-orange-500">
                                <UserIcon className="h-6 w-6" />
                            </div>
                        )}
                        <div className="flex-1 text-left">
                            <p className="font-bold text-neutral-800 dark:text-white">{user?.name}</p>
                            <p className="text-xs text-orange-600 dark:text-orange-500 font-medium">Hội viên Vàng • 2.4k pts</p>
                        </div>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition-all hover:scale-[1.02]"
                    >
                        <LogOut className="h-5 w-5" />
                        Đăng xuất
                    </button>
                </div>
            ) : (
                <div className="border-t border-orange-100 dark:border-neutral-800 pt-5 pb-4">
                    <button
                        onClick={() => {
                            navigate('/auth');
                            setIsMobileMenuOpen(false);
                        }}
                        className="w-full rounded-xl bg-orange-500 px-3 py-3 text-sm font-bold text-white shadow-md shadow-orange-200"
                    >
                        Đăng nhập để đồng bộ
                    </button>
                </div>
            )}
        </div>
    );
};
