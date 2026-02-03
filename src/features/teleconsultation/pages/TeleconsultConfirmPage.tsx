import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ROUTES } from "@/router/routes";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { ConfirmationScreen } from "../components/ConfirmationScreen";
import { teleconsultAppointment } from "@/data/teleconsult"; // <-- importa la data

function TeleconsultConfirmPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();

  const handleJoinCall = () => {
    if (appointmentId) {
      navigate(
        ROUTES.TELECONSULT.ROOM.replace(":appointmentId", appointmentId),
      );
    }
  };

  // Busca la cita por ID si hay appointmentId en la URL, si no usa la mock principal
  const appointment =
    teleconsultAppointment?.id === appointmentId
      ? teleconsultAppointment
      : undefined;

  return (
    <MCDashboardContent
      mainClassName="flex justify-center items-center max-h-[50vh]"
      noBg
    >
      <ConfirmationScreen
        onJoinCall={handleJoinCall}
        appointment={
          appointment
            ? {
                doctorAvatar: appointment.doctorAvatar,
                doctorName: appointment.doctorName,
                doctorSpecialty: appointment.doctorSpecialty,
                date: appointment.date,
                time: appointment.time,
                service: appointment.Service ?? "",
              }
            : undefined
        }
      />
    </MCDashboardContent>
  );
}

export default TeleconsultConfirmPage;
