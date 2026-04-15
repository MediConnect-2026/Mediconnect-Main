import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface UseMapboxProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  center: [number, number];
  zoom?: number;
}

export function useMapbox({ containerRef, center, zoom = 12 }: UseMapboxProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const hasNavControlRef = useRef(false);
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
    });
    mapRef.current = map;

    if (!hasNavControlRef.current) {
      map.addControl(new mapboxgl.NavigationControl());
      hasNavControlRef.current = true;
    }

    return () => {
      map.remove();
      if (mapRef.current === map) {
        mapRef.current = null;
      }
      hasNavControlRef.current = false;
    };
  }, [containerRef]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();
    const centerChanged = currentCenter.lng !== center[0] || currentCenter.lat !== center[1];
    const zoomChanged = currentZoom !== zoom;

    if (!centerChanged && !zoomChanged) return;

    map.jumpTo({ center, zoom });
  }, [center, zoom]);

  return mapRef;
}
