import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { ChatHeader } from "./ChatHeader";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { FilePreviewSection } from "./FilePreviewSection";
import { FileViewerModal } from "./FileViewerModal";
import Prescription from "./Prescription"; // <-- Importa el componente
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

interface FilePreview {
  file: File;
  url: string;
  type: string;
}

export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "text",
      content: "Hola, ¿en qué puedo ayudarte hoy?",
      sender: "doctor",
      time: new Date(Date.now() - 3600000).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "read",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
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
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [currentView, setCurrentView] = useState<"chat" | "prescription">(
    "chat",
  );

  const messagesAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detectar si está en el fondo del scroll
  const handleScroll = () => {
    const el = messagesAreaRef.current;
    if (!el) return;
    setIsAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 20);
  };

  useEffect(() => {
    const el = messagesAreaRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Detectar estado online/offline
  useEffect(() => {
    const handleFocus = () => setIsOnline(true);
    const handleBlur = () => setIsOnline(false);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  // Simular respuesta del doctor
  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(
      () => {
        setIsTyping(false);
        const responses = [
          "Entiendo, déjame revisar eso.",
          "Claro, ¿podrías darme más detalles?",
          "Perfecto, te ayudaré con eso.",
          "De acuerdo, procederé a revisar tu caso.",
          "Gracias por la información.",
          "He recibido tu documento, lo revisaré.",
        ];
        const randomResponse =
          responses[Math.floor(Math.random() * responses.length)];

        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "text",
            content: randomResponse,
            sender: "doctor",
            time: new Date().toLocaleTimeString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "delivered",
          },
        ]);
      },
      1500 + Math.random() * 1500,
    );
  };

  // Enviar mensaje
  const handleSendMessage = () => {
    if (inputValue.trim() || previewImage || filePreview) {
      let newMessage: Message;

      if (filePreview) {
        newMessage = {
          id: Date.now(),
          type: "file",
          content: filePreview.url,
          sender: "user",
          time: new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "sent",
          fileName: filePreview.file.name,
          fileType: filePreview.type,
          fileSize: filePreview.file.size,
          caption: inputValue.trim() || undefined,
        };
      } else if (previewImage) {
        newMessage = {
          id: Date.now(),
          type: "image",
          content: previewImage,
          sender: "user",
          time: new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "sent",
          caption: inputValue.trim() || undefined,
        };
      } else {
        newMessage = {
          id: Date.now(),
          type: "text",
          content: inputValue.trim(),
          sender: "user",
          time: new Date().toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "sent",
        };
      }

      setMessages((prev) => [...prev, newMessage]);
      setInputValue("");
      setPreviewImage(null);
      setFilePreview(null);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
          ),
        );
      }, 500);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "read" } : msg,
          ),
        );
      }, 1000);

      simulateTyping();
    }
  };

  // Manejar selección de imagen
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejar selección de archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        const fileType = getFileType(file.type, file.name);

        setFilePreview({
          file,
          url,
          type: fileType,
        });
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  // Ver archivo en modal
  const handleViewFile = (message: Message) => {
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

  // Descargar archivo
  const handleDownloadFile = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Grabación de voz
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingInterval.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }

    const newMessage: Message = {
      id: Date.now(),
      type: "voice",
      content: "",
      sender: "user",
      time: new Date().toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
      duration: recordingTime,
    };

    setMessages((prev) => [...prev, newMessage]);
    setRecordingTime(0);

    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg,
        ),
      );
    }, 500);

    simulateTyping();
  };

  const cancelRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    setRecordingTime(0);
  };

  // Utilidades
  const getFileType = (mimeType: string, fileName: string): string => {
    if (mimeType.includes("pdf")) return "pdf";
    if (
      mimeType.includes("excel") ||
      mimeType.includes("spreadsheet") ||
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls")
    )
      return "excel";
    if (
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    )
      return "word";
    if (mimeType.includes("image")) return "image";
    return "other";
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case "pdf":
        return "📄";
      case "excel":
        return "📊";
      case "word":
        return "📝";
      case "image":
        return "🖼️";
      default:
        return "📎";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const typingVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 400,
      },
    },
  };

  const { t } = useTranslation("common");

  return (
    <div className="flex flex-col h-full bg-background rounded-2xl md:rounded-3xl border border-primary/15 shadow-sm">
      {/* Header */}
      <ChatHeader
        isTyping={isTyping}
        isOnline={isOnline}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      {/* Panel condicional */}
      {currentView === "chat" ? (
        <>
          {/* Messages area */}
          <div
            className="flex-1 p-4 overflow-y-auto overflow-x-auto relative"
            ref={messagesAreaRef}
          >
            {!isAtBottom && (
              <div className="absolute bottom-0 left-0 w-full h-10 pointer-events-none bg-gradient-to-t from-background/90 to-transparent z-10" />
            )}
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                {t("chatPanel.noMessages")}
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
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
                </AnimatePresence>

                {/* Indicador de "escribiendo..." */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      variants={typingVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex items-start gap-3"
                    >
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarImage src="https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg" />
                        <AvatarFallback>DR</AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-2xl rounded-bl-sm px-5 py-4">
                        <div className="flex gap-2">
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground/40 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: 0,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground/40 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: 0.2,
                            }}
                          />
                          <motion.div
                            className="w-2 h-2 bg-muted-foreground/40 rounded-full"
                            animate={{ y: [0, -8, 0] }}
                            transition={{
                              duration: 0.6,
                              repeat: Infinity,
                              delay: 0.4,
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* File Previews */}
          <FilePreviewSection
            {...({
              previewImage,
              filePreview,
              onClearImagePreview: () => setPreviewImage(null),
              onClearFilePreview: () => setFilePreview(null),
              getFileIcon,
              formatFileSize,
            } as any)}
          />

          {/* Input area */}
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
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onCancelRecording={cancelRecording}
            formatDuration={formatDuration}
          />

          {/* File Viewer Modal */}
          <FileViewerModal
            viewerModal={viewerModal}
            onOpenChange={(open) => setViewerModal({ ...viewerModal, open })}
            onDownloadFile={handleDownloadFile}
            getFileIcon={getFileIcon}
          />
        </>
      ) : (
        <Prescription />
      )}
    </div>
  );
};
