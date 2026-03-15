import { useParams } from "react-router-dom";

import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { ConfirmationScreen } from "../components/ConfirmationScreen";
import { useTeleconsult } from "@/lib/hooks/useTeleconsult";
import { useCitaDetails } from "@/lib/hooks/useCitaDetails";
import { useAppStore } from "@/stores/useAppStore";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

function TeleconsultConfirmPage() {
  const { appointmentId } = useParams();
  const { joinCall, isJoining } = useTeleconsult();
  const { appointment, loading } = useCitaDetails(appointmentId);
  const userRole = useAppStore((state) => state.user?.rol);

  const handleJoinCall = () => {
    if (appointmentId) {
      joinCall(appointmentId);
    }
  };

  if (loading) {
    return (
      <MCDashboardContent mainClassName="flex justify-center items-center min-h-[50vh]" noBg>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </MCDashboardContent>
    );
  }

  const isPatient = userRole === "PATIENT";
  const avatar = isPatient
    ? appointment?.doctor?.usuario?.fotoPerfil
    : appointment?.paciente?.usuario?.fotoPerfil;

  const name = isPatient
    ? `${appointment?.doctor?.nombre} ${appointment?.doctor?.apellido}`
    : `${appointment?.paciente?.nombre} ${appointment?.paciente?.apellido}`;

  const specialty = isPatient
    ? appointment?.servicio?.especialidad?.nombre
    : "";

  return (
    <MCDashboardContent
      mainClassName="flex justify-center items-center max-h-[50vh]"
      noBg
    >
      <ConfirmationScreen
        onJoinCall={handleJoinCall}
        isLoading={isJoining}
        appointment={
          appointment
            ? {
              doctorAvatar: avatar || undefined,
              doctorName: name || "Video Consulta",
              doctorSpecialty: specialty || "",
              date: appointment.fechaInicio ? format(new Date(appointment.fechaInicio), "d 'de' MMMM, yyyy", { locale: es }) : "",
              time: `${appointment.horaInicio} - ${appointment.horaFin}`,
              service: appointment.servicio?.nombre ?? "",
            }
            : undefined
        }
      />
    </MCDashboardContent>
  );
}

export default TeleconsultConfirmPage;
