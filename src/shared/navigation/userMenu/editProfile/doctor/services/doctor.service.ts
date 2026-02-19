import apiClient from '@/services/api/client';
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
  GetFormacionesAcademicasResponse,
  GetFormacionesAcademicasParams,
  GetExperienciasLaboralesResponse,
  GetExperienciasLaboralesParams
} from './doctor.types';

/**
 * Servicio para gestionar el perfil del doctor autenticado
 */
export const doctorService = {
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
  getProfile: async (): Promise<GetDoctorProfileResponse> => {
    try {
      const response = await apiClient.get<GetDoctorProfileResponse>(
        '/doctores/me'
      );

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
   * Obtiene las formaciones académicas del doctor autenticado
   * @param params - Parámetros opcionales para traducción
   * @returns Respuesta con las formaciones académicas
   * 
   * Este endpoint devuelve todas las formaciones académicas del doctor.
   * Soporta traducción automática de campos mediante query params.
   */
  getFormacionesAcademicas: async (
    params?: GetFormacionesAcademicasParams
  ): Promise<GetFormacionesAcademicasResponse> => {
    try {
      const response = await apiClient.get<GetFormacionesAcademicasResponse>(
        '/doctores/formaciones-academicas',
        { params }
      );

      return response.data;
    } catch (error: any) {
      console.error('❌ [Doctor Service] Error al obtener formaciones académicas:', error);
      
      const errorData = error.response?.data as DoctorServiceError;
      
      if (error.response?.status === 404) {
        // Si no hay formaciones, devolver array vacío
        return {
          success: true,
          message: 'No se encontraron formaciones académicas',
          data: []
        };
      }
      
      // Error genérico del servidor o del cliente API
      throw new Error(
        errorData?.message || 
        error.message || 
        'Error al obtener las formaciones académicas. Intenta nuevamente.'
      );
    }
  },

  /**
   * Obtiene las experiencias laborales del doctor
   * @param doctorId - ID del doctor
   * @param params - Parámetros opcionales para traducción
   * @returns Respuesta con las experiencias laborales
   * 
   * Este endpoint devuelve todas las experiencias laborales del doctor.
   * Soporta traducción automática de campos mediante query params.
   */
  getExperienciasLaborales: async (
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
          data: []
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
};
