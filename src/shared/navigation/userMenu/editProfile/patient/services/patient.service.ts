import apiClient from '@/services/api/client';
import type { 
  UpdatePatientProfileRequest, 
  UpdatePatientProfileResponse,
  UpdatePatientProfileError,
  UpdateProfilePhotoResponse,
  UpdateProfilePhotoError,
  GetAvailableAllergiesResponse,
  GetAvailableConditionsResponse,
  AddAllergyRequest,
  AddConditionRequest,
  AddPersonalConditionRequest,
  AddAllergyResponse,
  AddConditionResponse,
  AddPersonalConditionResponse,
  GetMyAllergiesResponse,
  GetMyConditionsResponse,
  RemoveAllergyResponse,
  RemoveConditionResponse,
  MedicalConditionError,
  GetAvailableInsurancesResponse,
  GetMyInsurancesResponse,
  AddInsuranceRequest,
  AddInsuranceResponse,
  RemoveInsuranceResponse,
  InsuranceError
} from './patient.types';

/**
 * Servicio para actualizar el perfil del paciente autenticado
 */
export const patientService = {
  /**
   * Actualiza el perfil del paciente autenticado
   * @param data - Datos del perfil a actualizar
   * @returns Respuesta con los datos actualizados
   */
  updateProfile: async (
    data: UpdatePatientProfileRequest
  ): Promise<UpdatePatientProfileResponse> => {
    try {
      const response = await apiClient.patch<UpdatePatientProfileResponse>(
        '/pacientes/me',
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al actualizar perfil:', error);
      
      // El apiClient ya maneja los errores comunes (401, 403, etc.)
      // Aquí solo manejamos errores específicos del endpoint
      const errorData = error.response?.data as UpdatePatientProfileError;
      
      if (error.response?.status === 404) {
        throw new Error('Perfil de paciente no encontrado.');
      }
      
      if (error.response?.status === 409) {
        throw new Error('El documento de identidad ya está registrado.');
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
   * Actualiza la foto de perfil del usuario autenticado
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
        throw new Error('El archivo supera el tamaño máximo de 5MB');
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
      console.error('❌ [Patient Service] Error al actualizar foto de perfil:', error);
      
      const errorData = error.response?.data as UpdateProfilePhotoError;
      
      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message || 
          'Archivo inválido. Verifica el tipo y tamaño del archivo.'
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
   * Obtiene todas las alergias disponibles en el catálogo
   * @param language - Idioma para traducción automática (opcional, por defecto 'es')
   * @returns Lista de alergias disponibles para agregar
   * 
   * Soporta traducción automática mediante query params:
   * - target: idioma destino
   * - source: idioma origen (español)
   * - translate_fields: campos a traducir (nombre,descripcion)
   */
  getAvailableAllergies: async (language?: string): Promise<GetAvailableAllergiesResponse> => {
    try {
      // Construir query params
      const params: Record<string, string | number> = {
        estado: 'Activa',
        tipo: 'Alergia',
        pagina: 1,
        limite: 100
      };

      // Agregar traducción si se especifica un idioma diferente al español
      if (language && language !== 'es') {
        params.target = language;
        params.source = 'es';
        params.translate_fields = 'nombre,descripcion';
      }

      const response = await apiClient.get<GetAvailableAllergiesResponse>(
        '/condiciones-medicas',
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al obtener alergias disponibles:', error);
      
      const errorData = error.response?.data as MedicalConditionError;
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al obtener alergias disponibles. Intenta nuevamente.'
      );
    }
  },

  /**
   * Obtiene todas las condiciones médicas disponibles en el catálogo
   * @param language - Idioma para traducción automática (opcional, por defecto 'es')
   * @returns Lista de condiciones médicas disponibles para agregar
   * 
   * Soporta traducción automática mediante query params:
   * - target: idioma destino
   * - source: idioma origen (español)
   * - translate_fields: campos a traducir (nombre,descripcion)
   */
  getAvailableConditions: async (language?: string): Promise<GetAvailableConditionsResponse> => {
    try {
      // Construir query params
      const params: Record<string, string | number> = {
        estado: 'Activa',
        tipo: 'Condición',
        pagina: 1,
        limite: 100
      };

      // Agregar traducción si se especifica un idioma diferente al español
      if (language && language !== 'es') {
        params.target = language;
        params.source = 'es';
        params.translate_fields = 'nombre,descripcion';
      }

      const response = await apiClient.get<GetAvailableConditionsResponse>(
        '/condiciones-medicas',
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al obtener condiciones médicas disponibles:', error);
      
      const errorData = error.response?.data as MedicalConditionError;
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al obtener condiciones médicas disponibles. Intenta nuevamente.'
      );
    }
  },

  /**
   * Obtiene las alergias del paciente autenticado
   * @param language - Idioma para traducción automática (opcional, por defecto 'es')
   * @returns Lista de alergias del paciente
   * 
   * Soporta traducción automática mediante query params:
   * - target: idioma destino
   * - source: idioma origen (español)
   * - translate_fields: campos a traducir (nombre,descripcion)
   */
  getMyAllergies: async (language?: string): Promise<GetMyAllergiesResponse> => {
    try {
      // Construir query params
      const params: Record<string, string | number> = {
        tipo: 'Alergia',
        estado: 'Activa'
      };

      // Agregar traducción si se especifica un idioma diferente al español
      if (language && language !== 'es') {
        params.target = language;
        params.source = 'es';
        params.translate_fields = 'nombre,notas';
      }

      const response = await apiClient.get<GetMyAllergiesResponse>(
        '/condiciones-medicas/mis-condiciones',
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al obtener alergias del paciente:', error);
      
      const errorData = error.response?.data as MedicalConditionError;
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al obtener tus alergias. Intenta nuevamente.'
      );
    }
  },

  /**
   * Obtiene las condiciones médicas del paciente autenticado
   * @param language - Idioma para traducción automática (opcional, por defecto 'es')
   * @returns Lista de condiciones médicas del paciente
   * 
   * Soporta traducción automática mediante query params:
   * - target: idioma destino
   * - source: idioma origen (español)
   * - translate_fields: campos a traducir (nombre,descripcion)
   */
  getMyConditions: async (language?: string): Promise<GetMyConditionsResponse> => {
    try {
      // Construir query params
      const params: Record<string, string | number> = {
        tipo: 'Condición',
        estado: 'Activa'
      };

      // Agregar traducción si se especifica un idioma diferente al español
      if (language && language !== 'es') {
        params.target = language;
        params.source = 'es';
        params.translate_fields = 'nombre,notas';
      }

      const response = await apiClient.get<GetMyConditionsResponse>(
        '/condiciones-medicas/mis-condiciones',
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al obtener condiciones médicas del paciente:', error);
      
      const errorData = error.response?.data as MedicalConditionError;
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al obtener tus condiciones médicas. Intenta nuevamente.'
      );
    }
  },

  /**
   * Agrega una alergia del catálogo al perfil del paciente
   * @param data - ID de la alergia y notas opcionales
   * @returns Respuesta con la alergia agregada
   */
  addAllergy: async (data: AddAllergyRequest): Promise<AddAllergyResponse> => {
    try {
      const response = await apiClient.post<AddAllergyResponse>(
        '/condiciones-medicas/mis-alergias',
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al agregar alergia:', error);
      
      const errorData = error.response?.data as MedicalConditionError;
      
      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message || 
          'Alergia ya registrada o datos inválidos.'
        );
      }
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al agregar alergia. Intenta nuevamente.'
      );
    }
  },

  /**
   * Agrega una condición médica del catálogo al perfil del paciente
   * @param data - ID de la condición médica y notas opcionales
   * @returns Respuesta con la condición médica agregada
   */
  addCondition: async (data: AddConditionRequest): Promise<AddConditionResponse> => {
    try {
      const response = await apiClient.post<AddConditionResponse>(
        '/condiciones-medicas/mis-condiciones',
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al agregar condición médica:', error);
      
      const errorData = error.response?.data as MedicalConditionError;
      
      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message || 
          'Condición médica ya registrada o datos inválidos.'
        );
      }
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al agregar condición médica. Intenta nuevamente.'
      );
    }
  },

  /**
   * Agrega una condición médica personal al perfil del paciente
   * @param data - Notas de la condición médica personal
   * @returns Respuesta con la condición médica agregada
   */
  addPersonalCondition: async (data: AddPersonalConditionRequest): Promise<AddPersonalConditionResponse> => {
    try {
      const response = await apiClient.post<AddPersonalConditionResponse>(
        '/condiciones-medicas/mis-condiciones',
        data
      );


      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al agregar condición médica personal:', error);
      
      const errorData = error.response?.data as MedicalConditionError;
      
      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message || 
          'La condición médica personal no es válida.'
        );
      }
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al agregar condición médica personal. Intenta nuevamente.'
      );
    }
  },

  /**
   * Elimina una alergia del perfil del paciente
   * @param condicionId - ID de la alergia a eliminar
   * @returns Respuesta de confirmación
   */
  removeAllergy: async (condicionId: number): Promise<RemoveAllergyResponse> => {
    try {
      const response = await apiClient.delete<RemoveAllergyResponse>(
        `/condiciones-medicas/mis-alergias/${condicionId}`
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al eliminar alergia:', error);
      
      const errorData = error.response?.data as MedicalConditionError;
      
      if (error.response?.status === 404) {
        throw new Error('Alergia no encontrada.');
      }
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al eliminar alergia. Intenta nuevamente.'
      );
    }
  },

  /**
   * Elimina una condición médica del perfil del paciente
   * @param condicionId - ID de la condición médica a eliminar
   * @returns Respuesta de confirmación
   */
  removeCondition: async (condicionId: number): Promise<RemoveConditionResponse> => {
    try {
      const response = await apiClient.delete<RemoveConditionResponse>(
        `/condiciones-medicas/mis-condiciones/${condicionId}`
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al eliminar condición médica:', error);
      
      const errorData = error.response?.data as MedicalConditionError;
      
      if (error.response?.status === 404) {
        throw new Error('Condición médica no encontrada.');
      }
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al eliminar condición médica. Intenta nuevamente.'
      );
    }
  },

  // --- MÉTODOS PARA SEGUROS MÉDICOS ---

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
        '/seguros/disponibles',
        { params }
      );
      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al obtener seguros disponibles:', error);
      
      const errorData = error.response?.data as InsuranceError;
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al obtener seguros disponibles. Intenta nuevamente.'
      );
    }
  },

  /**
   * Obtiene los seguros del paciente autenticado
   * @param language - Idioma para traducción automática (opcional, por defecto 'es')
   * @returns Lista de seguros del paciente
   * 
   * Soporta traducción automática mediante query params:
   * - target: idioma destino
   * - source: idioma origen (español)
   * - translate_fields: campos a traducir (nombre,descripcion)
   */
  getMyInsurances: async (language?: string): Promise<GetMyInsurancesResponse> => {
    try {
      // Construir query params
      const params: Record<string, string> = {};

      // Agregar traducción si se especifica un idioma diferente al español
      if (language && language !== 'es') {
        params.target = language;
        params.source = 'es';
        params.translate_fields = 'nombre,descripcion';
      }

      const response = await apiClient.get<GetMyInsurancesResponse>(
        '/seguros/mis-seguros',
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al obtener seguros del paciente:', error);
      
      const errorData = error.response?.data as InsuranceError;
      
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al obtener tus seguros. Intenta nuevamente.'
      );
    }
  },

  /**
   * Agrega un seguro al perfil del paciente (máximo 3 seguros)
   * @param data - ID del seguro y ID del tipo de seguro
   * @returns Respuesta con el seguro agregado
   */
  addInsurance: async (data: AddInsuranceRequest): Promise<AddInsuranceResponse> => {
    try {
      const response = await apiClient.post<AddInsuranceResponse>(
        '/seguros/mis-seguros',
        data
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al agregar seguro:', error);
      
      const errorData = error.response?.data as InsuranceError;
      
      if (error.response?.status === 400) {
        throw new Error(
          errorData?.message || 
          'Ya tienes 3 seguros o el seguro ya está registrado.'
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
   * Elimina un seguro del perfil del paciente
   * @param id - ID del seguro a eliminar
   * @returns Respuesta de confirmación
   */
  removeInsurance: async (id: number): Promise<RemoveInsuranceResponse> => {
    try {
      const response = await apiClient.delete<RemoveInsuranceResponse>(
        `/seguros/mis-seguros/${id}`
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Patient Service] Error al eliminar seguro:', error);
      
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
};
