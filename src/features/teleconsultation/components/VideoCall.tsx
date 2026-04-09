import { useEffect, useRef, useState } from "react";
import {
  MicOff,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
} from "lucide-react";
import DailyIframe, { type DailyCall } from "@daily-co/daily-js";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

import { useTranslation } from "react-i18next";
import { dailyCallFrameRef } from "@/lib/hooks/useTeleconsult";
import { useAppStore } from "@/stores/useAppStore";
import { getUserFullName } from "@/services/auth/auth.types";

interface VideoCallProps {
  callUrl: string;
  onEndCall: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const VideoCall = ({
  callUrl,
  onEndCall,
  onToggleFullscreen,
  isFullscreen = false,
}: VideoCallProps) => {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const user = useAppStore((s) => s.user);
  const displayName = getUserFullName(user) || "Usuario";
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const isMobile = useIsMobile();

  // Tema MediConnect para Daily Prebuilt (colores y estilo de la app)
  const mediConnectTheme = {
    light: {
      colors: {
        accent: "#0b2c12",
        accentText: "#ffffff",
        background: "#fbfbfb",
        backgroundAccent: "#f7f7f7",
        baseText: "#0b2c12",
        border: "#eff2d7",
        mainAreaBg: "#0b2c12",
        mainAreaBgAccent: "#1a3d20",
        mainAreaText: "#ffffff",
        supportiveText: "#0b2c12",
      },
    },
    dark: {
      colors: {
        accent: "#8bb1ca",
        accentText: "#000000",
        background: "#0a0a0a",
        backgroundAccent: "#1e1e1e",
        baseText: "#ffffff",
        border: "#1e1e1e",
        mainAreaBg: "#0a0a0a",
        mainAreaBgAccent: "#1e1e1e",
        mainAreaText: "#ffffff",
        supportiveText: "#9ca3af",
      },
    },
  };

  // ─── Initialize Daily iframe ─────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !callUrl) return;

    let cancelled = false;

    if (dailyCallFrameRef.current) {
      dailyCallFrameRef.current.destroy();
      dailyCallFrameRef.current = null;
    }

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      const frame: DailyCall = DailyIframe.createFrame(container, {
        theme: mediConnectTheme,
        iframeStyle: {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: "12px",
        },
        showLeaveButton: false,
        showFullscreenButton: false,
        showLocalVideo: true,
      });

      frame.join({ url: callUrl, userName: displayName });
      dailyCallFrameRef.current = frame;
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (dailyCallFrameRef.current) {
        dailyCallFrameRef.current.destroy();
        dailyCallFrameRef.current = null;
      }
    };
  }, [callUrl, displayName]);

  // ─── Controls ─────────────────────────────────────────────────────────────
  const handleToggleMute = () => {
    if (!dailyCallFrameRef.current) return;
    dailyCallFrameRef.current.setLocalAudio(isMuted); // toggle: if muted → enable audio
    setIsMuted((prev) => !prev);
  };

  const handleToggleVideo = () => {
    if (!dailyCallFrameRef.current) return;
    dailyCallFrameRef.current.setLocalVideo(isVideoOff); // toggle
    setIsVideoOff((prev) => !prev);
  };

  const handleEndCall = () => {
    onEndCall();
  };

  return (
    <div
      className={`relative flex-1 ${isFullscreen
          ? "w-full h-screen"
          : "w-full h-full min-h-[500px] rounded-2xl overflow-hidden"
        } bg-primary shadow-lg border border-border`}
    >
      {/* Daily iframe container — sin overlay de carga para no tapar la UI de Daily */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden" />

      {/* Fullscreen toggle */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="absolute top-4 right-4 p-3 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground transition-colors backdrop-blur-sm border border-primary-foreground/20 z-20"
          title={
            isFullscreen
              ? t("videoCall.exitFullscreen")
              : t("videoCall.fullscreen")
          }
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5" />
          ) : (
            <Maximize2 className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Video controls — estilo MediConnect (primary, bordes redondeados) */}
      <div
        className={`absolute ${isFullscreen ? "bottom-8" : isMobile ? "bottom-4" : "bottom-6"
          } left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20`}
      >
        {/* Mute */}
        <button
          onClick={handleToggleMute}
          className={`${isMobile ? "p-3" : "p-4"
            } rounded-full transition-all backdrop-blur-sm border ${isMuted
              ? "bg-destructive hover:bg-destructive/90 text-white border-destructive/50"
              : "bg-primary/90 hover:bg-primary text-primary-foreground border-primary-foreground/20"
            }`}
          title={isMuted ? t("videoCall.unmute") : t("videoCall.mute")}
        >
          <MicOff className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
        </button>

        {/* Camera */}
        <button
          onClick={handleToggleVideo}
          className={`${isMobile ? "p-3" : "p-4"
            } rounded-full transition-all backdrop-blur-sm border ${isVideoOff
              ? "bg-destructive hover:bg-destructive/90 text-white border-destructive/50"
              : "bg-primary/90 hover:bg-primary text-primary-foreground border-primary-foreground/20"
            }`}
          title={
            isVideoOff ? t("videoCall.cameraOn") : t("videoCall.cameraOff")
          }
        >
          <VideoOff className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
        </button>

        {/* Hang up */}
        <button
          onClick={handleEndCall}
          className={`${isMobile ? "p-3" : "p-4"
            } rounded-full bg-destructive hover:bg-destructive/90 text-white transition-all shadow-lg border border-destructive/50`}
          title={t("videoCall.endCall")}
        >
          <PhoneOff className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
        </button>
      </div>

    </div>
  );
};
