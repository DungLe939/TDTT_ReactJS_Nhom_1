import { X, Clock, Coffee, Check } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { scheduleService } from '../../../../services/api';
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

    // State lưu trữ khoảng cách thực tế { [restaurantId]: { distance, isReal } }
    const [realDistancesMap, setRealDistancesMap] = useState<Record<string, { distance: number, isReal: boolean }>>({});
    const [isCalculating, setIsCalculating] = useState(false);

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
    useEffect(() => {
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
                { time: activePlan.meals.lunch?.time || "12:30", loc: activePlan.meals.lunch?.location },
                { time: activePlan.meals.dinner?.time || "19:00", loc: activePlan.meals.dinner?.location }
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

        snackCandidates.forEach(res => {
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
                const distHaversine = refLocation 
                    ? calculateDistance(refLocation.lat, refLocation.lng, res.location.coordinates[1], res.location.coordinates[0])
                    : 0;

                res.snacks.forEach((s: any) => {
                    if (s.category === selectedCategory) {
                        allResults.push({
                            ...s,
                            restaurantId: res.restaurantId,
                            restaurantName: res.restaurantName,
                            location: res.location,
                            openingHours: res.openingHours,
                            distance: distHaversine
                        });
                    }
                });
            }
        });

        // --- Logic Rút gọn & Chọn quán "Vô địch" ---
        const dishGroups: Record<string, any[]> = {};
        allResults.forEach(item => {
            if (!dishGroups[item.name]) dishGroups[item.name] = [];
            dishGroups[item.name].push(item);
        });

        const winners: any[] = [];
        Object.keys(dishGroups).forEach(dishName => {
            const group = dishGroups[dishName];
            
            let winner = group[0];
            group.forEach(item => {
                const itemDist = realDistancesMap[item.restaurantId]?.distance || item.distance;
                const winnerDist = realDistancesMap[winner.restaurantId]?.distance || winner.distance;
                
                if (itemDist < winnerDist) {
                    winner = item;
                }
            });

            winners.push({
                ...winner,
                displayDistance: realDistancesMap[winner.restaurantId]?.distance || winner.distance,
                isRealDistance: realDistancesMap[winner.restaurantId]?.isReal || false
            });
        });

        return winners.sort((a, b) => a.displayDistance - b.displayDistance);
    }, [selectedCategory, selectedTime, snackCandidates, activePlan, userLocation, realDistancesMap]);

    // Side effect: Lấy vị trí GPS
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

    // Side effect: Tính toán khoảng cách thực tế (OSRM) cho Top các quán tiềm năng
    useEffect(() => {
        if (!isOpen || !selectedCategory || !selectedTime) return;

        const fetchRealRoutes = async () => {
            let refLoc = userLocation;
            if (activePlan?.meals) {
                const meals = [
                    { time: activePlan.meals.breakfast?.time || "00:00", loc: activePlan.meals.breakfast?.location },
                    { time: activePlan.meals.lunch?.time || "12:30", loc: activePlan.meals.lunch?.location },
                    { time: activePlan.meals.dinner?.time || "19:00", loc: activePlan.meals.dinner?.location }
                ].filter(m => m.loc);
                meals.sort((a, b) => a.time.localeCompare(b.time));
                const prevMeal = [...meals].reverse().find(m => m.time < selectedTime);
                if (prevMeal) refLoc = { lat: prevMeal.loc.coordinates[1], lng: prevMeal.loc.coordinates[0] };
            }

            if (!refLoc) return;

            const dishGroups: Record<string, any[]> = {};
            snackCandidates.forEach(res => {
                res.snacks.forEach((s: any) => {
                    if (s.category === selectedCategory) {
                        if (!dishGroups[s.name]) dishGroups[s.name] = [];
                        const d = calculateDistance(refLoc!.lat, refLoc!.lng, res.location.coordinates[1], res.location.coordinates[0]);
                        dishGroups[s.name].push({ resId: res.restaurantId, loc: res.location, dist: d });
                    }
                });
            });

            const candidatesToVerify: any[] = [];
            const sortedDishNames = Object.keys(dishGroups).sort((a, b) => {
                const minA = Math.min(...dishGroups[a].map(x => x.dist));
                const minB = Math.min(...dishGroups[b].map(x => x.dist));
                return minA - minB;
            }).slice(0, 10);

            sortedDishNames.forEach(name => {
                const top3ForDish = dishGroups[name].sort((a, b) => a.dist - b.dist).slice(0, 3);
                candidatesToVerify.push(...top3ForDish);
            });

            setIsCalculating(true);
            const resultsMap = { ...realDistancesMap };
            
            const uniqueCandidates = Array.from(new Set(candidatesToVerify.map(c => c.resId)))
                .map(id => candidatesToVerify.find(c => c.resId === id))
                .filter(c => !realDistancesMap[c!.resId]);

            await Promise.all(uniqueCandidates.slice(0, 15).map(async (c) => {
                if (!c) return;
                try {
                    const route = await scheduleService.getRoute({
                        userLat: refLoc!.lat,
                        userLng: refLoc!.lng,
                        destLat: c.loc.coordinates[1],
                        destLng: c.loc.coordinates[0]
                    });
                    if (route.success) {
                        resultsMap[c.resId] = { distance: route.distance, isReal: true };
                    }
                } catch (e) {
                    console.error("Lỗi lấy route thực tế:", e);
                }
            }));

            setRealDistancesMap(resultsMap);
            setIsCalculating(false);
        };

        fetchRealRoutes();
    }, [selectedCategory, selectedTime, isOpen, userLocation, activePlan, snackCandidates]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (selectedSnack) {
            onAdd({
                ...selectedSnack,
                time: selectedTime,
                type: 'snack',
                id: selectedSnack.restaurantId,
                name: selectedSnack.restaurantName,
                dish: selectedSnack.name
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
                        <p>Chọn khung giờ và món ăn vặt yêu thích của bạn</p>
                    </div>
                </div>

                <div className="snack-modal-body">
                    {locationWarning && (
                        <div className="location-warning">
                            📍 Để tìm quán gần bạn nhất, vui lòng bật GPS và cho phép truy cập vị trí nhé!
                        </div>
                    )}

                    {isCalculating && <div className="calculating-overlay">Đang tối ưu đường đi...</div>}

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
