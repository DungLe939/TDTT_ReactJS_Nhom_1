import React, { useEffect, useState, useMemo } from 'react';
import { getDataConnect, connectDataConnectEmulator } from 'firebase/data-connect';
import {
  connectorConfig,
  listCategories,
  listFoods,
  listShops,
  listFoodsByCategory,
  getFoodDetail,
  getShopDetail,
} from '@dataconnect/generated';
import type {
  ListCategoriesData,
  ListFoodsData,
  ListShopsData,
  GetFoodDetailData,
  GetShopDetailData,
} from '@dataconnect/generated';
import firebaseApp from '../modules/auth/services/firebase';
import {
  Search,
  Star,
  Heart,
  MapPin,
  Clock,
  ChevronRight,
  Filter,
  ShoppingBag,
  Store,
  Flame,
  X,
  ArrowLeft,
  ExternalLink,
  TrendingUp,
  Tag,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, animate, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';

// ─── Firebase Data Connect Setup ────────────────────────────────────────────
const dc = getDataConnect(firebaseApp, connectorConfig);
if (import.meta.env.DEV) {
  connectDataConnectEmulator(dc, '127.0.0.1', 9399);
}

// ─── Types ──────────────────────────────────────────────────────────────────
type Category = ListCategoriesData['categories'][number];
type FoodItem = ListFoodsData['foodItems'][number];
type ShopItem = ListShopsData['shops'][number];
type FoodDetail = NonNullable<GetFoodDetailData['foodItem']>;
type ShopDetail = NonNullable<GetShopDetailData['shop']>;

type ViewMode = 'grid' | 'list';

// ─── Helpers ────────────────────────────────────────────────────────────────
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
};

const fallbackImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNGNUY1RjUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iI0JEQkRCRCIgZm9udC1zaXplPSIzMiI+8J+NnTwvdGV4dD48L3N2Zz4=';

// ─── Custom Hooks ──────────────────────────────────────────────────────────
function useCountUp(target: number, duration: number = 2, delay: number = 0.5, decimals: number = 0) {
  const count = useMotionValue(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(count, target, {
      duration,
      delay,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Number(latest.toFixed(decimals)));
      },
    });
    return () => controls.stop();
  }, [target, duration, delay, decimals, count]);

  return displayValue;
}

// ════════════════════════════════════════════════════════════════════════════
//  COMPONENT: FoodMarket
// ════════════════════════════════════════════════════════════════════════════
export function FoodMarket() {
  // ─── State ──────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [shops, setShops] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'popular'>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Detail modals
  const [selectedFood, setSelectedFood] = useState<FoodDetail | null>(null);
  const [selectedShop, setSelectedShop] = useState<ShopDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Tab
  const [activeTab, setActiveTab] = useState<'foods' | 'shops'>('foods');

  // Pagination - Foods
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const foodListRef = useRef<HTMLDivElement>(null);

  // Pagination - Shops
  const [shopPage, setShopPage] = useState(1);
  const shopsPerPage = 12;
  const shopListRef = useRef<HTMLDivElement>(null);

  // ─── Data Fetching ────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [catResult, foodResult, shopResult] = await Promise.all([
        listCategories(dc),
        listFoods(dc, { limit: 1000 }),
        listShops(dc, { limit: 100 }),
      ]);

      setCategories(catResult.data.categories);
      setFoods(foodResult.data.foodItems);
      setShops(shopResult.data.shops);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
      setError(err instanceof Error ? err.message : 'Không thể kết nối tới Data Connect');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Fetch foods by category when selected
  useEffect(() => {
    if (!selectedCategory) return;
    const fetchByCategory = async () => {
      try {
        const result = await listFoodsByCategory(dc, {
          categoryId: selectedCategory,
          limit: 1000,
        });
        setFoods(result.data.foodItems as unknown as FoodItem[]);
      } catch (err) {
        console.error('Lỗi tải theo danh mục:', err);
      }
    };
    fetchByCategory();
  }, [selectedCategory]);

  // Reset foods when clearing category
  const handleClearCategory = async () => {
    setSelectedCategory(null);
    try {
      const result = await listFoods(dc, { limit: 1000 });
      setFoods(result.data.foodItems);
    } catch (err) {
      console.error('Lỗi reload:', err);
    }
  };

  // ─── Food Detail ──────────────────────────────────────────────────────
  const openFoodDetail = async (foodId: string) => {
    setDetailLoading(true);
    try {
      const result = await getFoodDetail(dc, { id: foodId });
      if (result.data.foodItem) {
        setSelectedFood(result.data.foodItem);
      }
    } catch (err) {
      console.error('Lỗi chi tiết món:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Shop Detail ──────────────────────────────────────────────────────
  const openShopDetail = async (shopId: string) => {
    setDetailLoading(true);
    try {
      const result = await getShopDetail(dc, { id: shopId });
      if (result.data.shop) {
        setSelectedShop(result.data.shop);
      }
    } catch (err) {
      console.error('Lỗi chi tiết shop:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // ─── Filtered & Sorted Data ───────────────────────────────────────────
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.shop.name.toLowerCase().includes(q) ||
          f.category.name.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        result.sort((a, b) => b.totalLike - a.totalLike);
        break;
    }

    return result;
  }, [foods, searchQuery, sortBy]);

  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) return shops;
    const q = searchQuery.toLowerCase();
    return shops.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q)
    );
  }, [shops, searchQuery]);

  // Stats
  const stats = useMemo(() => ({
    totalFoods: foods.length,
    totalShops: shops.length,
    totalCategories: categories.length,
    avgRating: shops.length > 0
      ? (shops.reduce((sum, s) => sum + (s.rating ?? 0), 0) / shops.length).toFixed(1)
      : '0',
  }), [foods, shops, categories]);

  // ─── Pagination Logic ───────────────────────────────────────────────
  const totalFoodPages = Math.ceil(filteredFoods.length / itemsPerPage);
  const paginatedFoods = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFoods.slice(start, start + itemsPerPage);
  }, [filteredFoods, currentPage, itemsPerPage]);

  const totalShopPages = Math.ceil(filteredShops.length / shopsPerPage);
  const paginatedShops = useMemo(() => {
    const start = (shopPage - 1) * shopsPerPage;
    return filteredShops.slice(start, start + shopsPerPage);
  }, [filteredShops, shopPage, shopsPerPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy, itemsPerPage]);

  useEffect(() => {
    setShopPage(1);
  }, [searchQuery]);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const offset = 100; // Offset for header/banner
      const elementPosition = ref.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      });
    }
  };

  const handleFoodPageChange = (page: number) => {
    setCurrentPage(page);
    scrollToRef(foodListRef);
  };

  const handleShopPageChange = (page: number) => {
    setShopPage(page);
    scrollToRef(shopListRef);
  };

  // ─── Animation States ──────────────────────────────────────────────────
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 500], [0, 150]);
  const contentY = useTransform(scrollY, [0, 500], [0, -50]);
  const opacityBanner = useTransform(scrollY, [0, 400], [1, 0.5]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  // ─── Loading State ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
          <ShoppingBag className="w-6 h-6 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-neutral-500 dark:text-gray-400 text-sm animate-pulse">Đang tải chợ ẩm thực...</p>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white">Không thể kết nối</h2>
        <p className="text-neutral-500 dark:text-gray-400 text-sm text-center max-w-md">{error}</p>
        <p className="text-neutral-400 text-xs text-center">
          Hãy kiểm tra Firebase Emulator đang chạy trên cổng 9399
        </p>
        <button
          onClick={fetchData}
          className="mt-2 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-medium transition-all hover:shadow-lg hover:shadow-orange-500/25"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // ─── Empty State ──────────────────────────────────────────────────────
  if (foods.length === 0 && shops.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-10 h-10 text-orange-400" />
        </div>
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white">Chợ đang trống!</h2>
        <p className="text-neutral-500 dark:text-gray-400 text-sm text-center max-w-md">
          Chưa có dữ liệu trong Data Connect. Hãy chạy seed data từ trang <code className="bg-neutral-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">/test</code> trước.
        </p>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6 pb-8">
      {/* ── Hero Banner ───────────────────────────────────────────────────── */}
      <motion.div 
        style={{ opacity: opacityBanner }}
        className="relative overflow-hidden rounded-2xl h-[280px] sm:h-[344px] group shadow-2xl"
      >
        {/* Background Image with Ken Burns & Parallax */}
        <motion.img
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80"
          alt="Chợ Ẩm Thực"
          style={{ y: bgY }}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 blur-[0.5px] group-hover:blur-0 animate-ken-burns"
        />
        {/* Base Dark Overlay for overall contrast */}
        <div className="absolute inset-0 bg-black/40" />
        {/* Gradient Overlay from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
        
        {/* Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ y: contentY }}
          className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10"
        >
          <motion.div variants={itemVariants} className="flex items-center mb-4">
            <div className="flex items-center gap-2.5 bg-black/60 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full shadow-2xl">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 animate-glow"></span>
              </div>
              <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em] whitespace-nowrap">
                Hương Vị Bản Địa
              </span>
            </div>
          </motion.div>
          
          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-5xl font-extrabold text-white mb-2 tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
          >
            Chợ Ẩm Thực <span className="text-orange-500 text-shimmer">Việt Nam</span>
          </motion.h1>
          <motion.p 
            variants={itemVariants}
            className="text-gray-200 text-sm sm:text-lg max-w-2xl mb-8 font-medium drop-shadow-md leading-relaxed opacity-95"
          >
            Hành trình khám phá tinh hoa ẩm thực Việt với những hương vị bản địa đặc sắc nhất. 
            Trải nghiệm hệ thống dữ liệu thực tế được cập nhật liên tục từ khắp mọi miền Tổ quốc.
          </motion.p>

          {/* Stats Cards with Count-up and Stagger */}
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <StatCard icon="🍽️" label="Món ăn" value={stats.totalFoods} delay={0.8} />
            <StatCard icon="🏪" label="Quán" value={stats.totalShops} delay={0.9} />
            <StatCard icon="🏷️" label="Danh mục" value={stats.totalCategories} delay={1.0} />
            <StatCard icon="⭐" label="Rating" value={parseFloat(stats.avgRating)} delay={1.1} decimals={1} />
          </div>
        </motion.div>
      </motion.div>

      {/* ── Search & Filters ──────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            id="food-market-search"
            type="text"
            placeholder="Tìm món ăn, quán, danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-400 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tabs + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex bg-neutral-100 dark:bg-slate-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('foods')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'foods'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              Món ăn ({filteredFoods.length})
            </button>
            <button
              onClick={() => setActiveTab('shops')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'shops'
                  ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-neutral-500 dark:text-gray-400 hover:text-neutral-700 dark:hover:text-white'
              }`}
            >
              <Store className="w-4 h-4" />
              Quán ({filteredShops.length})
            </button>
          </div>

          {activeTab === 'foods' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-neutral-500 dark:text-gray-400">
                <Filter className="w-4 h-4" />
                <select
                  id="food-market-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/30"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="popular">Phổ biến nhất</option>
                </select>
              </div>

              {/* View mode */}
              <div className="hidden sm:flex bg-neutral-100 dark:bg-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-neutral-400 dark:text-gray-500'}`}
                  title="Xem lưới"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="6" height="6" rx="1" />
                    <rect x="9" y="1" width="6" height="6" rx="1" />
                    <rect x="1" y="9" width="6" height="6" rx="1" />
                    <rect x="9" y="9" width="6" height="6" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-neutral-400 dark:text-gray-500'}`}
                  title="Xem danh sách"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                    <rect x="1" y="1" width="14" height="3" rx="1" />
                    <rect x="1" y="6" width="14" height="3" rx="1" />
                    <rect x="1" y="11" width="14" height="3" rx="1" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Categories Pills */}
        {activeTab === 'foods' && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              onClick={handleClearCategory}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                !selectedCategory
                  ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                  : 'bg-white dark:bg-slate-900 text-neutral-600 dark:text-gray-400 border-neutral-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500 hover:text-orange-500'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20'
                    : 'bg-white dark:bg-slate-900 text-neutral-600 dark:text-gray-400 border-neutral-200 dark:border-white/10 hover:border-orange-300 dark:hover:border-orange-500 hover:text-orange-500'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Food Grid / List ──────────────────────────────────────────────── */}
      {activeTab === 'foods' && (
        <div ref={foodListRef} className="scroll-mt-32">
          {filteredFoods.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-400 text-sm">Không tìm thấy món ăn phù hợp</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedFoods.map((food) => (
                <FoodCard key={food.id} food={food} onClick={() => openFoodDetail(food.id)} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedFoods.map((food) => (
                <FoodListItem key={food.id} food={food} onClick={() => openFoodDetail(food.id)} />
              ))}
            </div>
          )}

          {/* Pagination for Foods */}
          {totalFoodPages > 1 && (
            <PaginationBar 
              currentPage={currentPage}
              totalPages={totalFoodPages}
              onPageChange={handleFoodPageChange}
              totalItems={filteredFoods.length}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={setItemsPerPage}
              itemLabel="món ăn"
            />
          )}
        </div>
      )}

      {/* ── Shops Grid ────────────────────────────────────────────────────── */}
      {activeTab === 'shops' && (
        <div ref={shopListRef} className="scroll-mt-32">
          {filteredShops.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-400 text-sm">Không tìm thấy quán phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} onClick={() => openShopDetail(shop.id)} />
              ))}
            </div>
          )}

          {/* Pagination for Shops */}
          {totalShopPages > 1 && (
            <PaginationBar 
              currentPage={shopPage}
              totalPages={totalShopPages}
              onPageChange={handleShopPageChange}
              totalItems={filteredShops.length}
              itemsPerPage={shopsPerPage}
              itemLabel="quán"
            />
          )}
        </div>
      )}

      {/* ── Food Detail Modal ─────────────────────────────────────────────── */}
      {(selectedFood || detailLoading) && !selectedShop && (
        <FoodDetailModal
          food={selectedFood}
          loading={detailLoading}
          onClose={() => setSelectedFood(null)}
          onShopClick={(shopId) => {
            setSelectedFood(null);
            openShopDetail(shopId);
          }}
        />
      )}

      {/* ── Shop Detail Modal ─────────────────────────────────────────────── */}
      {(selectedShop || detailLoading) && !selectedFood && (
        <ShopDetailModal
          shop={selectedShop}
          loading={detailLoading}
          onClose={() => setSelectedShop(null)}
          onFoodClick={(foodId) => {
            setSelectedShop(null);
            openFoodDetail(foodId);
          }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SUB-COMPONENTS
// ════════════════════════════════════════════════════════════════════════════

// ── Stat Card with Animation ──────────────────────────────────────────────
function StatCard({ icon, label, value, delay, decimals = 0 }: { icon: string, label: string, value: number, delay: number, decimals?: number }) {
  const displayValue = useCountUp(value, 2, delay, decimals);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ 
        y: -5, 
        borderColor: "rgba(249, 115, 22, 0.4)",
        boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.1)"
      }}
      className="bg-black/40 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3 border border-white/10 transition-colors"
    >
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-white font-black text-lg leading-tight">{displayValue}</p>
        <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Food Card (Grid View) ─────────────────────────────────────────────────
function FoodCard({ food, onClick }: { food: FoodItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-neutral-100 dark:border-white/10 overflow-hidden hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-300 text-left cursor-pointer"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100 dark:bg-slate-800">
        <img
          src={food.imageUrl || food.thumbnailUrl || fallbackImg}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = fallbackImg; }}
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {food.isPopular && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Flame className="w-3 h-3" /> HOT
            </span>
          )}
        </div>
        {food.totalLike > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span className="text-[10px] font-semibold text-neutral-700 dark:text-gray-300">{food.totalLike}</span>
          </div>
        )}
        {/* Category tag */}
        <div className="absolute bottom-2 left-2">
          <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-md">
            {food.category.name}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-semibold text-sm text-neutral-800 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
          {food.name}
        </h3>
        <p className="text-[11px] text-neutral-400 dark:text-gray-500 mt-1 flex items-center gap-1 truncate">
          <Store className="w-3 h-3 shrink-0" />
          {food.shop.name}
        </p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-orange-600 font-bold text-sm">{formatPrice(food.price)}</span>
          {food.shop.rating && (
            <span className="flex items-center gap-0.5 text-[11px] text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-md">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              {food.shop.rating}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Food List Item ────────────────────────────────────────────────────────
function FoodListItem({ food, onClick }: { food: FoodItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full group bg-white dark:bg-slate-900 rounded-xl border border-neutral-100 dark:border-white/10 overflow-hidden hover:shadow-md hover:border-orange-200 transition-all p-3 flex gap-4 items-center text-left cursor-pointer"
    >
      <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-slate-800">
        <img
          src={food.thumbnailUrl || food.imageUrl || fallbackImg}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.currentTarget.src = fallbackImg; }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm text-neutral-800 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
            {food.name}
          </h3>
          <span className="text-orange-600 font-bold text-sm shrink-0">{formatPrice(food.price)}</span>
        </div>
        {food.description && (
          <p className="text-xs text-neutral-400 dark:text-gray-500 mt-0.5 line-clamp-1">{food.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-neutral-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Store className="w-3 h-3" /> {food.shop.name}
          </span>
          {food.shop.rating && (
            <span className="flex items-center gap-0.5 text-amber-600">
              <Star className="w-3 h-3 fill-amber-500" /> {food.shop.rating}
            </span>
          )}
          {food.totalLike > 0 && (
            <span className="flex items-center gap-0.5 text-red-400">
              <Heart className="w-3 h-3 fill-red-400" /> {food.totalLike}
            </span>
          )}
          <span className="bg-neutral-100 dark:bg-slate-800 px-2 py-0.5 rounded text-neutral-500 dark:text-gray-400">{food.category.name}</span>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-orange-400 shrink-0 transition-colors" />
    </button>
  );
}

// ── Shop Card ─────────────────────────────────────────────────────────────
function ShopCard({ shop, onClick }: { shop: ShopItem; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 rounded-xl border border-neutral-100 dark:border-white/10 overflow-hidden hover:shadow-lg hover:shadow-orange-500/10 hover:border-orange-200 transition-all duration-300 text-left cursor-pointer"
    >
      {/* Cover */}
      <div className="relative h-36 overflow-hidden bg-neutral-100 dark:bg-slate-800">
        {shop.coverImage ? (
          <img
            src={shop.coverImage}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = fallbackImg; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center">
            <Store className="w-12 h-12 text-orange-300" />
          </div>
        )}
        {/* Rating badge */}
        {shop.rating && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span className="text-sm font-bold text-neutral-800 dark:text-white">{shop.rating}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-base text-neutral-800 dark:text-white line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {shop.name}
        </h3>
        <p className="text-xs text-neutral-400 dark:text-gray-500 mt-1 flex items-center gap-1 line-clamp-1">
          <MapPin className="w-3 h-3 shrink-0" />
          {shop.address}
        </p>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-white/10">
          {shop.priceDisplay && (
            <span className="text-xs text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-1 rounded-md font-medium">
              {shop.priceDisplay}
            </span>
          )}
          <div className="flex items-center gap-3 text-[11px] text-neutral-400 dark:text-gray-500">
            {shop.openTime && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {shop.openTime} - {shop.closeTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ── Food Detail Modal ─────────────────────────────────────────────────────
function FoodDetailModal({
  food,
  loading,
  onClose,
  onShopClick,
}: {
  food: FoodDetail | null;
  loading: boolean;
  onClose: () => void;
  onShopClick: (shopId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !food ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
          </div>
        ) : (
          <>
            {/* Image */}
            <div className="relative">
              <img
                src={food.imageUrl || food.thumbnailUrl || fallbackImg}
                alt={food.name}
                className="w-full aspect-video object-cover rounded-t-2xl"
                onError={(e) => { e.currentTarget.src = fallbackImg; }}
              />
              <button
                onClick={onClose}
                className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-3 flex gap-2">
                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-lg">
                  {food.category.name}
                </span>
                {food.isPopular && (
                  <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Hot
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white">{food.name}</h2>
                {food.groupName && (
                  <p className="text-xs text-neutral-400 dark:text-gray-500 mt-1">Nhóm: {food.groupName}</p>
                )}
              </div>

              {/* Price & Likes */}
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-orange-600">{formatPrice(food.price)}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-sm text-red-400">
                    <Heart className="w-4 h-4 fill-red-400" /> {food.totalLike} thích
                  </span>
                </div>
              </div>

              {food.description && (
                <p className="text-sm text-neutral-600 dark:text-gray-300 leading-relaxed bg-neutral-50 dark:bg-slate-800 p-3 rounded-lg">
                  {food.description}
                </p>
              )}

              {/* Shop Info */}
              <button
                onClick={() => onShopClick(food.shop.id)}
                className="w-full bg-neutral-50 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-orange-950/30 rounded-xl p-4 flex items-center gap-3 transition-colors group/shop border border-neutral-100 dark:border-white/10 hover:border-orange-200 dark:hover:border-orange-400 text-left"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-neutral-800 dark:text-white group-hover/shop:text-orange-600 dark:group-hover/shop:text-orange-400 transition-colors truncate">
                    {food.shop.name}
                  </p>
                  <p className="text-xs text-neutral-400 dark:text-gray-500 mt-0.5 flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" /> {food.shop.address}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-[11px]">
                    {food.shop.rating && (
                      <span className="flex items-center gap-0.5 text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500" /> {food.shop.rating}
                      </span>
                    )}
                    {food.shop.openTime && (
                      <span className="text-neutral-400 dark:text-gray-500 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" /> {food.shop.openTime} - {food.shop.closeTime}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-neutral-300 group-hover/shop:text-orange-400 shrink-0" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Shop Detail Modal ─────────────────────────────────────────────────────
function ShopDetailModal({
  shop,
  loading,
  onClose,
  onFoodClick,
}: {
  shop: ShopDetail | null;
  loading: boolean;
  onClose: () => void;
  onFoodClick: (foodId: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {loading || !shop ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
          </div>
        ) : (
          <>
            {/* Cover */}
            <div className="relative h-48">
              {shop.coverImage ? (
                <img
                  src={shop.coverImage}
                  alt={shop.name}
                  className="w-full h-full object-cover rounded-t-2xl"
                  onError={(e) => { e.currentTarget.src = fallbackImg; }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-orange-400 to-amber-300 rounded-t-2xl flex items-center justify-center">
                  <Store className="w-16 h-16 text-white/50" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-t-2xl" />
              <button
                onClick={onClose}
                className="absolute top-3 left-3 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white rounded-full p-2 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {shop.url && (
                <a
                  href={shop.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-sm rounded-full p-2 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4 text-neutral-600 dark:text-gray-400" />
                </a>
              )}
              <div className="absolute bottom-4 left-5">
                <h2 className="text-xl font-bold text-white">{shop.name}</h2>
                <p className="text-white/70 text-xs mt-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {shop.address}
                </p>
              </div>
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-4 px-5 py-3 border-b border-neutral-100 dark:border-white/10 text-sm">
              {shop.rating && (
                <span className="flex items-center gap-1 text-amber-600 font-medium">
                  <Star className="w-4 h-4 fill-amber-500" /> {shop.rating}
                </span>
              )}
              {shop.priceDisplay && (
                <span className="text-green-600 bg-green-50 dark:bg-green-950/30 px-2 py-0.5 rounded">{shop.priceDisplay}</span>
              )}
              {shop.openTime && (
                <span className="flex items-center gap-1 text-neutral-500 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5" /> {shop.openTime} - {shop.closeTime}
                </span>
              )}
            </div>

            {/* Foods list */}
            <div className="p-5">
              <h3 className="font-semibold text-base text-neutral-800 dark:text-white mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Thực đơn ({shop.foodItems_on_shop.length} món)
              </h3>
              <div className="space-y-2">
                {shop.foodItems_on_shop.map((food) => (
                  <button
                    key={food.id}
                    onClick={() => onFoodClick(food.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/30 transition-colors border border-transparent hover:border-orange-200 dark:hover:border-orange-400 text-left group/item"
                  >
                    <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-neutral-100 dark:bg-slate-800">
                      <img
                        src={food.thumbnailUrl || food.imageUrl || fallbackImg}
                        alt={food.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = fallbackImg; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-neutral-800 dark:text-white group-hover/item:text-orange-600 dark:group-hover/item:text-orange-400 transition-colors line-clamp-1">
                        {food.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                        <span className="text-neutral-400 dark:text-gray-500">{food.category.name}</span>
                        {food.totalLike > 0 && (
                          <span className="text-red-400 flex items-center gap-0.5">
                            <Heart className="w-3 h-3 fill-red-400" /> {food.totalLike}
                          </span>
                        )}
                        {food.isPopular && (
                          <span className="text-red-500 font-bold text-[10px]">🔥 HOT</span>
                        )}
                      </div>
                    </div>
                    <span className="text-orange-600 font-bold text-sm shrink-0">
                      {food.priceDisplay || formatPrice(food.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Pagination Bar Component ──────────────────────────────────────────────
function PaginationBar({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  itemLabel,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange?: (size: number) => void;
  itemLabel: string;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="mt-10 flex flex-col lg:flex-row items-center justify-between gap-6 bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-neutral-100 dark:border-white/5 rounded-2xl p-4 sm:p-6 shadow-sm">
      {/* Info text */}
      <div className="text-sm text-neutral-500 dark:text-gray-400 font-medium order-2 lg:order-1">
        Hiển thị <span className="text-neutral-900 dark:text-white font-bold">{startItem}-{endItem}</span> trong <span className="text-neutral-900 dark:text-white font-bold">{totalItems}</span> {itemLabel}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 order-1 lg:order-2 w-full lg:w-auto">
        {/* Items per page selector (optional) */}
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-gray-400">
            <span>Hiển thị</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="bg-neutral-100 dark:bg-slate-800 border-none rounded-lg px-2 py-1 text-sm font-bold text-neutral-900 dark:text-white focus:ring-2 focus:ring-orange-500/30 outline-none cursor-pointer"
            >
              {[12, 20, 40, 60].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        )}

        {/* Page navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 sm:pb-0">
          {/* First page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-neutral-500 dark:text-gray-400 shrink-0"
            title="Trang đầu"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Prev page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-neutral-500 dark:text-gray-400 mr-1 shrink-0"
            title="Trang trước"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => (
              <React.Fragment key={idx}>
                {page === '...' ? (
                  <span className="px-1 text-neutral-400 shrink-0">...</span>
                ) : (
                  <button
                    onClick={() => onPageChange(page as number)}
                    className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 ${
                      currentPage === page
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                        : 'text-neutral-500 dark:text-gray-400 hover:bg-neutral-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-neutral-500 dark:text-gray-400 ml-1 shrink-0"
            title="Trang sau"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Last page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-neutral-500 dark:text-gray-400 shrink-0"
            title="Trang cuối"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default FoodMarket;
