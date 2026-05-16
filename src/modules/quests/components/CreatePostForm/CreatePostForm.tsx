// =========================================================================
// CreatePostForm — Form tạo bài viết mới  
// =========================================================================

import { useState, useCallback, useRef, useMemo } from 'react';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { Image as ImageIcon, Users, MapPin, Smile, MoreHorizontal, X } from 'lucide-react';
import type { Tag, Restaurant, DemoUser } from '../../types/quest.types';
import type { CreatePostDto } from '../../types/blog.types';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useNavigate } from 'react-router';

interface CreatePostFormProps {
  currentUser: DemoUser;
  restaurants: Restaurant[];
  onSubmit: (dto: Omit<CreatePostDto, 'authorId'>) => void;
}

/** Danh sách thẻ đầy đủ cho hệ thống tìm kiếm */
const ALL_TAGS: Tag[] = [
  // Ẩm thực
  'vietnamese', 'japanese', 'korean', 'chinese', 'italian', 'french', 'thai', 'indian', 'american',
  // Loại món
  'street-food', 'cafe', 'fine-dining', 'buffet', 'fast-food', 'bbq', 'hotpot', 'bakery', 'vegan', 'seafood',
  // Thời gian/Bữa ăn
  'breakfast', 'lunch', 'dinner', 'brunch', 'late-night', 'all-day',
  // Giá cả
  'budget', 'mid-range', 'expensive', 'students',
  // Không gian/Vibe
  'chill', 'rooftop', 'air-conditioned', 'modern', 'vintage', 'workspace', 'pet-friendly', 'date-night', 'family',
  // Đặc điểm
  'halal', 'healthy', 'home-made', 'traditional', 'fusion', 'delivery',
];

/** 5 thẻ được dùng nhiều nhất/gợi ý nhanh */
const QUICK_TAGS: Tag[] = ['vietnamese', 'street-food', 'cafe', 'chill', 'budget'];

// Format data cho react-select
const tagOptions = ALL_TAGS.map(tag => ({
  value: tag,
  label: `#${tag.toUpperCase()}`
}));

const normalizeAddress = (addr: string): string => {
  if (!addr) return '';
  return addr
    .replace(/Ho Chi Minh City/gi, 'TP. Hồ Chí Minh')
    .replace(/Hanoi/gi, 'Hà Nội')
    .replace(/Saigon/gi, 'Sài Gòn')
    .replace(/Street/gi, 'Đường')
    .replace(/Ward/gi, 'Phường')
    .replace(/District/gi, 'Quận')
    .replace(/Cholon/gi, 'Chợ Lớn')
    .replace(/Giang Vo/gi, 'Giảng Võ')
    .replace(/Cua Nam/gi, 'Cửa Nam')
    .replace(/An Khanh/gi, 'An Khánh')
    .replace(/Hoa Hung/gi, 'Hòa Hưng')
    .replace(/An Nhon/gi, 'An Nhơn')
    .replace(/Nguyen Thai Son/gi, 'Nguyễn Thái Sơn')
    .replace(/Tran Hung Dao/gi, 'Trần Hưng Đạo')
    .replace(/Vong Duc/gi, 'Vọng Đức')
    .replace(/Pasteur/gi, 'Pasteur')
    .replace(/Luu Dinh Le/gi, 'Lưu Đình Lễ')
    .replace(/Truong Son/gi, 'Trường Sơn')
    .replace(/Nguyen Chi Thanh/gi, 'Nguyễn Chí Thanh');
};

const CreatePostForm = ({ currentUser, restaurants, onSubmit }: CreatePostFormProps) => {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [showRestaurantSelect, setShowRestaurantSelect] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const EMOJIS = ['❤️', '🙌', '🔥', '🤤', '🍜', '🍕', '🍱', '🍦'];

  const toggleTag = useCallback((tag: Tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }, []);

  const addEmoji = (emoji: string) => {
    setContent(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; // Giới hạn chiều rộng để giảm dung lượng
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Nén ảnh xuống chất lượng 0.6 (JPEG)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          resolve(dataUrl);
        };
      };
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      for (const file of filesArray) {
        try {
          const compressed = await compressImage(file);
          setPhotoPreviews(prev => [...prev, compressed]);
        } catch (error) {
          console.error("Lỗi nén ảnh:", error);
        }
      }
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const isContentLongEnough = content.trim().length >= 20;
  const hasTags = selectedTags.length > 0;
  const hasRestaurant = selectedRestaurant !== '';
  const canSubmit = isContentLongEnough && hasTags && hasRestaurant;

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit({
      content: content.trim(),
      tags: selectedTags,
      restaurantId: selectedRestaurant,
      photoUrls: photoPreviews,
    });

    setContent('');
    setSelectedTags([]);
    setSelectedRestaurant('');
    setPhotoPreviews([]);
    setIsModalOpen(false);
    setShowRestaurantSelect(true);
  };

  // Pre-calculate options only once when restaurants change
  const allRestaurantOptions = useMemo(() =>
    restaurants.map(r => {
      const rAny = r as any;
      let addrRaw = rAny.address || rAny.Address || rAny.diaChi || rAny.location;

      let addrStr = '';
      if (typeof addrRaw === 'string') {
        addrStr = addrRaw;
      } else if (addrRaw && typeof addrRaw === 'object') {
        addrStr = addrRaw.address || addrRaw.name || '';
      }

      let finalAddress = addrStr ? addrStr : (r.id ? `ID: ${r.id.substring(0, 8)}...` : 'Chưa có địa chỉ');
      finalAddress = normalizeAddress(finalAddress);

      return {
        value: r.id,
        label: `${r.name} • ${finalAddress}`,
        searchText: `${r.name} ${finalAddress}`.toLowerCase()
      };
    }),
    [restaurants]
  );

  // Search function for AsyncSelect
  const loadRestaurantOptions = (
    inputValue: string,
    callback: (options: any[]) => void
  ) => {
    if (!inputValue) {
      callback(allRestaurantOptions.slice(0, 50));
      return;
    }

    const search = inputValue.toLowerCase();
    const filtered = allRestaurantOptions
      .filter(opt => opt.searchText.includes(search))
      .slice(0, 50); // Limit to 50 results for performance

    callback(filtered);
  };

  if (!isLoggedIn) {
    return (
      <div
        className="bg-white rounded-3xl p-6 shadow-sm border border-neutral-100 flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group overflow-hidden relative"
        onClick={() => navigate('/auth')}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner group-hover:scale-110 transition-transform">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-extrabold text-neutral-800 text-sm">Chia sẻ trải nghiệm ẩm thực của bạn</h4>
            <p className="text-xs text-neutral-500 font-medium">Đăng bài, check-in và nhận huy hiệu ngay!</p>
          </div>
        </div>
        <button className="bg-neutral-900 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-neutral-200 group-hover:bg-black transition-all relative z-10">
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-white rounded-3xl p-4 shadow-[0_2px_15px_rgba(0,0,0,0.04)] border border-neutral-100 flex items-center gap-3 cursor-pointer hover:bg-neutral-50 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
          {currentUser.avatar}
        </div>
        <div className="flex-1 bg-neutral-100 rounded-full px-4 py-3 text-sm text-neutral-500 font-medium">
          {currentUser.username} ơi, bạn đang nghĩ gì thế?
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] z-10 overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header */}
            <div className="relative border-b border-neutral-100 p-4 text-center">
              <h2 className="text-lg font-bold text-neutral-900">Tạo bài viết</h2>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
              {/* User Info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold shadow-sm">
                  {currentUser.avatar}
                </div>
                <div>
                  <span className="font-bold text-neutral-900 block text-sm">{currentUser.username}</span>
                  <div className="flex items-center gap-1 bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md text-xs font-semibold mt-1">
                    <Users className="w-3 h-3" /> Công khai
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                className="w-full text-base min-h-[120px] outline-none resize-none placeholder-neutral-400"
                placeholder={`${currentUser.username} ơi, bạn đang nghĩ gì thế?`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                autoFocus
              />

              {/* Emoji bar */}
              <div className="flex justify-between items-center mb-4 relative">
                <div className="text-xl font-bold text-neutral-300">Aa</div>
                <div
                  className="cursor-pointer text-neutral-400 hover:text-orange-500 transition-colors p-1"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-6 h-6" />
                </div>
                {showEmojiPicker && (
                  <div className="absolute top-10 right-0 bg-white border border-neutral-100 shadow-xl rounded-2xl p-2 flex gap-2 z-20">
                    {EMOJIS.map(e => (
                      <button key={e} onClick={() => addEmoji(e)} className="text-2xl hover:scale-110 transition-transform">
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Previews */}
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {photoPreviews.map((url, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden aspect-square border border-neutral-100">
                      <img src={url} alt="preview" className="w-full h-full object-cover" />
                      <button
                        className="absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-neutral-700 hover:bg-red-500 hover:text-white transition-colors shadow-sm"
                        onClick={() => removePhoto(index)}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Restaurant Select */}
              {showRestaurantSelect && (
                <div className="mb-4">
                  <AsyncSelect
                    cacheOptions
                    defaultOptions={allRestaurantOptions.slice(0, 50)}
                    loadOptions={loadRestaurantOptions}
                    placeholder="Tìm kiếm nhà hàng..."
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '12px',
                        borderColor: '#E5E7EB',
                        backgroundColor: '#F9FAFB',
                        padding: '2px',
                        boxShadow: 'none',
                        '&:hover': { borderColor: '#d1d5db' }
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected ? '#FF6B35' : state.isFocused ? '#FFF5F2' : 'white',
                        color: state.isSelected ? 'white' : '#1A1A2E',
                        cursor: 'pointer'
                      })
                    }}
                    onChange={(opt: any) => setSelectedRestaurant(opt ? opt.value : '')}
                  />
                </div>
              )}

              {/* Tags Section - Searchable & Compact */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest pl-1">Thẻ bài viết</h4>
                  <span className="text-[10px] font-bold text-neutral-300 italic">Chọn nhiều thẻ...</span>
                </div>
                <Select
                  isMulti
                  options={tagOptions}
                  placeholder="Gõ để tìm thẻ (vd: #vietnamese, #chill...)"
                  value={tagOptions.filter(opt => selectedTags.includes(opt.value as Tag))}
                  onChange={(opts) => setSelectedTags(opts ? opts.map(o => o.value as Tag) : [])}
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '16px',
                      borderColor: '#F3F4F6',
                      backgroundColor: '#F9FAFB',
                      padding: '4px',
                      boxShadow: 'none',
                      fontSize: '13px',
                      minHeight: '48px',
                      '&:hover': { borderColor: '#E5E7EB' }
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#FFF5F2',
                      borderRadius: '8px',
                      padding: '1px 4px',
                      border: '1px solid #FFE4D6'
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#FF6B35',
                      fontWeight: '800',
                      fontSize: '11px'
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: '#FFB091',
                      '&:hover': { backgroundColor: '#FF6B35', color: 'white' }
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#FF6B35' : state.isFocused ? '#FFF5F2' : 'white',
                      color: state.isSelected ? 'white' : '#1A1A2E',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    })
                  }}
                />
                {/* Gợi ý nhanh */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="text-[9px] font-black text-neutral-300 uppercase mt-1.5 mr-1">Gợi ý:</span>
                  {QUICK_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold transition-all border ${selectedTags.includes(tag)
                        ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                        : 'bg-white border-neutral-100 text-neutral-400 hover:border-orange-500 hover:text-orange-500'
                        }`}
                      onClick={() => toggleTag(tag)}
                    >
                      #{tag.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between border border-neutral-200 rounded-2xl p-3 mb-4 shadow-sm">
                <span className="font-semibold text-sm text-neutral-700 ml-2">Thêm vào bài viết</span>
                <div className="flex gap-1">
                  <button className="w-9 h-9 rounded-full flex items-center justify-center text-green-500 hover:bg-green-50 transition-colors" title="Ảnh/Video" onClick={() => fileInputRef.current?.click()}>
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center text-blue-500 hover:bg-blue-50 transition-colors" title="Gắn thẻ người khác">
                    <Users className="w-5 h-5" />
                  </button>
                  <button className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${showRestaurantSelect ? 'text-orange-500 bg-orange-50' : 'text-red-500 hover:bg-red-50'}`} title="Check-in" onClick={() => setShowRestaurantSelect(!showRestaurantSelect)}>
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-500 hover:bg-neutral-100 transition-colors" title="Xem thêm">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <input type="file" ref={fileInputRef} hidden multiple accept="image/*" onChange={handleImageChange} />

              {/* Submit Button */}
              <button
                className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm ${canSubmit
                  ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/30'
                  : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  }`}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreatePostForm;
