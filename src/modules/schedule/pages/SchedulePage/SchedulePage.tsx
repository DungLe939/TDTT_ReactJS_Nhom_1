import { useState } from 'react';
import Header from '../../../../components/Header/Header';
import ScheduleBanner from '../../components/ScheduleBanner/ScheduleBanner';
import ScheduleFilterModal from '../../components/ScheduleFilterModal/ScheduleFilterModal';
import { scheduleService } from '../../../../services/api';
import './SchedulePage.css';

const SchedulePage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleFilterClick = () => {
        setIsModalOpen(true);
    };

    const handleGenerateSubmit = async (formData: any) => {
        setIsLoading(true);
        try {
            // Bước 1: Gọi endpoint searchLocation
            console.log('1. Đang quét danh sách quán ăn quanh khu vực:', formData.location);
            const searchRes = await scheduleService.searchLocation(formData.location);
            
            // Note: Backend trả về { success, data: [...], coords: { lat, lng } }
            // Do backend đã sửa lại cách trả về.
            const coords = searchRes?.coords;
            
            if (!searchRes?.success || !coords) {
                alert('Không thể tìm thấy tọa độ hoặc quét quán ăn cho địa điểm này!');
                setIsLoading(false);
                return;
            }

            const { lat, lng } = coords;
            console.log('Lấy tọa độ & quét quán thành công:', { lat, lng });

            // Bước 2: Gọi endpoint generatePlan theo đúng Format User yêu cầu
            const payload = {
                budget: formData.budget,
                currentLocation: { lat, lng },
                preferences: formData.preferences, // Đã map ở Modal
                travelDays: formData.travelDays
            };

            console.log('2. Đang tạo lịch trình với Payload:', JSON.stringify(payload, null, 2));
            const planRes = await scheduleService.generatePlan(payload);
            
            console.log('✅ Tạo lịch trình thành công:', planRes);
            alert('Tạo lịch trình thành công! Vui lòng mở F12 để xem Console Data.');
            
            // Xử lý đóng Modal
            setIsModalOpen(false);

        } catch (error) {
            console.error('Lỗi trong quá trình tạo lịch trình:', error);
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
                    subtitle="Đà Nẵng, 3 ngày" 
                    onFilterClick={handleFilterClick}
                />
            </main>

            {/* Modal Lên lịch trình */}
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
