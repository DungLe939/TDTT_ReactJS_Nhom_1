import { MapPin, Filter } from 'lucide-react';
import './ScheduleBanner.css';
import mapBanner from '../../../../assets/images/map-banner-bg.png';

interface ScheduleBannerProps {
    title: string;
    subtitle: string;
    onFilterClick?: () => void;
}

const ScheduleBanner = ({ title, subtitle, onFilterClick }: ScheduleBannerProps) => {
    return (
        <div className="schedule-banner">
            <div className="banner-background">
                <img src={mapBanner} alt="Map Background" className="banner-img" />
                <div className="banner-overlay"></div>
            </div>
            
            <div className="banner-content">
                <div className="banner-info">
                    <h1 className="banner-title">{title}</h1>
                    <div className="banner-subtitle">
                        <MapPin size={18} className="location-icon" />
                        <span>{subtitle}</span>
                    </div>
                </div>

                <button className="filter-button" onClick={onFilterClick} aria-label="Open Filters">
                    <Filter size={24} />
                </button>
            </div>
        </div>
    );
};

export default ScheduleBanner;
