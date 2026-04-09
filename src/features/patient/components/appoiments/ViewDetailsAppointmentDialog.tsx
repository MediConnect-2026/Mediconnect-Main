import React, { useEffect, useState, useCallback, useMemo, memo, useRef } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { mockAppointments } from "@/data/appointments";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import { FolderClock, Loader2, Ban } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import FilterHistoryAppointments from "../filters/FilterHistoryAppointments";
import { Badge } from "@/shared/ui/badge";
import MedicalPrescriptionDialog from "./MedicalPrescriptionDialog";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/shared/ui/empty";
import { useAppStore } from "@/stores/useAppStore";
import {
  getCitaById,
  getHistorialByPacienteId,
  getHistorialSelf,
} from "@/services/api/appointments.service";
import type { CitaDetalle, CitaDetallePaciente } from "@/types/AppointmentTypes";
import { formatTimeTo12h, mapCitaEstadoToAppointmentStatus } from "@/utils/appointmentMapper";
import ubicacionesService from "@/features/onboarding/services/ubicaciones.services";
import i18n from "@/i18n/config";
import { formatCurrency } from "@/utils/formatCurrency";
import { Skeleton } from "@/shared/ui/skeleton";

interface HistoryFilters {
  services: string[];
  dateRange?: [Date, Date];
  timeRange: string[];
  locations: string[];
}

interface ViewDetailsAppointmentDialogProps {
  children?: React.ReactNode;
  appointmentId: string;
  appointmentDetails?: React.ReactNode;
  hospitalDetails?: React.ReactNode;
  status?: string;
  preview?: "details" | "history" | "patientDetails";
}

// ✅ STATUS_MAP moved outside component — object is created once, not on every render
const STATUS_STYLE_MAP = {
  scheduled: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border-purple-200 dark:border-purple-500/30",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300 border-red-200 dark:border-red-500/30",
} as const;

type StatusKey = keyof typeof STATUS_STYLE_MAP;

// ─── PacientDetailsTabContent ────────────────────────────────────────────────
// ✅ memo: won't re-render unless patientData reference changes
const PacientDetailsTabContent = memo(function PacientDetailsTabContent({
  patientData,
}: {
  patientData?: any;
}) {
  const { t } = useTranslation("patient");

  return (
    <div className="mt-4 pr-2">
      <h2 className="text-xl font-semibold mb-4 text-primary">
        {t("appointment.patientDetailsTab", "Datos Personales")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h3 className="font-medium text-primary/75 mb-1">
            {t("appointment.patient.name", "Nombre Completo")}
          </h3>
          <p className="text-primary font-medium">
            {patientData?.nombre} {patientData?.apellido}
          </p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">
            {t("appointment.patient.age", "Edad")}
          </h3>
          <p className="text-primary font-medium">{patientData?.edad}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">
            {t("appointment.patient.bloodType", "Sangre")}
          </h3>
          <p className="text-primary font-medium">{patientData?.tipoSangre}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">
            {t("appointment.patient.height", "Altura")}
          </h3>
          <p className="text-primary font-medium">{patientData?.altura}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">
            {t("appointment.patient.weight", "Peso")}
          </h3>
          <p className="text-primary font-medium">{patientData?.peso}</p>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2 mt-4 text-primary">
        {t("appointment.patient.contactInfo", "Información de Contacto")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-medium text-primary/75 mb-1">
            {t("appointment.patient.email", "Email")}
          </h3>
          <p className="text-primary font-medium">
            {patientData?.usuario?.email}
          </p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">
            {t("appointment.patient.phone", "Teléfono")}
          </h3>
          <p className="text-primary font-medium">
            {patientData?.usuario?.telefono}
          </p>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2 mt-4 text-primary">
        {t("appointment.patient.medicalInfo", "Información Médica")}
      </h2>
      <div className="mb-4">
        <h3 className="font-medium mb-1 text-red-700">
          {t("appointment.patient.allergies", "Alergias")}
        </h3>
        <div className="max-h-32 overflow-y-auto">
          <ul className="list-disc ml-5">
            {(patientData?.caracteristicas || []).map((al: any, i: number) =>
              al?.condicion?.tipo === "Alergia" ? (
                <li key={i} className="font-medium text-primary">
                  {al.condicion.nombre} - {al.condicion.descripcion}
                </li>
              ) : null
            )}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="font-medium mb-1 text-orange-500">
          {t("appointment.patient.conditions", "Condiciones")}
        </h3>
        <div className="max-h-32 overflow-y-auto">
          <ul className="list-disc ml-5">
            {(patientData?.caracteristicas || []).map((cond: any, i: number) =>
              cond?.condicion.tipo === "Condicion" ? (
                <li key={i} className="font-medium text-primary">
                  {cond.condicion.nombre} - {cond.condicion.descripcion}
                </li>
              ) : null
            )}
          </ul>
        </div>
      </div>
    </div>
  );
});

// ─── DetailsTabContent ────────────────────────────────────────────────────────
// ✅ memo: only re-renders when appointment object changes
const DetailsTabContent = memo(function DetailsTabContent({
  appointment,
}: {
  appointment: CitaDetalle;
}) {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();

  console.log(appointment);

  // ✅ Derived map coordinates computed once via useMemo
  const mapCoords = useMemo(() => {
    const lat = appointment?.servicio?.latitude;
    const lng = appointment?.servicio?.longitude;
    if (
      lat !== undefined &&
      lng !== undefined &&
      !isNaN(lat) &&
      !isNaN(lng) &&
      isFinite(lat) &&
      isFinite(lng)
    ) {
      return { lat, lng };
    }
    return null;
  }, [appointment?.servicio?.latitude, appointment?.servicio?.longitude]);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 md:grid-rows-3 gap-4 w-full">
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.service")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.servicio.nombre}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.specialty")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.servicio.especialidad.nombre}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.date")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.fechaInicio.split("T")[0]}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.schedule")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {formatTimeTo12h(appointment.horaInicio)} -{" "}
            {formatTimeTo12h(appointment.horaFin)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.price")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {formatCurrency(appointment.totalAPagar)}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.numberOfPatients")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.numPacientes}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.modality")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.modalidad}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.insure")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.seguro
              ? appointment.seguro.nombre
              : t("appointments.noInsurance")}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.doctor")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.doctor
              ? `${appointment.doctor.nombre} ${appointment.doctor.apellido}`
              : t("appointment.noDoctorAssigned")}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-start gap-1">
        <h3 className="text-md text-primary/75 font-medium">
          {t("appointment.consultationReason", "Motivo de Consulta")}
        </h3>
        <p className="text-lg text-primary font-medium break-words max-w-xs">
          {appointment.motivoConsulta ||
            t("appointment.noConsultationReason", "Sin motivo especificado")}
        </p>
      </div>

      {/* ✅ Single map block — isMobile only controls styling, not conditional render */}
      {mapCoords && (
        <div
          className={`flex flex-col items-start gap-1 ${isMobile ? "pt-2" : "pb-4"}`}
        >
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.location")}
          </h3>
          <div className="w-full rounded-lg overflow-hidden">
            <MapScheduleLocation initialLocation={mapCoords} />
          </div>
        </div>
      )}
    </div>
  );
});

// ─── HistoryCardSkeleton ──────────────────────────────────────────────────────
const HistoryCardSkeleton = memo(function HistoryCardSkeleton() {
  return (
    <div className="flex flex-col md:flex-row bg-accent/30 dark:bg-primary/50 rounded-2xl w-full gap-4 p-4 items-center opacity-60 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="bg-accent/60 dark:bg-primary/80 p-5 rounded-full w-fit">
          <Skeleton className="size-7 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col justify-start items-start gap-2 w-full">
        <Skeleton className="h-5 w-48 rounded-md" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>
    </div>
  );
});


const HistoryCard = memo(function HistoryCard({
  historyItem,
  active,
  onClick,
  resetTrigger
}: {
  historyItem: any;
  active: boolean;
  onClick: () => void;
  resetTrigger?: number;
}) {
  const isMobile = useIsMobile();
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);

  useEffect(() => {
    setPrescriptionOpen(false);
  }, [resetTrigger]);

  const serviceName =
    historyItem.cita?.servicio?.nombre || historyItem.nombre_diagnostico || "";
  const dateFormatted = historyItem.creadoEn
    ? historyItem.creadoEn.split("T")[0]
    : historyItem.cita?.fechaInicio || "";
  const timeFormatted = historyItem.cita?.horaInicio
    ? formatTimeTo12h(historyItem.cita.horaInicio)
    : "";
  const addressFormatted = historyItem.cita?.modalidad || "";

  const handleCardClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      // ✅ FIX: Primero abre el modal de prescripción
      setPrescriptionOpen(true);
      // Luego marca como activo
      onClick();
    },
    [onClick]
  );

  const handlePrescriptionClose = useCallback(() => {
    setPrescriptionOpen(false);
  }, []);

  return (
    <>
      <div
        className={`flex flex-col md:flex-row bg-accent/30 dark:bg-primary/50 rounded-2xl w-full gap-4 justify-starts p-4 items-center cursor-pointer transition
          hover:bg-accent/50 dark:hover:bg-primary/30
          ${active ? "ring-2 ring-primary/60 bg-accent/60 dark:bg-primary/50" : "opacity-40 hover:opacity-100"}
        `}
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-accent/60 dark:bg-primary/80 p-5 rounded-full w-fit">
            <FolderClock
              className="text-primary dark:text-background"
              size={isMobile ? 20 : 28}
            />
          </div>
        </div>
        <div className="flex flex-col justify-start items-start">
          <h1 className="text-lg font-semibold text-primary">{serviceName}</h1>
          <div className="flex text-md text-primary/75 font-medium gap-2 items-center">
            {dateFormatted} · {timeFormatted} · {addressFormatted}
          </div>
        </div>
      </div>

      {/* ✅ Modal renderizado como hermano */}
      <MedicalPrescriptionDialog
        historyItem={historyItem}
        isOpen={prescriptionOpen}
        onClose={handlePrescriptionClose}
      />
    </>
  );
});

// ─── HistoryTabContent ────────────────────────────────────────────────────────
const HistoryTabContent = memo(function HistoryTabContent({
  history,
  loading,
  hasMore,
  onLoadMore,
  pacienteId,
}: {
  history: any[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  pacienteId?: string | number;
}) {

  const { t } = useTranslation("patient");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [filters, setFilters] = useState<HistoryFilters>({
    services: [],
    timeRange: [],
    locations: [],
    dateRange: undefined,
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      setActiveIndex(null);
      setResetTrigger(prev => prev + 1);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  const safeHistory = history[0] !== null && Array.isArray(history) ? history : [];

  // ✅ useCallback: stable reference for filter change handler
  const handleFiltersChange = useCallback((newFilters: Partial<HistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  // ✅ useCallback: stable reference for clear
  const handleClearFilters = useCallback(() => {
    setFilters({ services: [], timeRange: [], locations: [], dateRange: undefined });
  }, []);


  // ✅ useMemo: only recompute filtered list when history or filters change
  const filteredHistory = useMemo(() => {
    return safeHistory.filter((histItem) => {
      if (
        filters.services.length > 0 &&
        !filters.services.includes(
          histItem.cita?.servicio?.nombre || histItem.nombre_diagnostico || ""
        )
      )
        return false;

      if (
        filters.locations.length > 0 &&
        !filters.locations.includes(histItem.cita?.servicio?.id_ubicacion.toString())
      )
        return false;

      if (filters.timeRange.length > 0) {
        const itemTime = histItem.cita?.horaInicio || "00:00";
        const hour = parseInt(itemTime.split(":")[0]);
        const timeMatches = filters.timeRange.some((range) => {
          if (range === "morning" && hour >= 6 && hour < 12) return true;
          if (range === "afternoon" && hour >= 12 && hour < 18) return true;
          if (range === "evening" && hour >= 18 && hour <= 24) return true;
          return false;
        });
        if (!timeMatches) return false;
      }

      if (filters.dateRange) {
        const itemDateStr =
          histItem.creadoEn?.split("T")[0] ?? histItem.cita?.fechaInicio;
        if (!itemDateStr) return false;
        const itemDate = new Date(itemDateStr);
        const [startDate, endDate] = filters.dateRange;
        if (itemDate < startDate || itemDate > endDate) return false;
      }

      return true;
    });
  }, [safeHistory, filters]);

  // ✅ useMemo: count only changes when filters change
  const activeFiltersCount = useMemo(
    () =>
      filters.services.length +
      filters.timeRange.length +
      filters.locations.length +
      (filters.dateRange ? 1 : 0),
    [filters]
  );

  const consultationText = (count: number) =>
    count === 1
      ? t("appointment.consultation")
      : t("appointment.consultation_plural");

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <HistoryCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 mb-4 flex-wrap gap-4 md:flex md:items-center md:justify-between">
        <div className="flex flex-1 justify-between items-center gap-2">
          <h3 className="text-xl font-semibold text-primary">
            {t("appointment.medicalHistory")}
          </h3>
          {safeHistory.length > 0 && (
            <span className="text-sm text-primary/60 font-medium">
              {filteredHistory.length} {t("appointment.of")} {safeHistory.length}{" "}
              {consultationText(safeHistory.length)}
            </span>
          )}
        </div>

        {safeHistory.length > 0 && (
          <MCFilterPopover
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          >
            <FilterHistoryAppointments
              filters={filters}
              onFiltersChange={handleFiltersChange}
              pacienteId={pacienteId}
            />
          </MCFilterPopover>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {safeHistory.length === 0 && (
          <Empty className="py-12">
            <EmptyContent>
              <EmptyMedia>
                <FolderClock size={48} className="text-primary/20" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>{t("appointment.noHistoryAvailable")}</EmptyTitle>
                <EmptyDescription>
                  {t("appointment.noHistoryDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        )}

        {safeHistory.length > 0 && filteredHistory.length === 0 && (
          <Empty className="py-12">
            <EmptyContent>
              <EmptyMedia>
                <Ban size={48} className="text-primary/20" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>{t("appointment.noResultsFound")}</EmptyTitle>
                <EmptyDescription>
                  {t("appointment.noResultsDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        )}

        {filteredHistory.map((histItem, index) => (
          <HistoryCard
            key={histItem.id ?? index}
            historyItem={histItem}
            active={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            resetTrigger={resetTrigger}
          />
        ))}

        {hasMore && (
          <div ref={observerTarget} className="py-4 flex justify-center w-full">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </div>
    </div>
  );
});

// ─── ViewDetailsAppointmentDialog ─────────────────────────────────────────────
function ViewDetailsAppointmentDialog({
  children,
  appointmentId,
  appointmentDetails,
  hospitalDetails,
  preview = "details",
  status = "pending",
}: ViewDetailsAppointmentDialogProps) {
  const { t } = useTranslation("patient");
  const userRole = useAppStore((state) => state.user?.rol);
  const isPatientRole = userRole === "PATIENT";
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<CitaDetalle | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [appointmentStatusKey, setAppointmentStatusKey] = useState<StatusKey | null>(null);
  const [activeTab, setActiveTab] = useState<string>(preview);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);

  const appointmentStatus = mockAppointments.find(
    (appt) => appt.id === appointmentId
  )?.status;

  useEffect(() => {
    const getAppointmentData = async () => {
      if (!appointmentId || appointmentId === "") return;

      setLoading(true);
      try {
        const params = {
          translate_fields:
            "modalidad,nombre,descripcion,motivoCancelacion,motivoConsulta,comentario",
          target: i18n.language === "es" ? "es" : "en",
          source: i18n.language === "es" ? "en" : "es",
        };
        const response = await getCitaById(appointmentId, params);
        const payload = response?.data;

        if (!payload) {
          setAppointment(null);
          setHistory([]);
          setAppointmentStatusKey(null);
          return;
        }

        const appointmentData: CitaDetallePaciente | null = Array.isArray(payload)
          ? (payload[0] ?? null)
          : payload;

        if (!appointmentData) {
          setAppointment(null);
          setHistory([]);
          setAppointmentStatusKey(null);
          return;
        }

        const ubicacionId = appointmentData.cita.servicio?.id_ubicacion ?? null;
        if (ubicacionId) {
          try {
            const location = await ubicacionesService.getLocationById(
              Number(ubicacionId)
            );
            const coords = location?.puntoGeografico?.coordinates;
            if (Array.isArray(coords) && coords.length >= 2) {
              (appointmentData.cita.servicio as any).latitude = coords[1];
              (appointmentData.cita.servicio as any).longitude = coords[0];
              (appointmentData.cita.servicio as any).ubicacionData = location;
            }
          } catch (err) {
            console.warn(
              "No se pudo obtener la ubicación para ubicacionId",
              ubicacionId,
              err
            );
          }
        }

        setAppointment(appointmentData.cita);
        setAppointmentStatusKey(
          mapCitaEstadoToAppointmentStatus(appointmentData.cita.estado) as StatusKey
        );
      } catch (error) {
        console.error("Error fetching appointment details: ", error);
      } finally {
        setLoading(false);
      }
    };

    getAppointmentData();
  }, [appointmentId]);

  useEffect(() => {
    const fetchHistory = async () => {
      const targetUsuarioId = appointment?.paciente?.usuarioId;
      const canFetchDoctorHistory = !isPatientRole && !!targetUsuarioId;
      
      if (
        activeTab === "history" &&
        (isPatientRole || canFetchDoctorHistory) &&
        !historyFetched &&
        !historyLoading
      ) {
        setHistoryLoading(true);
        try {
          const params = {
            pagina: 1,
            limite: 10,
            translate_fields:
              "nombre_diagnostico,descripcion_diagnostico,modalidad,nombre,descripcion,motivoCancelacion,motivoConsulta,comentario",
            target: i18n.language === "es" ? "es" : "en",
            source: i18n.language === "es" ? "en" : "es",
          };
          const response = isPatientRole
            ? await getHistorialSelf(params)
            : await getHistorialByPacienteId(Number(targetUsuarioId), params);
          if (response?.success && Array.isArray(response.data)) {
            console.log("Fetch history:", response);
            setHistory(response.data);
            setHistoryPage(1);
            setHasMoreHistory(
              response.paginacion?.pagina < response.paginacion?.totalPaginas
            );
          }
        } catch (error) {
          console.error("Error fetching patient history", error);
        } finally {
          setHistoryLoading(false);
          setHistoryFetched(true);
        }
      }
    };

    fetchHistory();
  }, [
    activeTab,
    appointment?.paciente?.usuarioId,
    isPatientRole,
    historyFetched,
    i18n.language,
    historyLoading,
  ]);

  const loadMoreHistory = useCallback(async () => {
    const targetUsuarioId = appointment?.paciente?.usuarioId;
    if (loadingMoreHistory || !hasMoreHistory) return;
    if (!isPatientRole && !targetUsuarioId) return;

    setLoadingMoreHistory(true);
    try {
      const nextPage = historyPage + 1;
      const params = {
        pagina: nextPage,
        limite: 10,
        translate_fields:
          "nombre_diagnostico,descripcion_diagnostico,modalidad,nombre,descripcion,motivoCancelacion,motivoConsulta,comentario",
        target: i18n.language === "es" ? "es" : "en",
        source: i18n.language === "es" ? "en" : "es",
      };

      const response = isPatientRole
        ? await getHistorialSelf(params)
        : await getHistorialByPacienteId(Number(targetUsuarioId), params);

      if (response?.success && Array.isArray(response.data)) {
        setHistory((prev) => [...prev, ...response.data]);
        setHistoryPage(nextPage);
        setHasMoreHistory(
          response.paginacion?.pagina < response.paginacion?.totalPaginas
        );
      }
    } catch (error) {
      console.error("Error loading more history", error);
    } finally {
      setLoadingMoreHistory(false);
    }
  }, [
    appointment?.paciente?.usuarioId,
    isPatientRole,
    historyPage,
    hasMoreHistory,
    loadingMoreHistory,
    i18n.language,
  ]);

  const statusKey: StatusKey = (appointmentStatusKey || appointmentStatus || status) as StatusKey;

  // ✅ useMemo: statusInfo only changes when statusKey or language changes
  const statusInfo = useMemo(
    () => ({
      label: t(`appointment.status.${statusKey}`),
      color: STATUS_STYLE_MAP[statusKey] ?? "bg-gray-200 text-gray-600",
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusKey, i18n.language]
  );

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.detailsTitle")}
      trigger={children}
      triggerClassName="w-full flex-1"
      size="xl"
      variant="info"
    >
      <Tabs defaultValue={preview} onValueChange={(val) => setActiveTab(val)}>
        <TabsList variant="line" className="mb-4">
          <TabsTrigger value="details" className="text-lg">
            {t("appointment.detailsTab")}
          </TabsTrigger>
          {userRole === "DOCTOR" && (
            <TabsTrigger value="patientDetails" className="text-lg">
              {t("appointment.patientDetailsTab", "Patient Details")}
            </TabsTrigger>
          )}
          <TabsTrigger value="history" className="text-lg">
            {t("appointment.historyTab")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          {appointmentDetails ?? (
            loading ? (
              <div className="w-full h-full flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    {t("appointments.loading")}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col w-full h-full max-h-[70vh] overflow-y-auto pr-2">
                <div className="flex flex-col gap-4 mb-4 mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary/75">
                      {t("appointment.statusTitle", "Estado:")}
                    </span>
                    <Badge
                      variant="outline"
                      className={`px-2.5 py-0.5 border ${statusInfo.color}`}
                    >
                      {statusInfo.label}
                    </Badge>
                  </div>

                  {statusKey === "cancelled" && appointment?.motivoCancelacion && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-xs"
                          >
                            {t(
                              "appointment.cancellationReason",
                              "Motivo de Cancelación"
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm font-medium text-red-800 dark:text-red-200 mt-1">
                          {appointment.motivoCancelacion}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {appointment && (
                  <DetailsTabContent appointment={appointment} />
                )}
              </div>
            )
          )}
        </TabsContent>

        <TabsContent value="history">
          {hospitalDetails ?? (
            <div className="mt-4 h-full text-center">
              <HistoryTabContent
                history={history}
                loading={historyLoading}
                hasMore={hasMoreHistory}
                onLoadMore={loadMoreHistory}
                pacienteId={appointment?.paciente?.usuarioId}
              />
            </div>
          )}
        </TabsContent>

        {userRole === "DOCTOR" && (
          <TabsContent value="patientDetails">
            <PacientDetailsTabContent patientData={appointment?.paciente} />
          </TabsContent>
        )}
      </Tabs>
    </MCModalBase>
  );
}

export default ViewDetailsAppointmentDialog;