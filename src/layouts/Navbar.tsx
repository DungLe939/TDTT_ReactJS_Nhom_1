import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Map, ScanLine, Languages, Ticket, Users, Menu, X } from 'lucide-react';

/**
 * Component Navbar - Thanh điều hướng dùng chung cho cả giao diện desktop & mobile.
 * Đồng bộ theo thiết kế Figma Layout.tsx của nhóm.
 */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Lịch trình', icon: Map, path: '/schedule' },
    { label: 'Quét món', icon: ScanLine, path: '/scan' },
    { label: 'Menu AI', icon: Languages, path: '/menu' },
    { label: 'Nhiệm vụ', icon: Ticket, path: '/quests' },
    { label: 'Nhóm ăn', icon: Users, path: '/group' },
  ];

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
              T
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500 hidden sm:block">
              TasteTrekker
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-orange-500 border-b-2 border-orange-500' : 'text-neutral-600 hover:text-orange-400'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Đăng nhập
            </button>
            <button className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              Admin
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium">
              Đăng nhập
            </button>
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
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium ${
                    isActive ? 'bg-orange-50 text-orange-600' : 'text-neutral-700 hover:bg-neutral-50'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};

export default Navbar;
