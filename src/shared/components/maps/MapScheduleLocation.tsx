import { useEffect, useMemo, useRef, useState } from "react";
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
  showAddressInfo?: boolean;
  multipleLocations?: LocationCoordinate[];
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

  // ✅ Refs para que on("load") siempre tenga los valores actuales
  // sin necesidad de reinicializar el mapa cuando cambian las ubicaciones.
  const multipleLocationsRef = useRef(multipleLocations);
  const locationRef = useRef<{ lat: number; lng: number } | null>(null);
  const isMobileRef = useRef(isMobile);
  const lastBoundsKeyRef = useRef<string>("");

  multipleLocationsRef.current = multipleLocations;
  isMobileRef.current = isMobile;

  const defaultLocation = useMemo(() => ({ lat: 18.48, lng: -69.93 }), []);
  const location = useMemo(
    () => initialLocation ?? defaultLocation,
    [initialLocation?.lat, initialLocation?.lng, defaultLocation],
  );
  locationRef.current = location;

  // ResizeObserver para que Mapbox recalcule el canvas cuando cambia el contenedor
  useEffect(() => {
    const container = isFullscreen
      ? fullscreenContainerRef.current
      : normalContainerRef.current;
    if (!container || !mapRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      mapRef.current?.resize();
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [isFullscreen]);

  // ✅ Validación de coordenadas para evitar NaN/Infinity
  const isValidCoord = (lat: number, lng: number) =>
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    isFinite(lat) &&
    isFinite(lng);

  const getMapCenter = (): [number, number] => {
    const locs = multipleLocationsRef.current;
    const loc = locationRef.current ?? defaultLocation;

    if (locs && locs.length > 0) {
      const validLocs = locs.filter((l) => l && isValidCoord(l.lat, l.lng));
      if (validLocs.length > 0) {
        const avgLat =
          validLocs.reduce((sum, l) => sum + l.lat, 0) / validLocs.length;
        const avgLng =
          validLocs.reduce((sum, l) => sum + l.lng, 0) / validLocs.length;
        if (isValidCoord(avgLat, avgLng)) return [avgLng, avgLat];
      }
    }

    if (isValidCoord(loc.lat, loc.lng)) return [loc.lng, loc.lat];

    return [defaultLocation.lng, defaultLocation.lat];
  };

  // Helper: bloquea touch en el elemento del marcador
  const lockMarkerTouch = (el: HTMLElement) => {
    const stopTouch = (e: TouchEvent) => e.stopPropagation();
    el.addEventListener("touchstart", stopTouch, { passive: false });
    el.addEventListener("touchmove", stopTouch, { passive: false });
    el.addEventListener("touchend", stopTouch, { passive: false });
  };

  // ✅ Función centralizada de markers — reutilizada tanto en on("load")
  // como en el effect de actualización, garantizando que el pin nunca desaparezca.
  const placeMarkers = (map: mapboxgl.Map) => {
    // Limpiar markers anteriores
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    multipleMarkersRef.current.forEach((m) => m.remove());
    multipleMarkersRef.current = [];

    const locs = multipleLocationsRef.current;
    const loc = locationRef.current ?? defaultLocation;
    const mobile = isMobileRef.current;

    if (locs && locs.length > 0) {
      const validLocs = locs.filter((l) => l && isValidCoord(l.lat, l.lng));

      validLocs.forEach((locItem) => {
        const marker = new mapboxgl.Marker({
          color: locItem.color || "#e11d48",
          scale: mobile ? 1.2 : 1.5,
        })
          .setLngLat([locItem.lng, locItem.lat])
          .addTo(map);

        lockMarkerTouch(marker.getElement());

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: false,
          closeOnClick: false,
        });

        marker.getElement().addEventListener("click", async () => {
          try {
            const parsedAddress = await ParseDominicanAddress(
              locItem.lat,
              locItem.lng,
            );
            setSelectedLocationAddress(parsedAddress);

            const addressText =
              locItem.label ||
              [
                parsedAddress.direccion,
                parsedAddress.municipio,
                parsedAddress.provincia,
              ]
                .filter(Boolean)
                .join(", ");

            popup
              .setLngLat([locItem.lng, locItem.lat])
              .setHTML(
                `<div class="p-2 bg-white rounded-lg shadow-lg border border-gray-200">
                  <p class="text-sm font-medium text-gray-800">${addressText}</p>
                </div>`,
              )
              .addTo(map);
          } catch (error) {
            console.error("Error parsing address:", error);
          }
        });

        multipleMarkersRef.current.push(marker);
      });

      if (validLocs.length > 1) {
        const boundsKey = validLocs.map((l) => `${l.lat}:${l.lng}`).join("|");
        if (lastBoundsKeyRef.current !== boundsKey) {
          lastBoundsKeyRef.current = boundsKey;
          const bounds = new mapboxgl.LngLatBounds();
          validLocs.forEach((l) => bounds.extend([l.lng, l.lat]));
          map.fitBounds(bounds, { padding: 50, duration: 600 });
        }
      }
    } else {
      lastBoundsKeyRef.current = "";
      if (isValidCoord(loc.lat, loc.lng)) {
        markerRef.current = new mapboxgl.Marker({
          color: "#e11d48",
          scale: mobile ? 1.2 : 1.5,
        })
          .setLngLat([loc.lng, loc.lat])
          .addTo(map);

        lockMarkerTouch(markerRef.current.getElement());
      }
    }
  };

  // ✅ Inicializar mapa — los markers se colocan dentro del on("load")
  // para que siempre estén presentes sin importar expand/minimize.
  // El toggle 3D ya NO reinicializa el mapa (tiene su propio effect abajo).
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

    mapRef.current = new mapboxgl.Map({
      container,
      style: mapStyle,
      center,
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

      // ✅ Markers colocados aquí — siempre corren después del load,
      // incluso al expandir/minimizar, garantizando que el pin no desaparezca.
      placeMarkers(mapRef.current!);
    });

    return () => {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
      multipleMarkersRef.current.forEach((marker) => marker.remove());
      multipleMarkersRef.current = [];
      mapRef.current?.remove();
      setisLoading(false);
    };
  }, [isFullscreen, isdarkMode]);

  // ✅ Toggle 3D separado — usa easeTo para no reinicializar el mapa.
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const toggle3D = () => {
      if (is3D) {
        map.easeTo({ pitch: 60, bearing: -17.6, duration: 1000 });

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
        map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
        if (map.getTerrain()) map.setTerrain(null);
        if (map.getLayer("3d-buildings")) map.removeLayer("3d-buildings");
      }
    };

    if (map.loaded()) {
      toggle3D();
    } else {
      map.once("load", toggle3D);
    }
  }, [is3D]);

  // ✅ Actualizar markers cuando cambian las ubicaciones SIN reinicializar el mapa.
  useEffect(() => {
    if (!mapRef.current) return;
    if (!mapRef.current.loaded()) return;
    placeMarkers(mapRef.current);
  }, [multipleLocations, location.lat, location.lng, isMobile]);

  // ✅ Actualizar centro y marcador único cuando cambia initialLocation (sin reinicializar).
  useEffect(() => {
    if (!mapRef.current || !initialLocation || multipleLocations) return;
    if (!isValidCoord(initialLocation.lat, initialLocation.lng)) return;

    const update = () => {
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
  }, [initialLocation?.lat, initialLocation?.lng, multipleLocations, isMobile]);

  // Parsear dirección para ubicación única
  useEffect(() => {
    if (
      initialLocation &&
      !multipleLocations &&
      showAddressInfo &&
      isValidCoord(location.lat, location.lng)
    ) {
      ParseDominicanAddress(location.lat, location.lng)
        .then((parsedAddress) => {
          setAddress(parsedAddress);
        })
        .catch((error) => {
          console.error("Error parsing address:", error);
        });
    }
  }, [location, initialLocation, multipleLocations, showAddressInfo]);

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

  const getFormattedAddress = (addressData = address) => {
    if (!addressData) return "";
    const parts = [
      addressData.direccion,
      addressData.municipio,
      addressData.provincia,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const fontSizeMap = {
    xs: "text-xs",
    s: "text-sm",
    m: "text-lg",
    l: "text-xl",
  };
  const fontSizeClass = fontSizeMap[fontSizeVariant];

  const SelectedAddressBadge = ({
    addressData,
    fullscreen,
  }: {
    addressData: ParsedDominicanAddress | null;
    fullscreen: boolean;
  }) => {
    if (!addressData || !multipleLocations) return null;
    return (
      <div
        className={`
          pointer-events-none select-none
          ${
            fullscreen
              ? isMobile
                ? "fixed bottom-4 left-3 right-3 z-[10002]"
                : "fixed top-6 left-1/2 -translate-x-1/2 z-[10002]"
              : "w-full mt-2"
          }
        `}
      >
        <div
          className={`
            inline-flex items-center
            bg-background/95 backdrop-blur-sm
            shadow-lg rounded-full px-4 py-2
            border border-primary/60
            ${fullscreen && !isMobile ? "" : "max-w-full"}
          `}
        >
          <p
            className={`${fontSizeClass} text-foreground font-medium truncate`}
          >
            {getFormattedAddress(addressData)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Modal fullscreen */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            key="map-fullscreen"
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

            <SelectedAddressBadge
              addressData={selectedLocationAddress}
              fullscreen
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mapa normal */}
      <AnimatePresence>
        {!isFullscreen && (
          <motion.div
            key="map-normal"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.12 }}
            className="relative w-full rounded-xl overflow-hidden isolate"
            style={{ height: isMobile ? "200px" : "300px" }}
          >
            <div
              ref={normalContainerRef}
              className="h-full w-full rounded-xl overflow-hidden"
              style={{
                background: "#fff",
                minHeight: isMobile ? 200 : 300,
                maxWidth: "100%",
              }}
            />

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

        {!isFullscreen && (
          <SelectedAddressBadge
            key="map-selected-address-badge"
            addressData={selectedLocationAddress}
            fullscreen={false}
          />
        )}

        {showAddressInfo && !multipleLocations && (
          <div
            key="map-address-info"
            className={`flex ${
              isMobile ? "flex-wrap gap-4 justify-between" : "justify-between"
            } mt-4`}
          >
            {isMobile ? (
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col items-start gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.address", "Address")}
                  </h5>
                  <span
                    className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                  >
                    {address?.direccion || "-"}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.province", "Province")}
                  </h5>
                  <span
                    className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                  >
                    {address?.provincia || "-"}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-2 col-span-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.municipality", "Municipality")}
                  </h5>
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
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.address", "Address")}
                  </h5>
                  <span
                    className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                  >
                    {address?.direccion || "-"}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.province", "Province")}
                  </h5>
                  <span
                    className={`${fontSizeClass} text-primary font-medium break-words max-w-xs`}
                  >
                    {address?.provincia || "-"}
                  </span>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <h5 className="text-md text-primary/75 font-medium">
                    {t("search.municipality", "Municipality")}
                  </h5>
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
