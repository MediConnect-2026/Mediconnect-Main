import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { patientService } from '../services/patient.service';

/**
 * Hook para obtener las condiciones médicas del usuario actual
 * Los datos se actualizan en idioma actual pero no requieren refetch al cambiar idioma
 * ya que la invalidación se hace mediante mutaciones
 * 
 * @param options - Opciones de configuración del hook
 * @returns Query con las condiciones médicas del usuario
 * 
 * @example
 * const { data: myConditions = [], isLoading } = useMyConditions();
 */
export const useMyConditions = (options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'es';

  return useQuery({
    queryKey: QUERY_KEYS.MY_CONDITIONS(language),
    queryFn: async () => {
      const response = await patientService.getMyConditions(language);
      if (!response.success) {
        throw new Error(response.message || 'Error al cargar tus condiciones médicas');
      }
      return response.data;
    },
    // Caché moderado: 5 minutos (puede cambiar con más frecuencia que el catálogo)
    staleTime: options?.staleTime ?? 1000 * 60 * 5,
    // Garbage collection: 10 minutos
    gcTime: 1000 * 60 * 10,
    // Refetch al enfocar la ventana para tener datos actualizados
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    enabled: options?.enabled ?? true,
  });
};

export default useMyConditions;
