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

    // Eliminar cuenta
    DELETE_ACCOUNT: '/auth/cuenta',
  },

  // --- CITAS (APPOINTMENTS) ---
  APPOINTMENTS: {
    BASE: '/appointments',
    BY_ID: (id: string | number) => `/appointments/${id}`,
    CANCEL: (id: string | number) => `/appointments/${id}/cancel`,
    RESCHEDULE: (id: string | number) => `/appointments/${id}/reschedule`,
  },

  // --- CITAS DEL PACIENTE ---
  CITAS: {
    LIST: '/citas',
    BY_ID: (id: string | number) => `/citas/${id}`,
    CANCEL: (id: string | number) => `/citas/${id}/cancelar`,
    TO_DOCTORS: '/citas/doctor',
    CALENDARIO: '/citas/calendario',
    MIS_DOCTORES: '/citas/mis-doctores',
    MIS_PACIENTES: '/citas/mis-pacientes',
    DIAGNOSTICAR: (id: string | number) => `/citas/${id}/diagnosticar`,
    HISTORIAL_SELF: '/citas/historial',
    HISTORIAL: (pacienteId: string | number) => `/citas/historial/${pacienteId}`,
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
    BASE: '/conversaciones',
    BY_ID: (id: string | number) => `/conversaciones/${id}`,
    GET_OR_CREATE: '/conversaciones/obtener-o-crear',
    MESSAGES: (conversacionId: string | number) => `/conversaciones/${conversacionId}/mensajes`,
    SEND_MESSAGE: (conversacionId: string | number) => `/conversaciones/${conversacionId}/mensajes`,
    MARK_READ: (conversacionId: string | number) => `/conversaciones/${conversacionId}/marcar-leidos`,
    UNREAD_COUNT: (conversacionId: string | number) => `/conversaciones/${conversacionId}/no-leidos`,
    SEARCH_MESSAGES: (conversacionId: string | number) => `/conversaciones/${conversacionId}/buscar`,
  },

  MESSAGES: {
    BASE: '/mensajes',
    BY_ID: (id: string | number) => `/mensajes/${id}`,
    EDIT: (id: string | number) => `/mensajes/${id}`,
    DELETE: (id: string | number) => `/mensajes/${id}`,
  },

  // --- MEDIA / ARCHIVOS ---
  MEDIA: {
    UPLOAD: '/media',
    DOWNLOAD: (mediaId: string | number) => `/media/${mediaId}`,
    DELETE: (mediaId: string | number) => `/media/${mediaId}`,
  },

  // --- NOTIFICACIONES ---
  NOTIFICATIONS: {
    BASE: '/notificaciones',
    BY_ID: (id: string | number) => `/notificaciones/${id}`,
    MARK_AS_READ: (id: string | number) => `/notificaciones/${id}/leer`,
    MARK_ALL_AS_READ: '/notificaciones/leer-todas',
    UNREAD_COUNT: '/notificaciones/no-leidas/contar',
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
    BY_ID: (id: string | number) => `/centros-salud/${id}`,
    TIPOS: '/tipos-centros-salud',
    SEGUROS: '/centros-salud/seguros',
    SOLICITUDES_ALIANZA: '/centros-salud/solicitudes-alianza',
    SOLICITUDES_ALIANZA_BY_ID: (id: string | number) => `/centros-salud/solicitudes-alianza/${id}`,
    STATS: {
      GENERAL: '/centros-salud/estadisticas/general',
      CRECIMIENTO_MEDICOS: '/centros-salud/estadisticas/crecimiento-medicos',
      DISTRIBUCION_ESPECIALIDADES: '/centros-salud/estadisticas/distribucion-especialidades',
    },
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

  // --- RESEÑAS ---
  RESENAS: {
    CREATE: '/resenas',
  },

  // --- Ubicaciones ---
  UBICACIONES: {
    PROVINCIAS: '/provincias',
    MUNICIPIOS: (idProvincia: string | number) => `/municipios/provincia/${idProvincia}`,
    DISTRITOS: (idMunicipio: string | number) => `/distritos/municipio/${idMunicipio}`,
    SECCIONESBYDISTRITO: (idDistrito: string | number) => `/secciones/por-distrito/${idDistrito}`,
    SECCIONESBYMUNICIPIO: (idMunicipio: string | number) => `/secciones/por-municipio/${idMunicipio}`,
    BARRIOS: (idSeccion: string | number) => `/barrios/seccion/${idSeccion}`,
    SUBBARRIOS: (idBarrio: string | number) => `/subbarrios/barrio/${idBarrio}`,
    GEOPOINTS_BY_BARRIOS: (idBarrio: string | number) => `/barrios/geo/${idBarrio}`,
    BARRIO_BY_GEOPOINT: '/barrios/geo/punto',
    LOCATIONS_BY_DOCTOR: '/ubicaciones/mis-ubicaciones',
    CREATE_LOCATION: '/ubicaciones/mis-ubicaciones',
    LOCATION_BY_ID: (id: string | number) => `/ubicaciones/${id}`,
    CREATE_LOCATION_FOR_HEALTH_CENTER: '/ubicaciones',
  },

  // --- Tipos de centro ---
  TIPOS_CENTRO: {
    BASE: '/tipos-centros-salud',
    BY_ID: (id: string | number) => `/ubicaciones/${id}`,
  },

  // --- SEGUROS ---
  SEGUROS: {
    ACEPTADOS: '/seguros/seguros-aceptados',
  },

  // --- ESTADÍSTICAS DEL DOCTOR ---
  DOCTOR_STATS: {
    RESUMEN: '/doctores/estadisticas/resumen',
    PRODUCTIVIDAD: '/doctores/estadisticas/productividad',
    SERVICIOS_UTILIZADOS: '/doctores/estadisticas/servicios-mas-utilizados',
    CITAS: '/doctores/estadisticas/citas',
    PACIENTES: '/doctores/estadisticas/pacientes',
    SERVICIOS: '/doctores/estadisticas/servicios',
  },

  // --- DOCTORES ---
  DOCTORES: {
    PACIENTE_INFO: (pacienteId: string | number) => `/doctores/pacientes-info/${pacienteId}`,
    SOLICITUDES_ALIANZA: '/doctores/solicitudes-alianza',
    SOLICITUDES_ALIANZA_BY_ID: (id: string | number) => `/doctores/solicitudes-alianza/${id}`,
  },
  // --- TELECONSULTAS ---
  TELECONSULTAS: {
    /** GET  – Paciente obtiene su URL de acceso */
    URL_ACCESO: (citaId: string | number) => `/teleconsultas/${citaId}/url-acceso`,
    /** POST – Doctor inicia la sala y obtiene su URL */
    INICIAR: (citaId: string | number) => `/teleconsultas/${citaId}/iniciar`,
    /** POST – Cualquiera finaliza la llamada */
    FINALIZAR: (citaId: string | number) => `/teleconsultas/${citaId}/finalizar`,
  },
} as const;

export default API_ENDPOINTS;
