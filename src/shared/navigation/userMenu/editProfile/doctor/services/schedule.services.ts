import apiClient from "@/services/api/client";
import type { CreateScheduleServiceRequest, CreateScheduleServiceResponse, GetScheduleServicesResponse, ScheduleServiceResponse, ValidateScheduleRequest, ValidateScheduleResponse, UpdateScheduleServiceRequest, UpdateScheduleServiceResponse } from "./schedule.types";
import i18n from "@/i18n/config";

export const scheduleService = {
  getScheduleServices: async (doctorId: string): Promise<GetScheduleServicesResponse> => {
    try {
      const response = await apiClient.get(
        `/horarios/doctor/${doctorId}`,
        {
          // Enviar los parámetros de traducción como query params para que Axios los acepte
          params: {
            source: i18n.language === "es" ? "en" : "es",
            target: i18n.language === "es" ? "es" : "en",
            translate_fields: "nombre,descripcion",
          },
        }
      );

      return response.data as GetScheduleServicesResponse;
    }catch (error) {
      console.error("Error en scheduleService.getScheduleServices:", error);
      throw error;
    }
  },

  createScheduleService: async (schedule: CreateScheduleServiceRequest): Promise<CreateScheduleServiceResponse> => {
    try {
      const response = await apiClient.post<CreateScheduleServiceResponse>(
        `/horarios`,
        schedule
      );
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data as ScheduleServiceResponse;
      console.error("Error en scheduleService.createScheduleService:", error);
      throw errorData || error;
    }
  },

  updateScheduleService: async (scheduleId: number, schedule: UpdateScheduleServiceRequest): Promise<UpdateScheduleServiceResponse> => {
    try {
      const payload = {
        ...schedule,
        estado: schedule.estado || "Activo"
      };
      
      const response = await apiClient.put<UpdateScheduleServiceResponse>(
        `/horarios/${scheduleId}`,
        payload
      );
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data as ScheduleServiceResponse;
      console.error("Error en scheduleService.updateScheduleService:", error);
      throw errorData || error;
    }
  },


  validateSchedule: async (schedule: ValidateScheduleRequest): Promise<ValidateScheduleResponse> => {
    try {
      const response = await apiClient.post<ValidateScheduleResponse>(
        `/horarios/verificar-conflictos`,
        schedule
      );
      return response.data;
    } catch (error: any) {
      const errorData = error.response?.data as ValidateScheduleResponse;
      console.error("Error en scheduleService.validateSchedule:", error);
      throw errorData || error;
    }
  },

};