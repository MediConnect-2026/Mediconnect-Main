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

interface LocationCoordinate {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

interface mapScheduleLocationProps {
  initialLocation?: { lat: number; lng: number };
  fontSizeVariant?: "xs" | "s" | "m" | "l";
  showAddressInfo?: boolean; // Nueva prop para mostrar/ocultar información de dirección
  multipleLocations?: LocationCoordinate[]; // Nueva prop para múltiples ubicaciones
}

function MapScheduleLocation({
  initialLocation,
  fontSizeVariant = "m",
  showAddressInfo = true,
  multipleLocations,
}: mapScheduleLocationProps) {
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const normalContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const multipleMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [is3D, setIs3D] = useState(false);
  const setisLoading = useGlobalUIStore((state) => state.setIsLoading);
  const isdarkMode = useGlobalUIStore((state) => state.theme);
  const [address, setAddress] = useState<ParsedDominicanAddress | null>(null);
  const [selectedLocationAddress, setSelectedLocationAddress] =
    useState<ParsedDominicanAddress | null>(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");
  const hasMultipleLocations = (multipleLocations?.length ?? 0) > 0;

  // Coordenadas por defecto (Santo Domingo, RD)
  const defaultLocation = { lat: 18.48, lng: -69.93 };
  const location = initialLocation || defaultLocation;

  // Calcular el centro del mapa cuando hay múltiples ubicaciones
  const getMapCenter = (): [number, number] => {
    if (multipleLocations && multipleLocations.length > 0) {
      // Filtrar ubicaciones con coordenadas válidas
      const validLocations = multipleLocations.filter(
        (loc) =>
          loc &&
          typeof loc.lat === "number" &&
          typeof loc.lng === "number" &&
          !isNaN(loc.lat) &&
          !isNaN(loc.lng) &&
          isFinite(loc.lat) &&
          isFinite(loc.lng)
      );

      if (validLocations.length > 0) {
        const avgLat =
          validLocations.reduce((sum, loc) => sum + loc.lat, 0) /
          validLocations.length;
        const avgLng =
          validLocations.reduce((sum, loc) => sum + loc.lng, 0) /
          validLocations.length;

        // Validar que el resultado no sea NaN
        if (!isNaN(avgLat) && !isNaN(avgLng) && isFinite(avgLat) && isFinite(avgLng)) {
          return [avgLng, avgLat];
        }
      }
    }

    // Validar ubicación por defecto
    if (
      !isNaN(location.lat) &&
      !isNaN(location.lng) &&
      isFinite(location.lat) &&
      isFinite(location.lng)
    ) {
      return [location.lng, location.lat];
    }

    // Retornar coordenadas por defecto si todo falla
    return [defaultLocation.lng, defaultLocation.lat];
  };

  // Inicializar el mapa (solo cuando cambia el contenedor o tema)
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

    const center = getMapCenter();

    console.log("datos de ubicación:", multipleLocations);

    mapRef.current = new mapboxgl.Map({
      container,
      style: mapStyle,
      center: center,
      zoom:
        multipleLocations && multipleLocations.length > 1
          ? 12
          : isMobile
            ? 14
            : 15,
      pitch: 0,
      bearing: 0,
      antialias: true,
      dragRotate: true,
      touchPitch: true,
      pitchWithRotate: true,
      maxPitch: 85,
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
      // Si hay múltiples ubicaciones, ajustar el mapa para mostrar todas
      if (multipleLocations && multipleLocations.length > 1) {
        const validLocations = multipleLocations.filter(
          (loc) =>
            loc &&
            typeof loc.lat === "number" &&
            typeof loc.lng === "number" &&
            !isNaN(loc.lat) &&
            !isNaN(loc.lng) &&
            isFinite(loc.lat) &&
            isFinite(loc.lng)
        );

        if (validLocations.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          validLocations.forEach((loc) => {
            bounds.extend([loc.lng, loc.lat]);
          });
          mapRef.current!.fitBounds(bounds, { padding: 50 });
        }
      }
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
      }
      multipleMarkersRef.current.forEach((marker) => marker.remove());
      mapRef.current?.remove();
      setisLoading(false);
    };
  }, [isFullscreen, isdarkMode]);

  // Manejar el cambio de vista 3D sin reinicializar el mapa
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    
    const toggle3D = () => {
      if (is3D) {
        // Activar vista 3D
        map.easeTo({ pitch: 60, bearing: -17.6, duration: 1000 });

        // Agregar terreno 3D si no existe
        if (!map.getSource("mapbox-dem")) {
          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          });
        }
        
        if (!map.getTerrain()) {
          map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        }

        // Agregar edificios 3D si no existen
        if (!map.getLayer("3d-buildings")) {
          map.addLayer(
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
      } else {
        // Desactivar vista 3D
        map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });

        // Remover terreno
        if (map.getTerrain()) {
          map.setTerrain(null);
        }

        // Remover edificios 3D
        if (map.getLayer("3d-buildings")) {
          map.removeLayer("3d-buildings");
        }
      }
    };

    if (map.loaded()) {
      toggle3D();
    } else {
      map.on("load", toggle3D);
    }
  }, [is3D]);

  // Actualizar marcadores cuando cambien las ubicaciones (sin recargar el mapa)
  useEffect(() => {
    if (!mapRef.current) return;

    // En modo ubicación única, este efecto no debe manipular marcadores.
    if (!hasMultipleLocations) return;

    // Limpiar marcadores anteriores
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    multipleMarkersRef.current.forEach((marker) => marker.remove());
    multipleMarkersRef.current = [];

    // Esperar a que el mapa esté cargado
    const updateMarkers = () => {
      if (multipleLocations && multipleLocations.length > 0) {
        // Filtrar ubicaciones con coordenadas válidas
        const validLocations = multipleLocations.filter(
          (loc) =>
            loc &&
            typeof loc.lat === "number" &&
            typeof loc.lng === "number" &&
            !isNaN(loc.lat) &&
            !isNaN(loc.lng) &&
            isFinite(loc.lat) &&
            isFinite(loc.lng)
        );

        // Múltiples marcadores
        validLocations.forEach((loc) => {
          const marker = new mapboxgl.Marker({
            color: loc.color || "#e11d48",
            scale: isMobile ? 1.2 : 1.5,
          })
            .setLngLat([loc.lng, loc.lat])
            .addTo(mapRef.current!);

          // Crear popup para mostrar información
          const popup = new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            closeOnClick: false,
          });

          // Evento click en marcador
          marker.getElement().addEventListener("click", async () => {
            try {
              const parsedAddress = await ParseDominicanAddress(
                loc.lat,
                loc.lng,
              );
              setSelectedLocationAddress(parsedAddress);

              const addressText =
                loc.label ||
                [
                  parsedAddress.direccion,
                  parsedAddress.municipio,
                  parsedAddress.provincia,
                ]
                  .filter(Boolean)
                  .join(", ");

              popup
                .setLngLat([loc.lng, loc.lat])
                .setHTML(
                  `
                  <div class="p-2 bg-white rounded-lg shadow-lg border border-gray-200">
                    <p class="text-sm font-medium text-gray-800">${addressText}</p>
                  </div>
                `,
                )
                .addTo(mapRef.current!);
            } catch (error) {
              console.error("Error parsing address:", error);
            }
          });

          multipleMarkersRef.current.push(marker);
        });

        // Ajustar vista si hay múltiples ubicaciones válidas
        if (validLocations.length > 1) {
          const bounds = new mapboxgl.LngLatBounds();
          validLocations.forEach((loc) => {
            bounds.extend([loc.lng, loc.lat]);
          });
          mapRef.current!.fitBounds(bounds, { padding: 50, duration: 1000 });
        }
      }
    };

    if (mapRef.current.loaded()) {
      updateMarkers();
    } else {
      mapRef.current.on("load", updateMarkers);
    }
  }, [hasMultipleLocations, multipleLocations, isMobile]);


  // Actualizar centro y marcador cuando cambia initialLocation (sin reinicializar)
  useEffect(() => {
    if (!mapRef.current || !initialLocation || hasMultipleLocations) return;
    if (
      !isNaN(initialLocation.lat) &&
      !isNaN(initialLocation.lng) &&
      isFinite(initialLocation.lat) &&
      isFinite(initialLocation.lng)
    ) {
      const update = () => {
        // Limpiar marcador anterior antes de crear el nuevo
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }

        markerRef.current = new mapboxgl.Marker({
          color: "#e11d48",
          scale: isMobile ? 1.2 : 1.5,
        })
          .setLngLat([initialLocation.lng, initialLocation.lat])
          .addTo(mapRef.current!);

        mapRef.current!.easeTo({
          center: [initialLocation.lng, initialLocation.lat],
          zoom: isMobile ? 14 : 15,
          duration: 800,
        });
      };

      if (mapRef.current.loaded()) {
        update();
      } else {
        mapRef.current.once("load", update);
      }
    }
  }, [initialLocation?.lat, initialLocation?.lng, hasMultipleLocations, isMobile]);

  // Parsear dirección cuando cambia la ubicación (solo para ubicación única)
  useEffect(() => {
    if (
      initialLocation &&
      !hasMultipleLocations &&
      showAddressInfo &&
      !isNaN(location.lat) &&
      !isNaN(location.lng) &&
      isFinite(location.lat) &&
      isFinite(location.lng)
    ) {
      ParseDominicanAddress(location.lat, location.lng).then(
        (parsedAddress) => {
          setAddress(parsedAddress);
        },
      ).catch((error) => {
        console.error("Error parsing address:", error);
      });
    }
  }, [
    initialLocation?.lat,
    initialLocation?.lng,
    hasMultipleLocations,
    showAddressInfo,
  ]);

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
  const getFormattedAddress = (addressData = address) => {
    if (!addressData) return "";
    const parts = [
      addressData.direccion,
      addressData.municipio,
      addressData.provincia,
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

              {/* Dirección en la parte superior - solo para ubicación única */}
              {address && !multipleLocations && showAddressInfo && (
                <div
                  className={`absolute ${
                    isMobile
                      ? "bottom-2 left-2 right-2"
                      : "top-4 left-1/2 transform -translate-x-1/2"
                  } z-[30] bg-background shadow-lg rounded-full px-4 py-2 border border-primary/75`}
                >
                  <p
                    className={`${fontSizeClass} text-foreground font-medium ${isMobile ? "truncate" : ""}`}
                  >
                    {getFormattedAddress()}
                  </p>
                </div>
              )}

              {/* Dirección seleccionada para múltiples ubicaciones */}
              {selectedLocationAddress && multipleLocations && (
                <div
                  className={`absolute ${
                    isMobile
                      ? "bottom-2 left-2 right-2"
                      : "top-4 left-1/2 transform -translate-x-1/2"
                  } z-[30] bg-background shadow-lg rounded-full px-4 py-2 border border-primary/75`}
                >
                  <p
                    className={`${fontSizeClass} text-foreground font-medium ${isMobile ? "truncate" : ""}`}
                  >
                    {getFormattedAddress(selectedLocationAddress)}
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

            {/* Dirección seleccionada para múltiples ubicaciones (NO fullscreen) */}
            {selectedLocationAddress && multipleLocations && !isFullscreen && (
              <div
                className={`absolute w-fit left-2 right-2 bottom-2 z-[10] bg-background shadow rounded-4xl px-3 py-1 border border-primary/50`}
                style={{
                  fontSize: isMobile ? "0.75rem" : "0.85rem",
                  maxWidth: "90%",
                }}
              >
                <p className="truncate text-foreground font-medium">
                  {getFormattedAddress(selectedLocationAddress)}
                </p>
              </div>
            )}

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

        {/* Información de dirección - solo se muestra si showAddressInfo es true y no hay múltiples ubicaciones */}
        {showAddressInfo && !multipleLocations && (
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
        )}
      </AnimatePresence>
    </>
  );
}

export default MapScheduleLocation;
