import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { patientService } from '../services/patient.service';
import type { CondicionMedica } from '../services/patient.types';

/**
 * Hook para obtener las alergias disponibles del catálogo
 * Implementa caché agresivo ya que estos datos cambian raramente
 * 
 * @param options - Opciones de configuración del hook
 * @returns Query con las alergias disponibles
 * 
 * @example
 * const { data: allergies = [], isLoading } = useAvailableAllergies();
 */
export const useAvailableAllergies = (options?: {
  enabled?: boolean;
  staleTime?: number;
}) => {
  const { i18n } = useTranslation();
  const language = i18n.language || 'es';

  return useQuery({
    queryKey: QUERY_KEYS.AVAILABLE_ALLERGIES(language),
    queryFn: async () => {
      const response = await patientService.getAvailableAllergies(language);
      if (!response.success) {
        throw new Error('Error al cargar alergias');
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
    // Transformar datos si es necesario
    select: (data: CondicionMedica[]) => {
      return data.map(allergy => ({
        value: allergy.id.toString(),
        label: allergy.nombre,
        ...allergy,
      }));
    },
  });
};

export default useAvailableAllergies;
