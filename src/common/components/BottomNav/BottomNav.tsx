import { Calendar, Users, Scan, Trophy, Heart } from 'lucide-react';
import './BottomNav.css';

interface BottomNavProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
    const navItems = [
        { id: 'schedule', label: 'Lịch trình', icon: Calendar },
        { id: 'community', label: 'Cộng đồng', icon: Users },
        { id: 'scanning', label: 'Quét mã', icon: Scan },
        { id: 'quests', label: 'Thử thách', icon: Trophy },
        { id: 'group-taste', label: 'Cùng khẩu vị', icon: Heart },
    ];

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                    <button 
                        key={item.id}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="nav-label">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
