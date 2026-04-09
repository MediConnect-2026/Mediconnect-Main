export interface TipoSeguro {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export interface Seguro {
  id: number;
  nombre: string;
  urlImage: string | null;
  estado: string;
  creadoEn: string;
}

export interface SeguroAceptado {
  seguro: Seguro;
  tipoSeguro: TipoSeguro;
  estado: string;
  creadoEn: string;
}

export interface ObtenerSegurosAceptadosResponse {
  success: boolean;
  message: string;
  data: SeguroAceptado[];
}

export interface ObtenerSegurosAceptadosParams {
  target?: string;
  translate_fields?: string;
}
