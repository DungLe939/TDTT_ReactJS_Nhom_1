import { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import SchedulePage from './modules/schedule/pages/SchedulePage/SchedulePage';
import PlaceholderPage from './common/components/PlaceholderPage/PlaceholderPage';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('schedule');

  // Load tab từ LocalStorage
  useEffect(() => {
    const savedTab = localStorage.getItem('APP_ACTIVE_TAB');
    if (savedTab) setActiveTab(savedTab);
  }, []);

  // Save tab vào LocalStorage
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    localStorage.setItem('APP_ACTIVE_TAB', tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'schedule':
        return <SchedulePage />;
      case 'community':
        return <PlaceholderPage title="Cộng đồng AI" />;
      case 'scanning':
        return <PlaceholderPage title="Quét mã" />;
      case 'quests':
        return <PlaceholderPage title="Nhiệm vụ" />;
      case 'group-taste':
        return <PlaceholderPage title="Nhóm ăn" />;
      default:
        return <SchedulePage />;
    }
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <div className="main-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default App;
