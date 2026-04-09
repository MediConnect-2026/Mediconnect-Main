import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { doctorService } from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service';

/**
 * Hook para obtener los tipos de seguros disponibles del catálogo (Doctor)
 * Implementa caché agresivo ya que estos datos cambian raramente
 * 
 * @param options - Opciones de configuración del hook
 * @returns Query con los tipos de seguros disponibles
 * 
 * @example
 * const { data: insuranceTypes = [], isLoading } = useDoctorAvailableInsuranceTypes({ insuranceId: 1 });
 */
export const useDoctorAvailableInsuranceTypes = (options?: {
  insuranceId?: number;
  enabled?: boolean;
  staleTime?: number;
}) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'es';
  const selectedInsuranceId = options?.insuranceId;
  const isEnabled = (options?.enabled ?? true) && !!selectedInsuranceId;

  return useQuery({
    queryKey: selectedInsuranceId
      ? QUERY_KEYS.INSURANCE_TYPES_BY_INSURANCE(selectedInsuranceId, language)
      : QUERY_KEYS.INSURANCE_TYPES(language),
    queryFn: async () => {
      if (!selectedInsuranceId) {
        return [];
      }

      const response = await doctorService.getAvailableInsuranceTypes(selectedInsuranceId, language);
      if (!response.success) {
        throw new Error('Error al cargar tipos de seguros');
      }
      return response.data;
    },
    // Caché agresivo: 30 minutos
    staleTime: options?.staleTime ?? 1000 * 60 * 30,
    // Garbage collection: 1 hora
    gcTime: 1000 * 60 * 60,
    // No refetch automático (los datos son muy estables)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    enabled: isEnabled,
  });
};

export default useDoctorAvailableInsuranceTypes;
