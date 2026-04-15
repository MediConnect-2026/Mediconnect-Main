/**
 * DoctorStatsTypes.ts
 * Tipos para las estadísticas del doctor
 */

/**
 * Estadísticas de resumen del doctor
 */
export interface DoctorStatsResumen {
  /**
   * Total de pacientes activos
   */
  totalPacientes: number;

  /**
   * Total de citas/consultas
   */
  totalConsultas: number;

  /**
   * Total ganado en la moneda local (ej: RD$)
   */
  totalDineroGanado: string | number;
}

/**
 * Servicio más utilizado
 */
export interface ServicioUtilizado {
  nombre: string;
  totalCitas: number;
  color?: string;
  porcentaje?: number;
}

/**
 * Respuesta de servicios más utilizados
 */
export interface DoctorServicesUtilizadosResponse {
  success: boolean;
  masUtilizados: ServicioUtilizado[];
  message?: string;
}

/**
 * Punto de datos del backend para productividad
 */
export interface ProductividadDataPoint {
  label: string;
  consultas: number;
  ingresos: number;
}

/**
 * Totales de productividad
 */
export interface ProductividadTotales {
  consultas: number;
  ingresos: number;
}

/**
 * Respuesta cruda del backend para productividad
 */
export interface DoctorProductividadRawResponse {
  success: boolean;
  periodo: string;
  puntos: ProductividadDataPoint[];
  totales: ProductividadTotales;
}

/**
 * Dato de productividad por período (transformado para el frontend)
 */
export interface ProductividadDato {
  day: string;
  consultas: number;
  ingresos: number;
}

/**
 * Respuesta de productividad (transformada para el frontend)
 */
export interface DoctorProductividadResponse {
  success: boolean;
  data: ProductividadDato[];
  message?: string;
}

/**
 * Respuesta del endpoint de estadísticas de resumen
 */
export interface DoctorStatsResponse {
  success: boolean;
  data: DoctorStatsResumen;
  message?: string;
}

/**
 * Estadísticas de servicios del doctor
 */
export interface DoctorServicesStats {
  totalServicios: number;
  serviciosActivos: number;
  serviciosInactivos: number;
  promedioRating: number;
}

/**
 * Respuesta del endpoint de estadísticas de servicios
 */
export interface DoctorServicesStatsResponse {
  success: boolean;
  data: DoctorServicesStats;
}

/**
 * Estadísticas de pacientes del doctor
 */
export interface DoctorPatientsStats {
  /**
   * Total de pacientes
   */
  totalPacientes: number;

  /**
   * Pacientes con condiciones activas
   */
  pacientesConCondicionesActivas: number;

  /**
   * Pacientes con alergias
   */
  pacientesConAlergias: number;

  /**
   * Edad promedio de los pacientes
   */
  edadPromedio: number;
}

/**
 * Filtros aplicados en la consulta de pacientes
 */
export interface DoctorPatientsStatsFilters {
  /**
   * Fecha desde (formato ISO 8601)
   */
  fechaDesde: string;

  /**
   * Fecha hasta (formato ISO 8601)
   */
  fechaHasta: string;

  /**
   * ID del servicio
   */
  servicioId: number;
}

/**
 * Respuesta del endpoint de estadísticas de pacientes
 */
export interface DoctorPatientsStatsResponse {
  success: boolean;
  filtros: DoctorPatientsStatsFilters;
  data: DoctorPatientsStats;
}

/**
 * Especialidad del servicio
 */
export interface MisEspecialidad {
  id: number;
  nombre: string;
}

/**
 * Servicio medical
 */
export interface MisServicio {
  id: number;
  nombre: string;
  especialidad: MisEspecialidad;
}

/**
 * Última cita del paciente
 */
export interface MisUltimaCita {
  citaId: number;
  fecha: string; // Formato: YYYY-MM-DD
  hora: string;
  estado: string;
  modalidad: string;
  servicio: MisServicio;
}

/**
 * Condición médica individual
 */
export interface MisCondicion {
  id: number;
  nombre: string;
  tipo: string;
}

/**
 * Condiciones médicas del paciente
 */
export interface MisCondiciones {
  total: number;
  lista: MisCondicion[];
}

/**
 * Ubicación de la última cita
 */
export interface MisUbicacionUltimaCita {
  id: number;
  nombre: string;
}

/**
 * Datos del paciente obtenidos del endpoint /citas/mis-pacientes
 */
export interface PacienteDelDoctor {
  pacienteId: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fotoPerfil: string;
  edad: number;
  genero: string;
  tipoDocIdentificacion: string;
  numeroDocIdentificacion: string;
  peso: number;
  altura: number;
  tipoSangre: string;
  ubicacionUltimaCita: MisUbicacionUltimaCita;
  condiciones: MisCondiciones;
  ultimaCita: MisUltimaCita;
  totalCitas: number;
}

/**
 * Información de paginación
 */
export interface PaginacionInfo {
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

/**
 * Respuesta del endpoint /citas/mis-pacientes
 */
export interface MisPacientesResponse {
  success: boolean;
  data: PacienteDelDoctor[];
  paginacion: PaginacionInfo;
}

/**
 * Parámetros de filtro para obtener pacientes
 */
// En DoctorStatsTypes.ts
export interface FiltrosPacientes {
  pagina?: number;
  target?: string;
  source?: string;
  translate_fields?: string;
  limite?: number;
  buscar?: string;
  genero?: 'M' | 'F';
  condicionId?: number;
  alergiaId?: number;
  servicioId?: number;
  especialidadId?: number;
  ubicacionId?: number;
  tieneCondiciones?: boolean;
  tieneAlergias?: boolean;
  ultimaCitaDesde?: string;
  ultimaCitaHasta?: string;
}

/**
 * Seguro del paciente
 */
export interface PacienteInfoSeguro {
  id: number;
  nombre: string;
  urlImage: string | null;
  estado: string;
  creadoEn: string;
}

/**
 * Tipo de seguro del paciente
 */
export interface PacienteInfoTipoSeguro {
  id: number;
  nombre: string;
  descripcion: string | null;
  estado: string;
  creadoEn: string;
}

/**
 * Relación de seguro asociado al paciente
 */
export interface PacienteInfoSeguroAsignado {
  pacienteId: number;
  seguroId: number;
  tipoSeguroId: number;
  estado: string;
  creadoEn: string;
  actualizadoEn: string | null;
  id: number;
  seguro: PacienteInfoSeguro;
  tipoSeguro: PacienteInfoTipoSeguro;
}

/**
 * Condición médica base
 */
export interface PacienteInfoCondicion {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipo: string;
  estado: string;
  creadoEn: string;
}

/**
 * Relación condición médica del paciente
 */
export interface PacienteInfoCondicionMedica {
  pacienteId: number;
  condicionId: number;
  notas: string | null;
  estado: string;
  registradoEn: string;
  actualizadoEn: string | null;
  creado_por: string | null;
  id_doctor: number | null;
  id: number;
  condicion: PacienteInfoCondicion;
}

/**
 * Información detallada del paciente para el doctor
 */
export interface DoctorPatientInfo {
  id: number;
  usuarioId: number;
  nombre: string;
  apellido: string;
  banner: string | null;
  tipoDocIdentificacion: string;
  numeroDocumentoIdentificacion: string;
  fotoDocumento: string | null;
  fechaNacimiento: string;
  genero: string;
  altura: number | null;
  peso: number | null;
  tipoSangre: string | null;
  ubicacionId: number | null;
  estado: string;
  creadoEn: string;
  actualizadoEn: string;
  email: string;
  telefono: string | null;
  fotoPerfil: string | null;
  rol: string;
  ubicacion: {
    id: number;
    nombre: string;
  } | null;
  seguros: PacienteInfoSeguroAsignado[];
  condicionesMedicas: PacienteInfoCondicionMedica[];
  futurasCitas?: {
    citaId: string;
    estado: string;
    fecha: string;
    hora: string;
    modalidad: string;
    servicio: {
      id: string;
      nombre: string;
      especialidad: {
        id: string;
        nombre: string;
      }
    }
  }[];
}

/**
 * Filtros de traducción para endpoint de info de paciente
 */
export interface DoctorPatientInfoFilters {
  target?: string;
  source?: string;
  translate_fields?: string;
}

/**
 * Respuesta del endpoint /doctores/pacientes-info/{pacienteId}
 */
export interface DoctorPatientInfoResponse {
  success: boolean;
  data: DoctorPatientInfo;
  message?: string;
}
