import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/react-query/config";
import centerService from "@/shared/navigation/userMenu/editProfile/center/services/center.services";
import type { DoctorAllianceRequestPayload } from "@/shared/navigation/userMenu/editProfile/center/services/center.types";

export const useDoctorAllianceRequest = () => {
  const { t } = useTranslation("center");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: DoctorAllianceRequestPayload) => {
      return centerService.createDoctorAllianceRequest(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DOCTORS_SEARCH,
      });
      toast.success(t("connection.allianceRequestSent"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("connection.allianceRequestError"));
    },
  });
};
 
export default useDoctorAllianceRequest;
