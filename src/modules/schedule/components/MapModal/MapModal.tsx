import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Navigation, MapPin, Loader2 } from 'lucide-react';
import { scheduleService } from '../../../../services/api';
import './MapModal.css';

// ==========================================
// CẤU HÌNH FIX LỖI TÀI NGUYÊN (LEAFLET ICON)
// ==========================================
// Bản thân thư viện React Leaflet khi build bằng Vite hay Webpack đôi khi sẽ bị 
// mất đường dẫn hình ảnh Marker mặc định. 
// Do đó ta cần cấu hình lại DefaultIcon thủ công ngay tại Client.
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41] // Đẩy điểm neo của Icon xuống phần mũi nhọn để chỉ chính xác toạ độ
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    dishInfo: any;
}

// ==========================================
// COMPONENT PHỤ TRỢ: RE-CENTER MAP (CĂN CHỈNH BẢN ĐỒ)
// ==========================================
// Hook useMap() chỉ hoạt động BÊN TRONG thẻ <MapContainer>. 
// Component này âm thầm theo dõi mảng `coords` (mảng chứa toạ độ điểm A và điểm B).
// Nếu `coords` thay đổi (VD tìm xong đường đi), nó tự động gọi `map.fitBounds` để
// Zoom và Pan bản đồ sao cho vừa vặn hiển thị toàn bộ lộ trình, không bị khuất khỏi màn hình.
const RecenterMap = ({ coords }: { coords: [number, number][] }) => {
    const map = useMap();
    useEffect(() => {
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] }); // padding 50px mép để không sát cạnh quá
        }
    }, [coords, map]);
    return null; // Không cần render ra UI HTML, chỉ chạy background logic
};

const MapModal = ({ isOpen, onClose, dishInfo }: MapModalProps) => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Hàm phân tích dữ liệu tọa độ từ Backend (MongoDB). 
    // MongoDB lưu Location dưới dạng GeoJSON: [Longitude, Latitude]
    // Nhưng Leaflet Map lại yêu cầu [Latitude, Longitude]. Do đó phải cẩn thận đảo ngược vị trí Array.
    const getDestCoords = (): [number, number] => {
        // Hỗ trợ cấu trúc GeoJSON [Longitude, Latitude] từ API chính
        if (dishInfo?.location?.coordinates) {
            const [lng, lat] = dishInfo.location.coordinates;
            return [lat, lng];
        }
        // Biện pháp phòng hờ (Fallback) nếu đổi API mà dữ liệu trả về là obj { lat, lng }
        if (dishInfo?.location?.lat && dishInfo?.location?.lng) {
            return [dishInfo.location.lat, dishInfo.location.lng];
        }
        // Nếu API lỗi hoàn toàn không có tọa độ quán ăn, thả ghim tạm ở trung tâm Nha Trang.
        // Hữu ích trong Demo hoặc test tránh Crash App (Màn hình trắng).
        return [12.2458, 109.1943];
    };

    const destLocation = getDestCoords();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            handleGetLocation();
        } else {
            document.body.style.overflow = 'unset';
            // Reset khi đóng modal
            setRoute([]);
            setError(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, dishInfo]);

    // Hàm kích hoạt khi Modal bật lên: Lấy GPS của thiết bị đang truy cập
    const handleGetLocation = () => {
        setLoading(true);
        setError(null);

        // Kiểm tra xem Trình duyệt có cấp quyền dùng GPS không
        if (!navigator.geolocation) {
            setError("Trình duyệt của bạn không hỗ trợ định vị GPS (Ví dụ: đang bật chế độ ẩn danh lỗi GPS).");
            setLoading(false);
            return;
        }

        // Bắt đầu đo lấy vị trí người dùng
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // Cập nhật State để thả 1 cái Marker (ghim) người dùng trên Map
                setUserLocation([latitude, longitude]);

                try {
                    // Gọi API (chạy qua NestJS) để tính toán đường đi
                    // Tại sao qua Backend chứ không gọi frontend? 
                    // => Để tránh bị lộ API Key của Map Provider, hoặc xử lý cache trên Server
                    const response = await scheduleService.getRoute({
                        userLat: latitude,
                        userLng: longitude,
                        destLat: destLocation[0],
                        destLng: destLocation[1]
                    });

                    if (response.success && response.geometry) {
                        // Backend (OSRM engine) thường trả Array đường đi theo chuẩn geoJSON [lng, lat].
                        // Ta buộc phải dùng vòng lặp đảo ngược lại thành [lat, lng] cho tính năng Polyline (Vẽ nét đứt) ở front.
                        const coords = response.geometry.coordinates.map((c: any) => [c[1], c[0]]);
                        setRoute(coords); // Lưu chuỗi tọa độ để vẽ lên bản đồ
                    } else {
                        setError("Không thể thiết lập lộ trình đi qua đường này (VD: khu vực cách ly, qua biển).");
                    }
                } catch {
                    setError("Máy chủ API OSRM bị lỗi hoặc không phản hồi. Hãy tải lại sau.");
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError("Bạn đã từ chối quyền lấy Vị Trí. Vui lòng vào cài đặt trình duyệt để mở khóa GPS.");
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 } // timeout 10 giây để tránh pending vô hạn
        );
    };

    if (!isOpen) return null;

    return (
        <div className="map-modal-overlay">
            <div className="map-modal-content">
                <div className="map-modal-header">
                    <div className="header-info">
                        <Navigation size={20} className="header-icon" />
                        <div>
                            <h3>Chỉ đường tới quán</h3>
                            <p className="dest-name">{dishInfo?.name || dishInfo?.dish}</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="map-container-wrapper">
                    {loading && (
                        <div className="map-loading-overlay">
                            <Loader2 className="animate-spin" size={32} />
                            <p>Đang tìm đường đi ngắn nhất...</p>
                        </div>
                    )}

                    {error && (
                        <div className="map-error-msg">
                            <p>{error}</p>
                            <button className="retry-btn" onClick={handleGetLocation}>Thử lại</button>
                        </div>
                    )}

                    <MapContainer
                        center={destLocation}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />

                        {/* Marker cho quán ăn */}
                        <Marker position={destLocation}>
                            <Popup>
                                <strong>{dishInfo?.name || dishInfo?.dish}</strong><br />
                                {dishInfo?.address}
                            </Popup>
                        </Marker>

                        {/* Marker cho người dùng */}
                        {userLocation && (
                            <Marker position={userLocation}>
                                <Popup>Vị trí của bạn</Popup>
                            </Marker>
                        )}

                        {/* Vẽ đường đi */}
                        {route.length > 0 && (
                            <>
                                <Polyline
                                    positions={route}
                                    pathOptions={{ color: '#ff6b00', weight: 5, opacity: 0.7 }}
                                />
                                <RecenterMap coords={[...route, userLocation!, destLocation]} />
                            </>
                        )}
                    </MapContainer>
                </div>

                <div className="map-modal-footer">
                    <div className="info-item">
                        <MapPin size={16} />
                        <span>{dishInfo?.address || "Đang cập nhật địa chỉ"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapModal;
