import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { doctorService } from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service';
import type { Doctor } from '@/shared/navigation/userMenu/editProfile/doctor/services/doctor.types';
import { QUERY_KEYS } from '@/lib/react-query/config';

/**
 * Hook para obtener el perfil del doctor autenticado
 * 
 * Utiliza React Query para:
 * - Cache automático de datos (5 minutos por defecto)
 * - Refetch automático al reconectar
 * - Manejo de estados de loading y error
 * - Sincronización automática entre componentes
 * 
 * @param options - Opciones adicionales para el useQuery
 * @returns Query result con los datos del doctor
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data: doctor, isLoading, error, refetch } = useDoctorProfile();
 *   
 *   if (isLoading) return <div>Cargando...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *   
 *   return <div>{doctor?.nombre} {doctor?.apellido}</div>;
 * }
 * ```
 */
export function useDoctorProfile(
  options?: {
    enabled?: boolean;
    staleTime?: number;
    refetchInterval?: number | false;
  }
): UseQueryResult<Doctor, Error> {
  return useQuery<Doctor, Error>({
    queryKey: [...QUERY_KEYS.DOCTORS, 'me'],
    queryFn: async () => {
      const response = await doctorService.getProfile();
      return response.data;
    },
    staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutos por defecto
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled !== false,
  });
}
