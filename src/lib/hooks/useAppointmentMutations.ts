/**
 * useAppointmentMutations.ts
 * Custom hooks for appointment mutations (cancel, reschedule, etc.)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelCita } from '@/services/api/appointments.service';
import { patientService } from '@/shared/navigation/userMenu/editProfile/patient/services/patient.service';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface CancelAppointmentVariables {
  appointmentId: string;
  reason: string;
}

/**
 * Hook para cancelar una cita
 *
 * @example
 * ```tsx
 * const { mutate: cancelAppointment, isPending } = useCancelAppointment();
 *
 * cancelAppointment({
 *   appointmentId: '123',
 *   reason: 'No puedo asistir'
 * });
 * ```
 */
export const useCancelAppointment = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('patient');

  return useMutation({
    mutationFn: async ({ appointmentId, reason }: CancelAppointmentVariables) => {
      return await cancelCita(appointmentId, reason);
    },
    onMutate: async ({ appointmentId }) => {
      // Cancelar queries en progreso
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CITAS() });

      // Snapshot del estado anterior
      const previousAppointments = queryClient.getQueryData(QUERY_KEYS.CITAS());

      // Optimistic update: actualizar el estado de la cita localmente
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.CITAS() }, (old: any) => {
        if (!old?.data) return old;

        const updateAppointment = (appointment: any) => {
          if (appointment.id.toString() === appointmentId) {
            return { ...appointment, estado: 'Cancelada' };
          }
          return appointment;
        };

        return {
          ...old,
          data: Array.isArray(old.data)
            ? old.data.map(updateAppointment)
            : updateAppointment(old.data)
        };
      });

      return { previousAppointments };
    },
    onError: (error, _variables, context) => {
      // Revertir al estado anterior en caso de error
      if (context?.previousAppointments) {
        queryClient.setQueryData(
          QUERY_KEYS.CITAS(),
          context.previousAppointments
        );
      }

      console.error('Error cancelling appointment:', error);
      toast.error(t('myAppointments.cancelError'));
    },
    onSuccess: () => {
      // Invalidar queries para refetch desde el servidor
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CITAS() });

      toast.success(t('myAppointments.cancelSuccess'));
    },
  });
};

// ─── Reschedule ───────────────────────────────────────────────────────────────

interface RescheduleVariables {
  /** ID de la cita a reprogramar (string porque así viene de los call-sites) */
  appointmentId: string;
  /** ID del horario seleccionado */
  horarioId: number;
  /** Fecha nueva en formato YYYY-MM-DD */
  fecha: string;
  /** Hora nueva en formato HH:mm (24h) */
  hora: string;
}

/**
 * Hook para reagendar una cita.
 * Llama a PATCH /citas/{id}/reprogramar con { horarioId, fecha, hora }.
 * Aplica optimistic update (estado → "Reprogramada") e invalida el caché al resolver.
 *
 * @example
 * ```tsx
 * const { mutate, isPending } = useRescheduleAppointment();
 *
 * mutate({ appointmentId: '5', horarioId: 3, fecha: '2026-03-20', hora: '10:00' });
 * ```
 */
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('patient');

  return useMutation({
    mutationFn: ({ appointmentId, horarioId, fecha, hora }: RescheduleVariables) =>
      patientService.rescheduleAppointment(Number(appointmentId), {
        horarioId,
        fecha,
        hora,
      }),

    onMutate: async ({ appointmentId }) => {
      // Cancelar queries en vuelo para evitar override del optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.CITAS() });

      const previousAppointments = queryClient.getQueryData(QUERY_KEYS.CITAS());

      // Optimistic update: marcar la cita como reprogramada
      queryClient.setQueriesData({ queryKey: QUERY_KEYS.CITAS() }, (old: any) => {
        if (!old?.data) return old;

        const update = (appointment: any) =>
          appointment.id.toString() === appointmentId
            ? { ...appointment, estado: 'Reprogramada' }
            : appointment;

        return {
          ...old,
          data: Array.isArray(old.data) ? old.data.map(update) : update(old.data),
        };
      });

      return { previousAppointments };
    },

    onError: (error, _vars, context) => {
      // Revertir snapshot al estado anterior
      if (context?.previousAppointments) {
        queryClient.setQueryData(QUERY_KEYS.CITAS(), context.previousAppointments);
      }
      console.error('Error rescheduling appointment:', error);
      toast.error(t('appointments.error', 'Error al reprogramar la cita'));
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CITAS() });
      toast.success(t('appointments.rescheduleSuccess', 'Cita reprogramada correctamente'));
    },
  });
};
