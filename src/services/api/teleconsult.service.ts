import apiClient from './client';
import API_ENDPOINTS from './endpoints';

export interface TeleconsultAccessResponse {
    urlAcceso: string;
}

/** Shape of the backend response envelope */
interface TeleconsultApiEnvelope {
    success: boolean;
    message?: string;
    data: TeleconsultAccessResponse;
}

const teleconsultService = {
    /**
     * Paciente: obtiene la URL de acceso a la sala de Daily.co
     * GET /teleconsultas/:citaId/url-acceso
     */
    getAccessUrl: async (citaId: string | number): Promise<TeleconsultAccessResponse> => {
        const { data } = await apiClient.get<TeleconsultApiEnvelope>(
            API_ENDPOINTS.TELECONSULTAS.URL_ACCESO(citaId)
        );
        // Backend wraps the payload: { success, data: { urlAcceso } }
        return data.data ?? (data as unknown as TeleconsultAccessResponse);
    },

    /**
     * Doctor: inicia la teleconsulta (crea la sala en Daily) y obtiene su URL
     * POST /teleconsultas/:citaId/iniciar
     */
    iniciarTeleconsulta: async (citaId: string | number): Promise<TeleconsultAccessResponse> => {
        const { data } = await apiClient.post<TeleconsultApiEnvelope>(
            API_ENDPOINTS.TELECONSULTAS.INICIAR(citaId)
        );
        // Backend wraps the payload: { success, data: { urlAcceso } }
        return data.data ?? (data as unknown as TeleconsultAccessResponse);
    },

    /**
     * Finaliza la teleconsulta (doctor o paciente)
     * POST /teleconsultas/:citaId/finalizar
     */
    finalizarTeleconsulta: async (citaId: string | number): Promise<void> => {
        await apiClient.post(API_ENDPOINTS.TELECONSULTAS.FINALIZAR(citaId));
    },
};

export default teleconsultService;
