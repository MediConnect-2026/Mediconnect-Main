import apiClient from '@/services/api/client';
import API_ENDPOINTS from '@/services/api/endpoints';
import type {
  RegisterPatientRequest,
  RegisterPatientResponse,
} from './patient-registration.types';

export const patientRegistrationService = {
  /**
   * Completar registro de paciente
   * POST /auth/registro/paciente
   * 
   * Este endpoint requiere un token de registro obtenido después de validar el código OTP.
   * Los datos se envían como multipart/form-data para permitir la subida de archivos.
   */
  registerPatient: async (
    request: RegisterPatientRequest
  ): Promise<RegisterPatientResponse> => {
    try {
      // Crear FormData para enviar datos multipart
      const formData = new FormData();

      // Agregar campos requeridos
      formData.append('token', request.token);
      formData.append('nombre', request.nombre);
      formData.append('apellido', request.apellido);
      formData.append('numero_documento', request.numero_documento);
      formData.append('tipo_documento', request.tipo_documento);
      formData.append('password', request.password);

      // Agregar campos opcionales solo si existen
      if (request.fecha_nacimiento) {
        formData.append('fecha_nacimiento', request.fecha_nacimiento);
      }
      if (request.genero) {
        formData.append('genero', request.genero);
      }
      if (request.altura !== undefined) {
        formData.append('altura', request.altura.toString());
      }
      if (request.peso !== undefined) {
        formData.append('peso', request.peso.toString());
      }
      if (request.tipo_sangre) {
        formData.append('tipo_sangre', request.tipo_sangre);
      }

      // Agregar archivos si existen
      if (request.fotoPerfil) {
        formData.append('fotoPerfil', request.fotoPerfil, 'profile-photo.jpg');
      }

      for (const [key, value] of formData.entries()) {
        if ((value as any) instanceof File || (value as any) instanceof Blob) {
          console.log(`  ${key}:`, {
            name: (value as any) instanceof File ? (value as any).name : 'blob',
            size: (value as any).size,
            type: (value as any).type
          });
        } else {
          console.log(`  ${key}:`, value);
        }
      }

      // Realizar la petición
      // IMPORTANTE: No establecer manualmente 'Content-Type' para FormData
      // Axios lo configura automáticamente con el boundary correcto
      // El interceptor del cliente eliminará cualquier Content-Type predefinido cuando detecte FormData
      const { data } = await apiClient.post<RegisterPatientResponse>(
        API_ENDPOINTS.AUTH.REGISTRO_COMPLETAR_PACIENTE,
        formData,
        {
          headers: {
            // Solo enviar token en header Authorization para autenticación
            'Authorization': `Bearer ${request.token}`,
            // NO establecer Content-Type aquí - dejar que axios lo maneje automáticamente
          },
        }
      );

      return data;
    } catch (error) {
      console.error('[Patient Registration Service] Error registering patient:', error);
      throw error;
    }
  },
};

export default patientRegistrationService;
