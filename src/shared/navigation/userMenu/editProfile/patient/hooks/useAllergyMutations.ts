import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { patientService } from '../services/patient.service';
import { emitAllergiesChanged } from '@/lib/events/clinicalHistoryEvents';

/**
 * Hook para agregar una alergia al historial del paciente
 * Invalida automáticamente el caché de "mis alergias"
 * 
 * @example
 * const addAllergy = useAddAllergy();
 * await addAllergy.mutateAsync({ condicionId: 123 });
 */
export const useAddAllergy = () => {
  const { t, i18n } = useTranslation('patient');
  const queryClient = useQueryClient();
  const language = i18n.language || 'es';

  return useMutation({
    mutationFn: async (data: { condicionId: number }) => {
      const response = await patientService.addAllergy(data);
      if (!response.success) {
        throw new Error(response.message || 'Error al agregar alergia');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidar el caché de mis alergias para forzar refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MY_ALLERGIES(language),
      });
      
      // Emitir evento para notificar a otros componentes
      emitAllergiesChanged();
      
      toast.success(
        t('clinicalHistory.allergyAdded', 'Alergia agregada exitosamente')
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t('clinicalHistory.errorAddingAllergy', 'Error al agregar alergia')
      );
    },
  });
};

/**
 * Hook para eliminar una alergia del historial del paciente
 * Invalida automáticamente el caché de "mis alergias"
 * 
 * @example
 * const removeAllergy = useRemoveAllergy();
 * await removeAllergy.mutateAsync(123);
 */
export const useRemoveAllergy = () => {
  const { t, i18n } = useTranslation('patient');
  const queryClient = useQueryClient();
  const language = i18n.language || 'es';

  return useMutation({
    mutationFn: async (condicionId: number) => {
      const response = await patientService.removeAllergy(condicionId);
      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar alergia');
      }
      return response;
    },
    onSuccess: () => {
      // Invalidar el caché de mis alergias para forzar refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MY_ALLERGIES(language),
      });
      
      // Emitir evento para notificar a otros componentes
      emitAllergiesChanged();
      
      toast.success(
        t('clinicalHistory.allergyRemoved', 'Alergia eliminada exitosamente')
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t('clinicalHistory.errorRemovingAllergy', 'Error al eliminar alergia')
      );
    },
  });
};
