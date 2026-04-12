import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { ChevronRight, MapPin } from "lucide-react";
import MCButton from "@/shared/components/forms/MCButton";
import { Button } from "@/shared/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shared/ui/tooltip";
import ManageLocation from "./Modals/ManageLocation";
import { useRef, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useUbicaciones } from "@/features/onboarding/services/useUbicaciones";
import { Skeleton } from "@/shared/ui/skeleton";

interface LocationCoordinate {
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

interface DoctorLocation {
  id: number;
  nombre: string;
  direccion: string;
  puntoGeografico: {
    type: string;
    coordinates: [number, number];
  };
  barrio?: {
    id: number;
    nombre: string;
  };
  estado?: string;
}

interface EditMode {
  locationId: number | null;
  isEditing: boolean;
}

function ServiceLocationStep() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const locationSelected = useCreateServicesStore((s) => s.createServiceData.location);
  const parsedSelectedLocationId = Number(locationSelected);
  const selectedLocationId = Number.isFinite(parsedSelectedLocationId)
    ? parsedSelectedLocationId
    : null;
  const setLocationData = useCreateServicesStore((s) => s.setCreateServiceField);
  const setLocationDataInStore = useCreateServicesStore((s) => s.setLocationData);
  const goToNextStep = useCreateServicesStore((s) => s.goToNextStep);
  const goToPreviousStep = useCreateServicesStore((s) => s.goToPreviousStep);

  // ─── NUEVO: Estado y Ref para controlar el modal de visualización ─────────
  const [viewLocation, setViewLocation] = useState<DoctorLocation | null>(null);
  const hiddenViewTriggerRef = useRef<HTMLButtonElement>(null);

  // ─── NUEVO: Estado para controlar el modo edición ─────────────────────────
  const [editMode, setEditMode] = useState<EditMode>({
    locationId: null,
    isEditing: false,
  });
  const hiddenEditTriggerRef = useRef<HTMLButtonElement>(null);

  const { data: doctorLocations = [], isLoading: isLoadingLocations, isError, refetch } = useUbicaciones("doctor", {});

  const mappedLocations: LocationCoordinate[] = useMemo(() => {
    if (!doctorLocations || doctorLocations.length === 0) return [];
    const locations = doctorLocations as DoctorLocation[];
    return locations
      .filter((loc) => 
        loc.puntoGeografico?.coordinates && 
        loc.puntoGeografico.coordinates.length === 2 &&
        typeof loc.puntoGeografico.coordinates[0] === "number" &&
        typeof loc.puntoGeografico.coordinates[1] === "number" &&
        !isNaN(loc.puntoGeografico.coordinates[0]) &&
        !isNaN(loc.puntoGeografico.coordinates[1]) &&
        isFinite(loc.puntoGeografico.coordinates[0]) &&
        isFinite(loc.puntoGeografico.coordinates[1])
      )
      .map((loc) => ({
        lat: loc.puntoGeografico.coordinates[1],
        lng: loc.puntoGeografico.coordinates[0],
        label: loc.nombre,
        color: Number(loc.id) === selectedLocationId ? "#dc2626" : "#6b7280",
      }));
  }, [doctorLocations, selectedLocationId]);

  function TruncatableTooltip({ text, className }: { text: string; className: string }) {
    const textRef = useRef<HTMLParagraphElement>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => {
      const el = textRef.current;
      if (el && el.scrollWidth > el.clientWidth) {
        setShowTooltip(true);
      } else {
        setShowTooltip(false);
      }
    };

    return (
      <TooltipProvider>
        <Tooltip open={showTooltip}>
          <TooltipTrigger asChild>
            <p
              ref={textRef}
              className={className}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={() => setShowTooltip(false)}
            >
              {text}
            </p>
          </TooltipTrigger>
          <TooltipContent>{text}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const LocationSkeleton = () => (
    <div className="border border-primary/15 p-3 rounded-2xl flex items-center justify-between">
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  );

  if (isError) {
    return (
      <ServicesLayoutsSteps title={t("createService.location.title")} description={t("createService.location.description")}>
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <MapPin className="w-16 h-16 text-muted-foreground/50" />
          <p className="text-center text-muted-foreground">
            {t("createService.location.errorLoadingLocations")}
          </p>
          <Button onClick={() => refetch()} variant="outline">
            {t("common.tryAgain")}
          </Button>
        </div>
      </ServicesLayoutsSteps>
    );
  }

  return (
    <ServicesLayoutsSteps
      title={t("createService.location.title")}
      description={t("createService.location.description")}
    >
      <div className="flex flex-col gap-8 items-center">
        {/* Mapa con todas las ubicaciones */}
        {isLoadingLocations ? (
          <Skeleton className="w-full h-[300px] rounded-xl" />
        ) : mappedLocations.length > 0 ? (
          <MapScheduleLocation showAddressInfo={false} multipleLocations={mappedLocations} />
        ) : (
          <div className="w-full h-[300px] rounded-xl border-2 border-dashed border-primary/20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <MapPin className="w-12 h-12" />
              <p className="text-sm text-center">{t("createService.location.noLocationsYet")}</p>
            </div>
          </div>
        )}

        {/* Lista de ubicaciones */}
        <div className={`w-full ${doctorLocations.length > 4 ? "max-h-72 overflow-y-auto" : ""}`}>
          {isLoadingLocations ? (
            <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
              {[1, 2, 3, 4].map((i) => <LocationSkeleton key={i} />)}
            </div>
          ) : doctorLocations.length > 0 ? (
            <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
              {doctorLocations.map((loc: DoctorLocation) => {
                const normalizedLocationId = Number(loc.id);
                return (
                <div
                  key={loc.id}
                  className={`border w-full border-primary/15 p-3 rounded-2xl flex items-center justify-between cursor-pointer transition hover:shadow-md
                    ${selectedLocationId === normalizedLocationId ? "bg-accent/50 border-primary/50 ring-2 ring-primary/20" : "hover:border-primary/30"}`}
                  onClick={() => {
                    // Seleccionar la ubicación
                    setLocationDataInStore({
                      name: loc.nombre,
                      address: loc.direccion,
                      coordinates: { latitude: loc.puntoGeografico.coordinates[1], longitude: loc.puntoGeografico.coordinates[0] },
                      neighborhood: loc.barrio ? String(loc.barrio.id) : undefined,
                    });
                    setLocationData("location", normalizedLocationId);
                    
                    // Abrir modal en modo edición si la ubicación está siendo seleccionada
                    if (selectedLocationId !== normalizedLocationId) {
                      setEditMode({ locationId: normalizedLocationId, isEditing: true });
                      setTimeout(() => hiddenEditTriggerRef.current?.click(), 0);
                    }
                  }}
                >
                  <div className={`flex flex-col gap-1 ${isMobile ? "max-w-[160px]" : "max-w-[180px]"}`}>
                    <TruncatableTooltip text={loc.nombre} className={`${isMobile ? "text-sm" : "text-base"} font-medium truncate cursor-help`} />
                    <TruncatableTooltip text={loc.direccion} className={`${isMobile ? "text-xs" : "text-sm"} font-normal text-muted-foreground truncate cursor-help`} />
                    {loc.barrio && <span className="text-xs text-muted-foreground/75">{loc.barrio.nombre}</span>}
                  </div>

                  <div className="flex gap-2">
                    {/* Botón de ver detalles */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full p-2 h-auto w-auto hover:bg-primary/10 hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewLocation(loc);
                        setTimeout(() => hiddenViewTriggerRef.current?.click(), 0);
                      }}
                      title={t("common.view", "Ver")}
                    >
                      <ChevronRight className={isMobile ? "w-4 h-4" : "w-5 h-5"} />
                    </Button>
                  </div>
                </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 py-8 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground/50" />
              <div>
                <p className="text-base font-medium text-foreground">{t("createService.location.noLocations")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("createService.location.addFirstLocation")}</p>
              </div>
            </div>
          )}
        </div>

        {/* ─── NUEVO: Modal oculto dedicado EXCLUSIVAMENTE a Modo Lectura ───────── */}
        <ManageLocation 
          isReadOnly 
          locationToView={viewLocation} 
          onCloseModal={() => setViewLocation(null)}
        >
          <button ref={hiddenViewTriggerRef} className="hidden" aria-hidden="true" />
        </ManageLocation>

        {/* ─── NUEVO: Modal oculto dedicado EXCLUSIVAMENTE a Modo Edición ─────── */}
        <ManageLocation
          locationId={editMode.locationId || undefined}
          onLocationUpdated={() => {
            setEditMode({ locationId: null, isEditing: false });
            refetch();
          }}
        >
          <button ref={hiddenEditTriggerRef} className="hidden" aria-hidden="true" />
        </ManageLocation>

        {/* Botón clásico para agregar nueva ubicación (Sigue funcionando igual que antes) */}
        <ManageLocation triggerClassName="w-full">
          <MCButton className="w-full rounded-xl" variant="tercero">
            {t("createService.location.addLocation")}
          </MCButton>
        </ManageLocation>

        <AuthFooterContainer
          continueButtonProps={{ disabled: selectedLocationId === null, onClick: () => goToNextStep() }}
          backButtonProps={{ onClick: () => goToPreviousStep() }}
        />
      </div>
    </ServicesLayoutsSteps>
  );
}

export default ServiceLocationStep;