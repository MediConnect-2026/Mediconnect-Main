// --- REGISTRO DE DOCTOR ---

// Tipos para objetos complejos que se envían como JSON
export interface DoctorLocation {
  direccion: string;
  id_barrio: number;
  id_sub_barrio?: number;
}

export interface DoctorFormation {
  id_especialidad: number;
  id_universidad: number;
  fecha_inicio: string; // formato date: "YYYY-MM-DD"
  fecha_finalizacion: string; // formato date: "YYYY-MM-DD"
  estado: 'En Curso' | 'Finalizado';
}

export interface RegisterDoctorRequest {
  token: string;
  nombre: string;
  apellido: string;
  genero: 'M' | 'F' | 'O';
  fecha_nacimiento: string; // formato date: "YYYY-MM-DD"
  nacionalidad: string;
  telefono: string;
  tipo_documento: 'Cédula' | 'Pasaporte';
  numero_documento: string;
  password: string;
  exequatur: string;
  id_especialidad_principal: number;
  biografia?: string;
  ids_especialidades_secundarias?: number[];
  
  // Archivos
  fotoPerfil: File | Blob;
  fotoDocumento: (File | Blob)[]; // 1-2 archivos
  tituloAcademico: (File | Blob)[]; // 1-10 archivos
  certificaciones?: (File | Blob)[]; // 1+ archivos (opcional)
  
  // Campos opcionales
  formaciones?: DoctorFormation[];
  ubicacion?: DoctorLocation;
  descripciones_documentos?: string[];
  descripciones_titulos?: string[];
  descripciones_certificaciones?: string[];
}

export interface RegisterDoctorResponse {
  success: boolean;
  message: string;
}

// Tipo de error de la API
export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}
