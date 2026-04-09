import { Send } from 'lucide-react';
import './MealCard.css';

// ==========================================
// COMPONENT GIAO DIỆN: THẺ MÓN ĂN (MEAL CARD)
// ==========================================
// Component này chỉ chịu trách nhiệm "Hiển thị" (Dumb Component),
// nhận dữ liệu dưới dạng Props từ cha (DailyPlanView) và in ra UI.
interface MealCardProps {
    session?: 'SÁNG' | 'TRƯA' | 'TỐI'; // Có thể bỏ trống nếu đây là bữa vặt (Bữa phụ)
    type?: 'main' | 'snack';         // Phân định style Bữa chính hay phụ
    time: string;                    // Thời gian ăn dự kiến (VD: 08:30)
    dishInfo: any;                   // Object chứa toàn bộ dữ liệu món ăn, địa chỉ, giá
    
    // Callbacks: Khi người dùng bấm nút trên Card, Card không tự xử lý mà gọi hàm Cha
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
