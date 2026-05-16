import { useState } from "react";
import { useListFoods, useListCategories, useListFoodsByCategory } from "@dataconnect/generated/react";
import { FoodCard } from "../common/components/FoodCard";
import { Button } from "../common/components/ui/button";
import { Input } from "../common/components/ui/input";
import { Skeleton } from "../common/components/ui/skeleton";
import { Search, SlidersHorizontal, AlertCircle } from "lucide-react";
import { Badge } from "../common/components/ui/badge";

export function Store() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Categories
  const { data: catData, isLoading: catLoading, error: catError } = useListCategories();
  
  // Conditionally fetch all foods or by category
  // Due to hooks rules, we can't conditionally call hooks easily if we want to switch.
  // Actually we can just fetch all foods and filter client-side if the data is not too large, 
  // OR use useListFoods and useListFoodsByCategory conditionally.
  // A safer React way:
  const { data: allFoodsData, isLoading: allLoading, error: allFoodsError } = useListFoods({ limit: 100 }, { enabled: !selectedCategoryId });
  
  // NOTE: useListFoodsByCategory hook takes a variable object.
  const { data: catFoodsData, isLoading: catFoodsLoading, error: catFoodsError } = useListFoodsByCategory(
    { categoryId: selectedCategoryId || "" }, 
    { enabled: !!selectedCategoryId }
  );

  const isLoading = selectedCategoryId ? catFoodsLoading : allLoading;
  const error = selectedCategoryId ? catFoodsError : allFoodsError;
  const rawFoods = selectedCategoryId ? catFoodsData?.foodItems : allFoodsData?.foodItems;
  
  // Client side search filter
  const foods = rawFoods?.filter(food => 
    food.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 pb-20">
      {/* Header Banner */}
      <div className="bg-orange-500 pt-8 pb-16 px-4 sm:px-6 lg:px-8 text-center text-white">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl mb-4">
          Cửa hàng Thực phẩm
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-orange-100">
          Khám phá những món ăn ngon nhất, phổ biến nhất từ các nhà hàng xung quanh bạn.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between border border-slate-100 dark:border-zinc-800">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              type="text" 
              placeholder="Tìm kiếm món ăn..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full bg-slate-50 dark:bg-zinc-800 border-none h-12 rounded-lg"
            />
          </div>
          <Button variant="outline" className="w-full md:w-auto h-12 rounded-lg border-slate-200 dark:border-zinc-700">
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Lọc nâng cao
          </Button>
        </div>

        {/* Categories Pill List */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-200">Danh mục</h2>
          {catLoading ? (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-full" />)}
            </div>
          ) : catError ? (
             <div className="text-red-500 text-sm">Lỗi tải danh mục</div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
              <Button
                variant={selectedCategoryId === null ? "default" : "outline"}
                className={`rounded-full whitespace-nowrap ${selectedCategoryId === null ? 'bg-orange-500 hover:bg-orange-600' : ''}`}
                onClick={() => setSelectedCategoryId(null)}
              >
                Tất cả
              </Button>
              {catData?.categories?.map((cat: any) => (
                <Button
                  key={cat.id}
                  variant={selectedCategoryId === cat.id ? "default" : "outline"}
                  className={`rounded-full whitespace-nowrap ${selectedCategoryId === cat.id ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-white dark:bg-zinc-900'}`}
                  onClick={() => setSelectedCategoryId(cat.id)}
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Food Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {selectedCategoryId 
                ? catData?.categories?.find((c: any) => c.id === selectedCategoryId)?.name 
                : 'Tất cả món ăn'}
            </h2>
            <Badge variant="secondary" className="px-3 py-1 rounded-full text-sm">
              {foods?.length || 0} kết quả
            </Badge>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3">
               <AlertCircle className="h-5 w-5" />
               <p>Đã xảy ra lỗi khi tải dữ liệu món ăn. Vui lòng thử lại sau.</p>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between mt-auto">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : foods && foods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {foods.map((food: any) => (
                <FoodCard key={food.id} food={food} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-zinc-800 mb-4">
                <Search className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Không tìm thấy món ăn nào</h3>
              <p className="text-slate-500 dark:text-slate-400">
                Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-full"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategoryId(null);
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
