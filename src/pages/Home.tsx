import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Search, Map, ScanFace, Languages, Dices, Users, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { FeatureCard, type Feature } from './HomeComponents';
import { useAuth } from '@/modules/auth/context/AuthContext';

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    let lastY = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      
      // Scrolled state for background change
      setScrolled(currentY > 50);

      // Hide/Show logic
      if (currentY > 200) {
        if (currentY > lastY) {
          setIsVisible(false); // Scrolling down
        } else {
          setIsVisible(true); // Scrolling up
        }
      } else {
        setIsVisible(true);
      }
      
      lastY = currentY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) {
    return <nav className="fixed top-0 w-full z-50 px-6 md:px-12 py-4 h-20 bg-transparent" />;
  }

  return (
    <motion.nav 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 px-6 md:px-12 py-4 flex items-center justify-between ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-white/5 py-3 shadow-lg' : 'bg-transparent'}`}
    >
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="text-lg md:text-xl font-bold text-white tracking-tight">
          Hương Vị <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">Bản Địa</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-10 text-white/90 text-sm font-medium">
        <a href="#search-section" className="hover:text-white hover:opacity-100 opacity-80 transition-opacity">Tìm Kiếm</a>
        <a href="#features-section" className="hover:text-white hover:opacity-100 opacity-80 transition-opacity">Tính Năng</a>
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        {mounted && (
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="text-white/80 hover:text-white transition-colors p-2"
            title="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}
        <a href="#search-section" className="text-white/80 hover:text-white transition-colors hidden sm:block p-2">
          <Search className="w-5 h-5" />
        </a>
        {isLoggedIn ? (
          <button onClick={() => navigate('/profile')} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium transition-all border border-white/20 flex items-center gap-2">
             {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-6 h-6 rounded-full" />
             ) : (
                <div className="w-6 h-6 rounded-full bg-orange-500" />
             )}
             <span className="hidden md:inline">Hồ Sơ</span>
          </button>
        ) : (
          <button onClick={() => navigate('/auth')} className="bg-white text-black hover:bg-neutral-200 px-5 py-2 rounded-sm text-sm font-bold transition-all shadow-md">
            Đăng Nhập
          </button>
        )}
      </div>
    </motion.nav>
  );
};

export const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const features: Feature[] = [
    {
      title: 'Lịch trình Food Tour',
      description: 'Lên lịch trình khám phá ẩm thực tự động dành riêng cho bạn.',
      icon: <Map className="w-8 h-8" strokeWidth={1.5} />,
      color: '#F97316',
      borderColor: 'border-orange-300 dark:border-orange-500/20',
      bgLight: 'bg-orange-50 dark:bg-orange-500/10',
      iconColor: 'text-orange-500',
      path: '/itinerary'
    },
    {
      title: 'Quét Món Ăn',
      description: 'Sử dụng AI để nhận diện món ăn tại địa phương chỉ bằng một cú chụp.',
      icon: <ScanFace className="w-8 h-8" strokeWidth={1.5} />,
      color: '#F43F5E',
      borderColor: 'border-rose-300 dark:border-rose-500/20',
      bgLight: 'bg-rose-50 dark:bg-rose-500/10',
      iconColor: 'text-rose-500',
      path: '/scan'
    },
    {
      title: 'Menu Đa Ngôn Ngữ',
      description: 'Dịch thuật menu qua nhiều ngôn ngữ một cách chính xác.',
      icon: <Languages className="w-8 h-8" strokeWidth={1.5} />,
      color: '#10B981',
      borderColor: 'border-emerald-300 dark:border-emerald-500/20',
      bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
      iconColor: 'text-emerald-500',
      path: '/menu'
    },
    {
      title: 'Nhiệm Vụ Ẩm Thực',
      description: 'Hoàn thành các nhiệm vụ khám phá để nhận phần thưởng hấp dẫn.',
      icon: <Dices className="w-8 h-8" strokeWidth={1.5} />,
      color: '#8B5CF6',
      borderColor: 'border-violet-300 dark:border-violet-500/20',
      bgLight: 'bg-violet-50 dark:bg-violet-500/10',
      iconColor: 'text-violet-500',
      path: '/quests'
    },
    {
      title: 'Nhóm Ăn',
      description: 'Tìm kiếm mạng lưới những người đam mê ẩm thực và cùng khám phá.',
      icon: <Users className="w-8 h-8" strokeWidth={1.5} />,
      color: '#3B82F6',
      borderColor: 'border-blue-300 dark:border-blue-500/20',
      bgLight: 'bg-blue-50 dark:bg-blue-500/10',
      iconColor: 'text-blue-500',
      path: '/group'
    }
  ];

  const foodCategories = [
    { name: 'Phở Bò', img: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&auto=format&fit=crop&q=60' },
    { name: 'Bánh Mì', img: 'https://images.unsplash.com/photo-1715925717150-2a6d181d8846?w=600&auto=format&fit=crop&q=60' },
    { name: 'Bún Bò', img: 'https://images.unsplash.com/photo-1597345637412-9fd611e758f3?w=600&auto=format&fit=crop&q=60' },
    { name: 'Cơm Tấm', img: 'https://images.unsplash.com/photo-1766050587783-1c90751275dd?w=600&auto=format&fit=crop&q=60' },
    { name: 'Gỏi Cuốn', img: 'https://plus.unsplash.com/premium_photo-1663850685033-a8557389963e?w=600&auto=format&fit=crop&q=60' },
  ];

  return (
    <div className="w-full bg-[#F7F3EE] dark:bg-slate-950 font-sans selection:bg-orange-200">
      <LandingNavbar />

      {/* Hero Section (Netcompany Style) */}
      <section className="relative w-full h-screen flex items-center justify-start overflow-hidden bg-black">
        {/* Background Overlay Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1555126634-323283e090fa?q=80&w=2164&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover scale-105 opacity-80"
          />
          {/* Gradient to darken the left side for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {/* Tech/AI Grid Overlay - Chỉ hiển thị bên trái và mờ dần sang phải */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.06) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)
              `,
              backgroundSize: '96px 96px',
              maskImage: 'linear-gradient(to right, black 20%, transparent 80%)',
              WebkitMaskImage: 'linear-gradient(to right, black 20%, transparent 80%)'
            }}
          />
        </div>

        <div className="relative z-10 px-8 md:px-16 lg:px-24 w-full max-w-[1600px] mx-auto mt-20 md:mt-0">
          <div className="max-w-3xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[3.5rem] md:text-7xl lg:text-[6rem] font-bold text-white leading-[1.05] tracking-tight mb-6"
            >
              Khám phá <br className="hidden md:block" /> thế giới <br className="hidden md:block" /> qua từng món ăn
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-lg md:text-2xl text-white/80 font-light mb-10 max-w-2xl tracking-wide"
            >
              Trợ lý AI giúp bạn nhận diện, tìm hiểu và trải nghiệm ẩm thực đích thực ở bất cứ nơi đâu.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <Link 
                to="/scan"
                className="inline-flex items-center justify-center bg-orange-600 text-white px-8 py-4 text-base md:text-lg font-medium tracking-wide rounded-sm hover:bg-orange-700 transition-colors shadow-lg"
              >
                Bắt đầu khám phá
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center animate-bounce">
          <span className="text-white/60 text-xs mb-2 uppercase tracking-widest">Cuộn xuống</span>
          <div className="w-px h-12 bg-white/40"></div>
        </div>
      </section>

      {/* Main Content Area with Animated Background */}
      <div className="relative w-full bg-[#F7F3EE] dark:bg-slate-950 overflow-hidden -mt-px">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Subtle Grid - Light Mode */}
          <div className="absolute inset-0 dark:hidden" style={{ backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px)', backgroundSize: '96px 96px' }} />
          {/* Subtle Grid - Dark Mode */}
          <div className="absolute inset-0 hidden dark:block" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '96px 96px' }} />
          
          {/* Glow 1 - Animated */}
          <motion.div 
            animate={{ y: [0, -40, 0], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 -right-40 w-[600px] h-[600px] bg-orange-300/30 dark:bg-orange-600/10 blur-[120px] rounded-full" 
          />
          
          {/* Glow 2 - Animated */}
          <motion.div 
            animate={{ y: [0, 40, 0], x: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-40 -left-40 w-[700px] h-[700px] bg-amber-200/40 dark:bg-amber-600/10 blur-[150px] rounded-full" 
          />
        </div>

        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-16 lg:px-24">
        
        {/* Search Section */}
        <section id="search-section" className="py-20 md:py-32 border-b border-neutral-200 dark:border-white/5">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white leading-tight mb-6 tracking-tight">
                Hôm nay bạn muốn <br/> <span className="text-orange-600">thưởng thức</span> món gì?
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl">
                Nhập tên món ăn, nguyên liệu, hoặc thậm chí là mô tả hương vị bạn đang thèm. Trợ lý AI sẽ gợi ý cho bạn những địa điểm tuyệt vời nhất.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="relative flex items-center bg-white dark:bg-slate-900 border border-neutral-300 dark:border-white/10 rounded-sm shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-12"
            >
              <Search className="absolute left-5 w-6 h-6 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ví dụ: Phở bò tái lăn, Bánh mì xíu mại..."
                className="flex-1 pl-14 pr-4 py-5 md:py-6 text-lg text-neutral-800 dark:text-white bg-transparent outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="mr-2 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-400 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              )}
              <button className="m-2 px-8 py-3 md:py-4 bg-orange-600 hover:bg-orange-700 text-white font-medium text-lg rounded-sm transition-colors">
                Tìm kiếm
              </button>
            </motion.div>

            {/* Popular Categories */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-sm font-semibold uppercase tracking-widest text-neutral-500 mb-6">Gợi ý phổ biến</h3>
              <div className="flex flex-wrap gap-4">
                {foodCategories.map((cat, idx) => (
                  <motion.button
                    key={cat.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.5 + idx * 0.05 }}
                    onClick={() => setSearchQuery(cat.name)}
                    className="flex items-center gap-3 bg-white dark:bg-slate-900 hover:bg-neutral-50 dark:hover:bg-slate-800 border border-neutral-200 dark:border-white/10 rounded-sm pr-6 pl-2 py-2 transition-all shadow-sm"
                  >
                    <img src={cat.img} alt={cat.name} className="w-10 h-10 rounded-sm object-cover" />
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{cat.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="py-20 md:py-32">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">Giải pháp toàn diện</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">Khám phá sức mạnh của công nghệ trong trải nghiệm văn hóa và ẩm thực bản địa.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <FeatureCard key={feature.title} feature={feature} idx={idx} />
            ))}
          </div>
        </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-16 px-6 md:px-16 lg:px-24">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold tracking-tight">
                Hương Vị <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">Bản Địa</span>
              </span>
            </div>
            <p className="text-white/60 text-sm max-w-sm">Trợ lý du lịch ẩm thực thông minh, giúp bạn lưu giữ và lan tỏa giá trị văn hóa qua từng món ăn.</p>
          </div>

          <div className="text-left md:text-right text-sm text-white/60">
            <p className="mb-2">Khu đô thị ĐHQG-HCM, Khu Phố 6</p>
            <p className="mb-2">Đông Hòa, Hồ Chí Minh, Việt Nam</p>
            <p>Email: 24120192@student.hcmus.edu.vn</p>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto border-t border-white/10 mt-12 pt-8 text-sm text-white/40 flex flex-col md:flex-row justify-between">
          <p>© 2026 Hương Vị Bản Địa. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
