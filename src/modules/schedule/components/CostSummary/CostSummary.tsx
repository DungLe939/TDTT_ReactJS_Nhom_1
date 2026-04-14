import { Banknote, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';
import './CostSummary.css';

/**
 * Component CostSummary - Thẻ hiển thị tóm tắt chi phí và quản lý ngân sách.
 * giúp người dùng theo dõi mức chi tiêu thực tế so với kỳ vọng ban đầu.
 */
interface CostSummaryProps {
    dayTotal: number;          // Tổng chi phí của ngày đang xem
    grandTotal: number;        // Tổng chi phí của toàn bộ chuyến đi hiện tại
    targetDailyBudget: number; // Mức ngân sách trung bình dự kiến cho 1 ngày
    totalDays: number;         // Tổng số ngày của tour
}

const CostSummary = ({ dayTotal, grandTotal, targetDailyBudget, totalDays }: CostSummaryProps) => {

    // Tính toán tổng ngân sách mục tiêu dựa trên (Ngân sách ngày) x (Số ngày)
    const totalTargetBudget = (targetDailyBudget || 0) * (totalDays || 1);

    // Kiểm tra xem chi tiêu thực tế có vượt quá mục tiêu hay không
    const isOverDaily = dayTotal > targetDailyBudget;
    const isOverTotal = grandTotal > totalTargetBudget;

    /** 
     * Hàm format tiền tệ VNĐ 
     * Sử dụng Intl.NumberFormat để tự động thêm dấu phân cách hàng nghìn và đơn vị đ.
     */
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* THÔNG TIN CHI PHÍ NGÀY HIỆN TẠI */}
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

                {/* TỔNG KẾT TOÀN BỘ CHUYẾN ĐI (TOUR TOTAL) */}
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

            {/* THANH THÔNG BÁO TRẠNG THÁI NGÂN SÁCH (BỘ LỌC THÔNG MINH) */}
            {/* Chỉ hiển thị nếu người dùng có nhập vào tổng ngân sách khi tạo tour */}
            {targetDailyBudget > 0 && (
                <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium ${isOverTotal ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {isOverTotal ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>
                        {isOverTotal
                            ? `Vượt ngân sách ${formatCurrency(Math.abs(grandTotal - totalTargetBudget))} (AI khuyên bạn nên chọn các món giá rẻ hơn vào ngày mai)`
                            : `Bạn đang chi tiêu rất ổn! Còn dư ${formatCurrency(Math.abs(totalTargetBudget - grandTotal))}`
                        }
                    </span>
                </div>
            )}
        </div>
    );
};

export default CostSummary;
