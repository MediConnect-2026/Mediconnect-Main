// --- TIPOS PARA ACTUALIZACIÓN DE PERFIL DE PACIENTE ---

export interface UpdatePatientProfileRequest {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  fechaNacimiento?: string; // ISO Date string
  genero?: string;
  altura?: number;
  peso?: number;
  tipoSangre?: string;
  ubicacionId?: number;
  estado?: 'Activo' | 'Inactivo';
}

export interface UpdatePatientProfileResponse {
  success: boolean;
  message: string;
  data: {
    usuarioId: number;
    nombre: string;
    apellido: string;
    numero_documento_identificacion: string;
    tipoDocIdentificacion: string;
    foto_documento: string | null;
    fechaNacimiento: string;
    genero: string;
    altura: number | null;
    peso: number | null;
    tipoSangre: string | null;
    estado: string;
    ubicacionId: number | null;
    creadoEn: string;
    actualizadoEn: string | null;
  };
}

export interface UpdatePatientProfileError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// --- TIPOS PARA ACTUALIZACIÓN DE FOTO DE PERFIL ---

export interface UpdateProfilePhotoResponse {
  success: boolean;
  message: string;
  data: {
    fotoPerfilUrl: string;
  };
}

export interface UpdateProfilePhotoError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// --- TIPOS PARA ACTUALIZACIÓN DE BANNER ---

export interface UpdateBannerResponse {
  success: boolean;
  message: string;
  data: {
    bannerUrl: string;
  };
}

export interface UpdateBannerError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// --- TIPOS PARA CONDICIONES MÉDICAS Y ALERGIAS ---

export interface CondicionMedica {
  id: number;
  nombre: string;
  descripcion: string;
  tipo: 'Alergia' | 'Condición Médica';
  notas?: string; // Notas personales del paciente
}

export interface GetAvailableAllergiesResponse {
  success: boolean;
  data: CondicionMedica[];
}

export interface GetAvailableConditionsResponse {
  success: boolean;
  data: CondicionMedica[];
}

export interface AddAllergyRequest {
  condicionId: number;
  notas?: string;
}

export interface AddConditionRequest {
  condicionId: number;
  notas?: string;
}

export interface UpdateConditionRequest {
  notas?: string;
  estado?: 'Activo' | 'Inactivo';
}

export interface AddPersonalConditionRequest {
  notas: string;
}

export interface AddAllergyResponse {
  success: boolean;
  message: string;
  data: CondicionMedica;
}

export interface AddConditionResponse {
  success: boolean;
  message: string;
  data: CondicionMedica;
}

export interface UpdateConditionResponse {
  success: boolean;
  message: string;
  data: CondicionMedica;
}

export interface AddPersonalConditionResponse {
  success: boolean;
  message: string;
  data: CondicionMedica;
}

export interface GetMyAllergiesResponse {
  success: boolean;
  message?: string;
  data: CondicionMedica[];
}

export interface GetMyConditionsResponse {
  success: boolean;
  message?: string;
  data: CondicionMedica[];
}

export interface RemoveAllergyResponse {
  success: boolean;
  message: string;
}

export interface RemoveConditionResponse {
  success: boolean;
  message: string;
}

export interface MedicalConditionError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

// --- TIPOS PARA SEGUROS MÉDICOS ---

export interface TipoSeguro {
  id: number;
  nombre: string;
  descripcion: string;
  estado?: string;
  creadoEn?: string;
}

export interface GetAvailableInsuranceTypesResponse {
  success: boolean;
  message?: string;
  data: TipoSeguro[];
}

export interface Seguro {
  id: number;
  nombre: string;
  descripcion?: string;
  idTipoSeguro?: number;
  tipoSeguro?: TipoSeguro | string;
}

export interface GetAvailableInsurancesResponse {
  success: boolean;
  data: Seguro[];
}

export interface GetMyInsurancesResponse {
  success: boolean;
  data: Array<{
    creadoEn: string;
    estado: string;
    seguro: {
      id: number;
      nombre: string;
      descripcion?: string;
      urlImage?: string | null;
      creadoEn: string;
      estado: string;
    };
    tipoSeguro: TipoSeguro;
  }>;
}

export interface AddInsuranceRequest {
  idSeguro: number;
  idTipoSeguro: number;
}

export interface AddInsuranceResponse {
  success: boolean;
  message: string;
  data: {
    creadoEn: string;
    estado: string;
    seguro: {
      id: number;
      nombre: string;
      descripcion?: string;
      urlImage?: string | null;
      creadoEn: string;
      estado: string;
    };
    tipoSeguro: TipoSeguro;
  };
}

export interface RemoveInsuranceResponse {
  success: boolean;
  message: string;
}

export interface InsuranceError {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

export interface CreateHealthDateRequest {
  servicioId: number;
  horarioId: number;
  fecha: string; // ISO Date string
  hora: string; // HH:mm format
  modalidad: string;
  numPacientes: number;
  seguroId?: number;
  tipoSeguroId?: number;
  motivoConsulta: string;
}


