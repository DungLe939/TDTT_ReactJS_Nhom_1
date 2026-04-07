import { useEffect } from 'react';
import { X, MapPin, Clock, Star, UtensilsCrossed } from 'lucide-react';
import './RestaurantDetailModal.css';

interface RestaurantDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    dishInfo: any;
}

const RestaurantDetailModal = ({ isOpen, onClose, dishInfo }: RestaurantDetailModalProps) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !dishInfo) return null;

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
                            <h3 className="section-title">
                                <UtensilsCrossed size={18} />
                                Thực đơn
                            </h3>
                            <div className="menu-grid">
                                {dishInfo.menu.map((item: any, idx: number) => (
                                    <div key={idx} className="menu-item">
                                        <span className="menu-item-name">{item.name}</span>
                                        <span className="menu-item-price">{item.price.toLocaleString()}đ</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RestaurantDetailModal;
