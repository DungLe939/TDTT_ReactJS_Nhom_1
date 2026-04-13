import axios from 'axios';
import { retryRequest } from '../utils/retryRequest';
import type {
    ScanPredictResponse,
    ScanPredictResult,
} from '../modules/scanning/types/scan.types';

/**
 * Biến toàn cục lấy từ file .env (VITE_API_URL).
 * Nếu chưa setup .env, hệ thống sẽ mặc định trỏ về 'http://localhost:3000' 
 * là địa chỉ chạy mặc định của server NestJS Backend khi phát triển local.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const SCAN_API_URL = import.meta.env.VITE_SCAN_API_URL || '';

/**
 * Khởi tạo apiClient - Một Axios Instance dùng chung cho toàn dự án.
 * 
 * Tại sao dùng Instance? 
 * 1. Không cần lặp lại baseURL ở mỗi lần gọi.
 * 2. Cấu hình `withCredentials: true` cực kỳ quan trọng: Nó cho phép Frontend nhận và gửi kèm 
 *    Cookies (như guest_id hoặc Session) từ Backend. Đây là cơ chế cốt lõi để duy trì trạng thái 
 *    AI Streaming và Caching giữa các yêu cầu khác nhau mà không cần dùng Token phức tạp.
 */
export const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

const scanClient = axios.create({
    baseURL: SCAN_API_URL || undefined,
    timeout: 45000,
});

const ensureScanApiConfigured = () => {
    if (!SCAN_API_URL) {
        throw new Error('Thieu cau hinh VITE_SCAN_API_URL trong file .env');
    }
};

const normalizePredictContent = (content: ScanPredictResponse['content']) => {
    if (typeof content === 'string') {
        return content;
    }

    if (content && typeof content === 'object') {
        const textValues = Object.values(content).filter(
            (value): value is string => typeof value === 'string'
        );

        if (textValues.length > 0) {
            return textValues.join(' ');
        }

        return JSON.stringify(content);
    }

    return '';
};

/**
 * Object `scheduleService` - Chứa toàn bộ logic giao tiếp mạng cho Module Lịch Trình (Schedule).
 * 
 * Luồng hoạt động chính:
 * Đã chuyển sang mô hình "Prepare-Then-Generate(Streaming)" giúp giảm thời gian chờ của người dùng.
 */
export const scheduleService = {

    /**
     * Tìm kiếm địa điểm và lấy tọa độ GPS.
     * @param keyword - Tên địa danh (ví dụ: 'Đà Nẵng', 'Quận 1')
     * @returns Trả về đối tượng chứa { success: boolean, coords: { lat, lng } }
     */
    searchLocation: async (keyword: string) => {
        const response = await apiClient.post('/schedule/searchLocation', { keyword });
        return response.data;
    },

    /**
     * Gửi toàn bộ thông tin để tạo lịch trình (Phiên bản đồng bộ )
     */
    generatePlan: async (payload: any) => {
        const response = await apiClient.post('/schedule/generatePlan', payload);
        return response.data;
    },

    /**
     * Truy vấn dữ liệu bản đồ để vẽ chỉ đường giữa các món ăn.
     * @param payload - Chứa danh sách các điểm đi qua 
     * @returns Dữ liệu Geometry để vẽ lên bản đồ Leaflet.
     */
    getRoute: async (payload: any) => {
        const response = await apiClient.post('/schedule/route', payload);
        return response.data;
    },

    /**
     * Gợi ý địa điểm tự động khi người dùng gõ vào ô tìm kiếm.
     * @param keyword - Ký tự người dùng đang gõ
     */
    autocompleteLocation: async (keyword: string) => {
        const response = await apiClient.post('/schedule/autocomplete', { keyword });
        return response.data;
    },

    // STREAMING AI (TỐI ƯU HIỆU NĂNG)

    /**
     * Bước 1: Chuẩn bị dữ liệu 
     * Backend sẽ thực hiện lọc thô hàng ngàn quán ăn, chạy thuật toán K-Means để phân nhóm (Clustering) 
     * các quán ăn theo từng khu vực địa lý dựa trên số ngày đi.
     * Dữ liệu sau khi xử lý sẽ được CACHE tại RAM của Server để các bước sau truy cập cực nhanh.
     */
    preparePlan: async (payload: any) => {
        const response = await retryRequest(
            () => apiClient.post('/schedule/preparePlan', payload),
            2 // Thực hiện lại tối đa 2 lần nếu có lỗi mạng hoặc AI quá tải (Retry logic)
        );
        return response.data;
    },

    /**
     * Bước 2: Tạo lịch trình cho một ngày cụ thể dựa trên Cache.
     * Thay vì tạo 7 ngày cùng lúc mất 45 giây, Frontend gọi hàm này 7 lần. 
     * Mỗi lần Backend trả về lịch trình 1 ngày mất 3-5 giây -> Người dùng nhìn thấy kết quả ngay lập tức.
     * @param dayIndex - Chỉ số ngày cần tạo (0, 1, 2...)
     */
    generateDayPlan: async (dayIndex: number) => {
        const response = await retryRequest(
            () => apiClient.post('/schedule/generateDayPlan', { dayIndex }),
            2 // Có hỗ trợ retry để đảm bảo tính ổn định của luồng AI
        );
        return response.data;
    },

    /**
     * Lấy danh sách các quán ăn thay thế khi người dùng muốn "Đổi món".
     * Các phương án trả về đảm bảo không trùng lặp với các quán đã có trong lịch trình hiện tại.
     */
    swapOptions: async (payload: { dayIndex: number, mealType: string, userLat?: number, userLng?: number }) => {
        const response = await apiClient.post('/schedule/swapOptions', payload);
        return response.data;
    }
};

/**
 * Scan service: Kết nối trực tiếp tới endpoint FastAPI public qua Pinggy.
 * Chỉ dùng cho luồng nhận diện món ăn và lấy audio kể chuyện.
 */
export const scanService = {
    predictFood: async (
        imageFile: File,
        signal?: AbortSignal
    ): Promise<ScanPredictResult> => {
        ensureScanApiConfigured();

        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await retryRequest(
            () =>
                scanClient.post<ScanPredictResponse>('/predict', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    signal,
                }),
            1
        );

        const data = response.data;
        return {
            ...data,
            content: normalizePredictContent(data.content),
        };
    },

    fetchNarrationAudio: async (signal?: AbortSignal): Promise<Blob> => {
        ensureScanApiConfigured();

        const response = await scanClient.get<Blob>('/audio', {
            responseType: 'blob',
            signal,
        });

        return response.data;
    },
};
