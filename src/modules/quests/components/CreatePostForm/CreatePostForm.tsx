// =========================================================================
// CreatePostForm — Form tạo bài viết mới  
// =========================================================================

import { useState, useCallback, useRef, useMemo } from 'react';
import Select from 'react-select';
import { Image as ImageIcon, Users, MapPin, Smile, MoreHorizontal, X } from 'lucide-react';
import type { Tag, Restaurant, DemoUser } from '../../types/quest.types';
import type { CreatePostDto } from '../../types/blog.types';

interface CreatePostFormProps {
  currentUser: DemoUser;
  restaurants: Restaurant[];
  onSubmit: (dto: Omit<CreatePostDto, 'authorId'>) => void;
}

/** Chỉ hiển thị subset tags phổ biến để UI không quá dài */
const POPULAR_TAGS: Tag[] = [
  'vietnamese', 'japanese', 'korean', 'italian', 'thai',
  'budget', 'mid-range', 'fine-dining',
  'breakfast', 'lunch', 'dinner', 'street-food', 'cafe',
];

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map(file => URL.createObjectURL(file));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
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

  // Memoize options — tránh tạo lại mỗi render
  const restaurantOptions = useMemo(() =>
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
        label: `${r.name} • ${finalAddress}`
      };
    }),
    [restaurants]
  );

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      borderRadius: '12px',
      borderColor: '#3a3b3c',
      backgroundColor: '#3a3b3c',
      color: 'white',
      padding: '4px 8px',
      fontSize: '0.9rem',
      '&:hover': { borderColor: '#4e4f50' }
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#242526',
      border: '1px solid #3a3b3c'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#0866ff' : state.isFocused ? '#3a3b3c' : 'transparent',
      color: 'white',
      cursor: 'pointer'
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'white'
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#b0b3b8'
    }),
    input: (provided: any) => ({
      ...provided,
      color: 'white'
    })
  };

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
                  <Select
                    options={restaurantOptions.slice(0, 100)}
                    isSearchable
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
                    onChange={(opt) => setSelectedRestaurant(opt ? opt.value : '')}
                  />
                </div>
              )}

              {/* Tags Section */}
              <div className="flex flex-wrap gap-2 mb-4">
                {POPULAR_TAGS.map(tag => (
                  <button 
                    key={tag} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                      selectedTags.includes(tag) 
                        ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20' 
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-orange-500 hover:text-orange-500'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    #{tag.toUpperCase()}
                  </button>
                ))}
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
                className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-sm ${
                  canSubmit 
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
