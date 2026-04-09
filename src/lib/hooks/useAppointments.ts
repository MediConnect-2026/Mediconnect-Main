/**
 * useAppointments.ts
 * Hook personalizado para gestionar las citas del paciente usando React Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';
import { getCitas, getCitasToDoctors } from '@/services/api/appointments.service';
import type { CitasListResponse, CitasFilters } from '@/types/AppointmentTypes';

/**
 * Hook para obtener las citas del paciente con React Query
 * 
 * @param filters - Filtros opcionales para la consulta
 * @param options - Opciones adicionales de React Query
 * @returns Query result con las citas, estados de carga y error
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useAppointments({
 *   estado: 'Programada',
 *   pagina: 1,
 *   limite: 10
 * });
 * ```
 */
export const useAppointments = (
  filters?: CitasFilters,
  userRole?: string,
  options?: Omit<UseQueryOptions<CitasListResponse>, 'queryKey' | 'queryFn'>
) => {
  const keyFilters = filters as unknown as Record<string, unknown> | undefined;

  return useQuery<CitasListResponse>({
    queryKey: [...QUERY_KEYS.CITAS(keyFilters), userRole ?? "PATIENT"],
    queryFn: () => userRole === "DOCTOR" ? getCitasToDoctors(filters) : userRole === "PACIENTE" ? getCitas(filters) : getCitas(filters),
    // Tiempo de cache específico para citas: 2 minutos
    staleTime: 1000 * 60 * 2,
    // Re-fetch más agresivo para citas (datos que cambian con frecuencia)
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchInterval: 30000, // Refetch cada 30 segundos
    refetchIntervalInBackground: true, // Refetch incluso si la pestaña no está activa
    ...options,
  });
};

/**
 * Hook para obtener citas con filtros específicos de fecha
 * 
 * @example
 * ```tsx
 * const { data } = useAppointmentsByDateRange('2026-01-01T00:00:00Z', '2026-01-31T23:59:59Z');
 * ```
 */
export const useAppointmentsByDateRange = (
  fechaDesde: string,
  fechaHasta: string,
  additionalFilters?: Omit<CitasFilters, 'fechaDesde' | 'fechaHasta'>
) => {
  return useAppointments({
    fechaDesde,
    fechaHasta,
    ...additionalFilters,
  });
};

/**
 * Hook para obtener citas por estado
 * 
 * @example
 * ```tsx
 * const { data } = useAppointmentsByStatus('Programada');
 * ```
 */
export const useAppointmentsByStatus = (
  estado: CitasFilters['estado'],
  additionalFilters?: Omit<CitasFilters, 'estado'>
) => {
  return useAppointments({
    estado,
    ...additionalFilters,
  });
};
