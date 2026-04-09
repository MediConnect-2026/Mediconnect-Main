import {
  type DoctorPersonalInfo,
  type CenterPersonalInfo,
} from "@/schema/verifyInfo.schema";

export const mockDoctorData: DoctorPersonalInfo = {
  firstName: "Juan",
  lastName: "Pérez",
  gender: "masculino",
  email: "juan.perez@email.com",
  nationality: "dominicana",
  identificationNumber: "123456789",
  phone: "809-555-1234",
  address: "Calle 1, Santo Domingo",
  primarySpecialty: "Cardiología",
  secondarySpecialty: "Medicina Interna",
  medicalLicense: "EX12345",
  verificationStatus: "REJECTED",
  comentarioVerificacion: "El nombre no coincide con el documento enviado. Por favor verifica.",
};

export const mockCenterData: CenterPersonalInfo = {
  name: "Centro Médico La Esperanza",
  description: "Centro médico especializado en atención primaria",
  website: "https://www.centrolaesperanza.com",
  address: "Av. Abraham Lincoln, Santo Domingo",
  province: "Santo Domingo",
  municipality: "Distrito Nacional",
  rnc: "123456789",
  centerType: "Clínica",
  phone: "809-555-5678",
  email: "info@centrolaesperanza.com",
  coordinates: {
    latitude: 18.4861,
    longitude: -69.9312,
  },
  verificationStatus: "REJECTED",
  comentarioVerificacion: "La documentación del RNC no es válida. Adjunta el documento correcto.",
};
