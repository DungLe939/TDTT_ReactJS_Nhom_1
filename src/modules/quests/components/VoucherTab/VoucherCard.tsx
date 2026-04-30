import { Ticket, Clock, X, CheckCircle2 } from 'lucide-react';
import type { UserRewardResolved } from '../../types/quest.types';

interface FirestoreTimestamp {
    _seconds: number;
    _nanoseconds: number;
}

const toDate = (ts: FirestoreTimestamp) => new Date(ts._seconds * 1000);

const formatDate = (ts: FirestoreTimestamp) =>
    toDate(ts).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });

interface VoucherCardProps {
    voucher: UserRewardResolved;
    isSelected: boolean;
    isExpired: boolean;
    onSelect: (id: string) => void;
    onDismiss?: (id: string) => void;
}

const VoucherCard = ({
    voucher,
    isSelected,
    isExpired,
    onSelect,
    onDismiss,
}: VoucherCardProps) => {
    const discountPercent = voucher.reward.value;
    const description = voucher.reward.description;
    const expiresAt = voucher.expiresAt as FirestoreTimestamp | undefined;

    if (isExpired) {
        return (
            <div className="relative flex items-center gap-4 px-4 py-3 rounded-2xl border border-neutral-100 bg-neutral-50 opacity-60">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center">
                    <Ticket className="w-5 h-5 text-neutral-300" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-neutral-400 truncate">{description}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-neutral-300 bg-neutral-100 px-2 py-0.5 rounded-md uppercase tracking-widest">
                            -{discountPercent}%
                        </span>
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" /> Đã hết hạn
                        </span>
                    </div>
                </div>
                {onDismiss && (
                    <button
                        onClick={() => onDismiss(voucher.id)}
                        className="flex-shrink-0 w-6 h-6 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                        title="Xoá khỏi danh sách"
                    >
                        <X className="w-3 h-3 text-neutral-400" />
                    </button>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={() => onSelect(voucher.id)}
            className={`
        relative w-full text-left flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all duration-200
        ${isSelected
                    ? 'border-orange-400 bg-orange-50 shadow-md shadow-orange-100'
                    : 'border-neutral-100 bg-white hover:border-orange-200 hover:shadow-sm'
                }
      `}
        >
            {/* Discount badge */}
            <div className={`
        flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-colors
        ${isSelected ? 'bg-orange-500' : 'bg-orange-50'}
      `}>
                <span className={`text-sm font-black leading-none ${isSelected ? 'text-white' : 'text-orange-500'}`}>
                    -{discountPercent}%
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-neutral-700 truncate">{description}</p>
                {expiresAt && (
                    <p className="text-[10px] font-bold text-neutral-400 mt-1 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        HSD: {formatDate(expiresAt)}
                    </p>
                )}
            </div>

            {/* Selected indicator */}
            {isSelected && (
                <CheckCircle2 className="flex-shrink-0 w-4 h-4 text-orange-500" />
            )}
        </button>
    );
};

export default VoucherCard;