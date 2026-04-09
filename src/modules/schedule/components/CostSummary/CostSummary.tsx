import { Banknote, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';
import './CostSummary.css';

// ============================================
// COMPONENT THE THEO DÕI NGÂN SÁCH (COST SUMMARY)
// ============================================
// Component hiển thị khung số liệu thông minh trên đầu trang 
// để người dùng biết mình đang "Chi quá tay" hay "Vẫn còn dư tiền".

interface CostSummaryProps {
    dayTotal: number;          // Tiền đã chi của DUY NHẤT "ngày hôm nay" (đang click trên giao diện)
    grandTotal: number;        // Tổng tiền dồn lại của TOÀN BỘ các ngày trong chuyến FoodTour
    targetDailyBudget: number; // Mức tiền trung bình chia ra / 1 ngày (dựa theo budget / số ngày khai báo lúc search)
    totalDays: number;         // Độ dài chuyến đi (VD: 3 ngày)
}

const CostSummary = ({ dayTotal, grandTotal, targetDailyBudget, totalDays }: CostSummaryProps) => {
    // 1. Tính toán cột mốc kỳ vọng (Tổng ngân sách gốc)
    const totalTargetBudget = (targetDailyBudget || 0) * (totalDays || 1);
    
    // 2. Chấm điểm logic: Trả về cờ Boolean xem có vượt ngân sách không
    const isOverDaily = dayTotal > targetDailyBudget; // Tiêu lố trong ngày?
    const isOverTotal = grandTotal > totalTargetBudget; // Lố sạch tổng tiển cả chuyến đi?

    // 3. Hàm formatter Tiền Tệ VNĐ chuẩn.
    // Dùng API xây dựng sẵn của Javascript 'Intl' thì mã code sẽ rất sạch thay vì viết hàm dùng Regex.
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="cost-summary-container">
            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-header">
                        <div className="card-icon blue">
                            <Banknote size={18} />
                        </div>
                        <span className="card-label">Chi phí hôm nay</span>
                    </div>
                    <div className="card-value-wrapper">
                        <p className={`card-value ${isOverDaily ? 'text-danger' : 'text-success'}`}>
                            {formatCurrency(dayTotal)}
                        </p>
                        <span className="budget-hint">/ {formatCurrency(targetDailyBudget)}</span>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="card-header">
                        <div className="card-icon purple">
                            <Landmark size={18} />
                        </div>
                        <span className="card-label">Tổng chi tiết tour</span>
                    </div>
                    <div className="card-value-wrapper">
                        <p className={`card-value ${isOverTotal ? 'text-danger' : 'text-success'}`}>
                            {formatCurrency(grandTotal)}
                        </p>
                        <span className="budget-hint">/ {formatCurrency(totalTargetBudget)}</span>
                    </div>
                </div>

                {targetDailyBudget > 0 && (
                    <div className={`summary-status-card ${isOverTotal ? 'over' : 'within'}`}>
                        <div className="status-header">
                            <div className="status-icon">
                                {isOverTotal ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                            </div>
                            <span className="status-label">Trạng thái ngân sách</span>
                        </div>
                        <p className="status-value">
                            {isOverTotal 
                                ? `Vượt ${formatCurrency(Math.abs(grandTotal - totalTargetBudget))}`
                                : `Còn dư ${formatCurrency(Math.abs(totalTargetBudget - grandTotal))}`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CostSummary;
