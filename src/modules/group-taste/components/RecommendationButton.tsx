import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Loader2 } from 'lucide-react';

interface RecommendationButtonProps {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
  userCount: number;
}

export const RecommendationButton: React.FC<RecommendationButtonProps> = ({
  onClick,
  loading,
  disabled,
  userCount,
}) => {
  const isClickable = !disabled && !loading && userCount > 0;

  return (
    <div className="my-6">
      <motion.button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (isClickable) {
            onClick();
          }
        }}
        disabled={!isClickable}
        whileTap={isClickable ? { scale: 0.97 } : undefined}
        whileHover={isClickable ? { scale: 1.01 } : undefined}
        className={`
          w-full py-4 rounded-2xl font-bold text-base text-white transition-all 
          flex items-center justify-center gap-2.5 relative overflow-hidden
          ${isClickable
            ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg shadow-orange-200 cursor-pointer'
            : 'bg-neutral-300 cursor-not-allowed'
          }
        `}
        style={{ pointerEvents: loading ? 'none' : 'auto' }}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Đang tính toán dung hòa khẩu vị...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>
              {userCount === 0
                ? 'Thêm thành viên để bắt đầu'
                : `Tìm nhà hàng cho ${userCount} người`}
            </span>
          </>
        )}

        {/* Shimmer effect when clickable */}
        {isClickable && !loading && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut',
            }}
          />
        )}
      </motion.button>

      {userCount > 0 && userCount < 2 && !loading && (
        <p className="text-xs text-amber-600 text-center mt-2">
          💡 Thêm ít nhất 2 thành viên để dung hòa khẩu vị nhóm tốt hơn
        </p>
      )}
    </div>
  );
};
