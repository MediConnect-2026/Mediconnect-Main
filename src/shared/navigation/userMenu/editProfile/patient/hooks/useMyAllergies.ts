import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { patientService } from '../services/patient.service';

/**
 * Hook para obtener las alergias del usuario actual
 * Los datos se actualizan en idioma actual pero no requieren refetch al cambiar idioma
 * ya que la invalidación se hace mediante mutaciones
 * 
 * @param options - Opciones de configuración del hook
 * @returns Query con las alergias del usuario
 * 
 * @example
 * const { data: myAllergies = [], isLoading } = useMyAllergies();
 */
export const useMyAllergies = (options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'es';

  return useQuery({
    queryKey: QUERY_KEYS.MY_ALLERGIES(language),
    queryFn: async () => {
      const response = await patientService.getMyAllergies(language);
      if (!response.success) {
        throw new Error(response.message || 'Error al cargar tus alergias');
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

export default useMyAllergies;
