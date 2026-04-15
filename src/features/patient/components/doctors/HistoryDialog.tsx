import React, { useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import { mockAppointments } from "@/data/appointments";
import { type Appointment } from "@/data/appointments";
import { FolderClock, BadgeCheck } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import FilterHistoryAppointments from "../filters/FilterHistoryAppointments";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MedicalPrescriptionDialog from "@/features/patient/components/appoiments/MedicalPrescriptionDialog";
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

function HistoryCard({
  historyItem,
  index,
  active,
  onClick,
  appointmentId,
}: {
  historyItem: NonNullable<Appointment["history"]>[0];
  index: number;
  active: boolean;
  onClick: () => void;
  appointmentId: string;
}) {
  const isMobile = useIsMobile();

  return (
    <MedicalPrescriptionDialog
      historyItem={{
        id: historyItem.id || `${appointmentId}-${index}`,
        cita: {
          id: appointmentId,
          servicio: { nombre: historyItem.service, especialidad: { nombre: "General" } },
          fechaFin: historyItem.date,
          horaInicio: historyItem.time,
          horaFin: historyItem.time,
          totalAPagar: 0,
          modalidad: historyItem.address,
        },
        nombre_diagnostico: "Consulta General",
        descripcion_diagnostico: "Sin detalles adicionales",
        adjuntos: []
      }}
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

function HistoryContent({ appointments }: { appointments: Appointment[] }) {
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

  // Tomar el primer appointment para mostrar info del doctor
  const appointment = appointments[0];

  // Unir todos los history de todas las citas del doctor
  const allHistory = appointments.flatMap(
    (appt) =>
      appt.history?.map((hist) => ({ ...hist, appointmentId: appt.id })) || [],
  );

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

  // Filter the history based on active filters
  const filteredHistory =
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
        !filters.locations.includes(histItem.address)
      ) {
        return false;
      }

      // Filter by time range
      if (filters.timeRange.length > 0) {
        const itemTime = histItem.time;
        const hour = parseInt(itemTime.split(":")[0]);

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
    }) || [];

  const getConsultationText = (count: number) => {
    return count === 1
      ? t("appointment.consultation")
      : t("appointment.consultation_plural");
  };

  return (
    <div className="w-full flex flex-col rounded-lg">
      {/* Doctor info */}
      {appointment && (
        <div className="flex items-center gap-3 mb-6">
          <div className="h-20 w-20 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center">
            {appointment.doctorAvatar ? (
              <Avatar className="h-20 w-20 rounded-full overflow-hidden">
                <AvatarImage
                  src={appointment.doctorAvatar}
                  alt={appointment.doctorName}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {appointment.doctorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            ) : (
              <MCUserAvatar
                name={appointment.doctorName}
                square
                size={96}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-xl text-primary">
                {appointment.doctorName}
              </p>
              <BadgeCheck className="w-6 h-6 text-background" fill="#8bb1ca" />
            </div>
            <p className="text-sm text-primary/75 font-medium">
              {appointment.doctorSpecialty}
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
        <MCFilterPopover
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
        >
          <FilterHistoryAppointments
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </MCFilterPopover>
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
              appointmentId={histItem.appointmentId}
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
    </div>
  );
}

function HistoryDialog({ children, doctorId }: HistoryDialogProps) {
  const { t } = useTranslation("patient");

  // Filtra todas las citas de este doctor
  const doctorAppointments = mockAppointments.filter(
    (appt) => appt.doctorId === doctorId,
  );

  return (
    <MCModalBase
      id="historydialog"
      title={t("appointment.medicalHistory")}
      trigger={children}
      size="xl"
      triggerClassName="w-full "
      variant="info"
    >
      <HistoryContent appointments={doctorAppointments} />
    </MCModalBase>
  );
}

export default HistoryDialog;
