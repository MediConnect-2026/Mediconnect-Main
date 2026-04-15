/**
 * doctor-stats.service.ts
 * Servicio para obtener las estadísticas del doctor
 */
import apiClient from './client';
import API_ENDPOINTS from './endpoints';
import type {
  DoctorStatsResumen,
  DoctorStatsResponse,
  DoctorServicesUtilizadosResponse,
  DoctorProductividadRawResponse,
  DoctorServicesStats,
  DoctorServicesStatsResponse,
  ServicioUtilizado,
  ProductividadDato,
  DoctorPatientsStats,
  DoctorPatientsStatsResponse,
} from '@/types/DoctorStatsTypes';

/**
 * Obtiene el resumen de estadísticas del doctor autenticado
 * @returns Promise con el resumen de estadísticas
 *
 * @example
 * ```tsx
 * const stats = await getDoctorStatsResumen();
 * console.log(stats.totalPacientes, stats.totalCitas, stats.totalGanancias);
 * ```
 */
export const getDoctorStatsResumen = async (): Promise<DoctorStatsResumen> => {
  try {
    const { data } = await apiClient.get<DoctorStatsResponse>(
      API_ENDPOINTS.DOCTOR_STATS.RESUMEN
    );
    return data.data;
  } catch (error) {
    console.error('Error fetching doctor stats resumen:', error);
    throw error;
  }
};

/**
 * Obtiene las estadísticas de productividad del doctor
 * @param periodo - Período de análisis: "semana" | "mes" | "3meses" | "año" | "todo"
 * @returns Promise con datos de productividad transformados
 * 
 * Transforma la respuesta del backend:
 * { label, consultas, ingresos } → { day, consultas, ingresos }
 */
export const getDoctorProductivity = async (periodo?: string): Promise<ProductividadDato[]> => {
  try {
    const params = new URLSearchParams();
    if (periodo) {
      params.append('periodo', periodo);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.DOCTOR_STATS.PRODUCTIVIDAD}?${queryString}`
      : API_ENDPOINTS.DOCTOR_STATS.PRODUCTIVIDAD;

    const { data } = await apiClient.get<DoctorProductividadRawResponse>(url);

    // Transformar puntos del backend (label) a formato esperado por AreaChart (day)
    return data.puntos.map((punto) => ({
      day: punto.label,
      consultas: punto.consultas,
      ingresos: punto.ingresos,
    }));
  } catch (error) {
    console.error('Error fetching doctor productivity stats:', error);
    throw error;
  }
};

/**
 * Obtiene los servicios más utilizados del doctor
 * @returns Promise con datos de servicios más utilizados
 */
export const getDoctorMostUsedServices = async (language?: string, source?: string, translate_fields?: string): Promise<ServicioUtilizado[]> => {
  try {
    const params = new URLSearchParams();
    if (language) {
      params.append('target', language);
    }
    if (source) {
      params.append('source', source);
    }
    if (translate_fields) {
      params.append('translate_fields', translate_fields);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.DOCTOR_STATS.SERVICIOS_UTILIZADOS}?${queryString}`
      : API_ENDPOINTS.DOCTOR_STATS.SERVICIOS_UTILIZADOS;

    const { data } = await apiClient.get<DoctorServicesUtilizadosResponse>(url);

    // Transformar datos para que sean compatibles con PieChart
    // Si el backend no incluye 'color', generamos colores automáticamente
    const colors = [
      'hsl(var(--chart-1))',
      'hsl(var(--chart-2))',
      'hsl(var(--chart-3))',
      'hsl(var(--chart-4))',
      'hsl(var(--chart-5))',
      'hsl(var(--chart-6))',
    ];

    return data.masUtilizados.map((servicio, index) => ({
      ...servicio,
      color: servicio.color || colors[index % colors.length],
    }));
  } catch (error) {
    console.error('Error fetching doctor most used services:', error);
    throw error;
  }
};

/**
 * Obtiene las estadísticas de citas del doctor
 * @returns Promise con datos de citas
 */
export const getDoctorCitasStats = async () => {
  try {
    const { data } = await apiClient.get(
      API_ENDPOINTS.DOCTOR_STATS.CITAS
    );
    return data.data;
  } catch (error) {
    console.error('Error fetching doctor citas stats:', error);
    throw error;
  }
};

/**
 * Obtiene las estadísticas de pacientes del doctor
 * @returns Promise con datos de pacientes
 *
 * @example
 * ```tsx
 * const stats = await getDoctorPatientsStats();
 * console.log(stats.totalPacientes, stats.edadPromedio, stats.pacientesConAlergias);
 * ```
 */
export const getDoctorPatientsStats = async (): Promise<DoctorPatientsStats> => {
  try {
    const { data } = await apiClient.get<DoctorPatientsStatsResponse>(
      API_ENDPOINTS.DOCTOR_STATS.PACIENTES
    );
    return data.data;
  } catch (error) {
    console.error('Error fetching doctor patients stats:', error);
    throw error;
  }
};

/**
 * Obtiene las estadísticas de servicios del doctor
 * @returns Promise con datos de servicios (total, activos, inactivos, promedio rating)
 * 
 * @example
 * ```tsx
 * const stats = await getDoctorServicesStats();
 * console.log(stats.totalServicios, stats.serviciosActivos, stats.promedioRating);
 * ```
 */
export const getDoctorServicesStats = async (): Promise<DoctorServicesStats> => {
  try {
    const { data } = await apiClient.get<DoctorServicesStatsResponse>(
      API_ENDPOINTS.DOCTOR_STATS.SERVICIOS
    );
    return data.data;
  } catch (error) {
    console.error('Error fetching doctor services stats:', error);
    throw error;
  }
};
