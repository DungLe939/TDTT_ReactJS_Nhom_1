/**
 * Định dạng tiền tệ VND.
 * @param price - Số tiền
 */
export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

/**
 * Chuyển đổi điểm số (0-1) sang phần trăm (0-100).
 * @param score - Điểm số thập phân
 */
export const toPercent = (score: number): number =>
  Math.round(Math.min(Math.max(score, 0), 1) * 100);

/**
 * Sinh ID ngẫu nhiên cho user hoặc group.
 * @param prefix - Tiền tố ID (ví dụ: 'user', 'grp')
 */
export const generateId = (prefix: string): string =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
