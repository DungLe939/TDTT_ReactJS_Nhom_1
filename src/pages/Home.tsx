import SchedulePage from '../modules/schedule/pages/SchedulePage/SchedulePage';

/**
 * Component Home - Thành phần trang chủ của ứng dụng TasteTrekker.
 * 
 * Trực tiếp gọi Component `SchedulePage` từ Module Schedule.
 * 
 * Điều này đảm bảo:
 * 1. Toàn bộ logic Lịch trình được gom nhóm trong Module riêng.
 * 2. Khi nhóm phát triển thêm các phần khác (Scan, Menu), trang chủ vẫn tự động 
 *    hiển thị đúng Module Lịch trình mà không bị phân tán code.
 */
export const Home = () => {
  // Trả về toàn bộ trang Lịch trình thực tế
  return <SchedulePage />;
};

export default Home;