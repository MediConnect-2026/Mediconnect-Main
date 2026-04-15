import apiClient from '@/services/api/client';
import API_ENDPOINTS from '@/services/api/endpoints';
import type {
  RegisterDoctorRequest,
  RegisterDoctorResponse,
} from './doctor-registration.types';

export const doctorRegistrationService = {
  /**
   * Completar registro de doctor
   * POST /auth/registro/doctor
   * 
   * Este endpoint requiere un token de registro obtenido después de validar el código OTP.
   * Los datos se envían como multipart/form-data para permitir la subida de archivos.
   */
  registerDoctor: async (
    request: RegisterDoctorRequest
  ): Promise<RegisterDoctorResponse> => {
    try {
      // Crear FormData para enviar datos multipart
      const formData = new FormData();

      // Agregar campos requeridos
      formData.append('nombre', request.nombre);
      formData.append('apellido', request.apellido);
      formData.append('genero', request.genero);
      formData.append('fecha_nacimiento', request.fecha_nacimiento);
      formData.append('nacionalidad', request.nacionalidad);
      formData.append('telefono', request.telefono);
      formData.append('tipo_documento', request.tipo_documento);
      formData.append('numero_documento', request.numero_documento);
      formData.append('password', request.password);
      formData.append('exequatur', request.exequatur);
      formData.append('id_especialidad_principal', request.id_especialidad_principal.toString());

      // Agregar campos opcionales solo si existen
      if (request.biografia) {
        formData.append('biografia', request.biografia);
      }

      if (request.ids_especialidades_secundarias && request.ids_especialidades_secundarias.length > 0) {
        formData.append('ids_especialidades_secundarias', JSON.stringify(request.ids_especialidades_secundarias));
      }

      // Agregar foto de perfil (opcional)
      if (request.fotoPerfil) {
        if (request.fotoPerfil instanceof File || request.fotoPerfil instanceof Blob) {
          const fileName = request.fotoPerfil instanceof File ? request.fotoPerfil.name : 'profile-photo.jpg';
          formData.append('fotoPerfil', request.fotoPerfil, fileName);
        } else {
          console.error('fotoPerfil no es un File o Blob válido:', request.fotoPerfil);
          throw new Error('fotoPerfil debe ser un archivo válido');
        }
      }

      // Agregar fotos de documento (requerido, 1-2 archivos)
      request.fotoDocumento.forEach((file, index) => {
        if (file instanceof File || file instanceof Blob) {
          const fileName = file instanceof File ? file.name : `documento-${index + 1}.jpg`;
          formData.append('fotoDocumento', file, fileName);
        } else {
          console.error(`fotoDocumento[${index}] no es un File o Blob válido:`, file);
          throw new Error(`fotoDocumento[${index}] debe ser un archivo válido`);
        }
      });

      // Agregar títulos académicos (requerido, 1-10 archivos)
      request.tituloAcademico.forEach((file, index) => {
        if (file instanceof File || file instanceof Blob) {
          const fileName = file instanceof File ? file.name : `titulo-${index + 1}.pdf`;
          formData.append('tituloAcademico', file, fileName);
        } else {
          console.error(`tituloAcademico[${index}] no es un File o Blob válido:`, file);
          throw new Error(`tituloAcademico[${index}] debe ser un archivo válido`);
        }
      });

      // Agregar certificaciones (opcional, 1+ archivos)
      if (request.certificaciones && request.certificaciones.length > 0) {
        request.certificaciones.forEach((file, index) => {
          if (file instanceof File || file instanceof Blob) {
            const fileName = file instanceof File ? file.name : `certificacion-${index + 1}.pdf`;
            formData.append('certificaciones', file, fileName);
          } else {
            console.error(`certificaciones[${index}] no es un File o Blob válido:`, file);
            throw new Error(`certificaciones[${index}] debe ser un archivo válido`);
          }
        });
      }

      // Agregar descripciones opcionales como JSON stringificados
      if (request.descripciones_documentos && request.descripciones_documentos.length > 0) {
        formData.append('descripciones_documentos', JSON.stringify(request.descripciones_documentos));
      }

      if (request.descripciones_titulos && request.descripciones_titulos.length > 0) {
        formData.append('descripciones_titulos', JSON.stringify(request.descripciones_titulos));
      }

      if (request.descripciones_certificaciones && request.descripciones_certificaciones.length > 0) {
        formData.append('descripciones_certificaciones', JSON.stringify(request.descripciones_certificaciones));
      }
      // Realizar la petición
      const { data } = await apiClient.post<RegisterDoctorResponse>(
        API_ENDPOINTS.AUTH.REGISTRO_COMPLETAR_DOCTOR,
        formData,
        {
          headers: {
            // Solo enviar token en header Authorization para autenticación
            'Authorization': `Bearer ${request.token}`,
          },
        }
      );

      return data;
    } catch (error) {
      console.error('[Doctor Registration Service] Error registering doctor:', error);
      throw error;
    }
  },
};

export default doctorRegistrationService;
