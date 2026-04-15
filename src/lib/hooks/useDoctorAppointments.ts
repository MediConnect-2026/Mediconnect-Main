/**
 * useDoctorAppointments.ts
 * Hook personalizado para obtener las citas del doctor autenticado usando React Query
 */

import { useQuery, keepPreviousData, type UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { getCitasToDoctors } from '@/services/api/appointments.service';
import type { CitasListResponse, CitasFilters } from '@/types/AppointmentTypes';

/**
 * Hook para obtener las citas del doctor con React Query
 * 
 * @param filters - Filtros opcionales para la consulta
 * @param options - Opciones adicionales de React Query
 * @returns Query result con las citas, estados de carga y error
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDoctorAppointments({
 *   estado: 'Programada',
 *   pagina: 1,
 *   limite: 10
 * });
 * ```
 */
export const useDoctorAppointments = (
  filters?: CitasFilters,
  options?: Omit<UseQueryOptions<CitasListResponse>, 'queryKey' | 'queryFn'>
) => {
  const keyFilters: Record<string, unknown> | undefined = filters
    ? ({ ...filters } as Record<string, unknown>)
    : undefined;

  return useQuery<CitasListResponse>({
    queryKey: QUERY_KEYS.CITAS(keyFilters),
    queryFn: () => getCitasToDoctors(filters),
    // Tiempo de cache específico para citas: 2 minutos
    staleTime: 1000 * 60 * 2,
    // Mantiene los datos de la página anterior visibles mientras carga la siguiente
    placeholderData: keepPreviousData,
    // Re-fetch más agresivo para citas (datos que cambian con frecuencia)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000, // Refetch cada 30 segundos
    refetchIntervalInBackground: true, // Refetch incluso si la pestaña no está activa
    ...options,
  });
};
