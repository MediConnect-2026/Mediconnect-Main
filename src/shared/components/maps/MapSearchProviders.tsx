import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import { type Provider } from "@/data/providers";
import ProviderPopup from "./ProviderPopup";
import { Expand, Minimize, Plus, Minus, Cuboid } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
import { AnimatePresence, motion } from "framer-motion"; // Corrige el import, debe ser de "framer-motion"
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
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
  const normalContainerRef = useRef<HTMLDivElement | null>(null);
  const fullscreenContainerRef = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [is3D, setIs3D] = useState(true); // Estado para el 3D
  const setisLoading = useGlobalUIStore((state) => state.setIsLoading);
  const isdarkMode = useGlobalUIStore((state) => state.theme);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null,
  );
  const [locationDenied, setLocationDenied] = useState(false); // Nuevo estado

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
      center: userLocation ?? [-69.93, 18.48], // <-- Aquí elige la ubicación del usuario si existe
      zoom: 12,
      pitch: is3D ? 60 : 0, // Cambia el pitch según el estado 3D
      bearing: is3D ? -17.6 : 0,
      antialias: true,
      // Habilitar rotación con drag/touch cuando esté en 3D
      dragRotate: is3D,
      // Configuraciones adicionales para mejor experiencia táctil
      touchPitch: is3D,
      pitchWithRotate: is3D,
      // Configurar límites de pitch para mejor control
      maxPitch: is3D ? 85 : 60,
      minPitch: is3D ? 0 : 0,
    });

    mapRef.current.on("load", () => {
      setisLoading(false);

      // Configurar controles de navegación según el modo 3D
      if (is3D) {
        // Habilitar rotación con teclas también
        mapRef.current!.keyboard.enable();
        mapRef.current!.dragRotate.enable();
        // touchRotate is not a valid property; touch rotation is enabled via dragRotate and map options

        // Agregar instrucciones de uso en dispositivos táctiles
        if ("ontouchstart" in window) {
          // Mostrar brevemente las instrucciones de rotación
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

            // Remover el elemento después de 3 segundos
            setTimeout(() => {
              if (instructionDiv.parentNode) {
                instructionDiv.parentNode.removeChild(instructionDiv);
              }
            }, 3000);
          }, 1000);
        }

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

    // Limpiar markers anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Agrega el marcador rojo si hay ubicación del usuario
    if (userLocation && mapRef.current) {
      const userMarker = new mapboxgl.Marker({
        color: "#e11d48", // rojo
        scale: 1.3,
      })
        .setLngLat(userLocation)
        .addTo(mapRef.current);

      markersRef.current.push(userMarker);
    }

    providers.forEach((provider) => {
      const isSelected = selectedProviders.includes(provider.id);

      const popupNode = document.createElement("div");
      const root = createRoot(popupNode);
      root.render(
        <ProviderPopup
          provider={provider}
          isSelected={isSelected}
          onSelect={(id) => onProviderSelect?.(id)}
        />,
      );

      const popup = new mapboxgl.Popup({
        offset: 20,
        closeButton: false,
        closeOnClick: true,
        maxWidth: "none",
        className: "mapbox-popup-high-z",
      }).setDOMContent(popupNode);

      const marker = new mapboxgl.Marker({
        color: provider.type === "doctor" ? "#A8C3A0" : "#8BB1CA",
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
      setisLoading(false);
    };
  }, [
    providers,
    selectedProviders,
    onProviderSelect,
    isFullscreen,
    isdarkMode,
    is3D,
    userLocation,
  ]);

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
          setLocationDenied(true); // Si el usuario niega, mostramos mensaje
        },
      );
    }
  }, []);

  return (
    <>
      {locationDenied && (
        <div className="fixed top-4 left-1/2 z-[10002] -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded shadow-lg rounded-3xl">
          Debes permitir el acceso a tu ubicación para centrar el mapa en tu
          posición.
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
    </>
  );
}
