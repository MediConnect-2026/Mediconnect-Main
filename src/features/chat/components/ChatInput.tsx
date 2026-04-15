import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, ImageIcon, Paperclip } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isRecording: boolean;
  recordingTime: number;
  hasAttachments: boolean;
  onSendMessage: () => void;
  onImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  formatDuration: (seconds: number) => string;
}

export const ChatInput = ({
  inputValue,
  setInputValue,
  isRecording,
  recordingTime,
  hasAttachments,
  onSendMessage,
  onImageSelect,
  onFileSelect,
  onStartRecording,
  onStopRecording,
  formatDuration,
}: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");

  // Auto-resize del textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the correct scrollHeight
      textarea.style.height = "auto";

      // Set height based on scrollHeight, with a max of 120px
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="p-3 md:p-4 border-t border-primary/10 bg-background">
      {isRecording ? (
        // Modo grabación
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 md:gap-3 bg-destructive/10 rounded-full px-4 md:px-6 py-2.5 md:py-3 border-2 border-destructive/20"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-2.5 h-2.5 md:w-3 md:h-3 bg-destructive rounded-full flex-shrink-0"
          />
          <span className="flex-1 font-medium text-destructive text-xs md:text-sm truncate">
            {t("chatInput.recording")} {formatDuration(recordingTime)}
          </span>
          <button
            onClick={onStopRecording}
            className="bg-destructive text-white rounded-full p-1.5 md:p-2 hover:bg-destructive/90 transition-all shadow-lg flex-shrink-0"
            title="Detener grabación"
          >
            <Send size={isMobile ? 16 : 18} />
          </button>
        </motion.div>
      ) : (
        // Modo normal
        <div className="flex items-center gap-2 md:gap-3">
          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={onImageSelect}
            className="hidden"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.mp4,.webm,.avi,.mov,.mkv,image/*,audio/*"
            multiple
            onChange={onFileSelect}
            className="hidden"
          />

          {/* Botón de imagen */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className="bg-muted text-muted-foreground rounded-full p-1.5 md:p-2 hover:bg-muted/80 transition-all flex-shrink-0"
            title={t("chatInput.sendImage")}
          >
            <ImageIcon size={isMobile ? 16 : 18} />
          </button>

          {/* Botón de archivo */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-muted text-muted-foreground rounded-full p-1.5 md:p-2 hover:bg-muted/80 transition-all flex-shrink-0"
            title={t("chatInput.sendFile")}
          >
            <Paperclip size={isMobile ? 16 : 18} />
          </button>

          {/* Textarea que crece automáticamente */}
          <div className="flex-1 bg-muted rounded-3xl px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 border border-primary/15">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={
                t("chatInput.placeholder") || "Escribe un mensaje..."
              }
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-xs md:text-sm py-1.5 max-h-[120px] overflow-y-auto placeholder:text-muted-foreground"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(0,0,0,0.2) transparent",
              }}
            />
          </div>

          {/* Botón de enviar o grabar */}
          {inputValue.trim() || hasAttachments ? (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSendMessage}
              className="bg-primary text-primary-foreground rounded-full p-1.5 md:p-2 hover:bg-primary/90 transition-all flex-shrink-0 shadow-md"
              title="Enviar mensaje"
            >
              <Send size={isMobile ? 16 : 18} />
            </motion.button>
          ) : (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onStartRecording}
              className="bg-primary text-primary-foreground rounded-full p-1.5 md:p-2 hover:bg-primary/90 transition-all flex-shrink-0 shadow-md"
              title="Grabar mensaje de voz"
            >
              <Mic size={isMobile ? 16 : 18} />
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};
