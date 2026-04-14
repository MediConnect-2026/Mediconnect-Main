import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { FeatureCollection, Geometry } from "geojson";
import type { LngLatBoundsLike } from "mapbox-gl";
import bbox from "@turf/bbox";
import { point } from "@turf/helpers";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import {
  ParseDominicanAddress,
  type ParsedDominicanAddress,
} from "@/utils/addressParser";
import { Expand, Minimize, Plus, Minus, Cuboid, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { featureCollection } from "@turf/helpers";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

interface Props {
  value?: { lat: number; lng: number };
  onChange?: (lat: number, lng: number) => void;
  onLocationDetails?: (details: {
    address: string;
    neighborhood?: string;
    zipCode: string;
    province?: string;
    municipality?: string;
  }) => void;
  fontSizeVariant?: "xs" | "s" | "m" | "l";
  neighborhoodGeo?: Geometry | null;
  onPointSelected?: (
    lat: number,
    lng: number,
    isInsideNeighborhood: boolean,
  ) => void;
  readonly?: boolean;
  disabled?: boolean;
}

export default function MapSelectLocation({
  value,
  onChange,
  onLocationDetails,
  fontSizeVariant = "m",
  neighborhoodGeo,
  onPointSelected,
  readonly = false,
  disabled = false,
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

  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isProcessingPoint, setIsProcessingPoint] = useState(false);

  const [address, setAddress] = useState<ParsedDominicanAddress | null>(null);

  const neighborhoodGeoRef = useRef<Geometry | null>(null);

  // Refs para mantener valores actualizados sin romper closures
  const onLocationDetailsRef = useRef(onLocationDetails);
  const onPointSelectedRef = useRef(onPointSelected);
  const readonlyRef = useRef(readonly);
  const disabledRef = useRef(disabled);

  useEffect(() => {
    onLocationDetailsRef.current = onLocationDetails;
  }, [onLocationDetails]);
  useEffect(() => {
    onPointSelectedRef.current = onPointSelected;
  }, [onPointSelected]);
  useEffect(() => {
    readonlyRef.current = readonly;
  }, [readonly]);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

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
        console.error("Error cargando el polígono de Santo Domingo:", error);
      }
    };

    fetchGeoJSON();
  }, []);

  const getLocationDetails = async (lng: number, lat: number) => {
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
        setAddress(parsedAddress.direccion ? parsedAddress : null);

        onLocationDetailsRef.current?.({
          address: parsedAddress.direccion || "",
          zipCode: zipCode || "",
        });
      }
    } catch (error) {
      console.error("Error obteniendo detalles de ubicación:", error);
    }
  };

  useEffect(() => {
    if (!geoDatas.santoDomingo || !geoDatas.distritoNacional) return;

    const container = isFullscreen
      ? fullscreenContainerRef.current
      : normalContainerRef.current;
    if (!container) return;

    setisLoading(true);

    const todasLasFeatures = [
      ...geoDatas.santoDomingo.features,
      ...geoDatas.distritoNacional.features,
    ];

    const coleccionCombinada = featureCollection(todasLasFeatures);

    const boundsArray = bbox(coleccionCombinada);
    const limitesGenerales: LngLatBoundsLike = [
      [boundsArray[0], boundsArray[1]],
      [boundsArray[2], boundsArray[3]],
    ];

    const defaultCoords = { lat: 18.4861, lng: -69.9312 };
    const center: [number, number] =
      value?.lat && value?.lng && value.lat !== 0 && value.lng !== 0
        ? [value.lng, value.lat]
        : [defaultCoords.lng, defaultCoords.lat];

    const mapStyle =
      isdarkMode === "dark"
        ? "mapbox://styles/mapbox/dark-v11"
        : "mapbox://styles/mapbox/streets-v12";

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
      maxBounds: limitesGenerales,
      // Si está disabled desde el inicio, bloqueamos la interactividad nativa del mapa
      interactive: !disabledRef.current,
    });

    mapRef.current.on("load", () => {
      setisLoading(false);
      setIsMapLoaded(true);

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

      mapRef.current!.addSource("mapbox-dem", {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });

      requestAnimationFrame(() => {
        mapRef.current?.resize();
      });
    });

    const initialLat =
      value?.lat && value.lat !== 0 ? value.lat : defaultCoords.lat;
    const initialLng =
      value?.lng && value.lng !== 0 ? value.lng : defaultCoords.lng;

    if (markerRef.current) {
      markerRef.current.remove();
    }

    // El marcador solo es arrastrable si no es readonly y no está disabled
    markerRef.current = new mapboxgl.Marker({
      draggable: !readonlyRef.current && !disabledRef.current,
      color: "#e11d48",
      scale: isMobile ? 1.2 : 1.5,
    })
      .setLngLat([initialLng, initialLat])
      .addTo(mapRef.current);

    if ((!value?.lat || value.lat === 0) && (!value?.lng || value.lng === 0)) {
      onChange?.(defaultCoords.lat, defaultCoords.lng);
      getLocationDetails(defaultCoords.lng, defaultCoords.lat);
    }

    const handleMapPoint = async (lat: number, lng: number) => {
      if (isProcessingPoint || readonlyRef.current || disabledRef.current)
        return;

      setIsProcessingPoint(true);

      try {
        onChange?.(lat, lng);

        await getLocationDetails(lng, lat);

        const activeGeo = neighborhoodGeoRef.current;
        if (
          activeGeo &&
          (activeGeo.type === "Polygon" || activeGeo.type === "MultiPolygon")
        ) {
          const pt = point([lng, lat]);
          const geoFeature = {
            type: "Feature" as const,
            geometry: activeGeo as
              | import("geojson").Polygon
              | import("geojson").MultiPolygon,
            properties: {},
          };
          const isInside = booleanPointInPolygon(pt, geoFeature);
          if (isInside) {
            onPointSelectedRef.current?.(lat, lng, true);
          } else {
            await onPointSelectedRef.current?.(lat, lng, false);
          }
        } else {
          await onPointSelectedRef.current?.(lat, lng, false);
        }
      } catch (error) {
        console.error("Error procesando punto:", error);
      } finally {
        setIsProcessingPoint(false);
      }
    };

    markerRef.current.on("dragend", () => {
      if (readonlyRef.current || disabledRef.current) return;
      const position = markerRef.current!.getLngLat();
      handleMapPoint(position.lat, position.lng);
    });

    mapRef.current.on("click", (e) => {
      // Bloqueamos clics en el mapa si está cargando, es readonly o está deshabilitado
      if (isProcessingPoint || readonlyRef.current || disabledRef.current)
        return;

      const { lng, lat } = e.lngLat;
      markerRef.current!.setLngLat([lng, lat]);
      handleMapPoint(lat, lng);
    });

    return () => {
      setIsMapLoaded(false);
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
  }, [isFullscreen, isdarkMode, isMobile, geoDatas]);

  // Efecto para actualizar la interactividad dinámica sin necesidad de recargar el mapa
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setDraggable(!readonly && !disabled);
    }
    const map = mapRef.current;
    if (map && isMapLoaded) {
      if (disabled) {
        map.scrollZoom.disable();
        map.dragPan.disable();
        map.dragRotate.disable();
        map.doubleClickZoom.disable();
        map.touchZoomRotate.disable();
      } else {
        map.scrollZoom.enable();
        map.dragPan.enable();
        map.dragRotate.enable();
        map.doubleClickZoom.enable();
        map.touchZoomRotate.enable();
      }
    }
  }, [readonly, disabled, isMapLoaded]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    if (is3D) {
      map.easeTo({ pitch: 60, bearing: -17.6, duration: 1000 });
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
      if (map.getTerrain()) {
        map.setTerrain(null);
      }
      if (map.getLayer("3d-buildings")) {
        map.removeLayer("3d-buildings");
      }
    }
  }, [is3D, isMapLoaded]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current || !value || !isMapLoaded) return;

    const currentLngLat = markerRef.current.getLngLat();
    const shouldUpdatePosition =
      Math.abs(currentLngLat.lng - value.lng) > 0.0001 ||
      Math.abs(currentLngLat.lat - value.lat) > 0.0001;

    if (shouldUpdatePosition) {
      if (value.lat !== 0 && value.lng !== 0) {
        markerRef.current.setLngLat([value.lng, value.lat]);

        // Zoom automático al marcador seleccionado
        const map = mapRef.current;
        if (map) {
          const targetZoom = isMobile ? 15 : 16;
          try {
            map.easeTo({
              center: [value.lng, value.lat],
              zoom: targetZoom,
              duration: 800,
            });
          } catch {
            // fallback si easeTo falla por alguna razón
            map.flyTo({
              center: [value.lng, value.lat],
              zoom: targetZoom,
              speed: 0.8,
            });
          }
        }
      }
    }
  }, [value, isMapLoaded, isMobile]);

  useEffect(() => {
    neighborhoodGeoRef.current = neighborhoodGeo ?? null;
  }, [neighborhoodGeo]);

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
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    const SOURCE_ID = "barrio-geo";
    const FILL_LAYER_ID = "barrio-fill";
    const LINE_LAYER_ID = "barrio-line";

    const cleanup = () => {
      if (map.getLayer(FILL_LAYER_ID)) map.removeLayer(FILL_LAYER_ID);
      if (map.getLayer(LINE_LAYER_ID)) map.removeLayer(LINE_LAYER_ID);
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID);
    };

    if (!neighborhoodGeo) {
      cleanup();
      return;
    }

    setIsProcessingPoint(true);
    cleanup();

    const geoFeature: FeatureCollection<Geometry> = {
      type: "FeatureCollection",
      features: [
        { type: "Feature", geometry: neighborhoodGeo, properties: {} },
      ],
    };

    map.addSource(SOURCE_ID, { type: "geojson", data: geoFeature });

    map.addLayer({
      id: FILL_LAYER_ID,
      type: "fill",
      source: SOURCE_ID,
      paint: {
        "fill-color": "#e11d48",
        "fill-opacity": 0.12,
      },
    });

    map.addLayer({
      id: LINE_LAYER_ID,
      type: "line",
      source: SOURCE_ID,
      paint: {
        "line-color": "#e11d48",
        "line-width": 2,
        "line-opacity": 0.8,
      },
    });

    if (!neighborhoodGeo?.type || !neighborhoodGeo) {
      setIsProcessingPoint(false);
      return;
    }

    const [minLng, minLat, maxLng, maxLat] = bbox(geoFeature);
    map.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 60, maxZoom: 16, duration: 800 },
    );

    setTimeout(() => {
      setIsProcessingPoint(false);
    }, 900);
  }, [neighborhoodGeo, isMapLoaded]);

  const getFormattedAddress = () => {
    if (!address) return "";
    const parts = [
      address.direccion,
      address.municipio,
      address.provincia,
    ].filter(Boolean);
    return parts.join(", ");
  };

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

              {isProcessingPoint && (
                <div className="absolute inset-0 z-[10002] bg-black/20 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-background/95 rounded-full p-4 shadow-lg border border-primary/20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                </div>
              )}

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

              <div
                className={`absolute ${isMobile ? "top-16 left-2" : "top-4 left-4"} z-[10001]`}
              >
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setIs3D((prev) => !prev)}
                      disabled={isProcessingPoint || disabled}
                      className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 flex items-center justify-center ${
                        is3D
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground"
                      } ${isProcessingPoint || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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

              <div
                className={`absolute ${isMobile ? "top-2 right-2" : "top-4 right-4"} z-[10000] flex flex-col items-end gap-2`}
              >
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  disabled={isProcessingPoint || disabled}
                  className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 ${isProcessingPoint || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
                    disabled={isProcessingPoint || disabled}
                    className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 ${isProcessingPoint || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-label={t("ui.map.zoomIn")}
                  >
                    <Plus size={isMobile ? 20 : 24} />
                  </button>
                  <button
                    type="button"
                    onClick={() => mapRef.current?.zoomOut()}
                    disabled={isProcessingPoint || disabled}
                    className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 ${isProcessingPoint || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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

            {isProcessingPoint && (
              <div className="absolute inset-0 z-20 bg-black/20 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                <div className="bg-background/95 rounded-full p-4 shadow-lg border border-primary/20">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              </div>
            )}

            <div
              className={`absolute ${isMobile ? "top-2 left-2" : "top-4 left-4"} z-10`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setIs3D((prev) => !prev)}
                    disabled={isProcessingPoint || disabled}
                    className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 flex items-center justify-center ${
                      is3D
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    } ${isProcessingPoint || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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

            <div
              className={`absolute ${isMobile ? "top-2 right-2" : "top-4 right-4"} z-10 flex flex-col items-center justify-center gap-2`}
            >
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                disabled={isProcessingPoint || disabled}
                className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 ${isProcessingPoint || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
                  disabled={isProcessingPoint || disabled}
                  className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 ${isProcessingPoint || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label={t("ui.map.zoomIn")}
                >
                  <Plus size={isMobile ? 16 : 18} />
                </button>
                <button
                  type="button"
                  onClick={() => mapRef.current?.zoomOut()}
                  disabled={isProcessingPoint || disabled}
                  className={`bg-background shadow-lg rounded-full ${isMobile ? "p-2" : "p-3"} border border-primary/75 hover:bg-background/85 transition active:scale-95 ${isProcessingPoint || disabled ? "opacity-50 cursor-not-allowed" : ""}`}
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
