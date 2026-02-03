import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { VideoCall } from "../components/VideoCall";
import { teleconsultAppointment } from "@/data/teleconsult";
import { ConsultationInfo } from "../components/ConsultationInfo";
import { ChatPanel } from "../components/chatPanel/ChatPanel";

function TeleconsultRoomPage() {
  const { appointmentId } = useParams();
  const [isFullscreen, setIsFullscreen] = useState(false);

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
        <div className="flex gap-4 h-[calc(100vh-theme(spacing.20))]">
          {/* Columna izquierda: Video arriba, Info abajo */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {/* Video - ocupa más espacio */}
            <div className="flex-[2] min-h-0 ">
              <VideoCall
                onEndCall={handleEndCall}
                onToggleFullscreen={toggleFullscreen}
                isFullscreen={false}
              />
            </div>

            <ConsultationInfo appointmentId={appointmentId || ""} />
          </div>

          {/* Columna derecha: ChatPanel ocupa todo el alto */}
          <div className="w-[450px] h-full">
            <ChatPanel />
          </div>
        </div>
      </MCDashboardContent>
    </>
  );
}

export default TeleconsultRoomPage;
