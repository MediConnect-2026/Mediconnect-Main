/**
 * useCalendarCitas.ts
 * Hook personalizado para obtener el calendario de citas usando React Query
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { getCalendarioCitas } from '@/services/api/appointments.service';
import { QUERY_KEYS } from '@/lib/react-query/config';
import type { CalendarioResponse, CalendarioParams } from '@/types/AppointmentTypes';

interface UseCalendarCitasOptions {
  /**
   * Parámetros para la consulta del calendario
   */
  params?: CalendarioParams;
  /**
   * Si se debe ejecutar la consulta automáticamente
   */
  enabled?: boolean;
  /**
   * Tiempo de stale en milisegundos (por defecto 2 minutos para datos del calendario)
   */
  staleTime?: number;
  /**
   * Si se debe refetch al montar el componente
   */
  refetchOnMount?: boolean;
}

/**
 * Hook para obtener el calendario de citas del usuario autenticado
 * 
 * @param options - Opciones de configuración
 * @returns Query result con los datos del calendario
 * 
 * @example
 * ```tsx
 * const { data, isLoading, error } = useCalendarCitas({
 *   params: { vista: 'mes', fecha: '2026-03-09' },
 * });
 * ```
 */
export const useCalendarCitas = (
  options: UseCalendarCitasOptions = {}
): UseQueryResult<CalendarioResponse, Error> => {
  const {
    params,
    enabled = true,
    staleTime = 1000 * 60 * 2, // 2 minutos
    refetchOnMount = true,
  } = options;

  console.debug('useCalendarCitas - params:', params);
  const queryKeyParams = params
    ? (params as unknown as Record<string, unknown>)
    : undefined;

  return useQuery({
    queryKey: QUERY_KEYS.CALENDARIO(queryKeyParams),
    queryFn: () => getCalendarioCitas(params),
    enabled,
    staleTime,
    refetchOnMount,
    // Refetch cuando el usuario vuelve a la ventana (útil para ver actualizaciones de citas)
    refetchOnWindowFocus: true,
  });
};

export default useCalendarCitas;
