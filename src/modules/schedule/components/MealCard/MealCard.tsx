import { Send } from 'lucide-react';
import './MealCard.css';

interface MealCardProps {
    session: 'SÁNG' | 'TRƯA' | 'TỐI';
    time: string;
    dishInfo: any;
    onShowMap?: (dishInfo: any) => void;
}

const MealCard = ({ session, time, dishInfo, onShowMap }: MealCardProps) => {

    return (
        <div className="meal-card-wrapper">
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

                 <button 
                    className="meal-action-btn"
                    onClick={() => onShowMap?.(dishInfo)}
                    title="Xem chỉ đường"
                 >
                     <Send size={18} />
                 </button>
             </div>
        </div>
    );
};

export default MealCard;
