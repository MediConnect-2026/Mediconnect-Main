import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "@/router/routes";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { VideoCall } from "../components/VideoCall";
import { teleconsultAppointment } from "@/data/teleconsult";
import { ConsultationInfo } from "../components/ConsultationInfo";
import { ChatPanel } from "../components/ChatPanel";

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
      <MCDashboardContent mainWidth="100%" isTele noBg>
        <div className="flex gap-6 ">
          {/* Columna izquierda: Video arriba, Info abajo */}
          <div className="flex-1 flex flex-col gap-6 min-w-0">
            {/* Video - ocupa más espacio */}
            <div className="min-h-0 max-h-100">
              <VideoCall
                onEndCall={handleEndCall}
                onToggleFullscreen={toggleFullscreen}
                isFullscreen={false}
              />
            </div>

            {/* Info - ocupa menos espacio */}

            <ConsultationInfo />
          </div>

          {/* Columna derecha: ChatPanel ocupa todo el alto */}
          <div className="w-[400px] flex-shrink-0">
            <ChatPanel />
          </div>
        </div>
      </MCDashboardContent>
    </>
  );
}

export default TeleconsultRoomPage;
