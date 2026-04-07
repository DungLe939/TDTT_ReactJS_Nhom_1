import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Navigation, MapPin, Loader2 } from 'lucide-react';
import { scheduleService } from '../../../../services/api';
import './MapModal.css';

// Fix icon default của Leaflet (nếu dùng icon mặc định)
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapModalProps {
    isOpen: boolean;
    onClose: () => void;
    dishInfo: any;
}

// Component trợ giúp để tự động căn chỉnh bản đồ khi có dữ liệu đường đi
const RecenterMap = ({ coords }: { coords: [number, number][] }) => {
    const map = useMap();
    useEffect(() => {
        if (coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [coords, map]);
    return null;
};

const MapModal = ({ isOpen, onClose, dishInfo }: MapModalProps) => {
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getDestCoords = (): [number, number] => {
        // Hỗ trợ cấu trúc GeoJSON [Longitude, Latitude] từ backend
        if (dishInfo?.location?.coordinates) {
            const [lng, lat] = dishInfo.location.coordinates;
            return [lat, lng];
        }
        // Fallback nếu có .lat và .lng (tùy phiên bản dữ liệu)
        if (dishInfo?.location?.lat && dishInfo?.location?.lng) {
            return [dishInfo.location.lat, dishInfo.location.lng];
        }
        // Fallback mặc định: Nha Trang (thay vì HCMC để gần với ngữ cảnh người dùng đang quét)
        return [12.2458, 109.1943]; 
    };

    const destLocation = getDestCoords();

    useEffect(() => {
        if (isOpen) {
            handleGetLocation();
        } else {
            // Reset khi đóng modal
            setRoute([]);
            setError(null);
        }
    }, [isOpen, dishInfo]);

    const handleGetLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Trình duyệt của bạn không hỗ trợ định vị GPS.");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);
                
                try {
                    const response = await scheduleService.getRoute({
                        userLat: latitude,
                        userLng: longitude,
                        destLat: destLocation[0],
                        destLng: destLocation[1]
                    });

                    if (response.success && response.geometry) {
                        // OSRM trả về [lng, lat], Leaflet cần [lat, lng]
                        const coords = response.geometry.coordinates.map((c: any) => [c[1], c[0]]);
                        setRoute(coords);
                    } else {
                        setError("Không tìm thấy đường đi.");
                    }
                } catch {
                    setError("Lỗi khi lấy dữ liệu đường đi.");
                } finally {
                    setLoading(false);
                }
            },
            () => {
                setError("Vui lòng bật GPS và cho phép truy cập vị trí để xem chỉ đường.");
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
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
