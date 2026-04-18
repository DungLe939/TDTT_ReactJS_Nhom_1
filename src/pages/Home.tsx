import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { Map, ScanFace, Languages, Dices, Users, ArrowRight, Sparkles, Search, X, Smartphone } from 'lucide-react';

/* ── CSS injected once for the stroke-draw animation ── */
const ICON_ANIMATION_CSS = `
  @keyframes drawStroke {
    from { stroke-dashoffset: var(--dash-len, 500); opacity: 0.4; }
    to   { stroke-dashoffset: 0;                    opacity: 1;   }
  }
  .icon-draw svg path,
  .icon-draw svg circle,
  .icon-draw svg line,
  .icon-draw svg polyline,
  .icon-draw svg rect,
  .icon-draw svg ellipse {
    stroke-dasharray:  500;
    stroke-dashoffset: 500;
    animation: drawStroke 0.75s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('icon-draw-style')) {
  const s = document.createElement('style');
  s.id = 'icon-draw-style';
  s.textContent = ICON_ANIMATION_CSS;
  document.head.appendChild(s);
}

/* ── individual feature card with hover animations ── */
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgLight: string;
  iconColor: string;
  path: string;
}

const FeatureCard = ({ feature, idx }: { feature: Feature; idx: number }) => {
  const [hovered, setHovered] = useState(false);
  const [drawKey, setDrawKey] = useState(0);

  const handleEnter = () => {
    setHovered(true);
    setDrawKey(k => k + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 + idx * 0.1 }}
    >
      <Link
        to={feature.path}
        className="block h-full bg-white rounded-[2rem] p-8 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.10)] transition-all group relative overflow-hidden"
        onMouseEnter={handleEnter}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[2rem]"
          style={{ background: `radial-gradient(ellipse at top left, ${feature.color}12 0%, transparent 65%)` }}
        />

        <motion.div
          className="mb-6 relative w-fit"
          animate={
            hovered
              ? { y: [0, -7, 0, -4, 0], rotate: [0, -5, 5, -3, 0] }
              : { y: 0, rotate: 0 }
          }
          transition={
            hovered
              ? { duration: 1.8, ease: 'easeInOut', repeat: Infinity }
              : { duration: 0.35, ease: 'easeOut' }
          }
        >
          <motion.div
            className="absolute -inset-2 rounded-3xl pointer-events-none"
            style={{ border: `2px solid ${feature.color}` }}
            animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          />

          <div
            className={`w-16 h-16 rounded-2xl ${feature.bgLight} border-2 ${feature.borderColor} ${feature.iconColor} flex items-center justify-center relative transition-all duration-300`}
            style={{ boxShadow: hovered ? `0 8px 24px -4px ${feature.color}40` : 'none' }}
          >
            <div key={drawKey} className={hovered ? 'icon-draw' : ''}>
              {feature.icon}
            </div>
          </div>
        </motion.div>

        <h3 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-orange-500 transition-colors relative z-10">
          {feature.title}
        </h3>
        <p className="text-neutral-600 mb-6 line-clamp-2 relative z-10">
          {feature.description}
        </p>

        <div className="flex items-center text-sm font-bold text-neutral-900 group-hover:text-orange-500 transition-colors mt-auto pt-4 border-t border-neutral-100 relative z-10">
          Trải nghiệm ngay
          <motion.span
            animate={hovered ? { x: [0, 5, 0] } : { x: 0 }}
            transition={hovered ? { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } : {}}
            className="ml-2"
          >
            <ArrowRight className="w-4 h-4" />
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
};

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const heroSlides = [
    {
      mainImg: 'https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=2164&auto=format&fit=crop',
      avatarImg: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=400&auto=format&fit=crop',
      title: 'Phở Bò',
      description: 'Vietnamese Beef Noodle Soup',
      match: '98%',
    },
    {
      mainImg: 'https://images.unsplash.com/photo-1645571059598-4f1f23df9a19?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8YiVDMyVBMW5oJTIwbSVDMyVBQ3xlbnwwfHwwfHx8MA%3D%3D',
      avatarImg: 'https://images.unsplash.com/photo-1715925717150-2a6d181d8846?w=400&auto=format&fit=crop',
      title: 'Bánh Mì',
      description: 'Crispy Vietnamese Sandwich',
      match: '95%',
    },
    {
      mainImg: 'https://media.istockphoto.com/id/2171448100/photo/traditional-vietnamese-b%C3%BAn-b%C3%B2-hu%E1%BA%BF-with-aromatic-broth-and-tender-beef.webp?a=1&b=1&s=612x612&w=0&k=20&c=3WKE_E7UmtU0Nfe0n3saWhFt-TM618BEdER2VvI40eA=',
      avatarImg: 'https://images.unsplash.com/photo-1597345637412-9fd611e758f3?w=400&auto=format&fit=crop',
      title: 'Bún Bò Huế',
      description: 'Spicy Beef & Pork Noodle',
      match: '99%',
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const features: Feature[] = [
    {
      title: 'Lịch trình Food Tour',
      description: 'Lên lịch trình khám phá ẩm thực tự động dành riêng cho bạn một cách thông minh.',
      icon: <Map className="w-8 h-8" strokeWidth={1.5} />,
      color: '#F97316',
      borderColor: 'border-orange-300',
      bgLight: 'bg-orange-50',
      iconColor: 'text-orange-500',
      path: '/itinerary'
    },
    {
      title: 'Quét Món Ăn',
      description: 'Sử dụng AI để nhận diện món ăn tại địa phương chỉ bằng một cú chụp.',
      icon: <ScanFace className="w-8 h-8" strokeWidth={1.5} />,
      color: '#F43F5E',
      borderColor: 'border-rose-300',
      bgLight: 'bg-rose-50',
      iconColor: 'text-rose-500',
      path: '/scan'
    },
    {
      title: 'Menu Đa Ngôn Ngữ',
      description: 'Dịch thuật menu qua nhiều ngôn ngữ một cách chính xác và nhanh chóng.',
      icon: <Languages className="w-8 h-8" strokeWidth={1.5} />,
      color: '#10B981',
      borderColor: 'border-emerald-300',
      bgLight: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      path: '/menu'
    },
    {
      title: 'Nhiệm Vụ Ẩm Thực',
      description: 'Hoàn thành các nhiệm vụ khám phá để nhận phần thưởng thú vị và hấp dẫn.',
      icon: <Dices className="w-8 h-8" strokeWidth={1.5} />,
      color: '#8B5CF6',
      borderColor: 'border-violet-300',
      bgLight: 'bg-violet-50',
      iconColor: 'text-violet-500',
      path: '/quests'
    },
    {
      title: 'Nhóm Ăn',
      description: 'Tìm kiếm mạng lưới những người đam mê ẩm thực và cùng nhau khám phá.',
      icon: <Users className="w-8 h-8" strokeWidth={1.5} />,
      color: '#3B82F6',
      borderColor: 'border-blue-300',
      bgLight: 'bg-blue-50',
      iconColor: 'text-blue-500',
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
    <div className="w-full selection:bg-orange-200 relative pb-24">
      {/* GLOBAL HOME BACKGROUND */}
      <div className="fixed inset-0 z-[-1]">
        <div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1600&auto=format&fit=crop&q=80')] bg-cover bg-center"
        />
        <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[2px]" />
      </div>

      <div className="w-full">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 mb-16 md:mt-2">
          <div className="lg:w-[55%] flex flex-col items-start text-left space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-orange-400 font-bold text-sm tracking-wide bg-orange-500/20 px-4 py-2 rounded-full border border-orange-500/30"
            >
              <Sparkles className="w-4 h-4" />
              <span>Trợ lý Du lịch Ẩm thực AI</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl lg:text-[4rem] font-extrabold text-white leading-[1.1] tracking-tight"
            >
              Khám Phá Thế Giới, <br/>
              <span className="text-orange-500">Qua Từng Món Ăn</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-white/80 leading-relaxed max-w-xl font-medium"
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
                className="flex items-center justify-center bg-white/10 text-white border border-white/20 backdrop-blur-sm shadow-sm px-8 py-4 rounded-xl font-bold hover:bg-white/20 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
              >
                Khám Phá Tính Năng
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-between sm:justify-start sm:gap-14 pt-8 w-full border-t border-white/20 mt-6"
            >
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-white mb-1">10K+</div>
                <div className="text-xs md:text-sm text-white/60 font-medium whitespace-nowrap">Món Ăn Khám Phá</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-white mb-1">150+</div>
                <div className="text-xs md:text-sm text-white/60 font-medium whitespace-nowrap">Quốc Gia</div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-white mb-1">50K+</div>
                <div className="text-xs md:text-sm text-white/60 font-medium whitespace-nowrap">Người Dùng</div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="lg:w-[45%] relative w-full mt-12 lg:mt-0"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 aspect-[4/3] w-full bg-neutral-100 border-[8px] border-white">
              {heroSlides.map((slide, idx) => (
                <motion.img 
                  key={idx}
                  animate={{ opacity: currentSlideIndex === idx ? 1 : 0 }}
                  transition={{ duration: 1 }}
                  src={slide.mainImg} 
                  alt={slide.title} 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ))}
              
              {/* Slider Dots Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {heroSlides.map((_, idx) => (
                  <button
                    key={'dot-'+idx}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${currentSlideIndex === idx ? 'bg-white w-8 shadow-sm' : 'bg-white/60 hover:bg-white/90 w-2'}`}
                  />
                ))}
              </div>
            </div>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="absolute -bottom-8 left-4 md:-bottom-12 md:-left-12 bg-white/95 backdrop-blur-md p-4 md:p-5 rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] w-[90%] md:w-[340px] border border-white/50 h-[104px] md:h-[112px] overflow-hidden"
            >
              {heroSlides.map((slide, idx) => (
                <motion.div
                  key={'card-'+idx}
                  animate={{ opacity: currentSlideIndex === idx ? 1 : 0, y: currentSlideIndex === idx ? 0 : 5 }}
                  transition={{ duration: 0.5 }}
                  className={`absolute left-4 right-4 md:left-5 md:right-5 top-4 md:top-5 flex gap-4 items-center ${currentSlideIndex === idx ? 'pointer-events-auto z-10' : 'pointer-events-none z-0'}`}
                >
                  <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl overflow-hidden shrink-0 border-[3px] border-white shadow-sm bg-orange-50">
                    <img src={slide.avatarImg} alt={slide.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-extrabold text-neutral-900 text-base md:text-lg truncate pr-2">{slide.title}</h3>
                      <span className="text-[10px] md:text-xs font-bold text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">{slide.match} Match</span>
                    </div>
                    <p className="text-xs md:text-sm text-neutral-500 font-medium truncate">{slide.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* ── RICH Search Banner Section ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="relative my-16 lg:my-24 rounded-[3rem] overflow-hidden border border-white/40 bg-white/30 backdrop-blur-md shadow-2xl shadow-black/30 w-full"
        >
          <div className="relative flex flex-col lg:flex-row items-center gap-10 px-8 md:px-16 lg:px-20 py-12 lg:py-20 w-full">
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
              <div className="flex flex-wrap gap-4 md:gap-5 lg:gap-6 mt-6">
                {foodCategories.map((cat) => (
                  <motion.button
                    key={cat.name}
                    whileHover={{ y: -8, scale: 1.05 }}
                    onClick={() => setSearchQuery(cat.name)}
                    className="flex flex-col items-center gap-3 lg:gap-4 bg-white/30 hover:bg-white/40 backdrop-blur-xl border-[1px] border-white/60 rounded-[2rem] px-6 py-5 lg:px-8 lg:py-6 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.25)]"
                  >
                    <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-[1.25rem] overflow-hidden border-[2px] border-white/80 shadow-md">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
                    </div>
                    <span className="text-sm lg:text-base font-extrabold text-white uppercase tracking-wider drop-shadow-lg">{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section Frame */}
        <div className="relative p-8 md:p-12 rounded-[3rem] border border-white/40 bg-white/30 backdrop-blur-md shadow-2xl shadow-black/30">
          {/* Feature Grid Header */}
          <div className="text-center md:text-left mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">Các Tính Năng Nổi Bật</h2>
            <p className="text-white/80 text-lg font-medium">Khám phá sức mạnh của AI trong trải nghiệm văn hóa và ẩm thực</p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <FeatureCard key={feature.title} feature={feature} idx={idx} />
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-20 p-10 md:p-14 bg-[#f5f5f5] rounded-[3rem] shadow-xl text-neutral-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Col 1 */}
            <div className="flex flex-col space-y-3 text-sm font-medium">
              <h4 className="font-extrabold text-neutral-900 mb-2 text-base">Công ty</h4>
              <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline transition-colors w-fit">Giới thiệu</a>
              <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline transition-colors w-fit">Trung tâm Trợ giúp</a>
              <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline transition-colors w-fit">Quy chế</a>
              <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline transition-colors w-fit">Điều khoản sử dụng</a>
              <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline transition-colors w-fit">Bảo mật thông tin</a>
              <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline transition-colors w-fit">Giải quyết khiếu nại</a>
              <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline transition-colors w-fit">Liên hệ</a>
              <a href="#" className="text-blue-600 hover:text-orange-500 hover:underline transition-colors w-fit">Hợp tác cùng chúng tôi</a>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col space-y-4">
              <h4 className="font-extrabold text-neutral-900 mb-1 text-base">Ứng dụng Hương Vị Bản Địa</h4>
              <button className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-xl hover:bg-neutral-800 transition-all w-fit shadow-lg">
                <Smartphone className="w-7 h-7" />
                <div className="text-left">
                  <div className="text-[10px] leading-none opacity-80 mb-0.5">Tải về trên</div>
                  <div className="text-[15px] font-bold leading-tight tracking-wide">App Store</div>
                </div>
              </button>
              <button className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-xl hover:bg-neutral-800 transition-all w-fit shadow-lg">
                <Smartphone className="w-7 h-7" />
                <div className="text-left">
                  <div className="text-[10px] leading-none opacity-80 mb-0.5">Tải về trên</div>
                  <div className="text-[15px] font-bold leading-tight tracking-wide">Google Play</div>
                </div>
              </button>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col items-center lg:items-center space-y-4 lg:col-span-1">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-white mb-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                  <img src="/Logo.jpg" alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                </div>
                <h4 className="font-extrabold text-orange-600 text-lg">Hương Vị Bản Địa</h4>
              </div>
              <p className="text-xs text-neutral-400 font-medium tracking-wide">
                © 2026 Hương Vị Bản Địa
              </p>
              <div className="flex gap-4 pt-2">
                <button className="w-9 h-9 rounded-full bg-neutral-300/80 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center text-neutral-700 shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="w-9 h-9 rounded-full bg-neutral-300/80 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center text-neutral-700 shadow-sm">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Col 4 */}
            <div className="flex flex-col space-y-1.5 text-[13px] text-neutral-600 text-left lg:text-right">
              <h4 className="font-extrabold text-neutral-900 mb-3 text-base">Địa chỉ công ty</h4>
              <p className="font-bold text-neutral-800">Công Ty Cổ Phần Ẩm Thực Bản Địa</p>
              <p>Lầu G, Tòa nhà Innovation,</p>
              <p>số 244 đường Cống Quỳnh, Phạm Ngũ Lão, Quận 1, TPHCM</p>
              <p>Giấy CN ĐKDN số: 0311828036</p>
              <p>do Sở Kế hoạch và Đầu tư TP.HCM cấp</p>
              <p>sửa đổi lần thứ 23, ngày 10/12/2020</p>
              <p className="pt-2">Chịu trách nhiệm nội dung: Nguyễn Hồ Quảng Giang</p>
              <p>Điện thoại liên hệ: <span className="font-medium text-neutral-800">028 71096879</span></p>
              <p>Email: <a href="mailto:cskh@support.huongvi.vn" className="text-blue-600 hover:underline">cskh@support.huongvi.vn</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};