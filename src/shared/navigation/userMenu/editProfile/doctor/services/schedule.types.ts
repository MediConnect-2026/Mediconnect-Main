export interface ScheduleServices {
  id: number;
  doctorId: number;
  nombre: string;
  dias: Number[]; // Array de números representando los días de la semana (0-6)
  horaInicio: string;
  horaFin: string;
  estado: string;
  creadoEn: string;
}

export interface GetScheduleServicesResponse {
  success: boolean;
  data: ScheduleServices[];
  count: number;
}

export interface CreateScheduleServiceRequest {
  nombre: string;
  diasSemana: Number[]; // Array de números representando los días de la semana (0-6)
  horaInicio: string;
  horaFin: string;
}

export interface UpdateScheduleServiceRequest {
  nombre: string;
  diasSemana: Number[]; // Array de números representando los días de la semana (0-6)
  horaInicio: string;
  horaFin: string;
  estado?: string; // Por defecto "Activo"
}

export interface CreateScheduleServiceResponse {
  success: boolean;
  data: ScheduleServices;
}

export interface UpdateScheduleServiceResponse {
  success: boolean;
  data: ScheduleServices;
}

export interface ScheduleServiceResponse {
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface ValidateScheduleRequest {
  horarioIds: number[];
}

export interface ValidateScheduleResponse {
  success: boolean;
  data: {
    conflicto: boolean;
    mensaje: string;
    detalles?: {
      horario1Id: number;
      horario2Id: number;
      diasConflicto: number[];
      mensaje: string;
    }[];
  }
}