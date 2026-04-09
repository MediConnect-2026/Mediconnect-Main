import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

interface Provider {
  id: string;
  name: string;
  type: "doctor" | "center";
  specialty?: string;
  lat: number;
  lng: number;
}

interface Props {
  map: mapboxgl.Map | null;
  providers: Provider[];
  onSelect?: (provider: Provider) => void;
}

const getPopupHtml = (provider: Provider) => `
  <strong>${provider.name}</strong><br/>
  ${provider.specialty ?? "Centro medico"}<br/>
  <button id="provider-${provider.id}">
    Ver detalle
  </button>
`;

export function useDoctorMarkers({ map, providers, onSelect }: Props) {
  const onSelectRef = useRef<Props["onSelect"]>(onSelect);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const providersByIdRef = useRef<Map<string, Provider>>(new Map());

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const markers = markersRef.current;

    return () => {
      markers.forEach((marker) => marker.remove());
      markers.clear();
      providersByIdRef.current = new Map();
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;

    providersByIdRef.current = new Map(providers.map((provider) => [provider.id, provider]));

    const nextIds = new Set(providers.map((provider) => provider.id));

    markersRef.current.forEach((marker, markerId) => {
      if (!nextIds.has(markerId)) {
        marker.remove();
        markersRef.current.delete(markerId);
      }
    });

    providers.forEach((provider) => {
      const existingMarker = markersRef.current.get(provider.id);

      if (existingMarker) {
        existingMarker.setLngLat([provider.lng, provider.lat]);
        existingMarker
          .getPopup()
          ?.setHTML(getPopupHtml(provider));
        return;
      }

      const marker = new mapboxgl.Marker({
        color: provider.type === "doctor" ? "#2563eb" : "#16a34a",
      })
        .setLngLat([provider.lng, provider.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 20 }).setHTML(getPopupHtml(provider))
        )
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        const selectedProvider = providersByIdRef.current.get(provider.id);
        if (selectedProvider) {
          onSelectRef.current?.(selectedProvider);
        }
      });

      markersRef.current.set(provider.id, marker);
    });
  }, [map, providers]);
}
