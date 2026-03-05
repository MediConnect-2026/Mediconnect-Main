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
  connectionStatus?: "connected" | "not_connected" | "pending"; // <-- Cambia aquí
  isFavorite?: boolean;
}

export interface Clinic extends BaseProvider {
  type: "clinic";
  specialties: string[];
  modality: ("Presencial" | "Virtual")[];
  connectionStatus?: "connected" | "not_connected" | "pending"; // <-- Cambia aquí
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
    insurances: [
      "ARS Senasa",
      "Mapfre Salud",
      "ARS Senasa",
      "Mapfre Salud",
      "Mapfre Salud",
      "ARS Senasa",
      "Mapfre Salud",
    ],
    experience: 8,
    specialties: ["Ginecología General", "Fertilidad"],
    bio: `Especialista en salud femenina y cuidado reproductivo con más de 12 años de experiencia. 
La Dra. Criparni ha dedicado su carrera a la atención integral de la mujer, abordando desde consultas de rutina hasta tratamientos avanzados de fertilidad. 
Ha participado en múltiples congresos internacionales y es autora de varios artículos científicos sobre salud reproductiva. 
Su enfoque empático y personalizado le ha permitido acompañar a cientos de pacientes en diferentes etapas de su vida, brindando siempre un trato humano y actualizado. 
Además, colabora activamente con organizaciones sin fines de lucro para la educación y prevención de enfermedades ginecológicas en comunidades vulnerables. 
En su consulta, la Dra. Criparni prioriza la comunicación clara y la toma de decisiones informadas, asegurando que cada paciente reciba la mejor atención posible basada en evidencia científica y las últimas tecnologías médicas.`,
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
    connectionStatus: "connected", // <-- Cambia aquí
    isFavorite: false,
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
    bio: `Psicoterapeuta con 9 años de experiencia en el tratamiento de ansiedad, depresión y manejo del estrés. 
El Dr. Aleredo ha trabajado tanto en el sector público como privado, ayudando a pacientes de todas las edades a superar desafíos emocionales y psicológicos. 
Es reconocido por su enfoque integrador, combinando técnicas de terapia cognitivo-conductual con prácticas de mindfulness y meditación. 
Ha impartido talleres y conferencias sobre salud mental y autocuidado en diversas instituciones educativas y empresas. 
Su compromiso con el bienestar emocional lo ha llevado a desarrollar programas de apoyo psicológico para comunidades vulnerables. 
El Dr. Aleredo cree firmemente en la importancia de la escucha activa y la empatía, creando un espacio seguro donde los pacientes pueden expresar sus inquietudes y trabajar en su crecimiento personal.`,
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
    connectionStatus: "pending", // <-- Ejemplo de pendiente
    isFavorite: true,
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
    bio: `Oftalmólogo con 8 años de experiencia en el diagnóstico y tratamiento de enfermedades oculares. 
El Dr. Ramírez Abreu se especializa en cirugía láser y procedimientos mínimamente invasivos para mejorar la visión y la salud ocular. 
Ha realizado estudios de posgrado en Alemania y ha participado en investigaciones sobre nuevas tecnologías en oftalmología. 
Es miembro activo de asociaciones médicas nacionales e internacionales, y ha sido invitado como ponente en congresos especializados. 
Su trato cercano y profesional le ha permitido ganarse la confianza de sus pacientes, quienes destacan su dedicación y precisión en cada consulta. 
El Dr. Ramírez Abreu está comprometido con la educación continua y la actualización constante en los avances de su especialidad.`,
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
    connectionStatus: "not_connected", // <-- Ejemplo de no conectado
    isFavorite: false,
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
    bio: `Dermatólogo con 8 años de experiencia en el cuidado de la piel, cabello y estética avanzada. 
El Dr. Saviñon Fernández ha desarrollado su carrera en reconocidos centros dermatológicos, especializándose en tratamientos innovadores para enfermedades cutáneas y procedimientos estéticos. 
Ha publicado investigaciones sobre nuevas terapias en dermatología y participa activamente en congresos internacionales. 
Su pasión por la medicina estética lo ha llevado a perfeccionar técnicas de rejuvenecimiento facial y tratamientos capilares. 
Es conocido por su atención personalizada y su capacidad para explicar de manera clara los procedimientos a sus pacientes, generando confianza y tranquilidad. 
El Dr. Saviñon Fernández también colabora en campañas de prevención y educación sobre el cuidado de la piel en la comunidad.`,
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
    connectionStatus: "not_connected",
    isFavorite: true,
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
    connectionStatus: "not_connected",
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
    connectionStatus: "connected",
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
    connectionStatus: "pending",
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
