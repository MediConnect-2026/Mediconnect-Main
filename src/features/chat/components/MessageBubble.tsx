import type { MessageWithSender } from "@/types/ChatTypes";
import { MessageType, MessageStatus } from "@/types/ChatTypes";
import { cn, formatFileSize } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChatAvatar } from "./ChatAvatar";
import {
  Download,
  Check,
  CheckCheck,
  Trash,
  Copy,
  ChevronDown,
  Play,
  Pause,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import chatService from "@/services/chat/chat.service";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { mediaService } from "@/services/chat/media.service";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { ImageCarouselModal } from "@/features/doctor/components/healthService/ImageCarouselModal";

interface MessageBubbleProps {
  message: MessageWithSender;
  onViewFile?: (msg: MessageWithSender) => void;
  onDownloadFile?: (url: string, name: string) => void;
  getFileIcon?: (type: string) => string;
  allImageMediaIds?: number[];
  currentImageIndex?: number;
  onDeleteModalChange?: (isOpen: boolean) => void;
  onImageModalChange?: (isOpen: boolean) => void;
}

export function MessageBubble({
  message,
  onViewFile,
  onDownloadFile,
  getFileIcon,
  allImageMediaIds = [],
  currentImageIndex = -1,
  onDeleteModalChange,
  onImageModalChange,
}: MessageBubbleProps) {
  const { t } = useTranslation("common");

  const currentUserId = useAppStore((state) => state.user?.id);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [allImageUrls, setAllImageUrls] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const isOwnMessage =
    message.esPropio !== undefined
      ? message.esPropio
      : message.remitenteId === currentUserId;

  const isOptimistic = message.id < 0;

  const remitente = message.remitente || {
    id: message.remitenteId,
    nombre: "Usuario",
    apellido: "",
    fotoPerfil: "",
  };

  const removeMessage = useAppStore((state) => state.removeMessage);
  const setToast = useGlobalUIStore((state) => state.setToast);

  useEffect(() => {
    onImageModalChange?.(isImageModalOpen);
  }, [isImageModalOpen, onImageModalChange]);

  useEffect(() => {
    onDeleteModalChange?.(isDeleteModalOpen);
  }, [isDeleteModalOpen, onDeleteModalChange]);

  useEffect(() => {
    if (message.mediaId) {
      mediaService
        .getMediaUrl(message.mediaId)
        .then(setMediaUrl)
        .catch((error) => console.error("Error obteniendo URL:", error));
    } else {
      setMediaUrl(null);
    }
  }, [message.mediaId]);

  useEffect(() => {
    if (isImageModalOpen && allImageMediaIds.length > 0) {
      Promise.all(
        allImageMediaIds.map((mediaId) =>
          mediaService.getMediaUrl(mediaId).catch((error) => {
            console.error(`Error obteniendo URL para ${mediaId}:`, error);
            return null;
          }),
        ),
      ).then((urls) => {
        setAllImageUrls(urls.filter((url): url is string => url !== null));
      });
    }
  }, [isImageModalOpen, allImageMediaIds]);

  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 500, damping: 30 },
    },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const messageTime = (() => {
    try {
      const date = new Date(message.enviadoEn);
      if (isNaN(date.getTime())) return "--:--";

      return isToday(date)
        ? format(date, "HH:mm", { locale: es })
        : format(date, "dd/MM/yyyy", { locale: es });
    } catch {
      return "--:--";
    }
  })();

  const handleCopy = () => {
    if (message.contenido) {
      navigator.clipboard.writeText(message.contenido);
      setToast?.({
        type: "success",
        message: t("messageBubble.copied") || "Copiado",
        open: true,
      });
    }
    setIsPopoverOpen(false);
  };

  const handleDownload = () => {
    if (mediaUrl) {
      const fileName =
        message.tipo === MessageType.IMAGEN
          ? `imagen_${message.id}.jpg`
          : message.media?.nombre || message.contenido || "archivo";
      onDownloadFile?.(mediaUrl, fileName);
    }
    setIsPopoverOpen(false);
  };

  const handleDeleteClick = () => {
    setIsPopoverOpen(false);
    setTimeout(() => setIsDeleteModalOpen(true), 100);
  };

  const menuItems: {
    icon: React.ReactNode;
    label: string;
    action: () => void;
    danger?: boolean;
    hoverClass?: string;
  }[] = [];

  if (message.contenido?.trim()) {
    menuItems.push({
      icon: <Copy size={14} />,
      label: t("messageBubble.copy") || "Copiar",
      action: handleCopy,
      hoverClass: "hover:bg-primary/10",
    });
  }

  if (
    message.tipo === MessageType.IMAGEN ||
    message.tipo === MessageType.ARCHIVO ||
    message.tipo === MessageType.AUDIO ||
    message.tipo === MessageType.VIDEO
  ) {
    menuItems.push({
      icon: <Download size={14} />,
      label: t("messageBubble.download") || "Descargar",
      action: handleDownload,
      hoverClass: "hover:bg-primary/10",
    });
  }

  if (isOwnMessage) {
    menuItems.push({
      icon: <Trash size={14} />,
      label: t("messageBubble.delete") || "Eliminar",
      action: handleDeleteClick,
      danger: true,
      hoverClass: "hover:bg-red-500/10",
    });
  }

  const showMenu = menuItems.length > 0;

  const canQuickCopy =
    message.tipo === MessageType.TEXTO && !!message.contenido;

  const canQuickDownload =
    !!mediaUrl &&
    (message.tipo === MessageType.IMAGEN ||
      message.tipo === MessageType.ARCHIVO ||
      message.tipo === MessageType.AUDIO ||
      message.tipo === MessageType.VIDEO);

  return (
    <motion.div
      key={message.id}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "flex items-start gap-2 md:gap-3 group/row",
        isOwnMessage ? "flex-row-reverse" : "",
      )}
    >
      <ChatAvatar
        name={remitente.nombre}
        avatar={remitente.fotoPerfil || undefined}
        size="sm"
      />

      {/* Bubble + arrow wrapper */}
      <div
        className={cn(
          "relative flex items-start gap-0.5",
          isOwnMessage ? "flex-row-reverse" : "flex-row",
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-3xl px-3 md:px-4 py-2 overflow-hidden",
            message.tipo === MessageType.AUDIO
              ? "max-w-[92vw] md:max-w-[520px]"
              : "max-w-[85%] md:max-w-[75%]",
            message.tipo === MessageType.TEXTO ? "w-fit" : "",
            isOwnMessage
              ? "bg-primary text-background rounded-br-xl"
              : "bg-gray-200/55 border-primary dark:bg-bg-btn-secondary text-primary rounded-bl-xl",
          )}
        >
          {/* Texto */}
          {message.tipo === MessageType.TEXTO && message.contenido && (
            <p className="text-xs md:text-sm break-words">
              {message.contenido}
            </p>
          )}

          {/* Imagen */}
          {message.tipo === MessageType.IMAGEN && (
            <div className="min-w-[150px] md:min-w-[200px] max-w-[250px] md:max-w-[280px]">
              {isOptimistic && !mediaUrl ? (
                <div className="rounded-lg w-full h-[180px] md:h-[200px] bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Enviando...</p>
                  </div>
                </div>
              ) : (
                mediaUrl && (
                  <img
                    src={mediaUrl}
                    alt={t("messageBubble.imageAlt") || "Imagen"}
                    className="rounded-lg w-full h-auto max-h-[180px] md:max-h-[200px] cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsImageModalOpen(true)}
                    style={{ objectFit: "cover" }}
                  />
                )
              )}
              {message.contenido && (
                <p className="text-xs md:text-sm break-words mt-2">
                  {message.contenido}
                </p>
              )}
            </div>
          )}

          {/* Archivo */}
          {message.tipo === MessageType.ARCHIVO && (
            <div className="min-w-[180px] md:min-w-[200px]">
              {isOptimistic && !mediaUrl ? (
                <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-background/30 rounded-lg">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium truncate">
                      {message.media?.nombre || message.contenido || "archivo"}
                    </p>
                    <p className="text-xs text-muted-foreground">Enviando...</p>
                  </div>
                </div>
              ) : (
                mediaUrl && (
                  <div
                    className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-background/30 rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
                    onClick={() => onViewFile?.(message)}
                  >
                    <div className="text-2xl md:text-3xl flex-shrink-0">
                      {getFileIcon?.(
                        message.media?.tipoMime || message.contenido || "other",
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-medium truncate">
                        {message.media?.nombre ||
                          message.contenido ||
                          "archivo"}
                      </p>
                      {message.media?.tamanioBytes && (
                        <p className="text-xs opacity-70">
                          {formatFileSize(message.media.tamanioBytes)}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}
              {message.contenido && (
                <p className="text-xs md:text-sm break-words mt-2">
                  {message.contenido}
                </p>
              )}
            </div>
          )}

          {/* Audio */}
          {message.tipo === MessageType.AUDIO && (
            <div className="w-auto">
              {isOptimistic && !mediaUrl ? (
                <div className="flex items-center gap-2 md:gap-3 p-2 bg-background/20 rounded-xl">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                  <p className="text-xs font-medium">Enviando audio...</p>
                </div>
              ) : (
                mediaUrl && (
                  <CustomAudioPlayer
                    src={mediaUrl}
                    isOwnMessage={isOwnMessage}
                  />
                )
              )}

              {message.contenido && (
                <p className="text-xs md:text-sm break-words mt-1 px-1">
                  {message.contenido}
                </p>
              )}
            </div>
          )}

          {/* Video */}
          {message.tipo === MessageType.VIDEO && (
            <div className="min-w-[200px] md:min-w-[250px] max-w-[300px] md:max-w-[350px]">
              {isOptimistic && !mediaUrl ? (
                <div className="rounded-lg w-full h-[250px] md:h-[300px] bg-muted flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Enviando video...
                    </p>
                  </div>
                </div>
              ) : (
                mediaUrl && (
                  <video
                    controls
                    className="rounded-lg w-full h-auto max-h-[250px] md:max-h-[300px]"
                    style={{ objectFit: "cover" }}
                  >
                    <source src={mediaUrl} type="video/mp4" />
                    <source src={mediaUrl} type="video/webm" />
                    {t("messageBubble.videoNotSupported") ||
                      "Tu navegador no soporta video."}
                  </video>
                )
              )}
              {message.contenido && (
                <p className="text-xs md:text-sm break-words mt-2">
                  {message.contenido}
                </p>
              )}
            </div>
          )}

          {/* Time + status */}
          <div
            className={cn(
              "mt-2 min-h-6",
              "flex items-center justify-end gap-1 text-xs opacity-70 leading-none",
            )}
          >
            {(canQuickCopy || canQuickDownload) && (
              <div className="flex items-center gap-1">
                {canQuickCopy && (
                  <button
                    onClick={handleCopy}
                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    title={t("messageBubble.copy") || "Copiar"}
                    aria-label={t("messageBubble.copy") || "Copiar"}
                  >
                    <Copy className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                )}

                {canQuickDownload && (
                  <button
                    onClick={handleDownload}
                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    title={t("messageBubble.download") || "Descargar"}
                    aria-label={t("messageBubble.download") || "Descargar"}
                  >
                    <Download className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  </button>
                )}
              </div>
            )}

            <span>{messageTime}</span>

            {isOwnMessage && (
              <span className="inline-flex items-center">
                {message.estado === MessageStatus.ENVIADO && (
                  <Check className="inline w-3 h-3 md:w-4 md:h-4 text-background" />
                )}
                {message.estado === MessageStatus.ENTREGADO && (
                  <CheckCheck className="inline w-3 h-3 md:w-4 md:h-4 text-background" />
                )}
                {message.estado === MessageStatus.LEIDO && (
                  <CheckCheck className="inline w-3 h-3 md:w-4 md:h-4 text-background" />
                )}
              </span>
            )}
          </div>
        </div>

        {/* Popover trigger — arrow-down button */}
        {showMenu && (
          <div className="self-start mt-1.5 flex-shrink-0">
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full",
                    "bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20",
                    "transition-all duration-150",
                    isPopoverOpen
                      ? "opacity-100"
                      : "opacity-0 group-hover/row:opacity-100",
                  )}
                  aria-label="Opciones del mensaje"
                >
                  <ChevronDown size={12} className="text-foreground/70" />
                </button>
              </PopoverTrigger>

              <PopoverContent
                align={isOwnMessage ? "end" : "start"}
                side="bottom"
                sideOffset={6}
                className="w-36 p-1 rounded-xl bg-background border border-primary/5 dark:border-primary/10 backdrop-blur-sm"
              >
                {menuItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className={cn(
                      "flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-left",
                      "text-xs md:text-sm transition-colors duration-100",
                      item.danger ? "text-red-500" : "text-foreground",
                      item.hoverClass ?? "hover:bg-muted/60",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {isOwnMessage && (
        <MCModalBase
          id={`delete-modal-${message.id}`}
          trigger={<span className="hidden" />}
          variant="warning"
          size="smWide"
          title={t("messageBubble.confirmDeleteTitle") || "Eliminar mensaje"}
          description={
            t("messageBubble.confirmDelete") ||
            "¿Estás seguro de que quieres eliminar este mensaje?"
          }
          confirmText={t("messageBubble.delete") || "Eliminar"}
          secondaryText={t("messageBubble.cancel") || "Cancelar"}
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
            try {
              await chatService.deleteMessage(message.id);
              removeMessage(message.conversacionId, message.id);
              setToast?.({
                type: "success",
                message: t("messageBubble.deleted") || "Mensaje eliminado",
                open: true,
              });
            } catch (error) {
              console.error("Error eliminando mensaje:", error);
              setToast?.({
                type: "error",
                message:
                  t("messageBubble.deleteError") ||
                  "No se pudo eliminar el mensaje",
                open: true,
              });
            } finally {
              setIsDeleteModalOpen(false);
            }
          }}
        >
          <></>
        </MCModalBase>
      )}

      {/* Image carousel modal */}
      {message.tipo === MessageType.IMAGEN && mediaUrl && (
        <ImageCarouselModal
          images={allImageUrls.length > 0 ? allImageUrls : [mediaUrl]}
          open={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          startIndex={
            allImageUrls.length > 0 && currentImageIndex >= 0
              ? currentImageIndex
              : 0
          }
        />
      )}
    </motion.div>
  );
}

const CustomAudioPlayer = ({
  src,
  isOwnMessage,
}: {
  src: string;
  isOwnMessage: boolean;
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    audio.load();

    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      // usar estado real del elemento, no solo estado React
      if (!audio.paused && !audio.ended) {
        audio.pause();
        return;
      }

      // si terminó, reiniciar
      if (audio.ended) {
        audio.currentTime = 0;
      }

      await audio.play();
    } catch (err) {
      console.error("Audio play error:", err, { src });
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration;

    setCurrentTime(current);
    if (!Number.isNaN(total) && total > 0) {
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const total = audioRef.current.duration;
    if (!Number.isNaN(total)) setDuration(total);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    const value = Number(e.target.value);
    audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    setProgress(value);
  };

  const formatTime = (time: number) => {
    if (!time || Number.isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex items-center  gap-3 min-w-[180px] md:min-w-[220px] p-1 ">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime(0);
        }}
        onError={(e) => {
          console.error("Audio element error:", e.currentTarget.error, { src });
        }}
      />

      <button
        type="button"
        onClick={togglePlayPause}
        className={cn(
          "flex-shrink-0 flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-full transition-colors",
          isOwnMessage
            ? "text-primary bg-background hover:bg-background/90"
            : "text-background bg-primary hover:bg-primary/90",
        )}
        aria-label={isPlaying ? "Pause audio" : "Play audio"}
      >
        {isPlaying ? (
          <Pause size={18} fill="currentColor" />
        ) : (
          <Play size={18} fill="currentColor" className="ml-0.5" />
        )}
      </button>

      <div className="flex flex-col flex-1 gap-1 min-w-0 justify-center pt-4 h-full ">
        <input
          type="range"
          min="0"
          max="100"
          value={Number.isNaN(progress) ? 0 : progress}
          onChange={handleSeek}
          className={cn(
            "w-full self-center h-1.5 appearance-none cursor-pointer outline-none rounded-full",
            // Track
            "[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full",
            "[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full",
            // Thumb (bolita)
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3.5 [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:-mt-1",
            "[&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0",
            isOwnMessage
              ? "bg-background/30 [&::-webkit-slider-runnable-track]:bg-background/30 [&::-moz-range-track]:bg-background/30 [&::-webkit-slider-thumb]:bg-background [&::-moz-range-thumb]:bg-background"
              : "bg-primary/20 [&::-webkit-slider-runnable-track]:bg-primary/20 [&::-moz-range-track]:bg-primary/20 [&::-webkit-slider-thumb]:bg-primary [&::-moz-range-thumb]:bg-primary",
          )}
        />
        <span
          className={cn(
            "text-[11px] md:text-xs font-medium",
            isOwnMessage ? "text-background/80" : "text-primary/70",
          )}
        >
          {isPlaying || progress > 0
            ? formatTime(currentTime)
            : formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
