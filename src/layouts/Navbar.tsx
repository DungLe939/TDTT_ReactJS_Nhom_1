import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Map, ScanLine, Languages, Ticket, Users, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Lịch trình', icon: Map, path: '/schedule' },
    { label: 'Quét món', icon: ScanLine, path: '/scanning' },
    { label: 'Menu AI', icon: Languages, path: '/menu-ai' },
    { label: 'Nhiệm vụ', icon: Ticket, path: '/quests' },
    { label: 'Nhóm ăn', icon: Users, path: '/group-taste' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 font-sans sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <Link to="/" className="flex-shrink-0 flex items-center cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center mr-2">
              <span className="text-white font-bold text-lg leading-none">T</span>
            </div>
            <span className="text-orange-500 font-bold text-xl tracking-wide">TasteTrekker</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center items-center">
            <div className="flex space-x-8 h-full">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={index}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-2 px-1 cursor-pointer transition-colors duration-200 h-full border-b-2 ${
                        isActive
                          ? 'border-orange-500 text-orange-500'
                          : 'border-transparent text-gray-600 hover:text-orange-500'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer">
              Đăng nhập
            </button>
            <button className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer">
              Admin
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={index}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-3 rounded-md cursor-pointer ${
                      isActive
                        ? 'bg-orange-50 text-orange-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-orange-500'
                    }`
                  }
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              );
            })}
            <div className="pt-4 pb-2 space-y-2 px-3">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full font-medium transition-colors cursor-pointer">
                Đăng nhập
              </button>
              <button className="w-full bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-full font-medium transition-colors cursor-pointer">
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
