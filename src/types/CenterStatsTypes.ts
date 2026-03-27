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
