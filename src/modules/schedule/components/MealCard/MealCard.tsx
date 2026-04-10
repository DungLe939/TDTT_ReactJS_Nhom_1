import { Navigation, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import './MealCard.css';

// ==========================================
// COMPONENT GIAO DIỆN: THẺ MÓN ĂN (MEAL CARD)
// ==========================================
// Giao diện đồng bộ theo Figma Home.tsx (MEALS card layout).
// Component này chỉ chịu trách nhiệm "Hiển thị" (Dumb Component),
// nhận dữ liệu dưới dạng Props từ cha (DailyPlanView) và in ra UI.
interface MealCardProps {
    session?: 'SÁNG' | 'TRƯA' | 'TỐI';
    type?: 'main' | 'snack';
    time: string;
    dishInfo: any;
    onShowMap?: (dishInfo: any) => void;
    onShowDetail?: (dishInfo: any) => void;
    onSwap?: (dishInfo: any) => void;
}

const MealCard = ({ session, type = 'main', time, dishInfo, onShowMap, onShowDetail, onSwap }: MealCardProps) => {
    const hasWarning = dishInfo.warning;

    return (
        <div className={`bg-white rounded-2xl p-3 shadow-sm border border-neutral-100 flex gap-4 relative overflow-hidden`}>
            {/* Warning banner - theo Figma */}
            {hasWarning && (
                <div className="absolute top-0 right-0 left-0 bg-red-50 text-red-600 text-xs px-3 py-1 flex items-center gap-1 font-medium border-b border-red-100">
                    <AlertTriangle className="w-3 h-3" /> Món này hơi giống bữa trước, bạn có muốn đổi?
                    <button className="ml-auto text-red-700 underline font-bold" onClick={() => onSwap?.(dishInfo)}>Đổi món</button>
                </div>
            )}

            {/* Ảnh món ăn - theo Figma */}
            <div
                className={`w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-neutral-100 ${hasWarning ? 'mt-6' : ''}`}
            >
                {dishInfo.img ? (
                    <img src={dishInfo.img} alt={dishInfo.dish} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400 font-medium">
                        Chưa có ảnh
                    </div>
                )}
            </div>

            {/* Thông tin món ăn - theo Figma */}
            <div className={`flex-1 py-1 flex flex-col justify-between ${hasWarning ? 'mt-6' : ''}`}>
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Tag bữa chính / bữa phụ - màu khác nhau */}
                        {type === 'main' ? (
                            <span className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-md">Bữa chính</span>
                        ) : (
                            <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">Bữa phụ</span>
                        )}
                        {type === 'main' && session && (
                            <span className="text-xs font-bold text-white bg-neutral-800 px-2 py-0.5 rounded-md uppercase tracking-wider">{session}</span>
                        )}
                        <span className="text-xs text-neutral-500 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {time}
                        </span>
                    </div>
                    <h3 className="font-bold text-neutral-800 leading-tight">
                        {dishInfo.dish}
                    </h3>
                    {dishInfo.name && (
                        <p
                            className="text-xs text-neutral-500 mt-0.5 truncate cursor-pointer hover:text-orange-600 transition-colors"
                            onClick={() => onShowDetail?.(dishInfo)}
                        >
                            {dishInfo.name}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                        {dishInfo.category || (type === 'main' ? 'Món chính' : 'Ăn vặt')}
                    </span>

                    <div className="flex items-center gap-1.5">
                        {type === 'main' && (
                            <button
                                className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                                onClick={() => onSwap?.(dishInfo)}
                                title="Đổi món ăn"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                            onClick={() => onShowMap?.(dishInfo)}
                            title="Xem chỉ đường"
                        >
                            <Navigation className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MealCard;
