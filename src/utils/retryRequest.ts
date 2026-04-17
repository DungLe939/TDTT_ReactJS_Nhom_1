/**
 * Thử gọi lại một hàm async theo cơ chế exponential backoff.
 * Input: `fn` và số lần retry tối đa. Output: giá trị thành công hoặc throw lỗi cuối cùng.
 */
export const retryRequest = async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 2
): Promise<T> => {
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            const errorWithCode = error as { code?: string; name?: string };
            if (
                errorWithCode?.code === 'ERR_CANCELED' ||
                errorWithCode?.name === 'CanceledError'
            ) {
                throw error;
            }

            if (attempt >= maxRetries) {
                break;
            }

            const delayMs = (attempt + 1) * 1000;
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }

    throw lastError;
};
