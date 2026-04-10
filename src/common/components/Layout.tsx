import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router';
import { useAuth } from '@/context/AuthContext';
import { Map, ScanFace, Languages, Dices, Menu, X, User as UserIcon, LogOut, Code, Users } from 'lucide-react';
import { Chatbot } from './Chatbot';

export const Layout = () => {
  const { isLoggedIn, user, login, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Lịch trình', icon: <Map className="w-5 h-5" /> },
    { path: '/scan', label: 'Quét món', icon: <ScanFace className="w-5 h-5" /> },
    { path: '/menu', label: 'Menu AI', icon: <Languages className="w-5 h-5" /> },
    { path: '/quests', label: 'Nhiệm vụ', icon: <Dices className="w-5 h-5" /> },
    { path: '/group', label: 'Nhóm ăn', icon: <Users className="w-5 h-5" /> },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Developer', icon: <Code className="w-5 h-5" /> });
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
                T
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 hidden sm:block">
                TasteTrekker
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'text-orange-500 border-b-2 border-orange-500' : 'text-neutral-600 hover:text-orange-400'
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <UserIcon className="w-4 h-4" />
                    <span>Xin chào, {user?.name}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate('/auth')}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => login('admin')}
                    className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                  >
                    Admin
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {!isLoggedIn && (
                <>
                  <button
                    onClick={() => navigate('/auth')}
                    className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => login('admin')}
                    className="bg-neutral-800 text-white px-3 py-1.5 rounded-full text-sm font-medium"
                  >
                    Admin
                  </button>
                </>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-neutral-500 hover:text-neutral-700 focus:outline-none"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-100 px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium ${isActive ? 'bg-orange-50 text-orange-600' : 'text-neutral-700 hover:bg-neutral-50'
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
            {isLoggedIn && (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      <Chatbot />
    </div>
  );
};
