import React, { useState } from 'react';
import { X, Plus, ShieldAlert } from 'lucide-react';

interface AllergyInputProps {
  allergies: string[];
  onAllergiesChange: (allergies: string[]) => void;
}

const COMMON_ALLERGIES = ['Hải sản', 'Đậu phộng', 'Sữa', 'Gluten', 'Trứng'];

export const AllergyInput: React.FC<AllergyInputProps> = ({ allergies, onAllergiesChange }) => {
  const [inputValue, setInputValue] = useState('');

  const addAllergy = (tag: string) => {
    const normalized = tag.trim();
    if (normalized && !allergies.includes(normalized)) {
      onAllergiesChange([...allergies, normalized]);
    }
    setInputValue('');
  };

  const removeAllergy = (tag: string) => {
    onAllergiesChange(allergies.filter((a) => a !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addAllergy(inputValue);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm mb-2">
        <ShieldAlert className="w-4 h-4 text-red-500" />
        DỊ ỨNG & HẠN CHẾ ĂN UỐNG
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {allergies.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-black border border-red-100 shadow-sm animate-in fade-in zoom-in duration-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeAllergy(tag)}
              className="hover:text-red-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập dị ứng (ví dụ: Đậu phộng)..."
          className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all pr-12"
        />
        <button
          type="button"
          onClick={() => addAllergy(inputValue)}
          disabled={!inputValue.trim()}
          className="absolute right-2 top-2 w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-colors disabled:opacity-30"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2 mt-2">Phổ biến:</span>
        {COMMON_ALLERGIES.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => addAllergy(tag)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
              allergies.includes(tag)
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white text-slate-500 border-slate-200 hover:border-red-300 hover:text-red-500'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
};
