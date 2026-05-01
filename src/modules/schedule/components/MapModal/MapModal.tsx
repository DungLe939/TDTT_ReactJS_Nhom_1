import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, Navigation, MapPin, Loader2, Car, Footprints, Bike, ExternalLink, AlertTriangle } from 'lucide-react';
import { scheduleService } from '../../../../services/api';
import './MapModal.css';

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
    const [routeInfo, setRouteInfo] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getDestCoords = (): [number, number] => {
        if (dishInfo?.location?.coordinates) {
            const [lng, lat] = dishInfo.location.coordinates;
            return [lat, lng];
        }
        if (dishInfo?.location?.lat && dishInfo?.location?.lng) {
            return [dishInfo.location.lat, dishInfo.location.lng];
        }
        return [12.2458, 109.1943];
    };

    const destLocation = getDestCoords();

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            handleGetLocation();
        } else {
            document.body.style.overflow = 'unset';
            setRoute([]);
            setRouteInfo(null);
            setError(null);
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
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
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);
                calculateRoute(latitude, longitude, 'driving');
            },
            () => {
                setError("Bạn đã từ chối quyền lấy Vị Trí. Vui lòng cấp quyền để xem đường đi.");
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const calculateRoute = async (userLat: number, userLng: number, travelMode: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await scheduleService.getRoute({
                userLat,
                userLng,
                destLat: destLocation[0],
                destLng: destLocation[1],
                mode: travelMode,
                steps: false
            });

            if (response.success && response.geometry) {
                const coords = response.geometry.coordinates.map((c: any) => [c[1], c[0]]);
                setRoute(coords);
                setRouteInfo({
                    distance: response.distance,
                    duration: response.duration,
                    steps: response.steps
                });
            } else {
                setError(response.message || "Không thể thiết lập lộ trình đi qua đường này.");
                setRoute([]);
                setRouteInfo(null);
            }
        } catch (e: any) {
            setError(e.response?.data?.message || "Lỗi kết nối tới máy chủ tính toán đường đi.");
            setRoute([]);
            setRouteInfo(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDistance = (meters: number) => {
        if (meters < 1000) return `${Math.round(meters)}m`;
        return `${(meters / 1000).toFixed(1)}km`;
    };

    const handleOpenGoogleMaps = () => {
        if (!userLocation) return;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${destLocation[0]},${destLocation[1]}&travelmode=driving`;
        window.open(url, '_blank');
    };

    const isWarning = routeInfo && (routeInfo.distance > 10000 || routeInfo.duration > 1800);

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
                            {routeInfo && (
                                <p className="route-eta">
                                    Khoảng cách: <span className="eta-highlight">{formatDistance(routeInfo.distance)}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>



                {/* Cảnh báo thông minh */}
                {isWarning && (
                    <div className="smart-warning">
                        <AlertTriangle size={16} />
                        <span>Quán khá xa vị trí của bạn, hãy cân nhắc kẹt xe hoặc chọn "Đổi món" nếu cần thiết.</span>
                    </div>
                )}

                <div className="map-layout-wrapper">
                    <div className="map-container-wrapper">
                        {loading && (
                            <div className="map-loading-overlay">
                                <Loader2 className="animate-spin" size={32} />
                                <p>Đang tìm đường đi...</p>
                            </div>
                        )}

                        {error && (
                            <div className="map-error-msg">
                                <p>{error}</p>
                                {userLocation && <button className="retry-btn" onClick={() => calculateRoute(userLocation[0], userLocation[1], 'driving')}>Thử lại</button>}
                            </div>
                        )}

                        <MapContainer center={destLocation} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution='&copy; OpenStreetMap contributors' />
                            
                            <Marker position={destLocation}>
                                <Popup><strong>{dishInfo?.name || dishInfo?.dish}</strong><br/>{dishInfo?.address}</Popup>
                            </Marker>

                            {userLocation && (
                                <Marker position={userLocation}>
                                    <Popup>Vị trí của bạn</Popup>
                                </Marker>
                            )}

                            {route.length > 0 && (
                                <>
                                    <Polyline positions={route} pathOptions={{ color: '#ff6b00', weight: 5, opacity: 0.7 }} />
                                    <RecenterMap coords={[...route, userLocation!, destLocation]} />
                                </>
                            )}
                        </MapContainer>
                    </div>
                </div>

                <div className="map-modal-footer">
                    <div className="info-item flex-1">
                        <MapPin size={16} />
                        <span className="truncate">{dishInfo?.address || "Đang cập nhật địa chỉ"}</span>
                    </div>
                    <button className="gmaps-btn" onClick={handleOpenGoogleMaps}>
                        <ExternalLink size={16} /> Mở Google Maps
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapModal;
