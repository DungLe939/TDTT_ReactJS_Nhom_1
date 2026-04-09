import { useState, useEffect } from 'react';
import ScheduleBanner from '../../components/ScheduleBanner/ScheduleBanner';
import ScheduleFilterModal from '../../components/ScheduleFilterModal/ScheduleFilterModal';
import DailyPlanView from '../../components/DailyPlanView/DailyPlanView';
import { scheduleService } from '../../../../services/api';
import './SchedulePage.css';

const SchedulePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ============================================
    // STATE QUẢN LÝ DỮ LIỆU CỐT LÕI CỦA ỨNG DỤNG
    // ============================================
    
    // Lưu trữ mảng toàn bộ các ngày đi ăn (VD: Mảng 3 phần tử tương ứng 3 ngày)
    // Mỗi ngày sẽ chứa Object thông tin: bữa sáng, trưa, tối.
    const [planData, setPlanData] = useState<any[] | null>(null);

    // Lưu danh sách các món ăn vặt tiềm năng (Snacks) xung quanh khu vực chuyến đi
    // AI dùng mảng này để cho phép user "bốc" bỏ thêm vào làm "bữa phụ"
    const [snackCandidates, setSnackCandidates] = useState<any[]>([]);

    // Cấu hình cơ bản của chuyến đi (Địa điểm, Tổng ngân sách, Số ngày...)
    const [scheduleInfo, setScheduleInfo] = useState<any>({
        location: 'Đà Nẵng',
        days: 3,
        startDate: '',
        totalBudget: 0,
        suggestedMealBudget: null
    });

    // ============================================
    // 1. LIFECYCLE - MOUNTING (Khởi tạo lần đầu)
    // ============================================
    // Hook này sẽ tự động chạy 1 lần duy nhất khi người dùng vào trang.
    // Tác dụng: Phục hồi lại dữ liệu lịch trình từ LocalStorage để 
    // lỡ người dùng có F5 (Refresh) trang thì không bị mất sạch lịch trình vừa tạo.
    useEffect(() => {
        const savedPlan = localStorage.getItem('FOOD_TOUR_PLAN_DATA');
        const savedInfo = localStorage.getItem('FOOD_TOUR_SCHEDULE_INFO');
        const savedSnacks = localStorage.getItem('FOOD_TOUR_SNACK_CANDIDATES');
        
        if (savedPlan) setPlanData(JSON.parse(savedPlan));
        if (savedSnacks) setSnackCandidates(JSON.parse(savedSnacks));
        
        if (savedInfo) {
            const parsedInfo = JSON.parse(savedInfo);
            setScheduleInfo({
                ...parsedInfo,
                totalBudget: parsedInfo.totalBudget || 0,
                days: parsedInfo.days || 3
            });
        }
    }, []);

    const handleFilterClick = () => {
        setIsModalOpen(true);
    };

    // ============================================
    // 2. NGHIỆP VỤ - GỌI API ĐỂ AI TẠO LỊCH TRÌNH
    // ============================================
    // Kích hoạt khi người dùng nộp Form lọc ngân sách/sở thích.
    const handleGenerateSubmit = async (formData: any) => {
        setIsLoading(true);
        try {
            const searchRes = await scheduleService.searchLocation(formData.location);
            const coords = searchRes?.coords;
            
            if (!searchRes?.success || !coords) {
                alert('Không thể tìm thấy tọa độ hoặc quét quán ăn cho địa điểm này!');
                setIsLoading(false);
                return;
            }

            const { lat, lng } = coords;

            const payload = {
                budget: formData.budget,
                currentLocation: { lat, lng },
                preferences: formData.preferences,
                travelDays: formData.travelDays
            };

            const planRes = await scheduleService.generatePlan(payload);
            
            // Cập nhật State & Lưu LocalStorage
            const newPlanData = planRes.plan;
            const newSnackCandidates = planRes.snackCandidates || [];
            const newScheduleInfo = {
                location: formData.location,
                days: formData.travelDays,
                startDate: formData.startDate || new Date().toISOString(),
                totalBudget: planRes.info.totalBudget,
                suggestedMealBudget: planRes.info.suggestedMealBudget
            };

            setPlanData(newPlanData);
            setSnackCandidates(newSnackCandidates);
            setScheduleInfo(newScheduleInfo);

            localStorage.setItem('FOOD_TOUR_PLAN_DATA', JSON.stringify(newPlanData));
            localStorage.setItem('FOOD_TOUR_SNACK_CANDIDATES', JSON.stringify(newSnackCandidates));
            localStorage.setItem('FOOD_TOUR_SCHEDULE_INFO', JSON.stringify(newScheduleInfo));

            setIsModalOpen(false);

        } catch (error) {
            console.error('Lỗi API:', error);
            alert('Có lỗi xảy ra khi gọi API! Vui lòng thử lại hoặc kiểm tra Backend.');
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm Callback con dùng để component con (DailyPlanView) giao tiếp ngược lên
    // VD: Cập nhật lại mảng sau khi người dùng Thêm Bữa Phụ hoặc Đổi Món.
    const handleUpdatePlan = (newPlanData: any[]) => {
        setPlanData([...newPlanData]);
        localStorage.setItem('FOOD_TOUR_PLAN_DATA', JSON.stringify(newPlanData));
    };

    return (
        <div className="schedule-page">
            <main className="schedule-main">
                <ScheduleBanner 
                    title="Lịch trình Food Tour" 
                    subtitle={`${scheduleInfo.location}, ${scheduleInfo.days} ngày`} 
                    onFilterClick={handleFilterClick}
                />
                
                {/* Khu vực Render Component Lịch trình */}
                {planData && (
                    <div className="plan-view-wrapper">
                        <DailyPlanView 
                            planData={planData}
                            startDate={scheduleInfo.startDate}
                            scheduleInfo={scheduleInfo}
                            snackCandidates={snackCandidates}
                            onUpdatePlan={handleUpdatePlan}
                            onRegenerate={() => {
                                alert("Tính năng tạo lại lịch trình đang thực thi lại logic lọc!");
                            }}
                        />
                    </div>
                )}
            </main>

            <ScheduleFilterModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleGenerateSubmit}
                isLoading={isLoading}
            />
        </div>
    );
};

export default SchedulePage;
