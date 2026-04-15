import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";

import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { VideoCall } from "../components/VideoCall";
import { ConsultationInfo } from "../components/ConsultationInfo";
import { TeleconsultChatPanel } from "../components/TeleconsultChatPanel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MessageSquare, Info, Loader2 } from "lucide-react";
import { useTeleconsult } from "@/lib/hooks/useTeleconsult";
import { useTeleconsultStore } from "@/stores/useTeleconsultStore";
import { ROUTES } from "@/router/routes";
import { ErrorBoundary } from "@/shared/components/ErrorBoundary";
import { RatingModal } from "../components/RatingModal";
import { socketService } from "@/services/websocket/socket.service";
import resenasService from "@/services/api/resenas.service";
import { useCitaDetails } from "@/lib/hooks/useCitaDetails";
import { useAppStore } from "@/stores/useAppStore";
import { getUserAppRole } from "@/services/auth/auth.types";
import type { NotificacionEvent } from "@/types/WebSocketTypes";
import { useTranslation } from "react-i18next";

const DIAGNOSIS_NOTIFICATION_ENTITY_TYPES = new Set([
  "historial_clinico",
  "historial",
  "medical_history",
  "clinical_history",
]);

const normalizeText = (value?: string): string =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const isDiagnosisNotification = (event: NotificacionEvent): boolean => {
  const entityType = normalizeText(event.tipoEntidad);
  if (DIAGNOSIS_NOTIFICATION_ENTITY_TYPES.has(entityType)) return true;

  const title = normalizeText(event.titulo);
  const message = normalizeText(event.mensaje);
  return title.includes("diagnostic") || message.includes("diagnostic");
};

function TeleconsultRoomPage() {
  const { t } = useTranslation("common");
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"video" | "chat" | "info">(
    "video",
  );
  const { endCall } = useTeleconsult();

  // Ratings
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  
  const user = useAppStore((state) => state.user);
  const userRole = user ? getUserAppRole(user) : "PATIENT";
  const isPatient = userRole === "PATIENT";
  
  const { appointment } = useCitaDetails(appointmentId || "");

  // URL provided by the confirm page:
  // 1. First try router state (immediate navigation case)
  // 2. Fallback to Zustand store (reliable, survives re-renders)
  const locationUrl: string | undefined = location.state?.urlAcceso;
  const storeUrl = useTeleconsultStore((s) => s.callUrl);
  const callUrl: string | undefined = locationUrl || storeUrl || undefined;

  // If there's no URL (e.g. user navigated here directly), redirect to dashboard.
  // We use useEffect so we don't navigate during the first render before router state settles.
  useEffect(() => {
    if (!callUrl) {
      navigate(ROUTES.COMMON.DASHBOARD, { replace: true });
    }
  }, [callUrl, navigate]);

  // Setup listener for remote call end
  useEffect(() => {
    const unsub = socketService.onCallEnded((data) => {
      if (appointmentId && String(data.citaId) === String(appointmentId)) {
        if (isPatient) {
          setShowRatingModal(true);
        } else {
          endCall(appointmentId);
        }
      }
    });
    return unsub;
  }, [appointmentId, isPatient, endCall]);

  // Show rating modal to patients when a diagnosis notification arrives.
  useEffect(() => {
    if (!isPatient || !appointmentId) return;

    const unsub = socketService.onNewNotification((event) => {
      if (!isDiagnosisNotification(event)) return;

      // If backend includes cita id as entidadId, enforce match; otherwise allow
      // diagnosis notifications while the patient is in this active teleconsult.
      if (
        typeof event.entidadId === "number" &&
        String(event.entidadId) !== String(appointmentId)
      ) {
        return;
      }

      setShowRatingModal(true);
    });

    return unsub;
  }, [isPatient, appointmentId]);

  const handleEndCall = () => {
    if (appointmentId) {
      if (isPatient) {
        setShowRatingModal(true);
      } else {
        endCall(appointmentId);
      }
    }
  };

  const handleCloseRating = () => {
    setShowRatingModal(false);
    if (appointmentId) {
      endCall(appointmentId);
    }
  };

  const handleSubmitRating = async (rating: number, comment: string) => {
    if (!appointmentId || !appointment?.servicio?.id) {
      handleCloseRating();
      return;
    }
    
    setIsSubmittingRating(true);
    try {
      await resenasService.crearResena({
        servicioId: appointment.servicio.id,
        citaId: Number(appointmentId),
        calificacion: rating,
        comentario: comment,
      });
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmittingRating(false);
      handleCloseRating();
    }
  };

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  // Show a loading indicator while we wait for router state / redirect
  if (!callUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-btn-secondary">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm font-medium">{t("teleconsultRoom.connecting")}</p>
        </div>
      </div>
    );
  }

  // Un solo VideoCall montado: el contenedor cambia de tamaño/posición con fullscreen
  // para no desmontar y evitar salir de la llamada al alternar pantalla completa.
  const videoCallWrapperClass = isFullscreen
    ? "fixed inset-0 z-[9999] bg-primary"
    : isMobile
      ? "flex-1 w-full min-h-[400px] flex flex-col relative rounded-xl overflow-hidden"
      : "flex-[2] min-h-[400px] flex flex-col relative rounded-xl overflow-hidden";

  return (
    <>
      <MCDashboardContent mainWidth="w-[100%]" noBg>
        {isMobile ? (
          // MOBILE LAYOUT
          <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
            <div className="flex gap-2 p-2 bg-background border-b border-primary/10 rounded-2xl mb-2">
              <button
                onClick={() => setMobileView("video")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${mobileView === "video"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-sm font-medium">{t("teleconsultRoom.tabs.video")}</span>
              </button>
              <button
                onClick={() => setMobileView("chat")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${mobileView === "chat"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">{t("teleconsultRoom.tabs.chat")}</span>
              </button>
              <button
                onClick={() => setMobileView("info")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${mobileView === "info"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">{t("teleconsultRoom.tabs.info")}</span>
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              {mobileView === "video" && (
                <div className={videoCallWrapperClass}>
                  <ErrorBoundary>
                    <VideoCall
                      callUrl={callUrl}
                      onEndCall={handleEndCall}
                      onToggleFullscreen={toggleFullscreen}
                      isFullscreen={isFullscreen}
                    />
                  </ErrorBoundary>
                </div>
              )}
              {mobileView === "chat" && (
                <div className="h-full">
                  <TeleconsultChatPanel appointmentId={appointmentId || ""} onEndCall={handleEndCall} />
                </div>
              )}
              {mobileView === "info" && (
                <div className="h-full overflow-y-auto p-4">
                  <ConsultationInfo appointmentId={appointmentId || ""} />
                </div>
              )}
            </div>
          </div>
        ) : (
          // DESKTOP LAYOUT
          <div className="flex gap-4 h-[calc(100vh-theme(spacing.20))] min-h-[600px]">
            <div className="flex-1 flex flex-col gap-4 min-w-[300px]">
              <div className={videoCallWrapperClass}>
                <ErrorBoundary>
                  <VideoCall
                    callUrl={callUrl}
                    onEndCall={handleEndCall}
                    onToggleFullscreen={toggleFullscreen}
                    isFullscreen={isFullscreen}
                  />
                </ErrorBoundary>
              </div>
              <ConsultationInfo appointmentId={appointmentId || ""} />
            </div>

            <div className="w-[400px] flex-shrink-0 h-full">
              <TeleconsultChatPanel appointmentId={appointmentId || ""} onEndCall={handleEndCall} />
            </div>
          </div>
        )}
      </MCDashboardContent>

      <RatingModal
        isOpen={showRatingModal}
        onClose={handleCloseRating}
        onSubmit={handleSubmitRating}
        isLoading={isSubmittingRating}
        doctorName={appointment?.doctor?.nombre ? `${appointment.doctor.nombre} ${appointment.doctor.apellido || ""}`.trim() : t("teleconsultRoom.fallbackDoctor")}
        doctorAvatar={appointment?.doctor?.usuario?.fotoPerfil || undefined}
        specialty={appointment?.servicio?.especialidad?.nombre || t("teleconsultRoom.fallbackSpecialty")}
      />
    </>
  );
}

export default TeleconsultRoomPage;
