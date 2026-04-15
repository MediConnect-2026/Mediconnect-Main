/**
 * useDoctorStats.ts
 * Hook personalizado para obtener las estadísticas del doctor usando React Query
 */

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';
import {
  getDoctorStatsResumen,
  getDoctorProductivity,
  getDoctorMostUsedServices,
  getDoctorCitasStats,
  getDoctorPatientsStats,
  getDoctorServicesStats,
} from '@/services/api/doctor-stats.service';
import type {
  DoctorPatientsStats,
  DoctorStatsResumen,
  DoctorServicesStats,
  ProductividadDato,
  ServicioUtilizado,
} from '@/types/DoctorStatsTypes';

type DoctorCitasStatsData = Awaited<ReturnType<typeof getDoctorCitasStats>>;

/**
 * Hook para obtener el resumen de estadísticas del doctor
 *
 * @param options - Opciones adicionales de React Query
 * @returns Query result con las estadísticas del doctor
 *
 * @example
 * ```tsx
 * const { data, isLoading, error } = useDoctorStatsResumen();
 * 
 * if (isLoading) return <div>Cargando...</div>;
 * if (error) return <div>Error: {error.message}</div>;
 * 
 * return (
 *   <div>
 *     <p>Total Pacientes: {data?.totalPacientes}</p>
 *     <p>Total Citas: {data?.totalCitas}</p>
 *     <p>Total Ganancias: {data?.totalGanancias}</p>
 *   </div>
 * );
 * ```
 */
export const useDoctorStatsResumen = (
  options?: Omit<UseQueryOptions<DoctorStatsResumen>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<DoctorStatsResumen>({
    queryKey: QUERY_KEYS.DOCTOR_STATS_RESUMEN,
    queryFn: getDoctorStatsResumen,
    // Tiempo de cache específico para estadísticas: 5 minutos
    staleTime: 1000 * 60 * 5,
    // GC Time: 10 minutos
    gcTime: 1000 * 60 * 10,
    // Reintentar una vez en caso de error
    retry: 1,
    // Re-fetch al volver a la ventana (datos pueden cambiar)
    refetchOnWindowFocus: true,
    // Re-fetch al reconectar a internet
    refetchOnReconnect: true,
    // No re-fetch automático al montar si los datos son frescos
    refetchOnMount: false,
    ...options,
  });
};

/**
 * Hook para obtener las estadísticas de productividad del doctor
 *
 * @param periodo - Período de análisis: "semana" | "mes" | "3meses" | "año" | "todo"
 * @param options - Opciones adicionales de React Query
 * @returns Query result con datos de productividad (array de ProductividadDato)
 * 
 * @example
 * ```tsx
 * const { data: productividadData, isLoading } = useDoctorProductivity("mes");
 * 
 * // data es un array de: { day: string; consultas: number; ingresos: number }[]
 * ```
 */
export const useDoctorProductivity = (
  periodo?: string,
  options?: Omit<UseQueryOptions<ProductividadDato[]>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<ProductividadDato[]>({
    queryKey: [QUERY_KEYS.DOCTOR_STATS_PRODUCTIVIDAD, periodo].filter(Boolean),
    queryFn: () => getDoctorProductivity(periodo),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
};

/**
 * Hook para obtener los servicios más utilizados del doctor
 *
 * @param options - Opciones adicionales de React Query
 * @returns Query result con datos de servicios más utilizados (compatibles con PieChart)
 * 
 * @example
 * ```tsx
 * const { data: servicios, isLoading } = useDoctorMostUsedServices();
 * 
 * // data es un array de: { nombre: string; valor: number; color: string }[]
 * // Los datos están listos para pasar al componente PieServices
 * ```
 */
export const useDoctorMostUsedServices = (
  language?: string,
  options?: Omit<UseQueryOptions<ServicioUtilizado[]>, 'queryKey' | 'queryFn'>
) => {

  const languageToTraslate = language === "en" ? "en" : "es";
  const source = language === "en" ? "es" : "en";
  const translate_fields = "masUtilizados.nombre";

  return useQuery<ServicioUtilizado[]>({
    queryKey: [QUERY_KEYS.DOCTOR_STATS_SERVICIOS_UTILIZADOS, language],
    queryFn: () => getDoctorMostUsedServices(languageToTraslate, source, translate_fields),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
};

/**
 * Hook para obtener las estadísticas de citas del doctor
 *
 * @param options - Opciones adicionales de React Query
 * @returns Query result con datos de citas
 */
export const useDoctorCitasStats = (
  options?: Omit<UseQueryOptions<DoctorCitasStatsData>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<DoctorCitasStatsData>({
    queryKey: QUERY_KEYS.DOCTOR_STATS_CITAS,
    queryFn: getDoctorCitasStats,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
};

/**
 * Hook para obtener las estadísticas de pacientes del doctor
 *
 * @param options - Opciones adicionales de React Query
 * @returns Query result con datos de pacientes
 */
export const useDoctorPatientsStats = (
  options?: Omit<UseQueryOptions<DoctorPatientsStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<DoctorPatientsStats>({
    queryKey: QUERY_KEYS.DOCTOR_STATS_PACIENTES,
    queryFn: getDoctorPatientsStats,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
};

/**
 * Hook para obtener las estadísticas de servicios del doctor
 *
 * @param options - Opciones adicionales de React Query
 * @returns Query result con datos de servicios (total, activos, inactivos, promedio rating)
 *
 * @example
 * ```tsx
 * const { data: servicesStats, isLoading } = useDoctorServicesStats();
 * 
 * return (
 *   <div>
 *     <p>Total Servicios: {servicesStats?.totalServicios}</p>
 *     <p>Activos: {servicesStats?.serviciosActivos}</p>
 *     <p>Rating Promedio: {servicesStats?.promedioRating}</p>
 *   </div>
 * );
 * ```
 */
export const useDoctorServicesStats = (
  options?: Omit<UseQueryOptions<DoctorServicesStats>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<DoctorServicesStats>({
    queryKey: QUERY_KEYS.DOCTOR_STATS_SERVICIOS,
    queryFn: getDoctorServicesStats,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    ...options,
  });
};
