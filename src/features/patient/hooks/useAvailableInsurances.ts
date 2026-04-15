import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { doctorService } from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service';

/**
 * Hook para obtener los seguros disponibles del catálogo
 * Implementa caché agresivo ya que estos datos cambian raramente
 * 
 * @param options - Opciones de configuración del hook
 * @returns Query con los seguros disponibles
 * 
 * @example
 * const { data: insurances = [], isLoading } = useAvailableInsurances();
 */
export const useAvailableInsurances = (options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'es';

  return useQuery({
    queryKey: QUERY_KEYS.AVAILABLE_INSURANCES(language),
    queryFn: async () => {
      const response = await doctorService.getAvailableInsurances(language);
      if (!response.success) {
        throw new Error('Error al cargar seguros');
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
    enabled: options?.enabled ?? true,
  });
};

export default useAvailableInsurances;
