import { X, Calendar } from 'lucide-react';
import { useState } from 'react';
import './ScheduleFilterModal.css';

interface ScheduleFilterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    isLoading: boolean;
}

const TASTE_OPTIONS = [
    { value: 'chua', label: 'Chua' },
    { value: 'cay', label: 'Cay' },
    { value: 'man', label: 'Mặn' },
    { value: 'ngot', label: 'Ngọt' },
    { value: 'nhat', label: 'Thanh Nhạt' }
];

const ScheduleFilterModal = ({ isOpen, onClose, onSubmit, isLoading }: ScheduleFilterModalProps) => {
    // Form States
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [budget, setBudget] = useState<number | ''>('');
    const [favoriteFoods, setFavoriteFoods] = useState('');
    const [dislikedFoods, setDislikedFoods] = useState('');
    const [allergies, setAllergies] = useState('');
    const [tastes, setTastes] = useState<string[]>([]);

    if (!isOpen) return null;

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Parse CSV to arrays
        const commaToArray = (str: string) => str.split(',').map(s => s.trim()).filter(Boolean);

        const travelDays = calculateDays(startDate, endDate);

        if (travelDays <= 0) {
            alert('Vui lòng chọn ngày đi và ngày về hợp lệ!');
            return;
        }

        const formData = {
            budget: Number(budget),
            location: location,
            travelDays: travelDays,
            preferences: {
                favoriteFoods: commaToArray(favoriteFoods),
                tastes: tastes,
                allergies: commaToArray(allergies),
                dislikedFoods: commaToArray(dislikedFoods)
            }
        };

        onSubmit(formData);
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
                        <input 
                            type="text" 
                            required
                            placeholder="VD: Đà Nẵng, Phú Quốc..."
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
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
