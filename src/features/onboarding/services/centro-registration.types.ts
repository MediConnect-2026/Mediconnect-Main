export interface RegisterCenterRequest {
  token: string;
  nombreComercial: string;
  rnc: string;
  descripcion: string;
  telefono: string;
  email: string;
  direccion: string;
  barrioId: number;
  ubicacionId: number;
  sitioWeb: string;
  password: string;
  tipoCentroId: number;
  codigoPostal?: string;
  fotoPerfil?: File | Blob; // opcional
  certificadoSanitario : File | Blob;
}

export interface RegisterCenterResponse {
  success: boolean;
  message: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}