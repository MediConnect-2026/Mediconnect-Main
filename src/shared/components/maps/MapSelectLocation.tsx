import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import { ParseDominicanAddress } from "@/utils/addressParser";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Props {
  value?: { lat: number; lng: number };
  onChange: (lat: number, lng: number) => void;
  onLocationDetails?: (details: {
    address: string;
    neighborhood: string;
    zipCode: string;
    province?: string;
    municipality?: string;
  }) => void;
}

export default function MapSelectLocation({
  value,
  onChange,
  onLocationDetails,
}: Props) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Función para obtener detalles de la ubicación usando Mapbox Geocoding API
  const getLocationDetails = async (lng: number, lat: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=es&types=address,place,neighborhood,district,postcode`,
      );
      const data = await response.json();

      console.log("data de getlocation", data);

      if (data.features && data.features.length > 0) {
        let address = "";
        let neighborhood = "";
        let zipCode = "";

        // Extraer información de los features
        for (const feature of data.features) {
          if (feature.place_type.includes("address") && !address) {
            address = feature.place_name;
          }
          if (feature.place_type.includes("neighborhood") && !neighborhood) {
            neighborhood = feature.text;
          }
          if (feature.place_type.includes("postcode") && !zipCode) {
            zipCode = feature.text;
          }
        }

        // Si no encontramos dirección específica, usar el primer resultado
        if (!address && data.features[0]) {
          address = data.features[0].place_name;
        }

        // Parse the Dominican address
        const parsedAddress = ParseDominicanAddress(
          address || "Dirección no encontrada",
        );

        // Llamar al callback con los detalles parseados
        onLocationDetails?.({
          address: parsedAddress.direccion,
          neighborhood: neighborhood || "",
          zipCode: zipCode || "",
          province: parsedAddress.provincia,
          municipality: parsedAddress.municipio,
        });
      }
    } catch (error) {
      console.error("Error obteniendo detalles de ubicación:", error);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Coordenadas por defecto: Santo Domingo, República Dominicana
    const defaultCoords = { lat: 18.4861, lng: -69.9312 };
    const center: [number, number] =
      value?.lat && value?.lng && value.lat !== 0 && value.lng !== 0
        ? [value.lng, value.lat]
        : [defaultCoords.lng, defaultCoords.lat];

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center,
      zoom: 13,
    });

    // Agregar controles de navegación
    mapRef.current.addControl(new mapboxgl.NavigationControl());

    // Coloca marcador inicial
    const initialLat =
      value?.lat && value.lat !== 0 ? value.lat : defaultCoords.lat;
    const initialLng =
      value?.lng && value.lng !== 0 ? value.lng : defaultCoords.lng;

    markerRef.current = new mapboxgl.Marker({
      draggable: true,
      color: "#1f6c16", // Color azul para el marcador
    })
      .setLngLat([initialLng, initialLat])
      .addTo(mapRef.current);

    // Si iniciamos con coordenadas por defecto, obtener detalles
    if ((!value?.lat || value.lat === 0) && (!value?.lng || value.lng === 0)) {
      onChange(defaultCoords.lat, defaultCoords.lng);
      getLocationDetails(defaultCoords.lng, defaultCoords.lat);
    }

    // Evento cuando se arrastra el marcador
    markerRef.current.on("dragend", () => {
      const position = markerRef.current!.getLngLat();
      onChange(position.lat, position.lng);
      getLocationDetails(position.lng, position.lat);
    });

    // Evento cuando se hace clic en el mapa
    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current!.setLngLat([lng, lat]);
      onChange(lat, lng);
      getLocationDetails(lng, lat);
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && markerRef.current && value?.lat && value?.lng) {
      markerRef.current.setLngLat([value.lng, value.lat]);
      mapRef.current.setCenter([value.lng, value.lat]);
    }
  }, [value]);

  return (
    <div className="h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full rounded-xl border border-gray-300"
      />
      <p className="text-sm text-primary py-4 ">
        Haga clic en el mapa o arrastre el marcador para seleccionar la
        ubicación
      </p>
    </div>
  );
}
