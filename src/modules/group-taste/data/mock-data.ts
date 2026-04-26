/**
 * Taste vector dimensions — khớp với backend (8 chiều):
 *   [0] Cay       - Spicy
 *   [1] Ngọt      - Sweet
 *   [2] Mặn       - Savory/Salty
 *   [3] Chua      - Sour
 *   [4] Béo       - Rich/Fatty
 *   [5] Thanh đạm - Light/Fresh
 *   [6] Chay      - Vegetarian
 *
 * Mapping đồng bộ với backend scoring.ts → TASTE_DIMENSIONS
 */
export const TASTE_LABELS = [
  'Cay',
  'Ngọt',
  'Mặn',
  'Chua',
  'Béo',
  'Thanh đạm',
  'Chay',
] as const;
