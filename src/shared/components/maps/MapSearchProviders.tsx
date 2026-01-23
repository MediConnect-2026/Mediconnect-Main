import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { createRoot } from "react-dom/client";
import { type Provider } from "@/data/providers";
import ProviderPopup from "./ProviderPopup";
import { Expand, Minimize, Plus, Minus } from "lucide-react";
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
import { AnimatePresence, motion } from "framer-motion"; // Corrige el import, debe ser de "framer-motion"

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

  // Este efecto inicializa el mapa en el contenedor correcto
  useEffect(() => {
    const container = isFullscreen
      ? fullscreenContainerRef.current
      : normalContainerRef.current;
    if (!container) return;

    mapRef.current = new mapboxgl.Map({
      container,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [-69.93, 18.48],
      zoom: 12,
    });

    // Limpiar markers anteriores
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

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
  }, [providers, selectedProviders, onProviderSelect, isFullscreen]);

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

  return (
    <>
      {/* Modal para fullscreen */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }} // Cambia aquí
            className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/10 backdrop-blur-sm dark:bg-black/40 flex items-center justify-center"
            style={{ backdropFilter: "blur(2px)" }}
          >
            <div
              className="relative bg-white rounded-4xl shadow-2xl overflow-hidden flex"
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
            transition={{ duration: 0.12 }} // Cambia aquí también
            className={`relative h-full w-full rounded-xl${!isFullscreen ? " active" : ""}`}
          >
            <div
              ref={normalContainerRef}
              className="h-full w-full rounded-xl"
              style={{ background: "#fff" }}
            />

            <div className="absolute top-4 right-4 z-49 flex flex-col items-center justify-center gap-2 ">
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
