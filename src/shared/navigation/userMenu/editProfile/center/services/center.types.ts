export interface UpdateCenterProfileRequest {
    nombreComercial: string;
    tipoCentroId: number;
    telefono: string;
    rnc: string;
    sitio_web: string;
    descripcion: string;
}

export interface UpdateCenterLocationRequest {
    barrioId: number;
    direccion: string;
    codigoPostal?: string;
    latitud?: number;
    longitud?: number;
}

export interface UpdateCenterLocationResponse {
    success: boolean;
    data: {
        id: number;
        barrioId: number;
        direccion: string;
        codigoPostal: string | null;
        estado: string;
        creadoEn: string;
        id_doctor: number | null;
        nombre: string;
        barrio: {
            id: number;
            seccionId: number;
            nombre: string;
            estado: string;
            creadoEn: string;
            seccion: {
                id: number;
                distritoMunicipalId: number | null;
                nombre: string;
                estado: string;
                creadoEn: string;
                id_municipio: number;
            };
        };
    };
    message: string;
}

export interface CenterProfileTranslationParams {
    target?: string;
    source?: string;
    translate_fields?: string;
    centroSaludId?: string | number;
}

export interface CenterDoctorsGrowthParams extends CenterProfileTranslationParams {
    periodo?: "semana" | "mes" | "3meses" | "año" | "todo";
}

export interface CenterProfileUser {
    id: number;
    email: string;
    telefono: string;
    fotoPerfil: string | null;
    emailVerificado: boolean;
}

export interface CenterTypeInfo {
    id: number;
    nombre: string;
    estado: string;
    creadoEn: string;
}

export interface CenterSectionInfo {
    id: number;
    distritoMunicipalId: number | null;
    nombre: string;
    estado: string;
    creadoEn: string;
    id_municipio: number;
}

export interface CenterNeighborhoodInfo {
    id: number;
    seccionId: number;
    nombre: string;
    estado: string;
    creadoEn: string;
    seccion: CenterSectionInfo;
}

export interface CenterLocationInfo {
    id: number;
    barrioId: number;
    direccion: string;
    codigoPostal: string;
    estado: string;
    creadoEn: string;
    id_doctor: number | null;
    nombre: string;
    barrio: CenterNeighborhoodInfo;
}

export interface CenterMyProfileData {
    usuarioId: number;
    nombreComercial: string;
    rnc: string;
    tipoCentroId: number;
    ubicacionId: number;
    estadoVerificacion: string;
    calificacionPromedio: number | null;
    totalResenas: number | null;
    estado: string;
    creadoEn: string;
    actualizadoEn: string;
    certificacion_sanitaria: string | null;
    sitio_web: string | null;
    descripcion: string | null;
    foto_perfil: string | null;
    usuario: CenterProfileUser;
    tipoCentro: CenterTypeInfo;
    ubicacion: CenterLocationInfo;
}

export interface GetCenterMyProfileResponse {
    success: boolean;
    data: CenterMyProfileData;
}

export interface CenterInsurance {
    id: number;
    nombre: string;
    urlImage: string | null;
}

export interface GetCenterInsurancesResponse {
    success: boolean;
    data: CenterInsurance[];
}

export interface DoctorAllianceRequestPayload {
  destinatarioId: number;
  mensaje: string;
}

export type AllianceRequestStatus = "Pendiente" | "Aceptada" | "Rechazada";

export interface DoctorAllianceSpecialtyRef {
    id?: number;
    nombre?: string;
    esPrincipal?: boolean;
    id_especialidad?: number;
    es_principal?: boolean;
}

export interface DoctorAllianceLanguageRef {
    id: number;
    nombre: string;
    nivel?: string;
}

export interface DoctorAllianceInsuranceRef {
    id: number;
    nombre: string;
    urlImage: string | null;
    tipoSeguro?: {
        id: number;
        nombre: string;
    };
}


export interface AllianceRequestRecord {
  id: number;
  doctorId: number;
  centroSaludId: number;
  mensaje: string;
  estado: AllianceRequestStatus;
  motivoRechazo: string | null;
  iniciadaPor: "Doctor" | "Centro";
  creadoEn: string;
    actualizadoEn: string | null;
  doctor?: {
    usuarioId: number;
    nombre: string;
    apellido: string;
    exequatur?: string;
    calificacionPromedio?: number | string | null;
    anosExperiencia?: number;
    estado?: string;
    usuario?: {
        email?: string;
        fotoPerfil: string | null;
    };
    especialidades?: DoctorAllianceSpecialtyRef[];
    idiomas?: DoctorAllianceLanguageRef[];
    seguros?: DoctorAllianceInsuranceRef[];
    isFavorite?: boolean;
  };
  centroSalud?: {
    usuarioId: number;
    nombreComercial: string;
        foto_perfil?: string | null;
  };
}

export interface GetCenterAllianceRequestsResponse {
    success: boolean;
    data: AllianceRequestRecord[];
}

export interface CreateDoctorAllianceRequestResponse {
  success: boolean;
  message: string | AllianceRequestRecord;
}

export type AllianceRequestActionStatus = "Aceptada" | "Rechazada";

export interface UpdateAllianceRequestStatusPayload {
    estado: AllianceRequestActionStatus;
    motivoRechazo?: string;
}

export interface UpdateAllianceRequestStatusResponse {
    success: boolean;
    message: string;
    data?: AllianceRequestRecord;
}

export interface DeleteCenterAllianceResponse {
    success: boolean;
    message: string;
}

export type StaffStatus = "active" | "inactive";

export interface CenterStaffMember {
  id: string;
  doctorId: number;
  name: string;
  specialty: string;
  specialtyIds: string[];
  rating: number;
  yearsOfExperience: number;
  languages: string[];
  insuranceAccepted: string[];
  isFavorite: boolean;
  urlImage: string;
  joinDate: string;
  totalAppointments: number;
  status: StaffStatus;
}