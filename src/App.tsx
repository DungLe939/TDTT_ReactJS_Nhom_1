import { Routes, Route } from 'react-router-dom';
import Navbar from './layouts/Navbar';
import Home from './pages/Home';
import SchedulePage from './modules/schedule/pages/SchedulePage/SchedulePage';
import ScanPage from './pages/ScanPage';
import MenuPage from './pages/MenuPage';
import QuestsPage from './pages/QuestsPage';
import GroupPage from './pages/GroupPage';
import './App.css';

function App() {
  return (
    <>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/group" element={<GroupPage />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
