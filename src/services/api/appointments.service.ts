/**
 * appointments.service.ts
 * Servicio para gestionar las citas del paciente
 */
import apiClient from './client';
import API_ENDPOINTS from './endpoints';
import type {
  CitasListResponse,
  CitasFilters,
  CalendarioResponse,
  CalendarioParams,
  MyDoctorsResponse,
  MyDoctorsFilters,
  CitasListResponseforView
} from '@/types/AppointmentTypes';
import type {
  MisPacientesResponse,
  FiltrosPacientes,
  DoctorPatientInfoFilters,
  DoctorPatientInfoResponse,
} from '@/types/DoctorStatsTypes';

/**
 * Obtiene todas las citas del paciente autenticado con soporte para filtros y paginación
 * @param filters - Filtros opcionales para la consulta
 * @returns Promise con la lista de citas y paginación
 */
export const getCitas = async (filters?: CitasFilters): Promise<CitasListResponse> => {
  const params = new URLSearchParams();

  if (filters?.estado) {
    params.append('estado', filters.estado);
  }
  if (filters?.fechaDesde) {
    params.append('fechaDesde', filters.fechaDesde);
  }
  if (filters?.fechaHasta) {
    params.append('fechaHasta', filters.fechaHasta);
  }
  if (filters?.pagina) {
    params.append('pagina', filters.pagina.toString());
  }
  if (filters?.limite) {
    params.append('limite', filters.limite.toString());
  }
  if (filters?.target) {
    params.append('target', filters.target);
  }
  if (filters?.source) {
    params.append('source', filters.source);
  }
  if (filters?.translate_fields) {
    params.append('translate_fields', filters.translate_fields);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.CITAS.LIST}?${queryString}`
    : API_ENDPOINTS.CITAS.LIST;

  const { data } = await apiClient.get<CitasListResponse>(url);
  return data;
};


export const getCitasToDoctors = async (filters?: CitasFilters) => {
  const params = new URLSearchParams();

  if (filters?.estado) {
    params.append('estado', filters.estado);
  }
  if (filters?.fechaDesde) {
    params.append('fechaDesde', filters.fechaDesde);
  }
  if (filters?.fechaHasta) {
    params.append('fechaHasta', filters.fechaHasta);
  }
  if (filters?.pagina) {
    params.append('pagina', filters.pagina.toString());
  }
  if (filters?.limite) {
    params.append('limite', filters.limite.toString());
  }
  if (filters?.target) {
    params.append('target', filters.target);
  }
  if (filters?.source) {
    params.append('source', filters.source);
  }
  if (filters?.translate_fields) {
    params.append('translate_fields', filters.translate_fields);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.CITAS.TO_DOCTORS}?${queryString}`
    : API_ENDPOINTS.CITAS.TO_DOCTORS;

  const { data } = await apiClient.get<CitasListResponse>(url);
  return data;
}

/**
 * Obtiene una cita específica por ID
 * @param id - ID de la cita
 * @returns Promise con los detalles de la cita
 */
export const getCitaById = async (id: string | number, params?: any): Promise<CitasListResponseforView> => {
  const { data } = await apiClient.get<CitasListResponseforView>(API_ENDPOINTS.CITAS.BY_ID(id), { params });
  return data;
};



export const cancelCita = async (id: string | number, motivo: string) => {
  try {
    const { data } = await apiClient.patch(API_ENDPOINTS.CITAS.CANCEL(id), { motivoCancelacion: motivo });
    return data;
  } catch (error) {
    console.error('Error cancelando la cita:', error);
    throw error;
  }
}

/**
 * Obtiene el calendario de citas del usuario autenticado
 * @param params - Parámetros de vista y fecha
 * @returns Promise con las citas agrupadas por fecha
 */
export const getCalendarioCitas = async (params?: CalendarioParams): Promise<CalendarioResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.vista) {
    searchParams.append('vista', params.vista);
  }
  if (params?.fecha) {
    searchParams.append('fecha', params.fecha);
  }
  if (params?.target) {
    searchParams.append('target', params.target);
  }
  if (params?.source) {
    searchParams.append('source', params.source);
  }
  if (params?.translate_fields) {
    searchParams.append('translate_fields', params.translate_fields);
  }

  const queryString = searchParams.toString();
  const url = queryString
    ? `${API_ENDPOINTS.CITAS.CALENDARIO}?${queryString}`
    : API_ENDPOINTS.CITAS.CALENDARIO;

  const { data } = await apiClient.get<CalendarioResponse>(url);
  return data;
};

/**
 * Obtiene la lista de doctores con los que el paciente ha tenido citas
 * @param filters - Filtros opcionales para traducción
 * @returns Promise con la lista de doctores
 */
export const getMisDoctores = async (filters?: MyDoctorsFilters): Promise<MyDoctorsResponse> => {
  const params = new URLSearchParams();

  if (filters?.target) {
    params.append('target', filters.target);
  }
  if (filters?.source) {
    params.append('source', filters.source);
  }
  if (filters?.translate_fields) {
    params.append('translate_fields', filters.translate_fields);
  }

  const queryString = params.toString();
  const url = queryString
    ? `${API_ENDPOINTS.CITAS.MIS_DOCTORES}?${queryString}`
    : API_ENDPOINTS.CITAS.MIS_DOCTORES;

  const { data } = await apiClient.get<MyDoctorsResponse>(url);
  return data;
};

/**
 * Obtiene la lista de pacientes del doctor autenticado con filtros avanzados y paginación
 * @param filters - Filtros y paginación opcionales
 * @returns Promise con la lista de pacientes y información de paginación
 *
 * @example
 * ```tsx
 * // Sin filtros
 * const response = await getDoctorPatients();
 *
 * // Con paginación
 * const response = await getDoctorPatients({ pagina: 1, limite: 10 });
 *
 * // Con búsqueda y filtros
 * const response = await getDoctorPatients({
 *   buscar: "Carlos",
 *   genero: "M",
 *   pagina: 1,
 *   limite: 20
 * });
 * ```
 */
export const getDoctorPatients = async (filters?: FiltrosPacientes): Promise<MisPacientesResponse> => {
  try {
    const params = new URLSearchParams();

    // Paginación
    if (filters?.pagina) {
      params.append('pagina', filters.pagina.toString());
    }
    if (filters?.limite) {
      params.append('limite', filters.limite.toString());
    }

    // Búsqueda
    if (filters?.buscar) {
      params.append('buscar', filters.buscar);
    }

    // Filtros de demográficos
    if (filters?.genero) {
      params.append('genero', filters.genero);
    }

    // Filtros de condiciones y alergias
    if (filters?.condicionId) {
      params.append('condicionId', filters.condicionId.toString());
    }
    if (filters?.alergiaId) {
      params.append('alergiaId', filters.alergiaId.toString());
    }
    if (filters?.tieneCondiciones !== undefined) {
      params.append('tieneCondiciones', filters.tieneCondiciones.toString());
    }
    if (filters?.tieneAlergias !== undefined) {
      params.append('tieneAlergias', filters.tieneAlergias.toString());
    }

    // Filtros de servicios
    if (filters?.especialidadId) {
      params.append('especialidadId', filters.especialidadId.toString());
    }
    if (filters?.servicioId) {
      params.append('servicioId', filters.servicioId.toString());
    }
    if (filters?.ubicacionId) {
      params.append('ubicacionId', filters.ubicacionId.toString());
    }

    // Filtros de fecha
    if (filters?.ultimaCitaDesde) {
      params.append('ultimaCitaDesde', filters.ultimaCitaDesde);
    }
    if (filters?.ultimaCitaHasta) {
      params.append('ultimaCitaHasta', filters.ultimaCitaHasta);
    }

    // Filtros de traducción
    if (filters?.target) {
      params.append('target', filters.target);
    }
    if (filters?.source) {
      params.append('source', filters.source);
    }
    if (filters?.translate_fields) {
      params.append('translate_fields', filters.translate_fields);
    }

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.CITAS.MIS_PACIENTES}?${queryString}`
      : API_ENDPOINTS.CITAS.MIS_PACIENTES;

    const { data } = await apiClient.get<MisPacientesResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching doctor patients:', error);
    throw error;
  }
};

/**
 * Obtiene la información detallada de un paciente del doctor
 * @param pacienteId - ID del paciente
 * @param filters - Parámetros opcionales para traducción
 * @returns Promise con la información detallada del paciente
 */
export const getDoctorPatientInfo = async (
  pacienteId: string | number,
  filters?: DoctorPatientInfoFilters
): Promise<DoctorPatientInfoResponse> => {
  try {
    const params = new URLSearchParams();

    if (filters?.target) {
      params.append('target', filters.target);
    }
    if (filters?.source) {
      params.append('source', filters.source);
    }
    if (filters?.translate_fields) {
      params.append('translate_fields', filters.translate_fields);
    }

    const queryString = params.toString();
    const baseUrl = API_ENDPOINTS.DOCTORES.PACIENTE_INFO(pacienteId);
    const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

    const { data } = await apiClient.get<DoctorPatientInfoResponse>(url);
    return data;
  } catch (error) {
    console.error('Error fetching doctor patient info:', error);
    throw error;
  }
};

// ─── Diagnóstico de una cita ──────────────────────────────────────────────────

export interface DiagnosticarPayload {
  /** Nombre / título del diagnóstico */
  nombreDiagnostico: string;
  /** Descripción detallada del diagnóstico (puede contener HTML de RichText) */
  descripcionDiagnostico: string;
  /** Imágenes adjuntas (máx. 10, 10 MB c/u) */
  archivos?: File[];
}

export interface DiagnosticarResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Envía el diagnóstico de una cita al backend.
 * Construye `multipart/form-data` con los campos y archivos adjuntos.
 * El interceptor de `client.ts` elimina automáticamente `Content-Type`
 * para que axios incluya el boundary correcto.
 *
 * @param citaId - ID de la cita activa
 * @param payload - Datos del diagnóstico
 */
export const diagnosticarCita = async (
  citaId: string | number,
  payload: DiagnosticarPayload,
): Promise<DiagnosticarResponse> => {
  const formData = new FormData();

  formData.append('nombreDiagnostico', payload.nombreDiagnostico);
  formData.append('descripcionDiagnostico', payload.descripcionDiagnostico);

  if (payload.archivos && payload.archivos.length > 0) {
    payload.archivos.forEach((file) => {
      formData.append('archivos', file);
    });
  }

  const { data } = await apiClient.post<DiagnosticarResponse>(
    API_ENDPOINTS.CITAS.DIAGNOSTICAR(citaId),
    formData,
  );

  return data;
};

/**
 * Obtiene el historial de citas/diagnósticos de un paciente según su ID
 * @param pacienteId - ID del paciente
 * @param params - Parámetros de paginación o filtros
 * @returns Promise con la lista del historial y la paginación
 */
export const getHistorialByPacienteId = async (
  pacienteId: string | number,
  params?: any
) => {
  const { data } = await apiClient.get<any>(
    API_ENDPOINTS.CITAS.HISTORIAL(pacienteId),
    { params }
  );
  return data;
};

/**
 * Obtiene el historial de citas/diagnósticos del paciente autenticado
 * @param params - Parámetros de paginación o filtros
 * @returns Promise con la lista del historial y la paginación
 */
export const getHistorialSelf = async (params?: any) => {
  const { data } = await apiClient.get<any>(
    API_ENDPOINTS.CITAS.HISTORIAL_SELF,
    { params }
  );
  return data;
};

/**
 * Obtiene los servicios a los cuales el paciente ha realizado alguna consulta
 * @param pacienteId - ID del paciente
 * @returns Promise con la lista de servicios
 */
export const getPatientServices = async (pacienteId: string | number) => {
  const { data } = await apiClient.get<any>('/citas/servicios', {
    params: { pacienteId },
  });
  return data;
};