import { useState, useEffect } from 'react';
import ScheduleBanner from '../../components/ScheduleBanner/ScheduleBanner';
import ScheduleFilterModal from '../../components/ScheduleFilterModal/ScheduleFilterModal';
import LocationPickerModal from '../../components/LocationPickerModal/LocationPickerModal';
import DailyPlanView from '../../components/DailyPlanView/DailyPlanView';
import { scheduleService } from '../../../../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './SchedulePage.css';

/**
 * Component SchedulePage - Trang quản lý Lịch trình Food Tour.
 * Đây là trung tâm điều phối của Module Lịch trình, quản lý luồng dữ liệu từ khi
 * người dùng nhập yêu cầu đến khi AI tạo lịch trình từng ngày.
 */
const SchedulePage = () => {
    // Trạng thái đóng/mở Modal bộ lọc
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Trạng thái đóng/mở Modal chọn bản đồ và vị trí vừa chọn
    const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
    const [pickedLocation, setPickedLocation] = useState<string>('');

    // Trạng thái loading toàn trang khi đang gọi AI
    const [isLoading, setIsLoading] = useState(false);

    // STATE QUẢN LÝ DÀNH CHO DATE SELECTOR (LIFTED)
    // selectedDayISO: Lưu ngày hiện tại đang được chọn ở định dạng YYYY-MM-DD
    const [selectedDayISO, setSelectedDayISO] = useState<string>('');
    // viewStartDate: Ngày đầu tiên hiển thị trên thanh cuộn lịch (thanh 7 ngày)
    const [viewStartDate, setViewStartDate] = useState<Date | null>(null);

    // STATE QUẢN LÝ DỮ LIỆU CỐT LÕI CỦA ỨNG DỤNG

    // planData: Lưu trữ mảng toàn bộ các ngày đi ăn (VD: Mảng 3 phần tử tương ứng 3 ngày)
    // Mỗi phần tử chứa { day: number, meals: Meal[] }
    const [planData, setPlanData] = useState<any[] | null>(null);

    // snackCandidates: Danh sách các món ăn vặt tiềm năng thu thập được khi AI phân tích
    const [snackCandidates, setSnackCandidates] = useState<any[]>([]);

    // scheduleInfo: Cấu hình cơ bản của chuyến đi (Địa điểm, số ngày, ngân sách...)
    const [scheduleInfo, setScheduleInfo] = useState<any>({
        location: 'Đà Nẵng',
        days: 3,
        startDate: '',
        totalBudget: 0,
        suggestedMealBudget: null
    });

    // STREAMING STATE: Theo dõi tiến trình tạo lịch trình từng ngày

    // streamingProgress: Chuỗi thông báo trạng thái giúp người dùng bớt sốt ruột (UX)
    const [streamingProgress, setStreamingProgress] = useState<string>('');

    // 1. LIFECYCLE - MOUNTING (Khôi phục dữ liệu từ LocalStorage)
    useEffect(() => {
        // Kiểm tra xem người dùng đã có lịch trình cũ trong trình duyệt chưa
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

            // Nếu có ngày bắt đầu, tính toán để thanh lịch cuộn về đúng vị trí
            if (parsedInfo.startDate && !selectedDayISO) {
                setSelectedDayISO(parsedInfo.startDate.split('T')[0]);
                const tripStart = new Date(parsedInfo.startDate);

                /**
                 * Hàm bổ trợ tìm ngày Thứ Hai của tuần chứa ngày d
                 */
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

    /**
     * Mở modal bộ lọc khi click vào nút phễu trên Banner
     */
    const handleFilterClick = () => {
        setIsModalOpen(true);
    };

    /**
     * Nhận địa điểm từ Map Picker và tự động mở form Khai báo
     */
    const handleLocationPickerConfirm = (locName: string) => {
        setPickedLocation(locName);
        setIsLocationPickerOpen(false);
        setIsModalOpen(true); // Tự động bật form bộ lọc
    };

    // 2. NGHIỆP VỤ - TỐI ƯU: STREAMING TẠO LỊCH TRÌNH
    /**
     * Xử lý khi người dùng nhấn "Tạo lịch trình" trong Modal.
     * Cơ chế Streaming: 
     * Bước 1: Lấy tọa độ địa điểm 
     * Bước 2: Phân tích và nén dữ liệu quán ăn (Prepare/Clustering)
     * Bước 3: Gọi AI tạo từng ngày một và hiển thị lên UI ngay lập tức.
     */
    const handleGenerateSubmit = async (formData: any) => {
        setIsLoading(true);
        setPlanData(null); // Reset giao diện cũ để chuẩn bị dữ liệu mới
        setSnackCandidates([]);
        setStreamingProgress('Đang chuẩn bị dữ liệu...');

        try {
            // BƯỚC 1: Lấy tọa độ địa điểm 
            let coords = formData.prefetchCoords;

            if (!formData.prefetchReady || !coords) {
                // Nếu quy trình pre-fetch (lấy trước) chưa xong thì gọi API tìm kiếm ngay
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

            // BƯỚC 2: Chuẩn bị & Phân cụm quán ăn (Raw Filter + Clustering) 
            setStreamingProgress('Đang phân tích dữ liệu quán ăn...');
            const preparePayload = {
                budget: formData.budget,
                currentLocation: { lat: coords.lat, lng: coords.lng },
                preferences: formData.preferences,
                travelDays: formData.travelDays
            };

            // Gọi API prepare để Backend thực hiện thuật toán phân nhóm (K-Means)
            const prepareRes = await scheduleService.preparePlan(preparePayload);

            if (!prepareRes?.success || prepareRes.count === 0) {
                alert('Không tìm thấy quán ăn phù hợp tại khu vực này!');
                setIsLoading(false);
                setStreamingProgress('');
                return;
            }

            const totalDays = prepareRes.totalDays || formData.travelDays;

            // Lưu trữ cấu hình chuyến đi vào state và LocalStorage
            const newScheduleInfo = {
                location: formData.location,
                days: formData.travelDays,
                startDate: formData.startDate || new Date().toISOString(),
                totalBudget: prepareRes.info.totalBudget,
                suggestedMealBudget: prepareRes.info.suggestedMealBudget
            };
            setScheduleInfo(newScheduleInfo);
            localStorage.setItem('FOOD_TOUR_SCHEDULE_INFO', JSON.stringify(newScheduleInfo));

            // BƯỚC 3: STREAMING - Tạo lịch trình TỪNG NGÀY 
            // Chúng ta không đợi AI tạo xong cả tuần mới hiển thị, mà render ngay khi từng ngày hoàn tất.
            const allDays: any[] = [];
            const allSnacks: any[] = [];

            for (let dayIdx = 0; dayIdx < totalDays; dayIdx++) {
                setStreamingProgress(`Đang tạo lịch trình ngày ${dayIdx + 1}/${totalDays}...`);

                // Gọi AI xử lý lịch trình cho ngày thứ index=dayIdx
                const dayRes = await scheduleService.generateDayPlan(dayIdx);

                if (dayRes?.success) {
                    const newDay = { day: dayRes.day, meals: dayRes.meals };
                    allDays.push(newDay);

                    // Thu thập danh sách quán ăn vặt (Snacks) dự phòng
                    if (dayRes.snackCandidates) {
                        allSnacks.push(...dayRes.snackCandidates);
                    }

                    // Tự động chọn xem ngày đầu tiên ngay khi có dữ liệu
                    if (dayIdx === 0 && !selectedDayISO) {
                        setSelectedDayISO(newScheduleInfo.startDate.split('T')[0]);
                    }

                    // Cập nhật UI ngay lập tức sau mỗi vòng lặp ngày 
                    setPlanData([...allDays]);
                    setSnackCandidates([...allSnacks]);
                }
            }

            // Lưu kết quả cuối cùng hoàn thiện
            localStorage.setItem('FOOD_TOUR_PLAN_DATA', JSON.stringify(allDays));
            localStorage.setItem('FOOD_TOUR_SNACK_CANDIDATES', JSON.stringify(allSnacks));

            setIsModalOpen(false); // Đóng modal và hoàn tất
            setStreamingProgress('');

        } catch (error) {
            console.error('Lỗi API:', error);
            alert('Có lỗi xảy ra khi gọi API! Vui lòng thử lại hoặc kiểm tra Backend.');
        } finally {
            setIsLoading(false);
            setStreamingProgress('');
        }
    };

    /**
     * Cập nhật lại Plan toàn cục khi có thay đổi nhỏ từ component con 
     * (Ví dụ: Đổi món, thêm bữa phụ, xóa món...)
     */
    const handleUpdatePlan = (newPlanData: any[]) => {
        setPlanData([...newPlanData]);
        localStorage.setItem('FOOD_TOUR_PLAN_DATA', JSON.stringify(newPlanData));
    };

    // Logic căn chỉnh thời gian cho Date Selector
    const tripStart = new Date(scheduleInfo.startDate || new Date());
    const daysOfWeekNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

    // Tạo mảng 7 ngày để hiển thị trên thanh cuộn 
    const weekDays = viewStartDate ? Array.from({ length: 7 }, (_, i) => {
        const d = new Date(viewStartDate);
        d.setDate(viewStartDate.getDate() + i);
        return d;
    }) : [];

    /** Cuộn lịch về 7 ngày trước đó */
    const handlePrevWeek = () => {
        if (!viewStartDate) return;
        const d = new Date(viewStartDate);
        d.setDate(d.getDate() - 7);
        setViewStartDate(d);
    };

    /** Cuộn lịch tới 7 ngày tiếp theo */
    const handleNextWeek = () => {
        if (!viewStartDate) return;
        const d = new Date(viewStartDate);
        d.setDate(d.getDate() + 7);
        setViewStartDate(d);
    };

    // Trạng thái vô hiệu hóa nút chuyển tuần
    const isPrevDisabled = !viewStartDate;

    const lastDayOfTrip = new Date(tripStart);
    if (planData) lastDayOfTrip.setDate(tripStart.getDate() + (planData.length || 1) - 1);

    const nextWeekStart = viewStartDate ? new Date(viewStartDate) : null;
    if (nextWeekStart) nextWeekStart.setDate(nextWeekStart.getDate() + 7);
    const isNextDisabled = !nextWeekStart || nextWeekStart.getTime() > lastDayOfTrip.getTime();

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <main>
                {/* Khu vực Banner và Map (Ảnh Map tĩnh kèm hiệu ứng Heatmap) */}
                <div className="bg-white rounded-b-3xl shadow-sm overflow-hidden border-b border-neutral-200 mb-6">
                    <ScheduleBanner
                        title="Lịch trình Food Tour"
                        subtitle={`${scheduleInfo.location}, ${scheduleInfo.days} ngày`}
                        onFilterClick={handleFilterClick}
                        onMapClick={() => setIsLocationPickerOpen(true)}
                    />

                    {/* Thanh cuộn Lịch có mũi tên điều hướng hai đầu */}
                    {planData && viewStartDate && (
                        <div className="flex items-center py-4 px-2">
                            {/* Mũi tên trái: Chuyển cụm 7 ngày trước */}
                            <button
                                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isPrevDisabled ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-500 hover:bg-orange-50 hover:text-orange-500'}`}
                                onClick={handlePrevWeek}
                                disabled={isPrevDisabled}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Danh sách 7 ngày hiển thị */}
                            <div className="flex overflow-x-auto hide-scrollbar gap-3">
                                {weekDays.map((dateObj, index) => {
                                    const iso = dateObj.toISOString().split('T')[0];
                                    const isActive = iso === selectedDayISO;
                                    const diffDays = Math.round((dateObj.getTime() - tripStart.getTime()) / (1000 * 60 * 60 * 24));
                                    const isScheduled = planData && diffDays >= 0 && diffDays < planData.length;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => isScheduled && setSelectedDayISO(iso)}
                                            disabled={!isScheduled}
                                            className={`flex flex-col items-center min-w-[3.5rem] p-2 rounded-2xl transition-all ${isActive
                                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                                                    : isScheduled
                                                        ? 'bg-neutral-50 text-neutral-500 hover:bg-orange-50'
                                                        : 'bg-neutral-50 text-neutral-300 cursor-not-allowed'
                                                }`}
                                        >
                                            <span className="text-xs font-semibold mb-1">{daysOfWeekNames[dateObj.getDay()]}</span>
                                            <span className={`text-lg font-bold ${isActive ? 'text-white' : 'text-neutral-800'}`}>{dateObj.getDate()}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Mũi tên phải: Chuyển cụm 7 ngày tiếp theo */}
                            <button
                                className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isNextDisabled ? 'text-neutral-200 cursor-not-allowed' : 'text-neutral-500 hover:bg-orange-50 hover:text-orange-500'}`}
                                onClick={handleNextWeek}
                                disabled={isNextDisabled}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Phản hồi UX: Hiển thị tiến trình AI đang làm việc từng ngày */}
                {isLoading && streamingProgress && (
                    <div className="flex items-center gap-3 px-4 py-3 mx-4 mb-4 bg-orange-50 rounded-xl text-orange-700 text-sm font-medium">
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>{streamingProgress}</span>
                    </div>
                )}

                {/* View chi tiết danh sách món ăn cho ngày đang được chọn */}
                {planData && selectedDayISO && (
                    <DailyPlanView
                        planData={planData}
                        selectedDayISO={selectedDayISO}
                        startDate={scheduleInfo.startDate}
                        scheduleInfo={scheduleInfo}
                        snackCandidates={snackCandidates}
                        onUpdatePlan={handleUpdatePlan}
                        onRegenerate={() => {
                            // TODO: Implement logic thực sự cho việc tạo lại lịch trình nếu cần
                            alert("Tính năng tạo lại lịch trình đang thực thi lại logic lọc!");
                        }}
                    />
                )}
            </main>

            {/* Modal thu thập yêu cầu người dùng (Địa điểm, ngân sách, khẩu vị...) */}
            <ScheduleFilterModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleGenerateSubmit}
                isLoading={isLoading}
                prefilledLocation={pickedLocation}
            />

            {/* Modal Bản đồ tương tác chọn điểm đến */}
            <LocationPickerModal
                isOpen={isLocationPickerOpen}
                onClose={() => setIsLocationPickerOpen(false)}
                onConfirm={handleLocationPickerConfirm}
            />
        </div>
    );
};

export default SchedulePage;
