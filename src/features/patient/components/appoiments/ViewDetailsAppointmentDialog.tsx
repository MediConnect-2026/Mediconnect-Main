import React, { useEffect, useState } from "react";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { useTranslation } from "react-i18next";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/shared/ui/tabs";
import { mockAppointments } from "@/data/appointments";
import { type Appointment } from "@/data/appointments";
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
import { getCitaById } from "@/services/api/appointments.service";
import type { CitaDetalle } from "@/types/AppointmentTypes";
import { formatTimeTo12h, mapCitaEstadoToAppointmentStatus } from "@/utils/appointmentMapper";
import ubicacionesService from "@/features/onboarding/services/ubicaciones.services";
import i18n from "@/i18n/config";
import { formatCurrency } from "@/utils/formatCurrency";


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

function PacientDetailsTabContent({ patientData }: { patientData?: any }) {
  const { t } = useTranslation("patient");

  return (
    <div className="mt-4 pr-2">
      <h2 className="text-xl font-semibold mb-4 text-primary">
        {t("appointment.patientDetailsTab", "Datos Personales")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        <div>
          <h3 className="font-medium text-primary/75 mb-1">{t("appointment.patient.name", "Nombre Completo")}</h3>
          <p className="text-primary font-medium">{patientData?.nombre} {patientData?.apellido}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">{t("appointment.patient.age", "Edad")}</h3>
          <p className="text-primary font-medium">{patientData?.edad}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">{t("appointment.patient.bloodType", "Sangre")}</h3>
          <p className="text-primary font-medium">{patientData?.tipoSangre}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">{t("appointment.patient.height", "Altura")}</h3>
          <p className="text-primary font-medium">{patientData?.altura}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">{t("appointment.patient.weight", "Peso")}</h3>
          <p className="text-primary font-medium">{patientData?.peso}</p>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2 mt-4 text-primary">
        {t("appointment.patient.contactInfo", "Información de Contacto")}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="font-medium text-primary/75 mb-1">{t("appointment.patient.email", "Email")}</h3>
          <p className="text-primary font-medium">{patientData?.usuario?.email}</p>
        </div>
        <div>
          <h3 className="font-medium text-primary/75 mb-1">{t("appointment.patient.phone", "Teléfono")}</h3>
          <p className="text-primary font-medium">{patientData?.usuario?.telefono}</p>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2 mt-4 text-primary">
        {t("appointment.patient.medicalInfo", "Información Médica")}
      </h2>
      <div className="mb-4">
        <h3 className="font-medium mb-1 text-red-700">{t("appointment.patient.allergies", "Alergias")}</h3>
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
        <h3 className="font-medium mb-1 text-orange-500">{t("appointment.patient.conditions", "Condiciones")}</h3>
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
}

function DetailsTabContent({ appointment }: { appointment: CitaDetalle }) {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();

  console.log("appointment in details tab content: ", appointment);

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
            {formatTimeTo12h(appointment.horaInicio)} - {formatTimeTo12h(appointment.horaFin)}
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
            {appointment.seguro ? appointment.seguro.nombre : t("appointments.noInsurance")}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="text-md text-primary/75 font-medium">
            {t("appointment.doctor")}
          </h3>
          <p className="text-lg text-primary font-medium break-words max-w-xs">
            {appointment.doctor ? `${appointment.doctor.nombre} ${appointment.doctor.apellido}` : t("appointment.noDoctorAssigned")}
          </p>
        </div>
      </div>
      <div className="flex flex-col items-start gap-1">
        <h3 className="text-md text-primary/75 font-medium">
          {t("appointment.consultationReason", "Motivo de Consulta")}
        </h3>
        <p className="text-lg text-primary font-medium break-words max-w-xs">
          {appointment.motivoConsulta || t("appointment.noConsultationReason", "Sin motivo especificado")}
        </p>
      </div>
      {!isMobile &&
        appointment.servicio.latitude !== undefined &&
        appointment.servicio.longitude !== undefined &&
        !isNaN(appointment.servicio.latitude) &&
        !isNaN(appointment.servicio.longitude) &&
        isFinite(appointment.servicio.latitude) &&
        isFinite(appointment.servicio.longitude) && (
          <div className="flex flex-col items-start gap-1 pb-4">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.location")}
            </h3>
            <div className="w-full rounded-lg overflow-hidden">
              <MapScheduleLocation
                initialLocation={{
                  lat: appointment.servicio.latitude,
                  lng: appointment.servicio.longitude,
                }}
              />
            </div>
          </div>
        )}
      {isMobile &&
        appointment.servicio.latitude !== undefined &&
        appointment.servicio.longitude !== undefined &&
        !isNaN(appointment.servicio.latitude) &&
        !isNaN(appointment.servicio.longitude) &&
        isFinite(appointment.servicio.latitude) &&
        isFinite(appointment.servicio.longitude) && (
          <div className="flex flex-col items-start gap-1 pt-2">
            <h3 className="text-md text-primary/75 font-medium">
              {t("appointment.location")}
            </h3>
            <div className="w-full rounded-lg overflow-hidden">
              <MapScheduleLocation
                initialLocation={{
                  lat: appointment.servicio.latitude,
                  lng: appointment.servicio.longitude,
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
  const userRole = useAppStore((state) => state.user?.rol);
  const [loading, setLoading] = useState(false);
  const [appointment, setAppointment] = useState<CitaDetalle | null>(null);
  const [appointmentStatusKey, setAppointmentStatusKey] = useState<StatusKey | null>(null);

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

  useEffect(() => {
    const getAppointmentData = async () => {
      if (!appointmentId || appointmentId === "") return;

      setLoading(true);
      try {
        const params = {
          translate_fields: "modalidad,nombre,descripcion,motivoCancelacion,motivoConsulta,comentario",
          target: i18n.language === "es" ? "es" : "en",
          source: i18n.language === "es" ? "en" : "es",
        };
        const response = await getCitaById(appointmentId, params);

        const payload = response?.data;
        if (!payload) {
          setAppointment(null);
          setAppointmentStatusKey(null);
        } else {
          // Normalize to a single CitaDetalle
          const appointmentData: CitaDetalle | null = Array.isArray(payload) ? (payload[0] ?? null) : payload;

          if (appointmentData) {
            // If the servicio includes an ubicacionId, try to fetch the full location
            const ubicacionId = appointmentData.servicio?.id_ubicacion ?? null;
            if (ubicacionId) {
              try {
                const location = await ubicacionesService.getLocationById(Number(ubicacionId));
                // location expected to have puntoGeografico.coordinates = [lng, lat]
                const coords = location?.puntoGeografico?.coordinates;

                if (Array.isArray(coords) && coords.length >= 2) {
                  // attach latitude/longitude to servicio for UI consumption
                  (appointmentData.servicio as any).latitude = coords[1];
                  (appointmentData.servicio as any).longitude = coords[0];
                  // keep full location data as well
                  (appointmentData.servicio as any).ubicacionData = location;
                }
              } catch (err) {
                console.warn("No se pudo obtener la ubicación para ubicacionId", ubicacionId, err);
              }
            }

            setAppointment(appointmentData);
            setAppointmentStatusKey(mapCitaEstadoToAppointmentStatus(appointmentData.estado) as StatusKey);

            console.log("Appointment details response: ", appointmentData, appointmentStatusKey);
          } else {
            setAppointment(null);
            setAppointmentStatusKey(null);
          }
        }
      } catch (error) {
        console.error("Error fetching appointment details: ", error);
      } finally {
        setLoading(false);
      }
    };

    getAppointmentData();
  }, [appointmentId]);


  const statusKey: StatusKey = (appointmentStatusKey || appointmentStatus || status) as StatusKey;
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
        <div className="flex flex-col gap-3 mb-4">
          <div
            className={`flex w-full text-lg rounded-xl py-2 px-4 ${statusInfo.color}`}
          >
            <p>{statusInfo.label}</p>
          </div>

          {/* Mostrar motivo de cancelación si está cancelado */}
          {statusKey === "cancelled" && appointment?.motivoCancelacion && (
            <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="destructive">
                    {t("appointment.cancellationReason", "Motivo de Cancelación")}
                  </Badge>
                </div>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {appointment.motivoCancelacion}
                </p>
              </div>
            </div>
          )}
        </div>
        <TabsContent value="details">
          {appointmentDetails ? (
            appointmentDetails
          ) : (
            loading ? (
              <div className="w-full h-full flex items-center justify-center p-6">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">{t("appointments.loading")}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 text-muted-foreground flex flex-col items-start">
                <DetailsTabContent
                  appointment={appointment as CitaDetalle}
                />
              </div>
            )
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
            <PacientDetailsTabContent patientData={appointment?.paciente} />
          </TabsContent>
        )}
      </Tabs>
    </MCModalBase>
  );
}

export default ViewDetailsAppointmentDialog;
