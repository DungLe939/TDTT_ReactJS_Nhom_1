import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Creators
const createCustomIcon = (color: string, isSelected = false) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: ${isSelected ? '32px' : '24px'};
        height: ${isSelected ? '32px' : '24px'};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
    iconAnchor: [isSelected ? 16 : 12, isSelected ? 32 : 24],
    popupAnchor: [0, isSelected ? -32 : -24],
  });
};

const USER_ICON = createCustomIcon('#ef4444'); // Red 🔴
const SELECTED_ICON = createCustomIcon('#f97316', true); // Orange 🟠

interface RestaurantMarker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  rating?: number;
}

interface LeafletDetailMapProps {
  userLocation?: { lat: number; lng: number };
  selectedRestaurant: RestaurantMarker;
}

const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
};

export const LeafletDetailMap: React.FC<LeafletDetailMapProps> = ({
  userLocation,
  selectedRestaurant,
}) => {
  const [route, setRoute] = useState<[number, number][]>([]);

  // Fetch route from OSRM
  useEffect(() => {
    if (!userLocation) return;

    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${selectedRestaurant.lng},${selectedRestaurant.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.routes && data.routes[0]) {
          const coords = data.routes[0].geometry.coordinates.map((c: any) => [c[1], c[0]] as [number, number]);
          setRoute(coords);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [userLocation, selectedRestaurant]);

  const center: [number, number] = [selectedRestaurant.lat, selectedRestaurant.lng];

  return (
    <div className="w-full h-full relative group">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={USER_ICON}>
            <Popup className="custom-popup">
              <div className="font-bold text-red-500">Vị trí của bạn 🔴</div>
            </Popup>
          </Marker>
        )}



        <Marker position={[selectedRestaurant.lat, selectedRestaurant.lng]} icon={SELECTED_ICON}>
          <Popup>
            <div className="text-xs">
              <p className="font-black text-orange-600">{selectedRestaurant.name} 🟠</p>
              <p className="font-medium text-slate-400 mt-1 uppercase tracking-widest text-[9px]">Đang xem món</p>
            </div>
          </Popup>
        </Marker>

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{ color: '#f97316', weight: 8, opacity: 1 }}
          />
        )}

        <MapController center={center} />
      </MapContainer>

    </div>
  );
};
