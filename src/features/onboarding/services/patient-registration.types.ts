// --- REGISTRO DE PACIENTE ---
export interface RegisterPatientRequest {
  token: string;
  nombre: string;
  apellido: string;
  numero_documento: string;
  tipo_documento: 'Cédula' | 'Pasaporte';
  password: string;
  fecha_nacimiento?: string; // formato date: "YYYY-MM-DD"
  genero?: 'M' | 'F' | 'O';
  altura?: number; // en cm
  peso?: number; // en kg
  tipo_sangre?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  fotoPerfil?: File | Blob;
  fotoDocumento?: File | Blob;
}

export interface RegisterPatientResponse {
  success: boolean;
  message: string;
}

// Tipo de error de la API
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}
