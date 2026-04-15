// Datos mock para la búsqueda inteligente
export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
}

export interface Specialty {
  id: string;
  name: string;
}

export interface InsurancePlan {
  id: string;
  name: string;
  popular: boolean;
}

export const specialties: Specialty[] = [];
export const doctors: Doctor[] = [];
export const insurancePlans: InsurancePlan[] = [];
