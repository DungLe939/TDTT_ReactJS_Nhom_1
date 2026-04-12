import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Map, ScanFace, Languages, Dices, Users, ArrowRight } from 'lucide-react';

/**
 * Component Home - Thành phần trang chủ của ứng dụng TasteTrekker.
 * 
 * Trực tiếp gọi Component `SchedulePage` từ Module Schedule.
 * 
 * Điều này đảm bảo:
 * 1. Toàn bộ logic Lịch trình được gom nhóm trong Module riêng.
 * 2. Khi nhóm phát triển thêm các phần khác (Scan, Menu), trang chủ vẫn tự động 
 *    hiển thị đúng Module Lịch trình mà không bị phân tán code.
 */
export const Home = () => {

  const features = [
    {
      title: 'Lịch trình Food Tour',
      description: 'Lên lịch trình khám phá ẩm thực tự động dành riêng cho bạn một cách thông minh.',
      icon: <Map className="w-8 h-8" />,
      color: 'bg-orange-500',
      path: '/itinerary'
    },
    {
      title: 'Quét Món Ăn',
      description: 'Sử dụng AI để nhận diện món ăn tại địa phương chỉ bằng một cú chụp.',
      icon: <ScanFace className="w-8 h-8" />,
      color: 'bg-rose-500',
      path: '/scan'
    },
    {
      title: 'Menu Đa Ngôn Ngữ',
      description: 'Dịch thuật menu qua nhiều ngôn ngữ một cách chính xác và nhanh chóng.',
      icon: <Languages className="w-8 h-8" />,
      color: 'bg-emerald-500',
      path: '/menu'
    },
    {
      title: 'Nhiệm Vụ Ẩm Thực',
      description: 'Hoàn thành các nhiệm vụ khám phá để nhận phần thưởng thú vị và hấp dẫn.',
      icon: <Dices className="w-8 h-8" />,
      color: 'bg-violet-500',
      path: '/quests'
    },
    {
      title: 'Nhóm Ăn',
      description: 'Tìm kiếm mạng lưới những người đam mê ẩm thực và cùng nhau khám phá.',
      icon: <Users className="w-8 h-8" />,
      color: 'bg-blue-500',
      path: '/group'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center mb-16 space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-semibold text-sm mb-4"
        >
          Chào mừng đến với Hương Vị Bản Địa 🥘
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold text-neutral-900 tracking-tight"
        >
          Khám Phá <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-500">Ẩm Thực</span> <br />
          Trải Nghiệm Độc Đáo
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto text-lg text-neutral-600 leading-relaxed"
        >
          Hương Vị Bản Địa giúp bạn dễ dàng khám phá và thưởng thức những đặc sản địa phương ở bất cứ đâu. 
          Từ lên lịch trình, quét món ăn đến dịch thuật ẩm thực, tất cả trong một!
        </motion.p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <Link 
              to={feature.path}
              className="block h-full bg-white rounded-3xl p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all group scale-100 hover:-translate-y-1"
            >
              <div className={`w-16 h-16 rounded-2xl ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-${feature.color}/20`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-orange-500 transition-colors">
                {feature.title}
              </h3>
              <p className="text-neutral-600 mb-6 line-clamp-2">
                {feature.description}
              </p>
              
              <div className="flex items-center text-sm font-bold text-neutral-900 group-hover:text-orange-500 transition-colors mt-auto pt-4 border-t border-neutral-100">
                Khám phá ngay <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;
