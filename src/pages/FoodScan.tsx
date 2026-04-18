import { useState, useEffect, useRef } from 'react';
import { Focus, MapPin, Star, ChevronLeft, ChevronRight, BookOpen, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NEARBY_RESTAURANTS = [
  { id: 1, name: 'Phở Hòa Pasteur', distance: '1.2 km', rating: 4.5, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=200&h=200' },
  { id: 2, name: 'Phở Lệ', distance: '2.5 km', rating: 4.8, image: 'https://images.unsplash.com/photo-1547592166-23111365e8f4?auto=format&fit=crop&q=80&w=200&h=200' },
];

export const FoodScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<null | 'success'>(null);
  const [showStory, setShowStory] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCapture();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleCapture();
    }
  };

  const handleCapture = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setResult('success');
    }, 2000);
  };

  const reset = () => {
    setResult(null);
    setShowStory(false);
  };

  return (
    <div className={`relative min-h-[calc(100vh-4rem)] ${isDesktop && !result ? 'bg-neutral-50 flex items-center justify-center' : 'bg-neutral-900'} overflow-hidden`}>
      {!result ? (
        isDesktop ? (
          <div className="w-full max-w-2xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">Quét món ăn</h1>
              <p className="text-neutral-500">Tải lên hình ảnh món ăn để hệ thống AI nhận diện</p>
            </div>
            
            <div 
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 ${
                dragActive ? 'border-orange-500 bg-orange-50' : 'border-neutral-300 bg-white hover:border-orange-400 hover:bg-neutral-50'
              }`}
            >
              <input 
                ref={inputRef}
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={handleFileChange}
              />
              
              {isScanning ? (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-20 h-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 border-4 border-orange-200 border-t-orange-500 rounded-full"
                    />
                    <ImageIcon className="absolute inset-0 m-auto w-8 h-8 text-orange-500" />
                  </div>
                  <p className="font-medium text-orange-600">Đang phân tích hình ảnh...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <UploadCloud className="w-10 h-10 text-orange-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-700 text-lg">Kéo thả ảnh vào đây</p>
                    <p className="text-neutral-500 mt-1">hoặc click để chọn file từ máy tính</p>
                  </div>
                  <p className="text-xs text-neutral-400 mt-4">Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB)</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Simulated Camera Feed */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60"></div>
            
            <div className="relative z-10 w-64 h-64 border-2 border-white/50 rounded-3xl flex items-center justify-center">
              {isScanning && (
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                />
              )}
              <Focus className="w-12 h-12 text-white/50" />
            </div>
            
            <div className="relative z-10 mt-8 text-center">
              <p className="text-white font-medium drop-shadow-md">Hướng camera vào món ăn</p>
              <p className="text-white/70 text-sm mt-1">Hệ thống AI sẽ tự động nhận diện</p>
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex justify-center z-10">
              <button
                onClick={handleCapture}
                disabled={isScanning}
                className="w-20 h-20 bg-white/20 border-4 border-white rounded-full flex items-center justify-center backdrop-blur-sm active:scale-95 transition-transform"
              >
                <div className="w-16 h-16 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="absolute inset-0 bg-neutral-50 overflow-y-auto">
          {/* Top section with image & result */}
          <div className="relative h-64 bg-neutral-900">
            <img src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&q=80" alt="Scanned Food" className="w-full h-full object-cover opacity-70" />
            <button onClick={reset} className="absolute top-4 left-4 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-md">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-between items-end">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">Phở Bò</h1>
                  <p className="text-white/80 flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" /> Món nước • Việt Nam
                  </p>
                </div>
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                  98% Match
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <button 
              onClick={() => setShowStory(true)}
              className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 p-4 rounded-2xl flex items-center justify-between transition-colors shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold">Khám phá câu chuyện</h3>
                  <p className="text-xs text-orange-700 mt-0.5">Nguồn gốc và cách thưởng thức chuẩn vị</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-neutral-800 mb-4">Quán ngon gần bạn</h2>
              <div className="space-y-3">
                {NEARBY_RESTAURANTS.map(place => (
                  <div key={place.id} className="bg-white p-3 rounded-2xl shadow-sm border border-neutral-100 flex gap-4">
                    <img src={place.image} alt={place.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1 py-1">
                      <h3 className="font-bold text-neutral-800">{place.name}</h3>
                      <div className="flex items-center gap-2 mt-1 mb-2 text-sm text-neutral-500">
                        <span className="flex items-center gap-1 text-yellow-500 font-medium">
                          <Star className="w-4 h-4 fill-yellow-500" /> {place.rating}
                        </span>
                        <span>•</span>
                        <span>{place.distance}</span>
                      </div>
                      <button className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                        Chỉ đường
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Modal */}
      <AnimatePresence>
        {showStory && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            className="absolute inset-0 bg-white z-50 flex flex-col"
          >
            <div className="relative h-64 shrink-0">
              <img src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80" alt="Phở" className="w-full h-full object-cover" />
              <button onClick={() => setShowStory(false)} className="absolute top-4 right-4 w-10 h-10 bg-black/40 rounded-full flex items-center justify-center text-white backdrop-blur-md">
                <ChevronLeft className="w-6 h-6 rotate-180" />
              </button>
              <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
            </div>
            
            <div className="p-6 -mt-8 relative z-10 bg-white rounded-t-3xl flex-1 overflow-y-auto">
              <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-6"></div>
              <h2 className="text-2xl font-bold text-neutral-800 mb-2">Tinh hoa Phở Việt</h2>
              <div className="prose prose-neutral text-sm leading-relaxed">
                <p>Phở được xem là món ăn quốc hồn quốc túy của Việt Nam. Nước dùng được ninh từ xương bò trong nhiều giờ liền cùng với các loại gia vị như quế, hồi, thảo quả, tạo nên hương vị đặc trưng không thể nhầm lẫn.</p>
                <p className="mt-4">Nguồn gốc của phở bắt đầu từ đầu thế kỷ 20, ban đầu là gánh hàng rong trên các con phố Hà Nội. Ngày nay, phở có hai biến thể chính: Phở Bắc (vị thanh, ít gia vị đi kèm) và Phở Nam (nước dùng đậm đà, ăn kèm nhiều loại rau thơm, giá, tương đen).</p>
                <h3 className="font-bold text-lg mt-6 mb-2">Cách ăn chuẩn</h3>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Thử một ngụm nước dùng trước khi thêm bất kỳ gia vị nào.</li>
                  <li>Vắt một lát chanh nhỏ và vài lát ớt tươi nếu thích ăn cay.</li>
                  <li>Dùng đũa trộn đều bánh phở dưới đáy bát lên trên.</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};