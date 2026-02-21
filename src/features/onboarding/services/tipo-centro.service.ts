import apiClient from "@/services/api/client";
import API_ENDPOINTS from "@/services/api/endpoints";
import type { TipoCentroParams, TipoCentroResponse } from "./tipos-centro.types";
import type { SelectOption } from "./especialidades.types";

export const tipoCentroService = {
  /**
   * Obtener lista de tipos de centro de salud
   * GET /tipos-centros-salud
   * Soporta traducción automática de campos mediante query params.
   * Ejemplo: /api/tipos-centros-salud?target=en&translate_fields=nombre,descripcion
   */
  getTiposCentro: async (
    params?: TipoCentroParams
  ): Promise<TipoCentroResponse> => {
    try {
      const response = await apiClient.get<TipoCentroResponse>(
          API_ENDPOINTS.TIPOS_CENTRO.BASE,
          { params }
      );
      return response.data;
    } catch (error) {
      console.error("Error obteniendo tipos de centro:", error);
      throw error;
    }
  },

  /**
   * Obtener especialidades formateadas para MCSelect
   * Transforma la respuesta de la API en el formato requerido por MCSelect
   */
  getTiposCentroForSelect: async (
    params?: TipoCentroParams
  ): Promise<SelectOption[]> => {
    try {
      const response = await tipoCentroService.getTiposCentro(params);

      // Transformar datos a formato de select
      return response.data.map((tipoCentro) => ({
        value: tipoCentro.id.toString(),
        label: tipoCentro.nombre,
      }));
    } catch (error) {
      console.error("Error obteniendo tipos de centro para MCSelect:", error);
      return [];
    }
  },

   
  /**
   * Obtener todas los tipos de centro activos sin paginación
   * Útil para obtener el listado completo
 */
  getAllActiveTiposCentros: async (
    language?: string
  ): Promise<SelectOption[]> => {
    try {
      const params: TipoCentroParams = {
        estado: 'Activo',
        limite: 1000, // Asumimos que no habrá más de 1000 tipos de centro activos
        pagina: 1,
      };

      if (language) {
        params.target = language;
        params.translate_fields = 'nombre';
      }

      return await tipoCentroService.getTiposCentroForSelect(params);
      
    } catch (error) {
      console.error("Error obteniendo tipos de centro activos:", error);
      return [];
    }
  },

};

export default tipoCentroService;