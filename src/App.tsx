import { Routes, Route } from 'react-router-dom';
import Navbar from './layouts/Navbar';
import Home from './pages/Home';
import SchedulePage from './modules/schedule/pages/SchedulePage/SchedulePage';
import ScanPage from './pages/ScanPage';
import MenuPage from './pages/MenuPage';
import QuestsPage from './pages/QuestsPage';
import GroupPage from './pages/GroupPage';
import './App.css';

/**
 * Component App - Component gốc của toàn bộ ứng dụng phần Frontend ReactJS.
 * 
 * - Quản lý việc định tuyến (Routing) thông qua `react-router-dom`.
 * - Hiển thị cố định thanh điều hướng `Navbar` ở mọi trang.
 * - Trỏ các đường dẫn URL về đúng các Placeholder Page hoặc Component xử lý chính.
 */
function App() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/group" element={<GroupPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
