import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { chatService } from "@/services/chat";
import { useAppStore } from "@/stores/useAppStore";
import { QUERY_KEYS } from "@/lib/react-query/config";

/**
 * Hook para iniciar o reanudar una conversación con otro usuario.
 * Si ya existe una conversación con ese usuario se reutiliza.
 * 
 * @example
 * // En el perfil de un doctor o tarjeta de paciente:
 * const { startConversation, isLoading } = useStartConversation();
 * 
 * <button onClick={() => startConversation(doctorId)}>
 *   Enviar mensaje
 * </button>
 */
export const useStartConversation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const setActiveConversation = useAppStore((state) => state.setActiveConversation);

  const mutation = useMutation({
    mutationFn: (receptorId: number) =>
      chatService.getOrCreateConversation(receptorId),

    onSuccess: (response) => {
      const conversacionId = response.data.id;

      // Refrescar lista para reflejar nuevas o reanudadas conversaciones inmediatamente
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CONVERSATIONS });

      // Activar la conversación y navegar
      setActiveConversation(conversacionId);
      navigate(`/chat/${conversacionId}`, {
        state: { openingConversation: true },
      });
    },
  });

  return {
    startConversation: (receptorId: number) => mutation.mutate(receptorId),
    isLoading: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
  };
};
