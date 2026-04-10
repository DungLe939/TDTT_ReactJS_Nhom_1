import { useEffect, useState } from 'react';
import { X, Star, Utensils, MapPin, Loader2, Check, AlertCircle } from 'lucide-react';
import './SwapMealModal.css';

interface SwapMealModalProps {
    isOpen: boolean;
    onClose: () => void;
    options: any[];
    loading: boolean;
    onSelect: (option: any) => void;
    currentMealName: string;
}

const SwapMealModal = ({ isOpen, onClose, options, loading, onSelect, currentMealName }: SwapMealModalProps) => {
    const [confirmingOption, setConfirmingOption] = useState<any>(null);
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setConfirmingOption(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="swap-modal-overlay">
            <div className="swap-modal-content">
                <div className="swap-modal-header">
                    <div className="header-left">
                        <Utensils className="header-icon" />
                        <div>
                            <h2 className="swap-title">Đổi món ăn</h2>
                            <p className="swap-subtitle">Thay thế cho: <strong>{currentMealName}</strong></p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="swap-modal-body">
                    {loading ? (
                        <div className="swap-loading">
                            <Loader2 className="animate-spin" size={40} />
                            <p>Đang tìm kiếm món ngon cho bạn...</p>
                        </div>
                    ) : (
                        <>
                            <div className="options-grid">
                                {options.length > 0 ? (
                                    options.map((option, idx) => (
                                        <div 
                                            key={idx} 
                                            className="swap-option-card"
                                            onClick={() => setConfirmingOption(option)}
                                        >
                                            <div className="option-res-meta">
                                                <div className="option-rating">
                                                    <Star size={12} fill="currentColor" />
                                                    <span>{option.rating || 4.2}</span>
                                                </div>
                                                {option.distance && (
                                                    <span className="option-dist">{(option.distance / 1000).toFixed(1)}km</span>
                                                )}
                                            </div>
                                            
                                            <div className="option-details">
                                                <h4 className="option-dish-name">{option.dish}</h4>
                                                <p className="option-res-name">{option.name || option.restaurantName}</p>
                                                
                                                <div className="option-footer">
                                                    <span className="option-price">{option.price?.toLocaleString()}đ</span>
                                                    <div className="option-address">
                                                        <MapPin size={12} />
                                                        <span className="address-text">{option.address}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="option-hover-hint">Chọn món này</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-options">
                                        <p>Không tìm thấy món ăn nào khác phù hợp trong khu vực này.</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Hộp thoại xác nhận đổi món */}
                {confirmingOption && (
                    <div className="confirm-overlay">
                        <div className="confirm-card">
                            <div className="confirm-icon-wrapper">
                                <AlertCircle size={32} color="#ff6b00" />
                            </div>
                            <h3>Xác nhận đổi món?</h3>
                            <p>
                                Bạn có chắc chắn muốn đổi <strong>{currentMealName}</strong> thành <strong>{confirmingOption.dish}</strong> tại <strong>{confirmingOption.name || confirmingOption.restaurantName}</strong> không?
                            </p>
                            <div className="confirm-actions">
                                <button className="cancel-btn" onClick={() => setConfirmingOption(null)}>Hủy</button>
                                <button className="confirm-btn" onClick={() => {
                                    onSelect(confirmingOption);
                                    setConfirmingOption(null);
                                }}>
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

export default SwapMealModal;
