import { useState, useEffect, useRef } from 'react';
import { X, Search, MapPin, Loader2, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { scheduleService } from '../../../../services/api';
import 'leaflet/dist/leaflet.css';
import './LocationPickerModal.css';

// Sửa lỗi icon marker của leaflet trong react
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (locationName: string) => void;
}

// Component phụ để điều khiển bản đồ (flyTo) từ bên ngoài
const MapController = ({ center }: { center: [number, number] | null }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 13, { animate: true, duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

// Component phụ để bắt sự kiện click trên bản đồ
const ClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

const LocationPickerModal = ({ isOpen, onClose, onConfirm }: LocationPickerModalProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    
    // State bản đồ
    const [mapCenter, setMapCenter] = useState<[number, number]>([16.047079, 108.206230]); // Default: Đà Nẵng
    const [selectedPos, setSelectedPos] = useState<[number, number] | null>(null);
    const [selectedName, setSelectedName] = useState('');
    
    const [isSearching, setIsSearching] = useState(false);
    const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);

    // Xử lý khóa cuộn trang khi mở modal
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Xin quyền GPS nếu có thể
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setMapCenter([position.coords.latitude, position.coords.longitude]);
                    },
                    () => {
                        // Bỏ qua nếu user từ chối
                    }
                );
            }
        } else {
            document.body.style.overflow = 'unset';
            // Reset state
            setSearchQuery('');
            setSelectedPos(null);
            setSelectedName('');
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Autocomplete cho ô tìm kiếm
    useEffect(() => {
        if (searchQuery.trim().length > 2 && showSuggestions) {
            const delayDebounceFn = setTimeout(async () => {
                try {
                    const res = await scheduleService.autocompleteLocation(searchQuery);
                    if (res.success && res.data) {
                        setSuggestions(res.data);
                    }
                } catch (err) {
                    console.error("Lỗi Autocomplete:", err);
                }
            }, 300);

            return () => clearTimeout(delayDebounceFn);
        } else if (searchQuery.trim().length <= 2) {
            setSuggestions([]);
        }
    }, [searchQuery, showSuggestions]);

    if (!isOpen) return null;

    // Xử lý khi chọn từ danh sách gợi ý hoặc bấm nút Search
    const handleSearchSelect = async (locationName: string) => {
        const shortName = locationName.split(',')[0];
        setSearchQuery(shortName);
        setShowSuggestions(false);
        setIsSearching(true);

        try {
            const res = await scheduleService.searchLocation(shortName);
            if (res?.success && res?.coords) {
                const newPos: [number, number] = [res.coords.lat, res.coords.lng];
                setMapCenter(newPos);
                setSelectedPos(newPos);
                setSelectedName(shortName);
            } else {
                alert('Không thể tìm thấy tọa độ cho địa điểm này!');
            }
        } catch (error) {
            console.error(error);
            alert('Có lỗi xảy ra khi tìm kiếm địa điểm.');
        } finally {
            setIsSearching(false);
        }
    };

    // Xử lý click tự do trên bản đồ (Reverse Geocoding)
    const handleMapClick = async (lat: number, lng: number) => {
        setSelectedPos([lat, lng]);
        setIsReverseGeocoding(true);
        setSelectedName('Đang lấy tên địa điểm...');

        try {
            // Sử dụng Nominatim API (OpenStreetMap) miễn phí để dịch toạ độ -> địa chỉ
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            
            if (data && data.address) {
                // Ưu tiên lấy tên thành phố/quận/huyện để làm điểm du lịch
                const name = data.address.city || data.address.town || data.address.county || data.address.state || data.name || 'Địa điểm không tên';
                setSelectedName(name);
                setSearchQuery(name); // Cập nhật lại thanh search
            } else {
                setSelectedName('Vị trí đã chọn (Chưa rõ tên)');
            }
        } catch (error) {
            console.error("Lỗi Reverse Geocoding:", error);
            setSelectedName(`Vị trí: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
            setIsReverseGeocoding(false);
        }
    };

    return (
        <div className="location-picker-overlay">
            <div className="location-picker-content">
                {/* Header & Search */}
                <div className="picker-header">
                    <div className="picker-title-row">
                        <h2>Chọn Điểm Đến Du Lịch</h2>
                        <button className="picker-close" onClick={onClose}>
                            <X size={24} />
                        </button>
                    </div>

                    <div className="picker-search-container">
                        <div className="picker-search-wrapper">
                            <Search size={18} className="picker-search-icon" />
                            <input
                                type="text"
                                className="picker-search-input"
                                placeholder="Nhập tên thành phố, địa danh..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    if (searchQuery.length > 2) setShowSuggestions(true);
                                }}
                                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearchSelect(searchQuery);
                                    }
                                }}
                            />

                            {/* Dropdown gợi ý */}
                            {showSuggestions && suggestions.length > 0 && (
                                <ul className="picker-autocomplete-dropdown">
                                    {suggestions.map((item, index) => (
                                        <li
                                            key={index}
                                            className="picker-autocomplete-item"
                                            onMouseDown={(e) => {
                                                e.preventDefault(); // Tránh mất focus input
                                                handleSearchSelect(item.name);
                                            }}
                                        >
                                            <MapPin size={16} className="picker-ac-icon" />
                                            <span className="picker-ac-text">{item.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <button 
                            className="picker-search-btn"
                            onClick={() => handleSearchSelect(searchQuery)}
                            disabled={isSearching || searchQuery.trim().length === 0}
                        >
                            {isSearching ? <Loader2 size={20} className="animate-spin" /> : 'Tìm kiếm'}
                        </button>
                    </div>
                </div>

                {/* Map Area */}
                <div className="picker-map-wrapper">
                    {isReverseGeocoding && (
                        <div className="picker-map-loading">
                            <Loader2 size={32} className="animate-spin" />
                            <span>Đang định vị...</span>
                        </div>
                    )}
                    <MapContainer
                        center={mapCenter}
                        zoom={13}
                        style={{ width: '100%', height: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapController center={mapCenter} />
                        <ClickHandler onMapClick={handleMapClick} />
                        
                        {selectedPos && (
                            <Marker position={selectedPos}>
                                <Popup>
                                    <strong>Vị trí đã chọn</strong><br />
                                    {selectedName}
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                {/* Footer Area */}
                <div className="picker-footer">
                    <div className="picker-selected-info">
                        <div className="picker-info-icon">
                            <MapPin size={24} />
                        </div>
                        <div className="picker-info-text">
                            <span className="picker-info-label">Đang chọn:</span>
                            <span className="picker-info-value" title={selectedName}>
                                {selectedName || 'Chưa chọn vị trí nào'}
                            </span>
                        </div>
                    </div>
                    <button
                        className="picker-confirm-btn"
                        disabled={!selectedName || isReverseGeocoding}
                        onClick={() => {
                            if (selectedName) onConfirm(selectedName);
                        }}
                    >
                        <Check size={20} /> Xác nhận điểm đến
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LocationPickerModal;
