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
  
  // Doctors
  DOCTORS: ['doctors'],
  DOCTOR_BY_ID: (id: string | number) => ['doctors', id],
  MY_DOCTORS: ['doctors', 'my'],
  
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
} as const;

export default queryClient;
