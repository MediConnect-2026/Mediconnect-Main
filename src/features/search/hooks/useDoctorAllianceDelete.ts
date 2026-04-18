import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service";
import centerService from "@/shared/navigation/userMenu/editProfile/center/services/center.services";
import { useAppStore } from "@/stores/useAppStore";

export const useDoctorAllianceDelete = () => {
  const { t } = useTranslation("center");
  const queryClient = useQueryClient();
  const userRole = useAppStore((state) => state.user?.rol);

  return useMutation({
    mutationFn: async (requestId: string | number) => {
      if (userRole === "CENTER") {
        return centerService.deleteAllianceRequest(requestId);
      }

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
