import { useState } from 'react';
import MealCard from '../MealCard/MealCard';
import MapModal from '../MapModal/MapModal';
import RestaurantDetailModal from '../RestaurantDetailModal/RestaurantDetailModal';
import CostSummary from '../CostSummary/CostSummary';
import './DailyPlanView.css';
import { RefreshCcw, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';

interface DailyPlanViewProps {
    planData: any[];
    startDate: string; // YYYY-MM-DD
    scheduleInfo: any;
    onRegenerate: () => void;
    onUpdatePlan?: (newPlan: any[]) => void;
}

const DailyPlanView = ({ planData, startDate, scheduleInfo, onRegenerate, onUpdatePlan }: DailyPlanViewProps) => {
    // startDate là ngày bắt đầu chuyến đi (VD: "2024-04-12")
    const tripStart = new Date(startDate);
    const [selectedDayISO, setSelectedDayISO] = useState(startDate);
    
    // Tính toán chi phí
    const calculateCosts = () => {
        let grandTotal = 0;
        planData.forEach(day => {
            if (day.meals) {
                Object.values(day.meals).forEach((meal: any) => {
                    grandTotal += (meal.price || 0);
                });
            }
        });

        let dayTotal = 0;
        const current = new Date(selectedDayISO);
        const start = new Date(startDate);
        const diffDays = Math.round((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        const activeDayPlan = planData.find(p => p.day === diffDays + 1);

        if (activeDayPlan?.meals) {
            Object.values(activeDayPlan.meals).forEach((meal: any) => {
                dayTotal += (meal.price || 0);
            });
        }

        return { dayTotal, grandTotal };
    };

    const { dayTotal, grandTotal } = calculateCosts();
    const dailyTarget = (scheduleInfo?.totalBudget > 0) ? (scheduleInfo.totalBudget / (scheduleInfo.days || 1)) : 0;
    
    // State cho Bản đồ
    const [mapOpen, setMapOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState<any>(null);

    // State cho Chi tiết nhà hàng
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedDetailDish, setSelectedDetailDish] = useState<any>(null);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);

    // State cho Thống kê chi phí
    const [showCostSummary, setShowCostSummary] = useState(false);

    // Tính toán ngày thứ Hai của tuần chứa startDate
    const getMonday = (d: Date) => {
        const date = new Date(d);
        const day = date.getDay(); // 0: CN, 1: T2...
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

    // Tìm dữ liệu kế hoạch cho ngày đang chọn
    const getActivePlan = () => {
        const current = new Date(selectedDayISO);
        const start = new Date(startDate);
        const diffTime = current.getTime() - start.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
        
        return planData.find(p => p.day === diffDays + 1);
    };

    const activePlan = getActivePlan();

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

    return (
        <div className="daily-plan-container">
            {/* Header: Dates Slider (7 days) */}
            <div className="date-selector-container">
                 {weekDays.map((dateObj, index) => {
                     const iso = dateObj.toISOString().split('T')[0];
                     const dayName = daysOfWeekNames[dateObj.getDay()];
                     const dateNumber = dateObj.getDate();
                     
                     const isActive = iso === selectedDayISO;
                     
                     // Kiểm tra xem ngày này có nằm trong lịch trình không
                     const diffDays = Math.round((dateObj.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24));
                     const isScheduled = diffDays >= 0 && diffDays < planData.length;

                     return (
                         <div 
                             key={index}
                             className={`date-item ${isActive ? 'active' : ''} ${isScheduled && !isActive ? 'scheduled' : ''} ${!isScheduled ? 'disabled' : ''}`}
                             onClick={() => isScheduled && handleDaySelect(dateObj)}
                             title={!isScheduled ? "Ngày này không nằm trong lịch trình" : ""}
                         >
                             <span className="day-name">{dayName}</span>
                             <span className="day-number">{dateNumber}</span>
                         </div>
                     );
                 })}
            </div>

            {/* Nút toggle thống kê chi phí */}
            <div 
                className={`cost-summary-toggle ${showCostSummary ? 'active' : ''}`} 
                onClick={() => setShowCostSummary(!showCostSummary)}
            >
                <div className="toggle-label">
                    <BarChart3 size={18} />
                    <span>Thống kê chi phí</span>
                </div>
                {showCostSummary ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>

            {/* Thống kê chi phí (Chỉ hiển thị khi toggle) */}
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
                <button className="btn-regenerate" onClick={onRegenerate}>
                    <RefreshCcw size={16} /> Tạo lại
                </button>
            </div>

            <div className="meals-list">
                {activePlan?.meals?.breakfast ? (
                    <MealCard 
                        session="SÁNG"
                        time={activePlan.meals.breakfast.time}
                        dishInfo={activePlan.meals.breakfast}
                        onShowMap={handleShowMap}
                        onShowDetail={(dish) => handleShowDetail(dish, 'SÁNG')}
                    />
                ) : (
                    <div className="empty-meal">Chưa có dữ liệu bữa sáng cho ngày này</div>
                )}

                {activePlan?.meals?.lunch ? (
                    <MealCard 
                        session="TRƯA"
                        time={activePlan.meals.lunch.time}
                        dishInfo={activePlan.meals.lunch}
                        onShowMap={handleShowMap}
                        onShowDetail={(dish) => handleShowDetail(dish, 'TRƯA')}
                    />
                ) : (
                    <div className="empty-meal">Chưa có dữ liệu bữa trưa cho ngày này</div>
                )}

                {activePlan?.meals?.dinner ? (
                    <MealCard 
                        session="TỐI"
                        time={activePlan.meals.dinner.time}
                        dishInfo={activePlan.meals.dinner}
                        onShowMap={handleShowMap}
                        onShowDetail={(dish) => handleShowDetail(dish, 'TỐI')}
                    />
                ) : (
                    <div className="empty-meal">Chưa có dữ liệu bữa tối cho ngày này</div>
                )}
            </div>

            {/* Modal hiển thị bản đồ */}
            <MapModal 
                isOpen={mapOpen} 
                onClose={() => setMapOpen(false)} 
                dishInfo={selectedDish} 
            />

            {/* Modal hiển thị chi tiết nhà hàng */}
            <RestaurantDetailModal 
                isOpen={detailOpen} 
                onClose={() => setDetailOpen(false)} 
                dishInfo={selectedDetailDish} 
                onDishSelect={handleDishSelect}
            />

        </div>
    );
};

export default DailyPlanView;
