import { Send, AlertTriangle } from 'lucide-react';
import './MealCard.css';

interface MealCardProps {
    session: 'SÁNG' | 'TRƯA' | 'TỐI';
    time: string;
    dishInfo: any;
}

const MealCard = ({ session, time, dishInfo }: MealCardProps) => {

    // Hardcode hiển thị ở thẻ TRƯA để minh hoạ layout theo yêu cầu
    const showWarning = session === 'TRƯA';

    return (
        <div className="meal-card-wrapper">
             {/* Warning banner logic */}
             {showWarning && (
                 <div className="meal-warning-banner">
                     <div className="warning-text">
                         <AlertTriangle size={16} />
                         <span>Món này hơi giống món trưa qua, bạn có muốn đổi?</span>
                     </div>
                     <button className="btn-change-meal">Đổi món</button>
                 </div>
             )}

             <div className="meal-card">
                 <div className="meal-image-placeholder">
                      {/* Image placeholder */}
                      <span className="placeholder-text">Chưa có ảnh</span>
                 </div>
                 
                 <div className="meal-info">
                     <div className="meal-meta">
                         <span className="meal-session">{session}</span>
                         <span className="meal-time">{time}</span>
                     </div>
                     <h4 className="meal-name">{dishInfo.dish}</h4>
                     {dishInfo.category && (
                         <span className="meal-category">{dishInfo.category}</span>
                     )}
                 </div>

                 <button className="meal-action-btn">
                     <Send size={18} />
                 </button>
             </div>
        </div>
    );
};

export default MealCard;
