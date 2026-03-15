import { Calendar, Clock, Stethoscope, MapPin, History, FileText, User, File } from "lucide-react";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import ViewDetailsAppointmentDialog from "@/features/patient/components/appoiments/ViewDetailsAppointmentDialog";
import MedicalPrescriptionDialog from "@/features/patient/components/appoiments/MedicalPrescriptionDialog";
import { useCitaDetails } from "@/lib/hooks/useCitaDetails";
import { useAppStore } from "@/stores/useAppStore";
import { formatTimeTo12h } from "@/utils/appointmentMapper";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
const additionalSections = [
  { icon: History, labelKey: "consultationInfo.pastAppointments" },
  { icon: FileText, labelKey: "consultationInfo.lastConsultation" },
  { icon: User, labelKey: "consultationInfo.patientDetail" },
  { icon: File, labelKey: "consultationInfo.appointmentDetails" },
];

interface ConsultationInfoVerticalProps {
  appointmentId: string;
}

export const ConsultationInfoVertical = (
  props: ConsultationInfoVerticalProps,
) => {
  const { t } = useTranslation("common");
  const userRole = useAppStore((state) => state.user?.rol);
  const isMobile = useIsMobile();

  const { appointment, loading } = useCitaDetails(props.appointmentId);

  if (loading) {
    return (
      <div className="bg-background p-4 md:p-6 rounded-2xl md:rounded-3xl border border-primary/15 shadow-sm min-h-[300px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const isDoctorView = userRole === "DOCTOR";
  const avatarName = isDoctorView
    ? `${appointment.paciente?.nombre} ${appointment.paciente?.apellido}`.trim()
    : `${appointment.doctor?.nombre} ${appointment.doctor?.apellido}`.trim();
  const specialText = isDoctorView
    ? t("consultationInfo.patientSubtitle", "Paciente")
    : appointment.servicio?.especialidad?.nombre || "";

  const formattedDate = appointment.fechaInicio ? appointment.fechaInicio.split("T")[0] : "";
  const formattedTime = appointment.horaInicio && appointment.horaFin
    ? `${formatTimeTo12h(appointment.horaInicio)} - ${formatTimeTo12h(appointment.horaFin)}`
    : "";

  const mostRecentHistoryId = undefined; // Temporarily undefined until history API is integrated

  return (
    <div className="flex flex-col gap-4">
      {/* Información principal */}
      <div className="bg-background p-4 md:p-6 rounded-2xl md:rounded-3xl border border-primary/15 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
          {t("consultationInfo.title")}
        </h3>
        <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
          <div className="h-16 w-16 md:h-20 md:w-20 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center flex-shrink-0">
            <MCUserAvatar
              name={avatarName || "Usuario Requerido"}
              square={false}
              size={isMobile ? 64 : 80}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm md:text-base truncate">
              {avatarName || "No asignado"}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
              {specialText}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
            <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
            <span className="truncate">{formattedTime}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
            <Stethoscope className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
            <span className="truncate">{appointment.servicio?.nombre}</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
            <span className="line-clamp-2">{appointment.modalidad}</span>
          </div>
        </div>
      </div>
      {/* Secciones adicionales */}
      <div className="bg-background p-4 md:p-6 rounded-2xl md:rounded-3xl border border-primary/15 shadow-sm">
        <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
          {t("consultationInfo.additionalSections")}
        </h3>
        <div className="space-y-1.5 md:space-y-2">
          {additionalSections.map((section, index) => {
            const label = t(section.labelKey);
            if (label === t("consultationInfo.appointmentDetails")) {
              return (
                <ViewDetailsAppointmentDialog
                  appointmentId={props.appointmentId}
                  preview="details"
                  key={index}
                >
                  <button className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground hover:text-foreground hover:bg-bg-btn-secondary w-full p-2 transition-colors rounded-lg md:rounded-full text-left">
                    <section.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                </ViewDetailsAppointmentDialog>
              );
            }
            if (label === t("consultationInfo.pastAppointments")) {
              return (
                <ViewDetailsAppointmentDialog
                  appointmentId={props.appointmentId}
                  preview="history"
                  key={index}
                >
                  <button className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground hover:text-foreground hover:bg-bg-btn-secondary w-full p-2 transition-colors rounded-lg md:rounded-full text-left">
                    <section.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                </ViewDetailsAppointmentDialog>
              );
            }
            if (
              label === t("consultationInfo.patientDetail") &&
              userRole === "PATIENT"
            ) {
              return null;
            }
            if (
              label === t("consultationInfo.patientDetail") &&
              userRole !== "PATIENT"
            ) {
              return (
                <ViewDetailsAppointmentDialog
                  appointmentId={props.appointmentId}
                  preview="patientDetails"
                  key={index}
                >
                  <button className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground hover:text-foreground hover:bg-bg-btn-secondary w-full p-2 transition-colors rounded-lg md:rounded-full text-left">
                    <section.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                </ViewDetailsAppointmentDialog>
              );
            }
            if (
              label === t("consultationInfo.lastConsultation") &&
              mostRecentHistoryId
            ) {
              return (
                <MedicalPrescriptionDialog
                  appointmentId={props.appointmentId}
                  historyId={mostRecentHistoryId}
                  key={index}
                >
                  <button className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground hover:text-foreground hover:bg-bg-btn-secondary w-full p-2 transition-colors rounded-lg md:rounded-full text-left">
                    <section.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                </MedicalPrescriptionDialog>
              );
            }
            return (
              <button
                key={index}
                className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground hover:text-foreground hover:bg-bg-btn-secondary w-full p-2 transition-colors rounded-lg md:rounded-full text-left"
              >
                <section.icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-secondary flex-shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
