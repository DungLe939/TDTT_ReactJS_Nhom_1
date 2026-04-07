import { useEffect, useState } from 'react';
import { X, MapPin, Clock, Star, UtensilsCrossed, Check, AlertCircle } from 'lucide-react';
import './RestaurantDetailModal.css';

interface RestaurantDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    dishInfo: any;
    onDishSelect?: (item: any) => void;
}

const RestaurantDetailModal = ({ isOpen, onClose, dishInfo, onDishSelect }: RestaurantDetailModalProps) => {
    const [confirmingDish, setConfirmingDish] = useState<any>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setConfirmingDish(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !dishInfo) return null;

    const handleItemClick = (item: any) => {
        // Nếu món đang chọn chính là món trong lịch trình thì không làm gì
        if (item.name === dishInfo.dish) return;
        setConfirmingDish(item);
    };

    const handleConfirm = () => {
        if (confirmingDish) {
            onDishSelect?.(confirmingDish);
            setConfirmingDish(null);
            onClose();
        }
    };

    return (
        <div className="restaurant-modal-overlay">
            <div className="restaurant-modal-content">
                <div className="restaurant-modal-header">
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                    <div className="restaurant-header-meta">
                         <h2 className="restaurant-title">{dishInfo.name}</h2>
                         <div className="restaurant-short-info">
                             <div className="rating-pill">
                                 <Star size={14} fill="currentColor" />
                                 <span>{dishInfo.rating || 4.2}</span>
                             </div>
                             <span className="price-range">
                                 {Array(dishInfo.priceRange || 2).fill('$').join('')}
                             </span>
                         </div>
                    </div>
                </div>

                <div className="restaurant-modal-body">
                    <div className="info-section">
                        <div className="info-row">
                            <MapPin size={18} className="info-icon" />
                            <span>{dishInfo.address}</span>
                        </div>
                        <div className="info-row">
                            <Clock size={18} className="info-icon" />
                            <span>Giờ mở cửa: {dishInfo.openingHours?.open} - {dishInfo.openingHours?.close}</span>
                        </div>
                    </div>

                    {dishInfo.menu && dishInfo.menu.length > 0 && (
                        <div className="menu-section">
                            <hr className="divider" />
                            <div className="section-header">
                                <h3 className="section-title">
                                    <UtensilsCrossed size={18} />
                                    Thực đơn
                                </h3>
                                <span className="section-hint">Click chọn món để đổi vào lịch trình</span>
                            </div>
                            <div className="menu-grid">
                                {dishInfo.menu.map((item: any, idx: number) => {
                                    const isCurrent = item.name === dishInfo.dish;
                                    return (
                                        <div 
                                            key={idx} 
                                            className={`menu-item ${isCurrent ? 'active' : 'selectable'}`}
                                            onClick={() => handleItemClick(item)}
                                        >
                                            <div className="menu-item-left">
                                                <span className="menu-item-name">{item.name}</span>
                                                {isCurrent && <span className="current-badge">Đang chọn</span>}
                                            </div>
                                            <span className="menu-item-price">{item.price?.toLocaleString()}đ</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Hộp thoại xác nhận tùy chỉnh (Overlay bên trong Modal) */}
                {confirmingDish && (
                    <div className="confirm-overlay">
                        <div className="confirm-card">
                            <div className="confirm-icon-wrapper">
                                <AlertCircle size={32} color="#ff6b00" />
                            </div>
                            <h3>Xác nhận đổi món?</h3>
                            <p>Bạn có muốn đổi <strong>{dishInfo.dish}</strong> thành <strong>{confirmingDish.name}</strong> không?</p>
                            <div className="confirm-actions">
                                <button className="cancel-btn" onClick={() => setConfirmingDish(null)}>Hủy</button>
                                <button className="confirm-btn" onClick={handleConfirm}>
                                    <Check size={18} /> Đồng ý
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantDetailModal;
