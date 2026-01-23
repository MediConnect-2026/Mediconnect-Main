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
  coordinates: {
    lat: number;
    lng: number;
  };
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
  }[];
  isConnected?: boolean;
  isFavorite?: boolean; // <-- Agrega esta línea
}

export interface Clinic extends BaseProvider {
  type: "clinic";
  specialties: string[];
  modality: ("Presencial" | "Virtual")[];
  isConnected?: boolean;
}

export type Provider = Doctor | Clinic;

export const doctors: Doctor[] = [
  {
    id: "d1",
    type: "doctor",
    name: "Dr. Cristoforo Criparni",
    specialty: "Ginecólogo",
    rating: 4.8,
    reviewCount: 121,
    address: [
      "Av. Sarasota #56, Plaza Médica Sarasota, Piso 2",
      "Calle 1, Torre Médica 3, Santo Domingo",
      "Av. Bolívar 123, Consultorio 5, Santo Domingo",
    ],
    languages: ["Español", "Inglés"],
    modality: ["Presencial", "Virtual"],
    insurances: ["ARS Senasa", "Mapfre Salud", "ARS Senasa", "Mapfre Salud"],
    experience: 8,
    specialties: ["Ginecología General", "Fertilidad"],
    bio: "Especialista en salud femenina y cuidado reproductivo con más de 12 años de experiencia.",
    image: "",
    coordinates: { lat: 18.4655, lng: -69.9295 },
    availability: [
      { date: "Oct 28", dayName: "Mar", slots: 13 },
      { date: "Oct 29", dayName: "Mié", slots: 5 },
      { date: "Oct 30", dayName: "Jue", slots: 0 },
      { date: "Oct 31", dayName: "Vie", slots: 2 },
      { date: "Nov 1", dayName: "Sáb", slots: 15 },
      { date: "Nov 2", dayName: "Dom", slots: 13 },
      { date: "Nov 3", dayName: "Lun", slots: 11 },
    ],
    isConnected: true,
    isFavorite: false, // <-- Agrega esto
  },
  {
    id: "d2",
    type: "doctor",
    name: "Dr. Leonardo Aleredo Perozo Freites",
    specialty: "Terapeuta",
    rating: 4.7,
    reviewCount: 20,
    address: [
      "C. Mahatma Gandhi 101, Santo Domingo",
      "Av. Winston Churchill 200, Torre Empresarial, Santo Domingo",
      "Calle El Sol 45, Plaza Médica, Santiago",
    ],
    languages: ["Español"],
    modality: ["Presencial", "Virtual"],
    insurances: ["ARS Senasa"],
    experience: 8,
    specialties: ["Terapia Cognitiva", "Mindfulness"],
    bio: "Psicoterapeuta con 9 años de experiencia en ansiedad, depresión y manejo del estrés.",
    image:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face",
    coordinates: { lat: 18.4755, lng: -69.9195 },
    availability: [
      { date: "Oct 28", dayName: "Mar", slots: 13 },
      { date: "Oct 29", dayName: "Mié", slots: 5 },
      { date: "Oct 30", dayName: "Jue", slots: 0 },
      { date: "Oct 31", dayName: "Vie", slots: 2 },
      { date: "Nov 1", dayName: "Sáb", slots: 15 },
      { date: "Nov 2", dayName: "Dom", slots: 13 },
      { date: "Nov 3", dayName: "Lun", slots: 11 },
    ],
    isConnected: true,
    isFavorite: true, // <-- Agrega esto
  },
  {
    id: "d3",
    type: "doctor",
    name: "Dr. Diego de Jesús Ramírez Abreu",
    specialty: "Oftalmólogo",
    rating: 4.8,
    reviewCount: 12,
    address: "C. José Joaquín Pérez no 205, Santo Domingo",
    languages: ["Español", "Inglés", "Alemán"],
    modality: ["Presencial"],
    insurances: ["ARS humano", "ARS Universal", "ARS Senasa"],
    experience: 8,
    specialties: ["Oftalmología General", "Cirugía Láser"],
    bio: "Oftalmólogo con 8 años de experiencia en diagnóstico y tratamiento de enfermedades oculares.",
    image:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=200&h=200&fit=crop&crop=face",
    coordinates: { lat: 18.4855, lng: -69.9095 },
    availability: [
      { date: "Oct 28", dayName: "Mar", slots: 13 },
      { date: "Oct 29", dayName: "Mié", slots: 5 },
      { date: "Oct 30", dayName: "Jue", slots: 0 },
      { date: "Oct 31", dayName: "Vie", slots: 2 },
      { date: "Nov 1", dayName: "Sáb", slots: 15 },
      { date: "Nov 2", dayName: "Dom", slots: 13 },
      { date: "Nov 3", dayName: "Lun", slots: 11 },
    ],
    isConnected: false,
    isFavorite: false, // <-- Agrega esto
  },
  {
    id: "d4",
    type: "doctor",
    name: "Dr. Erick Saviñon Fernández",
    specialty: "Dermatólogo",
    rating: 4.8,
    reviewCount: 12,
    address: "Av. Sarasota #56, Plaza Médica Sarasota, Piso 2",
    additionalLocations: 2,
    languages: ["Español", "Inglés", "Francés"],
    modality: ["Presencial", "Virtual"],
    insurances: ["ARS humano", "ARS Universal", "ARS Senasa"],
    experience: 8,
    specialties: ["Dermatología Estética", "Tricología"],
    bio: "Dermatólogo con 8 años de experiencia en piel, cabello y estética avanzada.",
    image:
      "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face",
    coordinates: { lat: 18.4555, lng: -69.9395 },
    availability: [
      { date: "Oct 28", dayName: "Mar", slots: 13 },
      { date: "Oct 29", dayName: "Mié", slots: 5 },
      { date: "Oct 30", dayName: "Jue", slots: 0 },
      { date: "Oct 31", dayName: "Vie", slots: 2 },
      { date: "Nov 1", dayName: "Sáb", slots: 15 },
      { date: "Nov 2", dayName: "Dom", slots: 13 },
      { date: "Nov 3", dayName: "Lun", slots: 11 },
    ],
    isConnected: false,
    isFavorite: true, // <-- Agrega esto
  },
];

export const clinics: Clinic[] = [
  {
    id: "c1",
    type: "clinic",
    name: "Hospital Darío Contreras",
    rating: 4.8,
    address: "Av. Sarasota #56, Plaza Médica Sarasota, Piso 2",
    languages: ["Español", "Inglés", "Francés"],
    phone: "809-093-2342",
    insurances: ["ARS humano", "ARS Universal", "ARS Senasa"],
    specialties: ["Emergencias", "Cirugía", "Pediatría", "Ginecología"],
    modality: ["Presencial"],
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=200&h=200&fit=crop",
    coordinates: { lat: 18.4605, lng: -69.9245 },
    isConnected: false,
  },
  {
    id: "c2",
    type: "clinic",
    name: "Centro Médico UCE",
    rating: 4.6,
    address: "Av. Ecológica, Santo Domingo Este",
    languages: ["Español", "Inglés"],
    phone: "809-688-8888",
    insurances: ["ARS Senasa", "Mapfre Salud", "ARS Universal"],
    specialties: ["Medicina General", "Cardiología", "Neurología"],
    modality: ["Presencial", "Virtual"],
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=200&h=200&fit=crop",
    coordinates: { lat: 18.4705, lng: -69.8995 },
    isConnected: true,
  },
  {
    id: "c3",
    type: "clinic",
    name: "Clínica Abreu",
    rating: 4.9,
    address: "C. Beller 42, Santo Domingo",
    languages: ["Español", "Inglés", "Francés"],
    phone: "809-688-4411",
    insurances: ["ARS humano", "ARS Senasa", "OSDE", "Medicus"],
    specialties: ["Oncología", "Traumatología", "Cardiología"],
    modality: ["Presencial"],
    image:
      "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=200&h=200&fit=crop",
    coordinates: { lat: 18.4805, lng: -69.9345 },
    isConnected: false,
  },
];

export const allProviders: Provider[] = [...doctors, ...clinics];

export const specialties = [
  "Ginecología",
  "Dermatología",
  "Oftalmología",
  "Cardiología",
  "Pediatría",
  "Terapia",
  "Neurología",
  "Cirugía",
  "Medicina General",
];

export const insuranceOptions = [
  "ARS Senasa",
  "ARS humano",
  "ARS Universal",
  "Mapfre Salud",
  "OSDE",
  "Medicus",
];

export const modalityOptions = ["Presencial", "Virtual"];
