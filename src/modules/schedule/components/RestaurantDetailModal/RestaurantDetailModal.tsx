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

    // ==========================================
    // SIDE EFFECT: XỬ LÝ THANH CUỘN (SCROLL)
    // ==========================================
    // Khi Modal được mở (isOpen = true), ta sẽ ép `overflow = hidden` vào thuộc tính CSS của thẻ <body>.
    // Điều này khóa cứng màn hình nền màu tối lại, người dùng cuộn chuột sẽ chỉ cuộn bên trong Modal này,
    // chứ không bị trượt cả trang chủ (SchedulePage) ở đằng sau xuống dưới.
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            // Khi đóng Modal, phải trả lại quyền cuộn cho <body> và reset lại trạng thái xác nhận món
            document.body.style.overflow = 'unset';
            setConfirmingDish(null);
        }
        // Cleanup function: Dự phòng lỡ Component chết đột ngột (unmount) thì màn hình không bị khóa vĩnh viễn
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !dishInfo) return null;

    // ==========================================
    // NGHIỆP VỤ: ĐỔI MÓN (THAY THẾ LỊCH TRÌNH 1 MÓN CỤ THỂ)
    // ==========================================

    // Xảy ra khi người dùng bấm vào 1 dòng trong "Thực đơn" của quán
    const handleItemClick = (item: any) => {
        // Logic tối ưu: Nếu người dùng lỡ tay bấm lại vào đúng cái món đang có sẵn trong lịch trình
        // thì return tĩnh luỗn (không làm gì cả để tránh gọi API dư thừa).
        if (item.name === dishInfo.dish) return;

        // Kích hoạt một Layer (Overlay) chui ra bắt người dùng XÁC NHẬN "Có chắc chắn muốn thay đổi không?"
        setConfirmingDish(item);
    };

    // Hàm gọi khi bấm Nút Đồng Ý trong hộp thoại xác nhận (Overlay)
    const handleConfirm = () => {
        if (confirmingDish) {
            // Bắn tín hiệu + Gửi object Món mới (confirmingDish) ngược lên Component Cha (DailyPlanView)
            // thông qua Callback function `onDishSelect` (Props).
            // Component Cha nhận được -> Tự update lại cục State planData tổng.
            onDishSelect?.(confirmingDish);

            // Đóng tất cả mọi thứ đi cho gọn
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
                            <span>
                                Giờ mở cửa: {
                                    typeof dishInfo.openingHours === 'object' 
                                        ? `${dishInfo.openingHours.open} - ${dishInfo.openingHours.close}`
                                        : (dishInfo.openingHours || '07:00 - 22:00')
                                }
                            </span>
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
                                                {/* Thumbnail món ăn trong menu */}
                                                <div className="menu-item-img">
                                                    {item.imageUrl ? (
                                                        <img src={item.imageUrl} alt={item.name} />
                                                    ) : (
                                                        <UtensilsCrossed size={14} className="text-neutral-300" />
                                                    )}
                                                </div>
                                                <div className="menu-item-info">
                                                    <span className="menu-item-name">{item.name}</span>
                                                    {isCurrent && <span className="current-badge">Đang chọn</span>}
                                                </div>
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
