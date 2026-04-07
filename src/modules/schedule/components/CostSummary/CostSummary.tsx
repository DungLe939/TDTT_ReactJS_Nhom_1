import { Banknote, Landmark, AlertCircle, CheckCircle2 } from 'lucide-react';
import './CostSummary.css';

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
