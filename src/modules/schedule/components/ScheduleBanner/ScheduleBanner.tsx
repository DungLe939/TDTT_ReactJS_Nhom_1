import { MapPin, Filter } from 'lucide-react';
import './ScheduleBanner.css';

interface ScheduleBannerProps {
    title: string;
    subtitle: string;
    onFilterClick?: () => void;
}

/**
 * ScheduleBanner - Banner bản đồ phía trên trang Schedule.
 * Giao diện đồng bộ theo Figma Home.tsx (Header & Map Overview).
 * Props và callbacks giữ nguyên 100%.
 */
const ScheduleBanner = ({ title, subtitle, onFilterClick }: ScheduleBannerProps) => {
    return (
        <div className="relative h-48 bg-neutral-200">
            {/* Food image - high quality collage */}
            <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80"
                alt="Food Tour"
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

            {/* Content ở phía dưới */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-white">
                <div>
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <p className="text-sm opacity-90 flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> {subtitle}
                    </p>
                </div>
                <button
                    className="bg-white/20 backdrop-blur-md p-2 rounded-xl border border-white/30 transition-transform duration-200 hover:scale-110 active:scale-95"
                    onClick={onFilterClick}
                    aria-label="Open Filters"
                >
                    <Filter className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default ScheduleBanner;
