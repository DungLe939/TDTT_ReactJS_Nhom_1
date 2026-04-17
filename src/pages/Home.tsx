import { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Map, ScanFace, Languages, Dices, Users, ArrowRight, Sparkles, Search, X } from 'lucide-react';

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

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

  const foodCategories = [
    { name: 'Phở Bò', img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGglRTElQkIlOUYlMjBiJUMzJUIyfGVufDB8fDB8fHww' },
    { name: 'Bánh Mì', img: 'https://images.unsplash.com/photo-1715925717150-2a6d181d8846?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YiVDMyVBMW5oJTIwbSVDMyVBQ3xlbnwwfHwwfHx8MA%3D%3D' },
    { name: 'Bún Bò', img: 'https://images.unsplash.com/photo-1597345637412-9fd611e758f3?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YiVDMyVCQW4lMjBiJUMzJUIyfGVufDB8fDB8fHww' },
    { name: 'Cơm Tấm', img: 'https://images.unsplash.com/photo-1766050587783-1c90751275dd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YyVDNiVBMW0lMjB0JUUxJUJBJUE1bXxlbnwwfHwwfHx8MA%3D%3D' },
    { name: 'Gỏi Cuốn', img: 'https://plus.unsplash.com/premium_photo-1663850685033-a8557389963e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8ZyVFMSVCQiU4RmklMjBjdSVFMSVCQiU5MW58ZW58MHx8MHx8fDA%3D' },
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F0] py-12 px-4 sm:px-6 lg:px-8 selection:bg-orange-200">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-20 mt-4 lg:mt-8">
          <div className="lg:w-[55%] flex flex-col items-start text-left space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-orange-600 font-bold text-sm tracking-wide bg-orange-100/50 px-4 py-2 rounded-full border border-orange-200/50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Trợ lý Du lịch Ẩm thực AI</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-[4rem] font-extrabold text-[#232323] leading-[1.1] tracking-tight"
            >
              Khám Phá Thế Giới, <br/>
              <span className="text-orange-500">Qua Từng Món Ăn</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-neutral-600 leading-relaxed max-w-xl"
            >
              Hương Vị Bản Địa giúp bạn khám phá, nhận diện và tận hưởng ẩm thực đích thực ở bất cứ nơi đâu. Từ nhận diện món ăn tức thì tới dịch thuật thông minh.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <Link 
                to="/scan"
                className="flex items-center justify-center gap-2 bg-[#F97316] text-white px-8 py-4 rounded-xl font-bold shadow-[0_10px_30px_-5px_rgba(249,115,22,0.4)] hover:-translate-y-0.5 hover:shadow-[0_15px_30px_-5px_rgba(249,115,22,0.5)] transition-all w-full sm:w-auto"
              >
                <ScanFace className="w-5 h-5" />
                Quét Món Ăn Ngay
              </Link>
              <Link 
                to="/itinerary"
                className="flex items-center justify-center bg-white text-neutral-800 border border-neutral-100 shadow-sm px-8 py-4 rounded-xl font-bold hover:shadow hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                Khám Phá Tính Năng
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between sm:justify-start sm:gap-14 pt-8 w-full border-t border-orange-900/10 mt-6"
            >
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-1">10K+</div>
                <div className="text-xs md:text-sm text-neutral-500 font-medium whitespace-nowrap">Món Ăn Khám Phá</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-1">150+</div>
                <div className="text-xs md:text-sm text-neutral-500 font-medium whitespace-nowrap">Quốc Gia</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-neutral-900 mb-1">50K+</div>
                <div className="text-xs md:text-sm text-neutral-500 font-medium whitespace-nowrap">Người Dùng</div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:w-[45%] relative w-full mt-12 lg:mt-0"
          >
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-orange-900/10 aspect-[4/3] w-full">
              <img 
                src="https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=2164&auto=format&fit=crop" 
                alt="Delicious Asian Food" 
                className="w-full h-full object-cover"
              />
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-8 left-4 md:-bottom-12 md:-left-12 bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] w-[90%] md:w-[340px] border border-white/50"
            >
              <div className="flex gap-4 items-center">
                <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl overflow-hidden shrink-0 border-[3px] border-white shadow-sm bg-orange-50">
                  <img src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1964&auto=format&fit=crop" alt="Phở Bò" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-extrabold text-neutral-900 text-base md:text-lg">Phở Bò</h3>
                    <span className="text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">98% Match</span>
                  </div>
                  <p className="text-xs md:text-sm text-neutral-500 mb-2 font-medium">Vietnamese Beef Noodle Soup</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── RICH Search Banner Section with HCM Background ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative mt-30 mb-30 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-900/10"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600&auto=format&fit=crop&q=80')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 50%',
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[1px]" />

          <div className="relative flex flex-col lg:flex-row items-center gap-8 px-8 md:px-14 py-16">
            <div className="flex-1 z-10 w-full">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
                className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-8"
              >
                Xin chào <span className="text-orange-500">User</span>,<br />
                bạn muốn ăn gì vào ngày hôm nay nào?
              </motion.h2>

              {/* Search input inside the HCM Banner */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="relative flex items-center bg-white rounded-2xl shadow-2xl overflow-hidden mb-8"
              >
                <Search className="absolute left-5 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm món ăn yêu thích..."
                  className="flex-1 pl-14 pr-4 py-5 text-neutral-800 outline-none font-medium"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="mr-2 p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400">
                    <X className="w-5 h-5" />
                  </button>
                )}
                <button className="m-2 px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/30">
                  Tìm kiếm
                </button>
              </motion.div>

              {/* Category buttons inside the HCM Banner */}
              <div className="flex flex-wrap gap-3">
                {foodCategories.map((cat, i) => (
                  <motion.button
                    key={cat.name}
                    whileHover={{ y: -4, scale: 1.05 }}
                    onClick={() => setSearchQuery(cat.name)}
                    className="flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 transition-all"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/20">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid Header */}
        <div className="text-center md:text-left mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-3">Các Tính Năng Nổi Bật</h2>
          <p className="text-neutral-600 text-lg">Khám phá sức mạnh của AI trong trải nghiệm văn hóa và ẩm thực</p>
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
                className="block h-full bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all group hover:-translate-y-1 relative overflow-hidden"
              >
                <div className={`w-16 h-16 rounded-2xl ${feature.color} text-white flex items-center justify-center mb-6 shadow-lg shadow-${feature.color}/20 relative z-10`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-orange-500 transition-colors relative z-10">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 mb-6 line-clamp-2 relative z-10">
                  {feature.description}
                </p>
                <div className="flex items-center text-sm font-bold text-neutral-900 group-hover:text-orange-500 transition-colors mt-auto pt-4 border-t border-neutral-100 relative z-10">
                  Trải nghiệm ngay <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};