import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, ImageIcon, Paperclip } from "lucide-react";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isRecording: boolean;
  recordingTime: number;
  previewImage: string | null;
  filePreview: { file: File; url: string; type: string } | null;
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
  previewImage,
  filePreview,
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

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputValue]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-primary/10">
      {isRecording ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-destructive/10 rounded-full px-6 py-3 border-2 border-destructive/20"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-3 h-3 bg-destructive rounded-full"
          />
          <span className="flex-1 font-medium text-destructive text-sm">
            Grabando... {formatDuration(recordingTime)}
          </span>
          <button
            onClick={onStopRecording}
            className="bg-destructive text-white rounded-full p-2 hover:bg-destructive/90 transition-all shadow-lg"
          >
            <Send size={18} />
          </button>
        </motion.div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={onImageSelect}
            className="hidden"
          />

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
            onChange={onFileSelect}
            className="hidden"
          />

          <button
            onClick={() => imageInputRef.current?.click()}
            className="bg-muted text-muted-foreground rounded-full p-2 hover:bg-muted/80 transition-all flex-shrink-0"
            title="Enviar imagen"
          >
            <ImageIcon size={18} />
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-muted text-muted-foreground rounded-full p-2 hover:bg-muted/80 transition-all flex-shrink-0"
            title="Enviar documento"
          >
            <Paperclip size={18} />
          </button>

          <div className="flex-1 bg-muted rounded-3xl px-4 py-2 flex items-end gap-2 min-h-[44px] border border-primary/15">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              rows={1}
              className="flex-1 bg-transparent outline-none resize-none text-sm py-1 max-h-[120px] overflow-y-auto placeholder:text-muted-foreground"
              style={{ scrollbarWidth: "thin" }}
            />
          </div>

          {inputValue.trim() || previewImage || filePreview ? (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSendMessage}
              className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-all flex-shrink-0 shadow-md"
            >
              <Send size={18} />
            </motion.button>
          ) : (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onStartRecording}
              className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-all flex-shrink-0 shadow-md"
            >
              <Mic size={18} />
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};
