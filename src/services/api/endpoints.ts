export const API_ENDPOINTS = {
  // --- AUTENTICACIÓN ---
  AUTH: {
    LOGIN: '/auth/login',
    GOOGLE_LOGIN: '/auth/google',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-access-token',
    
    // Registro
    REGISTRO_SOLICITAR_CODIGO: '/auth/registro/solicitar-codigo',
    REGISTRO_VALIDAR_CODIGO: '/auth/registro/validar-codigo',
    REGISTRO_COMPLETAR_PACIENTE: '/auth/registro/paciente',
    REGISTRO_COMPLETAR_DOCTOR: '/auth/registro/doctor',
    
    // Recuperación de contraseña
    FORGOT_PASSWORD: '/auth/forgot-password',
    PASSWORD_SOLICITAR_CODIGO: '/auth/password/solicitar-codigo',
    PASSWORD_VALIDAR_CODIGO: '/auth/password/validar-codigo',
    PASSWORD_CAMBIAR: '/auth/password/cambiar',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    VERIFICAR_DOCUMENTO: '/auth/verificar-documento',
    
    // Cambio de email
    EMAIL_SOLICITAR_CODIGO: '/auth/registro/solicitar-codigo',
    EMAIL_VALIDAR_CODIGO: '/auth/registro/validar-codigo',
    EMAIL_CAMBIAR: '/auth/cambiar-email',
  },
  
  // --- CITAS (APPOINTMENTS) ---
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id: string | number) => `/appointments/${id}`,
    CANCEL: (id: string | number) => `/appointments/${id}/cancel`,
    RESCHEDULE: (id: string | number) => `/appointments/${id}/reschedule`,
  },
  
  // --- PERFILES ---
  PROFILES: {
    ME: '/profiles/me',
    UPDATE: '/profiles/me',
    DOCTORS: '/doctors',
    DOCTOR_BY_ID: (id: string | number) => `/doctors/${id}`,
    PATIENTS: '/patients',
    PATIENT_BY_ID: (id: string | number) => `/patients/${id}`,
    CENTERS: '/centers',
    CENTER_BY_ID: (id: string | number) => `/centers/${id}`,
  },
  
  // --- CONVERSACIONES Y MENSAJES ---
  CONVERSATIONS: {
    BASE: '/conversations',
    BY_ID: (id: string | number) => `/conversations/${id}`,
    MESSAGES: (conversationId: string | number) => `/conversations/${conversationId}/messages`,
  },
  
  MESSAGES: {
    BASE: '/messages',
    BY_ID: (id: string | number) => `/messages/${id}`,
  },
  
  // --- NOTIFICACIONES ---
  NOTIFICATIONS: {
    BASE: '/notifications',
    BY_ID: (id: string | number) => `/notifications/${id}`,
    MARK_AS_READ: (id: string | number) => `/notifications/${id}/read`,
    MARK_ALL_AS_READ: '/notifications/read-all',
  },
  
  // --- UBICACIONES ---
  LOCATIONS: {
    PROVINCIAS: '/provincias',
    MUNICIPIOS: '/municipios',
    MUNICIPIOS_BY_PROVINCIA: (provinciaId: string | number) => `/provincias/${provinciaId}/municipios`,
    DISTRITOS_MUNICIPALES: '/distritos-municipales',
    SECCIONES: '/secciones',
    BARRIOS: '/barrios',
    SUBBARRIOS: '/subbarrios',
  },
  
  // --- SERVICIOS Y HORARIOS ---
  SERVICES: {
    BASE: '/servicios',
    TIPOS: '/tipos-servicios',
    HORARIOS: '/horarios',
    SERVICIOS_HORARIOS: '/servicios-horarios',
  },
  
  // --- CENTROS DE SALUD ---
  HEALTH_CENTERS: {
    BASE: '/centros-salud',
    TIPOS: '/tipos-centros-salud',
  },
  
  // --- PROFESIONES Y EXPERIENCIA ---
  PROFESSIONS: {
    BASE: '/profesiones',
    EXPERIENCIAS: '/experiencias-laborales',
  },
  
  // --- ESPECIALIDADES MÉDICAS ---
  ESPECIALIDADES: {
    BASE: '/especialidades',
    BY_ID: (id: string | number) => `/especialidades/${id}`,
  },
  
  // --- TRADUCTOR ---
  TRANSLATOR: {
    TRANSLATE: '/traductor',
    UTILITIES: '/traductor/utilidades',
  },
} as const;

export default API_ENDPOINTS;
