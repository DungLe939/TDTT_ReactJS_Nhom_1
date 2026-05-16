import axios from 'axios';
import { retryRequest } from '../utils/retryRequest';
import type {
    ScanFoodItem,
    ScanMultiPredictResponse,
    ScanMultiPredictResult,
    ScanMultiDetectResponse,
    ScanObjectDetailResponse,
} from '../modules/scanning/types/scan.types';

export interface ScanSystemInfoResponse {
    name?: string;
    description?: string;
    technologies?: string;
    endpoints?: Record<string, string>;
}

export type ScanHealthResponse = Record<string, unknown>;

type GenericScanPayload = Record<string, unknown>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

/**
 * Biến toàn cục lấy từ file .env:
 * - VITE_API_URL: API chính của hệ thống (NestJS)
 * - VITE_API_CQ_URL: API dành riêng cho tính năng Dịch Menu và OCR (Công Quang)
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_CQ_URL = import.meta.env.VITE_API_CQ_URL || API_URL;
const SCAN_API_URL = (import.meta.env.VITE_SCAN_API_URL || '').replace(/\/+$/, '');
const SCAN_PROXY_PREFIX = '/scan-api';
const SCAN_CLIENT_BASE_URL = import.meta.env.DEV
    ? SCAN_PROXY_PREFIX
    : SCAN_API_URL || undefined;
const SCAN_TIMEOUT_MS = 180000;

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

/**
 * Client riêng cho các tính năng của Công Quang (Dịch menu, OCR)
 */
export const cqApiClient = axios.create({
    baseURL: API_CQ_URL,
    withCredentials: true,
});

const scanClient = axios.create({
    baseURL: SCAN_CLIENT_BASE_URL,
    timeout: SCAN_TIMEOUT_MS,
    headers: {
        'X-Pinggy-No-Screen': 'true',
    },
});

const ensureScanApiConfigured = () => {
    if (!SCAN_API_URL) {
        throw new Error('Thieu cau hinh VITE_SCAN_API_URL trong file .env');
    }
};

const normalizePredictContent = (content: unknown) => {
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

const normalizePredictStatus = (payload: GenericScanPayload): string => {
    const rawStatus = payload.status;

    if (typeof rawStatus === 'string') {
        return rawStatus.trim().toLowerCase();
    }

    if (typeof rawStatus === 'number') {
        return String(rawStatus);
    }

    const rawSuccess = payload.success;
    if (typeof rawSuccess === 'boolean') {
        return rawSuccess ? 'success' : 'error';
    }

    return '';
};

const extractPredictPayload = (rawData: unknown): GenericScanPayload => {
    let candidate: unknown = rawData;

    if (typeof candidate === 'string') {
        const trimmed = candidate.trim();
        if (!trimmed) {
            return {};
        }

        try {
            candidate = JSON.parse(trimmed);
        } catch {
            return {
                status: 'error',
                message: `Payload /predict khong phai JSON hop le: ${trimmed.slice(0, 180)}`,
            };
        }
    }

    if (!isRecord(candidate)) {
        return {};
    }

    const nestedData = candidate.data;
    if (
        isRecord(nestedData) &&
        !('status' in candidate) &&
        !('content' in candidate)
    ) {
        return nestedData;
    }

    return candidate;
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
     * Truy vấn dữ liệu bản đồ để vẽ chỉ đường giữa các món ăn.
     * @param payload - Chứa danh sách các điểm đi qua 
     * @returns Dữ liệu Geometry để vẽ lên bản đồ Leaflet.
     */
    getRoute: async (payload: unknown) => {
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
    preparePlan: async (payload: unknown) => {
        const response = await retryRequest(
            () => apiClient.post('/schedule/preparePlan', payload),
            3 // Thực hiện lại tối đa 3 lần nếu có lỗi mạng hoặc AI quá tải (Retry logic)
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
            3 // Có hỗ trợ retry để đảm bảo tính ổn định của luồng AI (Groq + Gemini)
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
    },

    /**
     * Lấy toàn bộ danh sách quán ăn + món ăn để hiển thị trong modal "Thêm bữa ăn phụ".
     * Không còn lọc theo isSnack — frontend tự filter theo category.
     */
    getAllDishes: async () => {
        const response = await apiClient.post('/schedule/allDishes', {});
        return response.data;
    }
};

/**
 * Scan service: Kết nối trực tiếp tới endpoint FastAPI public qua Pinggy.
 * Chỉ dùng cho luồng nhận diện món ăn và lấy audio kể chuyện.
 */
export const scanService = {
    getSystemInfo: async (signal?: AbortSignal): Promise<ScanSystemInfoResponse> => {
        ensureScanApiConfigured();

        const response = await scanClient.get<ScanSystemInfoResponse>('/', {
            signal,
        });

        return response.data;
    },

    getHealth: async (signal?: AbortSignal): Promise<ScanHealthResponse> => {
        ensureScanApiConfigured();

        const response = await scanClient.get<ScanHealthResponse>('/health', {
            signal,
        });

        return response.data;
    },

    predictFood: async (
        imageFile: File,
        signal?: AbortSignal
    ): Promise<ScanMultiPredictResult> => {
        ensureScanApiConfigured();

        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await retryRequest(
            () =>
                scanClient.post<ScanMultiPredictResponse>('/predict', formData, {
                    signal,
                }),
            0
        );

        const data = extractPredictPayload(response.data) as ScanMultiPredictResponse &
            GenericScanPayload;
        const normalizedStatus = normalizePredictStatus(data);

        // Normalize multi-food results nếu API trả về
        const normalizedResults: ScanFoodItem[] | undefined = data.results?.map(
            (item: ScanFoodItem) => ({
                ...item,
                content: normalizePredictContent(item.content),
            })
        );

        return {
            ...data,
            status: normalizedStatus || 'unknown',
            content: normalizePredictContent(data.content),
            results: normalizedResults,
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

    /**
     * Detect nhiều món ăn trong 1 ảnh (YOLO + CLIP).
     * Trả về danh sách objects kèm crop_b64 để gọi tiếp getObjectDetail.
     */
    detectMultiFoods: async (
        imageFile: File,
        signal?: AbortSignal
    ): Promise<ScanMultiDetectResponse> => {
        ensureScanApiConfigured();

        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await retryRequest(
            () =>
                scanClient.post<ScanMultiDetectResponse>(
                    '/predict_multi',
                    formData,
                    { signal }
                ),
            0
        );

        return response.data;
    },

    /**
     * Lấy chi tiết (story + TTS) cho 1 crop cụ thể từ /predict_object.
     */
    getObjectDetail: async (
        cropB64: string,
        signal?: AbortSignal
    ): Promise<ScanObjectDetailResponse> => {
        ensureScanApiConfigured();

        const response = await scanClient.post<ScanObjectDetailResponse>(
            '/predict_object',
            { crop_b64: cropB64 },
            { signal }
        );

        return response.data;
    },
};

/**
 * Service cho tính năng Quét Menu (Menu OCR)
 * Gọi API nội bộ của NestJS thay vì external FastAPI.
 */
export const menuScanService = {
    scanMenuImage: async (imageFile: File, signal?: AbortSignal): Promise<{ success: boolean; text: string }> => {
        const formData = new FormData();
        formData.append('file', imageFile);

        console.log('[MenuScan] Calling API:', `${API_CQ_URL}/menu-scan`);
        const response = await cqApiClient.post<{ success: boolean; text: string }>('/menu-scan', formData, {
            signal,
            headers: {
                'X-Pinggy-No-Screen': 'true',
            },
        });

        return response.data;
    },
};
