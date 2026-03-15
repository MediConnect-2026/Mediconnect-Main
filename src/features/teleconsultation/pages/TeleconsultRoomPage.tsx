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

function TeleconsultRoomPage() {
  const { appointmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"video" | "chat" | "info">(
    "video",
  );
  const { endCall } = useTeleconsult();

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

  const handleEndCall = () => {
    if (appointmentId) {
      endCall(appointmentId); // POST /finalizar → destroy frame → navigate
    }
  };

  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  // Show a loading indicator while we wait for router state / redirect
  if (!callUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-btn-secondary">
        <div className="flex flex-col items-center gap-4 text-primary">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm font-medium">Conectando a la teleconsulta…</p>
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
                <span className="text-sm font-medium">Video</span>
              </button>
              <button
                onClick={() => setMobileView("chat")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${mobileView === "chat"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Chat</span>
              </button>
              <button
                onClick={() => setMobileView("info")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${mobileView === "info"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">Info</span>
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
                  <TeleconsultChatPanel appointmentId={appointmentId || ""} />
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
              <TeleconsultChatPanel appointmentId={appointmentId || ""} />
            </div>
          </div>
        )}
      </MCDashboardContent>
    </>
  );
}

export default TeleconsultRoomPage;
