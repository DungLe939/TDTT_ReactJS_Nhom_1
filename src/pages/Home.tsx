import SchedulePage from '../modules/schedule/pages/SchedulePage/SchedulePage';

/**
 * Bản thiết kế của nhóm gọi phần lịch trình là "Home".
 * Trực tiếp nhúng SchedulePage chứa toàn vẹn toàn bộ logic của phần schedule
 * đè vào đây. Mạch hoạt động của nhóm sẽ gọi file này và trúng ngay logic xử lý thật.
 */
export const Home = () => {
    return <SchedulePage />;
};

export default Home;