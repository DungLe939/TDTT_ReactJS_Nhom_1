import type { Tag } from '../../types/quest.types';
import { Tag as TagIcon, X } from 'lucide-react';

interface PostFilterProps {
  activeTags: Tag[];
  onToggleTag: (tag: Tag) => void;
  onClear: () => void;
}

const FILTER_TAGS: Tag[] = [
  'vietnamese', 'japanese', 'korean', 'italian', 'chinese', 'thai', 'french', 'indian',
  'budget', 'mid-range', 'fine-dining',
  'breakfast', 'lunch', 'dinner', 'street-food', 'cafe',
  'vegetarian', 'vegan', 'halal',
];

const PostFilter = ({ activeTags, onToggleTag, onClear }: PostFilterProps) => {
  return (
    <div className="flex flex-col h-full overflow-hidden" id="post-filter">
      <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <TagIcon className="w-4 h-4 text-orange-500" />
          <span className="font-bold text-neutral-800 text-sm tracking-wide uppercase">Lọc theo thẻ</span>
          {activeTags.length > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {activeTags.length}
            </span>
          )}
        </div>
        
        {activeTags.length > 0 && (
          <button
            className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-red-500 transition-colors uppercase tracking-tight"
            onClick={onClear}
            id="post-filter-clear"
          >
            <X className="w-3 h-3" /> Xóa
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-wrap gap-2">
          {FILTER_TAGS.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  isActive 
                    ? 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20 scale-[1.02]' 
                    : 'bg-neutral-50 border-neutral-100 text-neutral-500 hover:border-orange-200 hover:text-orange-500 hover:bg-white'
                }`}
                onClick={() => onToggleTag(tag)}
              >
                #{tag.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PostFilter;
