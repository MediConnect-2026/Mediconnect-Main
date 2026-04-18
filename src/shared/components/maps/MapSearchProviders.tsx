import { useEffect, useRef, useState, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import { type Provider } from "@/data/providers";
import ProviderPopup from "./ProviderPopup";
import { Expand, Minimize, Plus, Minus, Cuboid } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
import { AnimatePresence, motion } from "framer-motion";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useNavigate } from "react-router-dom";
import { TooltipProvider } from "@/shared/ui/tooltip";
import type { FeatureCollection, Geometry } from "geojson";
import ScheduleAppointmentDialog from "@/features/patient/components/appoiments/ScheduleAppointmentDialog";
import ToogleConfirmConnection from "@/features/request/components/ToogleConfirmConnection";
import { useStartConversation } from "@/lib/hooks/useStartConversation";
import MCButton from "../forms/MCButton";
import { useTranslation } from "react-i18next";

interface MapSearchProvidersProps {
  providers: Provider[];
  selectedProviders?: string[];
  onProviderSelect?: (id: string) => void;
}

// Componente auxiliar para capturar el navigate
const PopupContent: React.FC<{
  provider: Provider;
  isSelected: boolean;
  onSelect?: (id: string) => void;
  onScheduleAppointment?: (providerId: string) => void;
  navigateFn: (path: string) => void;
  userRole?: string | null;
  isMobile?: boolean;
  onContact?: (providerId: string) => void;
  isContactLoading?: boolean;
}> = ({
  provider,
  isSelected,
  onSelect,
  onScheduleAppointment,
  navigateFn,
  userRole,
  isMobile,
  onContact,
  isContactLoading,
}) => {
  return (
    <TooltipProvider>
      <ProviderPopup
        provider={provider}
        isSelected={isSelected}
        onSelect={onSelect ?? (() => {})}
        onScheduleAppointment={onScheduleAppointment}
        navigateFn={navigateFn}
        userRole={userRole}
        isMobile={isMobile}
        onContact={onContact}
        isStartingConversation={isContactLoading}
      />
    </TooltipProvider>
  );
};

export default function MapSearchProviders({
  providers,
  selectedProviders = [],
  onProviderSelect,
}: MapSearchProvidersProps) {
  const navigate = useNavigate();
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const normalContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const markersMapRef = useRef<
    Map<string, { marker: mapboxgl.Marker; root: any }>
  >(new Map());
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const popupTimeoutsRef = useRef<Map<string, number>>(new Map());
  const hasInitializedBoundsRef = useRef(false);
  const previousProviderCountRef = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [is3D, setIs3D] = useState(true);
  const setisLoading = useGlobalUIStore((state) => state.setIsLoading);
  const isdarkMode = useGlobalUIStore((state) => state.theme);
  const userRole = useAppStore((state) => state.user?.rol);
  const isMobile = useIsMobile();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationDenied, setLocationDenied] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(
    null,
  );
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingConnectionId, setPendingConnectionId] = useState<string | null>(
    null,
  );
  const [geoDatas, setGeoDatas] = useState<{
    santoDomingo: FeatureCollection<Geometry> | null;
    distritoNacional: FeatureCollection<Geometry> | null;
  }>({
    santoDomingo: null,
    distritoNacional: null,
  });

  const { t } = useTranslation("doctor");
  const { startConversation, isLoading: isStartingConversation } =
    useStartConversation();

  // Memoize selected providers set for efficient lookups
  const selectedProvidersSet = useMemo(
    () => new Set(selectedProviders),
    [selectedProviders],
  );

  // Callback handlers
  const handleScheduleAppointment = (providerId: string) => {
    console.log("Scheduling appointment with provider ID:", providerId);
    setSelectedProviderId(providerId);
    setScheduleDialogOpen(true);
  };

  const handleConnect = (providerId: string) => {
    // Si el userRole es CENTER o DOCTOR, abrir diálogo de confirmación
    if (userRole === "CENTER" || userRole === "DOCTOR") {
      setPendingConnectionId(providerId);
      setConfirmDialogOpen(true);
    }
  };

  const handleContact = (providerId: string) => {
    startConversation(Number(providerId));
  };

  const handleConfirmConnection = () => {
    if (pendingConnectionId) {
      onProviderSelect?.(pendingConnectionId);
      setPendingConnectionId(null);
      setConfirmDialogOpen(false);
    }
  };

  // Cargar los polígonos GeoJSON
  useEffect(() => {
    const fetchGeoJSON = async () => {
      try {
        const [resSD, resDN] = await Promise.all([
          fetch("/data/poligonSantoDomingo.geojson"),
          fetch("/data/poligonDistritoNacional.geojson"),
        ]);
        const dataSD = await resSD.json();
        const dataDN = await resDN.json();

        setGeoDatas({
          santoDomingo: dataSD,
          distritoNacional: dataDN,
        });
      } catch (error) {
        console.error("Error cargando polígonos:", error);
      }
    };

    fetchGeoJSON();
  }, []);

  // Inicializar el mapa (solo cuando cambia el contenedor o tema)
  useEffect(() => {
    if (!geoDatas.santoDomingo || !geoDatas.distritoNacional) return;

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
      center: userLocation ?? [-69.93, 18.48],
      zoom: 12,
      pitch: 0,
      bearing: 0,
      antialias: true,
      dragRotate: true,
      touchPitch: true,
      pitchWithRotate: true,
      maxPitch: 85,
      minPitch: 0,
    });

    mapRef.current.on("load", () => {
      setisLoading(false);
      setIsMapLoaded(true);

      // Agregar polígonos de límites
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

      // Agregar fuente de terreno para 3D
      mapRef.current!.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    });

    return () => {
      setIsMapLoaded(false);
      // Clean up all markers and roots
      markersMapRef.current.forEach((markerData) => {
        markerData.marker.remove();
        markerData.root?.unmount?.();
      });
      markersMapRef.current.clear();
      markersRef.current = [];

      // Clear all pending timeouts
      popupTimeoutsRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      popupTimeoutsRef.current.clear();

      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }

      // Reset tracking refs
      hasInitializedBoundsRef.current = false;
      previousProviderCountRef.current = 0;

      mapRef.current?.remove();
      setisLoading(false);
    };
  }, [isFullscreen, isdarkMode, geoDatas]);

  // Manejar el cambio de vista 3D sin reinicializar el mapa
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    const map = mapRef.current;

    const toggle3D = () => {
      if (is3D) {
        // Activar vista 3D
        map.easeTo({ pitch: 60, bearing: -17.6, duration: 1000 });

        // Mostrar hint en móviles
        if ("ontouchstart" in window) {
          const container = isFullscreen
            ? fullscreenContainerRef.current
            : normalContainerRef.current;
          if (container) {
            setTimeout(() => {
              const instructionDiv = document.createElement("div");
              instructionDiv.className = "mapbox-rotation-hint";
              instructionDiv.innerHTML = `
                <div style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  background: rgba(0,0,0,0.8);
                  color: white;
                  padding: 12px 20px;
                  border-radius: 8px;
                  font-size: 14px;
                  text-align: center;
                  z-index: 1000;
                  pointer-events: none;
                  animation: fadeOut 3s ease-in-out forwards;
                ">
                  📱 Usa dos dedos para rotar el mapa<br>
                  🔄 Arrastra para cambiar el ángulo
                </div>
                <style>
                  @keyframes fadeOut {
                    0% { opacity: 1; }
                    70% { opacity: 1; }
                    100% { opacity: 0; }
                  }
                </style>
              `;
              container.appendChild(instructionDiv);

              setTimeout(() => {
                if (instructionDiv.parentNode) {
                  instructionDiv.parentNode.removeChild(instructionDiv);
                }
              }, 3000);
            }, 1000);
          }
        }

        // Activar terreno 3D si no existe
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
  }, [is3D, isMapLoaded, isFullscreen]);

  // Manage user location marker (independent effect)
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    if (userLocation) {
      if (!userMarkerRef.current) {
        userMarkerRef.current = new mapboxgl.Marker({
          color: "#e11d48",
          scale: 1.3,
        })
          .setLngLat(userLocation)
          .addTo(mapRef.current);
      } else {
        userMarkerRef.current.setLngLat(userLocation);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userLocation, isMapLoaded]);

  // Create/update/remove markers when providers change (optimized - no selection dependency)
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    // Get current provider IDs with coordinates
    const currentProviderIds = new Set<string>();

    providers.forEach((provider) => {
      const coordinates = Array.isArray(provider.coordinates)
        ? provider.coordinates
        : [provider.coordinates];

      coordinates.forEach((_coord, idx) => {
        const markerId = `${provider.id}_${idx}`;
        currentProviderIds.add(markerId);
      });
    });

    // Remove markers that are no longer in the provider list
    markersMapRef.current.forEach((markerData, markerId) => {
      if (!currentProviderIds.has(markerId)) {
        markerData.marker.remove();
        markerData.root?.unmount?.();
        markersMapRef.current.delete(markerId);

        // Clear pending timeout if exists
        const timeout = popupTimeoutsRef.current.get(markerId);
        if (timeout) {
          clearTimeout(timeout);
          popupTimeoutsRef.current.delete(markerId);
        }
      }
    });

    // Create new markers (always with scale 1 initially)
    providers.forEach((provider) => {
      const coordinates = Array.isArray(provider.coordinates)
        ? provider.coordinates
        : provider.coordinates
          ? [provider.coordinates]
          : [];

      coordinates.forEach((coord, idx) => {
        if (!coord || !coord.lat || !coord.lng) {
          console.warn(
            `Invalid coordinates for provider ${provider.id} at index ${idx}:`,
            coord,
          );
          return;
        }

        const lat = Number(coord.lat);
        const lng = Number(coord.lng);
        if (isNaN(lat) || isNaN(lng)) {
          console.warn(
            `Non-numeric coordinates for provider ${provider.id} at index ${idx}:`,
            coord,
          );
          return;
        }

        const markerId = `${provider.id}_${idx}`;
        const existingMarker = markersMapRef.current.get(markerId);

        // Only create if it doesn't exist
        if (!existingMarker) {
          // Create the marker first
          const marker = new mapboxgl.Marker({
            color: provider.type === "doctor" ? "#A8C3A0" : "#8BB1CA",
            scale: 1,
          })
            .setLngLat([lng, lat])
            .addTo(mapRef.current!);

          // Create popup container and root
          const popupNode = document.createElement("div");
          const root = createRoot(popupNode);

          // Store marker and root immediately
          markersMapRef.current.set(markerId, { marker, root });

          // Render the popup content and attach to marker
          root.render(
            <PopupContent
              provider={provider}
              isSelected={false}
              onSelect={handleConnect}
              onScheduleAppointment={handleScheduleAppointment}
              navigateFn={navigate}
              userRole={userRole}
              isMobile={isMobile}
              onContact={handleContact}
              isContactLoading={isStartingConversation}
            />,
          );

          // Create and attach popup after React renders
          const timeoutId = setTimeout(() => {
            const popup = new mapboxgl.Popup({
              offset: 20,
              closeButton: false,
              closeOnClick: true,
              maxWidth: "none",
              className: "mapbox-popup-high-z",
            }).setDOMContent(popupNode);

            marker.setPopup(popup);
            popupTimeoutsRef.current.delete(markerId);
          }, 0);

          // Store timeout for cleanup
          popupTimeoutsRef.current.set(markerId, timeoutId);
        }
      });
    });

    // Legacy support: keep markersRef updated
    markersRef.current = Array.from(markersMapRef.current.values()).map(
      (m) => m.marker,
    );
  }, [providers, onProviderSelect, isMapLoaded, navigate]);

  // Update marker styles when selection changes (optimized - only updates scale)
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded) return;

    providers.forEach((provider) => {
      const isSelected = selectedProvidersSet.has(provider.id);
      const coordinates = Array.isArray(provider.coordinates)
        ? provider.coordinates
        : provider.coordinates
          ? [provider.coordinates]
          : [];

      coordinates.forEach((_coord, idx) => {
        const markerId = `${provider.id}_${idx}`;
        const existingMarker = markersMapRef.current.get(markerId);

        if (existingMarker) {
          // Update scale using DOM manipulation with proper transform preservation
          const targetScale = isSelected ? 1.2 : 1;
          const element = existingMarker.marker.getElement();

          // Get the SVG element and apply scale directly
          const svg = element.querySelector("svg");
          if (svg) {
            svg.style.transform = `scale(${targetScale})`;
            svg.style.transformOrigin = "center bottom";
            svg.style.transition = "transform 0.2s ease";
          }

          // Update popup content to reflect selection state
          existingMarker.root.render(
            <PopupContent
              provider={provider}
              isSelected={isSelected}
              onSelect={handleConnect}
              onScheduleAppointment={handleScheduleAppointment}
              navigateFn={navigate}
              userRole={userRole}
              isMobile={isMobile}
              onContact={handleContact}
              isContactLoading={isStartingConversation}
            />,
          );
        }
      });
    });
  }, [
    selectedProvidersSet,
    providers,
    isMapLoaded,
    navigate,
    onProviderSelect,
  ]);

  // Ajustar vista cuando cambian los providers (solo si hay cambio significativo)
  useEffect(() => {
    if (!mapRef.current || !isMapLoaded || providers.length === 0) return;

    // Only fit bounds if this is the first load or provider count changed significantly
    const shouldFitBounds =
      !hasInitializedBoundsRef.current ||
      Math.abs(providers.length - previousProviderCountRef.current) > 3;

    if (!shouldFitBounds) return;

    const bounds = new mapboxgl.LngLatBounds();
    let validCoordCount = 0;

    providers.forEach((provider) => {
      const coordinates = Array.isArray(provider.coordinates)
        ? provider.coordinates
        : provider.coordinates
          ? [provider.coordinates]
          : [];

      coordinates.forEach((coord) => {
        if (!coord || !coord.lat || !coord.lng) return;

        const lat = Number(coord.lat);
        const lng = Number(coord.lng);

        if (!isNaN(lat) && !isNaN(lng)) {
          bounds.extend([lng, lat]);
          validCoordCount++;
        }
      });
    });

    if (validCoordCount > 0) {
      mapRef.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15,
        duration: hasInitializedBoundsRef.current ? 1000 : 0,
      });

      hasInitializedBoundsRef.current = true;
      previousProviderCountRef.current = providers.length;
    }
  }, [providers, isMapLoaded]);

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

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.longitude, pos.coords.latitude]);
          setLocationDenied(false);
        },
        () => {
          setUserLocation(null);
          setLocationDenied(true);
        },
      );
    }
  }, []);

  return (
    <>
      {locationDenied && (
        <div className="fixed top-4 left-1/2 z-[10002] -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg rounded-3xl">
          {t(
            "map.locationPermissionRequired",
            "Debes permitir el acceso a tu ubicación para centrar el mapa en tu posición.",
          )}
        </div>
      )}
      {/* Modal para fullscreen */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/10 backdrop-blur-sm dark:bg-black/40 flex items-center justify-center"
            style={{ backdropFilter: "blur(2px)" }}
          >
            <div
              className="relative bg-white rounded-3xl shadow-2xl overflow-hidden flex justify-center items-center border-2 border-primary/20 dark:border-white/10 dark:border-1"
              style={{
                width: "95vw",
                height: "95vh",
                background: "#fff",
                padding: 0,
                margin: 0,
              }}
            >
              <div
                ref={fullscreenContainerRef}
                className="absolute inset-0 w-full h-full"
                style={{ background: "#fff" }}
              />
              {/* Botón toggle 3D SOLO en fullscreen */}
              <div className="absolute top-4 left-4 z-[10001]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setIs3D((prev) => !prev)}
                      className={`bg-background shadow-lg rounded-full p-3 border border-primary/75 hover:bg-background/85 transition active:scale-95 flex items-center justify-center ${
                        is3D
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground"
                      }`}
                      aria-label="Toggle 3D"
                    >
                      <Cuboid size={24} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {is3D ? "Desactivar vista 3D" : "Activar vista 3D"}
                  </TooltipContent>
                </Tooltip>
              </div>
              {/* Botón minimizar y controles de zoom agrupados */}
              <div className="absolute top-4 right-4 z-[10000] flex flex-col items-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="bg-background shadow-lg rounded-full p-3 border border-primary/75 hover:bg-background/85 transition active:scale-95"
                  aria-label="Minimizar mapa"
                >
                  <Minimize size={24} />
                </button>
                <div className="flex flex-col gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => mapRef.current?.zoomIn()}
                    className="bg-background shadow-lg rounded-full p-3 border border-primary/75 hover:bg-background/85 transition active:scale-95"
                    aria-label="Aumentar zoom"
                  >
                    <Plus size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={() => mapRef.current?.zoomOut()}
                    className="bg-background shadow-lg rounded-full p-3 border border-primary/75 hover:bg-background/85 transition active:scale-95"
                    aria-label="Reducir zoom"
                  >
                    <Minus size={24} />
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
            className={`relative h-full w-full rounded-xl${!isFullscreen ? " active" : ""}`}
          >
            <div
              ref={normalContainerRef}
              className="h-full w-full rounded-xl"
              style={{ background: "#fff" }}
            />
            <div className="absolute top-4 left-4  z-10">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIs3D((prev) => !prev)}
                    className={`bg-background shadow-lg rounded-full p-3 border border-primary/75 hover:bg-background/85 transition active:scale-95 flex items-center justify-center ${
                      is3D
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    }`}
                    aria-label="Toggle 3D"
                  >
                    <Cuboid size={24} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {is3D ? "Desactivar vista 3D" : "Activar vista 3D"}
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="absolute top-4 right-4  z-10 flex flex-col items-center justify-center gap-2 ">
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="bg-background shadow-lg rounded-full p-3 border border-primary/75 hover:bg-background/85 transition active:scale-95"
                aria-label="Expandir mapa"
              >
                <Expand size={24} />
              </button>
              <div className="flex flex-col gap-2 mt-4 ">
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomIn()}
                  className="bg-background shadow-lg rounded-full p-3 border border-primary/75 hover:bg-background/85 transition active:scale-95"
                  aria-label="Aumentar zoom"
                >
                  <Plus size={24} />
                </button>
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomOut()}
                  className="bg-background shadow-lg rounded-full p-3 border border-primary/75 hover:bg-background/85 transition active:scale-95"
                  aria-label="Reducir zoom"
                >
                  <Minus size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diálogos renderizados en el componente padre (dentro del contexto de React) */}
      {userRole === "PATIENT" && selectedProviderId && (
        <ScheduleAppointmentDialog
          idProvider={selectedProviderId}
          isOpen={scheduleDialogOpen}
          onClose={() => setScheduleDialogOpen(false)}
        >
          <MCButton className="w-full font-body text-sm sm:text-base py-5 sm:py-6">
            {t("service.schedule", "Agendar")}
          </MCButton>
        </ScheduleAppointmentDialog>
      )}

      {(userRole === "CENTER" || userRole === "DOCTOR") &&
        pendingConnectionId && (
          <ToogleConfirmConnection
            status="not_connected"
            id={parseInt(pendingConnectionId)}
            onConfirm={handleConfirmConnection}
            isOpen={confirmDialogOpen}
            onClose={() => setConfirmDialogOpen(false)}
          >
            <div style={{ display: "none" }} />
          </ToogleConfirmConnection>
        )}
    </>
  );
}
