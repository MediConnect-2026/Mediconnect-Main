import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface FilePreview {
  file: File;
  url: string;
  type: string;
}

interface FilePreviewSectionProps {
  previewImage: string | null;
  filePreview: FilePreview | null;
  onClearImagePreview: () => void;
  onClearFilePreview: () => void;
  getFileIcon: (fileType: string) => string;
  formatFileSize: (bytes: number) => string;
}

export const FilePreviewSection = ({
  previewImage,
  filePreview,
  onClearImagePreview,
  onClearFilePreview,
  getFileIcon,
  formatFileSize,
}: FilePreviewSectionProps) => {
  return (
    <>
      {/* Vista previa de imagen */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3 bg-muted/50 border-t border-primary/10"
          >
            <div className="relative inline-block">
              <img
                src={previewImage}
                alt="Preview"
                className="h-20 rounded-lg shadow-md"
              />
              <button
                onClick={onClearImagePreview}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90 transition-colors shadow-lg"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vista previa de archivo/documento */}
      <AnimatePresence>
        {filePreview && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-4 py-3 bg-muted/50 border-t border-primary/10"
          >
            <div className="relative inline-block">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg shadow-md min-w-[250px]">
                <div className="text-3xl">{getFileIcon(filePreview.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {filePreview.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(filePreview.file.size)} •{" "}
                    {filePreview.type.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={onClearFilePreview}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90 transition-colors shadow-lg"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
