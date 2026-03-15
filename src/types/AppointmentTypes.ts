// AppointmentTypes.ts
import z from "zod";
import {
  appointmentSchemaBase,
  cancelAppointmentSchemaBase,
} from "../schema/appointment.schema";

export type scheduleAppointment = z.infer<typeof appointmentSchemaBase>;

// Tipo específico para cuando estamos creando (sin ID)
export type CreateAppointment = Omit<scheduleAppointment, "appointmentId">;

export type CancelAppointment = z.infer<typeof cancelAppointmentSchemaBase>;

// Tipo específico para cuando estamos editando (con ID requerido)
export type EditAppointment = Required<scheduleAppointment>;

// ========================================
// TIPOS PARA LA API DE CITAS DEL BACKEND
// ========================================

/**
 * Estado de una cita según el backend
 */
export type CitaEstado =
  | "Programada"
  | "En Progreso"
  | "Completada"
  | "Cancelada"
  | "Reprogramada";

/**
 * Información del paciente en una cita
 */
export interface CitaPaciente {
  nombre: string;
  apellido: string;
  usuario: {
    email: string;
    fotoPerfil: string | null;
  };
  usuarioId?: number;
}

/**
 * Información del doctor en una cita
 */
export interface CitaDoctor {
  usuarioId?: number;
  nombre: string;
  apellido: string;
  usuario: {
    email: string;
    fotoPerfil: string | null;
    telefono?: string;
  };
}

/**
 * Información del servicio en una cita
 */
export interface CitaServicio {
  id: number;
  doctorId: number;
  especialidadId: number;
  nombre: string;
  descripcion: string;
  precio: number;
  duracionMinutos: number;
  maxPacientesDia: number | null;
  calificacionPromedio: number;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
  id_ubicacion: number;
  modalidad: string;
  sesiones: number | null;
  latitude?: number;
  longitude?: number;
  especialidad: {
    id: number;
    nombre: string;
  };
  imagenes: {
    id: number;
    servicioId: number;
    url: string;
    orden: number;
    estado: string;
    creadoEn: string;
  }[];
  horarios: {
    id: number;
    nombre: string;
    horaInicio: string;
    horaFin: string;
    ubicacionId: number;
    estado: string;
    servicioId: number;
  };
  ubicaciones: {
    barrio_nombre: string;
    barrioId: number;
    direccionCompleta: string;
    id: number;
    latitud: number;
    longitud: number;
    municipio_nombre: string;
    nombre: string;
    provincia_nombre: string;
  }
}

/**
 * Información del horario en una cita
 */
export interface CitaHorario {
  id: number;
  nombre: string;
  diasSemana: number[];
  horaInicio: string;
  horaFin: string;
}

/**
 * Información del seguro en una cita
 */
export interface CitaSeguro {
  id: number;
  nombre: string;
  urlImage: string | null;
}

/**
 * Información del tipo de seguro
 */
export interface CitaTipoSeguro {
  id: number;
  nombre: string;
}

/**
 * Detalle completo de una cita del backend
 */
/**
 * Información del doctor en "Mis Doctores"
 */
export interface MyDoctor {
  id: number;
  nombre: string;
  apellido: string;
  fotoPerfil: string | null;
  email: string | null;
  telefono: string | null;
  calificacionPromedio: number | null;
  esFavorito: boolean;
  especialidadPrincipal: {
    id: number;
    nombre: string;
  } | null;
  anosExperiencia: number | null;
  idiomas: {
    nombre: string;
    nivel: string | null;
  }[];
  segurosAceptados: {
    id: number | null;
    nombre: string | null;
    urlImage: string | null;
    tipoSeguro: {
      id: number;
      nombre: string;
    } | null;
  }[];
  totalServiciosActivos: number;
  ultimaCita: {
    id: number;
    fecha: string;
    estado: string;
    servicio: {
      id: number;
      nombre: string;
      precio: number | null;
    } | null;
  };
}

/**
 * Filtros para la lista de Mis Doctores
 */
export interface MyDoctorsFilters {
  target?: string;
  source?: string;
  translate_fields?: string;
}

/**
 * Respuesta de la API de Mis Doctores
 */
export interface MyDoctorsResponse {
  success: boolean;
  total: number;
  data: MyDoctor[];
}

export interface CitaDetalle {
  id: number;
  doctorId?: number;
  pacienteId?: number;
  servicioId?: number;
  estado: CitaEstado;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  modalidad: string;
  numPacientes: number;
  totalAPagar: number;
  motivoConsulta: string | null;
  motivoCancelacion: string | null;
  paciente: CitaPaciente;
  doctor: CitaDoctor;
  servicio: CitaServicio;
  horario: CitaHorario | null;
  seguro: CitaSeguro | null;
  tipoSeguro: CitaTipoSeguro | null;
  creadoEn: string;
}

/**
 * Paginación de las citas
 */
export interface CitaPaginacion {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

/**
 * Respuesta de la API al listar citas
 */
export interface CitasListResponse {
  success: boolean;
  data: CitaDetalle[] | CitaDetalle;
  paginacion: CitaPaginacion;
}


/**
 * Filtros para la consulta de citas
 */
export interface CitasFilters {
  estado?: CitaEstado;
  fechaDesde?: string;
  fechaHasta?: string;
  pagina?: number;
  limite?: number;
  target?: string;
  source?: string;
  translate_fields?: string;
}

// ========================================
// TIPOS PARA EL CALENDARIO DE CITAS
// ========================================

/**
 * Vista del calendario
 */
export type CalendarioVista = 'hoy' | 'dia' | 'semana' | 'mes';

/**
 * Parámetros para consultar el calendario
 */
export interface CalendarioParams {
  vista?: CalendarioVista;
  fecha?: string; // YYYY-MM-DD
  target?: string;
  source?: string;
  translate_fields?: string;
}

/**
 * Rango de fechas del calendario
 */
export interface CalendarioRango {
  desde: string; // YYYY-MM-DD
  hasta: string; // YYYY-MM-DD
}

/**
 * Citas agrupadas por día
 */
export interface CalendarioDia {
  fecha: string; // YYYY-MM-DD
  total: number;
  citas: CitaDetalle[];
}

/**
 * Respuesta del endpoint /citas/calendario
 */
export interface CalendarioResponse {
  success: boolean;
  vista: CalendarioVista;
  fechaReferencia: string; // YYYY-MM-DD
  rango: CalendarioRango;
  total: number;
  dias: CalendarioDia[];
}
