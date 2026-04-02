export interface CenterStats {
  totalMedicos: number;
  totalEspecialidades: number;
  citasSemanaActual: number;
  valoracionPromedio: number | null;
}

export interface CenterStatsResponse {
  success: boolean;
  data: CenterStats;
}

export interface CenterSpecialtyDistributionItem {
  id: number;
  nombre: string;
  totalMedicos: number;
  porcentaje: number;
}

export interface CenterSpecialtiesDistributionResponse {
  success: boolean;
  especialidades: CenterSpecialtyDistributionItem[];
  total: number;
}

export type CenterGrowthPeriod = "semana" | "mes" | "3meses" | "año" | "todo";

export interface CenterDoctorsGrowthPoint {
  label: string;
  total: number;
  nuevos: number;
}

export interface CenterDoctorsGrowthResponse {
  success: boolean;
  periodo: CenterGrowthPeriod;
  totalActual: number;
  puntos: CenterDoctorsGrowthPoint[];
}
