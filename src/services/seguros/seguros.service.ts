import apiClient from '../api/client';
import API_ENDPOINTS from '../api/endpoints';
import type {
  ObtenerSegurosAceptadosResponse,
  ObtenerSegurosAceptadosParams,
} from './seguros.types';

export const segurosService = {
  /**
   * Obtener seguros aceptados por el doctor
   * GET /seguros/seguros-aceptados
   */
  obtenerSegurosAceptados: async (
    params?: ObtenerSegurosAceptadosParams
  ): Promise<ObtenerSegurosAceptadosResponse> => {
    try {
      const { data } = await apiClient.get<ObtenerSegurosAceptadosResponse>(
        API_ENDPOINTS.SEGUROS.ACEPTADOS,
        { params }
      );
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default segurosService;
