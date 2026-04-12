/**
 * retryRequest: Hàm bọc (wrapper) giúp tự động gọi lại API khi thất bại.
 * 
 * CƠ CHẾ EXPONENTIAL BACKOFF:
 * - Lần 1 thất bại → chờ 1 giây → thử lại
 * - Lần 2 thất bại → chờ 2 giây → thử lại
 * - Lần 3 thất bại → throw error (bỏ cuộc)
 * 
 * Tại sao cần Retry?
 * - API Gemini (Free tier) hay bị "rate limit" → lần đầu lỗi, lần sau thường thành công.
 * - OSRM API đôi khi timeout do mạng không ổn định.
 * - Nominatim (OpenStreetMap) giới hạn 1 request/giây, dễ bị 429 nếu gọi nhanh quá.
 * 
 * @param fn - Hàm async cần retry (VD: () => apiClient.post('/schedule/generateDayPlan', payload))
 * @param maxRetries - Số lần thử lại tối đa (mặc định 2 lần, tổng cộng 3 lần gọi)
 * @returns Kết quả trả về từ hàm fn nếu thành công
 */
export const retryRequest = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 2
): Promise<T> => {
    let lastError: any;

    // Tổng số lần thử = lần đầu + maxRetries lần retry
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Thử gọi hàm
            return await fn();
        } catch (error) {
            lastError = error;

            // Nếu đã hết lượt retry → throw error ra ngoài
            if (attempt >= maxRetries) {
                break;
            }

            // Exponential backoff: chờ (attempt + 1) giây trước khi thử lại
            // Lần 1: chờ 1s, Lần 2: chờ 2s
            const delayMs = (attempt + 1) * 1000;
            console.warn(
                `[Retry] Lần ${attempt + 1}/${maxRetries} thất bại. Thử lại sau ${delayMs}ms...`
            );
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    // Nếu tất cả lần thử đều thất bại
    throw lastError;
};
