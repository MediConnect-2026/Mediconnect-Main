import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { useGlobalUIStore } from '@/stores/useGlobalUIStore';
import { useTeleconsultStore } from '@/stores/useTeleconsultStore';
import { ROUTES } from '@/router/routes';
import teleconsultService from '@/services/api/teleconsult.service';
import { getUserAppRole } from '@/services/auth/auth.types';
import type DailyIframe from '@daily-co/daily-js';

/** Ref compartida para el callFrame de Daily (singleton por pestaña) */
export const dailyCallFrameRef: { current: ReturnType<typeof DailyIframe.createFrame> | null } = {
    current: null,
};

export const useTeleconsult = () => {
    const navigate = useNavigate();
    const user = useAppStore((state) => state.user);
    const setToast = useGlobalUIStore((state) => state.setToast);
    const { setCallSession, clearCallSession } = useTeleconsultStore();

    // Normalize the role using the same utility as the rest of the app
    const appRole = user ? getUserAppRole(user) : null;

    // Helper: extract room URL from response — service already unwraps the envelope
    const extractRoomUrl = (data: unknown): string | undefined => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = data as any;
        // Handles both clean { urlAcceso } and any legacy nesting just in case
        return d?.urlAcceso || d?.data?.urlAcceso || d?.url || d?.roomUrl || undefined;
    };

    // ─── JOIN CALL ────────────────────────────────────────────────────────────
    const joinMutation = useMutation({
        mutationFn: async (citaId: string) => {
            if (appRole === 'DOCTOR') {
                return teleconsultService.iniciarTeleconsulta(citaId);
            }
            // PATIENT (default)
            return teleconsultService.getAccessUrl(citaId);
        },
        onSuccess: (data, citaId) => {
            const roomUrl = extractRoomUrl(data);

            if (!roomUrl) {
                console.error('[Teleconsult] Backend response missing room URL. Keys received:', Object.keys(data ?? {}), 'Full data:', data);
                setToast({
                    message: 'No se recibió la URL de la sala. Contacta al soporte técnico.',
                    type: 'error',
                    open: true,
                });
                return;
            }

            // Store URL in Zustand (reliable) AND router state (redundant backup)
            setCallSession(citaId, roomUrl);
            const roomPath = ROUTES.TELECONSULT.ROOM.replace(':appointmentId', citaId);
            navigate(roomPath, { state: { urlAcceso: roomUrl } });
        },
        onError: (error) => {
            console.error('[Teleconsult] Join mutation error:', error);
            setToast({
                message: 'No se pudo conectar a la teleconsulta. Intenta de nuevo.',
                type: 'error',
                open: true,
            });
        },
    });

    // ─── END CALL ─────────────────────────────────────────────────────────────
    const endMutation = useMutation({
        mutationFn: async (citaId: string) => {
            await teleconsultService.finalizarTeleconsulta(citaId);
        },
        onSuccess: () => {
            if (dailyCallFrameRef.current) {
                dailyCallFrameRef.current.destroy();
                dailyCallFrameRef.current = null;
            }
            clearCallSession();
            navigate(ROUTES.COMMON.DASHBOARD);
        },
        onError: () => {
            // Even on error, destroy the frame and redirect
            if (dailyCallFrameRef.current) {
                dailyCallFrameRef.current.destroy();
                dailyCallFrameRef.current = null;
            }
            clearCallSession();
            navigate(ROUTES.COMMON.DASHBOARD);
        },
    });

    return {
        joinCall: (citaId: string) => joinMutation.mutate(citaId),
        isJoining: joinMutation.isPending,
        endCall: (citaId: string) => endMutation.mutate(citaId),
        isEnding: endMutation.isPending,
    };
};

export default useTeleconsult;
