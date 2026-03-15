import { useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCitaDetails } from "@/lib/hooks/useCitaDetails";
import { useAppStore } from "@/stores/useAppStore";
import { getUserAppRole } from "@/services/auth/auth.types";
import { chatService } from "@/services/chat";
import type { ConversationWithDetails, ChatUser } from "@/types/ChatTypes";
import { ChatPanel as RealChatPanel } from "@/features/chat/components/ChatPanel";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { Loader2 } from "lucide-react";
import type { CitaDetalle } from "@/types/AppointmentTypes";

interface TeleconsultChatPanelProps {
  appointmentId: string;
}

/** Construye ChatUser para el otro participante desde la cita (evita undefined .nombre) */
function buildOtroUsuarioFromAppointment(
  appointment: CitaDetalle | null,
  role: string | null
): ChatUser | null {
  if (!appointment) return null;
  if (role === "DOCTOR" && appointment.paciente) {
    const p = appointment.paciente;
    return {
      id: appointment.pacienteId ?? p.usuarioId ?? 0,
      nombre: p.nombre ?? "",
      apellido: p.apellido ?? "",
      email: p.usuario?.email,
      fotoPerfil: p.usuario?.fotoPerfil ?? undefined,
    };
  }
  if (role !== "DOCTOR" && appointment.doctor) {
    const d = appointment.doctor;
    return {
      id: appointment.doctorId ?? d.usuarioId ?? 0,
      nombre: d.nombre ?? "",
      apellido: d.apellido ?? "",
      email: d.usuario?.email,
      fotoPerfil: d.usuario?.fotoPerfil ?? undefined,
    };
  }
  return null;
}

/**
 * Panel de chat en la sala de teleconsulta: resuelve la conversación
 * doctor-paciente de la cita y muestra el chat real (mensajes, WebSocket, etc.).
 * Usa pacienteId/doctorId del backend y asegura otroUsuario con nombre para evitar crashes.
 */
export function TeleconsultChatPanel({ appointmentId }: TeleconsultChatPanelProps) {
  const queryClient = useQueryClient();
  const user = useAppStore((s) => s.user);
  const role = user ? getUserAppRole(user) : null;
  const { appointment, loading: loadingCita } = useCitaDetails(
    appointmentId || undefined
  );

  const otherUserId =
    role === "DOCTOR"
      ? appointment?.pacienteId ?? appointment?.paciente?.usuarioId
      : appointment?.doctorId ?? appointment?.doctor?.usuarioId;

  useEffect(() => {
    if (appointmentId) {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS });
    }
  }, [appointmentId, queryClient]);

  const {
    data: conversation,
    isLoading: loadingConversation,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.CONVERSATIONS, "teleconsult", appointmentId, otherUserId],
    queryFn: async (): Promise<ConversationWithDetails> => {
      if (otherUserId == null) throw new Error("No other user for this appointment");
      const res = await chatService.getOrCreateConversation(otherUserId);
      return chatService.getConversationById(res.data.id);
    },
    enabled: !!appointmentId && otherUserId != null && otherUserId !== 0 && !loadingCita,
    staleTime: 1000 * 60 * 2,
  });

  const fallbackOtroUsuario = useMemo(
    () => buildOtroUsuarioFromAppointment(appointment ?? null, role),
    [appointment, role]
  );

  const safeConversation = useMemo((): ConversationWithDetails | null => {
    if (!conversation) return null;
    const conversationId =
      (conversation as ConversationWithDetails & { conversacionId?: number }).id ??
      (conversation as ConversationWithDetails & { conversacionId?: number }).conversacionId;
    if (conversationId == null || conversationId === 0) return null;

    const base = {
      ...conversation,
      id: conversationId,
    } as ConversationWithDetails;

    const otro = conversation.otroUsuario;
    if (otro?.nombre != null && otro?.apellido != null) return base;
    const fallback = fallbackOtroUsuario;
    if (!fallback) return base;
    return {
      ...base,
      otroUsuario: {
        id: otro?.id ?? fallback.id,
        nombre: otro?.nombre ?? fallback.nombre,
        apellido: otro?.apellido ?? fallback.apellido,
        email: otro?.email ?? fallback.email,
        fotoPerfil: otro?.fotoPerfil ?? fallback.fotoPerfil,
        conectado: otro?.conectado,
        rol: otro?.rol,
      },
    };
  }, [conversation, fallbackOtroUsuario]);

  if (loadingCita || (otherUserId != null && loadingConversation)) {
    return (
      <div className="flex flex-col h-full bg-background rounded-2xl border border-primary/15 items-center justify-center gap-3 p-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Cargando chat…</p>
      </div>
    );
  }

  if (isError || (otherUserId == null && !loadingCita && appointment != null)) {
    return (
      <div className="flex flex-col h-full bg-background rounded-2xl border border-primary/15 items-center justify-center gap-2 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No se pudo cargar la conversación para esta cita.
        </p>
      </div>
    );
  }

  if (!safeConversation || !safeConversation.id) {
    return (
      <div className="flex flex-col h-full bg-background rounded-2xl border border-primary/15 items-center justify-center gap-2 p-4 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Preparando conversación…</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden border border-primary/15 bg-background">
      <RealChatPanel conversation={safeConversation} />
    </div>
  );
}
