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