import { useState } from 'react';
import Header from '../../../../components/Header/Header';
import ScheduleBanner from '../../components/ScheduleBanner/ScheduleBanner';
import ScheduleFilterModal from '../../components/ScheduleFilterModal/ScheduleFilterModal';
import DailyPlanView from '../../components/DailyPlanView/DailyPlanView';
import { scheduleService } from '../../../../services/api';
import './SchedulePage.css';

const SchedulePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Lưu trữ dữ liệu lấy từ API
    const [planData, setPlanData] = useState<any[] | null>(null);
    const [scheduleInfo, setScheduleInfo] = useState({
        location: 'Đà Nẵng',
        days: 3,
        startDate: ''
    });

    const handleFilterClick = () => {
        setIsModalOpen(true);
    };

    const handleGenerateSubmit = async (formData: any) => {
        setIsLoading(true);
        try {
            // Bước 1: Lấy tọa độ
            console.log('1. Đang quét danh sách quán ăn quanh khu vực:', formData.location);
            const searchRes = await scheduleService.searchLocation(formData.location);
            const coords = searchRes?.coords;
            
            if (!searchRes?.success || !coords) {
                alert('Không thể tìm thấy tọa độ hoặc quét quán ăn cho địa điểm này!');
                setIsLoading(false);
                return;
            }

            const { lat, lng } = coords;

            // Bước 2: Tạo lịch trình
            const payload = {
                budget: formData.budget,
                currentLocation: { lat, lng },
                preferences: formData.preferences,
                travelDays: formData.travelDays
            };

            const planRes = await scheduleService.generatePlan(payload);
            
            console.log('✅ Tạo lịch trình thành công:', planRes);
            
            // Cập nhật State
            setPlanData(planRes.plan);
            setScheduleInfo({
                location: formData.location,
                days: formData.travelDays,
                startDate: formData.startDate || new Date().toISOString()
            });

            setIsModalOpen(false);

        } catch (error) {
            console.error('Lỗi API:', error);
            alert('Có lỗi xảy ra khi gọi API! Vui lòng thử lại hoặc kiểm tra Backend.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="schedule-page">
            <Header />
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
                            onRegenerate={() => {
                                alert("Tính năng tạo lại lịch trình đang được xây dựng!");
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
