import type { Message } from "@/types/ChatTypes";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ChatAvatar } from "./ChatAvatar";
import { Download, Check, CheckCheck, Play } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MessageBubbleProps {
  message: Message;
  onViewFile?: (msg: Message) => void;
  onDownloadFile?: (url: string, name: string) => void;
  getFileIcon?: (type: string) => string;
  formatFileSize?: (size: number) => string;
  formatDuration?: (duration: number) => string;
}

export function MessageBubble({
  message,
  onViewFile,
  onDownloadFile,
  getFileIcon,
  formatFileSize,
  formatDuration,
}: MessageBubbleProps) {
  const { t } = useTranslation("common");
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

  return (
    <motion.div
      key={message.id}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        "flex items-start gap-3",
        message.sender === "user" ? "flex-row-reverse" : "",
      )}
    >
      <ChatAvatar name={message.sender === "user" ? "User" : "Doctor"} />
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          message.sender === "user"
            ? "bg-accent/75 text-primary rounded-br-sm"
            : "bg-bg-btn-secondary text-primary rounded-bl-sm",
        )}
      >
        {/* Mensaje de texto */}
        {message.type === "text" && (
          <p className="text-sm break-words">{message.content}</p>
        )}

        {/* Mensaje de imagen */}
        {message.type === "image" && (
          <div className="min-w-[200px] max-w-[280px]">
            <div className="relative group">
              <img
                src={message.content}
                alt={t("messageBubble.imageAlt") || "Imagen"}
                className="rounded-lg w-full h-auto max-h-[200px] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => onViewFile?.(message)}
                style={{ objectFit: "cover" }}
              />
              {/* Botón de descarga en hover */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadFile?.(message.content, `imagen_${message.id}.jpg`);
                }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                title={t("messageBubble.download") || "Descargar"}
              >
                <Download size={14} />
              </button>
            </div>
            {message.caption && (
              <p className="text-sm break-words mt-2">{message.caption}</p>
            )}
          </div>
        )}

        {/* Mensaje de archivo */}
        {message.type === "file" && (
          <div className="min-w-[200px]">
            <div
              className="flex items-center gap-3 p-3 bg-background/30 rounded-lg cursor-pointer hover:bg-background/50 transition-colors group"
              onClick={() => onViewFile?.(message)}
            >
              <div className="text-3xl">
                {getFileIcon?.(message.fileType || "other")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {message.fileName}
                </p>
                <p className="text-xs opacity-70">
                  {message.fileSize ? formatFileSize?.(message.fileSize) : ""}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadFile?.(
                    message.content,
                    message.fileName || "archivo",
                  );
                }}
                className="flex-shrink-0 p-2 hover:bg-background/70 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                title={t("messageBubble.download") || "Descargar"}
              >
                <Download size={16} />
              </button>
            </div>
            {message.caption && (
              <p className="text-sm break-words mt-2">{message.caption}</p>
            )}
          </div>
        )}

        {/* Mensaje de voz */}
        {message.type === "voice" && (
          <div className="flex items-center gap-3 min-w-[180px]">
            <button className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/20 hover:bg-primary/30 transition-colors">
              <Play size={16} className="ml-0.5" fill="currentColor" />
            </button>
            <div className="flex-1 h-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary/40 w-0 rounded-full" />
            </div>
            <span className="text-xs font-medium">
              {formatDuration?.(message.duration || 0)}
            </span>
          </div>
        )}

        {/* Hora y estado */}
        <div
          className={cn(
            "flex items-center gap-1 mt-1 text-xs opacity-70",
            message.sender === "user" ? "justify-end" : "",
          )}
        >
          <span>{message.time}</span>
          {message.sender === "user" && message.status && (
            <span className="ml-1">
              {message.status === "sent" && (
                <Check className="inline w-4 h-4 text-black/80" />
              )}
              {message.status === "delivered" && (
                <CheckCheck className="inline w-4 h-4 text-black/50" />
              )}
              {message.status === "read" && (
                <CheckCheck className="inline w-4 h-4 text-black" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
