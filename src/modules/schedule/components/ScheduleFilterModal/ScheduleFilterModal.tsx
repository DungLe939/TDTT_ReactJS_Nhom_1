import { X, Calendar, MapPin, CheckCircle2, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { scheduleService } from '../../../../services/api';
import './ScheduleFilterModal.css';

interface ScheduleFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading: boolean;
    prefilledLocation?: string;
}

const TASTE_OPTIONS = [
    { value: 'chua', label: 'Chua' },
    { value: 'cay', label: 'Cay' },
    { value: 'man', label: 'Mặn' },
    { value: 'ngot', label: 'Ngọt' },
    { value: 'nhat', label: 'Thanh Nhạt' }
];

const ScheduleFilterModal = ({ isOpen, onClose, onSubmit, isLoading, prefilledLocation }: ScheduleFilterModalProps) => {
    // ==========================================
    // LOGIC: KHÔI PHỤC DỮ LIỆU CŨ TỪ LOCALSTORAGE
    // ==========================================
    // Giúp người dùng lỡ tắt Modal bật lại thì không phải gõ lại từ đầu.
    const getInitialData = () => {
        const saved = localStorage.getItem('FOOD_TOUR_FORM_DATA');
        return saved ? JSON.parse(saved) : {};
    };

    const initialData = getInitialData();

    // Form States
    const [location, setLocation] = useState(initialData.location || '');
    const [startDate, setStartDate] = useState(initialData.startDate || '');
    const [endDate, setEndDate] = useState(initialData.endDate || '');
    const [budget, setBudget] = useState<number | ''>(initialData.budget || '');
    const [favoriteFoods, setFavoriteFoods] = useState(initialData.favoriteFoods || '');
    const [dislikedFoods, setDislikedFoods] = useState(initialData.dislikedFoods || '');
    const [allergies, setAllergies] = useState(initialData.allergies || '');
    const [tastes, setTastes] = useState<string[]>(initialData.tastes || []);

    // Autocomplete States
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // ==========================================
    // EFFECT: ĐỒNG BỘ LOCATION TỪ EXTERNAL PROP (Bản đồ)
    // ==========================================
    useEffect(() => {
        if (prefilledLocation) {
            setLocation(prefilledLocation);
            
            // Tự động quét quán ăn tại địa điểm vừa nhận từ bản đồ để cập nhật dữ liệu mới
            setPrefetchStatus('loading');
            prefetchCoordsRef.current = null;
            
            const shortName = prefilledLocation.split(',')[0];
            scheduleService.searchLocation(shortName)
                .then((res) => {
                    if (res?.success && res?.coords) {
                        prefetchCoordsRef.current = res.coords;
                        setPrefetchStatus('done');
                    } else {
                        setPrefetchStatus('error');
                    }
                })
                .catch(() => {
                    setPrefetchStatus('error');
                });
        }
    }, [prefilledLocation]);

    // ==========================================
    // PRE-FETCH STATE: Quét quán ăn ngầm khi chọn địa điểm
    // ==========================================
    // Khi user chọn địa điểm từ Autocomplete, ta gọi `searchLocation` ngay lập tức
    // để quét quán ăn + lưu DB. User tiếp tục điền form bình thường,
    // khi bấm "Tạo lịch trình" thì dữ liệu đã sẵn sàng → tiết kiệm ~18 giây.
    const [prefetchStatus, setPrefetchStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
    const prefetchCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

    // ==========================================
    // EFFECT: AUTOCOMPLETE VỚI DEBOUNCE (300ms)
    // ==========================================
    useEffect(() => {
        if (location.trim().length > 2 && showSuggestions) {
            const delayDebounceFn = setTimeout(async () => {
                try {
                    const res = await scheduleService.autocompleteLocation(location);
                    if (res.success && res.data) {
                        setSuggestions(res.data);
                    }
                } catch (err) {
                    console.error("Lỗi Autocomplete:", err);
                }
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        } else if (location.trim().length <= 2) {
            setSuggestions([]);
        }
    }, [location, showSuggestions]);

    // Tự động lưu LocalStorage mỗi khi có thay đổi (Auto-save)
    useEffect(() => {
        const formData = {
            location, startDate, endDate, budget,
            favoriteFoods, dislikedFoods, allergies, tastes
        };
        localStorage.setItem('FOOD_TOUR_FORM_DATA', JSON.stringify(formData));
    }, [location, startDate, endDate, budget, favoriteFoods, dislikedFoods, allergies, tastes]);

    if (!isOpen) return null;

    // ==========================================
    // NGHIỆP VỤ: XỬ LÝ CHECKBOX KHẨU VỊ (TASTES)
    // ==========================================
    // Vì khẩu vị là Mảng (Chọn được nhiều ô), nên mỗi khi bấm ta phải:
    // Kiểm tra xem đã có trong mảng chưa -> Nếu có gỡ ra (filter), chưa có thì thêm vào (Toán tử spread).
    const handleTasteChange = (tasteValue: string) => {
        setTastes(prev =>
            prev.includes(tasteValue)
                ? prev.filter(t => t !== tasteValue)
                : [...prev, tasteValue]
        );
    };

    const calculateDays = (start: string, end: string) => {
        if (!start || !end) return 0;
        const d1 = new Date(start);
        const d2 = new Date(end);
        const diffTime = Math.abs(d2.getTime() - d1.getTime());
        // Add 1 to count both start and end days
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };

    // ==========================================
    // NGHIỆP VỤ: XỬ LÝ NỘP FORM (SUBMIT ĐỂ GỌI API)
    // ==========================================
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Chặn hành vi Reload rành trang mặc định của thẻ <form>

        // Chuẩn hóa chuỗi text "A, B, C" thành mảng ["A", "B", "C"] chuẩn bị nộp cho Backend (NestJS yêu cầu Array)
        const commaToArray = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

        const travelDays = calculateDays(startDate, endDate);

        if (travelDays <= 0) {
            alert('Vui lòng chọn ngày đi và ngày về hợp lệ!');
            return;
        }

        // Gom toàn bộ State rải rác lại thành 1 cục Payload duy nhất chuẩn khớp Schema Backend.
        const formData = {
            budget: Number(budget),
            location: location,
            travelDays: travelDays,
            startDate: startDate,
            preferences: {
                favoriteFoods: commaToArray(favoriteFoods),
                tastes: tastes,
                allergies: commaToArray(allergies),
                dislikedFoods: commaToArray(dislikedFoods)
            }
        };

        // Truyền thêm prefetchCoords cho SchedulePage để không cần gọi lại searchLocation
        onSubmit({
            ...formData,
            prefetchCoords: prefetchCoordsRef.current,
            prefetchReady: prefetchStatus === 'done'
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <button className="modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <div className="modal-header">
                    <h2>Khai báo thông tin lộ trình</h2>
                    <p>Hãy cho chúng tôi biết sở thích và ngân sách để tạo ra lịch trình hoàn hảo cho bạn.</p>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                    {/* Destination */}
                    <div className="form-group">
                        <label>Địa điểm du lịch *</label>
                        <div className="location-input-container">
                            <input
                                type="text"
                                required
                                placeholder="VD: Đà Nẵng, Phú Quốc..."
                                value={location}
                                onChange={(e) => {
                                    setLocation(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    if (location.length > 2) setShowSuggestions(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowSuggestions(false), 200);
                                }}
                            />
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="autocomplete-dropdown">
                                    {suggestions.map((item, index) => (
                                        <li
                                            key={index}
                                            className="autocomplete-item"
                                            onMouseDown={(e) => {
                                                e.preventDefault(); // Ngăn input mất focus quá sớm
                                                const shortName = item.name.split(',')[0];
                                                setLocation(shortName);
                                                setShowSuggestions(false);

                                                // ==========================================
                                                // PRE-FETCH: Gọi searchLocation NGẦM ngay khi chọn địa điểm!
                                                // ==========================================
                                                setPrefetchStatus('loading');
                                                prefetchCoordsRef.current = null;
                                                scheduleService.searchLocation(shortName)
                                                    .then((res) => {
                                                        if (res?.success && res?.coords) {
                                                            prefetchCoordsRef.current = res.coords;
                                                            setPrefetchStatus('done');
                                                        } else {
                                                            setPrefetchStatus('error');
                                                        }
                                                    })
                                                    .catch(() => {
                                                        setPrefetchStatus('error');
                                                    });
                                            }}
                                        >
                                            <MapPin size={14} className="ac-icon" />
                                            <span className="ac-text">{item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Hiển thị trạng thái pre-fetch cho user biết hệ thống đang làm việc ngầm */}
                        {prefetchStatus === 'loading' && (
                            <div className="prefetch-status loading">
                                <Loader2 size={14} className="animate-spin" />
                                <span>Đang quét quán ăn tại {location}...</span>
                            </div>
                        )}
                        {prefetchStatus === 'done' && (
                            <div className="prefetch-status done">
                                <CheckCircle2 size={14} />
                                <span>Đã sẵn sàng dữ liệu quán ăn!</span>
                            </div>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Ngày đi *</label>
                            <div className="date-input-wrapper">
                                <Calendar size={18} className="input-icon" />
                                <input
                                    type="date"
                                    required
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Ngày về *</label>
                            <div className="date-input-wrapper">
                                <Calendar size={18} className="input-icon" />
                                <input
                                    type="date"
                                    required
                                    min={startDate}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Budget */}
                    <div className="form-group">
                        <label>Tổng ngân sách khả dụng (VNĐ) *</label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="50000"
                            placeholder="VD: 5000000"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
                        />
                    </div>

                    <hr className="divider" />

                    <h4>Thông tin ẩm thực</h4>

                    {/* Tastes */}
                    <div className="form-group">
                        <label>Khẩu vị đặc trưng</label>
                        <div className="checkbox-group">
                            {TASTE_OPTIONS.map(opt => (
                                <label key={opt.value} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        checked={tastes.includes(opt.value)}
                                        onChange={() => handleTasteChange(opt.value)}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Foods */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Món ăn yêu thích</label>
                            <input
                                type="text"
                                placeholder="Ghi cách nhau bởi dấu phẩy. VD: phở, bún chả"
                                value={favoriteFoods}
                                onChange={(e) => setFavoriteFoods(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label>Món ăn không thích</label>
                            <input
                                type="text"
                                placeholder="VD: mắm tôm, đồ tây"
                                value={dislikedFoods}
                                onChange={(e) => setDislikedFoods(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Allergies */}
                    <div className="form-group">
                        <label>Dị ứng (nếu có)</label>
                        <input
                            type="text"
                            placeholder="VD: hải sản, đậu phộng"
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="modal-footer">
                        <button type="submit" className="btn-submit" disabled={isLoading}>
                            {isLoading ? 'Đang tạo lịch trình...' : 'Tạo lịch trình'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleFilterModal;
