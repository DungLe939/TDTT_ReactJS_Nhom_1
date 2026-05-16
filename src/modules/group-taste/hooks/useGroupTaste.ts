import { useState, useCallback } from 'react';
import { groupTasteApiService } from '../../../services/groupTaste.service';
import type { GroupUserPayload } from '../../../services/groupTaste.service';
import type { GroupRecommendationResponse, GeoLocation } from '../types';
import { useAuth } from '@/modules/auth/context/AuthContext';

export interface GroupUser {
  id: string;
  name: string;
  tasteVector: number[];
  budget: number;
  location: { lat: number; lng: number };
  allergies: string[];
}

interface UseGroupTasteReturn {
  /** Danh sách user trong nhóm */
  users: GroupUser[];
  /** Kết quả recommendation từ backend */
  result: GroupRecommendationResponse | null;
  /** Đang tải */
  loading: boolean;
  /** Thông báo lỗi */
  error: string | null;
  /** Keyword tìm kiếm vị trí */
  locationKeyword: string;
  /** Đã quét dữ liệu nhà hàng chưa */
  hasSearchedLocation: boolean;
  /** Toạ độ khu vực đã search (dùng làm currentLocation cho recommendation) */
  searchCoords: GeoLocation | null;
  /** Thêm user vào nhóm */
  addUser: (user: GroupUser) => void;
  /** Xoá user khỏi nhóm */
  removeUser: (id: string) => void;
  /** Gọi API lấy recommendation */
  fetchRecommendations: (currentInputKeyword?: string, userLocation?: GeoLocation) => Promise<void>;
  /** Reset toàn bộ state */
  resetAll: () => void;
  /** Set danh sách users (dùng cho sync group) */
  setUsers: React.Dispatch<React.SetStateAction<GroupUser[]>>;
  /** Tìm kiếm vị trí và load nhà hàng */
  searchLocation: (keyword: string) => Promise<void>;
  /** Update manual search coords */
  setSearchCoords: React.Dispatch<React.SetStateAction<GeoLocation | null>>;
  /** Update hasSearchedLocation */
  setHasSearchedLocation: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * useGroupTaste — Custom hook quản lý toàn bộ state của module Group Taste.
 *
 * Tách logic khỏi component:
 * - Quản lý danh sách users
 * - Gọi searchLocation để populate Firestore
 * - Gọi groupTasteApiService.getRecommendations
 * - Xử lý loading/error states
 *
 * FIX: Lưu searchCoords khi search location thành công,
 * dùng searchCoords làm currentLocation khi gọi recommendation
 * thay vì dùng GPS user (gây mismatch vị trí).
 */
export const useGroupTaste = (): UseGroupTasteReturn => {
  const [users, setUsers] = useState<GroupUser[]>([]);
  const [result, setResult] = useState<GroupRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationKeyword, setLocationKeyword] = useState('');
  const [hasSearchedLocation, setHasSearchedLocation] = useState(false);
  /** Toạ độ khu vực đã quét nhà hàng — dùng làm tâm cho recommendation */
  const [searchCoords, setSearchCoords] = useState<GeoLocation | null>(null);

  const { user } = useAuth();

  const addUser = useCallback((user: GroupUser) => {
    setUsers((prev) => [...prev, user]);
  }, []);

  const removeUser = useCallback((id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  }, []);

  /**
   * Tìm kiếm khu vực để backend nạp dữ liệu nhà hàng vào Firestore.
   * Input: từ khóa khu vực. Output: cập nhật `searchCoords` và trạng thái đã quét.
   */
  const searchLocation = useCallback(async (keyword: string) => {
    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) return;

    setLoading(true);
    setError(null);
    setLocationKeyword(trimmedKeyword);

    try {
      const response = await groupTasteApiService.ensureRestaurantsLoaded(trimmedKeyword, true);

      if (!response?.success) {
        throw new Error(response?.message ?? 'Không thể tải dữ liệu nhà hàng.');
      }

      if (response?.coords) {
        setSearchCoords({ lat: response.coords.lat, lng: response.coords.lng });
      }

      setHasSearchedLocation(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải dữ liệu nhà hàng.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Lấy gợi ý nhà hàng theo khẩu vị nhóm.
   * Input: keyword tùy chọn từ UI; Output: cập nhật `result` hoặc `error`.
   */
  const fetchRecommendations = useCallback(async (currentInputKeyword?: string, userLocation?: GeoLocation) => {
    if (users.length === 0) {
      setError('Vui lòng thêm ít nhất 1 thành viên.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let effectiveCoords = searchCoords;

      if (!hasSearchedLocation) {
        const sanitizedKeyword = currentInputKeyword?.trim();
        const fallbackKeyword = sanitizedKeyword || locationKeyword || 'Quận 1, Hồ Chí Minh';
        const response = await groupTasteApiService.ensureRestaurantsLoaded(fallbackKeyword);

        if (!response?.success) {
          throw new Error(response?.message ?? 'Không thể tải dữ liệu nhà hàng cho khu vực đã chọn.');
        }

        if (response?.coords) {
          effectiveCoords = { lat: response.coords.lat, lng: response.coords.lng };
          setSearchCoords(effectiveCoords);
        }

        setHasSearchedLocation(true);
        setLocationKeyword(fallbackKeyword);
      }

      const payload: GroupUserPayload[] = users.map((u) => ({
        id: u.id,
        name: u.name,
        tasteVector: u.tasteVector,
        budget: u.budget,
        location: u.location,
        allergies: u.allergies,
      }));

      const data = await groupTasteApiService.getRecommendations(
        payload,
        effectiveCoords ?? undefined,
        userLocation ?? undefined,
        user?.id ?? undefined,
      );


      // Kiểm tra kết quả an toàn
      const dishes = data?.dishes || [];
      const totalCandidates = data?.totalCandidates ?? 0;
      const filteredCount = data?.filteredCount ?? 0;

      if (totalCandidates === 0) {
        setResult(data); // Vẫn set để xóa loading
        setError(
          'Không tìm thấy món ăn nào trong khu vực. ' +
          'Hãy thử tìm kiếm một khu vực khác (ví dụ: "Quận 1", "Đà Nẵng").',
        );
        return;
      }

      if (dishes.length === 0 && filteredCount === 0) {
        setResult(data);
        setError(
          `Tìm thấy các nhà hàng nhưng không có món nào phù hợp với tất cả thành viên. ` +
          'Hãy thử điều chỉnh ngân sách hoặc khẩu vị.',
        );
        return;
      }

      setResult(data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Có lỗi xảy ra khi gọi API.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [users, hasSearchedLocation, locationKeyword, searchCoords, user]);


  const resetAll = useCallback(() => {
    setUsers([]);
    setResult(null);
    setError(null);
    setLoading(false);
    setLocationKeyword('');
    setHasSearchedLocation(false);
    setSearchCoords(null);
  }, []);

  return {
    users,
    result,
    loading,
    error,
    locationKeyword,
    hasSearchedLocation,
    searchCoords,
    addUser,
    removeUser,
    fetchRecommendations,
    resetAll,
    setUsers,
    searchLocation,
    setSearchCoords,
    setHasSearchedLocation,
  };
};
