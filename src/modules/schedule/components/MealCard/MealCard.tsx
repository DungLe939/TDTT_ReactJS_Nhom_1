import { Send } from 'lucide-react';
import './MealCard.css';

interface MealCardProps {
    session?: 'SÁNG' | 'TRƯA' | 'TỐI';
    type?: 'main' | 'snack';
    time: string;
    dishInfo: any;
    onShowMap?: (dishInfo: any) => void;
    onShowDetail?: (dishInfo: any) => void;
}

const MealCard = ({ session, type = 'main', time, dishInfo, onShowMap, onShowDetail }: MealCardProps) => {

    return (
        <div className={`meal-card-wrapper ${type === 'snack' ? 'is-snack' : ''}`}>
             <div className="meal-card">
                 <div className="meal-image-placeholder">
                      {/* Image placeholder */}
                      <span className="placeholder-text">Chưa có ảnh</span>
                 </div>
                 
                 <div className="meal-info">
                     <div className="meal-type-tag">
                         {type === 'main' ? (
                             <span className="tag-main">Bữa chính</span>
                         ) : (
                             <span className="tag-snack">Bữa phụ</span>
                         )}
                     </div>
                     
                     <div className="meal-meta">
                         {type === 'main' && session && <span className="meal-session">{session}</span>}
                         <span className="meal-time">{time}</span>
                     </div>
                     <h4 className="meal-name">{dishInfo.dish}</h4>
                     
                     <div className="meal-restaurant-info">
                         <span 
                            className="meal-restaurant-name"
                            onClick={() => onShowDetail?.(dishInfo)}
                         >
                             {dishInfo.name}
                         </span>
                     </div>

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
