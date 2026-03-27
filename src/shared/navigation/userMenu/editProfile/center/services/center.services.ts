import apiClient from "@/services/api/client";
import type {
  CenterProfileTranslationParams,
  GetCenterMyProfileResponse,
    UpdateCenterLocationRequest,
    UpdateCenterLocationResponse,
  UpdateCenterProfileRequest,
} from "./center.types";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import type { CenterStats, CenterStatsResponse } from "@/types/CenterStatsTypes";

const centerService = {
    async getMyProfile(params?: CenterProfileTranslationParams): Promise<GetCenterMyProfileResponse> {
        try {
            const response = await apiClient.get<GetCenterMyProfileResponse>("/centros-salud/mi-perfil", {
                params,
            });
            return response.data;
        } catch (error) {
            console.error("Error al obtener el perfil del centro:", error);
            throw error;
        }
    },

    async updateProfile(data: UpdateCenterProfileRequest) {
        try {
            const response = await apiClient.put("/centros-salud/mi-perfil", data);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar el perfil del centro:", error);
            throw error;
        }
    },

    async updateMyLocation(data: UpdateCenterLocationRequest): Promise<UpdateCenterLocationResponse> {
        try {
            const response = await apiClient.put<UpdateCenterLocationResponse>("/centros-salud/mi-ubicacion", data);
            return response.data;
        } catch (error) {
            console.error("Error al actualizar la ubicacion del centro:", error);
            throw error;
        }
    },

    getDocuments: async (params?: any): Promise<any> => {
        try {
        const searchParams = new URLSearchParams();
        if (params?.target) searchParams.append('target', params.target);
        if (params?.source) searchParams.append('source', params.source);
        if (params?.translate_fields) searchParams.append('translate_fields', params.translate_fields);

        const queryString = searchParams.toString();
        const url = queryString ? `/centros-salud/mis-documentos?${queryString}` : `/centros-salud/mis-documentos`;

        const response = await apiClient.get(url);
        return response.data;
        } catch (error: any) {
        console.error('❌ [Center Service] Error al obtener documentos del centro:', error);
        const message = error.response?.data?.message || error.message || 'Error al obtener documentos del centro.';
        throw new Error(message);
        }
    },

    updateDocument: async (documentId: number, data: { archivo: File; descripcion?: string }) => {
        try {
        // Validaciones (tipo y tamaño similar a doctor)
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'application/pdf',
        ];
        if (!allowedTypes.includes(data.archivo.type)) {
            throw new Error('Solo se permiten imágenes (JPEG, PNG, WEBP) o PDF');
        }

        const maxSize = 5 * 1024 * 1024;
        if (data.archivo.size > maxSize) {
            throw new Error('El archivo supera el tamaño máximo de 5MB');
        }

        const formData = new FormData();
        formData.append('archivo', data.archivo);
        if (data.descripcion) formData.append('descripcion', data.descripcion);

        const response = await apiClient.put(`/centros-salud/documentos/${documentId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });

        return response.data;
        } catch (error: any) {
        console.error('❌ [Center Service] Error al actualizar documento del centro:', error);
        const message = error.response?.data?.message || error.message || 'Error al actualizar el documento del centro.';
        throw new Error(message);
        }
    },

    getCenterStatsGeneral: async (): Promise<CenterStats> => {
      try {
          const { data } = await apiClient.get<CenterStatsResponse>(
          API_ENDPOINTS.HEALTH_CENTERS.STATS.GENERAL
          );
          return data.data;
      } catch (error) {
          console.error('Error fetching center stats general:', error);
          throw error;
      }
    }
};

export default centerService;