import apiClient from '@/services/api/client';

export const educationService = {
  getPaises: async (params?: { target?: string, limite?: number, pagina?: number, translate_fields?: string }) => {
    const mergedParams = { limite: 100, pagina: 1, translate_fields: "nombre", ...params };
    const response = await apiClient.get('/paises', { params: mergedParams });
    return response.data;
  },
  getUniversidadesByPais: async (paisId: number, params?: { target?: string, limite?: number, pagina?: number, translate_fields?: string }) => {
    const mergedParams = { limite: 1000, pagina: 1, translate_fields: "nombre", ...params };
    const response = await apiClient.get(`/universidades/pais/${paisId}`, { params: mergedParams });
    return response.data;
  },
  getFormacionesAcademicas: async (params?: { target?: string; translate_fields?: string }) => {
    const response = await apiClient.get('/formaciones-academicas', { params });
    return response.data;
  },
  getFormacionesAcademicasByDoctorId: async (doctorId: number, params?: { target?: string; translate_fields?: string }) => {
    const response = await apiClient.get(`/formaciones-academicas/doctor/${doctorId}`, { params });
    return response.data;
  },
  createFormacionAcademica: async (data: any) => {
    const response = await apiClient.post('/formaciones-academicas', data);
    return response.data;
  },
  updateFormacionAcademica: async (id: number, data: any) => {
    const response = await apiClient.put(`/formaciones-academicas/${id}`, data);
    return response.data;
  },
  deleteFormacionAcademica: async (id: number) => {
    const response = await apiClient.delete(`/formaciones-academicas/${id}`);
    return response.data;
  },
};
