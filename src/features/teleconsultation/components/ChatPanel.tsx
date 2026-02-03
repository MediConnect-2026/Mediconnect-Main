import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Mic,
  X,
  Check,
  CheckCheck,
  Image as ImageIcon,
  Paperclip,
  FileText,
  Download,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { MCDialogBase } from "@/shared/components/MCDialogBase";

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
  const messagesAreaRef = useRef<HTMLDivElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recordingInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [inputValue]);

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

  const handleSendMessage = () => {
    if (inputValue.trim() || previewImage || filePreview) {
      let newMessage: Message;

      if (filePreview) {
        // Mensaje de archivo
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
        // Mensaje de imagen
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
        // Mensaje de texto
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

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

  const handleDownloadFile = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  const [isOnline, setIsOnline] = useState(true);

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

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-primary/15 shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src="https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg" />
            <AvatarFallback>CR</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">Dr. Cristiano Ronaldo</h3>
            <p className="text-xs text-muted-foreground">
              {isTyping
                ? "escribiendo..."
                : isOnline
                  ? "en línea"
                  : "desconectado"}
            </p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        className="flex-1 p-4 overflow-y-auto relative"
        ref={messagesAreaRef}
      >
        {!isAtBottom && (
          <div className="absolute bottom-0 left-0 w-full h-10 pointer-events-none bg-gradient-to-t from-background/90 to-transparent z-10" />
        )}
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
            No hay mensajes aún
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {messages.map((message) => (
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
                    <AvatarImage
                      src={
                        message.sender === "user"
                          ? "https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg"
                          : "https://i.pinimg.com/736x/6b/8b/0a/6b8b0aa412e8b2f5b7587c0e87a2f46e.jpg"
                      }
                    />
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
                          onClick={() => handleViewFile(message)}
                          style={{ objectFit: "cover" }}
                        />
                        {message.caption && (
                          <p className="text-sm break-words mt-2">
                            {message.caption}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Mensaje de archivo */}
                    {message.type === "file" && (
                      <div className="min-w-[200px]">
                        <div
                          className="flex items-center gap-3 p-3 bg-background/30 rounded-lg cursor-pointer hover:bg-background/50 transition-colors"
                          onClick={() =>
                            handleDownloadFile(
                              message.content,
                              message.fileName || "archivo",
                            )
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
                              {message.fileSize
                                ? formatFileSize(message.fileSize)
                                : ""}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadFile(
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
                          <p className="text-sm break-words mt-2">
                            {message.caption}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Mensaje de voz */}
                    {message.type === "voice" && (
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.sender === "user"
                              ? "bg-black/10"
                              : "bg-black/10"
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
                onClick={() => setPreviewImage(null)}
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
                onClick={() => setFilePreview(null)}
                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90 transition-colors shadow-lg"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
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
              onClick={stopRecording}
              className="bg-destructive text-white rounded-full p-2 hover:bg-destructive/90 transition-all shadow-lg"
            >
              <Send size={18} />
            </button>
          </motion.div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Input para imágenes */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Input para documentos */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={handleFileSelect}
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
                onClick={handleSendMessage}
                className="bg-primary text-primary-foreground rounded-full p-2 hover:bg-primary/90 transition-all flex-shrink-0 shadow-md"
              >
                <Send size={18} />
              </motion.button>
            ) : (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
                onClick={startRecording}
                className="bg-[#23272f] text-primary-foreground rounded-full p-2 hover:bg-[#23272f]/90 transition-all flex-shrink-0 shadow-md"
              >
                <Mic size={18} />
              </motion.button>
            )}
          </div>
        )}
      </div>

      {/* Modal de visualización de archivos/imágenes enviados */}
      <MCDialogBase
        open={viewerModal.open}
        onOpenChange={(open) => setViewerModal({ ...viewerModal, open })}
        title={
          viewerModal.type === "image"
            ? "Vista de imagen"
            : viewerModal.fileName || "Vista de archivo"
        }
        size="image-preview"
        confirmText="Cerrar"
        onConfirm={() => setViewerModal({ ...viewerModal, open: false })}
        borderHeader
      >
        <div className="space-y-4">
          {viewerModal.type === "image" && (
            <div className="flex items-center justify-center  rounded-lg">
              <img
                src={viewerModal.content}
                alt="Imagen"
                className="max-w-full object-contain rounded-lg"
              />
            </div>
          )}

          {viewerModal.type === "file" && (
            <>
              {viewerModal.fileType === "pdf" && (
                <div className="w-full h-[600px] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
                  <object
                    data={viewerModal.content}
                    type="application/pdf"
                    className="w-full h-full"
                  >
                    <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                      <FileText
                        size={64}
                        className="text-muted-foreground mb-4"
                      />
                      <p className="text-sm text-muted-foreground mb-4">
                        No se puede mostrar el PDF en este navegador
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() =>
                            window.open(viewerModal.content, "_blank")
                          }
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Abrir en nueva pestaña
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadFile(
                              viewerModal.content,
                              viewerModal.fileName || "documento.pdf",
                            )
                          }
                          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors flex items-center gap-2"
                        >
                          <Download size={16} />
                          Descargar
                        </button>
                      </div>
                    </div>
                  </object>
                </div>
              )}

              {viewerModal.fileType !== "pdf" && (
                <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="text-6xl mb-4">
                    {getFileIcon(viewerModal.fileType || "other")}
                  </div>
                  <p className="font-medium text-lg mb-2">
                    {viewerModal.fileName}
                  </p>
                  <p className="text-sm text-muted-foreground mb-6">
                    La vista previa no está disponible para este tipo de archivo
                  </p>
                  <button
                    onClick={() =>
                      handleDownloadFile(
                        viewerModal.content,
                        viewerModal.fileName || "archivo",
                      )
                    }
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    <Download size={18} />
                    Descargar archivo
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </MCDialogBase>
    </div>
  );
};
