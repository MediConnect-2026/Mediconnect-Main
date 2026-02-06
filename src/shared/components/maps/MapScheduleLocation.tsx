import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Expand, Minimize, Plus, Minus, Cuboid } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
import { AnimatePresence, motion } from "framer-motion";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import {
  ParseDominicanAddress,
  type ParsedDominicanAddress,
} from "@/utils/addressParser";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";

interface mapScheduleLocationProps {
  initialLocation?: { lat: number; lng: number };
  fontSizeVariant?: "xs" | "s" | "m" | "l";
}

function MapScheduleLocation({
  initialLocation,
  fontSizeVariant = "m",
}: mapScheduleLocationProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const normalContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const setisLoading = useGlobalUIStore((state) => state.setIsLoading);
  const isdarkMode = useGlobalUIStore((state) => state.theme);
  const [address, setAddress] = useState<ParsedDominicanAddress | null>(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");

  // Coordenadas por defecto (Santo Domingo, RD)
  const defaultLocation = { lat: 18.48, lng: -69.93 };
  const location = initialLocation || defaultLocation;

  useEffect(() => {
    const container = isFullscreen
      ? fullscreenContainerRef.current
      : normalContainerRef.current;
    if (!container) return;

    setisLoading(true);

    const mapStyle =
      isdarkMode === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/streets-v12";

    mapRef.current = new mapboxgl.Map({
      container,
      style: mapStyle,
      center: [location.lng, location.lat],
      zoom: isMobile ? 14 : 15,
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
    });

    mapRef.current.on("load", () => {
      setisLoading(false);

      if (is3D) {
        // Terreno 3D
        mapRef.current!.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        mapRef.current!.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

        // Edificios 3D
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

    // Limpiar marcador anterior
    if (markerRef.current) {
      markerRef.current.remove();
    }

    // Crear marcador para la ubicación
    markerRef.current = new mapboxgl.Marker({
      color: "#e11d48",
      scale: isMobile ? 1.2 : 1.5,
    })
      .setLngLat([location.lng, location.lat])
      .addTo(mapRef.current);

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      mapRef.current?.remove();
      setisLoading(false);
    };
  }, [location, isFullscreen, isdarkMode, is3D, isMobile]);

  // Parsear dirección cuando cambia la ubicación
  useEffect(() => {
    if (initialLocation) {
      ParseDominicanAddress(location.lat, location.lng).then(
        (parsedAddress) => {
          setAddress(parsedAddress);
        },
      );
    }
  }, [location, initialLocation]);

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

  // Font size classes
  const fontSizeMap = {
    xs: "text-xs",
    s: "text-sm",
    m: "text-lg",
    l: "text-xl",
  };
  const fontSizeClass = fontSizeMap[fontSizeVariant];

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
                    {is3D ? "Desactivar vista 3D" : "Activar vista 3D"}
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
                  aria-label="Minimizar mapa"
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
                    aria-label="Aumentar zoom"
                  >
                    <Plus size={isMobile ? 20 : 24} />
                  </button>
                  <button
                    type="button"
                    onClick={() => mapRef.current?.zoomOut()}
                    className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95`}
                    aria-label="Reducir zoom"
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
            style={{ height: isMobile ? "200px" : "300px" }}
          >
            <div
              ref={normalContainerRef}
              className="h-full w-full rounded-xl"
              style={{ background: "#fff", minHeight: isMobile ? 200 : 300 }}
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
                  {is3D ? "Desactivar vista 3D" : "Activar vista 3D"}
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
                aria-label="Expandir mapa"
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
                  aria-label="Aumentar zoom"
                >
                  <Plus size={isMobile ? 16 : 18} />
                </button>
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomOut()}
                  className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95`}
                  aria-label="Reducir zoom"
                >
                  <Minus size={isMobile ? 16 : 18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
        <div
          className={`flex ${
            isMobile ? "flex-wrap gap-4 justify-between" : "justify-between"
          } mt-4`}
        >
          {isMobile ? (
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.address", "Address")}
                  </h5>
                </div>
                <span
                  className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                >
                  {address?.direccion || "-"}
                </span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.province", "Province")}
                  </h5>
                </div>
                <span
                  className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                >
                  {address?.provincia || "-"}
                </span>
              </div>
              <div className="flex flex-col items-start gap-2 col-span-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.municipality", "Municipality")}
                  </h5>
                </div>
                <span
                  className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                >
                  {address?.municipio || "-"}
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.address", "Address")}
                  </h5>
                </div>
                <span
                  className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                >
                  {address?.direccion || "-"}
                </span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.province", "Province")}
                  </h5>
                </div>
                <span
                  className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                >
                  {address?.provincia || "-"}
                </span>
              </div>
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.municipality", "Municipality")}
                  </h5>
                </div>
                <span
                  className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                >
                  {address?.municipio || "-"}
                </span>
              </div>
            </>
          )}
        </div>
      </AnimatePresence>
    </>
  );
}

export default MapScheduleLocation;
