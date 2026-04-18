import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services";
import type { GetServicesOfDoctor } from "@/shared/navigation/userMenu/editProfile/doctor/services";

const normalizeLanguageCode = (language?: string): "es" | "en" =>
  language?.toLowerCase().startsWith("en") ? "en" : "es";

interface UseDoctorServicesByDoctorParams {
  doctorId?: number | null;
  enabled?: boolean;
  staleTime?: number;
}

export function useDoctorServicesByDoctor({
  doctorId,
  enabled = true,
  staleTime = 1000 * 60 * 5,
}: UseDoctorServicesByDoctorParams): UseQueryResult<GetServicesOfDoctor[], Error> {
  const { i18n } = useTranslation();
  const currentLanguage = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);
  const sourceLanguage = currentLanguage === "en" ? "es" : "en";

  return useQuery<GetServicesOfDoctor[], Error>({
    queryKey: ["doctor-services-by-doctor", doctorId, currentLanguage],
    enabled: enabled && Boolean(doctorId),
    staleTime,
    queryFn: async () => {
      if (!doctorId) {
        return [];
      }

      const response = await doctorService.getServicesOfDoctor(Number(doctorId), {
        target: currentLanguage,
        source: sourceLanguage,
        translate_fields: "nombre,descripcion,modalidad",
      });

      if (response?.success && Array.isArray(response.data)) {
        return response.data;
      }

      return [];
    },
  });
}
