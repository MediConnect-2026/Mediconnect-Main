import { motion } from "framer-motion";
import { Check, CheckCheck, Download, Play, Copy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { useTranslation } from "react-i18next";

interface Message {
  id: number;
  type: "text" | "image" | "voice" | "file";
  content: string;
  sender: "user" | "doctor";
  time: string;
  status?: "sent" | "delivered" | "read";
  caption?: string;
  duration?: number;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

interface MessageBubbleProps {
  message: Message;
  onViewFile?: (message: Message) => void;
  onDownloadFile?: (url: string, fileName: string) => void;
  getFileIcon?: (fileType: string) => string;
  formatFileSize?: (bytes: number) => string;
  formatDuration?: (seconds: number) => string;
}

export const MessageBubble = ({
  message,
  onViewFile,
  onDownloadFile,
  getFileIcon,
  formatFileSize,
  formatDuration,
}: MessageBubbleProps) => {
  const { t } = useTranslation("common");
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 500,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  };

  const canQuickCopy = message.type === "text" && !!message.content?.trim();
  const canQuickDownload =
    !!onDownloadFile &&
    (message.type === "image" ||
      message.type === "file" ||
      message.type === "voice");

  return (
    <motion.div
      key={message.id}
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`flex items-start gap-3 ${
        message.sender === "user" ? "flex-row-reverse" : ""
      }`}
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src="https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg" />
        <AvatarFallback>
          {message.sender === "user" ? "U" : "DR"}
        </AvatarFallback>
      </Avatar>

      <div
        className={`rounded-3xl px-4 py-2 ${
          message.type === "text" ? "w-fit" : "max-w-[75%]"
        } ${
          message.sender === "user"
            ? "bg-primary text-primary-foreground rounded-br-xl"
            : "bg-primary/10 border border-primary/15 text-primary rounded-bl-xl"
        }`}
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
              {/* Botón de descarga que aparece en hover */}
              {onDownloadFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadFile(message.content, `imagen_${message.id}.jpg`);
                  }}
                  className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 shadow-lg"
                  title={t("messageBubble.download") || "Descargar"}
                >
                  <Download size={14} />
                </button>
              )}
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
              className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg cursor-pointer hover:bg-primary/10 transition-colors group"
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
                  {message.fileSize && formatFileSize
                    ? formatFileSize(message.fileSize)
                    : ""}
                </p>
              </div>
              {/* Botón de descarga que aparece en hover */}
              {onDownloadFile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDownloadFile(
                      message.content,
                      message.fileName || "archivo",
                    );
                  }}
                  className="flex-shrink-0 p-2 hover:bg-primary/15 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title={t("messageBubble.download") || "Descargar"}
                >
                  <Download size={16} />
                </button>
              )}
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
              {formatDuration ? formatDuration(message.duration || 0) : "0:00"}
            </span>
          </div>
        )}

        {/* Hora y estado */}
        <div
          className={`flex items-center gap-1 mt-2 text-xs opacity-70 ${
            message.sender === "user" ? "justify-end" : ""
          }`}
        >
          {canQuickCopy && (
            <button
              onClick={() => navigator.clipboard.writeText(message.content)}
              className="p-1 rounded-full hover:bg-primary/15 transition-colors"
              title={t("messageBubble.copy") || "Copiar"}
              aria-label={t("messageBubble.copy") || "Copiar"}
            >
              <Copy className="w-3 h-3" />
            </button>
          )}

          {canQuickDownload && (
            <button
              onClick={() => {
                const fileName =
                  message.type === "image"
                    ? `imagen_${message.id}.jpg`
                    : message.fileName || "archivo";
                onDownloadFile?.(message.content, fileName);
              }}
              className="p-1 rounded-full hover:bg-primary/15 transition-colors"
              title={t("messageBubble.download") || "Descargar"}
              aria-label={t("messageBubble.download") || "Descargar"}
            >
              <Download className="w-3 h-3" />
            </button>
          )}

          <span>{message.time}</span>

          {message.sender === "user" && message.status && (
            <span>
              {message.status === "sent" && (
                <Check className="inline w-4 h-4 text-primary-foreground/80" />
              )}
              {message.status === "delivered" && (
                <CheckCheck className="inline w-4 h-4 text-primary-foreground/70" />
              )}
              {message.status === "read" && (
                <CheckCheck className="inline w-4 h-4 text-primary-foreground" />
              )}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
