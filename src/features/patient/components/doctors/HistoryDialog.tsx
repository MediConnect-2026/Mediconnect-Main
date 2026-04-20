import React, { useEffect, useMemo, useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { FolderClock, BadgeCheck, Loader2 } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import FilterHistoryAppointments from "../filters/FilterHistoryAppointments";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MedicalPrescriptionDialog from "@/features/patient/components/appoiments/MedicalPrescriptionDialog";
import { getHistorialSelf } from "@/services/api/appointments.service";
import { formatTimeTo12h } from "@/utils/appointmentMapper";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
} from "@/shared/ui/empty";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";

interface HistoryFilters {
  services: string[];
  dateRange?: [Date, Date];
  timeRange: string[];
  locations: string[];
}

interface HistoryDialogProps {
  children?: React.ReactNode;
  doctorId: string | number;
}

interface HistoryListItem {
  id: string;
  appointmentId: string;
  date: string;
  time: string;
  rawTime?: string;
  address: string;
  locationId?: string;
  service: string;
  rawHistoryItem: any;
}

interface DoctorInfo {
  name: string;
  avatar?: string;
  specialty?: string;
}

function HistoryCard({
  historyItem,
  index,
  active,
  onClick,
}: {
  historyItem: HistoryListItem;
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  const isMobile = useIsMobile();

  const fallbackPrescriptionHistory = useMemo(
    () => ({
      id: historyItem.id || `${historyItem.appointmentId}-${index}`,
      cita: {
        id: historyItem.appointmentId,
        servicio: {
          nombre: historyItem.service,
          especialidad: { nombre: "General" },
        },
        fechaFin: historyItem.date,
        horaInicio: historyItem.time,
        horaFin: historyItem.time,
        totalAPagar: 0,
        modalidad: historyItem.address,
      },
      nombre_diagnostico: "Consulta General",
      descripcion_diagnostico: "Sin detalles adicionales",
      adjuntos: [],
    }),
    [historyItem.address, historyItem.appointmentId, historyItem.date, historyItem.id, historyItem.service, historyItem.time, index],
  );

  return (
    <MedicalPrescriptionDialog
      historyItem={historyItem.rawHistoryItem || fallbackPrescriptionHistory}
    >
      <div
        className={`flex bg-accent/30 dark:bg-primary/50 rounded-2xl w-full gap-4 justify-starts p-4 items-center cursor-pointer transition
          hover:bg-accent/50 dark:hover:bg-primary/70 
          ${active ? "ring-2 ring-primary/60 bg-accent/60 dark:bg-primary/80" : "opacity-40 hover:opacity-100"}
        `}
        onClick={onClick}
      >
        {/* Header con icono */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-accent/60 dark:bg-primary/80 p-5 rounded-full w-fit">
            <FolderClock
              className="text-primary dark:text-background"
              size={isMobile ? 20 : 28}
            />
          </div>
        </div>

        <div className="flex flex-col justify-start items-start">
          <h1 className="text-lg font-semibold text-primary">
            {historyItem.service}
          </h1>
          <div className="flex text-md text-primary/75 font-medium gap-2 items-center">
            {historyItem.date} · {historyItem.time} · {historyItem.address}
          </div>
        </div>
      </div>
    </MedicalPrescriptionDialog>
  );
}

function HistoryContent({
  doctor,
  history,
  loading,
  pacienteId,
}: {
  doctor?: DoctorInfo;
  history: HistoryListItem[];
  loading: boolean;
  pacienteId?: string | number;
}) {
  const { t } = useTranslation("patient");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [filters, setFilters] = useState<HistoryFilters>({
    services: [],
    timeRange: [],
    locations: [],
    dateRange: undefined,
  });

  const handleFiltersChange = (newFilters: Partial<HistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const allHistory = history;

  const activeFiltersCount = useMemo(
    () =>
      filters.services.length +
      filters.timeRange.length +
      filters.locations.length +
      (filters.dateRange ? 1 : 0),
    [filters],
  );

  const handleClearFilters = () => {
    setFilters({
      services: [],
      timeRange: [],
      locations: [],
      dateRange: undefined,
    });
  };

  // Filter the history based on active filters
  const filteredHistory = useMemo(
    () =>
      allHistory.filter((histItem) => {
      // Filter by services
      if (
        filters.services.length > 0 &&
        !filters.services.includes(histItem.service)
      ) {
        return false;
      }

      // Filter by locations
      if (
        filters.locations.length > 0 &&
        !filters.locations.includes(histItem.locationId || "")
      ) {
        return false;
      }

      // Filter by time range
      if (filters.timeRange.length > 0) {
        const itemTime = histItem.rawTime || "00:00";
        const hour = parseInt(itemTime.split(":")[0], 10);
        if (Number.isNaN(hour)) return false;

        const timeMatches = filters.timeRange.some((range) => {
          if (range === "morning" && hour >= 6 && hour < 12) return true;
          if (range === "afternoon" && hour >= 12 && hour < 18) return true;
          if (range === "evening" && hour >= 18 && hour <= 24) return true;
          return false;
        });

        if (!timeMatches) return false;
      }

      // Filter by date range
      if (filters.dateRange) {
        const itemDate = new Date(histItem.date);
        const [startDate, endDate] = filters.dateRange;

        if (itemDate < startDate || itemDate > endDate) {
          return false;
        }
      }

      return true;
      }) || [],
    [allHistory, filters],
  );

  const getConsultationText = (count: number) => {
    return count === 1
      ? t("appointment.consultation")
      : t("appointment.consultation_plural");
  };

  return (
    <div className="w-full flex flex-col rounded-lg">
      {loading && (
        <div className="w-full h-full flex items-center justify-center p-6">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">{t("appointments.loading")}</p>
          </div>
        </div>
      )}

      {!loading && (
        <>
      {/* Doctor info */}
      {doctor && (
        <div className="flex items-center gap-3 mb-6">
          <div className="h-20 w-20 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center">
            {doctor.avatar ? (
              <Avatar className="h-20 w-20 rounded-full overflow-hidden">
                <AvatarImage
                  src={doctor.avatar}
                  alt={doctor.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {doctor.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ) : (
              <MCUserAvatar
                name={doctor.name}
                square
                size={96}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-xl text-primary">
                {doctor.name}
              </p>
              <BadgeCheck className="w-6 h-6 text-background" fill="#8bb1ca" />
            </div>
            <p className="text-sm text-primary/75 font-medium">
              {doctor.specialty}
            </p>
          </div>
        </div>
      )}
      {/* Filter section */}
      <div className="grid grid-cols-2 mb-4 flex-wrap gap-4 md:flex md:items-center md:justify-between">
        <div className="flex flex-1 justify-between items-center gap-2">
          <h3 className="text-xl font-semibold text-primary">
            {t("appointment.medicalHistory")}
          </h3>
          {allHistory.length > 0 && (
            <span className="text-sm text-primary/60 font-medium">
              {filteredHistory.length} {t("appointment.of")} {allHistory.length}{" "}
              {getConsultationText(allHistory.length)}
            </span>
          )}
        </div>
        {allHistory.length > 0 && (
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
      {/* History list */}
      <div className="flex flex-col gap-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((histItem, index) => (
            <HistoryCard
              key={histItem.id || index}
              historyItem={histItem}
              index={index}
              active={activeIndex === index}
              onClick={() => setActiveIndex(index)}
            />
          ))
        ) : allHistory.length > 0 ? (
          <Empty className="py-12">
            <EmptyContent>
              <EmptyMedia>
                <FolderClock size={48} className="text-primary/20" />
              </EmptyMedia>
              <EmptyHeader>
                <EmptyTitle>{t("appointment.noResultsFound")}</EmptyTitle>
                <EmptyDescription>
                  {t("appointment.noResultsDescription")}
                </EmptyDescription>
              </EmptyHeader>
            </EmptyContent>
          </Empty>
        ) : (
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
      </div>
        </>
      )}
    </div>
  );
}

function HistoryDialog({ children, doctorId }: HistoryDialogProps) {
  const { t, i18n } = useTranslation("patient");
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryListItem[]>([]);
  const [doctor, setDoctor] = useState<DoctorInfo | undefined>(undefined);
  const [pacienteId, setPacienteId] = useState<string | number | undefined>(
    undefined,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchDoctorHistory = async () => {
      setLoading(true);
      try {
        const params = {
          pagina: 1,
          limite: 100,
          translate_fields:
            "nombre_diagnostico,descripcion_diagnostico,modalidad,nombre,descripcion,motivoCancelacion,motivoConsulta,comentario",
          target: i18n.language === "es" ? "es" : "en",
          source: i18n.language === "es" ? "en" : "es",
        };

        const response = await getHistorialSelf(params);

        if (!response?.success || !Array.isArray(response.data)) {
          setHistory([]);
          setDoctor(undefined);
          setPacienteId(undefined);
          return;
        }

        const normalizedDoctorId = String(doctorId);

        const doctorHistory = response.data.filter((item: any) => {
          const candidateIds = [
            item?.cita?.doctorId,
            item?.cita?.doctor?.usuarioId,
            item?.cita?.doctor?.id,
            item?.cita?.servicio?.doctorId,
          ]
            .filter((value) => value !== null && value !== undefined)
            .map((value) => String(value));

          return candidateIds.includes(normalizedDoctorId);
        });

        const mappedHistory: HistoryListItem[] = doctorHistory.map((item: any, index: number) => {
          const serviceName =
            item?.cita?.servicio?.nombre ||
            item?.nombre_diagnostico ||
            t("appointment.consultation");
          const dateRaw =
            item?.creadoEn ||
            item?.cita?.fechaFin ||
            item?.cita?.fechaInicio ||
            "";
          const timeRaw = item?.cita?.horaInicio || "";

          return {
            id: String(item?.id ?? `${item?.cita?.id ?? normalizedDoctorId}-${index}`),
            appointmentId: String(item?.cita?.id ?? normalizedDoctorId),
            service: serviceName,
            date: typeof dateRaw === "string" && dateRaw.includes("T") ? dateRaw.split("T")[0] : String(dateRaw),
            time: formatTimeTo12h(timeRaw) || timeRaw || "",
            rawTime: timeRaw,
            address:
              item?.cita?.ubicacion?.nombre ||
              item?.cita?.modalidad ||
              t("appointment.notSpecified", "No especificado"),
            locationId:
              item?.cita?.servicio?.id_ubicacion !== undefined &&
              item?.cita?.servicio?.id_ubicacion !== null
                ? String(item.cita.servicio.id_ubicacion)
                : undefined,
            rawHistoryItem: item,
          };
        });

        const firstItem = doctorHistory[0];
        setDoctor(
          firstItem
            ? {
                name: `${firstItem?.cita?.doctor?.nombre || ""} ${firstItem?.cita?.doctor?.apellido || ""}`.trim(),
                avatar: firstItem?.cita?.doctor?.usuario?.fotoPerfil || undefined,
                specialty: firstItem?.cita?.servicio?.especialidad?.nombre || "",
              }
            : undefined,
        );
        setPacienteId(
          firstItem?.cita?.paciente?.usuarioId ??
            firstItem?.cita?.pacienteId ??
            undefined,
        );

        setHistory(mappedHistory);
      } catch (error) {
        console.error("Error fetching doctor history", error);
        setHistory([]);
        setDoctor(undefined);
        setPacienteId(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorHistory();
  }, [doctorId, i18n.language, isOpen, t]);

  return (
    <MCModalBase
      id="historydialog"
      title={t("appointment.medicalHistory")}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={<div onClick={() => setIsOpen(true)}>{children}</div>}
      size="xl"
      triggerClassName="w-full "
      variant="info"
    >
      <HistoryContent
        doctor={doctor}
        history={history}
        loading={loading}
        pacienteId={pacienteId}
      />
    </MCModalBase>
  );
}

export default HistoryDialog;
