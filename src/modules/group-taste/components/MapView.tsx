import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, GeoJSON, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'motion/react';
import { Map as MapIcon } from 'lucide-react';
import type { GeoJsonObject } from 'geojson';
import type { ScoreResult, GeoLocation, Restaurant } from '../types';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  center: GeoLocation;
  userLocation?: GeoLocation;
  restaurants: ScoreResult[];
  highlighted: ScoreResult[];
  selectedRestaurant?: Restaurant | null;
  hoveredRestaurantId?: string | null;
  onMapClick?: (lat: number, lng: number) => void;
}

/** Fix icon mặc định của Leaflet bị mất khi bundle với Vite */
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const highlightIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  popupAnchor: [1, -40],
  shadowSize: [52, 52],
});

const formatPrice = (price: number): string =>
  new Intl.NumberFormat('vi-VN').format(price) + 'đ';

const toPercent = (score: number): number =>
  Math.round(Math.min(score, 1) * 100);

const MapUpdater: React.FC<{ 
  center: GeoLocation; 
  restaurants: ScoreResult[];
  selectedRestaurant?: Restaurant | null;
}> = ({
  center,
  restaurants,
  selectedRestaurant,
}) => {
  const map = useMap();
  const hasFitted = useRef(false);

  useEffect(() => {
    if (selectedRestaurant) {
      map.flyTo([selectedRestaurant.location.lat, selectedRestaurant.location.lng], 16, { duration: 1.0 });
    } else if (restaurants.length > 0 && !hasFitted.current) {
      const bounds = L.latLngBounds(
        restaurants.map((r) => [r.restaurant.location.lat, r.restaurant.location.lng]),
      );
      map.fitBounds(bounds.pad(0.2), { maxZoom: 16 });
      hasFitted.current = true;
    } else if (restaurants.length === 0) {
      map.setView([center.lat, center.lng], 15);
      hasFitted.current = false;
    }
  }, [center, restaurants, map, selectedRestaurant]);

  return null;
};

const MapEvents: React.FC<{ onMapClick?: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

/**
 * Component hiển thị đường đi từ Start đến End dùng OSRM API
 */
const RouteLayer: React.FC<{ start: GeoLocation; end: GeoLocation }> = ({ start, end }) => {
  const [routeGeoJSON, setRouteGeoJSON] = React.useState<GeoJsonObject | null>(null);

  useEffect(() => {
    let active = true;
    const fetchRoute = async () => {
      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`
        );
        const data = await res.json();
        if (active && data.routes && data.routes[0]) {
          setRouteGeoJSON(data.routes[0].geometry);
        }
      } catch (e) {
        console.error('Lỗi khi tải đường đi:', e);
      }
    };
    fetchRoute();
    return () => {
      active = false;
    };
  }, [start, end]);

  if (!routeGeoJSON) return null;
  return <GeoJSON key={JSON.stringify(routeGeoJSON)} data={routeGeoJSON} style={{ color: '#3b82f6', weight: 4, opacity: 0.8 }} />;
};

/**
 * MapView — Component hiển thị bản đồ Leaflet.
 *
 * Tính năng:
 * - Marker vị trí người dùng (xanh dương)
 * - Marker nhà hàng thường (đỏ)
 * - Marker nhà hàng highlight top 3 (vàng)
 * - Popup hiển thị tên, giá, điểm
 * - Auto fitBounds khi có kết quả
 */
export const MapView: React.FC<MapViewProps> = ({
  center,
  userLocation,
  restaurants,
  highlighted,
  selectedRestaurant,
  hoveredRestaurantId,
  onMapClick,
}) => {
  const highlightedIds = new Set(highlighted.map((h) => h.restaurant.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden border border-neutral-200 shadow-sm"
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-neutral-50 border-b border-neutral-100">
        <MapIcon className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-semibold text-neutral-700">Bản đồ nhà hàng</span>
        {restaurants.length > 0 && (
          <span className="text-xs text-neutral-400 ml-auto">
            {restaurants.length} nhà hàng
          </span>
        )}
      </div>

      <div style={{ height: '360px', width: '100%' }}>
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapUpdater center={center} restaurants={restaurants} selectedRestaurant={selectedRestaurant} />
          <MapEvents onMapClick={onMapClick} />

          {/* Vẽ đường đi nếu có chọn quán */}
          {selectedRestaurant && userLocation && (
            <RouteLayer start={userLocation} end={selectedRestaurant.location} />
          )}

          {/* User location marker */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
              <Popup>
                <strong>📍 Vị trí của bạn</strong>
              </Popup>
            </Marker>
          )}

          {/* Restaurant markers */}
          {restaurants.map((scored) => {
            const { restaurant, finalScore } = scored;
            const isHighlighted = highlightedIds.has(restaurant.id);
            const isSelected = selectedRestaurant?.id === restaurant.id;
            const isHovered = hoveredRestaurantId === restaurant.id;

            let currentIcon = isHighlighted ? highlightIcon : defaultIcon;
            if (isSelected || isHovered) {
              currentIcon = selectedIcon;
            }

            return (
              <Marker
                key={restaurant.id}
                position={[restaurant.location.lat, restaurant.location.lng]}
                icon={currentIcon}
                zIndexOffset={isSelected ? 1000 : isHovered ? 900 : isHighlighted ? 500 : 0}
              >
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <strong>
                      {isHighlighted && '🏆 '}
                      {restaurant.name}
                    </strong>
                    <br />
                    <span>💰 {formatPrice(restaurant.price)}</span>
                    <br />
                    <span>⭐ {restaurant.rating?.toFixed(1)}</span>
                    <br />
                    <span>📊 Điểm: {toPercent(finalScore)}%</span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </motion.div>
  );
};
