import React, { useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { mockAppointments } from "@/data/appointments";
import { type Appointment } from "@/data/appointments";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import { FolderClock } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import FilterHistoryAppointments from "../filters/FilterHistoryAppointments";
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
// Add the HistoryFilters interface
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
  preview?: "details" | "history" | "patientDetails"; // <--- agrega "patientDetails"
}

function PacientDetailsTabContent() {
  const { t } = useTranslation("patient");

  // Simulación de datos, reemplaza por props o datos reales
  const patient = {
    name: "Edwin Lopez",
    age: "45 años",
    blood: "O+",
    height: "175 cm",
    weight: "80 kg",
    email: "edwin.lopez@email.com",
    phone: "809-432-9532",
    allergies: [
      "Penicilina (produce erupción cutánea)",
      // Puedes agregar más alergias aquí
    ],
    conditions: [
      "Apendicectomía en 2010.",
      "Antecedentes familiares de diabetes tipo 2.",
      // Puedes agregar más condiciones aquí
    ],
  };

  return (
    <div className="mt-4 pr-2">
      <h2 className="text-xl font-semibold mb-4 text-primary">
        {t("appointment.patientDetailsTab", "Datos Personales")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h3 className="font-medium text-primary/75 mb-1">Nombre Completo</h3>
          <p className="text-primary font-medium">{patient.name}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">Edad</h3>
          <p className="text-primary font-medium">{patient.age}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">Sangre</h3>
          <p className="text-primary font-medium">{patient.blood}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">Altura</h3>
          <p className="text-primary font-medium">{patient.height}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">Peso</h3>
          <p className="text-primary font-medium">{patient.weight}</p>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2 mt-4 text-primary">
        Información de Contacto
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-medium text-primary/75 mb-1">Email</h3>
          <p className="text-primary font-medium">{patient.email}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">Teléfono</h3>
          <p className="text-primary font-medium">{patient.phone}</p>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2 mt-4 text-primary">
        Información Médica
      </h2>
      <div className="mb-4">
        <h3 className="font-medium mb-1 text-red-700">Alergias</h3>
        <div className="max-h-32 overflow-y-auto">
          <ul className="list-disc ml-5">
            {patient.allergies.map((al, i) => (
              <li key={i} className="font-medium text-primary">
                {al}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h3 className="font-medium mb-1 text-orange-500">Condiciones</h3>
        <div className="max-h-32 overflow-y-auto">
          <ul className="list-disc ml-5">
            {patient.conditions.map((cond, i) => (
              <li key={i} className="font-medium text-primary">
                {cond}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function DetailsTabContent({ appointment }: { appointment: Appointment }) {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 grid-rows-3 md:grid-rows-3 gap-4 w-full">
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.service")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.Service}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.specialty")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.doctorSpecialty}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.date")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.date}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.schedule")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.time}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.price")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            ${appointment.price}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.numberOfPatients")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.numberOfPatients}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.modality")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.appointmentType}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.insure")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            pon los seguros aqui
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.doctor")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.doctorName}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-start gap-1">
        <h3 className="text-md text-primary/75 font-medium">
          {t("appointment.description")}
        </h3>
        <p className="text-lg text-primary font-medium break-words max-w-xs">
          {appointment.description}
        </p>
      </div>
      {!isMobile && (
        <div className="flex flex-col items-start gap-1 pb-4">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.location")}
          </h3>
          <div className="w-full rounded-lg overflow-hidden">
            <MapScheduleLocation
              initialLocation={{
                lat: appointment.location.latitude,
                lng: appointment.location.longitude,
              }}
            />
          </div>
        </div>
      )}
      {isMobile && (
        <div className="flex flex-col items-start gap-1 pt-2">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.location")}
          </h3>
          <div className="w-full rounded-lg overflow-hidden">
            <MapScheduleLocation
              initialLocation={{
                lat: appointment.location.latitude,
                lng: appointment.location.longitude,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
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
  const { t } = useTranslation("patient");

  return (
    <MedicalPrescriptionDialog
      appointmentId={appointmentId}
      historyId={historyItem.id || `${appointmentId}-${index}`}
    >
      <div
        className={`flex flex-col md:flex-row bg-accent/30 dark:bg-primary/50 rounded-2xl w-full gap-4 justify-starts p-4 items-center cursor-pointer transition
          hover:bg-accent/50 dark:hover:bg-primary/30 
          ${active ? "ring-2 ring-primary/60 bg-accent/60 dark:bg-primary/50" : "opacity-40 hover:opacity-100"}
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

function HistoryTabContent({ appointment }: { appointment: Appointment }) {
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
    appointment.history?.filter((histItem) => {
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
      {/* Cambia el grid para ser columna en mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 mb-4 flex-wrap gap-4 md:flex md:items-center md:justify-between">
        <div className="flex flex-1 justify-between items-center gap-2">
          <h3 className="text-xl font-semibold text-primary">
            {t("appointment.medicalHistory")}
          </h3>
          {appointment.history && appointment.history.length > 0 && (
            <span className="text-sm text-primary/60 font-medium">
              {filteredHistory.length} {t("appointment.of")}{" "}
              {appointment.history.length}{" "}
              {getConsultationText(appointment.history.length)}
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
      <div className="flex flex-col gap-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((histItem, index) => (
            <HistoryCard
              key={histItem.id || index}
              historyItem={histItem}
              index={index}
              active={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              appointmentId={appointment.id}
            />
          ))
        ) : appointment.history && appointment.history.length > 0 ? (
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

type StatusKey =
  | "scheduled"
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

function ViewDetailsAppointmentDialog({
  children,
  appointmentId,
  appointmentDetails,
  hospitalDetails,
  preview = "details",
  status = "pending",
}: ViewDetailsAppointmentDialogProps) {
  const { t } = useTranslation("patient");
  const userRole = useAppStore((state) => state.user?.role);

  const appointmentStatus = mockAppointments.find(
    (appt) => appt.id === appointmentId,
  )?.status;

  // Crear el mapa de estados traducido
  const getStatusMap = () => ({
    scheduled: {
      label: t("appointment.status.scheduled"),
      color: "bg-[#6A1B9A]/12 text-[#6A1B9A]",
    },
    pending: {
      label: t("appointment.status.pending"),
      color: "bg-[#C77A1F]/12 text-[#C77A1F]",
    },
    in_progress: {
      label: t("appointment.status.in_progress"),
      color: "bg-[#1565C0]/12 text-[#1565C0]",
    },
    completed: {
      label: t("appointment.status.completed"),
      color: "bg-[#2E7D32]/12 text-[#2E7D32]",
    },
    cancelled: {
      label: t("appointment.status.cancelled"),
      color: "bg-[#C62828]/12 text-[#C62828]",
    },
  });

  const statusKey: StatusKey = (appointmentStatus || status) as StatusKey;
  const statusInfo = getStatusMap()[statusKey] || {
    label: appointmentStatus || status,
    color: "bg-gray-200 text-gray-600",
  };

  return (
    <MCModalBase
      id={appointmentId}
      title={t("appointment.detailsTitle")}
      trigger={children}
      triggerClassName="w-full flex-1"
      size="xl"
      variant="info"
    >
      <Tabs defaultValue={preview}>
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
        {/* Estado visual */}
        <div
          className={`flex w-full text-lg rounded-xl py-2 px-4 mb-4 ${statusInfo.color}`}
        >
          <p>{statusInfo.label}</p>
        </div>
        <TabsContent value="details">
          {appointmentDetails ? (
            appointmentDetails
          ) : (
            <div className="mt-4 text-muted-foreground flex flex-col items-start">
              <DetailsTabContent
                appointment={
                  mockAppointments.find((Q) => Q.id === appointmentId)!
                }
              />
            </div>
          )}
        </TabsContent>
        <TabsContent value="history">
          {hospitalDetails ? (
            hospitalDetails
          ) : (
            <div className="mt-4 h-full text-center ">
              <HistoryTabContent
                appointment={
                  mockAppointments.find((Q) => Q.id === appointmentId)!
                }
              />
            </div>
          )}
        </TabsContent>
        {userRole === "DOCTOR" && (
          <TabsContent value="patientDetails">
            <PacientDetailsTabContent />
          </TabsContent>
        )}
      </Tabs>
    </MCModalBase>
  );
}

export default ViewDetailsAppointmentDialog;
