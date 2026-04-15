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
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import chatService from "@/services/chat/chat.service";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { mediaService } from "@/services/chat/media.service";
import { Popover, PopoverTrigger, PopoverContent } from "@/shared/ui/popover";
import { useState, useEffect } from "react";
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
            <div className="w-[300px] ">
              {isOptimistic && !mediaUrl ? (
                <div className="flex items-center gap-2 md:gap-3 p-3 bg-muted/70 rounded-xl border border-border/50">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                  <p className="text-xs text-muted-foreground">
                    Enviando audio...
                  </p>
                </div>
              ) : (
                mediaUrl && (
                  <div className="rounded-xl  w-[300px] bg-muted/70 p-2">
                    <audio
                      controls
                      className="w-full h-11 md:h-12"
                      preload="metadata"
                    >
                      <source src={mediaUrl} type="audio/webm" />
                      <source src={mediaUrl} type="audio/mp4" />
                      <source src={mediaUrl} type="audio/ogg" />
                      {t("messageBubble.audioNotSupported") ||
                        "Tu navegador no soporta audio."}
                    </audio>
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
              "flex items-center justify-end gap-1 text-xs opacity-70",
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
              <span>
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
