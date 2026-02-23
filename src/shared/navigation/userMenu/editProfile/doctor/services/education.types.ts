export interface Pais {
  id: number;
  nombre: string;
  codigo: string;
  estado: string;
}

export interface Universidad {
  id: number;
  nombre: string;
  paisId: number;
  estado: string;
}

export interface FormacionAcademicaBackend {
  id: number;
  universidadId: number;
  nombre: string;
  universidad: Universidad;
  fechaInicio: string;
  fechaFinalizacion: string | null;
  enCurso: boolean;
  estado: string;
}

export interface CreateFormacionAcademicaRequest {
  universidadId: number;
  nombre: string;
  fechaInicio: string;
  fechaFinalizacion?: string | null;
  enCurso: boolean;
  estado: string;
}

export interface UpdateFormacionAcademicaRequest extends CreateFormacionAcademicaRequest {}
