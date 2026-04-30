import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore — goong-js không có types chính thức
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

const GOONG_MAP_KEY = import.meta.env.VITE_GOONG_MAP_KEY as string;
const GOONG_API_KEY = import.meta.env.VITE_GOONG_API_KEY as string;

interface GoongDetailMapProps {
  userLocation?: { lat: number; lng: number };
  selectedRestaurant: {
    id: string;
    name: string;
    lat: number;
    lng: number;
    rating?: number;
  };
}

/**
 * GoongDetailMap — Thay thế LeafletDetailMap bằng Goong Maps.
 *
 * Tính năng:
 * - Hiển thị marker vị trí người dùng (màu xanh lá)
 * - Hiển thị marker nhà hàng (màu cam)
 * - Vẽ route chỉ đường từ Goong Directions API
 * - Popup thông tin khi click marker
 * - Tự động flyTo nhà hàng được chọn
 */
export const GoongDetailMap: React.FC<GoongDetailMapProps> = ({
  userLocation,
  selectedRestaurant,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const restaurantMarkerRef = useRef<any>(null);
  const routeLayerAdded = useRef(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // ── Khởi tạo bản đồ ──
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!GOONG_MAP_KEY) {
      setMapError('Thiếu VITE_GOONG_MAP_KEY trong file .env');
      return;
    }

    try {
      goongjs.accessToken = GOONG_MAP_KEY;

      mapRef.current = new goongjs.Map({
        container: mapContainerRef.current,
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: [selectedRestaurant.lng, selectedRestaurant.lat],
        zoom: 14,
        attributionControl: false,
      });

      mapRef.current.addControl(new goongjs.NavigationControl(), 'top-right');
      mapRef.current.addControl(
        new goongjs.AttributionControl({ compact: true }),
        'bottom-right',
      );

      mapRef.current.on('load', () => {
        setIsLoaded(true);
      });
    } catch (err) {
      setMapError('Không thể khởi tạo bản đồ Goong. Kiểm tra API key.');
    }

    return () => {
      userMarkerRef.current?.remove();
      restaurantMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
      routeLayerAdded.current = false;
    };
  }, []);

  // ── Cập nhật marker nhà hàng khi selectedRestaurant thay đổi ──
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    // Xóa marker cũ
    restaurantMarkerRef.current?.remove();

    // Tạo custom marker cho nhà hàng
    const el = document.createElement('div');
    el.style.cssText = `
      width: 44px; height: 44px;
      background: #F97316;
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 4px 12px rgba(249,115,22,0.5);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    `;
    const inner = document.createElement('div');
    inner.style.cssText = `
      transform: rotate(45deg);
      font-size: 18px;
      line-height: 1;
    `;
    inner.textContent = '🍽️';
    el.appendChild(inner);

    const popup = new goongjs.Popup({ offset: 30, closeButton: false }).setHTML(`
      <div style="font-family: -apple-system, sans-serif; padding: 6px 2px;">
        <p style="font-weight: 900; color: #1e293b; font-size: 13px; margin: 0 0 4px;">${selectedRestaurant.name}</p>
        ${selectedRestaurant.rating ? `<p style="color: #f59e0b; font-weight: 700; font-size: 12px; margin: 0;">⭐ ${selectedRestaurant.rating.toFixed(1)}</p>` : ''}
      </div>
    `);

    restaurantMarkerRef.current = new goongjs.Marker({ element: el, anchor: 'bottom' })
      .setLngLat([selectedRestaurant.lng, selectedRestaurant.lat])
      .setPopup(popup)
      .addTo(mapRef.current);

    // Bay đến nhà hàng
    mapRef.current.flyTo({
      center: [selectedRestaurant.lng, selectedRestaurant.lat],
      zoom: 15,
      speed: 1.5,
      curve: 1.2,
    });
  }, [selectedRestaurant, isLoaded]);

  // ── Marker người dùng ──
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !userLocation) return;

    userMarkerRef.current?.remove();

    const el = document.createElement('div');
    el.style.cssText = `
      width: 20px; height: 20px;
      background: #10B981;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 6px rgba(16,185,129,0.2);
    `;

    userMarkerRef.current = new goongjs.Marker({ element: el })
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(
        new goongjs.Popup({ offset: 15, closeButton: false }).setHTML(
          `<div style="font-family:-apple-system,sans-serif;font-weight:700;color:#10b981;font-size:12px;padding:4px 0;">📍 Vị trí của bạn</div>`,
        ),
      )
      .addTo(mapRef.current);
  }, [userLocation, isLoaded]);

  // ── Vẽ Route từ Goong Directions API ──
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !userLocation || !GOONG_API_KEY) return;

    const drawRoute = async () => {
      try {
        const origin = `${userLocation.lat},${userLocation.lng}`;
        const destination = `${selectedRestaurant.lat},${selectedRestaurant.lng}`;
        const url = `https://rsapi.goong.io/Direction?origin=${origin}&destination=${destination}&vehicle=car&api_key=${GOONG_API_KEY}`;

        const res = await fetch(url);
        const data = await res.json();

        const route = data.routes?.[0];
        if (!route?.overview_polyline?.points) return;

        // Decode encoded polyline từ Goong
        const encoded = route.overview_polyline.points;
        const coords = decodePolyline(encoded);

        const map = mapRef.current;

        // Xóa layer route cũ nếu có
        if (routeLayerAdded.current) {
          if (map.getLayer('goong-route')) map.removeLayer('goong-route');
          if (map.getLayer('goong-route-border')) map.removeLayer('goong-route-border');
          if (map.getSource('goong-route')) map.removeSource('goong-route');
        }

        map.addSource('goong-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: coords.map((c) => [c[1], c[0]]),
            },
          },
        });

        // Border (viền trắng phía dưới)
        map.addLayer({
          id: 'goong-route-border',
          type: 'line',
          source: 'goong-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#ffffff', 'line-width': 10, 'line-opacity': 0.9 },
        });

        // Route chính (màu cam)
        map.addLayer({
          id: 'goong-route',
          type: 'line',
          source: 'goong-route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: { 'line-color': '#F97316', 'line-width': 6, 'line-opacity': 0.95 },
        });

        routeLayerAdded.current = true;

        // Fit bounds để thấy cả route
        const bounds = new goongjs.LngLatBounds();
        bounds.extend([userLocation.lng, userLocation.lat]);
        bounds.extend([selectedRestaurant.lng, selectedRestaurant.lat]);
        map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
      } catch (err) {
        // Route không bắt buộc, bỏ qua nếu lỗi
      }
    };

    drawRoute();
  }, [userLocation, selectedRestaurant, isLoaded]);

  // ── Error State ──
  if (mapError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-50 gap-4 p-8">
        <div className="text-4xl">🗺️</div>
        <p className="text-sm font-bold text-slate-500 text-center">{mapError}</p>
        <a
          href={`https://maps.app.goo.gl/?q=${selectedRestaurant.lat},${selectedRestaurant.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl hover:bg-orange-600 transition-colors"
        >
          Mở Google Maps thay thế
        </a>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-neutral-100">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

/**
 * Giải mã Google Encoded Polyline (cũng dùng bởi Goong).
 * Trả về mảng [lat, lng].
 */
function decodePolyline(encoded: string): [number, number][] {
  const coords: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    coords.push([lat / 1e5, lng / 1e5]);
  }

  return coords;
}

export default GoongDetailMap;
