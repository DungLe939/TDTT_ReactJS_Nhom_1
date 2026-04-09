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
    const [planData, setPlanData] = useState<any[] | null>(null);

    // Lưu danh sách các món ăn vặt tiềm năng (Snacks)
    const [snackCandidates, setSnackCandidates] = useState<any[]>([]);

    // Cấu hình cơ bản của chuyến đi
    const [scheduleInfo, setScheduleInfo] = useState<any>({
        location: 'Đà Nẵng',
        days: 3,
        startDate: '',
        totalBudget: 0,
        suggestedMealBudget: null
    });

    // ============================================
    // STREAMING STATE: Theo dõi tiến trình tạo lịch trình từng ngày
    // ============================================
    // Hiển thị cho user biết đang xử lý ngày thứ mấy / tổng bao nhiêu ngày
    const [streamingProgress, setStreamingProgress] = useState<string>('');

    // ============================================
    // 1. LIFECYCLE - MOUNTING (Khôi phục dữ liệu từ LocalStorage)
    // ============================================
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
    // 2. NGHIỆP VỤ - TỐI ƯU: STREAMING TẠO LỊCH TRÌNH
    // ============================================
    // Luồng mới (tối ưu ~45s → ~7-10s cảm nhận):
    //   Bước 1: Nếu pre-fetch đã xong → dùng coords có sẵn. Nếu chưa → gọi searchLocation.
    //   Bước 2: Gọi preparePlan (Raw Filter + Clustering) → cache trên server.
    //   Bước 3: Gọi generateDayPlan lần lượt từng ngày.
    //           Mỗi ngày xong → render UI ngay (streaming).
    const handleGenerateSubmit = async (formData: any) => {
        setIsLoading(true);
        setPlanData(null); // Reset giao diện cũ
        setSnackCandidates([]);
        setStreamingProgress('Đang chuẩn bị dữ liệu...');

        try {
            // ---- BƯỚC 1: Lấy tọa độ (từ pre-fetch hoặc gọi mới) ----
            let coords = formData.prefetchCoords;

            if (!formData.prefetchReady || !coords) {
                // Pre-fetch chưa xong hoặc lỗi → gọi searchLocation bình thường
                setStreamingProgress('Đang quét quán ăn...');
                const searchRes = await scheduleService.searchLocation(formData.location);
                if (!searchRes?.success || !searchRes?.coords) {
                    alert('Không thể tìm thấy tọa độ hoặc quét quán ăn cho địa điểm này!');
                    setIsLoading(false);
                    setStreamingProgress('');
                    return;
                }
                coords = searchRes.coords;
            }

            // ---- BƯỚC 2: Chuẩn bị dữ liệu (Raw Filter + Clustering) ----
            setStreamingProgress('Đang phân tích dữ liệu quán ăn...');
            const preparePayload = {
                budget: formData.budget,
                currentLocation: { lat: coords.lat, lng: coords.lng },
                preferences: formData.preferences,
                travelDays: formData.travelDays
            };

            const prepareRes = await scheduleService.preparePlan(preparePayload);
            
            if (!prepareRes?.success || prepareRes.count === 0) {
                alert('Không tìm thấy quán ăn phù hợp tại khu vực này!');
                setIsLoading(false);
                setStreamingProgress('');
                return;
            }

            const totalDays = prepareRes.totalDays || formData.travelDays;

            // Cập nhật thông tin chuyến đi
            const newScheduleInfo = {
                location: formData.location,
                days: formData.travelDays,
                startDate: formData.startDate || new Date().toISOString(),
                totalBudget: prepareRes.info.totalBudget,
                suggestedMealBudget: prepareRes.info.suggestedMealBudget
            };
            setScheduleInfo(newScheduleInfo);
            localStorage.setItem('FOOD_TOUR_SCHEDULE_INFO', JSON.stringify(newScheduleInfo));

            // ---- BƯỚC 3: STREAMING - Tạo lịch trình TỪNG NGÀY ----
            // Mỗi ngày xong → thêm vào planData → UI render ngay lập tức!
            const allDays: any[] = [];
            const allSnacks: any[] = [];

            for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
                setStreamingProgress(`Đang tạo lịch trình ngày ${dayIdx + 1}/${totalDays}...`);

                const dayRes = await scheduleService.generateDayPlan(dayIdx);

                if (dayRes?.success) {
                    // Thêm ngày mới vào mảng
                    const newDay = { day: dayRes.day, meals: dayRes.meals };
                    allDays.push(newDay);
                    
                    // Thu thập snack candidates từ từng ngày
                    if (dayRes.snackCandidates) {
                        allSnacks.push(...dayRes.snackCandidates);
                    }

                    // STREAMING RENDER: Cập nhật UI ngay sau mỗi ngày!
                    // Spread [...allDays] tạo mảng mới để React detect thay đổi và re-render
                    setPlanData([...allDays]);
                    setSnackCandidates([...allSnacks]);
                }
            }

            // Lưu kết quả cuối cùng vào LocalStorage
            localStorage.setItem('FOOD_TOUR_PLAN_DATA', JSON.stringify(allDays));
            localStorage.setItem('FOOD_TOUR_SNACK_CANDIDATES', JSON.stringify(allSnacks));

            setIsModalOpen(false);
            setStreamingProgress('');

        } catch (error) {
            console.error('Lỗi API:', error);
            alert('Có lỗi xảy ra khi gọi API! Vui lòng thử lại hoặc kiểm tra Backend.');
        } finally {
            setIsLoading(false);
            setStreamingProgress('');
        }
    };

    // Hàm Callback con dùng để component con (DailyPlanView) giao tiếp ngược lên
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

                {/* Hiển thị tiến trình streaming khi đang tạo lịch trình */}
                {isLoading && streamingProgress && (
                    <div className="streaming-progress">
                        <div className="streaming-spinner"></div>
                        <span>{streamingProgress}</span>
                    </div>
                )}
                
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
