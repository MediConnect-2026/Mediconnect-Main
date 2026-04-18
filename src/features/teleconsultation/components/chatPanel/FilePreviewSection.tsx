import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AttachmentQueueItem } from "@/types/ChatTypes";
import { AttachmentStatus } from "@/types/ChatTypes";
import { formatFileSize, getFileIcon } from "@/lib/utils";
import { calculateCompressionRatio } from "@/utils/imageCompression";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import { Progress } from "@/shared/ui/progress";
import { useState } from "react";

interface FilePreviewSectionProps {
  attachmentQueue?: AttachmentQueueItem[];
  onRemoveAttachment?: (id: string) => void;
  isUploading?: boolean;
}

export const FilePreviewSection = ({
  attachmentQueue = [],
  onRemoveAttachment,
}: FilePreviewSectionProps) => {
  const { t } = useTranslation("common");
  const [videoDurations, setVideoDurations] = useState<Record<string, number>>(
    {},
  );
  const safeQueue = attachmentQueue ?? [];

  // Render badge based on status
  const renderStatusBadge = (item: AttachmentQueueItem) => {
    switch (item.status) {
      case AttachmentStatus.PENDING:
        return (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
            {t("filePreview.ready", "Listo")}
          </div>
        );
      case AttachmentStatus.COMPRESSING:
        return (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            {t("filePreview.compressing", "Comprimiendo...")}
          </div>
        );
      case AttachmentStatus.UPLOADING:
        return (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            {t("filePreview.uploading", "Subiendo...")}
          </div>
        );
      case AttachmentStatus.SUCCESS:
        return (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <CheckCircle size={12} />
            {t("filePreview.uploaded", "Enviado")}
          </div>
        );
      case AttachmentStatus.ERROR:
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 cursor-help">
                  <AlertCircle size={12} />
                  {t("filePreview.error", "Error")}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{item.error || "Error desconocido"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      default:
        return null;
    }
  };

  // Render preview based on file type
  const renderPreview = (item: AttachmentQueueItem) => {
    if (item.type === "image") {
      return (
        <img
          src={item.preview}
          alt={item.file.name}
          className="w-full h-full object-cover"
        />
      );
    } else if (item.type === "video") {
      return (
        <video
          src={item.preview}
          className="w-full h-full object-cover"
          muted
          onLoadedMetadata={(e) => {
            const videoElement = e.target as HTMLVideoElement;
            setVideoDurations((prev) => ({
              ...prev,
              [item.id]: videoElement.duration,
            }));
          }}
        />
      );
    } else {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <div className="text-4xl mb-2">{getFileIcon(item.file.type)}</div>
            <p className="text-xs text-muted-foreground px-2 truncate max-w-[100px]">
              {item.file.name}
            </p>
          </div>
        </div>
      );
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (safeQueue.length === 0) {
    return null;
  }

  return (
    <div className="px-4 py-3 bg-muted/30 border-t border-primary/10">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-foreground">
          {t("filePreview.attachments", "Archivos adjuntos")} (
          {safeQueue.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        <AnimatePresence mode="popLayout">
          {safeQueue.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="relative group"
            >
              {/* Preview Container */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-primary/20 bg-background">
                {renderPreview(item)}

                {/* Status Badge */}
                {renderStatusBadge(item)}

                {/* Video Duration Badge */}
                {item.type === "video" && videoDurations[item.id] && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-medium">
                    {formatDuration(videoDurations[item.id])}
                  </div>
                )}

                {/* Remove Button */}
                {item.status !== AttachmentStatus.UPLOADING &&
                  item.status !== AttachmentStatus.SUCCESS && (
                    <button
                      onClick={() => onRemoveAttachment?.(item.id)}
                      className="absolute top-1 left-1 bg-destructive/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-destructive"
                    >
                      <X size={14} />
                    </button>
                  )}

                {/* Overlay for disabled state */}
                {item.status === AttachmentStatus.ERROR && (
                  <div className="absolute inset-0 bg-red-500/20 backdrop-blur-[1px]" />
                )}
              </div>

              {/* File Info */}
              <div className="mt-1 space-y-0.5">
                <p
                  className="text-xs font-medium text-foreground truncate"
                  title={item.file.name}
                >
                  {item.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(item.compressedSize || item.file.size)}
                  {item.compressedSize &&
                    item.originalSize &&
                    item.compressedSize < item.originalSize && (
                      <span className="text-green-600 ml-1">
                        ↓
                        {calculateCompressionRatio(
                          item.originalSize,
                          item.compressedSize,
                        )}
                        %
                      </span>
                    )}
                </p>

                {/* Progress Bar */}
                {item.status === AttachmentStatus.UPLOADING &&
                  typeof item.progress === "number" && (
                    <Progress value={item.progress} className="h-1" />
                  )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};