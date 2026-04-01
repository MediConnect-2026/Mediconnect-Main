import { AVAILABLE_LANGUAGES } from "@/features/onboarding/constants/languages.constants";
import type { AllianceRequestRecord } from "@/shared/navigation/userMenu/editProfile/center/services/center.types";
import type { CenterStaffMember } from "@/features/center/types/staff.types";

const languageNameToCodeMap = new Map<string, string>(
  AVAILABLE_LANGUAGES.flatMap((language) => [
    [language.label.toLowerCase(), language.code],
    [language.labelEn.toLowerCase(), language.code],
  ]),
);

const parseApiNumeric = (value: unknown): number => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeLanguageCode = (rawLanguage: string): string => {
  const normalized = rawLanguage.trim().toLowerCase();
  if (!normalized) return "";

  if (normalized.length === 2) return normalized;

  const mappedCode = languageNameToCodeMap.get(normalized);
  if (mappedCode) return mappedCode;

  return normalized;
};

export const mapAllianceRequestToStaff = (
  request: AllianceRequestRecord,
): CenterStaffMember | null => {
  const doctor = request.doctor;
  if (!doctor) return null;

  const firstName = doctor.nombre?.trim() ?? "";
  const lastName = doctor.apellido?.trim() ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  const specialtyNames =
    doctor.especialidades
      ?.map((specialty) => specialty.nombre?.trim() ?? "")
      .filter(Boolean) ?? [];

  const specialtyIds =
    doctor.especialidades
      ?.map((specialty) => specialty.id ?? specialty.id_especialidad)
      .filter((id): id is number => Number.isFinite(id))
      .map(String) ?? [];

  const languageCodes =
    doctor.idiomas
      ?.map((language) => normalizeLanguageCode(language.nombre ?? ""))
      .filter(Boolean) ?? [];

  const insuranceAccepted =
    doctor.seguros
      ?.map((insurance) => insurance.nombre?.trim() ?? "")
      .filter(Boolean) ?? [];

  const doctorId = doctor.usuarioId ?? request.doctorId ?? request.id;

  return {
    id: String(doctorId),
    name: fullName || "-",
    specialty: specialtyNames[0] ?? "-",
    specialtyIds,
    rating: parseApiNumeric(doctor.calificacionPromedio),
    yearsOfExperience: doctor.anosExperiencia ?? 0,
    languages: languageCodes,
    insuranceAccepted,
    isFavorite: false,
    urlImage: doctor.usuario?.fotoPerfil ?? "",
    joinDate: request.actualizadoEn ?? request.creadoEn,
    totalAppointments: 0,
    status: request.estado === "Aceptada" ? "active" : "inactive",
  };
};

export const mapAllianceRequestsToStaff = (
  requests: AllianceRequestRecord[] | undefined,
): CenterStaffMember[] => {
  if (!requests || requests.length === 0) return [];

  return requests
    .map(mapAllianceRequestToStaff)
    .filter((item): item is CenterStaffMember => Boolean(item));
};
