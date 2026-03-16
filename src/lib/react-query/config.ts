import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración del QueryClient de React Query
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo de cache por defecto: 5 minutos
      staleTime: 1000 * 60 * 5,
      
      // Tiempo antes de que se considere garbage collection: 10 minutos
      gcTime: 1000 * 60 * 10,
      
      // Reintentar una vez en caso de error
      retry: 1,
      
      // Re-fetch al volver a la ventana
      refetchOnWindowFocus: false,
      
      // Re-fetch al reconectar
      refetchOnReconnect: true,
      
      // No re-fetch al montar si los datos son frescos
      refetchOnMount: false,
    },
    mutations: {
      // Reintentar mutaciones fallidas una vez
      retry: 1,
      
      // Callback de error global para todas las mutaciones
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// Query Keys centralizadas
export const QUERY_KEYS = {
  // Auth
  ME: ['me'],
  USER_PROFILE: ['user', 'profile'],
  
  // Appointments
  APPOINTMENTS: ['appointments'],
  APPOINTMENT_BY_ID: (id: string | number) => ['appointments', id],
  MY_APPOINTMENTS: ['appointments', 'my'],
  
  // Citas (Patient appointments from backend)
  CITAS: (filters?: Record<string, any>) => ['citas', filters].filter(Boolean),
  CITA_BY_ID: (id: string | number) => ['citas', id],
  CALENDARIO: (params?: Record<string, any>) => ['citas', 'calendario', params].filter(Boolean),
  
  // Doctors
  DOCTORS: ['doctors'],
  DOCTOR_BY_ID: (id: string | number) => ['doctors', id],
  MY_DOCTORS: (filters?: Record<string, any>) => ['doctors', 'my', filters].filter(Boolean),
  
  // Patients
  PATIENTS: ['patients'],
  PATIENT_BY_ID: (id: string | number) => ['patients', id],
  MY_PATIENTS: ['patients', 'my'],
  
  // Centers
  CENTERS: ['centers'],
  CENTER_BY_ID: (id: string | number) => ['centers', id],
  
  // Conversations & Messages
  CONVERSATIONS: ['conversations'],
  CONVERSATION_BY_ID: (id: string | number) => ['conversations', id],
  MESSAGES: (conversationId: string | number) => ['conversations', conversationId, 'messages'],
  
  // Notifications
  NOTIFICATIONS: ['notifications'],
  UNREAD_NOTIFICATIONS: ['notifications', 'unread'],
  
  // Locations
  PROVINCIAS: ['provincias'],
  MUNICIPIOS: ['municipios'],
  MUNICIPIOS_BY_PROVINCIA: (provinciaId: string | number) => ['municipios', 'provincia', provinciaId],
  
  // Especialidades (datos relativamente estáticos)
  ESPECIALIDADES: (language?: string, params?: Record<string, any>) => 
    ['especialidades', language, params].filter(Boolean),
  ESPECIALIDADES_CUSTOM: (params?: Record<string, any>) => ['especialidades', 'custom', params],

  // Tipos de centro (datos relativamente estáticos)
  TIPOS_CENTROS: (language?: string, params?: Record<string, any>) => 
    ['tipos_centro', language, params].filter(Boolean),
  TIPOS_CENTRO_CUSTOM: (params?: Record<string, any>) => ['tipos_centro', 'custom', params],

  UBICACIONES: ( nivel: string, params?: Record<string, any>) => 
    ['ubicaciones', nivel, params].filter(Boolean),

  // Alergias (datos relativamente estáticos)
  AVAILABLE_ALLERGIES: (language?: string) => 
    ['allergies', 'available', language].filter(Boolean),
  MY_ALLERGIES: (language?: string) => 
    ['allergies', 'my', language].filter(Boolean),

  // Condiciones médicas (datos relativamente estáticos)
  AVAILABLE_CONDITIONS: (language?: string) => 
    ['conditions', 'available', language].filter(Boolean),
  MY_CONDITIONS: (language?: string) => 
    ['conditions', 'my', language].filter(Boolean),

  // Seguros (datos relativamente estáticos)
  AVAILABLE_INSURANCES: (language?: string) => 
    ['insurances', 'available', language].filter(Boolean),
  POPULAR_INSURANCES: (language?: string) => 
    ['insurances', 'popular', language].filter(Boolean),
  MY_INSURANCES: (language?: string) => 
    ['insurances', 'my', language].filter(Boolean),
  ACCEPTED_INSURANCES: (language?: string) => 
    ['insurances', 'accepted', language].filter(Boolean),
  INSURANCE_TYPES: (language?: string) => 
    ['insurances', 'types', language].filter(Boolean),

  // Doctor Stats
  DOCTOR_STATS_RESUMEN: ['doctor', 'stats', 'resumen'],
  DOCTOR_STATS_PRODUCTIVIDAD: ['doctor', 'stats', 'productividad'],
  DOCTOR_STATS_SERVICIOS_UTILIZADOS: ['doctor', 'stats', 'servicios-utilizados'],
  DOCTOR_STATS_CITAS: ['doctor', 'stats', 'citas'],
  DOCTOR_STATS_PACIENTES: ['doctor', 'stats', 'pacientes'],
  DOCTOR_STATS_SERVICIOS: ['doctor', 'stats', 'servicios'],
  DOCTOR_PATIENT_INFO: (patientId: string | number) => ['doctor', 'patients', 'info', patientId],
} as const;

export default queryClient;
