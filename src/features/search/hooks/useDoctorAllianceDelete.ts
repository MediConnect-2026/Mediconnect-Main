import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service";

export const useDoctorAllianceDelete = () => {
  const { t } = useTranslation("center");
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string | number) => {
      return doctorService.deleteAllianceRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DOCTORS_SEARCH,
      });
      toast.success(t("connection.allianceDisconnectSuccess"));
    },
    onError: (error: Error) => {
      toast.error(error.message || t("connection.allianceDisconnectError"));
    },
  });
};

export default useDoctorAllianceDelete;
