import axios from 'axios';

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
 */
export const scheduleService = {
    // Gọi AI/Google Map tìm kiếm thông tin địa danh tọa độ
    searchLocation: async (keyword: string) => {
        const response = await apiClient.post('/schedule/searchLocation', { keyword });
        return response.data;
    },
    
    // Gửi payload các mốc đã ghim để hệ thống Gen AI tự sinh lịch trình FoodTour
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
    }
};
