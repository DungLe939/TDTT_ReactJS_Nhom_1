import { X, Clock, Coffee, Check, Loader2 } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { scheduleService } from '../../../../services/api';
import './AddSnackModal.css';

interface AddSnackModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (snack: any) => void;
    activePlan: any;
}

// Hàm tính khoảng cách Haversine (tính bằng mét).
// Dùng để tính khoảng cách đường chim bay giữa 2 điểm GPS trên Frontend mà không cần gọi API.
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3;
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

// Khung giờ gợi ý cho bữa ăn phụ
const TIME_SLOTS = [
    '08:00', '09:00', '09:30', '10:00', '10:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '20:30', '21:00', '21:30', '22:00'
];

const AddSnackModal = ({ isOpen, onClose, onAdd, activePlan }: AddSnackModalProps) => {
    const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[5]); // Default 14:00
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [locationWarning, setLocationWarning] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSnack, setSelectedSnack] = useState<any | null>(null);

    // State lưu trữ dữ liệu quán ăn từ API (tất cả, không lọc isSnack)
    const [allCandidates, setAllCandidates] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // State cho khoảng cách đường thực tế
    const [realDistancesMap, setRealDistancesMap] = useState<Record<string, { distance: number, isReal: boolean, isFailed?: boolean }>>({});
    const [isCalculating, setIsCalculating] = useState(false);

    // 1. KHI MODAL MỞ: Gọi API lấy tất cả món ăn từ backend
    useEffect(() => {
        if (!isOpen) return;

        const loadAllDishes = async () => {
            setIsLoadingData(true);
            setAllCandidates([]);
            setSelectedCategory(null);
            setSelectedSnack(null);
            setRealDistancesMap({});
            try {
                const res = await scheduleService.getAllDishes();
                if (res?.success && res?.data) {
                    setAllCandidates(res.data);
                }
            } catch (e) {
                console.error('Lỗi khi tải danh sách món ăn:', e);
            } finally {
                setIsLoadingData(false);
            }
        };

        loadAllDishes();
    }, [isOpen]);

    // 2. LẤY DANH SÁCH CATEGORY từ tất cả món ăn trong allCandidates
    const categories = useMemo(() => {
        const cats = new Set<string>();
        allCandidates.forEach(res => {
            (res.menu || []).forEach((item: any) => {
                if (item.category && item.category !== 'Khác') cats.add(item.category);
            });
        });
        // Thêm "Khác" cuối cùng nếu có
        allCandidates.forEach(res => {
            (res.menu || []).forEach((item: any) => {
                if (item.category === 'Khác') cats.add('Khác');
            });
        });
        return Array.from(cats);
    }, [allCandidates]);

    // Tự động chọn category đầu tiên sau khi load
    useEffect(() => {
        if (!selectedCategory && categories.length > 0) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory]);

    // 3. LẤY VỊ TRÍ GPS của user
    useEffect(() => {
        if (isOpen && !userLocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    setLocationWarning(false);
                },
                () => setLocationWarning(true)
            );
        }
    }, [isOpen, userLocation]);

    // 4. TÍNH TOÁN DANH SÁCH MÓN ĐƯỢC LỌC (theo category + giờ mở cửa + khoảng cách)
    const filteredSnacks = useMemo(() => {
        if (!selectedCategory || !selectedTime || allCandidates.length === 0) return [];

        // Tìm vị trí tham chiếu (bữa ăn chính trước đó hoặc GPS của user)
        let refLocation = userLocation;
        if (activePlan?.meals) {
            const meals = [
                { time: activePlan.meals.breakfast?.time || '00:00', loc: activePlan.meals.breakfast?.location },
                { time: activePlan.meals.lunch?.time || '12:30', loc: activePlan.meals.lunch?.location },
                { time: activePlan.meals.dinner?.time || '19:00', loc: activePlan.meals.dinner?.location }
            ].filter(m => m.loc);
            meals.sort((a, b) => a.time.localeCompare(b.time));
            const prevMeal = [...meals].reverse().find(m => m.time < selectedTime);
            if (prevMeal) {
                refLocation = {
                    lat: prevMeal.loc.coordinates[1],
                    lng: prevMeal.loc.coordinates[0]
                };
            }
        }

        const allResults: any[] = [];
        const [h, m] = selectedTime.split(':').map(Number);
        const selectedMinutes = h * 60 + m;

        allCandidates.forEach(res => {
            // Kiểm tra giờ mở cửa
            let isOpenNow = true;
            if (res.openingHours) {
                let start: string | undefined, end: string | undefined;
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

            if (!isOpenNow) return;

            const distHaversine = refLocation && res.location?.coordinates
                ? calculateDistance(refLocation.lat, refLocation.lng, res.location.coordinates[1], res.location.coordinates[0])
                : 0;

            // Lọc theo category đã chọn
            (res.menu || []).forEach((item: any) => {
                if (item.category === selectedCategory) {
                    allResults.push({
                        ...item,
                        restaurantId: res.restaurantId,
                        restaurantName: res.restaurantName,
                        address: res.address || 'Địa chỉ đang cập nhật',
                        rating: res.rating || 4.2,
                        priceRange: res.priceRange || 2,
                        location: res.location,
                        openingHours: res.openingHours,
                        distance: distHaversine
                    });
                }
            });
        });

        // Chọn quán gần nhất cho mỗi tên món (tránh trùng lặp)
        const dishGroups: Record<string, any[]> = {};
        allResults.forEach(item => {
            if (!dishGroups[item.name]) dishGroups[item.name] = [];
            dishGroups[item.name].push(item);
        });

        const winners: any[] = [];
        Object.keys(dishGroups).forEach(dishName => {
            const group = dishGroups[dishName];
            let validGroup = group.filter(item => !realDistancesMap[item.restaurantId]?.isFailed);
            if (validGroup.length === 0) return;

            let winner = validGroup[0];
            validGroup.forEach(item => {
                const itemDist = realDistancesMap[item.restaurantId]?.distance ?? item.distance;
                const winnerDist = realDistancesMap[winner.restaurantId]?.distance ?? winner.distance;
                if (itemDist < winnerDist) winner = item;
            });

            winners.push({
                ...winner,
                displayDistance: realDistancesMap[winner.restaurantId]?.distance ?? winner.distance,
                isRealDistance: realDistancesMap[winner.restaurantId]?.isReal || false
            });
        });

        return winners.sort((a, b) => a.displayDistance - b.displayDistance);
    }, [selectedCategory, selectedTime, allCandidates, activePlan, userLocation, realDistancesMap]);

    // 5. GỌI API ĐO ĐƯỜNG THỰC TẾ (OSRM) cho các quán gần nhất
    useEffect(() => {
        if (!isOpen || !selectedCategory || !selectedTime || allCandidates.length === 0) return;

        const fetchRealRoutes = async () => {
            let refLoc = userLocation;
            if (activePlan?.meals) {
                const meals = [
                    { time: activePlan.meals.breakfast?.time || '00:00', loc: activePlan.meals.breakfast?.location },
                    { time: activePlan.meals.lunch?.time || '12:30', loc: activePlan.meals.lunch?.location },
                    { time: activePlan.meals.dinner?.time || '19:00', loc: activePlan.meals.dinner?.location }
                ].filter(m => m.loc);
                meals.sort((a, b) => a.time.localeCompare(b.time));
                const prevMeal = [...meals].reverse().find(m => m.time < selectedTime);
                if (prevMeal) refLoc = { lat: prevMeal.loc.coordinates[1], lng: prevMeal.loc.coordinates[0] };
            }
            if (!refLoc) return;

            // Tìm top 10 quán gần nhất (theo Haversine) trong category đang chọn
            const candidatesMap: Record<string, { resId: string, loc: any, dist: number }> = {};
            allCandidates.forEach(res => {
                if (!res.location?.coordinates) return;
                const hasCategory = (res.menu || []).some((item: any) => item.category === selectedCategory);
                if (!hasCategory) return;
                const d = calculateDistance(refLoc!.lat, refLoc!.lng, res.location.coordinates[1], res.location.coordinates[0]);
                candidatesMap[res.restaurantId] = { resId: res.restaurantId, loc: res.location, dist: d };
            });

            const topCandidates = Object.values(candidatesMap)
                .sort((a, b) => a.dist - b.dist)
                .slice(0, 10)
                .filter(c => !realDistancesMap[c.resId]);

            if (topCandidates.length === 0) return;

            setIsCalculating(true);
            const resultsMap = { ...realDistancesMap };

            const getRouteWithRetry = async (candidate: any, retries = 2) => {
                for (let i = 0; i <= retries; i++) {
                    try {
                        const route = await scheduleService.getRoute({
                            userLat: refLoc!.lat,
                            userLng: refLoc!.lng,
                            destLat: candidate.loc.coordinates[1],
                            destLng: candidate.loc.coordinates[0]
                        });
                        if (route.success) return route;
                    } catch (e) {
                        if (i === retries) throw e;
                        await new Promise(resolve => setTimeout(resolve, 500 * (i + 1)));
                    }
                }
                return null;
            };

            await Promise.all(topCandidates.map(async (c) => {
                try {
                    const route = await getRouteWithRetry(c);
                    if (route?.success) {
                        resultsMap[c.resId] = { distance: route.distance, isReal: true };
                    } else {
                        resultsMap[c.resId] = { distance: 0, isReal: true, isFailed: true } as any;
                    }
                } catch (e) {
                    console.error('Lỗi lấy route thực tế:', e);
                    resultsMap[c.resId] = { distance: 0, isReal: true, isFailed: true } as any;
                }
            }));

            setRealDistancesMap(resultsMap);
            setIsCalculating(false);
        };

        fetchRealRoutes();
    }, [selectedCategory, selectedTime, isOpen, userLocation, activePlan, allCandidates]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedSnack) {
            onAdd({
                ...selectedSnack,
                time: selectedTime,
                type: 'snack',
                id: selectedSnack.restaurantId,
                name: selectedSnack.restaurantName,
                dish: selectedSnack.name,
                img: selectedSnack.imageUrl
            });
            onClose();
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
                        <p>Chọn khung giờ và món ăn yêu thích của bạn</p>
                    </div>
                </div>

                <div className="snack-modal-body">
                    {locationWarning && (
                        <div className="location-warning">
                            📍 Để tìm quán gần bạn nhất, vui lòng bật GPS và cho phép truy cập vị trí nhé!
                        </div>
                    )}

                    {/* Loading khi đang tải dữ liệu từ API */}
                    {isLoadingData && (
                        <div className="calculating-overlay" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Loader2 size={16} className="animate-spin" />
                            Đang tải danh sách món ăn...
                        </div>
                    )}

                    {isCalculating && !isLoadingData && (
                        <div className="calculating-overlay">Đang tối ưu đường đi...</div>
                    )}

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

                    <div className="snack-form-section">
                        <label>Chọn danh mục ({categories.length} nhóm)</label>
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
                                        <div className="snack-item-img">
                                            {s.imageUrl ? (
                                                <img src={s.imageUrl} alt={s.name} />
                                            ) : (
                                                <Coffee size={28} color="#c8c8d0" />
                                            )}
                                        </div>
                                        <div className="snack-item-body">
                                            <div className="snack-item-info">
                                                <div className="snack-item-name">{s.name}</div>
                                                <div className="snack-item-res">
                                                    {s.restaurantName}
                                                    {s.displayDistance > 0 && (
                                                        <span className="distance-tag">
                                                            • {s.isRealDistance ? '🚗' : '📍'} {s.displayDistance > 1000 ? (s.displayDistance / 1000).toFixed(1) + 'km' : Math.round(s.displayDistance) + 'm'}
                                                        </span>
                                                    )}
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
                                    </div>
                                ))
                            ) : (
                                <div className="no-snacks">
                                    {isLoadingData ? 'Đang tải...' : 'Không có món ăn nào phù hợp với khung giờ này.'}
                                </div>
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
