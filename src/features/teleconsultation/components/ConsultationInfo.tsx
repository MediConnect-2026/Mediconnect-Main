import {
  Calendar,
  Clock,
  Stethoscope,
  MapPin,
  History,
  FileText,
  User,
  File,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCUserAvatar } from "@/shared/navigation/userMenu/MCUserAvatar";
import ViewDetailsAppointmentDialog from "@/features/patient/components/appoiments/ViewDetailsAppointmentDialog";
import MedicalPrescriptionDialog from "@/features/patient/components/appoiments/MedicalPrescriptionDialog";
import { useAppStore } from "@/stores/useAppStore";
import { mockAppointments } from "@/data/appointments"; // Adjust path if needed
const consultationData = {
  doctor: {
    name: "Dr. Cristiano Ronaldo",
    specialty: "Especialista en Medicina Interna",
    avatar: "", // Puedes agregar una URL de imagen aquí
  },
  date: "15 de octubre, 2025",
  time: "10:00 AM - 10:45 AM",
  type: "Plan Nutricional",
  location: "Consultorio 305, sede Centro",
};

const additionalSections = [
  { icon: History, label: "Citas pasadas" },
  { icon: FileText, label: "Última Consulta" },
  { icon: User, label: "Detalle del Paciente" },
  { icon: File, label: "Detalles de la cita" },
];

interface ConsultationInfoProps {
  // Puedes agregar props si es necesario
  appointmentId: string;
}

export const ConsultationInfo = (props: ConsultationInfoProps) => {
  const userRole = useAppStore((state) => state.user?.role);

  // Find the appointment and get the last historyId
  const appointment = mockAppointments.find(
    (a) => a.id === props.appointmentId,
  );
  const mostRecentHistoryId =
    appointment?.history?.[appointment.history.length - 1]?.id;

  return (
    <div className="bg-background p-6 rounded-2xl border border-primary/15 shadow-sm">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            Información de la consulta
          </h3>

          <div className="flex items-center gap-4 mb-6 bg-background border border-none rounded-3xl">
            <div className="h-20 w-20 relative overflow-hidden rounded-full border border-primary/10 bg-muted flex items-center justify-center">
              {consultationData.doctor.avatar ? (
                <Avatar className="h-20 w-20 rounded-full overflow-hidden">
                  <AvatarImage
                    src={consultationData.doctor.avatar}
                    alt={consultationData.doctor.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {consultationData.doctor.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <MCUserAvatar
                  name={consultationData.doctor.name}
                  square={false}
                  size={80}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              )}
            </div>
            <div>
              <p className="font-medium">{consultationData.doctor.name}</p>
              <p className="text-sm text-muted-foreground">
                {consultationData.doctor.specialty}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-secondary" />
              <span>{consultationData.date}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-secondary" />
              <span>{consultationData.time}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Stethoscope className="w-4 h-4 text-secondary" />
              <span>{consultationData.type}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-secondary" />
              <span>{consultationData.location}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Secciones Adicionales</h3>
          <div className="space-y-2">
            {additionalSections.map((section, index) => {
              if (section.label === "Detalles de la cita") {
                return (
                  <ViewDetailsAppointmentDialog
                    appointmentId={props.appointmentId}
                    preview="details"
                    key={index}
                  >
                    <button className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground hover:bg-bg-btn-secondary w-fit p-2 transition-colors rounded-full text-left">
                      <section.icon className="w-4 h-4 text-secondary" />
                      <span>{section.label}</span>
                    </button>
                  </ViewDetailsAppointmentDialog>
                );
              }
              if (section.label === "Citas pasadas") {
                return (
                  <ViewDetailsAppointmentDialog
                    appointmentId={props.appointmentId}
                    preview="history"
                    key={index}
                  >
                    <button className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground hover:bg-bg-btn-secondary w-fit p-2 transition-colors rounded-full text-left">
                      <section.icon className="w-4 h-4 text-secondary" />
                      <span>{section.label}</span>
                    </button>
                  </ViewDetailsAppointmentDialog>
                );
              }
              if (
                section.label === "Detalle del Paciente" &&
                userRole === "PATIENT"
              ) {
                return null; // Hide for patients
              }
              if (section.label === "Última Consulta" && mostRecentHistoryId) {
                return (
                  <MedicalPrescriptionDialog
                    appointmentId={props.appointmentId}
                    historyId={mostRecentHistoryId}
                    key={index}
                  >
                    <button className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground hover:bg-bg-btn-secondary w-fit p-2 transition-colors rounded-full text-left">
                      <section.icon className="w-4 h-4 text-secondary" />
                      <span>{section.label}</span>
                    </button>
                  </MedicalPrescriptionDialog>
                );
              }
              return (
                <button
                  key={index}
                  className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground hover:bg-bg-btn-secondary w-fit p-2 transition-colors rounded-full text-left"
                >
                  <section.icon className="w-4 h-4 text-secondary" />
                  <span>{section.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
