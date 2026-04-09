import apiClient from '@/services/api/client';
import API_ENDPOINTS from '@/services/api/endpoints';
import type {
  EspecialidadesResponse,
  EspecialidadesParams,
  Especialidad,
  SelectOption,
} from './especialidades.types';

export const especialidadesService = {
  /**
   * Obtener lista de especialidades médicas
   * GET /especialidades
   * 
   * Soporta traducción automática de campos mediante query params.
   * Ejemplo: /api/especialidades?target=en&translate_fields=nombre,descripcion
   */
  getEspecialidades: async (
    params?: EspecialidadesParams
  ): Promise<EspecialidadesResponse> => {
    try {
      const response = await apiClient.get<EspecialidadesResponse>(
        API_ENDPOINTS.ESPECIALIDADES.BASE,
        { params }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error obteniendo especialidades:', error);
      throw error;
    }
  },

  /**
   * Obtener especialidades formateadas para MCSelect
   * Transforma la respuesta de la API en el formato requerido por MCSelect
   */
  getEspecialidadesForSelect: async (
    params?: EspecialidadesParams
  ): Promise<SelectOption[]> => {
    try {
      const response = await especialidadesService.getEspecialidades(params);

      // Transformar datos a formato de select
      return response.data.map((especialidad: Especialidad) => ({
        value: especialidad.id.toString(),
        label: especialidad.nombre,
      }));
    } catch (error) {
      console.error('Error obteniendo especialidades para select:', error);
      return [];
    }
  },

  /**
   * Obtener todas las especialidades activas sin paginación
   * Útil para obtener el listado completo
   */
  getAllActiveEspecialidades: async (
    language?: string
  ): Promise<SelectOption[]> => {
    try {
      const params: EspecialidadesParams = {
        estado: 'Activo',
        limite: 1000, // Límite alto para obtener todas
        pagina: 1,
      };

      // Agregar traducción si se especifica un idioma
      if (language && language !== 'es') {
        params.target = language;
        params.source = 'es';
        params.translate_fields = 'nombre,descripcion';
      }

      return await especialidadesService.getEspecialidadesForSelect(params);
    } catch (error) {
      console.error('Error obteniendo todas las especialidades activas:', error);
      return [];
    }
  },
};

export default especialidadesService;
