import { apiClient } from './api';
import { scheduleService } from './api';
import { retryRequest } from '../utils/retryRequest';
import { generateId } from '../modules/group-taste/utils/math.utils';
import type { GroupRecommendationResponse } from '../modules/group-taste/types';

export interface GroupUserPayload {
  id?: string;
  tasteVector: number[];
  budget: number;
  location?: { lat: number; lng: number };
}

/** Toạ độ mặc định: Quận 1, TP.HCM */
const DEFAULT_LOCATION = { lat: 10.7626, lng: 106.6602 };

/**
 * Response từ searchLocation endpoint.
 * Bao gồm coords (toạ độ khu vực đã tìm kiếm).
 */
interface SearchLocationResponse {
  success: boolean;
  message?: string;
  coords?: { lat: number; lng: number };
  data?: unknown[];
}

export const groupTasteApiService = {
  /**
   * Đảm bảo Firestore đã có nhà hàng cho khu vực.
   * Gọi /schedule/searchLocation nếu chưa có (mặc định cache qua sessionStorage).
   *
   * @param keyword - Từ khóa tìm kiếm khu vực
   * @param forceRefresh - Bỏ qua cache và buộc gọi lại backend
   * @returns Response chứa coords của khu vực đã tìm
   */
  ensureRestaurantsLoaded: async (keyword: string, forceRefresh = false): Promise<SearchLocationResponse | null> => {
    if (!keyword.trim()) {
      throw new Error('Keyword tìm kiếm khu vực không hợp lệ.');
    }

    const normalized = keyword.trim().toLowerCase();
    const cacheKey = `group_taste_searched_${normalized}`;

    if (!forceRefresh && sessionStorage.getItem(cacheKey)) {
      const cachedCoords = sessionStorage.getItem(`${cacheKey}_coords`);
      if (cachedCoords) {
        try {
          return { success: true, coords: JSON.parse(cachedCoords) };
        } catch {
          // ignore parse error
        }
      }
      return { success: true };
    }

    // Nếu ép làm mới, xóa cache cũ (phòng khi lỗi mạng)
    if (forceRefresh) {
      sessionStorage.removeItem(cacheKey);
      sessionStorage.removeItem(`${cacheKey}_coords`);
    }

    const response = (await scheduleService.searchLocation(keyword)) as SearchLocationResponse;

    if (!response?.success) {
      throw new Error(response?.message ?? 'Không thể tải dữ liệu nhà hàng cho khu vực đã chọn.');
    }

    sessionStorage.setItem(cacheKey, 'true');

    if (response.coords) {
      sessionStorage.setItem(`${cacheKey}_coords`, JSON.stringify(response.coords));
    }

    return response;
  },

  /**
   * Gọi API recommendation từ backend.
   *
   * Nhận searchCoords riêng biệt thay vì tính từ user GPS.
   * Ưu tiên: searchCoords > user average location > DEFAULT_LOCATION
   *
   * @param users - Danh sách thành viên nhóm
   * @param searchCoords - Toạ độ khu vực đã quét (từ searchLocation)
   */
  getRecommendations: async (
    users: GroupUserPayload[],
    searchCoords?: { lat: number; lng: number },
  ): Promise<GroupRecommendationResponse> => {
    if (users.length === 0) {
      throw new Error('Danh sách thành viên trống. Không thể gợi ý nhà hàng.');
    }

    // Map frontend format -> backend DTO format
    const backendUsers = users.map((u) => ({
      userId: u.id,
      tasteVector: u.tasteVector,
      budget: u.budget,
    }));

    // Ưu tiên tọa độ khu vực đã quét để đồng bộ với tập nhà hàng backend.
    const currentLocation = searchCoords ?? DEFAULT_LOCATION;

    const response = await retryRequest(
      () =>
        apiClient.post('/group/recommend', {
          users: backendUsers,
          currentLocation,
        }),
      2,
    );

    return response.data;
  },

  createGroup: async (): Promise<{ groupId: string }> => {
    try {
      const response = await apiClient.post('/group-taste/create');
      return response.data;
    } catch {
      return { groupId: generateId('grp') };
    }
  },

  getGroup: async (
    groupId: string,
  ): Promise<{ groupId: string; users: GroupUserPayload[] }> => {
    try {
      const response = await apiClient.get(`/group-taste/${groupId}`);
      return response.data;
    } catch {
      return { groupId, users: [] };
    }
  },

  joinGroup: async (
    groupId: string,
    user: GroupUserPayload,
  ): Promise<{ success: boolean }> => {
    try {
      const response = await apiClient.post(`/group-taste/${groupId}/join`, user);
      return response.data;
    } catch {
      return { success: true };
    }
  },
};
