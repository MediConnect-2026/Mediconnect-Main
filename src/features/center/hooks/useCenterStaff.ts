import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { QUERY_KEYS } from "@/lib/react-query/config";
import centerService from "@/shared/navigation/userMenu/editProfile/center/services/center.services";
import type { CenterProfileTranslationParams } from "@/shared/navigation/userMenu/editProfile/center/services/center.types";
import { mapAllianceRequestsToStaff } from "@/features/center/utilities/staffMapper";
import type { CenterStaffMember } from "@/features/center/types/staff.types";

export function useCenterStaff() {
  const { i18n } = useTranslation();
  const language = i18n.language;

  const translationParams: CenterProfileTranslationParams | undefined =
    language && language !== "es"
      ? {
          target: language,
          source: "es",
          translate_fields: "mensaje,doctor.especialidades.nombre,doctor.idiomas.nombre,doctor.seguros.nombre",
        }
      : undefined;

  return useQuery<CenterStaffMember[], Error>({
    queryKey: [...QUERY_KEYS.CENTER_STAFF(language)],
    queryFn: async () => {
      const response = await centerService.getCenterStaff(translationParams);
      return mapAllianceRequestsToStaff(response);
    },
    staleTime: 1000 * 60 * 5,
  });
}

export default useCenterStaff;