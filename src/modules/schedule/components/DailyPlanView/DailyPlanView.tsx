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
    selectedDayISO: string;
    startDate: string; // Định dạng YYYY-MM-DD
    scheduleInfo: any;
    snackCandidates: any[];
    onRegenerate: () => void;
    onUpdatePlan?: (newPlan: any[]) => void;
}

/**
 * Component DailyPlanView - Hiển thị chi tiết hành trình ăn uống của một ngày cụ thể.
 * 
 * Nhiệm vụ chính:
 * 1. Lọc dữ liệu bữa ăn từ planData dựa trên ngày đang được chọn (selectedDayISO).
 * 2. Tính toán thống kê ngân sách (Chi phí ngày hiện tại vs. Tổng chi phí dự kiến).
 * 3. Quản lý các hành động tương tác: Xem bản đồ, Xem chi tiết quán, Đổi món, Thêm bữa phụ.
 */
const DailyPlanView = ({ planData, selectedDayISO, startDate, scheduleInfo, snackCandidates, onRegenerate, onUpdatePlan }: DailyPlanViewProps) => {


    /**
     * Thuật toán trích xuất dữ liệu ngày hiện tại:
     * Chênh lệch giữa (Ngày đang chọn) và (Ngày bắt đầu) sẽ cho biết chúng ta đang ở ngày thứ mấy của lịch trình.
     */
    const getActivePlan = () => {
        const current = new Date(selectedDayISO);
        const start = new Date(startDate);
        const diffTime = current.getTime() - start.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); // Chuyển đổi mili giây sang ngày

        // Tìm trong planData phần tử có thuộc tính day khớp với số ngày tính được (day bắt đầu từ 1)
        return planData.find(p => p.day === diffDays + 1);
    };

    const activePlan = getActivePlan();

    /**
     * Logic tính toán ngân sách:
     * Duyệt qua toàn bộ lịch trình (all days) và ngày hiện tại để cộng dồn giá tiền.
     * Điều này giúp hiển thị thanh tiến trình ngân sách chính xác hơn.
     */
    const calculateCosts = () => {
        let grandTotal = 0; // Tổng chi phí của cả chuyến đi
        planData.forEach(day => {
            // Cộng chi phí 3 bữa chính
            if (day.meals) {
                Object.values(day.meals).forEach((meal: any) => {
                    grandTotal += (meal.price || 0);
                });
            }
            // Cộng chi phí các bữa phụ đã thêm
            if (day.snacks) {
                day.snacks.forEach((snack: any) => {
                    grandTotal += (snack.price || 0);
                });
            }
        });

        let dayTotal = 0; // Chi phí riêng cho ngày đang xem
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
    // Mục tiêu chi tiêu trung bình mỗi ngày dựa trên tổng ngân sách người dùng nhập vào
    const dailyTarget = (scheduleInfo?.totalBudget > 0) ? (scheduleInfo.totalBudget / (scheduleInfo.days || 1)) : 0;

    // Trạng thái điều khiển các Modal (Cửa sổ bật lên)
    const [mapOpen, setMapOpen] = useState(false); // Bản đồ
    const [selectedDish, setSelectedDish] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false); // Chi tiết quán ăn
    const [selectedDetailDish, setSelectedDetailDish] = useState<any>(null);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);
    const [showCostSummary, setShowCostSummary] = useState(false); // Bảng thống kê ngân sách
    const [snackModalOpen, setSnackModalOpen] = useState(false); // Thêm bữa phụ

    // States phục vụ tính năng "Đổi món" 
    const [swapModalOpen, setSwapModalOpen] = useState(false);
    const [isSwapLoading, setIsSwapLoading] = useState(false);
    const [swapOptions, setSwapOptions] = useState<any[]>([]); // Danh sách quán thay thế từ AI
    const [swapTarget, setSwapTarget] = useState<{ dayIdx: number, sessionKey: string, currentDish: string } | null>(null);

    /** Mở bản đồ và chỉ đường đến quán ăn */
    const handleShowMap = (dish: any) => {
        setSelectedDish(dish);
        setMapOpen(true);
    };

    /** Mở thông tin chi tiết (Review, Menu...) của một quán ăn */
    const handleShowDetail = (dish: any, session: string) => {
        setSelectedDetailDish(dish);
        setSelectedSession(session);
        setDetailOpen(true);
    };

    /** Xử lý cập nhật ID món ăn hoặc thông tin từ Modal chi tiết quán */
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

            // Chỉ cập nhật tên món và giá, giữ nguyên metadata quán ăn
            newPlanData[dayIndex].meals[sessionKey] = {
                ...currentMeal,
                dish: newDishItem.name,
                price: newDishItem.price
            };

            onUpdatePlan?.(newPlanData);
        }
    };

    /** Logic thêm một bữa ăn phụ (Snack) vào danh sách ngày */
    const handleAddSnack = (snack: any) => {
        if (!activePlan) return;

        const newPlanData = [...planData];
        const dayIndex = newPlanData.findIndex(p => p.day === activePlan.day);

        if (dayIndex !== -1) {
            const currentSnacks = newPlanData[dayIndex].snacks || [];
            // Ràng buộc nghiệp vụ: Không cho phép ăn vặt quá nhiều (tối đa 3) để đảm bảo sức khỏe/ngân sách
            if (currentSnacks.length >= 3) {
                alert("Bạn chỉ có thể thêm tối đa 3 bữa phụ mỗi ngày!");
                return;
            }

            newPlanData[dayIndex].snacks = [...currentSnacks, snack];
            onUpdatePlan?.(newPlanData);
        }
    };

    /**
     * Xử lý mở tính năng "Đổi món"
     * Sẽ gọi Backend để lấy danh sách các quán tương tự cùng khu vực nhưng chưa có trong lịch trình.
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
            // Gọi API lấy phương án thay thế
            const res = await scheduleService.swapOptions({
                dayIndex: dayIdx,
                mealType: sessionKey
            });

            if (res.success) {
                setSwapOptions(res.options); // Lưu các món AI gợi ý đổi
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đổi món:", error);
        } finally {
            setIsSwapLoading(false);
        }
    };

    /** Xác nhận chọn món ăn mới từ danh sách đề xuất thay thế */
    const handleConfirmSelectedSwap = (newOption: any) => {
        if (!swapTarget) return;

        const { dayIdx, sessionKey } = swapTarget;
        const newPlanData = [...planData];

        if (newPlanData[dayIdx]) {
            // Thay thế toàn bộ object Meal cũ bằng metadata mới của quán mới
            newPlanData[dayIdx].meals[sessionKey] = {
                ...newOption,
                type: 'main',
                time: planData[dayIdx].meals[sessionKey].time // Giữ khung giờ cũ của bữa đó
            };

            onUpdatePlan?.(newPlanData);
            setSwapModalOpen(false);
        }
    };

    /**
     * QUY TRÌNH HỢP NHẤT VÀ SẮP XẾP BỮA ĂN:
     * Trong dữ liệu thô, bữa chính (Object) và bữa phụ (Array) tách rời nhau.
     * Hàm này trộn chúng lại và sắp xếp theo thuộc tính `time` (ví dụ: "08:00" trước "12:00")
     * để hiển thị đúng dòng thời gian thực tế người dùng sẽ đi.
     */
    const getSortedMeals = () => {
        if (!activePlan) return [];

        const meals: any[] = [];

        // 1. Thu thập bữa chính
        if (activePlan.meals) {
            if (activePlan.meals.breakfast) meals.push({ ...activePlan.meals.breakfast, session: 'SÁNG', type: 'main' });
            if (activePlan.meals.lunch) meals.push({ ...activePlan.meals.lunch, session: 'TRƯA', type: 'main' });
            if (activePlan.meals.dinner) meals.push({ ...activePlan.meals.dinner, session: 'TỐI', type: 'main' });
        }

        // 2. Thu thập bữa phụ
        if (activePlan.snacks) {
            activePlan.snacks.forEach((s: any) => {
                meals.push({ ...s, type: 'snack' });
            });
        }

        // 3. Thực hiện sắp xếp theo chuỗi thời gian 
        return meals.sort((a, b) => {
            const t1 = a.time || "00:00";
            const t2 = b.time || "00:00";
            return t1.localeCompare(t2);
        });
    };

    const sortedMeals = getSortedMeals();

    return (
        <div className="px-4 space-y-4">

            {/* Khu vực Thống kê ngân sách bằng biểu đồ tinh gọn */}
            <div
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${showCostSummary ? 'bg-orange-100 text-orange-700 shadow-sm' : 'bg-white border border-neutral-100 text-neutral-600 hover:border-orange-200 hover:text-orange-600'}`}
                onClick={() => setShowCostSummary(!showCostSummary)}
            >
                <div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /><span className="text-sm font-medium">Thống kê chi phí</span></div>
                {showCostSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>

            {showCostSummary && (
                <CostSummary
                    dayTotal={dayTotal}
                    grandTotal={grandTotal}
                    targetDailyBudget={dailyTarget}
                    totalDays={scheduleInfo.days}
                />
            )}

            {/* Header danh sách món ăn */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-neutral-800 text-lg">Hôm nay ăn gì?</h2>
                <button
                    className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                    onClick={onRegenerate}
                >
                    <RefreshCcw className="w-4 h-4" /> Tạo lại
                </button>
            </div>

            {/* Danh sách các thẻ món ăn (MealCard) */}
            <div className="space-y-4">
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
                    <div className="text-center py-8 text-neutral-400 text-sm">Không có dữ liệu ăn uống cho ngày này</div>
                )}
            </div>

            {/* Nút tác vụ thêm bữa ăn phụ (Snack Modal) */}
            {(activePlan?.snacks?.length || 0) < 3 && (
                <button
                    className="w-full border-2 border-dashed border-neutral-300 text-neutral-500 rounded-2xl py-4 flex items-center justify-center gap-2 font-medium hover:border-orange-300 hover:text-orange-500 transition-colors"
                    onClick={() => setSnackModalOpen(true)}
                >
                    <Plus className="w-5 h-5" /> Thêm bữa ăn phụ
                </button>
            )}

            {/* CÁC MODAL HỆ THỐNG (Giữ độc lập để tránh re-render tree chính) */}
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
