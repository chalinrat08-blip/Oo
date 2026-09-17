import React, { useEffect, useRef } from "react";
import L from "leaflet";

interface InteractiveMapProps {
  latitude: number;
  longitude: number;
  title: string;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  latitude,
  longitude,
  title,
  className = "h-64 w-full rounded-xl overflow-hidden"
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up previous map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
        attributionControl: false
      }).setView([latitude, longitude], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19
      }).addTo(map);

      // Custom HTML Marker Pin
      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `<div style="
          background-color: #059669;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: 3px solid white;
          font-weight: bold;
        ">📍</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      L.marker([latitude, longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b>${title}</b><br>พิกัด: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        .openPopup();

      mapInstanceRef.current = map;
    } catch (e) {
      console.warn("Leaflet map initialization skipped or reloaded", e);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [latitude, longitude, title]);

  return (
    <div className={`relative ${className} border border-stone-200 shadow-inner bg-stone-100`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 z-[400] bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-xs text-stone-600 shadow-xs border border-stone-200">
        พิกัด: {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </div>
    </div>
  );
};
