import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { patientService } from '@/shared/navigation/userMenu/editProfile/patient/services/patient.service';

/**
 * Hook para agregar un seguro al perfil del paciente
 * Invalida automáticamente el caché de "mis seguros"
 * 
 * @example
 * const addInsurance = useAddInsurance();
 * await addInsurance.mutateAsync({ idSeguro: 123, idTipoSeguro: 1 });
 */
export const useAddInsurance = () => {
  const { t, i18n } = useTranslation('patient');
  const queryClient = useQueryClient();
  const language = i18n.language || 'es';

  return useMutation({
    mutationFn: async (data: { idSeguro: number; idTipoSeguro: number }) => {
      const response = await patientService.addInsurance(data);
      if (!response.success) {
        throw new Error(response.message || 'Error al agregar seguro');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidar el caché de mis seguros para forzar refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MY_INSURANCES(language),
      });
      
      toast.success(
        t('insurance.added', 'Seguro agregado exitosamente')
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t('insurance.errorAdding', 'Error al agregar seguro')
      );
    },
  });
};

/**
 * Hook para eliminar un seguro del perfil del paciente
 * Invalida automáticamente el caché de "mis seguros"
 * 
 * @example
 * const removeInsurance = useRemoveInsurance();
 * await removeInsurance.mutateAsync(123);
 */
export const useRemoveInsurance = () => {
  const { t, i18n } = useTranslation('patient');
  const queryClient = useQueryClient();
  const language = i18n.language || 'es';

  return useMutation({
    mutationFn: async (seguroId: number) => {
      const response = await patientService.removeInsurance(seguroId);
      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar seguro');
      }
      return response;
    },
    onSuccess: () => {
      // Invalidar el caché de mis seguros para forzar refetch
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.MY_INSURANCES(language),
      });
      
      toast.success(
        t('insurance.removed', 'Seguro eliminado exitosamente')
      );
    },
    onError: (error: Error) => {
      toast.error(
        error.message || t('insurance.errorRemoving', 'Error al eliminar seguro')
      );
    },
  });
};
