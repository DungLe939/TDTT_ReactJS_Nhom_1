import { useState, useMemo } from 'react';
import { Ticket, AlertCircle } from 'lucide-react';
import type { UserRewardResolved } from '../../types/quest.types';
import { redeemVoucher } from '../../services/achievementService';
import VoucherCard from './VoucherCard';

interface FirestoreTimestamp {
    _seconds: number;
    _nanoseconds: number;
}

interface RedeemResult {
    id: string;
    description: string;
    success: boolean;
    message: string;
}

const isExpiredTimestamp = (ts: FirestoreTimestamp) =>
    new Date(ts._seconds * 1000) < new Date();

const DISMISSED_KEY = (userId: string) => `dismissed_expired_vouchers_${userId}`;

interface VoucherTabProps {
    userId: string;
    vouchers: UserRewardResolved[];
    loading: boolean;
    onVouchersChange: (vouchers: UserRewardResolved[]) => void;
}

const VoucherTab = ({ userId, vouchers, loading, onVouchersChange }: VoucherTabProps) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
        try {
            const stored = localStorage.getItem(DISMISSED_KEY(userId));
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
            return new Set();
        }
    });
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemResults, setRedeemResults] = useState<RedeemResult[]>([]);

    const { validVouchers, expiredVouchers } = useMemo(() => {
        const valid: UserRewardResolved[] = [];
        const expired: UserRewardResolved[] = [];

        vouchers.forEach(v => {
            const ts = v.expiresAt as FirestoreTimestamp | undefined;
            if (ts && isExpiredTimestamp(ts)) {
                if (!dismissedIds.has(v.id)) expired.push(v);
            } else {
                valid.push(v);
            }
        });

        return { validVouchers: valid, expiredVouchers: expired };
    }, [vouchers, dismissedIds]);

    const handleSelect = (id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleDismiss = (id: string) => {
        setDismissedIds(prev => {
            const next = new Set(prev);
            next.add(id);
            localStorage.setItem(DISMISSED_KEY(userId), JSON.stringify([...next]));
            return next;
        });
    };

    const handleRedeem = async () => {
        if (selectedIds.size === 0 || isRedeeming) return;

        setIsRedeeming(true);
        setRedeemResults([]);

        const selected = validVouchers.filter(v => selectedIds.has(v.id));
        const results: RedeemResult[] = [];

        for (const voucher of selected) {
            try {
                const res = await redeemVoucher(userId, voucher.id);
                results.push({
                    id: voucher.id,
                    description: voucher.reward.description,
                    success: res.success,
                    message: res.message,
                });
                if (res.success) {
                    onVouchersChange(vouchers.filter(v => v.id !== voucher.id));
                }
            } catch {
                results.push({
                    id: voucher.id,
                    description: voucher.reward.description,
                    success: false,
                    message: 'Không thể kết nối đến máy chủ.',
                });
            }
        }

        setSelectedIds(new Set());
        setRedeemResults(results);
        setIsRedeeming(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col gap-3 p-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-2xl bg-neutral-100 animate-pulse" />
                ))}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 p-4">
            {/* Redeem results banner */}
            {redeemResults.length > 0 && (
                <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4 flex flex-col gap-2">
                    {redeemResults.map(r => (
                        <div key={r.id} className={`flex items-start gap-2 text-xs font-bold ${r.success ? 'text-green-600' : 'text-red-500'}`}>
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>
                                <span className="text-neutral-600">{r.description}: </span>
                                {r.message}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {/* Valid vouchers */}
            {validVouchers.length > 0 ? (
                <div className="flex flex-col gap-2">
                    {validVouchers.map(v => (
                        <VoucherCard
                            key={v.id}
                            voucher={v}
                            isSelected={selectedIds.has(v.id)}
                            isExpired={false}
                            onSelect={handleSelect}
                        />
                    ))}
                </div>
            ) : (
                <div className="py-10 flex flex-col items-center gap-3 text-center border-2 border-dashed border-neutral-100 rounded-2xl">
                    <Ticket className="w-8 h-8 text-neutral-200" />
                    <p className="text-xs font-bold text-neutral-300">Bạn chưa có voucher nào</p>
                </div>
            )}

            {/* Expired vouchers */}
            {expiredVouchers.length > 0 && (
                <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
                        Đã hết hạn
                    </p>
                    {expiredVouchers.map(v => (
                        <VoucherCard
                            key={v.id}
                            voucher={v}
                            isSelected={false}
                            isExpired={true}
                            onSelect={() => { }}
                            onDismiss={handleDismiss}
                        />
                    ))}
                </div>
            )}

            {/* Redeem button */}
            <button
                onClick={handleRedeem}
                disabled={selectedIds.size === 0 || isRedeeming}
                className={`
          mt-2 w-full py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all duration-200
          ${selectedIds.size > 0 && !isRedeeming
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-100 hover:shadow-lg hover:shadow-orange-200'
                        : 'bg-neutral-100 text-neutral-300 cursor-not-allowed'
                    }
        `}
            >
                {isRedeeming
                    ? 'Đang xử lý...'
                    : selectedIds.size > 0
                        ? `Dùng ${selectedIds.size} voucher`
                        : 'Chọn voucher để dùng'
                }
            </button>
        </div>
    );
};

export default VoucherTab;