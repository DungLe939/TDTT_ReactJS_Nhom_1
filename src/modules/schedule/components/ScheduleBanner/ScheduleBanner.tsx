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
            {/* Map image - ảnh tĩnh theo thiết kế Figma */}
            <img
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80"
                alt="Map"
                className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

            {/* Heatmap indicators - theo đúng Figma */}
            <div className="absolute top-10 left-1/4 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse"></div>
            <div className="absolute top-20 left-1/2 w-4 h-4 rounded-full bg-yellow-400 border-2 border-white shadow-[0_0_10px_rgba(250,204,21,0.8)]"></div>
            <div className="absolute bottom-12 right-1/4 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>

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
