import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import {
  FolderClock,
  Calendar,
  Clock,
  MapPin,
  User,
  Ellipsis,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCAppointmentsStatus from "@/shared/components/tables/MCAppointmentsStatus";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/shared/ui/empty";
import MedicalPrescriptionDialog from "@/features/patient/components/appoiments/MedicalPrescriptionDialog";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import FilterHistoryAppointments from "@/features/patient/components/filters/FilterHistoryAppointments";
import AppointmentActions from "@/features/patient/components/appoiments/AppointmentActions";
import FilterMyAppointments from "@/features/doctor/components/filters/FilterMyAppoinments";
import { useDoctorPatientInfo } from "@/features/doctor/hooks/useDoctorPatientInfo";
import type { DoctorPatientInfo } from "@/types/DoctorStatsTypes";
import { formatTimeTo12h, mapCitaEstadoToAppointmentStatus, isVirtualModality } from "@/utils/appointmentMapper";
import { useAppStore } from "@/stores/useAppStore";
import { getHistorialByPacienteId } from "@/services/api/appointments.service";

const DEFAULT_PATIENT_COVER_IMAGE =
  "https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=900&auto=format&fit=crop";
const FALLBACK_TEXT = "—";

interface PatientViewModel {
  id: string;
  fullName: string;
  initials: string;
  since: string;
  age: string;
  blood: string;
  height: string;
  weight: string;
  email: string;
  gender: string;
  phone: string;
  coverImage: string;
  avatar: string;
  allergies: string[];
  conditions: string[];
  futurasCitas: {
    citaId: string;
    estado: string;
    fecha: string;
    hora: string;
    modalidad: string;
    servicio: {
      id: string;
      nombre: string;
      especialidad: {
        id: string;
        nombre: string;
      }
    }
  }[];
}

const calculateAge = (birthDateString: string | null | undefined): number | null => {
  if (!birthDateString) return null;
  const birthDate = new Date(birthDateString);
  if (Number.isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const monthDiff = now.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Math.max(age, 0);
};

const formatPatientSince = (dateString: string | null | undefined, language: string): string => {
  if (!dateString) return FALLBACK_TEXT;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return FALLBACK_TEXT;

  return date.toLocaleDateString(language === "es" ? "es-DO" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const getPatientInitials = (fullName: string): string =>
  fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase() || "P";

interface UpcomingFilters {
  status: string;
  appointmentType: string;
  specialty: string;
  service: string;
  dateRange?: [Date, Date];
}

interface HistoryFilters {
  services: string[];
  dateRange?: [Date, Date];
  timeRange: string[];
  locations: string[];
}



// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoField({ label, value }: { label: string; value: string }) {
  const isMobile = useIsMobile();
  return (
    <div className="flex flex-col">
      <h3
        className={`font-medium text-primary/75 mb-1 ${isMobile ? "text-xs" : "text-sm"}`}
      >
        {label}
      </h3>
      <p
        className={`text-primary font-medium ${isMobile ? "text-sm" : "text-base"}`}
      >
        {value}
      </p>
    </div>
  );
}

function PersonalTab({ patient }: { patient: PatientViewModel }) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-6 mt-4 md:gap-8 md:mt-6">
      {/* Datos Personales */}
      <section>
        <h2
          className={`font-bold text-foreground mb-3 md:mb-4 ${isMobile ? "text-sm" : "text-base"}`}
        >
          {t("patientDetails.personal.title")}
        </h2>
        <div
          className={`grid gap-4 md:gap-6 ${isMobile ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}
        >
          <InfoField
            label={t("patientDetails.personal.fullName")}
            value={patient.fullName}
          />
          <InfoField
            label={t("patientDetails.personal.age")}
            value={patient.age}
          />
          <InfoField
            label={t("patientDetails.personal.blood")}
            value={patient.blood}
          />
          <InfoField
            label={t("patientDetails.personal.height")}
            value={patient.height}
          />
          <InfoField
            label={t("patientDetails.personal.weight")}
            value={patient.weight}
          />
          <InfoField
            label={t("patientDetails.personal.gender")}
            value={patient.gender}
          />
        </div>
      </section>

      {/* Contacto */}
      <section>
        <h2
          className={`font-bold text-foreground mb-3 md:mb-4 ${isMobile ? "text-sm" : "text-base"}`}
        >
          {t("patientDetails.personal.contactTitle")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <InfoField
            label={t("patientDetails.personal.email")}
            value={patient.email}
          />
          <InfoField
            label={t("patientDetails.personal.phone")}
            value={patient.phone}
          />
        </div>
      </section>

      {/* Médica */}
      <section>
        <h2
          className={`font-bold text-foreground mb-3 md:mb-4 ${isMobile ? "text-sm" : "text-base"}`}
        >
          {t("patientDetails.personal.medicalTitle")}
        </h2>
        <div className="flex flex-col gap-4">
          <div>
            <h3
              className={`font-medium mb-1 text-red-700 ${isMobile ? "text-xs" : "text-sm"}`}
            >
              {t("patientDetails.personal.allergies")}
            </h3>
            <div className="max-h-32 overflow-y-auto">
              {patient.allergies.length > 0 ? (
                <ul className="list-disc ml-5">
                  {patient.allergies.map((allergy, index) => (
                    <li
                      key={`${allergy}-${index}`}
                      className={`font-medium text-primary ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      {allergy}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`font-medium text-primary ${isMobile ? "text-xs" : "text-sm"}`}>
                  {FALLBACK_TEXT}
                </p>
              )}
            </div>
          </div>
          <div>
            <h3
              className={`font-medium mb-1 text-orange-500 ${isMobile ? "text-xs" : "text-sm"}`}
            >
              {t("patientDetails.personal.conditions")}
            </h3>
            <div className="max-h-32 overflow-y-auto">
              {patient.conditions.length > 0 ? (
                <ul className="list-disc ml-5">
                  {patient.conditions.map((condition, index) => (
                    <li
                      key={`${condition}-${index}`}
                      className={`font-medium text-primary ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      {condition}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={`font-medium text-primary ${isMobile ? "text-xs" : "text-sm"}`}>
                  {FALLBACK_TEXT}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function HistoryCard({
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
      setPrescriptionOpen(true);
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

      <MedicalPrescriptionDialog
        historyItem={historyItem}
        isOpen={prescriptionOpen}
        onClose={handlePrescriptionClose}
      />
    </>
  );
}

function HistoryTab({ pacienteId }: { pacienteId?: string | number }) {
  const { t, i18n } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [fetched, setFetched] = useState(false);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      setActiveIndex(null);
      setResetTrigger(prev => prev + 1);
    };
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (pacienteId && !fetched && !loading) {
        setLoading(true);
        try {
          const params = {
            pagina: 1,
            limite: 10,
            translate_fields:
              "nombre_diagnostico,descripcion_diagnostico,modalidad,nombre,descripcion,motivoCancelacion,motivoConsulta,comentario",
            target: i18n.language === "es" ? "es" : "en",
            source: i18n.language === "es" ? "en" : "es",
          };
          const response = await getHistorialByPacienteId(pacienteId, params);
          if (response?.success && Array.isArray(response.data)) {
            setHistory(response.data);
            setPage(1);
            setHasMore(response.paginacion?.pagina < response.paginacion?.totalPaginas);
          }
        } catch (error) {
          console.error("Error fetching patient history", error);
        } finally {
          setLoading(false);
          setFetched(true);
        }
      }
    };
    fetchHistory();
  }, [pacienteId, fetched, i18n.language]);

  const loadMore = useCallback(async () => {
    if (!pacienteId || loading || !hasMore) return;
    setLoading(true);
    try {
      const nextPage = page + 1;
      const params = {
        pagina: nextPage,
        limite: 10,
        translate_fields:
          "nombre_diagnostico,descripcion_diagnostico,modalidad,nombre,descripcion,motivoCancelacion,motivoConsulta,comentario",
        target: i18n.language === "es" ? "es" : "en",
        source: i18n.language === "es" ? "en" : "es",
      };
      const response = await getHistorialByPacienteId(pacienteId, params);
      if (response?.success && Array.isArray(response.data)) {
        setHistory((prev) => [...prev, ...response.data]);
        setPage(nextPage);
        setHasMore(response.paginacion?.pagina < response.paginacion?.totalPaginas);
      }
    } catch (error) {
      console.error("Error loading more history", error);
    } finally {
      setLoading(false);
    }
  }, [pacienteId, page, hasMore, loading, i18n.language]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    }, { threshold: 0.1 });
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  const [filters, setFilters] = useState<HistoryFilters>({
    services: [],
    timeRange: [],
    locations: [],
    dateRange: undefined,
  });

  const handleFiltersChange = (newFilters: Partial<HistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const activeFiltersCount =
    filters.services.length +
    filters.timeRange.length +
    filters.locations.length +
    (filters.dateRange ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      services: [],
      timeRange: [],
      locations: [],
      dateRange: undefined,
    });
  };

  const safeHistory = history[0] !== null && Array.isArray(history) ? history : [];

  const filteredHistory = safeHistory.filter((histItem) => {
    if (
      filters.services.length > 0 &&
      !filters.services.includes(
        histItem.cita?.servicio?.nombre || histItem.nombre_diagnostico || ""
      )
    )
      return false;

    if (
      filters.locations.length > 0 &&
      !filters.locations.includes(histItem.cita?.servicio?.id_ubicacion?.toString())
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

  if (loading && history.length === 0) {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center justify-center p-6 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-4 md:gap-4 md:mt-6">
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <h3
            className={`font-semibold text-primary ${isMobile ? "text-base" : "text-xl"}`}
          >
            {t("patientDetails.history.title")}
          </h3>
          {safeHistory.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {t("patientDetails.history.count", {
                filtered: filteredHistory.length,
                total: safeHistory.length,
              })}
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

      <div
        className={`flex flex-col gap-3 md:gap-5 ${filteredHistory.length > 5
          ? "max-h-[420px] md:max-h-[480px] overflow-y-auto pr-1 md:pr-2"
          : ""
          } transition-all`}
      >
        {safeHistory.length > 0 && filteredHistory.length === 0 && (
          <Empty className="py-8 md:py-12">
            <EmptyContent>
              <EmptyMedia>
                <FolderClock
                  size={isMobile ? 36 : 48}
                  className="text-primary/20"
                />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle className={isMobile ? "text-sm" : ""}>
                  {t("patientDetails.history.noResults")}
                </EmptyTitle>
                <EmptyDescription className={isMobile ? "text-xs" : ""}>
                  {t("patientDetails.history.noResultsDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        )}

        {safeHistory.length === 0 && (
          <Empty className="py-8 md:py-12">
            <EmptyContent>
              <EmptyMedia>
                <FolderClock
                  size={isMobile ? 36 : 48}
                  className="text-primary/20"
                />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle className={isMobile ? "text-sm" : ""}>
                  {t("patientDetails.history.empty")}
                </EmptyTitle>
                <EmptyDescription className={isMobile ? "text-xs" : ""}>
                  {t("patientDetails.history.emptyDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        )}

        {filteredHistory.map((h, index) => (
          <HistoryCard
            key={h.id || index}
            historyItem={h}
            active={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            resetTrigger={resetTrigger}
          />
        ))}

        {hasMore && (
          <div ref={observerTarget} className="py-4 flex justify-center w-full">
            {loading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <div className="h-8 w-8" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function UpcomingTab({ incommingCitas }: { incommingCitas: DoctorPatientInfo["futurasCitas"][] }) {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<UpcomingFilters>({
    status: "all",
    appointmentType: "all",
    specialty: "all",
    service: "all",
    dateRange: undefined,
  });

  const sessionUser = useAppStore((state) => state.user);

  const handleFiltersChange = (newFilters: Partial<UpcomingFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const activeFiltersCount =
    (filters.status !== "all" ? 1 : 0) +
    (filters.appointmentType !== "all" ? 1 : 0) +
    (filters.specialty !== "all" ? 1 : 0) +
    (filters.service !== "all" ? 1 : 0) +
    (filters.dateRange ? 1 : 0);

  const handleClearFilters = () => {
    setFilters({
      status: "all",
      appointmentType: "all",
      specialty: "all",
      service: "all",
      dateRange: undefined,
    });
  };

  const { specialtyOptions, serviceOptions } = useMemo(() => {
    const specialties = new Map<string, boolean>();
    const services = new Map<string, boolean>();

    incommingCitas.flat().forEach((apt) => {
      if (!apt) return;
      if (apt.servicio?.especialidad?.nombre) {
        specialties.set(apt.servicio.especialidad.nombre, true);
      }
      if (apt.servicio?.nombre) {
        services.set(apt.servicio.nombre, true);
      }
    });

    return {
      specialtyOptions: Array.from(specialties.keys()).sort(),
      serviceOptions: Array.from(services.keys()).sort(),
    };
  }, [incommingCitas]);

  const filteredUpcoming = incommingCitas.flat().filter((apt) => {
    if (!apt) return false;

    if (filters.status !== "all") {
      const mappedStatus = mapCitaEstadoToAppointmentStatus(apt.estado || "");
      if (mappedStatus !== filters.status) return false;
    }

    if (filters.appointmentType !== "all") {
      const isVirtual = isVirtualModality(apt.modalidad || "");
      const expectedVirtual = filters.appointmentType === "virtual";
      if (isVirtual !== expectedVirtual) return false;
    }

    if (
      filters.specialty !== "all" &&
      apt.servicio.especialidad?.nombre.toLowerCase() !== filters.specialty.toLowerCase()
    )
      return false;
    if (
      filters.service !== "all" &&
      apt.servicio.nombre.toLowerCase() !== filters.service.toLowerCase()
    )
      return false;
    if (filters.dateRange) {
      const aptDate = new Date(
        apt.fecha ? apt.fecha.replace(/(\d{1,2})\s(\w{3}),?\s(\d{4})/, "$2 $1, $3") : ""
      );
      const [startDate, endDate] = filters.dateRange;
      if (aptDate < startDate || aptDate > endDate) return false;
    }
    return true;
  });

  if (incommingCitas.length === 0) {
    return (
      <Empty className="py-8 md:py-12">
        <EmptyContent>
          <EmptyMedia>
            <Calendar size={isMobile ? 36 : 48} className="text-primary/20" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle className={isMobile ? "text-sm" : ""}>
              {t("patientDetails.upcoming.empty")}
            </EmptyTitle>
            <EmptyDescription className={isMobile ? "text-xs" : ""}>
              {t("patientDetails.upcoming.emptyDescription")}
            </EmptyDescription>
          </EmptyHeader>
        </EmptyContent>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col gap-3 mt-4 md:gap-4 md:mt-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex flex-col gap-0.5">
          <h2
            className={`font-semibold text-primary ${isMobile ? "text-base" : "text-xl"}`}
          >
            {t("patientDetails.upcoming.title")}
          </h2>
          {incommingCitas.length > 0 && (
            <span className="text-xs text-muted-foreground">
              {t("patientDetails.upcoming.count", {
                filtered: filteredUpcoming.length,
                total: incommingCitas.length,
              })}
            </span>
          )}
        </div>
        <MCFilterPopover
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
        >
          <FilterMyAppointments
            filters={filters}
            onFiltersChange={handleFiltersChange}
            specialtyOptions={specialtyOptions}
            serviceOptions={serviceOptions}
          />
        </MCFilterPopover>
      </div>

      {/* List */}
      <div
        className={`flex flex-col gap-3 md:gap-4 ${filteredUpcoming.length > 4
          ? "max-h-[420px] md:max-h-[480px] overflow-y-auto pr-1 md:pr-2"
          : ""
          } transition-all`}
      >
        {filteredUpcoming.length > 0 ? (
          filteredUpcoming.map((apt) => (
            <div
              key={apt?.citaId}
              className="flex flex-row bg-accent/30 dark:bg-primary/5 border border-primary/15 rounded-2xl w-full gap-3 p-3 md:p-4 items-center cursor-pointer transition hover:bg-accent/50 dark:hover:bg-primary/8"
            >
              {/* Icono */}
              <div
                className={`rounded-xl bg-primary/8 flex items-center justify-center shrink-0 ${isMobile ? "w-8 h-8" : "w-10 h-10"}`}
              >
                <Calendar
                  className={`text-primary ${isMobile ? "w-4 h-4" : "w-5 h-5"}`}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold text-foreground truncate ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  {apt?.servicio.nombre || FALLBACK_TEXT}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {apt?.servicio.especialidad?.nombre || FALLBACK_TEXT}
                </p>
                <div
                  className={`flex flex-wrap mt-1.5 ${isMobile ? "gap-1.5" : "gap-3"}`}
                >
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                      {apt?.fecha} · {formatTimeTo12h(apt?.hora ?? "")}
                    </span>
                  </span>
                  {!isMobile && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {/* {apt?.location || FALLBACK_TEXT} */}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="w-3 h-3 shrink-0" />
                    {apt?.modalidad === "Teleconsulta"
                      ? t("patientDetails.upcoming.virtual")
                      : t("patientDetails.upcoming.inPerson")}
                  </span>
                </div>
                {/* Location on mobile as a separate row */}
                {isMobile && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {/* <span className="truncate">{apt?.location || FALLBACK_TEXT}</span> */}
                  </span>
                )}
              </div>

              {/* Status + Actions */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {apt?.estado && <MCAppointmentsStatus status={mapCitaEstadoToAppointmentStatus(apt.estado)} />}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`bg-bg-btn-secondary rounded-full transition-colors hover:bg-primary/10 active:bg-primary/20 group ${isMobile ? "h-7 w-7" : ""}`}
                    >
                      <Ellipsis className="h-4 w-4 text-primary group-hover:text-primary/80 group-active:text-primary/60" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent isTablet placement="left">
                    <AppointmentActions
                      appointment={{
                        id: apt?.citaId ? apt.citaId.toString() : "",
                        doctorId: sessionUser?.id.toString() || "",
                        appointmentType: apt?.modalidad === "Teleconsulta" ? "virtual" : "in_person",
                        status: apt?.estado || "",
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          ))
        ) : (
          <Empty className="py-8 md:py-12">
            <EmptyContent>
              <EmptyMedia>
                <Calendar
                  size={isMobile ? 36 : 48}
                  className="text-primary/20"
                />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle className={isMobile ? "text-sm" : ""}>
                  {t("patientDetails.upcoming.noResults")}
                </EmptyTitle>
                <EmptyDescription className={isMobile ? "text-xs" : ""}>
                  {t("patientDetails.upcoming.noResultsDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
function PatientDetailsPage() {
  const { patientId } = useParams();
  const { t, i18n } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const translationFilters = useMemo(
    () => ({
      target: i18n.language === "es" ? "es" : "en",
      source: i18n.language === "es" ? "en" : "es",
      translate_fields:
        "nombre,tipoDocIdentificacion,condicionesMedicas.condicion.nombre,condicionesMedicas.condicion.descripcion,seguros.seguro.nombre,seguros.tipoSeguro.nombre",
    }),
    [i18n.language]
  );

  const {
    data: patientInfoResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useDoctorPatientInfo(patientId, translationFilters);

  const patient = useMemo<PatientViewModel>(() => {
    const patientData = patientInfoResponse?.data;

    if (!patientData) {
      return {
        id: patientId ?? "",
        fullName: FALLBACK_TEXT,
        initials: "P",
        since: FALLBACK_TEXT,
        age: FALLBACK_TEXT,
        blood: FALLBACK_TEXT,
        height: FALLBACK_TEXT,
        weight: FALLBACK_TEXT,
        email: FALLBACK_TEXT,
        gender: FALLBACK_TEXT,
        phone: FALLBACK_TEXT,
        coverImage: DEFAULT_PATIENT_COVER_IMAGE,
        avatar: "",
        allergies: [],
        conditions: [],
        futurasCitas: [],
      };
    }

    const fullName = `${patientData.nombre ?? ""} ${patientData.apellido ?? ""}`.trim();
    const yearsLabel = t("patients.metrics.years");
    const ageValue = calculateAge(patientData.fechaNacimiento);
    const ageLabel = ageValue !== null ? `${ageValue} ${yearsLabel}` : FALLBACK_TEXT;

    const allergies = patientData.condicionesMedicas
      .filter((item) => item.condicion.tipo.toLowerCase().includes("alerg"))
      .map((item) => item.condicion.nombre);

    const conditions = patientData.condicionesMedicas
      .filter((item) => !item.condicion.tipo.toLowerCase().includes("alerg"))
      .map((item) => item.condicion.nombre);

    return {
      id: patientData.id.toString(),
      fullName: fullName || FALLBACK_TEXT,
      initials: getPatientInitials(fullName),
      since: formatPatientSince(patientData.creadoEn, i18n.language),
      age: ageLabel,
      blood: patientData.tipoSangre ?? FALLBACK_TEXT,
      gender: patientData.genero === "M" ? "Masculino" : patientData.genero === "F" ? "Femenino" : "Otro",
      height:
        patientData.altura !== null && patientData.altura !== undefined
          ? `${patientData.altura} cm`
          : FALLBACK_TEXT,
      weight:
        patientData.peso !== null && patientData.peso !== undefined
          ? `${patientData.peso} kg`
          : FALLBACK_TEXT,
      email: patientData.email || FALLBACK_TEXT,
      phone: patientData.telefono || FALLBACK_TEXT,
      coverImage: patientData.banner || DEFAULT_PATIENT_COVER_IMAGE,
      avatar: patientData.fotoPerfil ?? "",
      allergies,
      conditions,
      futurasCitas: patientData.futurasCitas ? patientData.futurasCitas.map((cita) => ({
        citaId: cita.citaId.toString(),
        estado: cita.estado,
        fecha: cita.fecha,
        hora: cita.hora,
        modalidad: cita.modalidad,
        servicio: {
          id: cita.servicio.id.toString(),
          nombre: cita.servicio.nombre,
          especialidad: {
            id: cita.servicio.especialidad.id.toString(),
            nombre: cita.servicio.especialidad.nombre,
          },
        },
      })) : [],
    };
  }, [patientInfoResponse?.data, patientId, i18n.language, t]);

  if (!patientId) {
    return (
      <MCDashboardContent mainWidth="w-[100%]">
        <Empty className="py-12">
          <EmptyHeader>
            <div className="flex flex-col items-center gap-2">
              <span className="flex items-center justify-center gap-2 text-destructive">
                <AlertTriangle className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
                <EmptyTitle className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}>
                  {t("patients.error.title")}
                </EmptyTitle>
              </span>
              <EmptyDescription
                className={`text-muted-foreground text-center max-w-md mx-auto ${isMobile ? "text-sm" : "text-base"
                  }`}
              >
                {t("patients.error.description")}
              </EmptyDescription>
            </div>
          </EmptyHeader>
        </Empty>
      </MCDashboardContent>
    );
  }

  if (isLoading) {
    return (
      <MCDashboardContent mainWidth="w-[100%]">
        <div className="flex items-center justify-center w-full min-h-[420px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t("common.loading") || "Cargando..."}</span>
          </div>
        </div>
      </MCDashboardContent>
    );
  }

  if (isError) {
    return (
      <MCDashboardContent mainWidth="w-[100%]">
        <Empty className="py-12">
          <EmptyHeader>
            <div className="flex flex-col items-center gap-2">
              <span className="flex items-center justify-center gap-2 text-destructive">
                <AlertTriangle className={isMobile ? "w-5 h-5" : "w-7 h-7"} />
                <EmptyTitle className={`font-semibold ${isMobile ? "text-lg" : "text-xl"}`}>
                  {t("patients.error.title")}
                </EmptyTitle>
              </span>
              <EmptyDescription
                className={`text-muted-foreground text-center max-w-md mx-auto ${isMobile ? "text-sm" : "text-base"
                  }`}
              >
                {(error as Error)?.message || t("patients.error.description")}
              </EmptyDescription>
            </div>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => refetch()} size="sm">
              {t("patients.error.retry")}
            </Button>
          </EmptyContent>
        </Empty>
      </MCDashboardContent>
    );
  }

  return (
    <MCDashboardContent mainWidth="w-[100%]">
      <div className="bg-background border border-primary/15 rounded-3xl md:rounded-4xl overflow-hidden shadow-sm w-full mx-auto">
        {/* Cover */}
        <div className="relative h-28 sm:h-36 md:h-44 w-full">
          <img
            src={patient.coverImage}
            alt={patient.fullName}
            className="w-full h-full object-cover"
          />
          {/* Avatar */}
          <div className="absolute -bottom-10 md:-bottom-14 left-1/2 -translate-x-1/2">
            <Avatar
              className={`border-4 border-card shadow-lg ${isMobile ? "w-20 h-20" : "w-32 h-32"
                }`}
            >
              <AvatarImage
                src={patient.avatar || undefined}
                alt={patient.fullName}
                className="object-cover"
              />
              <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                {patient.initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Header */}
        <div
          className={`text-center px-4 ${isMobile ? "pt-12 pb-3" : "pt-18 pb-4"}`}
        >
          <h1
            className={`font-bold text-foreground ${isMobile ? "text-lg" : "text-xl"}`}
          >
            {patient.fullName}
          </h1>
          <p
            className={`text-muted-foreground mt-1 ${isMobile ? "text-xs" : "text-sm"}`}
          >
            {t("patientDetails.patientSince")} {patient.since}
          </p>
        </div>

        {/* Tabs */}
        <div className={`pb-6 md:pb-8 ${isMobile ? "px-3" : "px-4 sm:px-8"}`}>
          <Tabs defaultValue="personal" className="w-full">
            <TabsList variant="line" className="w-full justify-center">
              <TabsTrigger
                value="personal"
                className={
                  isMobile ? "text-xs px-3 py-2" : "text-base px-6 py-3"
                }
              >
                {t("patientDetails.tabs.personal")}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className={
                  isMobile ? "text-xs px-3 py-2" : "text-base px-6 py-3"
                }
              >
                {t("patientDetails.tabs.history")}
              </TabsTrigger>
              <TabsTrigger
                value="appointments"
                className={
                  isMobile ? "text-xs px-3 py-2" : "text-base px-6 py-3"
                }
              >
                {t("patientDetails.tabs.appointments")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <PersonalTab patient={patient} />
            </TabsContent>
            <TabsContent value="history">
              <HistoryTab pacienteId={patientId} />
            </TabsContent>
            <TabsContent value="appointments">
              <UpcomingTab incommingCitas={[patient.futurasCitas]} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default PatientDetailsPage;
