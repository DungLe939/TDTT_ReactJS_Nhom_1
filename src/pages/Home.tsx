import React from 'react';
import { Link } from 'react-router-dom';
import { ScanLine, Map } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-white flex flex-col items-center justify-center text-center px-4 py-20 border-b border-gray-200">
        <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center mb-6 shadow-lg">
          <span className="text-white font-bold text-4xl leading-none">T</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
          Chào mừng đến với <span className="text-orange-500">TasteTrekker</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl">
          Khám phá ẩm thực tuyệt vời, quét món ăn bằng AI, và chia sẻ cùng nhóm của bạn!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link 
            to="/scanning" 
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-8 rounded-full transition-colors shadow-md hover:shadow-lg"
          >
            <ScanLine size={20} />
            Quét món ngay
          </Link>
          <Link 
            to="/schedule" 
            className="flex items-center justify-center gap-2 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-8 rounded-full transition-colors shadow-sm hover:shadow-md"
          >
            <Map size={20} />
            Lên lịch trình
          </Link>
        </div>
      </section>

      {/* Feature snapshot / Spacer */}
      <section className="w-full max-w-5xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Tính năng nổi bật</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScanLine size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Nhận diện món ăn AI</h3>
            <p className="text-gray-500 text-sm">Chỉ cần đưa camera lên, TasteTrekker sẽ cho bạn biết đó là món gì.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Lịch trình ăn uống</h3>
            <p className="text-gray-500 text-sm">Tạo và quản lý lịch trình đi ăn cùng bạn bè một cách dễ dàng.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-lg mb-2">Nhóm ăn</h3>
            <p className="text-gray-500 text-sm">Rủ bạn bè tham gia nhóm ăn và cùng nhau chia sẻ chi phí.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;