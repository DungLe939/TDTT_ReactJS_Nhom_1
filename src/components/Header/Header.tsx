import { Map, ScanLine, Languages, Dices, Users } from 'lucide-react';
import './Header.css';

const Header = () => {
    return (
        <header className="site-header">
            <div className="header-container">
                {/* Logo Area */}
                <div className="logo-group">
                    <div className="logo-icon">T</div>
                    <span className="logo-text">TasteTrekker</span>
                </div>

                {/* Navigation Links */}
                <nav className="nav-links">
                    <a href="#" className="nav-link active">
                        <Map size={18} />
                        <span>Lịch trình</span>
                    </a>
                    <a href="#" className="nav-link">
                        <ScanLine size={18} />
                        <span>Quét món</span>
                    </a>
                    <a href="#" className="nav-link">
                        <Languages size={18} />
                        <span>Menu AI</span>
                    </a>
                    <a href="#" className="nav-link">
                        <Dices size={18} />
                        <span>Nhiệm vụ</span>
                    </a>
                    <a href="#" className="nav-link">
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
