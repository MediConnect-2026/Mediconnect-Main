import { useParams } from "react-router-dom";

import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { ConfirmationScreen } from "../components/ConfirmationScreen";
import { useTeleconsult } from "@/lib/hooks/useTeleconsult";
import { useCitaDetails } from "@/lib/hooks/useCitaDetails";
import { useAppStore } from "@/stores/useAppStore";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { formatTimeTo12h } from "@/utils/appointmentMapper";

const parseApiDateToLocalNoon = (dateValue?: string): Date | null => {
  if (!dateValue) return null;

  const datePart = dateValue.includes("T") ? dateValue.split("T")[0] : dateValue;
  const parts = datePart.split("-");
  if (parts.length !== 3) return null;

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day) return null;

  // Use local noon to avoid timezone shifts that move the date to the previous day.
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

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

  const appointmentDate = parseApiDateToLocalNoon(appointment?.fechaInicio);

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
              date: appointmentDate
                ? format(appointmentDate, "d 'de' MMMM, yyyy", { locale: es })
                : "",
              time: `${formatTimeTo12h(appointment.horaInicio)} - ${formatTimeTo12h(appointment.horaFin)}`,
              service: appointment.servicio?.nombre ?? "",
            }
            : undefined
        }
      />
    </MCDashboardContent>
  );
}

export default TeleconsultConfirmPage;
