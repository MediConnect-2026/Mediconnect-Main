import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import { type Provider } from "@/data/providers";
import ProviderPopup from "./ProviderPopup"; // Adjust the import path as needed

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface MapSearchProvidersProps {
  providers: Provider[];
  selectedProviders?: string[];
  onProviderSelect?: (id: string) => void;
}

export default function MapSearchProviders({
  providers,
  selectedProviders = [],
  onProviderSelect,
}: MapSearchProvidersProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-69.93, 18.48], // Santo Domingo, RD
      zoom: 12,
    });

    // Limpiar markers anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    providers.forEach((provider) => {
      const isSelected = selectedProviders.includes(provider.id);

      // Crear elemento para el popup
      const popupNode = document.createElement("div");
      const root = createRoot(popupNode);

      root.render(
        <ProviderPopup
          provider={provider}
          isSelected={isSelected}
          onSelect={(id) => onProviderSelect?.(id)}
        />,
      );

      // Crear popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        closeOnClick: true,
        maxWidth: "none",
      }).setDOMContent(popupNode);

      // Crear marker
      const marker = new mapboxgl.Marker({
        color: provider.type === "doctor" ? "#d57725" : "#16a34a",
        scale: isSelected ? 1.2 : 1,
      })
        .setLngLat([provider.coordinates.lng, provider.coordinates.lat])
        .setPopup(popup)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      mapRef.current?.remove();
    };
  }, [providers, selectedProviders, onProviderSelect]);

  // Ajustar vista cuando cambian los providers
  useEffect(() => {
    if (!mapRef.current || providers.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    providers.forEach((provider) => {
      bounds.extend([provider.coordinates.lng, provider.coordinates.lat]);
    });

    mapRef.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15,
    });
  }, [providers]);

  return <div ref={containerRef} className="h-full w-full rounded-xl" />;
}
