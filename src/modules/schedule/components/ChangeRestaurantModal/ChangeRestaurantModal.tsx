import { X, Star, MapPin, Check, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import './ChangeRestaurantModal.css';

interface ChangeRestaurantModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionName: string; // 'SÁNG', 'TRƯA', 'TỐI'
    alternatives: any[]; // Top 20 quán
    onSelect: (restaurant: any, dish: any) => void;
}

const ChangeRestaurantModal = ({ isOpen, onClose, sessionName, alternatives, onSelect }: ChangeRestaurantModalProps) => {
    const [selectedRes, setSelectedRes] = useState<any>(null);

    useEffect(() => {
        if (!isOpen) {
            setSelectedRes(null);
            document.body.style.overflow = 'unset';
        } else {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSelectDish = (dish: any) => {
        if (selectedRes) {
            onSelect(selectedRes, dish);
            onClose();
        }
    };

    return (
        <div className="change-res-overlay">
            <div className="change-res-content">
                <div className="change-res-header">
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                    <h2>Chọn quán cho bữa {sessionName}</h2>
                    <p className="subtitle">Hệ thống gợi ý 20 quán có điểm số AI cao nhất</p>
                </div>

                <div className="change-res-body">
                    {!selectedRes ? (
                        <div className="res-list">
                            {alternatives && alternatives.length > 0 ? (
                                alternatives.map((res, idx) => (
                                    <div key={res.id || idx} className="res-item" onClick={() => setSelectedRes(res)}>
                                        <div className="res-item-main">
                                            <div className="res-badge"># {idx + 1}</div>
                                            <div className="res-info">
                                                <h4 className="res-name">{res.name}</h4>
                                                <p className="res-address"><MapPin size={12} /> {res.address}</p>
                                                <div className="res-meta">
                                                    <span className="res-rating">
                                                        <Star size={12} fill="#ffb200" color="#ffb200" /> {res.rating}
                                                    </span>
                                                    <span className="res-price">
                                                        {Array(res.priceRange || 2).fill('$').join('')}
                                                    </span>
                                                    <span className="res-ai-score">AI Score: {res.score}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className="arrow-icon" />
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">Không có quán thay thế nào phù hợp.</div>
                            )}
                        </div>
                    ) : (
                        <div className="menu-selection">
                            <button className="back-link" onClick={() => setSelectedRes(null)}>
                                ← Quay lại danh sách quán
                            </button>
                            <div className="selected-res-header">
                                <h3>{selectedRes.name}</h3>
                                <p>{selectedRes.address}</p>
                            </div>
                            <hr />
                            <h4>Chọn món để thêm vào lịch trình:</h4>
                            <div className="menu-grid">
                                {selectedRes.menu?.map((dish: any, idx: number) => (
                                    <div 
                                        key={idx} 
                                        className="menu-option"
                                        onClick={() => handleSelectDish(dish)}
                                    >
                                        <div className="menu-option-info">
                                            <span className="menu-option-name">{dish.name}</span>
                                            <span className="menu-option-price">{dish.price?.toLocaleString()}đ</span>
                                        </div>
                                        <Check size={18} className="select-icon" />
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

export default ChangeRestaurantModal;
