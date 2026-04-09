import type { MessageWithSender } from "@/types/ChatTypes";
import { MessageType, MessageStatus } from"@/types/ChatTypes";
import { cn, formatFileSize } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChatAvatar } from "./ChatAvatar";
import { Download, Check, CheckCheck, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import chatService from "@/services/chat/chat.service";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { mediaService } from "@/services/chat/media.service";
import { useState, useEffect } from "react";
import { format } from "date-fns";
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
  const isMobile = useIsMobile();
  const currentUserId = useAppStore((state) => state.user?.id);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [allImageUrls, setAllImageUrls] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Usar esPropio si está disponible, con fallback a comparación de IDs
  const isOwnMessage = message.esPropio !== undefined 
    ? message.esPropio 
    : message.remitenteId === currentUserId;
  
  // Detectar si es un mensaje temporal/optimista (ID negativo)
  const isOptimistic = message.id < 0;

  // Verificar que el remitente existe, si no, usar valores por defecto
  const remitente = message.remitente || {
    id: message.remitenteId,
    nombre: "Usuario",
    apellido: "",
    fotoPerfil: "",
  };

  const removeMessage = useAppStore((state) => state.removeMessage);
  const setToast = useGlobalUIStore((state) => state.setToast);

  // Notify parent when image modal opens/closes
  useEffect(() => {
    onImageModalChange?.(isImageModalOpen);
  }, [isImageModalOpen, onImageModalChange]);

  // Notify parent when delete modal opens/closes
  useEffect(() => {
    onDeleteModalChange?.(isDeleteModalOpen);
  }, [isDeleteModalOpen, onDeleteModalChange]);

  // Fetch media URL if message has mediaId
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

  // Cargar todas las URLs de las imágenes cuando se abre el modal
  useEffect(() => {
    if (isImageModalOpen && allImageMediaIds.length > 0) {
      Promise.all(
        allImageMediaIds.map((mediaId) => 
          mediaService.getMediaUrl(mediaId)
            .catch((error) => {
              console.error(`Error obteniendo URL para ${mediaId}:`, error);
              return null;
            })
        )
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

  // Format message time con manejo de errores
  const messageTime = (() => {
    try {
      const date = new Date(message.enviadoEn);
      if (isNaN(date.getTime())) {
        return "--:--";
      }
      return format(date, "HH:mm", { locale: es });
    } catch (error) {
      console.error("Error formateando fecha:", error);
      return "--:--";
    }
  })();

  return (
    <motion.div
      key={message.id}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "flex items-start gap-2 md:gap-3",
        isOwnMessage ? "flex-row-reverse" : "",
      )}
    >
      <ChatAvatar
        name={remitente.nombre}
        avatar={remitente.fotoPerfil || undefined}
        size="sm"
      />
      <div
        className={cn(
          "relative max-w-[85%] md:max-w-[75%] rounded-2xl px-3 md:px-4 py-2 group/message",
          // Añadir padding extra a la derecha en mensajes propios para el botón de eliminar
          isOwnMessage ? "pr-8 md:pr-10" : "",
          isOwnMessage
            ? "bg-accent/75 text-primary rounded-br-sm"
            : "bg-bg-btn-secondary text-primary rounded-bl-sm",
        )}
      >
        {isOwnMessage && (
          <div className="absolute top-1 right-1 md:top-2 md:right-2 opacity-0 group-hover/message:opacity-100 transition-opacity duration-200">
            <MCModalBase
              id={`delete-modal-${message.id}`}
              trigger={
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-1.5 md:p-2 hover:bg-red-500/20 bg-background/10 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                  title={t("messageBubble.delete") || "Eliminar"}
                  aria-label={t("messageBubble.delete") || "Eliminar"}
                >
                  <Trash size={isMobile ? 14 : 16} className="text-red-500" />
                </button>
              }
              variant="warning"
              size="smWide"
              title={t("messageBubble.confirmDeleteTitle") || "Eliminar mensaje"}
              description={t("messageBubble.confirmDelete") || "¿Estás seguro de que quieres eliminar este mensaje?"}
              confirmText={t("messageBubble.delete") || "Eliminar"}
              secondaryText={t("messageBubble.cancel") || "Cancelar"}
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              onConfirm={async () => {
                try {
                  await chatService.deleteMessage(message.id);
                  removeMessage(message.conversacionId, message.id);
                  setToast?.({ type: "success", message: t("messageBubble.deleted") || "Mensaje eliminado", open: true });
                } catch (error) {
                  console.error("Error eliminando mensaje:", error);
                  setToast?.({ type: "error", message: t("messageBubble.deleteError") || "No se pudo eliminar el mensaje", open: true });
                } finally {
                  setIsDeleteModalOpen(false);
                }
              }}
            >
              <></>
            </MCModalBase>
          </div>
        )}
        {/* Mensaje de texto */}
        {message.tipo === MessageType.TEXTO && message.contenido && (
          <p className="text-xs md:text-sm break-words">{message.contenido}</p>
        )}

        {/* Mensaje de imagen */}
        {message.tipo === MessageType.IMAGEN && (
          <div className="min-w-[150px] md:min-w-[200px] max-w-[250px] md:max-w-[280px]">
            {isOptimistic && !mediaUrl ? (
              // Mostrar placeholder mientras se sube la imagen
              <div className="rounded-lg w-full h-[180px] md:h-[200px] bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Enviando...</p>
                </div>
              </div>
            ) : mediaUrl && (
              <div className="relative group">
                <img
                  src={mediaUrl}
                  alt={t("messageBubble.imageAlt") || "Imagen"}
                  className="rounded-lg w-full h-auto max-h-[180px] md:max-h-[200px] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setIsImageModalOpen(true)}
                  style={{ objectFit: "cover" }}
                />
                {/* Botón de descarga en hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadFile?.(mediaUrl, `imagen_${message.id}.jpg`);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5 md:p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                  title={t("messageBubble.download") || "Descargar"}
                >
                  <Download size={isMobile ? 12 : 14} />
                </button>
              </div>
            )}
            {message.contenido && (
              <p className="text-xs md:text-sm break-words mt-2">
                {message.contenido}
              </p>
            )}
          </div>
        )}

        {/* Mensaje de archivo */}
        {message.tipo === MessageType.ARCHIVO && (
          <div className="min-w-[180px] md:min-w-[200px]">
            {isOptimistic && !mediaUrl ? (
              // Placeholder mientras se sube el archivo
              <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-background/30 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium truncate">
                    {message.media?.nombre || message.contenido || "archivo"}
                  </p>
                  <p className="text-xs text-muted-foreground">Enviando...</p>
                </div>
              </div>
            ) : mediaUrl && (
              <div
                className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 bg-background/30 rounded-lg cursor-pointer hover:bg-background/50 transition-colors group"
                onClick={() => onViewFile?.(message)}
              >
              <div className="text-2xl md:text-3xl flex-shrink-0">
                {getFileIcon?.(message.media?.tipoMime || message.contenido || "other")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm font-medium truncate">
                  {message.media?.nombre || message.contenido || "archivo"}
                </p>
                {message.media?.tamanioBytes && (
                  <p className="text-xs opacity-70">
                    {formatFileSize(message.media.tamanioBytes)}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadFile?.(
                    mediaUrl,
                    message.media?.nombre || message.contenido || "archivo",
                  );
                }}
                className="flex-shrink-0 p-1.5 md:p-2 hover:bg-background/70 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title={t("messageBubble.download") || "Descargar"}
              >
                <Download size={isMobile ? 14 : 16} />
              </button>
            </div>
            )}
            {message.contenido && (
              <p className="text-xs md:text-sm break-words mt-2">
                {message.contenido}
              </p>
            )}
          </div>
        )}

        {/* Mensaje de audio */}
        {message.tipo === MessageType.AUDIO && (
          <div className="min-w-[160px] md:min-w-[180px]">
            {isOptimistic && !mediaUrl ? (
              <div className="flex items-center gap-2 md:gap-3 p-2 bg-muted rounded-lg">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <p className="text-xs text-muted-foreground">Enviando audio...</p>
              </div>
            ) : mediaUrl && (
              <div className="flex items-center gap-2 md:gap-3">
                <audio controls className="w-full">
                  <source src={mediaUrl} type="audio/webm" />
                  <source src={mediaUrl} type="audio/mp4" />
                  <source src={mediaUrl} type="audio/ogg" />
                  {t("messageBubble.audioNotSupported") || "Tu navegador no soporta audio."}
                </audio>
              </div>
            )}
            {message.contenido && (
              <p className="text-xs md:text-sm break-words mt-2">
                {message.contenido}
              </p>
            )}
          </div>
        )}

        {/* Mensaje de video */}
        {message.tipo === MessageType.VIDEO && (
          <div className="min-w-[200px] md:min-w-[250px] max-w-[300px] md:max-w-[350px]">
            {isOptimistic && !mediaUrl ? (
              <div className="rounded-lg w-full h-[250px] md:h-[300px] bg-muted flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Enviando video...</p>
                </div>
              </div>
            ) : mediaUrl && (
              <video 
                controls 
                className="rounded-lg w-full h-auto max-h-[250px] md:max-h-[300px]"
                style={{ objectFit: "cover" }}
              >
                <source src={mediaUrl} type="video/mp4" />
                <source src={mediaUrl} type="video/webm" />
                {t("messageBubble.videoNotSupported") || "Tu navegador no soporta video."}
              </video>
            )}
            {message.contenido && (
              <p className="text-xs md:text-sm break-words mt-2">
                {message.contenido}
              </p>
            )}
          </div>
        )}

        {/* Hora y estado */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-xs opacity-70",
            isOwnMessage ? "justify-end" : "",
          )}
        >
          <span>{messageTime}</span>
          {isOwnMessage && (
            <span className="ml-1">
              {message.estado === MessageStatus.ENVIADO && (
                <Check className="inline w-3 h-3 md:w-4 md:h-4 text-black/80" />
              )}
              {message.estado === MessageStatus.ENTREGADO && (
                <CheckCheck className="inline w-3 h-3 md:w-4 md:h-4 text-black/50" />
              )}
              {message.estado === MessageStatus.LEIDO && (
                <CheckCheck className="inline w-3 h-3 md:w-4 md:h-4 text-black" />
              )}
            </span>
          )}
        </div>
      </div>

      {/* Modal para visualizar imágenes */}
      {message.tipo === MessageType.IMAGEN && mediaUrl && (
        <ImageCarouselModal
          images={allImageUrls.length > 0 ? allImageUrls : [mediaUrl]}
          open={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          startIndex={allImageUrls.length > 0 && currentImageIndex >= 0 ? currentImageIndex : 0}
        />
      )}
    </motion.div>
  );
}
