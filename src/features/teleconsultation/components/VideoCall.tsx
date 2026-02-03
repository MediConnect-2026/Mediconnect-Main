import {
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Share2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useState } from "react";

interface VideoCallProps {
  onEndCall: () => void;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export const VideoCall = ({
  onEndCall,
  onToggleFullscreen,
  isFullscreen = false,
}: VideoCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div
      className={`relative ${isFullscreen ? "w-full h-full" : "w-full h-full rounded-xl overflow-hidden"} bg-black`}
    >
      {/* Main video feed */}
      <img
        src="https://i.pinimg.com/736x/ac/f0/e6/acf0e65f81199aa4ed1b9def35a3506e.jpg"
        alt="Video call"
        className="w-full h-full object-cover"
      />

      {/* Fullscreen button */}
      {onToggleFullscreen && (
        <button
          onClick={onToggleFullscreen}
          className="absolute top-4 right-4 p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors backdrop-blur-sm border border-white/10 z-10"
          title={
            isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"
          }
        >
          {isFullscreen ? (
            <Minimize2 className="w-5 h-5 text-white" />
          ) : (
            <Maximize2 className="w-5 h-5 text-white" />
          )}
        </button>
      )}

      {/* Self video preview */}
      <div
        className={`absolute ${isFullscreen ? "bottom-24 right-8 w-48 h-48" : "bottom-20 right-6 w-32 h-32"} rounded-lg overflow-hidden shadow-2xl border border-white/20 transition-all duration-300`}
      >
        <img
          src="https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg"
          alt="You"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Video controls */}
      <div
        className={`absolute ${isFullscreen ? "bottom-8" : "bottom-6"} left-1/2 -translate-x-1/2 flex gap-3`}
      >
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all backdrop-blur-sm border ${
            isMuted
              ? "bg-red-500 hover:bg-red-600 border-red-400/30"
              : "bg-black/40 hover:bg-black/60 border-white/10"
          }`}
          title={isMuted ? "Activar micrófono" : "Silenciar"}
        >
          <MicOff className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`p-4 rounded-full transition-all backdrop-blur-sm border ${
            isVideoOff
              ? "bg-red-500 hover:bg-red-600 border-red-400/30"
              : "bg-black/40 hover:bg-black/60 border-white/10"
          }`}
          title={isVideoOff ? "Activar cámara" : "Apagar cámara"}
        >
          <VideoOff className="w-5 h-5 text-white" />
        </button>

        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all shadow-lg border border-red-500/30"
          title="Finalizar llamada"
        >
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};
