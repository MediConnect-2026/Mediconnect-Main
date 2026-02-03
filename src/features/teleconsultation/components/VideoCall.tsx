import {
  MicOff,
  VideoOff,
  PhoneOff,
  MessageSquare,
  Share2,
  Maximize2,
} from "lucide-react";
import { useState } from "react";
import videoCallIllustration from "@/assets/video-call-illustration.jpg";
import doctorAvatar from "@/assets/doctor-avatar.jpg";

interface VideoCallProps {
  onEndCall: () => void;
  onToggleFullscreen?: () => void;
}

export const VideoCall = ({
  onEndCall,
  onToggleFullscreen,
}: VideoCallProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  return (
    <div className="video-container aspect-video relative">
      {/* Main video feed */}
      <img
        src={videoCallIllustration}
        alt="Video call"
        className="w-full h-full object-cover"
      />

      {/* Fullscreen button */}
      <button
        onClick={onToggleFullscreen}
        className="absolute top-4 right-4 p-2 rounded-lg bg-black/20 hover:bg-black/40 transition-colors"
      >
        <Maximize2 className="w-5 h-5 text-white" />
      </button>

      {/* Self video preview */}
      <div className="self-video">
        <img
          src={doctorAvatar}
          alt="You"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Video controls */}
      <div className="video-controls">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`control-btn ${isMuted ? "bg-destructive text-destructive-foreground" : "control-btn-default"}`}
        >
          <MicOff className="w-5 h-5" />
        </button>

        <button
          onClick={() => setIsVideoOff(!isVideoOff)}
          className={`control-btn ${isVideoOff ? "bg-destructive text-destructive-foreground" : "control-btn-default"}`}
        >
          <VideoOff className="w-5 h-5" />
        </button>

        <button onClick={onEndCall} className="control-btn control-btn-end">
          <PhoneOff className="w-5 h-5" />
        </button>

        <button className="control-btn control-btn-default">
          <MessageSquare className="w-5 h-5" />
        </button>

        <button className="control-btn control-btn-default">
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
