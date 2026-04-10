import axios from 'axios';
import { retryRequest } from '../utils/retryRequest';

/**
 * Biến toàn cục lấy từ file .env (VITE_API_URL).
 * Nếu chưa setup .env, mặc định sẽ kết nối đến cổng 3000 của server NestJS nội bộ.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Tạo một bản sao axios (Axios Instance) để tái sử dụng trong hệ thống gọi API.
 * Đặc biệt: `withCredentials: true` là cấu hình tối quan trọng để Frontend có thể móc nối,
 * lưu trữ và gửi kèm cookie Session/Guest_id lên Backend kể cả khi qua các domain khác nhau.
 */
export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Quan trọng để gửi/nhận cookie (guest_id)
});

/**
 * Object `scheduleService` đóng gói toàn bộ các hàm Async thao tác móc nối
 * với NestJS Backend liên quan đến Module tạo và duyệt Lịch Trình.
 * 
 * CÁC HÀM MỚI (Tối ưu hiệu năng):
 * - preparePlan: Chạy ngầm Raw Filter + Clustering khi user chọn địa điểm
 * - generateDayPlan: Tạo lịch trình streaming từng ngày (có retry)
 */
export const scheduleService = {
    // Gọi AI/Google Map tìm kiếm thông tin địa danh tọa độ
    searchLocation: async (keyword: string) => {
        const response = await apiClient.post('/schedule/searchLocation', { keyword });
        return response.data;
    },
    
    // Gửi payload các mốc đã ghim để hệ thống Gen AI tự sinh lịch trình FoodTour (API cũ, giữ lại)
    generatePlan: async (payload: any) => {
        const response = await apiClient.post('/schedule/generatePlan', payload);
        return response.data;
    },

    // Truy vấn dữ liệu chỉ đường thực tế qua Leaflet/OSRM backend
    getRoute: async (payload: any) => {
        const response = await apiClient.post('/schedule/route', payload);
        return response.data;
    },

    // Gợi ý địa điểm du lịch (Autocomplete)
    autocompleteLocation: async (keyword: string) => {
        const response = await apiClient.post('/schedule/autocomplete', { keyword });
        return response.data;
    },

    // ============================================
    // API MỚI: TỐI ƯU HIỆU NĂNG (Streaming Mode)
    // ============================================

    // PHASE 1: Chuẩn bị dữ liệu (Raw Filter + Clustering)
    // Gọi ngầm khi user chọn xong địa điểm, KHÔNG cần chờ user bấm nút.
    preparePlan: async (payload: any) => {
        const response = await retryRequest(
            () => apiClient.post('/schedule/preparePlan', payload),
            2 // Retry tối đa 2 lần nữa nếu thất bại
        );
        return response.data;
    },

    // PHASE 2: Tạo lịch trình cho 1 ngày (AI Scoring)
    // Frontend gọi lặp lại N lần. Mỗi lần xong → render UI ngay.
    generateDayPlan: async (dayIndex: number) => {
        const response = await retryRequest(
            () => apiClient.post('/schedule/generateDayPlan', { dayIndex }),
            2 // Retry tối đa 2 lần nữa nếu thất bại
        );
        return response.data;
    },

    // PHASE 3: Lấy danh sách món ăn thay thế (Deduplicated)
    swapOptions: async (payload: { dayIndex: number, mealType: string, userLat?: number, userLng?: number }) => {
        const response = await apiClient.post('/schedule/swapOptions', payload);
        return response.data;
    }
};
