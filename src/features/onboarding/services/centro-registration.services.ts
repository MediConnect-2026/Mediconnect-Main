import type { CenterOnboardingSchemaType } from "@/types/OnbordingTypes";
import type { RegisterCenterRequest, RegisterCenterResponse } from "./centro-registration.types";
import { urlToFile } from "./doctor-registration.mapper";
import apiClient from "@/services/api/client";

export async function mapCenterOnboardingToRequest(
  centerData: CenterOnboardingSchemaType,
  token: string,
  ubicacionId: number
): Promise<RegisterCenterRequest> {

  // Convertir imagen de perfil a File (opcional)
  const fotoPerfil = centerData.urlImg?.url
    ? await urlToFile(centerData.urlImg.url, 'profile-photo', centerData.urlImg.type)
    : undefined;

  // Convertir fotos de documentos de base64 a Files 
  if (!centerData.healthCertificateFile || centerData.healthCertificateFile.url === "") {
    throw new Error('Al menos una foto del certificado sanitario es requerida');
  }

  const file = await urlToFile(centerData.healthCertificateFile.url, `health-certificate-${1}`, centerData.healthCertificateFile.type);

  // Construir el objeto de request
  const request: RegisterCenterRequest = {
    token,
    nombreComercial: centerData.name,
    rnc: centerData.rnc,
    descripcion: centerData.Description ?? "",
    telefono: centerData.phone,
    email: centerData.email,
    direccion: centerData.address,
    barrioId: parseInt(centerData.neighborhood), // TODO: Asegurarse que sea número
    ubicacionId,
    sitioWeb: centerData.website ?? "",
    tipoCentroId: parseInt(centerData.centerType), // TODO: Asegurarse que sea número
    password: centerData.password,
    fotoPerfil: fotoPerfil,
    certificadoSanitario: file,
  };

  return request;
}


export const centerRegistrationService = {

  registerCenter: async (
    request: RegisterCenterRequest
  ): Promise<RegisterCenterResponse> => {
    try {
      const formData = new FormData();

      formData.append('token', request.token);
      formData.append('nombreComercial', request.nombreComercial);
      formData.append('rnc', request.rnc);
      formData.append('telefono', request.telefono);
      formData.append('email', request.email);
      formData.append('descripcion', request.descripcion);
      formData.append('direccion', request.direccion);
      formData.append('barrioId', request.barrioId.toString());
      formData.append('ubicacionId', request.ubicacionId.toString());
      formData.append('sitioWeb', request.sitioWeb);
      formData.append('password', request.password);
      formData.append('tipoCentroId', request.tipoCentroId.toString());

      if (request.fotoPerfil) {
        if (request.fotoPerfil instanceof File || request.fotoPerfil instanceof Blob) {
          const fileName = request.fotoPerfil instanceof File ? request.fotoPerfil.name : 'profile-photo.jpg';
          formData.append('fotoPerfil', request.fotoPerfil, fileName);
        } else {
          console.error('fotoPerfil no es un File o Blob válido:', request.fotoPerfil);
          throw new Error('fotoPerfil debe ser un archivo válido');
        }
      }

      if (request.certificadoSanitario) {
        if (request.certificadoSanitario instanceof File || request.certificadoSanitario instanceof Blob) {
          const fileName = request.certificadoSanitario instanceof File ? request.certificadoSanitario.name : 'health-certificate.jpg';
          formData.append('certificadoSanitario', request.certificadoSanitario, fileName);
        } else {
          console.error('certificadoSanitario no es un File o Blob válido:', request.certificadoSanitario);
          throw new Error('certificadoSanitario debe ser un archivo válido');
        }
      }

      const { data } = await apiClient.post<RegisterCenterResponse>(
        '/centros-salud/completar-perfil',
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
      console.error('Error en centerRegistrationService.registerCenter:', error);
      throw error;
    }
  },
};

export default centerRegistrationService;