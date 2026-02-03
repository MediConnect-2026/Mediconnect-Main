import { motion } from "framer-motion";
import { Check, CheckCheck, Download } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

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
  onViewFile: (message: Message) => void;
  onDownloadFile: (url: string, fileName: string) => void;
  getFileIcon: (fileType: string) => string;
  formatFileSize: (bytes: number) => string;
  formatDuration: (seconds: number) => string;
}

export const MessageBubble = ({
  message,
  onViewFile,
  onDownloadFile,
  getFileIcon,
  formatFileSize,
  formatDuration,
}: MessageBubbleProps) => {
  const messageVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring" as "spring",
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
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          message.sender === "user"
            ? "bg-accent/75 text-primary rounded-br-sm"
            : "bg-bg-btn-secondary text-primary rounded-bl-sm"
        }`}
      >
        {/* Mensaje de texto */}
        {message.type === "text" && (
          <p className="text-sm break-words">{message.content}</p>
        )}

        {/* Mensaje de imagen */}
        {message.type === "image" && (
          <div className="min-w-[200px] max-w-[280px]">
            <img
              src={message.content}
              alt="Imagen enviada"
              className="rounded-lg w-full h-auto max-h-[200px] cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => onViewFile(message)}
              style={{ objectFit: "cover" }}
            />
            {message.caption && (
              <p className="text-sm break-words mt-2">{message.caption}</p>
            )}
          </div>
        )}

        {/* Mensaje de archivo */}
        {message.type === "file" && (
          <div className="min-w-[200px]">
            <div
              className="flex items-center gap-3 p-3 bg-background/30 rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
              onClick={() =>
                onDownloadFile(message.content, message.fileName || "archivo")
              }
            >
              <div className="text-3xl">
                {getFileIcon(message.fileType || "other")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {message.fileName}
                </p>
                <p className="text-xs opacity-70">
                  {message.fileSize ? formatFileSize(message.fileSize) : ""}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownloadFile(
                    message.content,
                    message.fileName || "archivo",
                  );
                }}
                className="flex-shrink-0 p-2 hover:bg-background/50 rounded-full transition-colors"
                title="Descargar"
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
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === "user" ? "bg-black/10" : "bg-black/10"
              }`}
            >
              <div
                className={`w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[10px] ml-1 ${
                  message.sender === "user"
                    ? "border-l-black/70"
                    : "border-l-black/70"
                }`}
              />
            </div>
            <div className="flex-1 h-1 bg-primary/20 rounded-full overflow-hidden">
              <div className="h-full bg-primary/40 w-0 rounded-full" />
            </div>
            <span className="text-xs font-medium">
              {formatDuration(message.duration || 0)}
            </span>
          </div>
        )}

        {/* Hora y estado */}
        <div
          className={`flex items-center gap-1 mt-1 text-xs opacity-70 ${
            message.sender === "user" ? "justify-end" : ""
          }`}
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
};
