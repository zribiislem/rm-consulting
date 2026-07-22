import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  value: string;
  onChange: (address: string) => void;
}

const NOMINATIM_REVERSE = 'https://nominatim.openstreetmap.org/reverse';
const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';

let debounceTimer: ReturnType<typeof setTimeout>;

export default function MapPicker({ value, onChange }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const isMapUpdating = useRef(false);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `${NOMINATIM_REVERSE}?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=fr`
      );
      if (res.ok) {
        const data = await res.json();
        isMapUpdating.current = true;
        onChange(data.display_name || `${lat}, ${lng}`);
        setTimeout(() => { isMapUpdating.current = false; }, 100);
      }
    } catch {
      isMapUpdating.current = true;
      onChange(`${lat}, ${lng}`);
      setTimeout(() => { isMapUpdating.current = false; }, 100);
    }
  }, [onChange]);

  const forwardGeocode = useCallback(async (address: string) => {
    if (!address.trim()) return;
    try {
      const res = await fetch(
        `${NOMINATIM_SEARCH}?q=${encodeURIComponent(address)}&format=json&limit=1&accept-language=fr`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0 && markerRef.current && mapInstance.current) {
          const { lat, lon } = data[0];
          markerRef.current.setLatLng([lat, lon]);
          mapInstance.current.setView([lat, lon], 13);
        }
      }
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([36.8065, 10.1815], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    const marker = L.marker([36.8065, 10.1815], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      reverseGeocode(pos.lat, pos.lng);
    });

    map.on('click', (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [reverseGeocode]);

  useEffect(() => {
    if (isMapUpdating.current || !value.trim()) return;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => forwardGeocode(value), 600);
  }, [value, forwardGeocode]);

  return (
    <div ref={mapRef} className="w-full h-64 rounded-xl border border-gray-200 z-0" />
  );
}