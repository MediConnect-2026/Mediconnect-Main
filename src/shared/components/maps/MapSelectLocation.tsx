import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection, Geometry } from "geojson";
import type { LngLatBoundsLike } from "mapbox-gl";
import bbox from "@turf/bbox";
import {
  ParseDominicanAddress,
  type ParsedDominicanAddress,
} from "@/utils/addressParser";
import { Expand, Minimize, Plus, Minus, Cuboid } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { featureCollection } from "@turf/helpers";

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
  fontSizeVariant?: "xs" | "s" | "m" | "l"; // <-- Añade esto
}

export default function MapSelectLocation({
  value,
  onChange,
  onLocationDetails,
  fontSizeVariant = "m", // <-- Añade esto
}: Props) {
  const { t } = useTranslation("common");
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const normalContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const setisLoading = useGlobalUIStore((state) => state.setIsLoading);
  const isdarkMode = useGlobalUIStore((state) => state.theme);
  const isMobile = useIsMobile();

  const [address, setAddress] = useState<ParsedDominicanAddress | null>(null);
 const [geoDatas, setGeoDatas] = useState<{
    santoDomingo: FeatureCollection<Geometry> | null;
    distritoNacional: FeatureCollection<Geometry> | null;
  }>({
    santoDomingo: null,
    distritoNacional: null,
  });

  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        // Busca el archivo en la carpeta public
        const [resSD, resDN] = await Promise.all([
          fetch('/data/poligonSantoDomingo.geojson'),
          fetch('/data/poligonDistritoNacional.geojson')
        ]);
        const dataSD = await resSD.json();
        const dataDN = await resDN.json();

        setGeoDatas({
          santoDomingo: dataSD,
          distritoNacional: dataDN,
        });

      } catch (error) {
        console.error("Error cargando el polígono de Santo Domingo:", error);
      }
    };

    fetchGeoJSON();
  }, []); // El array vacío asegura que solo se descargue al montar el componente

  // Función para obtener detalles de la ubicación usando Mapbox Geocoding API
  const getLocationDetails = async (lng: number, lat: number) => {
    // ... (Tu código de getLocationDetails se mantiene igual)
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&language=es&types=address,place,neighborhood,district,postcode`,
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        let neighborhood = "";
        let zipCode = "";

        for (const feature of data.features) {
          if (feature.place_type.includes("neighborhood") && !neighborhood) {
            neighborhood = feature.text;
          }
          if (feature.place_type.includes("postcode") && !zipCode) {
            zipCode = feature.text;
          }
        }

        const parsedAddress = await ParseDominicanAddress(lat, lng);
        setAddress(parsedAddress);

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
    if (!geoDatas.santoDomingo || !geoDatas.distritoNacional) return;
    // Elige el contenedor correcto según el modo
    const container = isFullscreen
      ? fullscreenContainerRef.current
      : normalContainerRef.current;
    if (!container) return;

    setisLoading(true);

    const todasLasFeatures = [
      ...geoDatas.santoDomingo.features,
      ...geoDatas.distritoNacional.features
    ];

    const coleccionCombinada = featureCollection(todasLasFeatures);

    const boundsArray = bbox(coleccionCombinada);
    const limitesGenerales: LngLatBoundsLike = [
      [boundsArray[0], boundsArray[1]], 
      [boundsArray[2], boundsArray[3]]  
    ];

    // Coordenadas por defecto
    const defaultCoords = { lat: 18.4861, lng: -69.9312 };
    const center: [number, number] =
      value?.lat && value?.lng && value.lat !== 0 && value.lng !== 0
        ? [value.lng, value.lat]
        : [defaultCoords.lng, defaultCoords.lat];

    const mapStyle =
      isdarkMode === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/streets-v12";

    // Elimina el mapa anterior si existe y es válido
    if (mapRef.current && typeof mapRef.current.remove === "function") {
      mapRef.current.remove();
      mapRef.current = null;
      markerRef.current = null;
    }

    mapRef.current = new mapboxgl.Map({
      container,
      style: mapStyle,
      center,
      zoom: isMobile ? 13 : 14,
      pitch: is3D ? 60 : 0,
      bearing: is3D ? -17.6 : 0,
      antialias: true,
      dragRotate: is3D,
      touchPitch: is3D,
      pitchWithRotate: is3D,
      maxPitch: is3D ? 85 : 60,
      minPitch: 0,
      scrollZoom: true,
      boxZoom: false,
      dragPan: true,
      keyboard: false,
      doubleClickZoom: true,
      touchZoomRotate: true,
      maxBounds: limitesGenerales,
    });

    mapRef.current.on("load", () => {
      setisLoading(false);
      mapRef.current!.addSource("limite-sd", {
        type: "geojson",
        data: geoDatas.santoDomingo ?? undefined,
      });
      mapRef.current!.addLayer({
        id: "borde-sd",
        type: "line",
        source: "limite-sd",
        paint: {
          "line-color": "#e11d48",
          "line-width": 2,
          "line-opacity": 0.5,
        },
      });

      mapRef.current!.addSource("limite-dn", {
        type: "geojson",
        data: geoDatas.distritoNacional ?? undefined,
      });

      mapRef.current!.addLayer({
        id: "borde-dn",
        type: "line",
        source: "limite-dn",
        paint: {
          "line-color": "#3b82f6",
          "line-width": 2,
          "line-opacity": 0.5,
        },
      });

      requestAnimationFrame(() => {
        mapRef.current?.resize();
      });
      if (is3D) {
        mapRef.current!.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        mapRef.current!.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        mapRef.current!.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["get", "height"],
                0,
                0,
                100,
                100,
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["get", "min_height"],
                0,
                0,
                100,
                100,
              ],
              "fill-extrusion-opacity": 0.6,
            },
          },
          "waterway-label",
        );
      }
    });

    const initialLat = value?.lat && value.lat !== 0 ? value.lat : defaultCoords.lat;
    const initialLng = value?.lng && value.lng !== 0 ? value.lng : defaultCoords.lng;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    markerRef.current = new mapboxgl.Marker({
      draggable: true,
      color: "#e11d48",
      scale: isMobile ? 1.2 : 1.5,
    })
      .setLngLat([initialLng, initialLat])
      .addTo(mapRef.current);

    if ((!value?.lat || value.lat === 0) && (!value?.lng || value.lng === 0)) {
      onChange(defaultCoords.lat, defaultCoords.lng);
      getLocationDetails(defaultCoords.lng, defaultCoords.lat);
    }

    markerRef.current.on("dragend", () => {
      const position = markerRef.current!.getLngLat();
      onChange(position.lat, position.lng);
      getLocationDetails(position.lng, position.lat);
    });

    mapRef.current.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      markerRef.current!.setLngLat([lng, lat]);
      onChange(lat, lng);
      getLocationDetails(lng, lat);
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      if (mapRef.current && typeof mapRef.current.remove === "function") {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setisLoading(false);
    };
  }, [value, isFullscreen, isdarkMode, is3D, isMobile, geoDatas]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  // Función para mostrar la dirección formateada
  const getFormattedAddress = () => {
    if (!address) return "";
    const parts = [
      address.direccion,
      address.municipio,
      address.provincia,
    ].filter(Boolean);
    return parts.join(", ");
  };

  // Map fontSizeVariant to Tailwind font size classes
  const fontSizeClass =
    fontSizeVariant === "xs"
      ? "text-xs"
      : fontSizeVariant === "s"
        ? "text-sm"
        : fontSizeVariant === "l"
          ? "text-lg"
          : "text-base";

  return (
    <>
      {/* Modal para fullscreen */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-50 bg-black/10 backdrop-blur-sm dark:bg-black/40 flex items-center justify-center"
          >
            <div
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex justify-center items-center border-2 border-primary/20 dark:border-white/10"
              style={{
                width: isMobile ? "100vw" : "95vw",
                height: isMobile ? "100vh" : "95vh",
                background: "#fff",
                padding: 0,
                margin: 0,
                borderRadius: isMobile ? 0 : "1.5rem",
              }}
            >
              <div
                ref={fullscreenContainerRef}
                className="absolute inset-0 w-full h-full"
                style={{ background: "#fff" }}
              />

              {/* Dirección en la parte superior */}
              {address && (
                <div
                  className={`absolute ${
                    isMobile
                      ? "bottom-2 left-2 right-2"
                      : "top-4 left-1/2 transform -translate-x-1/2"
                  } z-[10001] bg-background shadow-lg rounded-full px-4 py-2 border border-primary/75`}
                >
                  <p
                    className={`${fontSizeClass} text-foreground font-medium ${isMobile ? "truncate" : ""}`}
                  >
                    {getFormattedAddress()}
                  </p>
                </div>
              )}

              {/* Botón toggle 3D */}
              <div
                className={`absolute ${isMobile ? "top-16 left-2" : "top-4 left-4"} z-[10001]`}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setIs3D((prev) => !prev)}
                      className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 flex items-center justify-center ${
                        is3D
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground"
                      }`}
                      aria-label="Toggle 3D"
                    >
                      <Cuboid size={isMobile ? 20 : 24} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {is3D ? t("ui.map.disable3D") : t("ui.map.enable3D")}
                  </TooltipContent>
                </Tooltip>
              </div>

              {/* Controles */}
              <div
                className={`absolute ${isMobile ? "top-2 right-2" : "top-4 right-4"} z-[10000] flex flex-col items-end gap-2`}
              >
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95`}
                  aria-label={t("ui.map.minimizeMap")}
                >
                  <Minimize size={isMobile ? 20 : 24} />
                </button>
                <div
                  className={`flex flex-col gap-2 ${isMobile ? "mt-2" : "mt-4"}`}
                >
                  <button
                    type="button"
                    onClick={() => mapRef.current?.zoomIn()}
                    className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95`}
                    aria-label={t("ui.map.zoomIn")}
                  >
                    <Plus size={isMobile ? 20 : 24} />
                  </button>
                  <button
                    type="button"
                    onClick={() => mapRef.current?.zoomOut()}
                    className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95`}
                    aria-label={t("ui.map.zoomOut")}
                  >
                    <Minus size={isMobile ? 20 : 24} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mapa normal */}
      <AnimatePresence>
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.12 }}
            className="relative w-full rounded-xl"
            style={{ height: isMobile ? "250px" : "350px" }}
          >
            <div
              ref={normalContainerRef}
              className="h-full w-full rounded-xl border border-gray-300"
              style={{ background: "#fff", minHeight: isMobile ? 250 : 350 }}
            />

            {/* Botón toggle 3D */}
            <div
              className={`absolute ${isMobile ? "top-2 left-2" : "top-4 left-4"} z-10`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIs3D((prev) => !prev)}
                    className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 flex items-center justify-center ${
                      is3D
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    }`}
                    aria-label="Toggle 3D"
                  >
                    <Cuboid size={isMobile ? 16 : 18} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {is3D ? t("ui.map.disable3D") : t("ui.map.enable3D")}
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Controles */}
            <div
              className={`absolute ${isMobile ? "top-2 right-2" : "top-4 right-4"} z-10 flex flex-col items-center justify-center gap-2`}
            >
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95`}
                aria-label={t("ui.map.expandMap")}
              >
                <Expand size={isMobile ? 16 : 18} />
              </button>
              <div
                className={`flex flex-col gap-2 ${isMobile ? "mt-2" : "mt-4"}`}
              >
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomIn()}
                  className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95`}
                  aria-label={t("ui.map.zoomIn")}
                >
                  <Plus size={isMobile ? 16 : 18} />
                </button>
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomOut()}
                  className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95`}
                  aria-label={t("ui.map.zoomOut")}
                >
                  <Minus size={isMobile ? 16 : 18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
