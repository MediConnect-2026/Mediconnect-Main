/**
 * useMyDoctors.ts
 * Hook personalizado para obtener la lista de doctores con los que el paciente ha tenido citas
 */
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getMisDoctores } from '@/services/api/appointments.service';
import { QUERY_KEYS } from '@/lib/react-query/config';
import type { MyDoctorsResponse, MyDoctorsFilters } from '@/types/AppointmentTypes';
import { useTranslation } from 'react-i18next';

/**
 * Hook para obtener la lista de doctores con los que el paciente ha tenido citas
 * Incluye soporte para traducción automática de campos mediante i18n
 * 
 * @param filters - Filtros opcionales para traducción
 * @param options - Opciones adicionales de react-query
 * @returns Query de react-query con la lista de doctores
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useMyDoctors();
 * 
 * // Con traducción automática
 * const { data } = useMyDoctors({ 
 *   target: 'en',
 *   translate_fields: 'nombre,apellido,especialidadPrincipal.nombre' 
 * });
 * ```
 */
export function useMyDoctors(
  filters?: MyDoctorsFilters,
  options?: Omit<UseQueryOptions<MyDoctorsResponse>, 'queryKey' | 'queryFn'>
) {
  const { i18n } = useTranslation();

  // Configurar traducción automática basada en el idioma actual
  const finalFilters: MyDoctorsFilters = {
    target: i18n.language,
    source: 'es',
    translate_fields: 'especialidadPrincipal.nombre',
    ...filters,
  };

  return useQuery<MyDoctorsResponse>({
    queryKey: QUERY_KEYS.MY_DOCTORS(finalFilters),
    queryFn: () => getMisDoctores(finalFilters),
    staleTime: 1000 * 60 * 5, // 5 minutos
    ...options,
  });
}
