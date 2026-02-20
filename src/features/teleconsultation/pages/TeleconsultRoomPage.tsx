import { useState } from "react";
import { useParams } from "react-router-dom";

import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { VideoCall } from "../components/VideoCall";

import { ConsultationInfo } from "../components/ConsultationInfo";
import { ChatPanel } from "../components/chatPanel/ChatPanel";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { MessageSquare, Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
useAppStore;
function TeleconsultRoomPage() {
  const { appointmentId } = useParams();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  const [mobileView, setMobileView] = useState<"video" | "chat" | "info">(
    "video",
  );

  const isuserDoctor = useAppStore((state) => state.user?.role);
  const { t } = useTranslation("common");
  const handleEndCall = () => {
    alert("La llamada ha terminado.");
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <VideoCall
            onEndCall={handleEndCall}
            onToggleFullscreen={toggleFullscreen}
            isFullscreen={true}
          />
        </div>
      )}

      {/* Normal Layout */}
      <MCDashboardContent mainWidth="w-[100%]" noBg>
        {isMobile ? (
          // MOBILE LAYOUT
          <div className="flex flex-col h-[calc(100vh-theme(spacing.16))]">
            {/* Mobile Tab Navigation */}
            <div className="flex gap-2 p-2 bg-background border-b border-primary/10 rounded-2xl mb-2">
              <button
                onClick={() => setMobileView("video")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                  mobileView === "video"
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
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                  mobileView === "chat"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm font-medium">Chat</span>
              </button>
              <button
                onClick={() => setMobileView("info")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-colors ${
                  mobileView === "info"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                <Info className="w-4 h-4" />
                <span className="text-sm font-medium">Info</span>
              </button>
            </div>

            {/* Mobile Content Area */}
            <div className="flex-1 overflow-hidden">
              {mobileView === "video" && (
                <div className="h-full">
                  <VideoCall
                    onEndCall={handleEndCall}
                    onToggleFullscreen={toggleFullscreen}
                    isFullscreen={false}
                  />
                </div>
              )}
              {mobileView === "chat" && (
                <div className="h-full">
                  <ChatPanel />
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
          <div className="flex gap-4 h-[calc(100vh-theme(spacing.20))] ">
            {/* Columna izquierda: Video arriba, Info abajo */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {/* Video - ocupa más espacio */}
              <div className="flex-[2] min-h-0">
                <VideoCall
                  onEndCall={handleEndCall}
                  onToggleFullscreen={toggleFullscreen}
                  isFullscreen={false}
                />
              </div>
              <ConsultationInfo appointmentId={appointmentId || ""} />
            </div>

            {/* Columna derecha: ChatPanel ocupa todo el alto */}
            <div className="w-[400px] flex-shrink-0 h-full">
              <ChatPanel />
            </div>
          </div>
        )}
      </MCDashboardContent>
    </>
  );
}

export default TeleconsultRoomPage;
