import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Quan trọng để gửi/nhận cookie (guest_id)
});

// API Lịch trình
export const scheduleService = {
    searchLocation: async (keyword: string) => {
        const response = await apiClient.post('/schedule/searchLocation', { keyword });
        return response.data;
    },
    
    generatePlan: async (payload: any) => {
        const response = await apiClient.post('/schedule/generatePlan', payload);
        return response.data;
    }
};
