export type ProviderType = "doctor" | "clinic";

export interface BaseProvider {
  id: string;
  type: ProviderType;
  name: string;
  rating: number;
  reviewCount?: number;
  address: string[] | string;
  languages: string[];
  insurances: string[];
  phone?: string;
  image: string;
  coordinates: { lat: number; lng: number } | { lat: number; lng: number }[];
}

export interface Doctor extends BaseProvider {
  type: "doctor";
  specialty: string;
  additionalLocations?: number;
  modality: ("Presencial" | "Virtual")[];
  experience: number;
  specialties: string[];
  bio: string;
  availability: {
    date: string;
    dayName: string;
    slots: number;
    month?: string;
  }[];
  connectionStatus?: "connected" | "not_connected" | "pending";
  isFavorite?: boolean;
}

export interface Clinic extends BaseProvider {
  type: "clinic";
  specialties: string[];
  modality: ("Presencial" | "Virtual")[];
  connectionStatus?: "connected" | "not_connected" | "pending";
}

export type Provider = Doctor | Clinic;

export const doctors: Doctor[] = [];
export const clinics: Clinic[] = [];
export const allProviders: Provider[] = [];

export const specialties: string[] = [];
export const insuranceOptions: string[] = [];
export const modalityOptions: ("Presencial" | "Virtual")[] = [];
