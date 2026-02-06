import type { Conversation } from "@/types/ChatTypes";
import { ChatAvatar } from "./ChatAvatar";
import { MessageBubble } from "./MessageBubble";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatInput } from "./ChatInput";

import { useRef, useEffect } from "react";
import { FilePreviewSection } from "@/features/teleconsultation/components/chatPanel/FilePreviewSection";
import { FileViewerModal } from "@/features/teleconsultation/components/chatPanel/FileViewerModal";

interface ChatPanelProps {
  conversation: Conversation | null;
  onSendMessage: (
    message: string,
    image?: string | null,
    file?: { file: File; url: string; type: string } | null,
    voice?: { duration: number; url: string } | null,
  ) => void;
  isTyping?: boolean;
  isOnline?: boolean;
}

export function ChatPanel({
  conversation,
  onSendMessage,
  isTyping = false,
  isOnline = false,
}: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<{
    file: File;
    url: string;
    type: string;
  } | null>(null);
  const [viewerModal, setViewerModal] = useState<{
    open: boolean;
    content: string;
    type: "image" | "file";
    fileName?: string;
    fileType?: string;
  }>({
    open: false,
    content: "",
    type: "image",
  });

  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { t } = useTranslation();

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [conversation?.messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() || previewImage || filePreview) {
      onSendMessage(inputValue, previewImage, filePreview, null);
      setInputValue("");
      setPreviewImage(null);
      setFilePreview(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
    e.target.value = ""; // Reset input
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFilePreview({
        file,
        url: URL.createObjectURL(file),
        type: file.type,
      });
    }
    e.target.value = ""; // Reset input
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Enviar mensaje de voz
        onSendMessage("", null, null, {
          duration: recordingTime,
          url: audioUrl,
        });

        // Limpiar
        stream.getTracks().forEach((track) => track.stop());
        setRecordingTime(0);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Iniciar contador
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error al acceder al micrófono:", error);
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleClearImagePreview = () => setPreviewImage(null);
  const handleClearFilePreview = () => setFilePreview(null);

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("doc")) return "📝";
    if (fileType.includes("xls")) return "📊";
    if (fileType.includes("txt")) return "📃";
    return "📁";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Ver archivo/imagen en modal
  const handleViewFile = (message: any) => {
    if (message.type === "image") {
      setViewerModal({
        open: true,
        content: message.content,
        type: "image",
      });
    } else if (message.type === "file") {
      setViewerModal({
        open: true,
        content: message.content,
        type: "file",
        fileName: message.fileName,
        fileType: message.fileType,
      });
    }
  };

  // Descargar archivo/imagen
  const handleDownloadFile = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">
            Selecciona una conversación para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-primary/15 bg-accent/50 rounded-tr-4xl flex-shrink-0">
        <ChatAvatar
          name={conversation.name}
          avatar={conversation.avatar}
          size="lg"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-foreground">
            {conversation.name}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {isTyping
              ? t("chatHeader.typing")
              : isOnline
                ? t("chatHeader.online")
                : t("chatHeader.offline")}
          </p>
        </div>
      </div>

      {/* Messages - Con overflow correcto */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 scrollbar-hide"
        ref={scrollRef}
      >
        <div className="space-y-3">
          {conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onViewFile={handleViewFile}
              onDownloadFile={handleDownloadFile}
              getFileIcon={getFileIcon}
              formatFileSize={formatFileSize}
              formatDuration={formatDuration}
            />
          ))}
        </div>
      </div>

      {/* File/Image Preview Section - ARRIBA del input */}
      <FilePreviewSection
        previewImage={previewImage}
        filePreview={filePreview}
        onClearImagePreview={handleClearImagePreview}
        onClearFilePreview={handleClearFilePreview}
        getFileIcon={getFileIcon}
        formatFileSize={formatFileSize}
      />

      {/* Input - Con flex-shrink-0 para que no se comprima */}
      <div className="flex-shrink-0">
        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          isRecording={isRecording}
          recordingTime={recordingTime}
          previewImage={previewImage}
          filePreview={filePreview}
          onSendMessage={handleSendMessage}
          onImageSelect={handleImageSelect}
          onFileSelect={handleFileSelect}
          onStartRecording={handleStartRecording}
          onStopRecording={handleStopRecording}
          formatDuration={formatDuration}
        />
      </div>

      {/* Modal para ver imágenes y archivos */}
      <FileViewerModal
        viewerModal={viewerModal}
        onOpenChange={(open) => setViewerModal({ ...viewerModal, open })}
        onDownloadFile={handleDownloadFile}
        getFileIcon={getFileIcon}
      />
    </div>
  );
}
