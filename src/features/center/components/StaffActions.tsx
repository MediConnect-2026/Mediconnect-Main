import { useTranslation } from "react-i18next";
import { Eye, UserX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ROUTES } from "@/router/routes";
import { toast } from "sonner";
import { QUERY_KEYS } from "@/lib/react-query/config";
import centerService from "@/shared/navigation/userMenu/editProfile/center/services/center.services";
import ToogleConfirmConnection from "../../request/components/ToogleConfirmConnection";

interface StaffActionsProps {
  doctor: {
    id: string;
    doctorId: number;
    name: string;
    status: string;
  };
}

function StaffActions({ doctor }: StaffActionsProps) {
  const { t } = useTranslation("center");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const deleteAllianceMutation = useMutation({
    mutationFn: async (requestId: string) =>
      centerService.deleteAllianceRequest(requestId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CENTER_STAFF(),
      });
      toast.success(t("connection.allianceDisconnectSuccess"));
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("connection.allianceDisconnectError");
      toast.error(errorMessage);
    },
  });

  const handleViewProfile = () => {
    navigate(
      ROUTES.DOCTOR.DOCTOR_PROFILE_PUBLIC.replace(":doctorId", doctor.doctorId.toString()),
    );
  };

  const handleConfirmDisconnect = async () => {
    const requestId = doctor.id;

    if (!requestId || requestId === "undefined" || requestId === "null") {
      toast.error(t("connection.allianceDisconnectError"));
      return;
    }

    await deleteAllianceMutation.mutateAsync(requestId);
  };

  return (
    <div className="flex flex-col gap-1 p-2">
      <div
        className="p-2 cursor-pointer rounded-lg hover:bg-accent/70 transition text-sm flex items-center gap-2"
        onClick={handleViewProfile}
      >
        <Eye className="h-4 w-4" />
        {t("staff.viewProfile", "Ver Perfil")}
      </div>
      <ToogleConfirmConnection
        status={doctor.status === "active" ? "connected" : "not_connected"}
        id={parseInt(doctor.id)}
        onConfirm={handleConfirmDisconnect}
        isSubmitting={deleteAllianceMutation.isPending}
      >
        <div className="p-2 cursor-pointer rounded-lg hover:bg-destructive/10 text-destructive transition text-sm flex items-center gap-2">
          <UserX className="h-4 w-4" />
          {t("staff.disconnect", "Desconectar")}
        </div>
      </ToogleConfirmConnection>
    </div>
  );
}

export default StaffActions;
