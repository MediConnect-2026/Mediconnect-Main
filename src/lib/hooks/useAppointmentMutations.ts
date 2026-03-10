/**
 * useAppointmentMutations.ts
 * Custom hooks for appointment mutations (cancel, reschedule, etc.)
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelCita } from '@/services/api/appointments.service';
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

/**
 * Hook para reagendar una cita (placeholder para futura implementación)
 * 
 * @example
 * ```tsx
 * const { mutate: rescheduleAppointment } = useRescheduleAppointment();
 * ```
 */
export const useRescheduleAppointment = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('patient');

  return useMutation({
    mutationFn: async (_data: any) => {
      // TODO: Implementar servicio de reagendamiento cuando esté disponible
      throw new Error('Reschedule service not implemented yet');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CITAS() });
      toast.success(t('appointments.rescheduleSuccess'));
    },
    onError: (error) => {
      console.error('Error rescheduling appointment:', error);
      toast.error(t('appointments.error'));
    },
  });
};
