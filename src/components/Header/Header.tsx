import { Map, ScanLine, Languages, Dices, Users } from 'lucide-react';
import './Header.css';

interface HeaderProps {
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
    const handleNavClick = (e: React.MouseEvent, tab: string) => {
        e.preventDefault();
        onTabChange?.(tab);
    };

    return (
        <header className="site-header">
            <div className="header-container">
                {/* Logo Area */}
                <div className="logo-group" style={{ cursor: 'pointer' }} onClick={() => onTabChange?.('schedule')}>
                    <div className="logo-icon">T</div>
                    <span className="logo-text">TasteTrekker</span>
                </div>

                {/* Navigation Links */}
                <nav className="nav-links">
                    <a 
                        href="#" 
                        className={`nav-link ${activeTab === 'schedule' ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, 'schedule')}
                    >
                        <Map size={18} />
                        <span>Lịch trình</span>
                    </a>
                    <a 
                        href="#" 
                        className={`nav-link ${activeTab === 'scanning' ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, 'scanning')}
                    >
                        <ScanLine size={18} />
                        <span>Quét món</span>
                    </a>
                    <a 
                        href="#" 
                        className={`nav-link ${activeTab === 'community' ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, 'community')}
                    >
                        <Languages size={18} />
                        <span>Cộng đồng AI</span>
                    </a>
                    <a 
                        href="#" 
                        className={`nav-link ${activeTab === 'quests' ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, 'quests')}
                    >
                        <Dices size={18} />
                        <span>Nhiệm vụ</span>
                    </a>
                    <a 
                        href="#" 
                        className={`nav-link ${activeTab === 'group-taste' ? 'active' : ''}`}
                        onClick={(e) => handleNavClick(e, 'group-taste')}
                    >
                        <Users size={18} />
                        <span>Nhóm ăn</span>
                    </a>
                </nav>

                {/* Actions */}
                <div className="header-actions">
                    <button className="btn btn-primary">Đăng nhập</button>
                    <button className="btn btn-dark">Admin</button>
                </div>
            </div>
        </header>
    );
};

export default Header;
