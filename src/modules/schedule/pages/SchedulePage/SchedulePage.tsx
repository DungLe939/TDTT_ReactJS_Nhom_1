import { useState, useEffect } from 'react';
import ScheduleBanner from '../../components/ScheduleBanner/ScheduleBanner';
import ScheduleFilterModal from '../../components/ScheduleFilterModal/ScheduleFilterModal';
import DailyPlanView from '../../components/DailyPlanView/DailyPlanView';
import { scheduleService } from '../../../../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './SchedulePage.css';

const SchedulePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // ============================================
    // STATE QUẢN LÝ DÀNH CHO DATE SELECTOR (LIFTED)
    // ============================================
    const [selectedDayISO, setSelectedDayISO] = useState<string>('');
    const [viewStartDate, setViewStartDate] = useState<Date | null>(null);

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

            // Đồng bộ ngày bắt đầu và view
            if (parsedInfo.startDate && !selectedDayISO) {
                setSelectedDayISO(parsedInfo.startDate.split('T')[0]);
                const tripStart = new Date(parsedInfo.startDate);
                
                const getMonday = (d: Date) => {
                    const date = new Date(d);
                    const day = date.getDay(); 
                    const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
                    return new Date(date.setDate(diff));
                };
                setViewStartDate(getMonday(tripStart));
            }
        }
    }, [selectedDayISO]);

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

                    if (dayIdx === 0 && !selectedDayISO) {
                        setSelectedDayISO(newScheduleInfo.startDate.split('T')[0]);
                    }

                    // STREAMING RENDER: Cập nhật UI ngay sau mỗi ngày!
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

    // Logic Date Selector (Lifted)
    const tripStart = new Date(scheduleInfo.startDate || new Date());
    const daysOfWeekNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    
    const weekDays = viewStartDate ? Array.from({ length: 7 }, (_, i) => {
        const d = new Date(viewStartDate);
        d.setDate(viewStartDate.getDate() + i);
        return d;
    }) : [];

    const handlePrevWeek = () => {
        if (!viewStartDate) return;
        const d = new Date(viewStartDate);
        d.setDate(d.getDate() - 7);
        setViewStartDate(d);
    };

    const handleNextWeek = () => {
        if (!viewStartDate) return;
        const d = new Date(viewStartDate);
        d.setDate(d.getDate() + 7);
        setViewStartDate(d);
    };

    const isPrevDisabled = !viewStartDate;
    
    const lastDayOfTrip = new Date(tripStart);
    if (planData) lastDayOfTrip.setDate(tripStart.getDate() + (planData.length || 1) - 1);
    
    const nextWeekStart = viewStartDate ? new Date(viewStartDate) : null;
    if (nextWeekStart) nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const isNextDisabled = !nextWeekStart || nextWeekStart.getTime() > lastDayOfTrip.getTime();

    return (
        <div className="schedule-page">
            <main className="schedule-main">
                <div className="schedule-header-card">
                    <ScheduleBanner
                        title="Lịch trình Food Tour"
                        subtitle={`${scheduleInfo.location}, ${scheduleInfo.days} ngày`}
                        onFilterClick={handleFilterClick}
                    />

                    {planData && viewStartDate && (
                        <div className="card-date-navigation">
                            <button 
                                className={`nav-btn prev ${isPrevDisabled ? 'disabled' : ''}`} 
                                onClick={handlePrevWeek}
                                disabled={isPrevDisabled}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="card-date-selector">
                                {weekDays.map((dateObj, index) => {
                                    const iso = dateObj.toISOString().split('T')[0];
                                    const isActive = iso === selectedDayISO;
                                    const diffDays = Math.round((dateObj.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24));
                                    const isScheduled = planData && diffDays >= 0 && diffDays < planData.length;

                                    return (
                                        <div 
                                            key={index}
                                            className={`date-item ${isActive ? 'active' : ''} ${isScheduled && !isActive ? 'scheduled' : ''} ${!isScheduled ? 'disabled' : ''}`}
                                            onClick={() => isScheduled && setSelectedDayISO(iso)}
                                        >
                                            <span className="day-name">{daysOfWeekNames[dateObj.getDay()]}</span>
                                            <span className="day-number">{dateObj.getDate()}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            <button 
                                className={`nav-btn next ${isNextDisabled ? 'disabled' : ''}`} 
                                onClick={handleNextWeek}
                                disabled={isNextDisabled}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Hiển thị tiến trình streaming khi đang tạo lịch trình */}
                {isLoading && streamingProgress && (
                    <div className="streaming-progress">
                        <div className="streaming-spinner"></div>
                        <span>{streamingProgress}</span>
                    </div>
                )}

                {/* Khu vực Render Component Lịch trình */}
                {planData && selectedDayISO && (
                    <DailyPlanView
                        planData={planData}
                        selectedDayISO={selectedDayISO}
                        startDate={scheduleInfo.startDate}
                        scheduleInfo={scheduleInfo}
                        snackCandidates={snackCandidates}
                        onUpdatePlan={handleUpdatePlan}
                        onRegenerate={() => {
                            alert("Tính năng tạo lại lịch trình đang thực thi lại logic lọc!");
                        }}
                    />
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
