import { Banknote, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';
import './CostSummary.css';

// ============================================
// COMPONENT THẺ THEO DÕI NGÂN SÁCH (COST SUMMARY)
// ============================================
// Tính năng riêng của mình, Figma không có.
// Giao diện được đồng bộ palette neutral/orange cho thống nhất.

interface CostSummaryProps {
    dayTotal: number;
    grandTotal: number;
    targetDailyBudget: number;
    totalDays: number;
}

const CostSummary = ({ dayTotal, grandTotal, targetDailyBudget, totalDays }: CostSummaryProps) => {
    const totalTargetBudget = (targetDailyBudget || 0) * (totalDays || 1);
    const isOverDaily = dayTotal > targetDailyBudget;
    const isOverTotal = grandTotal > totalTargetBudget;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Chi phí hôm nay */}
                <div className="bg-white rounded-xl p-4 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                            <Banknote className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-neutral-500 font-medium">Chi phí hôm nay</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-lg font-bold ${isOverDaily ? 'text-red-500' : 'text-neutral-800'}`}>
                            {formatCurrency(dayTotal)}
                        </p>
                        <span className="text-xs text-neutral-400">/ {formatCurrency(targetDailyBudget)}</span>
                    </div>
                </div>

                {/* Tổng chi phí tour */}
                <div className="bg-white rounded-xl p-4 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
                            <Landmark className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-neutral-500 font-medium">Tổng chi tiết tour</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className={`text-lg font-bold ${isOverTotal ? 'text-red-500' : 'text-neutral-800'}`}>
                            {formatCurrency(grandTotal)}
                        </p>
                        <span className="text-xs text-neutral-400">/ {formatCurrency(totalTargetBudget)}</span>
                    </div>
                </div>
            </div>

            {/* Trạng thái ngân sách */}
            {targetDailyBudget > 0 && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${isOverTotal ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {isOverTotal ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>
                        {isOverTotal
                            ? `Vượt ${formatCurrency(Math.abs(grandTotal - totalTargetBudget))}`
                            : `Còn dư ${formatCurrency(Math.abs(totalTargetBudget - grandTotal))}`
                        }
                    </span>
                </div>
            )}
        </div>
    );
};

export default CostSummary;
