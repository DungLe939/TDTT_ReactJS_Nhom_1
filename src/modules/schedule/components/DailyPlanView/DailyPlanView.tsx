import { useState } from 'react';
import MealCard from '../MealCard/MealCard';
import MapModal from '../MapModal/MapModal';
import RestaurantDetailModal from '../RestaurantDetailModal/RestaurantDetailModal';
import SwapMealModal from '../SwapMealModal/SwapMealModal';
import CostSummary from '../CostSummary/CostSummary';
import AddSnackModal from '../AddSnackModal/AddSnackModal';
import './DailyPlanView.css';
import { RefreshCcw, BarChart3, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { scheduleService } from '../../../../services/api';

interface DailyPlanViewProps {
    planData: any[];
    startDate: string; // YYYY-MM-DD
    scheduleInfo: any;
    snackCandidates: any[];
    onRegenerate: () => void;
    onUpdatePlan?: (newPlan: any[]) => void;
}

/**
 * Component hiển thị chi tiết lịch trình của 1 ngày.
 * Nhận Props từ `SchedulePage` và vẽ ra UI chuỗi các bữa ăn (Sáng, Trưa, Tối, Phụ)
 * theo chuẩn thời gian.
 */
const DailyPlanView = ({ planData, startDate, scheduleInfo, snackCandidates, onRegenerate, onUpdatePlan }: DailyPlanViewProps) => {
    // startDate là ngày bắt đầu chuyến đi (VD: "2024-04-12")
    const tripStart = new Date(startDate);
    const [selectedDayISO, setSelectedDayISO] = useState(startDate);
    
    // Cơ chế: So sánh ngày đang chọn trên giao diện (selectedDayISO) với ngày bắt đầu (tripStart)
    // để trích xuất ra mảng bữa ăn của đúng 1 ngày cụ thể.
    const getActivePlan = () => {
        const current = new Date(selectedDayISO);
        const start = new Date(startDate);
        const diffTime = current.getTime() - start.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        return planData.find(p => p.day === diffDays + 1);
    };

    const activePlan = getActivePlan();

    // Thuật toán: Quét qua toàn bộ mảng `planData` (các ngày),
    // cộng dồn chi phí `price` của từng bữa chính (breakfast, lunch, dinner)
    // cộng dồn thêm các bữa phụ (snacks).
    // Phục vụ cho tính năng "Thống kê chi phí".
    const calculateCosts = () => {
        let grandTotal = 0;
        planData.forEach(day => {
            // Chi phí bữa chính
            if (day.meals) {
                Object.values(day.meals).forEach((meal: any) => {
                    grandTotal += (meal.price || 0);
                });
            }
            // Chi phí bữa phụ
            if (day.snacks) {
                day.snacks.forEach((snack: any) => {
                    grandTotal += (snack.price || 0);
                });
            }
        });

        let dayTotal = 0;
        if (activePlan?.meals) {
            Object.values(activePlan.meals).forEach((meal: any) => {
                dayTotal += (meal.price || 0);
            });
        }
        if (activePlan?.snacks) {
            activePlan.snacks.forEach((snack: any) => {
                dayTotal += (snack.price || 0);
            });
        }

        return { dayTotal, grandTotal };
    };

    const { dayTotal, grandTotal } = calculateCosts();
    const dailyTarget = (scheduleInfo?.totalBudget > 0) ? (scheduleInfo.totalBudget / (scheduleInfo.days || 1)) : 0;
    
    // Modal States
    const [mapOpen, setMapOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedDetailDish, setSelectedDetailDish] = useState<any>(null);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [showCostSummary, setShowCostSummary] = useState(false);
    const [snackModalOpen, setSnackModalOpen] = useState(false);

    // Swap Modal States
    const [swapModalOpen, setSwapModalOpen] = useState(false);
    const [isSwapLoading, setIsSwapLoading] = useState(false);
    const [swapOptions, setSwapOptions] = useState<any[]>([]);
    const [swapTarget, setSwapTarget] = useState<{ dayIdx: number, sessionKey: string, currentDish: string } | null>(null);

    // Helpers
    const getMonday = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay(); 
        const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
        return new Date(date.setDate(diff));
    };

    const monday = getMonday(tripStart);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return d;
    });

    const daysOfWeekNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    const handleDaySelect = (date: Date) => {
        const iso = date.toISOString().split('T')[0];
        const diffDays = Math.round((date.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24));
        const isInPlan = diffDays >= 0 && diffDays < planData.length;
        
        if (isInPlan) {
            setSelectedDayISO(iso);
        }
    };

    const handleShowMap = (dish: any) => {
        setSelectedDish(dish);
        setMapOpen(true);
    };

    const handleShowDetail = (dish: any, session: string) => {
        setSelectedDetailDish(dish);
        setSelectedSession(session);
        setDetailOpen(true);
    };

    const handleDishSelect = (newDishItem: any) => {
        if (!activePlan || !selectedSession) return;
        
        const sessionMap: Record<string, string> = {
            'SÁNG': 'breakfast',
            'TRƯA': 'lunch',
            'TỐI': 'dinner'
        };
        
        const sessionKey = sessionMap[selectedSession];
        if (!sessionKey) return;

        const newPlanData = [...planData];
        const dayIndex = newPlanData.findIndex(p => p.day === activePlan.day);
        
        if (dayIndex !== -1) {
            const currentMeal = newPlanData[dayIndex].meals[sessionKey];
            
            newPlanData[dayIndex].meals[sessionKey] = {
                ...currentMeal,
                dish: newDishItem.name,
                price: newDishItem.price
            };
            
            onUpdatePlan?.(newPlanData);
        }
    };

    const handleAddSnack = (snack: any) => {
        if (!activePlan) return;
        
        const newPlanData = [...planData];
        const dayIndex = newPlanData.findIndex(p => p.day === activePlan.day);
        
        if (dayIndex !== -1) {
            const currentSnacks = newPlanData[dayIndex].snacks || [];
            if (currentSnacks.length >= 3) {
                alert("Bạn chỉ có thể thêm tối đa 3 bữa phụ mỗi ngày!");
                return;
            }
            
            newPlanData[dayIndex].snacks = [...currentSnacks, snack];
            onUpdatePlan?.(newPlanData);
        }
    };

    /**
     * handleOpenSwap: Mở Modal đổi món ăn.
     * Gọi API backend để lấy 30 món ăn tốt nhất (đã lọc trùng) cho bữa đó.
     */
    const handleOpenSwap = async (meal: any, dayIdx: number, session: string) => {
        const sessionMap: Record<string, string> = {
            'SÁNG': 'breakfast',
            'TRƯA': 'lunch',
            'TỐI': 'dinner'
        };
        const sessionKey = sessionMap[session];
        if (!sessionKey) return;

        setSwapTarget({ dayIdx, sessionKey, currentDish: meal.dish });
        setSwapModalOpen(true);
        setIsSwapLoading(true);
        setSwapOptions([]);

        try {
            // Lấy vị trí hiện tại của user (nếu có trong Browser) để Backend tính khoảng cách chính xác hơn
            let userLat, userLng;
            // (Optional: Implement navigator.geolocation here if needed)

            const res = await scheduleService.swapOptions({
                dayIndex: dayIdx,
                mealType: sessionKey,
                userLat,
                userLng
            });

            if (res.success) {
                setSwapOptions(res.options);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đổi món:", error);
        } finally {
            setIsSwapLoading(false);
        }
    };

    /**
     * handleConfirmSelectedSwap: Thực thi việc thay đổi món ăn vào lịch trình.
     */
    const handleConfirmSelectedSwap = (newOption: any) => {
        if (!swapTarget) return;

        const { dayIdx, sessionKey } = swapTarget;
        const newPlanData = [...planData];
        
        if (newPlanData[dayIdx]) {
            // Cập nhật toàn diện metadata từ Backend (Bao gồm cả address, rating, menu...)
            newPlanData[dayIdx].meals[sessionKey] = {
                ...newOption,
                type: 'main',
                time: planData[dayIdx].meals[sessionKey].time // Giữ nguyên mốc thời gian cũ
            };
            
            onUpdatePlan?.(newPlanData);
            setSwapModalOpen(false);
        }
    };

    // Hàm trọng tâm: Gom dữ liệu Bữa chính (Object keys) và Bữa phụ (Array)
    // Trộn chúng lại thành 1 mảng duy nhất và SẮP XẾP theo thứ tự thời gian trong ngày.
    // Kết quả mảng `sortedMeals` giúp map ra UI Card từ trên xuống dưới mượt mà.
    const getSortedMeals = () => {
        if (!activePlan) return [];
        
        const meals: any[] = [];
        
        // Bữa chính
        if (activePlan.meals) {
            if (activePlan.meals.breakfast) meals.push({ ...activePlan.meals.breakfast, session: 'SÁNG', type: 'main' });
            if (activePlan.meals.lunch) meals.push({ ...activePlan.meals.lunch, session: 'TRƯA', type: 'main' });
            if (activePlan.meals.dinner) meals.push({ ...activePlan.meals.dinner, session: 'TỐI', type: 'main' });
        }
        
        // Bữa phụ
        if (activePlan.snacks) {
            activePlan.snacks.forEach((s: any) => {
                meals.push({ ...s, type: 'snack' });
            });
        }

        // Sắp xếp theo thời gian
        return meals.sort((a, b) => {
            const t1 = a.time || "00:00";
            const t2 = b.time || "00:00";
            return t1.localeCompare(t2);
        });
    };

    const sortedMeals = getSortedMeals();

    return (
        <div className="daily-plan-container">
            {/* Header: Dates Slider */}
            <div className="date-selector-container">
                 {weekDays.map((dateObj, index) => {
                     const iso = dateObj.toISOString().split('T')[0];
                     const isActive = iso === selectedDayISO;
                     const diffDays = Math.round((dateObj.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24));
                     const isScheduled = diffDays >= 0 && diffDays < planData.length;

                     return (
                         <div 
                             key={index}
                             className={`date-item ${isActive ? 'active' : ''} ${isScheduled && !isActive ? 'scheduled' : ''} ${!isScheduled ? 'disabled' : ''}`}
                             onClick={() => isScheduled && handleDaySelect(dateObj)}
                         >
                             <span className="day-name">{daysOfWeekNames[dateObj.getDay()]}</span>
                             <span className="day-number">{dateObj.getDate()}</span>
                         </div>
                     );
                 })}
            </div>

            {/* Toggle Thống kê chi phí */}
            <div className={`cost-summary-toggle ${showCostSummary ? 'active' : ''}`} onClick={() => setShowCostSummary(!showCostSummary)}>
                <div className="toggle-label"><BarChart3 size={18} /><span>Thống kê chi phí</span></div>
                {showCostSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {showCostSummary && (
                <CostSummary 
                    dayTotal={dayTotal}
                    grandTotal={grandTotal}
                    targetDailyBudget={dailyTarget}
                    totalDays={scheduleInfo.days}
                />
            )}

            {/* Content Area */}
            <div className="daily-content-header">
                <h3>Hôm nay ăn gì?</h3>
                <div className="header-actions">
                    <button className="btn-regenerate" onClick={onRegenerate}>
                        <RefreshCcw size={16} /> Tạo lại
                    </button>
                </div>
            </div>

            <div className="meals-list">
                {sortedMeals.length > 0 ? (
                    sortedMeals.map((meal, idx) => (
                        <MealCard 
                            key={`${meal.id}-${meal.time}-${idx}`}
                            session={meal.session}
                            type={meal.type}
                            time={meal.time}
                            dishInfo={meal}
                            onShowMap={handleShowMap}
                            onShowDetail={(dish) => handleShowDetail(dish, meal.session || 'PHỤ')}
                            onSwap={(dish) => handleOpenSwap(dish, planData.findIndex(p => p.day === activePlan?.day), meal.session)}
                        />
                    ))
                ) : (
                    <div className="empty-meal">Không có dữ liệu ăn uống cho ngày này</div>
                )}
            </div>

            {(activePlan?.snacks?.length || 0) < 3 && (
                <button className="btn-add-snack-bottom" onClick={() => setSnackModalOpen(true)}>
                    <Plus size={16} /> Thêm bữa ăn phụ
                </button>
            )}

            {/* Modals */}
            <MapModal isOpen={mapOpen} onClose={() => setMapOpen(false)} dishInfo={selectedDish} />
            <RestaurantDetailModal 
                isOpen={detailOpen} 
                onClose={() => setDetailOpen(false)} 
                dishInfo={selectedDetailDish} 
                onDishSelect={handleDishSelect} 
            />
            <AddSnackModal 
                isOpen={snackModalOpen} 
                onClose={() => setSnackModalOpen(false)} 
                onAdd={handleAddSnack} 
                snackCandidates={snackCandidates} 
                activePlan={activePlan}
            />

            <SwapMealModal 
                isOpen={swapModalOpen}
                onClose={() => setSwapModalOpen(false)}
                options={swapOptions}
                loading={isSwapLoading}
                onSelect={handleConfirmSelectedSwap}
                currentMealName={swapTarget?.currentDish || ""}
            />
        </div>
    );
};

export default DailyPlanView;
