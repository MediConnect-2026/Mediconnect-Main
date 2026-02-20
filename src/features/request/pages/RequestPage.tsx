import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { RequestTabs } from "../components/RequestTabs";

interface ConnectionRequest {
  id: string;
  name: string;
  subtitle: string;
  date: string;
  avatar: string;
}

// Mock data - replace with actual API calls
const mockDoctorReceivedRequests: ConnectionRequest[] = [
  {
    id: "d1",
    name: "Edith García",
    subtitle: "Cardiología",
    date: "Recibida hoy",
    avatar: "",
  },
  {
    id: "d2",
    name: "Carlos Mendoza",
    subtitle: "Neurología",
    date: "Recibida ayer",
    avatar: "",
  },
  {
    id: "d3",
    name: "María López",
    subtitle: "Pediatría",
    date: "Recibida hace 2 días",
    avatar: "",
  },
];

const mockDoctorSentRequests: ConnectionRequest[] = [
  {
    id: "d4",
    name: "Roberto Sánchez",
    subtitle: "Dermatología",
    date: "Enviada hoy",
    avatar: "",
  },
  {
    id: "d5",
    name: "Ana Chen",
    subtitle: "Oftalmología",
    date: "Enviada hace 3 días",
    avatar: "",
  },
];

const mockCenterReceivedRequests: ConnectionRequest[] = [
  {
    id: "c1",
    name: "Centro Médico Aurora",
    subtitle: "Medicina General · Ciudad de México",
    date: "Recibida hoy",
    avatar: "",
  },
  {
    id: "c2",
    name: "Clínica Salud Integral",
    subtitle: "Especialidades · Guadalajara",
    date: "Recibida ayer",
    avatar: "",
  },
];

const mockCenterSentRequests: ConnectionRequest[] = [
  {
    id: "c3",
    name: "Hospital Comunitario del Valle",
    subtitle: "Urgencias y Consulta · Monterrey",
    date: "Enviada hoy",
    avatar: "",
  },
  {
    id: "c4",
    name: "Centro de Salud Esperanza",
    subtitle: "Atención Primaria · Puebla",
    date: "Enviada hace 2 días",
    avatar: "",
  },
];

function RequestPage() {
  const { t } = useTranslation("common");
  const userRole = useAppStore((state) => state.user?.role);
  const isMobile = useIsMobile();

  // Mock data based on user role
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>(
    userRole === "DOCTOR"
      ? mockDoctorReceivedRequests
      : mockCenterReceivedRequests,
  );
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>(
    userRole === "DOCTOR" ? mockDoctorSentRequests : mockCenterSentRequests,
  );

  const handleConnect = (id: string) => {
    setReceivedRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleReject = (id: string) => {
    setReceivedRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleWithdraw = (id: string) => {
    setSentRequests((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <MCDashboardContent
      mainWidth={isMobile ? "w-full" : "max-w-2xl"}
      disabledBackButton={true}
    >
      <div
        className={`flex flex-col gap-6 items-center justify-center w-full mb-8 ${isMobile ? "px-4" : "px-0"}`}
      >
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`font-medium mb-2 text-center ${isMobile ? "text-3xl" : "text-5xl"}`}
          >
            {t("requests.title")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t("requests.description", {
              type:
                userRole === "DOCTOR"
                  ? t("requests.doctorConnections")
                  : t("requests.centerConnections"),
            })}
          </p>
        </div>

        <div className="w-full">
          <RequestTabs
            receivedRequests={receivedRequests}
            sentRequests={sentRequests}
            onConnect={handleConnect}
            onReject={handleReject}
            onWithdraw={handleWithdraw}
            setReceivedRequests={setReceivedRequests}
            setSentRequests={setSentRequests}
          />
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default RequestPage;
