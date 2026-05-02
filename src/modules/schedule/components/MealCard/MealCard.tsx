import { Navigation, RefreshCw, Clock, AlertTriangle } from 'lucide-react';
import './MealCard.css';

/**
 * Component MealCard - Hiển thị thẻ thông tin món ăn/quán ăn.
 * 
 * Component chỉ nhận dữ liệu và hiển thị lên giao diện.
 * Cấu trúc Card được thiết kế tối ưu cho trải nghiệm di động với:
 * - Avatar quán ăn bên trái.
 * - Thông tin món, thời gian, tag bữa ăn ở giữa.
 * - Các nút chức năng (Đổi món, Xem bản đồ) ở góc dưới bên phải.
 */
interface MealCardProps {
    session?: 'SÁNG' | 'TRƯA' | 'TỐI'; // Buổi ăn (chỉ dành cho bữa chính)
    type?: 'main' | 'snack';           // Phân loại: Món chính hay Món ăn vặt (phụ)
    time: string;                      // Khung giờ ăn (ví dụ: 08:30)
    dishInfo: any;                     // Toàn bộ dữ liệu Metadata về quán ăn và món ăn
    onShowMap?: (dishInfo: any) => void;
    onShowDetail?: (dishInfo: any) => void;
    onSwap?: (dishInfo: any) => void;
}

const MealCard = ({ session, type = 'main', time, dishInfo, onShowMap, onShowDetail, onSwap }: MealCardProps) => {

    // hasWarning: Được kích hoạt khi AI nhận diện món này quá giống các món bạn đã ăn trước đó
    const hasWarning = dishInfo.warning;

    return (
        <div className={`bg-white rounded-2xl p-3 shadow-sm border border-neutral-100 flex gap-4 relative overflow-hidden`}>

            {/* AI Warning Banner: Hiển thị cảnh báo thông minh nếu thực đơn bị lặp lại */}
            {hasWarning && (
                <div className="absolute top-0 right-0 left-0 bg-red-50 text-red-600 text-xs px-3 py-1 flex items-center gap-1 font-medium border-b border-red-100">
                    <AlertTriangle className="w-3 h-3" /> Món này hơi giống bữa trước, bạn có muốn đổi?
                    <button className="ml-auto text-red-700 underline font-bold" onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onSwap?.(dishInfo);
                    }}>Đổi món</button>
                </div>
            )}

            {/* Thumbnail quán ăn: Có logic xử lý lùi vị trí nếu có banner cảnh báo phía trên */}
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

            {/* Thông tin chi tiết món ăn */}
            <div className={`flex-1 py-1 flex flex-col justify-between ${hasWarning ? 'mt-6' : ''}`}>
                <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {/* Tags: Phân biệt Bữa chính (Xanh teal) và Bữa phụ (Cam) */}
                        {type === 'main' ? (
                            <span className="text-xs font-bold text-white bg-teal-600 px-2 py-0.5 rounded-md">Bữa chính</span>
                        ) : (
                            <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md">Bữa phụ</span>
                        )}

                        {/* Hiển thị buổi (Sáng/Trưa/Tối) nếu là bữa chính */}
                        {type === 'main' && session && (
                            <span className="text-xs font-bold text-white bg-neutral-800 px-2 py-0.5 rounded-md uppercase tracking-wider">{session}</span>
                        )}

                        {/* Thời gian ăn */}
                        <span className="text-xs text-neutral-500 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {time}
                        </span>
                    </div>

                    {/* Tên món ăn (Ví dụ: Bún chả cá) */}
                    <h3 className="font-bold text-neutral-800 leading-tight">
                        {dishInfo.dish}
                    </h3>

                    {/* Tên quán ăn: Có hiệu ứng hover và trỏ đến Modal chi tiết */}
                    {dishInfo.name && (
                        <p
                            className="text-xs text-neutral-500 mt-0.5 truncate cursor-pointer hover:text-orange-600 transition-colors"
                            onClick={() => onShowDetail?.(dishInfo)}
                        >
                            {dishInfo.name}
                        </p>
                    )}
                </div>

                {/* Footer của thẻ: Phân loại và các nút tương tác nhanh */}
                <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-lg">
                        {dishInfo.category || (type === 'main' ? 'Món chính' : 'Ăn vặt')}
                    </span>

                    <div className="flex items-center gap-1.5">
                        {/* Nút Đổi món: Hiển thị cho cả bữa chính và bữa phụ */}
                        <button
                            className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-orange-100 hover:text-orange-600 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onSwap?.(dishInfo);
                            }}
                            title="Đổi món ăn"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Nút Xem chỉ đường: Mở Modal bản đồ */}
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
