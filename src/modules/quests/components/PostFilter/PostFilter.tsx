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
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="flex flex-wrap gap-2">
          {FILTER_TAGS.map((tag) => {
            const isActive = activeTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all border ${
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
