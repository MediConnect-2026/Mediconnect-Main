import type {
  ConversationWithDetails,
  AttachmentQueueItem,
  AllowedMediaTypes,
} from "@/types/ChatTypes";
import {
  AttachmentStatus,
  MediaValidationError,
  MessageType,
} from "@/types/ChatTypes";
import { ChatAvatar } from "./ChatAvatar";
import { MessageBubble } from "./MessageBubble";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatInput } from "./ChatInput";
import { useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { FilePreviewSection } from "@/features/teleconsultation/components/chatPanel/FilePreviewSection";
import { FileViewerModal } from "@/features/teleconsultation/components/chatPanel/FileViewerModal";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { ArrowLeft, MoreVertical, ChevronDown } from "lucide-react";
import { useMessages } from "@/lib/hooks/useMessages";
import { useSendMessage } from "@/lib/hooks/useSendMessage";
import { useUploadMedia } from "@/lib/hooks/useUploadMedia";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { useAppStore } from "@/stores/useAppStore";
import { getFileIcon, generateUniqueId } from "@/lib/utils";
import { compressImage } from "@/utils/imageCompression";
import { mediaService } from "@/services/chat/media.service";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

interface ChatPanelProps {
  conversation: ConversationWithDetails | null;
  onBack?: () => void;
}

export function ChatPanel({ conversation, onBack }: ChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const isMobile = useIsMobile();
  const { t } = useTranslation("common");

  // Store state
  const conversations = useAppStore((state) => state.conversations);

  // Get online status from store
  const conversationData = conversations.find((c) => c.id === conversation?.id);
  const isOnline = conversationData?.otroUsuario?.conectado || false;

  // Derive isTyping from the Zustand store — the single source of truth.
  // Use a selector that returns a primitive to ensure Zustand detects changes.
  const isTyping = useAppStore((state) => {
    const users = state.typingUsers.get(conversation?.id ?? 0) || [];

    return users.length > 0;
  });
  // Local UI state
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [attachmentQueue, setAttachmentQueue] = useState<AttachmentQueueItem[]>(
    [],
  );
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Constants
  const MAX_ATTACHMENTS_PER_MESSAGE = 5;

  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement | null>(null);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const readDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentReadRef = useRef<number | null>(null);
  const previousScrollHeightRef = useRef<number>(0);
  const lastMessageIdRef = useRef<number | string | null>(null);
  /** Timestamp (ms) until which any messages update should snap to bottom */
  const lockBottomUntilRef = useRef<number>(0);

  // Hooks for data fetching and mutations
  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
  } = useMessages(conversation?.id ?? null);
  const { sendMessage } = useSendMessage();
  const { uploadMedia, isUploading } = useUploadMedia();
  const {
    joinConversation,
    leaveConversation,
    sendTypingIndicator,
    sendStopTypingIndicator,
    markAsRead,
  } = useWebSocket();
  const resetUnreadCount = useAppStore((state) => state.resetUnreadCount);

  // React Query Client
  const queryClient = useQueryClient();
  const setToast = useGlobalUIStore((state) => state.setToast);

  // Join/leave conversation when it changes
  useEffect(() => {
    if (conversation?.id) {
      joinConversation(conversation.id);
      return () => {
        leaveConversation(conversation.id);
      };
    }
  }, [conversation?.id, joinConversation, leaveConversation]);

  // Auto-scroll logic (useLayoutEffect runs before paint = no visible jump):
  // - For 2s after sending own message, snap to bottom on every render (covers
  //   both the optimistic update AND the server-confirmed ID replacement ~1s later).
  // - If a NEW message arrived and user is already near bottom, also snap.
  // - Never auto-scroll when loading older history (isFetchingNextPage).
  useLayoutEffect(() => {
    if (isFetchingNextPage) return;
    if (!scrollRef.current || messages.length === 0) return;

    const scrollEl = scrollRef.current;

    // Case 1: we are within the "send lock" window — always snap to bottom
    if (Date.now() < lockBottomUntilRef.current) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
      setIsAtBottom(true);
      return;
    }

    // Case 2: a genuinely new message arrived from someone else
    const lastMessage = messages[messages.length - 1];
    const isNewMessage = lastMessage?.id !== lastMessageIdRef.current;
    if (!isNewMessage) return;
    lastMessageIdRef.current = lastMessage?.id ?? null;

    const threshold = 150;
    const alreadyAtBottom =
      scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight <=
      threshold;

    if (alreadyAtBottom) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
      setIsAtBottom(true);
    }
    // else: user is reading history — do nothing
  }, [messages, isFetchingNextPage]);

  // Track whether the viewport is at (or near) the bottom
  // useLayoutEffect ensures isAtBottom is updated synchronously to avoid stale reads.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const threshold = 100; // px from bottom considered "at bottom"
      const atBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
      setIsAtBottom(atBottom);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    // initialize
    onScroll();

    return () => el.removeEventListener("scroll", onScroll);
  }, [messages]);

  // Also scroll to bottom when the typing indicator appears.
  useEffect(() => {
    if (!isTyping) return;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isTyping]);

  // Reset tracking refs when conversation changes
  useLayoutEffect(() => {
    lastMessageIdRef.current = null;
    lockBottomUntilRef.current = 0;
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation?.id]);

  // Mark as read when the viewport is at the bottom (observer on sentinel)
  // Only mark messages from OTHER users as read (not our own optimistic messages)
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel || !conversation?.id) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          // Find the last message that is NOT ours (received from the other user)
          // This avoids marking our own optimistic messages (with temporary IDs) as read
          // Also filter out messages with invalid IDs (negative, null, undefined, 0)
          const lastReceivedMessage = [...messages].reverse().find((m) => {
            // Must have esPropio explicitly set to false (not undefined)
            // And must have a valid positive ID (> 0)
            return m.esPropio === false && typeof m.id === "number" && m.id > 0;
          });

          if (!lastReceivedMessage) return;
          const lastId = lastReceivedMessage.id;

          // Additional validation: ensure lastId is a valid positive integer
          if (!Number.isInteger(lastId) || lastId <= 0) {
            console.warn(
              "[ChatPanel] Invalid message ID for markAsRead:",
              lastId,
            );
            return;
          }

          // Skip if we've already sent this ID or a higher one
          if (lastSentReadRef.current && lastSentReadRef.current >= lastId)
            return;

          if (readDebounceRef.current) clearTimeout(readDebounceRef.current);
          readDebounceRef.current = setTimeout(() => {
            // Optimistic update
            resetUnreadCount(conversation.id);
            try {
              markAsRead(conversation.id, lastId);
              lastSentReadRef.current = lastId;

              // Refetch en background para evitar sobrescrituras con data antigua
              setTimeout(() => {
                queryClient.invalidateQueries({
                  queryKey: QUERY_KEYS.CONVERSATIONS,
                });
              }, 1000);
            } catch (err) {
              console.error("[ChatPanel] markAsRead error:", err);
            }
          }, 500);
        });
      },
      { root: scrollRef.current, threshold: 0.1 },
    );

    obs.observe(sentinel);

    return () => {
      obs.disconnect();
      if (readDebounceRef.current) clearTimeout(readDebounceRef.current);
    };
  }, [messages, conversation?.id, markAsRead, resetUnreadCount]);

  // Load older messages when scrolling to the top
  useEffect(() => {
    const sentinel = topSentinelRef.current;
    const scrollElement = scrollRef.current;
    if (!sentinel || !scrollElement || !hasNextPage || isFetchingNextPage)
      return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            // Store current scroll position before fetching
            previousScrollHeightRef.current = scrollElement.scrollHeight;
            fetchNextPage();
          }
        });
      },
      { root: scrollElement, threshold: 0.1 },
    );

    obs.observe(sentinel);

    return () => {
      obs.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Maintain scroll position after loading older messages (useLayoutEffect = no jump)
  useLayoutEffect(() => {
    if (!isFetchingNextPage && previousScrollHeightRef.current > 0) {
      const scrollElement = scrollRef.current;
      if (scrollElement) {
        const newScrollHeight = scrollElement.scrollHeight;
        const scrollDiff = newScrollHeight - previousScrollHeightRef.current;

        if (scrollDiff > 0) {
          scrollElement.scrollTop = scrollElement.scrollTop + scrollDiff;
        }

        previousScrollHeightRef.current = 0;
      }
    }
  }, [isFetchingNextPage]);

  // Handle typing indicator emission
  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (conversation?.id) {
      // Emit typing event
      sendTypingIndicator(conversation.id);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to emit stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        sendStopTypingIndicator(conversation.id);
      }, 3000);
    }
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior,
      });
      setIsAtBottom(true);
    }
  }, []);

  // Lock scroll to bottom for 2 seconds after sending — covers optimistic + server reconcile updates
  const flagOwnMessage = useCallback(() => {
    lockBottomUntilRef.current = Date.now() + 2000;
  }, []);

  // Add file to attachment queue with validation and compression
  const addToQueue = async (file: File, detectedType: AllowedMediaTypes) => {
    // Check queue limit
    if (attachmentQueue.length >= MAX_ATTACHMENTS_PER_MESSAGE) {
      setToast({
        type: "error",
        message: t(
          "chatPanel.maxAttachmentsReached",
          `Máximo ${MAX_ATTACHMENTS_PER_MESSAGE} archivos por mensaje`,
        ),
        open: true,
      });
      return;
    }

    const id = generateUniqueId();
    const preview = URL.createObjectURL(file);

    // First, add to queue as pending
    const newItem: AttachmentQueueItem = {
      id,
      file,
      type: detectedType,
      preview,
      status: AttachmentStatus.PENDING,
      originalSize: file.size,
    };

    // Validate file before adding
    try {
      mediaService.validateFile(file, detectedType);
      setAttachmentQueue((prev) => [...prev, newItem]);
    } catch (error) {
      if (error instanceof MediaValidationError) {
        setToast({
          type: "error",
          message: error.message,
          open: true,
        });
        // Add to queue with error status to show in UI
        setAttachmentQueue((prev) => [
          ...prev,
          { ...newItem, status: AttachmentStatus.ERROR, error: error.message },
        ]);
        return;
      }
      console.error("Error validating file:", error);
      return;
    }

    // If it's an image > 1MB, compress it
    if (detectedType === "image" && file.size > 1024 * 1024) {
      try {
        // Update status to compressing
        setAttachmentQueue((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: AttachmentStatus.COMPRESSING }
              : item,
          ),
        );

        const {
          file: compressedFile,
          wasCompressed,
          compressedSize,
        } = await compressImage(file);

        // Update with compressed file
        setAttachmentQueue((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  file: compressedFile,
                  preview: URL.createObjectURL(compressedFile),
                  status: AttachmentStatus.PENDING,
                  compressedSize: wasCompressed ? compressedSize : undefined,
                }
              : item,
          ),
        );

        // Revoke old preview URL
        URL.revokeObjectURL(preview);
      } catch (error) {
        console.error("Error compressing image:", error);
        // Keep original file if compression fails
        setAttachmentQueue((prev) =>
          prev.map((item) =>
            item.id === id
              ? { ...item, status: AttachmentStatus.PENDING }
              : item,
          ),
        );
      }
    }
  };

  // Remove attachment from queue
  const removeFromQueue = (id: string) => {
    setAttachmentQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  // Process upload queue sequentially and send message immediately after each successful upload
  const processUploadQueue = async (): Promise<void> => {
    for (let idx = 0; idx < attachmentQueue.length; idx++) {
      const item = attachmentQueue[idx];

      // Skip items with errors
      if (item.status === AttachmentStatus.ERROR) continue;

      try {
        // Update status to uploading
        setAttachmentQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? { ...i, status: AttachmentStatus.UPLOADING, progress: 0 }
              : i,
          ),
        );

        // Upload file
        const uploadResponse = await uploadMedia({
          file: item.file,
          tipo: item.type,
        });

        // Update status to success
        setAttachmentQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: AttachmentStatus.SUCCESS,
                  mediaId: uploadResponse.id,
                  progress: 100,
                }
              : i,
          ),
        );

        // After a successful upload, send the message referencing the uploaded media id
        if (conversation?.id) {
          // Determine message type based on attachment type
          let messageType: "imagen" | "audio" | "video" | "archivo" = "archivo";
          if (item.type === "image") messageType = "imagen";
          else if (item.type === "audio") messageType = "audio";
          else if (item.type === "video") messageType = "video";

          const contenido =
            idx === 0 && inputValue.trim() ? inputValue.trim() : undefined;

          try {
            if (!uploadResponse.id) return;

            await sendMessage({
              conversacionId: conversation.id,
              tipo: messageType,
              contenido,
              mediaId: uploadResponse.id,
            });
          } catch (err) {
            console.error("Error sending message after upload:", err);
            // If sending fails, mark the attachment with an error state
            setAttachmentQueue((prev) =>
              prev.map((i) =>
                i.id === item.id
                  ? {
                      ...i,
                      status: AttachmentStatus.ERROR,
                      error: "Error al enviar mensaje",
                    }
                  : i,
              ),
            );
          }
        }
      } catch (error) {
        console.error(`Error uploading ${item.file.name}:`, error);

        // Update status to error
        setAttachmentQueue((prev) =>
          prev.map((i) =>
            i.id === item.id
              ? {
                  ...i,
                  status: AttachmentStatus.ERROR,
                  error: "Error al subir archivo",
                }
              : i,
          ),
        );
      }
    }
  };

  // Clean up queue after sending
  const clearQueue = () => {
    // Revoke all blob URLs
    attachmentQueue.forEach((item) => {
      URL.revokeObjectURL(item.preview);
    });
    setAttachmentQueue([]);
  };

  const handleSendMessage = async () => {
    if (!conversation?.id) {
      setToast({
        message:
          t("chatPanel.conversationRequired") ||
          "No se puede enviar: conversación no disponible.",
        type: "error",
        open: true,
      });
      return;
    }

    if (!inputValue.trim() && attachmentQueue.length === 0) return;

    try {
      // If we have attachments, upload and send them (one message per uploaded file)
      if (attachmentQueue.length > 0) {
        flagOwnMessage();
        await processUploadQueue();

        // Clear queue after processing
        clearQueue();
      }

      // If there's text but no attachments, send text message
      if (inputValue.trim() && attachmentQueue.length === 0) {
        flagOwnMessage();
        await sendMessage({
          conversacionId: conversation.id,
          tipo: "texto",
          contenido: inputValue.trim(),
        });
      }

      // Clear input
      setInputValue("");

      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      sendStopTypingIndicator(conversation.id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      addToQueue(file, "image");
    });
    e.target.value = ""; // Reset input
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      // Detect type based on MIME type
      let detectedType: AllowedMediaTypes = "file";
      if (file.type.startsWith("video/")) {
        detectedType = "video";
      } else if (file.type.startsWith("audio/")) {
        detectedType = "audio";
      } else if (file.type.startsWith("image/")) {
        detectedType = "image";
      }

      addToQueue(file, detectedType);
    });
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

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Upload audio and send message
        if (conversation?.id) {
          try {
            const audioFile = new File([audioBlob], "audio.webm", {
              type: "audio/webm",
            });
            const uploadResponse = await uploadMedia({
              file: audioFile,
              tipo: "audio",
            });

            await sendMessage({
              conversacionId: conversation.id,
              mediaId: uploadResponse.id,
              tipo: "audio",
            });
          } catch (error) {
            console.error("Error uploading audio:", error);
          }
        }

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
      alert(
        t("chatPanel.microphoneError") ||
          "No se pudo acceder al micrófono. Verifica los permisos.",
      );
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
      <div className="flex-1 flex items-center justify-center bg-background p-4">
        <div className="text-center">
          <p className="text-muted-foreground text-sm md:text-lg">
            {t("chatPanel.selectConversation") ||
              "Selecciona una conversación para comenzar"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background h-full max-h-full overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 p-3 md:p-4 border-b border-primary/15 bg-primary/10 rounded-tr-2xl md:rounded-tr-4xl flex-shrink-0">
        {/* Botón de volver (solo mobile) */}
        {isMobile && onBack && (
          <button
            onClick={onBack}
            className="p-2 hover:bg-accent/70 rounded-full transition-colors flex-shrink-0"
            aria-label={t("chatPanel.back") || "Volver"}
          >
            <ArrowLeft size={20} />
          </button>
        )}

        <ChatAvatar
          name={conversation.otroUsuario.nombre}
          avatar={conversation.otroUsuario.fotoPerfil || undefined}
          size="lg"
          isOnline={isOnline}
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-base md:text-xl font-semibold text-foreground truncate">
            {conversation.otroUsuario.nombre}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {isTyping
              ? t("chatHeader.typing")
              : isOnline
                ? t("chatHeader.online")
                : t("chatHeader.offline")}
          </p>
        </div>

        {/* Botón de menú (opcional) */}
        <button
          className="p-2 hover:bg-accent/70 rounded-full transition-colors flex-shrink-0"
          aria-label={t("chatPanel.menu") || "Menú"}
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Messages area — relative so the scroll button stays scoped inside */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden px-3 md:px-4 py-3 md:py-4 scrollbar-hide min-h-0 relative"
        ref={scrollRef}
      >
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              {t("chatPanel.loading") || "Cargando mensajes..."}
            </p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {/* Sentinel to detect when user scrolls to top for loading older messages */}
            <div
              ref={topSentinelRef}
              aria-hidden
              style={{ width: 1, height: 20 }}
            />

            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <p className="text-sm text-muted-foreground">
                  {t("chatPanel.loadingOlderMessages") ||
                    "Cargando mensajes anteriores..."}
                </p>
              </div>
            )}

            {messages.length > 0 ? (
              (() => {
                // Extraer todas las imágenes de la conversación una sola vez
                const allImageMediaIds = messages
                  .filter((m) => m.tipo === MessageType.IMAGEN && m.mediaId)
                  .map((m) => m.mediaId!);

                return messages.map((message, index) => {
                  // Encontrar el índice de la imagen actual
                  const currentImageIndex =
                    message.tipo === MessageType.IMAGEN && message.mediaId
                      ? allImageMediaIds.indexOf(message.mediaId)
                      : -1;

                  return (
                    <MessageBubble
                      key={`${message.id}-${index}`}
                      message={message}
                      onViewFile={handleViewFile}
                      onDownloadFile={handleDownloadFile}
                      getFileIcon={getFileIcon}
                      allImageMediaIds={allImageMediaIds}
                      currentImageIndex={currentImageIndex}
                      onDeleteModalChange={setIsDeleteModalOpen}
                      onImageModalChange={setIsImageModalOpen}
                    />
                  );
                });
              })()
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">
                  {t("chatPanel.noMessages") ||
                    "No hay mensajes aún. ¡Envía el primer mensaje!"}
                </p>
              </div>
            )}

            {/* Sentinel to detect bottom of message list for "read" detection */}
            <div
              ref={bottomSentinelRef}
              aria-hidden
              style={{ width: 1, height: 1 }}
            />

            {/* Typing indicator bubble — appears at the bottom of the message list */}
            {isTyping && (
              <div className="flex items-end gap-3 mt-1">
                <ChatAvatar
                  name={conversation.otroUsuario.nombre}
                  avatar={conversation.otroUsuario.fotoPerfil || undefined}
                  size="sm"
                />

                <div className="flex items-center gap-3 px-3 py-2 bg-accent/70 rounded-2xl rounded-bl-sm">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {conversation.otroUsuario.nombre}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t("chatHeader.typing") || "está escribiendo..."}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-primary rounded-full animate-ping" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scroll-to-bottom button — sticky at the bottom of the scroll container */}
        {!isAtBottom &&
          !isDeleteModalOpen &&
          !isImageModalOpen &&
          !viewerModal.open && (
            <div className="sticky bottom-3 z-20 flex justify-center pointer-events-none">
              <button
                onClick={() => scrollToBottom()}
                className="pointer-events-auto flex items-center gap-2 bg-accent/90 text-primary px-3 py-2 rounded-full shadow-lg hover:opacity-90 transition-colors backdrop-blur-sm"
                aria-label="Ir al último mensaje"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
      </div>

      {/* File/Image Preview Section - ARRIBA del input */}
      <FilePreviewSection
        attachmentQueue={attachmentQueue}
        onRemoveAttachment={removeFromQueue}
        isUploading={isUploading}
      />

      <div className="flex-shrink-0 border-t border-primary/10">
        <ChatInput
          inputValue={inputValue}
          setInputValue={handleInputChange}
          isRecording={isRecording}
          recordingTime={recordingTime}
          hasAttachments={attachmentQueue.length > 0}
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