import { X, Clock, Coffee, Check } from 'lucide-react';
import { useState, useMemo } from 'react';
import './AddSnackModal.css';

interface AddSnackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (snack: any) => void;
    snackCandidates: any[]; // Từ API Backend
    activePlan: any;
}

// Hàm tính khoảng cách Haversine (mét)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Bán kính Trái đất tính bằng mét
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

const TIME_SLOTS = [
    '08:00', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '20:30', '21:00', '21:30', '22:00'
];

const AddSnackModal = ({ isOpen, onClose, onAdd, snackCandidates, activePlan }: AddSnackModalProps) => {
    const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[5]); // Default 14:00
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationWarning, setLocationWarning] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSnack, setSelectedSnack] = useState<any | null>(null);

    // 1. Lấy danh sách Categories duy nhất
    const categories = useMemo(() => {
        const cats = new Set<string>();
        snackCandidates.forEach(res => {
            res.snacks.forEach((s: any) => {
                if (s.category) cats.add(s.category);
            });
        });
        return Array.from(cats);
    }, [snackCandidates]);

    // Khởi tạo category mặc định nếu chưa có
    useMemo(() => {
        if (!selectedCategory && categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory]);

    // 2. Lọc danh sách món ăn dựa trên Category, Giờ và Tính khoảng cách
    const filteredSnacks = useMemo(() => {
        if (!selectedCategory || !selectedTime) return [];

        // Tìm vị trí tham chiếu (bữa ăn chính trước đó hoặc GPS)
        let refLocation = userLocation;
        if (activePlan?.meals) {
            const meals = [
                { time: activePlan.meals.breakfast?.time || "00:00", loc: activePlan.meals.breakfast?.location },
                { time: activePlan.meals.lunch?.time || "00:00", loc: activePlan.meals.lunch?.location },
                { time: activePlan.meals.dinner?.time || "00:00", loc: activePlan.meals.dinner?.location }
            ].filter(m => m.loc);

            // Sắp xếp các bữa chính theo thời gian
            meals.sort((a, b) => a.time.localeCompare(b.time));

            // Tìm bữa chính cuối cùng diễn ra TRƯỚC selectedTime
            const prevMeal = [...meals].reverse().find(m => m.time < selectedTime);
            if (prevMeal) {
                refLocation = {
                    lat: prevMeal.loc.coordinates[1],
                    lng: prevMeal.loc.coordinates[0]
                };
            }
        }

        const results: any[] = [];
        const [h, m] = selectedTime.split(':').map(Number);
        const selectedMinutes = h * 60 + m;

        snackCandidates.forEach(res => {
            // Kiểm tra giờ hoạt động
            let isOpenNow = true;
            if (res.openingHours) {
                let start, end;
                if (typeof res.openingHours === 'string' && res.openingHours.includes('-')) {
                    [start, end] = res.openingHours.split('-');
                } else if (typeof res.openingHours === 'object' && res.openingHours.open && res.openingHours.close) {
                    start = res.openingHours.open;
                    end = res.openingHours.close;
                }

                if (start && end) {
                    const [sh, sm] = start.split(':').map(Number);
                    const [eh, em] = end.split(':').map(Number);
                    const startMins = sh * 60 + sm;
                    const endMins = eh * 60 + em;

                    if (endMins < startMins) {
                        isOpenNow = selectedMinutes >= startMins || selectedMinutes <= endMins;
                    } else {
                        isOpenNow = selectedMinutes >= startMins && selectedMinutes <= endMins;
                    }
                }
            }

            if (isOpenNow) {
                // Tính khoảng cách
                let distance = 0;
                if (refLocation && res.location) {
                    distance = calculateDistance(
                        refLocation.lat, refLocation.lng,
                        res.location.coordinates[1], res.location.coordinates[0]
                    );
                }

                res.snacks.forEach((s: any) => {
                    if (s.category === selectedCategory) {
                        results.push({
                            ...s,
                            restaurantId: res.restaurantId,
                            restaurantName: res.restaurantName,
                            location: res.location,
                            openingHours: res.openingHours,
                            distance: distance // Thêm thông tin khoảng cách
                        });
                    }
                });
            }
        });

        // --- Logic Rút gọn (Deduplication) ---
        const deduplicated: Record<string, any> = {};
        results.forEach(item => {
            // Nếu món chưa có hoặc tìm thấy quán cung cấp cùng món đó nhưng Ở GẦN HƠN
            if (!deduplicated[item.name] || item.distance < deduplicated[item.name].distance) {
                deduplicated[item.name] = item;
            }
        });

        // Chuyển kết quả về dạng Array và Sắp xếp
        return Object.values(deduplicated).sort((a, b) => {
            // Ưu tiên các món có khoảng cách thực tế gần (trọng số cao)
            const scoreA = (a.score || 50) - (a.distance / 100);
            const scoreB = (b.score || 50) - (b.distance / 100);
            return scoreB - scoreA;
        });
    }, [selectedCategory, selectedTime, snackCandidates, activePlan, userLocation]);

    // Lấy vị trí GPS khi cần thiết
    useMemo(() => {
        if (!userLocation && isOpen) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocationWarning(false);
                },
                () => {
                    setLocationWarning(true);
                }
            );
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedSnack) {
            onAdd({
                ...selectedSnack,
                time: selectedTime,
                type: 'snack',
                id: selectedSnack.restaurantId, // Đồng bộ key với MealCard
                name: selectedSnack.restaurantName,
                dish: selectedSnack.name
            });
            onClose();
            // Reset state
            setSelectedSnack(null);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="snack-modal-container">
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="snack-modal-header">
                    <div className="header-icon">
                        <Coffee size={24} />
                    </div>
                    <div>
                        <h2>Thêm bữa ăn phụ</h2>
                        <p>Chọn khung giờ và món ăn vặt yêu thích của bạn</p>
                    </div>
                </div>

                <div className="snack-modal-body">
                    {/* GPS Warning */}
                    {locationWarning && (
                        <div className="location-warning">
                            📍 Để tìm quán gần bạn nhất, vui lòng bật GPS và cho phép truy cập vị trí nhé!
                        </div>
                    )}

                    {/* Time Picker */}
                    <div className="snack-form-section">
                        <label><Clock size={16} /> Chọn khung giờ</label>
                        <div className="time-grid">
                            {TIME_SLOTS.map(t => (
                                <button
                                    key={t}
                                    className={`time-chip ${selectedTime === t ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedTime(t);
                                        setSelectedSnack(null);
                                    }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Category Picker */}
                    <div className="snack-form-section">
                        <label>Chọn danh mục</label>
                        <div className="category-scroll">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
                                    onClick={() => {
                                        setSelectedCategory(cat);
                                        setSelectedSnack(null);
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Snack List */}
                    <div className="snack-form-section">
                        <label>Chọn món ăn ({filteredSnacks.length})</label>
                        <div className="snack-list-container">
                            {filteredSnacks.length > 0 ? (
                                filteredSnacks.map((s, idx) => (
                                    <div
                                        key={`${s.restaurantId}-${idx}`}
                                        className={`snack-item-card ${selectedSnack?.name === s.name && selectedSnack?.restaurantId === s.restaurantId ? 'selected' : ''}`}
                                        onClick={() => setSelectedSnack(s)}
                                    >
                                        <div className="snack-item-info">
                                            <div className="snack-item-name">{s.name}</div>
                                            <div className="snack-item-res">
                                                {s.restaurantName} 
                                                {s.distance > 0 && ` • Cách ${s.distance > 1000 ? (s.distance / 1000).toFixed(1) + 'km' : Math.round(s.distance) + 'm'}`}
                                            </div>
                                        </div>
                                        <div className="snack-item-right">
                                            <div className="snack-item-price">
                                                {typeof s.price === 'number' ? s.price.toLocaleString() : s.price}đ
                                            </div>
                                            {selectedSnack?.name === s.name && selectedSnack?.restaurantId === s.restaurantId && (
                                                <div className="selected-badge"><Check size={14} /></div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-snacks">Không có món ăn nào phù hợp với khung giờ này.</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="snack-modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Hủy bỏ</button>
                    <button
                        className="btn-confirm"
                        disabled={!selectedSnack}
                        onClick={handleConfirm}
                    >
                        Thêm vào lộ trình
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddSnackModal;
