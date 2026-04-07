import { useState } from 'react';
import MealCard from '../MealCard/MealCard';
import './DailyPlanView.css';
import { RefreshCcw } from 'lucide-react';

interface DailyPlanViewProps {
    planData: any[];
    startDate: string; // YYYY-MM-DD
    onRegenerate: () => void;
}

const DailyPlanView = ({ planData, startDate, onRegenerate }: DailyPlanViewProps) => {
    const [selectedDayIndex, setSelectedDayIndex] = useState(0);

    const parseAndAddDays = (dateStr: string, days: number) => {
        // Fallback or use standard date parsing
        const d = dateStr ? new Date(dateStr) : new Date();
        d.setDate(d.getDate() + days);
        return d;
    };

    const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Lấy object của ngày đang được chọn
    const activePlanOption = planData[selectedDayIndex];

    const handleDaySelect = (index: number) => {
        setSelectedDayIndex(index);
    };

    if (!activePlanOption) return null;

    return (
        <div className="daily-plan-container">
            {/* Header: Dates Slider */}
            <div className="date-selector-container">
                 {planData.map((_, index) => {
                     const dateObj = parseAndAddDays(startDate, index);
                     const dayOfWeek = daysOfWeek[dateObj.getDay()];
                     const dateNumber = dateObj.getDate();
                     const isActive = index === selectedDayIndex;

                     return (
                         <div 
                             key={index}
                             className={`date-item ${isActive ? 'active' : ''}`}
                             onClick={() => handleDaySelect(index)}
                         >
                             <span className="day-name">{dayOfWeek}</span>
                             <span className="day-number">{dateNumber}</span>
                         </div>
                     );
                 })}
            </div>

            {/* Content Area */}
            <div className="daily-content-header">
                <h3>Hôm nay ăn gì?</h3>
                <button className="btn-regenerate" onClick={onRegenerate}>
                    <RefreshCcw size={16} /> Tạo lại
                </button>
            </div>

            <div className="meals-list">
                {activePlanOption.meals?.breakfast ? (
                    <MealCard 
                        session="SÁNG"
                        time="08:00"
                        dishInfo={activePlanOption.meals.breakfast}
                    />
                ) : (
                    <div className="empty-meal">Chưa có dữ liệu bữa sáng</div>
                )}

                {activePlanOption.meals?.lunch ? (
                    <MealCard 
                        session="TRƯA"
                        time="12:30"
                        dishInfo={activePlanOption.meals.lunch}
                    />
                ) : (
                    <div className="empty-meal">Chưa có dữ liệu bữa trưa</div>
                )}

                {activePlanOption.meals?.dinner ? (
                    <MealCard 
                        session="TỐI"
                        time="19:00"
                        dishInfo={activePlanOption.meals.dinner}
                    />
                ) : (
                    <div className="empty-meal">Chưa có dữ liệu bữa tối</div>
                )}
            </div>

        </div>
    );
};

export default DailyPlanView;
