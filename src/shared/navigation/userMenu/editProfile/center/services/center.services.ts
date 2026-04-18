import apiClient from "@/services/api/client";
import type {
        AllianceRequestRecord,
    CenterDoctorsGrowthParams,
  CenterProfileTranslationParams,
    GetCenterInsurancesResponse,
  GetCenterMyProfileResponse,
    UpdateCenterLocationRequest,
    UpdateCenterLocationResponse,
  UpdateCenterProfileRequest,
  CreateDoctorAllianceRequestResponse,
    DeleteCenterAllianceResponse,
    DoctorAllianceRequestPayload,
    GetCenterAllianceRequestsResponse,
    UpdateAllianceRequestStatusPayload,
    UpdateAllianceRequestStatusResponse,
} from "./center.types";
import { API_ENDPOINTS } from "@/services/api/endpoints";
import type {
    CenterDoctorsGrowthResponse,
    CenterSpecialtiesDistributionResponse,
    CenterStats,
    CenterStatsResponse,
} from "@/types/CenterStatsTypes";

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

    async getCenterById(
        centerId: string | number,
        params?: CenterProfileTranslationParams,
    ): Promise<GetCenterMyProfileResponse> {
        try {
            const { data } = await apiClient.get<GetCenterMyProfileResponse>(
                API_ENDPOINTS.HEALTH_CENTERS.BY_ID(centerId),
                { params },
            );

            if (!data.success) {
                throw new Error("No se pudo obtener el perfil del centro.");
            }

            return data;
        } catch (error: any) {
            const apiMessage = error?.response?.data?.message;
            if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
                throw new Error(apiMessage);
            }

            throw new Error("No se pudo obtener el perfil del centro.");
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

    async getInsurances(
        language?: string,
        centerId?: string | number,
    ): Promise<GetCenterInsurancesResponse> {
        try {
            const params: CenterProfileTranslationParams = {};

            if (language && language !== "es") {
                params.target = language;
                params.source = "es";
                params.translate_fields = "nombre";
            }

            if (centerId !== undefined && centerId !== null && String(centerId).trim().length > 0) {
                params.centroSaludId = centerId;
            }

            const { data } = await apiClient.get<GetCenterInsurancesResponse>(
                API_ENDPOINTS.HEALTH_CENTERS.SEGUROS,
                { params },
            );

            if (!data.success) {
                throw new Error("No se pudieron obtener los seguros del centro.");
            }

            return data;
        } catch (error: any) {
            const apiMessage = error?.response?.data?.message;
            if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
                throw new Error(apiMessage);
            }

            throw new Error("No se pudieron obtener los seguros del centro.");
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
    },

    getCenterDoctorsGrowth: async (
        params?: CenterDoctorsGrowthParams,
    ): Promise<CenterDoctorsGrowthResponse> => {
      try {
          const { data } = await apiClient.get<CenterDoctorsGrowthResponse>(
              API_ENDPOINTS.HEALTH_CENTERS.STATS.CRECIMIENTO_MEDICOS,
              { params },
          );

          if (!data.success) {
              throw new Error("No se pudo obtener el crecimiento de medicos.");
          }

          return data;
      } catch (error: any) {
          const apiMessage = error?.response?.data?.message;
          if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
              throw new Error(apiMessage);
          }

          throw new Error("No se pudo obtener el crecimiento de medicos.");
      }
    },

    getCenterSpecialtiesDistribution: async (
        params?: CenterProfileTranslationParams,
    ): Promise<CenterSpecialtiesDistributionResponse> => {
      try {
          const { data } = await apiClient.get<CenterSpecialtiesDistributionResponse>(
              API_ENDPOINTS.HEALTH_CENTERS.STATS.DISTRIBUCION_ESPECIALIDADES,
              { params },
          );

          if (!data.success) {
              throw new Error("No se pudo obtener la distribucion de especialidades.");
          }

          return data;
      } catch (error: any) {
          const apiMessage = error?.response?.data?.message;
          if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
              throw new Error(apiMessage);
          }

          throw new Error("No se pudo obtener la distribucion de especialidades.");
      }
    },
    
    createDoctorAllianceRequest: async ( payload: DoctorAllianceRequestPayload ): Promise<CreateDoctorAllianceRequestResponse> => {
      try {
      const { data } = await apiClient.post<CreateDoctorAllianceRequestResponse>(
                    API_ENDPOINTS.HEALTH_CENTERS.SOLICITUDES_ALIANZA,
          payload,
      );

      if (!data.success) {
          const message =
          typeof data.message === "string"
              ? data.message
              : "No se pudo enviar la solicitud de alianza.";
          throw new Error(message);
      }

      return data;
      } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
          throw new Error(apiMessage);
      }
      throw new Error("No se pudo enviar la solicitud de alianza.");
      }
    },

        getCenterAllianceRequests: async (
            params?: CenterProfileTranslationParams,
        ): Promise<GetCenterAllianceRequestsResponse> => {
            try {
                const { data } = await apiClient.get<GetCenterAllianceRequestsResponse>(
                    API_ENDPOINTS.HEALTH_CENTERS.SOLICITUDES_ALIANZA,
                    {
                        params,
                    },
                );

                if (!data.success) {
                    throw new Error("No se pudieron obtener las solicitudes de alianza.");
                }

                return data;
            } catch (error: any) {
                const apiMessage = error?.response?.data?.message;
                if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
                    throw new Error(apiMessage);
                }

                throw new Error("No se pudieron obtener las solicitudes de alianza.");
            }
        },

        getCenterStaff: async (
            params?: CenterProfileTranslationParams,
        ): Promise<AllianceRequestRecord[]> => {
            try {
                const { data } = await apiClient.get<GetCenterAllianceRequestsResponse>(
                    API_ENDPOINTS.HEALTH_CENTERS.SOLICITUDES_ALIANZA,
                    {
                        params,
                    },
                );

                if (!data.success) {
                    throw new Error("No se pudo obtener el personal del centro.");
                }

                return (data.data ?? []).filter(
                    (request) => request.estado === "Aceptada" && Boolean(request.doctor),
                );
            } catch (error: any) {
                const apiMessage = error?.response?.data?.message;
                if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
                    throw new Error(apiMessage);
                }

                throw new Error("No se pudo obtener el personal del centro.");
            }
        },

        updateAllianceRequestStatus: async (
            requestId: string | number,
            payload: UpdateAllianceRequestStatusPayload,
        ): Promise<UpdateAllianceRequestStatusResponse> => {
            try {
                const { data } = await apiClient.put<UpdateAllianceRequestStatusResponse>(
                    API_ENDPOINTS.HEALTH_CENTERS.SOLICITUDES_ALIANZA_BY_ID(requestId),
                    payload,
                );

                if (!data.success) {
                    throw new Error("No se pudo actualizar la solicitud de alianza.");
                }

                return data;
            } catch (error: any) {
                const apiMessage = error?.response?.data?.message;
                if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
                    throw new Error(apiMessage);
                }

                throw new Error("No se pudo actualizar la solicitud de alianza.");
            }
        },

        deleteAllianceRequest: async (
            requestId: string | number,
        ): Promise<DeleteCenterAllianceResponse> => {
            try {
                const { data } = await apiClient.delete<DeleteCenterAllianceResponse>(
                    API_ENDPOINTS.HEALTH_CENTERS.SOLICITUDES_ALIANZA_BY_ID(requestId),
                );

                if (!data.success) {
                    throw new Error("No se pudo eliminar la alianza con el doctor.");
                }

                return data;
            } catch (error: any) {
                const apiMessage = error?.response?.data?.message;
                if (typeof apiMessage === "string" && apiMessage.trim().length > 0) {
                    throw new Error(apiMessage);
                }

                throw new Error("No se pudo eliminar la alianza con el doctor.");
            }
        },
};

export default centerService;