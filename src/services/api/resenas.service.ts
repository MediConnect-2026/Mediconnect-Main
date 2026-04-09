import apiClient from "./client";
import { API_ENDPOINTS } from "./endpoints";

export interface CreateResenaRequest {
  servicioId: number;
  calificacion: number;
  comentario: string;
  citaId: number;
}

export const resenasService = {
  crearResena: async (data: CreateResenaRequest) => {
    const response = await apiClient.post(API_ENDPOINTS.RESENAS.CREATE, data);
    return response.data;
  },
};

export default resenasService;
