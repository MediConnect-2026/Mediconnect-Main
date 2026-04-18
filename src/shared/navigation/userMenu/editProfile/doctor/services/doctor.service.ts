import apiClient from '@/services/api/client';
import API_ENDPOINTS from '@/services/api/endpoints';
import type {
  CenterProfileTranslationParams,
  DoctorAllianceRequestPayload,
  CreateDoctorAllianceRequestResponse,
  GetCenterAllianceRequestsResponse,
  UpdateAllianceRequestStatusPayload,
  UpdateAllianceRequestStatusResponse,
} from '../../center/services/center.types';
import type {
  GetDoctorProfileResponse,
  DoctorServiceError,
  UpdateDoctorProfileRequest,
  UpdateDoctorProfileResponse,
  UpdateDoctorProfileError,
  UpdateProfilePhotoResponse,
  UpdateProfilePhotoError,
  UpdateBannerResponse,
  UpdateBannerError,
  UpdateRejectedDocumentRequest,
  UpdateRejectedDocumentResponse,
  UpdateDocumentError,
  GetExperienciasLaboralesResponse,
  GetExperienciasLaboralesParams,
  CreateExperienciaLaboralRequest,
  CreateExperienciaLaboralResponse,
  UpdateExperienciaLaboralRequest,
  UpdateExperienciaLaboralResponse,
  DeleteExperienciaLaboralResponse,
  ExperienciaLaboralError,
  GetAvailableInsurancesResponse,
  GetAvailableInsuranceTypesResponse,
  GetAcceptedInsurancesResponse,
  AddAcceptedInsuranceRequest,
  AddAcceptedInsuranceResponse,
  RemoveAcceptedInsuranceResponse,
  InsuranceError,
  GetDoctorLanguagesResponse,
  AddDoctorLanguageRequest,
  AddDoctorLanguageResponse,
  UpdateDoctorLanguageRequest,
  UpdateDoctorLanguageResponse,
  DeleteDoctorLanguageResponse,
  LanguageError,
  CreateDoctorServiceResponse,
  CreateDoctorServiceRequest,
  GetServicesOfDoctorResponse,
  GetDoctoresByDistanceResponse,
  UpdateStatusDoctorServiceResponse,
  DeleteDoctorServiceResponse,
  AddImageToServiceResponse,
  RemoveImageFromServiceResponse,
  UpdateDoctorServiceRequest,
  GetServiceByIdResponse,
  Doctor,
  GetSlotsAvailableForServiceResponse,
  GetDoctorMyCentersResponse,
  DeleteDoctorAllianceResponse,
} from './doctor.types';

/**
 * Servicio para gestionar el perfil del doctor autenticado
 */
export const doctorService = {
  createAllianceRequest: async (
    payload: DoctorAllianceRequestPayload,
  ): Promise<CreateDoctorAllianceRequestResponse> => {
    try {
      const { data } = await apiClient.post<CreateDoctorAllianceRequestResponse>(
        API_ENDPOINTS.DOCTORES.SOLICITUDES_ALIANZA,
        payload,
      );

      if (!data.success) {
        const message =
          typeof data.message === 'string'
            ? data.message
            : 'No se pudo enviar la solicitud de alianza.';
        throw new Error(message);
      }

      return data;
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        throw new Error(apiMessage);
      }

      throw new Error('No se pudo enviar la solicitud de alianza.');
    }
  },

  /**
   * Obtiene el perfil completo del doctor autenticado
   * @returns Respuesta con los datos del perfil del doctor
   * 
   * Este endpoint devuelve información completa del doctor incluyendo:
   * - Datos personales (nombre, apellido, fecha de nacimiento, género, etc.)
   * - Datos profesionales (exequatur, biografía, años de experiencia, etc.)
   * - Especialidades (principal y secundarias)
   * - Documentos (cédula, título académico, certificaciones)
   * - Estado de verificación
   * - Ubicación
   * - Formaciones académicas
   */
  getProfile: async (params?: any): Promise<GetDoctorProfileResponse> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.target) searchParams.append('target', params.target);
      if (params?.source) searchParams.append('source', params.source);
      if (params?.translate_fields) searchParams.append('translate_fields', params.translate_fields);

      const queryString = searchParams.toString();
      const url = queryString
        ? `/doctores/me?${queryString}`
        : `/doctores/me`;

      const response = await apiClient.get<GetDoctorProfileResponse>(url);

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener perfil de doctor:', error);

      // El apiClient ya maneja los errores comunes (401, 403, etc.)
      // Aquí solo manejamos errores específicos del endpoint
      const errorData = error.response?.data as DoctorServiceError;

      if (error.response?.status === 404) {
        throw new Error('Perfil de doctor no encontrado.');
      }

      // Error genérico del servidor o del cliente API
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener el perfil del doctor. Intenta nuevamente.'
      );
    }
  },

  /**
   * Actualiza el perfil del doctor autenticado
   * @param data - Datos del perfil a actualizar
   * @returns Respuesta con los datos actualizados
   * 
   * Campos actualizables:
   * - nombre: Nombre del doctor
   * - apellido: Apellido del doctor
   * - telefono: Número de teléfono
   * - biografia: Biografía profesional
   * - anosExperiencia: Años de experiencia
   * - tarifas: Tarifa por consulta
   * - duracionCitaPromedio: Duración promedio de cita en minutos
   * - nacionalidad: Nacionalidad del doctor
   * - estado: Estado del perfil (Activo/Inactivo)
   */
  getDoctorById: async (id: number, params?: any): Promise<{ success: boolean; data: Doctor }> => {
    try {
      const searchParams = new URLSearchParams();
      if (params?.target) searchParams.append('target', params.target);
      if (params?.source) searchParams.append('source', params.source);
      if (params?.translate_fields) searchParams.append('translate_fields', params.translate_fields);

      const queryString = searchParams.toString();
      const url = queryString
        ? `/doctores/${id}?${queryString}`
        : `/doctores/${id}`;

      const response = await apiClient.get<{ success: boolean; data: Doctor }>(url);
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener perfil de doctor por ID:', error);
      const errorData = error.response?.data as DoctorServiceError;
      if (error.response?.status === 404) {
        throw new Error('Perfil de doctor no encontrado.');
      }
      throw new Error(errorData?.message || 'Error al obtener el perfil del doctor.');
    }
  },

  getMyCenters: async (params?: any): Promise<GetDoctorMyCentersResponse> => {
    try {
      const response = await apiClient.get<GetDoctorMyCentersResponse>(
        '/doctores/mis-centros',
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener centros del doctor:', error);
      const errorData = error.response?.data as DoctorServiceError;

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener los centros del doctor. Intenta nuevamente.'
      );
    }
  },

  deleteAllianceRequest: async (
    requestId: string | number
  ): Promise<DeleteDoctorAllianceResponse> => {
    try {
      const response = await apiClient.delete<DeleteDoctorAllianceResponse>(
        API_ENDPOINTS.DOCTORES.SOLICITUDES_ALIANZA_BY_ID(requestId),
      );

      if (!response.data?.success) {
        throw new Error('No se pudo eliminar la alianza con el centro.');
      }

      return response.data;
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        throw new Error(apiMessage);
      }

      throw new Error('No se pudo eliminar la alianza con el centro.');
    }
  },

  getDoctorAllianceRequests: async (
    params?: CenterProfileTranslationParams,
  ): Promise<GetCenterAllianceRequestsResponse> => {
    try {
      const { data } = await apiClient.get<GetCenterAllianceRequestsResponse>(
        API_ENDPOINTS.DOCTORES.SOLICITUDES_ALIANZA,
        {
          params,
        },
      );

      if (!data.success) {
        throw new Error('No se pudieron obtener las solicitudes de alianza.');
      }

      return data;
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        throw new Error(apiMessage);
      }

      throw new Error('No se pudieron obtener las solicitudes de alianza.');
    }
  },

  updateAllianceRequestStatus: async (
    requestId: string | number,
    payload: UpdateAllianceRequestStatusPayload,
  ): Promise<UpdateAllianceRequestStatusResponse> => {
    try {
      const { data } = await apiClient.put<UpdateAllianceRequestStatusResponse>(
        API_ENDPOINTS.DOCTORES.SOLICITUDES_ALIANZA_BY_ID(requestId),
        payload,
      );

      if (!data.success) {
        throw new Error('No se pudo actualizar la solicitud de alianza.');
      }

      return data;
    } catch (error: any) {
      const apiMessage = error?.response?.data?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
        throw new Error(apiMessage);
      }

      throw new Error('No se pudo actualizar la solicitud de alianza.');
    }
  },

  updateProfile: async (
    data: UpdateDoctorProfileRequest
  ): Promise<UpdateDoctorProfileResponse> => {
    try {
      const response = await apiClient.patch<UpdateDoctorProfileResponse>(
        '/doctores/me',
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al actualizar perfil:', error);

      // El apiClient ya maneja los errores comunes (401, 403, etc.)
      // Aquí solo manejamos errores específicos del endpoint
      const errorData = error.response?.data as UpdateDoctorProfileError;

      if (error.response?.status === 404) {
        throw new Error('Perfil de doctor no encontrado.');
      }

      if (error.response?.status === 409) {
        throw new Error('El exequatur o documento de identidad ya existe.');
      }

      // Error genérico del servidor o del cliente API
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al actualizar el perfil. Intenta nuevamente.'
      );
    }
  },

  /**
   * Actualiza un documento rechazado del doctor
   * @param documentId - ID del documento a actualizar
   * @param data - Archivo y descripción opcional
   * @returns Respuesta de confirmación
   * 
   * Requisitos:
   * - El doctor debe estar en estado "En revisión"
   * - El documento debe estar en estado "Rechazado"
   * - Archivo: JPG, PNG, WebP o PDF (máx 5MB)
   * 
   * El documento cambiará a estado "Pendiente" y se creará una nueva acción de revisión
   */
  updateRejectedDocument: async (
    documentId: number,
    data: UpdateRejectedDocumentRequest
  ): Promise<UpdateRejectedDocumentResponse> => {
    try {
      // Validar tipo de archivo
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'application/pdf'
      ];
      if (!allowedTypes.includes(data.archivo.type)) {
        throw new Error('Solo se permiten imágenes (JPEG, PNG, WEBP) o PDF');
      }

      // Validar tamaño (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (data.archivo.size > maxSize) {
        throw new Error('El archivo supera el tamaño máximo de 5MB');
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('archivo', data.archivo);
      if (data.descripcion) {
        formData.append('descripcion', data.descripcion);
      }

      const response = await apiClient.put<UpdateRejectedDocumentResponse>(
        `/doctores/documentos/${documentId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al actualizar documento:', error);

      const errorData = error.response?.data as UpdateDocumentError;

      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message ||
          'El documento no está en estado rechazado o el archivo es inválido.'
        );
      }

      if (error.response?.status === 403) {
        throw new Error(
          'No tienes permiso para actualizar este documento o tu cuenta no está en revisión.'
        );
      }

      if (error.response?.status === 404) {
        throw new Error('Documento no encontrado.');
      }

      // Error genérico del servidor o del cliente API
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al actualizar el documento. Intenta nuevamente.'
      );
    }
  },

  /**
   * Actualiza la foto de perfil del doctor autenticado
   * @param file - Archivo de imagen (JPEG, PNG, WEBP, máximo 5MB)
   * @returns Respuesta con la URL de la nueva foto de perfil
   */
  updateProfilePhoto: async (
    file: File
  ): Promise<UpdateProfilePhotoResponse> => {
    try {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten imágenes (JPEG, PNG, WEBP)');
      }

      // Validar tamaño (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        throw new Error('La imagen supera el tamaño máximo de 5MB');
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('fotoPerfil', file);

      const response = await apiClient.patch<UpdateProfilePhotoResponse>(
        '/auth/foto-perfil',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al actualizar foto de perfil:', error);

      const errorData = error.response?.data as UpdateProfilePhotoError;

      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message ||
          'La foto de perfil es inválida o supera el tamaño permitido.'
        );
      }

      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado.');
      }

      // Error genérico del servidor o del cliente API
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al actualizar la foto de perfil. Intenta nuevamente.'
      );
    }
  },

  /**
   * Actualiza el banner del doctor autenticado
   * @param file - Archivo de imagen (JPEG, PNG, WEBP, máximo 5MB)
   * @returns Respuesta con la URL del nuevo banner
   */
  updateBanner: async (
    file: File
  ): Promise<UpdateBannerResponse> => {
    try {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Solo se permiten imágenes (JPEG, PNG, WEBP)');
      }

      // Validar tamaño (5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB en bytes
      if (file.size > maxSize) {
        throw new Error('La imagen supera el tamaño máximo de 5MB');
      }

      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('banner', file);

      const response = await apiClient.patch<UpdateBannerResponse>(
        '/auth/banner',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al actualizar banner:', error);

      const errorData = error.response?.data as UpdateBannerError;

      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message ||
          'El banner es inválido o supera el tamaño permitido.'
        );
      }

      if (error.response?.status === 404) {
        throw new Error('Usuario no encontrado.');
      }

      // Error genérico del servidor o del cliente API
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al actualizar el banner. Intenta nuevamente.'
      );
    }
  },

  /**
   * Obtiene las experiencias laborales del doctor autenticado
   * @param params - Parámetros opcionales para traducción
   * @returns Respuesta con las experiencias laborales
   * 
   * Este endpoint devuelve todas las experiencias laborales del doctor.
   * Soporta traducción automática de campos mediante query params.
   */
  getExperienciasLaborales: async (
    params?: GetExperienciasLaboralesParams
  ): Promise<GetExperienciasLaboralesResponse> => {
    try {
      const response = await apiClient.get<GetExperienciasLaboralesResponse>(
        '/experiencias-laborales',
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener experiencias laborales:', error);

      const errorData = error.response?.data as DoctorServiceError;

      if (error.response?.status === 404) {
        // Si no hay experiencias, devolver array vacío
        return {
          success: true,
          message: 'No se encontraron experiencias laborales',
          data: {
            experiencias: [],
            total: 0
          }
        };
      }

      // Error genérico del servidor o del cliente API
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener las experiencias laborales. Intenta nuevamente.'
      );
    }
  },

  getExperienciasLaboralesByDoctorId: async (
    doctorId: number,
    params?: GetExperienciasLaboralesParams
  ): Promise<GetExperienciasLaboralesResponse> => {
    try {
      const response = await apiClient.get<GetExperienciasLaboralesResponse>(
        `/experiencias-laborales/doctor/${doctorId}`,
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener experiencias laborales:', error);

      const errorData = error.response?.data as DoctorServiceError;

      if (error.response?.status === 404) {
        // Si no hay experiencias, devolver array vacío
        return {
          success: true,
          message: 'No se encontraron experiencias laborales',
          data: {
            experiencias: [],
            total: 0
          }
        };
      }

      // Error genérico del servidor o del cliente API
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener las experiencias laborales. Intenta nuevamente.'
      );
    }
  },

  /**
   * Crea una nueva experiencia laboral para el doctor autenticado
   * @param data - Datos de la experiencia laboral
   * @returns Respuesta con la experiencia laboral creada
   * 
   * POST /experiencias-laborales
   */
  createExperienciaLaboral: async (
    data: CreateExperienciaLaboralRequest
  ): Promise<CreateExperienciaLaboralResponse> => {
    try {
      const response = await apiClient.post<CreateExperienciaLaboralResponse>(
        '/experiencias-laborales',
        {
          ...data,
          trabajaActualmente: data.trabajaActualmente ?? false,
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al crear experiencia laboral:', error);

      const errorData = error.response?.data as ExperienciaLaboralError;

      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message ||
          'Datos de experiencia laboral inválidos. Verifica los campos requeridos.'
        );
      }

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al crear la experiencia laboral. Intenta nuevamente.'
      );
    }
  },

  /**
   * Actualiza una experiencia laboral existente
   * @param id - ID de la experiencia laboral
   * @param data - Datos a actualizar
   * @returns Respuesta con la experiencia laboral actualizada
   * 
   * PUT /experiencias-laborales/{id}
   */
  updateExperienciaLaboral: async (
    id: number,
    data: UpdateExperienciaLaboralRequest
  ): Promise<UpdateExperienciaLaboralResponse> => {
    try {
      const response = await apiClient.put<UpdateExperienciaLaboralResponse>(
        `/experiencias-laborales/${id}`,
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al actualizar experiencia laboral:', error);

      const errorData = error.response?.data as ExperienciaLaboralError;

      if (error.response?.status === 404) {
        throw new Error('Experiencia laboral no encontrada.');
      }

      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message ||
          'Datos de experiencia laboral inválidos.'
        );
      }

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al actualizar la experiencia laboral. Intenta nuevamente.'
      );
    }
  },

  /**
   * Elimina una experiencia laboral (soft delete)
   * @param id - ID de la experiencia laboral a eliminar
   * @returns Respuesta de confirmación
   * 
   * DELETE /experiencias-laborales/{id}
   */
  deleteExperienciaLaboral: async (
    id: number
  ): Promise<DeleteExperienciaLaboralResponse> => {
    try {
      const response = await apiClient.delete<DeleteExperienciaLaboralResponse>(
        `/experiencias-laborales/${id}`
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al eliminar experiencia laboral:', error);

      const errorData = error.response?.data as ExperienciaLaboralError;

      if (error.response?.status === 404) {
        throw new Error('Experiencia laboral no encontrada.');
      }

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al eliminar la experiencia laboral. Intenta nuevamente.'
      );
    }
  },

  // --- MÉTODOS PARA SEGUROS MÉDICOS ACEPTADOS ---

  /**
   * Obtiene los tipos de seguros disponibles para un seguro específico
   * @param insuranceId - ID del seguro seleccionado
   * @param language - Idioma para traducción automática (opcional, por defecto 'es')
   * @returns Lista de tipos de seguros activos
   * 
   * Soporta traducción automática mediante query params:
   * - target: idioma destino
   * - source: idioma origen (español)
   * - translate_fields: campos a traducir (nombre,descripcion)
   */
  getAvailableInsuranceTypes: async (
    insuranceId: number,
    language?: string
  ): Promise<GetAvailableInsuranceTypesResponse> => {
    try {
      // Construir query params
      const params: Record<string, string> = {};

      // Agregar traducción si se especifica un idioma diferente al español
      if (language && language !== 'es') {
        params.target = language;
        params.source = 'es';
        params.translate_fields = 'nombre,descripcion';
      }

      const response = await apiClient.get<GetAvailableInsuranceTypesResponse>(
        `/seguros/${insuranceId}/tipos`,
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener tipos de seguros disponibles:', error);

      const errorData = error.response?.data as InsuranceError;

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener tipos de seguros disponibles. Intenta nuevamente.'
      );
    }
  },

  /**
   * Obtiene todos los seguros disponibles
   * @param language - Idioma para traducción automática (opcional, por defecto 'es')
   * @returns Lista de seguros disponibles para agregar
   * 
   * Soporta traducción automática mediante query params:
   * - target: idioma destino
   * - source: idioma origen (español)
   * - translate_fields: campos a traducir (nombre,descripcion)
   */
  getAvailableInsurances: async (language?: string): Promise<GetAvailableInsurancesResponse> => {
    try {
      // Construir query params
      const params: Record<string, string> = {};

      // Agregar traducción si se especifica un idioma diferente al español
      if (language && language !== 'es') {
        params.target = language;
        params.source = 'es';
        params.translate_fields = 'nombre,descripcion';
      }

      const response = await apiClient.get<GetAvailableInsurancesResponse>(
        '/seguros',
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener seguros disponibles:', error);

      const errorData = error.response?.data as InsuranceError;

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener seguros disponibles. Intenta nuevamente.'
      );
    }
  },


  getPopularInsurances: async (language?: string): Promise<GetAvailableInsurancesResponse> => {
    try {
      // Construir query params
      const params: Record<string, string> = {};

      // Agregar traducción si se especifica un idioma diferente al español
      if (language && language !== 'es') {
        params.target = language;
        params.source = 'es';
        params.translate_fields = 'nombre,descripcion';
      }

      const response = await apiClient.get<GetAvailableInsurancesResponse>(
        '/seguros/mas-utilizados',
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener seguros populares:', error);

      const errorData = error.response?.data as InsuranceError;

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener seguros populares. Intenta nuevamente.'
      );
    }
  },

  /**
   * Obtiene los seguros aceptados por el doctor autenticado
   * @param target - Idioma para traducción automática (opcional, por defecto 'es')
   * @param source - Idioma de origen (opcional, por defecto 'es')
   * @param translate_fields - Campos a traducir (opcional, por defecto 'nombre,descripcion')
   * @returns Lista de seguros aceptados por el doctor
   * 
   * Soporta traducción automática mediante query params:
   * - target: idioma destino
   * - source: idioma origen (español)
   * - translate_fields: campos a traducir (nombre,descripcion)
   */
  getAcceptedInsurances: async (target?: string, source?: string, translate_fields?: string): Promise<GetAcceptedInsurancesResponse> => {
    try {
      // Construir query params
      const params: Record<string, string> = {};

      // Agregar traducción si se especifica un idioma diferente al español
      if (target && source && translate_fields) {
        params.target = target;
        params.source = source;
        params.translate_fields = translate_fields;
      }

      const response = await apiClient.get<GetAcceptedInsurancesResponse>(
        '/seguros/seguros-aceptados',
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener seguros aceptados:', error);

      const errorData = error.response?.data as InsuranceError;

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener tus seguros aceptados. Intenta nuevamente.'
      );
    }
  },


  getAcceptedInsurancesByDoctorId: async (doctorId: number, target?: string, source?: string, translate_fields?: string): Promise<GetAcceptedInsurancesResponse> => {
    try {
      // Construir query params
      const params: Record<string, string> = {};

      // Agregar traducción si se especifica un idioma diferente al español
      if (target && source && translate_fields) {
        params.target = target;
        params.source = source;
        params.translate_fields = translate_fields;
      }

      const response = await apiClient.get<GetAcceptedInsurancesResponse>(
        `/seguros/doctor/${doctorId}/seguros-aceptados`,
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener seguros aceptados por ID de doctor:', error);

      const errorData = error.response?.data as InsuranceError;

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener seguros aceptados por ID de doctor. Intenta nuevamente.'
      );
    }
  },

  /**
   * Agrega un seguro a la lista de seguros aceptados por el doctor (sin límite)
   * @param data - ID del seguro y ID del tipo de seguro
   * @returns Respuesta con el seguro agregado
   */
  addAcceptedInsurance: async (data: AddAcceptedInsuranceRequest): Promise<AddAcceptedInsuranceResponse> => {
    try {
      const response = await apiClient.post<AddAcceptedInsuranceResponse>(
        '/seguros/seguros-aceptados',
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al agregar seguro aceptado:', error);

      const errorData = error.response?.data as InsuranceError;

      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message ||
          'El seguro ya está en tu lista de seguros aceptados.'
        );
      }

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al agregar seguro. Intenta nuevamente.'
      );
    }
  },

  /**
   * Elimina un seguro de la lista de seguros aceptados por el doctor
   * @param seguroId - ID del seguro a eliminar
   * @param tipoSeguroId - ID del tipo de seguro
   * @returns Respuesta de confirmación
   */
  removeAcceptedInsurance: async (
    seguroId: number,
    tipoSeguroId: number
  ): Promise<RemoveAcceptedInsuranceResponse> => {
    try {
      const response = await apiClient.delete<RemoveAcceptedInsuranceResponse>(
        `/seguros/seguros-aceptados/${seguroId}/${tipoSeguroId}`
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al eliminar seguro aceptado:', error);

      const errorData = error.response?.data as InsuranceError;

      if (error.response?.status === 404) {
        throw new Error('Seguro no encontrado.');
      }

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al eliminar seguro. Intenta nuevamente.'
      );
    }
  },

  // --- IDIOMAS DEL DOCTOR ---

  /**
   * Obtiene los idiomas que maneja el doctor autenticado
   * @returns Lista de idiomas del doctor con sus niveles de dominio
   */
  getDoctorLanguages: async (): Promise<GetDoctorLanguagesResponse> => {
    try {
      const response = await apiClient.get<GetDoctorLanguagesResponse>(
        '/doctores/idiomas'
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener idiomas del doctor:', error);

      const errorData = error.response?.data as LanguageError;

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener tus idiomas. Intenta nuevamente.'
      );
    }
  },

  /**
   * Agrega un idioma a la lista de idiomas que maneja el doctor
   * @param data - ID del idioma y ID del nivel de dominio
   * @returns Respuesta con el idioma agregado
   */
  addDoctorLanguage: async (data: AddDoctorLanguageRequest): Promise<AddDoctorLanguageResponse> => {
    try {
      const response = await apiClient.post<AddDoctorLanguageResponse>(
        '/doctores/idiomas',
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al agregar idioma:', error);

      const errorData = error.response?.data as LanguageError;

      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message ||
          'El idioma ya está en tu lista.'
        );
      }

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al agregar idioma. Intenta nuevamente.'
      );
    }
  },

  /**
   * Actualiza el nivel de dominio de un idioma del doctor
   * @param idiomaId - ID del idioma a actualizar
   * @param data - Datos a actualizar (nivel de dominio)
   * @returns Respuesta con el idioma actualizado
   */
  /**
   * Actualiza un idioma de la lista de idiomas que maneja el doctor
   * @param idiomaId - ID del idioma a actualizar
   * @param data - Datos a actualizar (nivel)
   * @returns Idioma actualizado
   */
  updateDoctorLanguage: async (
    idiomaId: number,
    data: UpdateDoctorLanguageRequest
  ): Promise<UpdateDoctorLanguageResponse> => {
    try {
      const response = await apiClient.patch<UpdateDoctorLanguageResponse>(
        `/doctores/idiomas/${idiomaId}`,
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al actualizar idioma:', error);

      const errorData = error.response?.data as LanguageError;

      if (error.response?.status === 404) {
        throw new Error('Idioma no encontrado.');
      }

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al actualizar idioma. Intenta nuevamente.'
      );
    }
  },

  /**
   * Elimina un idioma de la lista de idiomas que maneja el doctor
   * @param idiomaId - ID del idioma a eliminar
   * @returns Respuesta de confirmación
   */
  deleteDoctorLanguage: async (idiomaId: number): Promise<DeleteDoctorLanguageResponse> => {
    try {
      const response = await apiClient.delete<DeleteDoctorLanguageResponse>(
        `/doctores/idiomas/${idiomaId}`
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al eliminar idioma:', error);

      const errorData = error.response?.data as LanguageError;

      if (error.response?.status === 404) {
        throw new Error('Idioma no encontrado.');
      }

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al eliminar idioma. Intenta nuevamente.'
      );
    }
  },


  addDoctorToFavorites: async (doctorId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.post(`/favoritos/${doctorId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al agregar doctor a favoritos:', error);
      const errorData = error.response?.data as DoctorServiceError;
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al agregar doctor a favoritos. Intenta nuevamente.'
      );
    }
  },

  removeDoctorFromFavorites: async (doctorId: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiClient.delete(`/favoritos/${doctorId}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al remover doctor de favoritos:', error);
      const errorData = error.response?.data as DoctorServiceError;
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al remover doctor de favoritos. Intenta nuevamente.'
      );
    }
  },


  createService: async (data: CreateDoctorServiceRequest): Promise<CreateDoctorServiceResponse> => {
    try {
      const formData = new FormData();

      // Append standard primitive fields
      formData.append('especialidadId', data.especialidadId.toString());
      formData.append('nombre', data.nombre);
      if (data.descripcion) formData.append('descripcion', data.descripcion);
      formData.append('precio', data.precio.toString());
      formData.append('duracionMinutos', data.duracionMinutos.toString());
      formData.append('sesiones', data.sesiones.toString());
      formData.append('modalidad', data.modalidad);
      if (data.maxPacientesDia) formData.append('maxPacientesDia', data.maxPacientesDia.toString());

      // Append Arrays of primitive IDs
      // Note: How arrays are received depends entirely on your backend (NestJS, Express, etc.)
      // Method A: Multiple appends (Standard for many frameworks like NestJS with FileInterceptor)
      if (data.centroSaludIds) {
        data.centroSaludIds.forEach((id) => formData.append('centroSaludIds', id.toString()));
      }
      if (data.ubicacionIds) {
        data.ubicacionIds.forEach((id) => formData.append('ubicacionIds', id.toString()));
      }
      if (data.horariosIds) {
        data.horariosIds.forEach((id) => formData.append('horarioIds', id.toString()));
      }

      // Method B: Send as JSON string (Use this if your backend expects a stringified array)
      // if (data.horariosIds) formData.append('horariosIds', JSON.stringify(data.horariosIds));
      // if (data.ubicacionIds) formData.append('ubicacionIds', JSON.stringify(data.ubicacionIds));

      // Append Files
      if (data.imagenes && data.imagenes.length > 0) {
        data.imagenes.forEach((file) => {
          // 'imagenes' must match the field name your backend file interceptor expects
          formData.append('imagenes', file);
        });
      }

      // Send the request using FormData and the correct headers
      const response = await apiClient.post<CreateDoctorServiceResponse>(
        '/servicios',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al crear servicio:', error);

      const errorData = error.response?.data;

      throw {
        message: errorData?.message || 'Error al crear servicio. Intenta nuevamente.',
        statusCode: error.response?.status || 500,
        response: error.response,
        originalError: error
      };
    }
  },

  /**
   * Obtiene un servicio por su id
   * @param serviceId - ID del servicio
   * @returns Respuesta con el servicio
   */
  getServiceById: async (serviceId: number, params: any | null = null): Promise<GetServiceByIdResponse> => {
    try {
      const response = await apiClient.get<GetServiceByIdResponse>(
        `/servicios/${serviceId}`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener servicio por id:', error);
      const errorData = error.response?.data;
      throw {
        message: errorData?.message || 'Error al obtener el servicio. Intenta nuevamente.',
        statusCode: error.response?.status || 500,
        response: error.response,
        originalError: error,
      };
    }
  },

  getServicesOfDoctor: async (doctorId: number, params: any | null = null): Promise<GetServicesOfDoctorResponse> => {
    try {
      const response = await apiClient.get<GetServicesOfDoctorResponse>(
        `/servicios/doctor/${doctorId}`,
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener servicios del doctor:', error);

      const errorData = error.response?.data as DoctorServiceError;

      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener servicios del doctor. Intenta nuevamente.'
      );
    }
  },


  getSlotsAvailableForService: async (serviceId: number, params: any | null = null): Promise<GetSlotsAvailableForServiceResponse> => {
    try {
      const response = await apiClient.get<GetSlotsAvailableForServiceResponse>(
        `/servicios/${serviceId}/slots-disponibles`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener slots disponibles para el servicio:', error);
      const errorData = error.response?.data as DoctorServiceError;
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener slots disponibles para el servicio. Intenta nuevamente.'
      );
    }
  },

  getDoctoresByDistance: async (lat: number | null, lng: number | null, radiusKm: number | 10 | null, params: any | null = null): Promise<GetDoctoresByDistanceResponse> => {
    try {
      const response = await apiClient.get<GetDoctoresByDistanceResponse>(
        `/doctores/cercanos`,
        { params: { lat, lng, radio: radiusKm, ...params } }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener servicios por distancia:', error);
      const errorData = error.response?.data as DoctorServiceError;
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener servicios por distancia. Intenta nuevamente.'
      );
    }
  },

  getDoctorAndCenterByFilters: async (lat?: number | null, lng?: number | null, radiusKm?: number | null, params: any | null = null): Promise<GetDoctoresByDistanceResponse> => {
    try {
      // Only include location params if all are provided
      const locationParams = (lat !== null && lat !== undefined && lng !== null && lng !== undefined && radiusKm !== null && radiusKm !== undefined)
        ? { lat, lng, radio: radiusKm }
        : {};

      const response = await apiClient.get<GetDoctoresByDistanceResponse>(
        `/busqueda/cercanos`,
        { params: { ...locationParams, ...params } }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener servicios por distancia:', error);
      const errorData = error.response?.data as DoctorServiceError;
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener servicios por distancia. Intenta nuevamente.'
      );
    }
  },

  getDoctorSlotsAvailableInRange: async (doctorId: number, startDate: string, days: number, params: any | null = null): Promise<any> => {
    try {
      const response = await apiClient.get<any>(
        `/servicios/doctor/${doctorId}/disponibilidad`,
        {
          params: {
            fechaInicio: startDate,
            dias: days,
            ...params
          }
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener slots disponibles del doctor en rango de fechas:', error);
      const errorData = error.response?.data as DoctorServiceError;
      throw new Error(
        errorData?.message ||
        error.message ||
        'Error al obtener slots disponibles del doctor en rango de fechas. Intenta nuevamente.'
      );
    }
  },

  updateStatusOfService: async (serviceId: number, newStatus: string): Promise<UpdateStatusDoctorServiceResponse> => {
    try {
      const response = await apiClient.put<UpdateStatusDoctorServiceResponse>(
        `/servicios/${serviceId}`,
        { estado: newStatus }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al actualizar estado del servicio:', error);

      const errorData = error.response?.data;

      throw {
        message: errorData?.message || 'Error al actualizar estado del servicio. Intenta nuevamente.',
        statusCode: error.response?.status || 500,
        response: error.response,
        originalError: error
      };
    }
  },

  deleteService: async (serviceId: number): Promise<DeleteDoctorServiceResponse> => {
    try {
      const response = await apiClient.delete<DeleteDoctorServiceResponse>(
        `/servicios/${serviceId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al eliminar servicio:', error);

      const errorData = error.response?.data;

      throw {
        message: errorData?.message || 'Error al eliminar servicio. Intenta nuevamente.',
        statusCode: error.response?.status || 500,
        response: error.response,
        originalError: error
      };
    }
  },

  addImageToService: async (serviceId: number, imageFile: (File | Blob)[]): Promise<AddImageToServiceResponse> => {
    try {
      const formData = new FormData();

      if (imageFile && imageFile.length > 0) {
        imageFile.forEach((file) => {
          // 'imagenes' must match the field name your backend file interceptor expects
          formData.append('imagenes', file);
        });
      }


      const response = await apiClient.post<AddImageToServiceResponse>(`/servicios/${serviceId}/imagenes`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al agregar imagen al servicio:', error);

      const errorData = error.response?.data;

      throw {
        message: errorData?.message || 'Error al agregar imagen al servicio. Intenta nuevamente.',
        statusCode: error.response?.status || 500,
        response: error.response,
        originalError: error
      };
    }
  },

  removeImageFromService: async (serviceId: number, imageId: number): Promise<RemoveImageFromServiceResponse> => {
    try {
      const response = await apiClient.delete<RemoveImageFromServiceResponse>(
        `/servicios/${serviceId}/imagenes/${imageId}`
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al eliminar imagen del servicio:', error);

      const errorData = error.response?.data;

      throw {
        message: errorData?.message || 'Error al eliminar imagen del servicio. Intenta nuevamente.',
        statusCode: error.response?.status || 500,
        response: error.response,
        originalError: error
      };
    }
  },

  updateService: async (id: number, data: UpdateDoctorServiceRequest): Promise<CreateDoctorServiceResponse> => {
    try {
      const response = await apiClient.put<CreateDoctorServiceResponse>(
        `/servicios/${id}`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al actualizar servicio:', error);

      const errorData = error.response?.data;

      throw {
        message: errorData?.message || 'Error al actualizar el servicio. Intenta nuevamente.',
        statusCode: error.response?.status || 500,
        response: error.response,
        originalError: error
      };
    }
  },
};
