import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { QUERY_KEYS } from "@/lib/react-query/config";
import centerService from "@/shared/navigation/userMenu/editProfile/center/services/center.services";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service";
import type { AllianceRequestRecord } from "@/shared/navigation/userMenu/editProfile/center/services/center.types";
import { Spinner } from "@/shared/ui/spinner";
import MCButton from "@/shared/components/forms/MCButton";
import { toast } from "sonner";
import { RequestTabs } from "../components/RequestTabs";

interface ConnectionRequest {
  id: string;
  name: string;
  subtitle: string;
  date: string;
  avatar: string;
  profileId: string;
  profileType: "doctor" | "center";
  status: "Pendiente" | "Aceptada" | "Rechazada";
  rejectionReason?: string;
  issuerName?: string;
  attendedAt?: string;
}

function RequestPage() {
  const { t, i18n } = useTranslation("common");
  const userRole = useAppStore((state) => state.user?.rol);
  const isMobile = useIsMobile();
  const isCenter = userRole === "CENTER";
  const isDoctor = userRole === "DOCTOR";
  const queryClient = useQueryClient();
  const language = i18n.language === "en" ? "en" : "es";

  const allianceTranslationParams = useMemo(
    () => ({
      target: language,
      source: language === "en" ? "es" : "en",
      translate_fields:
        "mensaje,doctor.nombre,doctor.apellido,centroSalud.nombreComercial",
    }),
    [language],
  );

  const allianceQueryKey = isCenter
    ? QUERY_KEYS.CENTER_ALLIANCE_REQUESTS
    : QUERY_KEYS.DOCTOR_ALLIANCE_REQUESTS;

  const invalidateAllianceRelatedQueries = async () => {
    const dashboardRelatedKeys = [
      QUERY_KEYS.CENTER_STAFF(),
      QUERY_KEYS.CENTERS_STATS_RESUMEN,
      ["centers", "stats", "crecimiento-medicos"],
      ["centers", "stats", "distribucion-especialidades"],
      ["doctors", "my"],
    ] as const;

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CENTER_ALLIANCE_REQUESTS,
      }),
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.DOCTOR_ALLIANCE_REQUESTS,
      }),
      queryClient.invalidateQueries({
        queryKey: ["center", "alliance", "requests"],
      }),
      ...dashboardRelatedKeys.map((queryKey) =>
        queryClient.invalidateQueries({
          queryKey,
          refetchType: "all",
        }),
      ),
    ]);
  };

  const {
    data: allianceResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [...allianceQueryKey, language],
    queryFn: () =>
      isCenter
        ? centerService.getCenterAllianceRequests(allianceTranslationParams)
        : doctorService.getDoctorAllianceRequests(allianceTranslationParams),
    enabled: isCenter || isDoctor,
  });

  const updateAllianceRequestMutation = useMutation({
    mutationFn: ({
      requestId,
      estado,
      motivoRechazo,
    }: {
      requestId: string;
      estado: "Aceptada" | "Rechazada";
      motivoRechazo?: string;
    }) =>
      isCenter
        ? centerService.updateAllianceRequestStatus(requestId, {
            estado,
            motivoRechazo,
          })
        : doctorService.updateAllianceRequestStatus(requestId, {
            estado,
            motivoRechazo,
          }),
    onSuccess: async () => {
      await invalidateAllianceRelatedQueries();
      await queryClient.refetchQueries({
        queryKey: allianceQueryKey,
        type: "active",
      });
    },
  });

  const deleteAllianceRequestMutation = useMutation({
    mutationFn: ({ requestId }: { requestId: string }) =>
      isCenter
        ? centerService.deleteAllianceRequest(requestId)
        : doctorService.deleteAllianceRequest(requestId),
    onSuccess: async () => {
      await invalidateAllianceRelatedQueries();
      await queryClient.refetchQueries({
        queryKey: allianceQueryKey,
        type: "active",
      });
    },
  });

  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>(
    [],
  );
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);

  useEffect(() => {
    if (!(isCenter || isDoctor) || !allianceResponse?.data) {
      return;
    }

    const mappedRequests = mapAllianceRequestsToCards(
      allianceResponse.data,
      i18n.language,
      userRole,
    );

    const receivedInitiator = userRole === "CENTER" ? "Doctor" : "Centro";
    const sentInitiator = userRole === "CENTER" ? "Centro" : "Doctor";

    setReceivedRequests(
      mappedRequests
        .filter((item) => item.iniciadaPor === receivedInitiator)
        .map((item) => item.card),
    );

    setSentRequests(
      mappedRequests
        .filter((item) => item.iniciadaPor === sentInitiator)
        .map((item) => item.card),
    );
  }, [isCenter, isDoctor, allianceResponse?.data, i18n.language, userRole]);

  const handleConnect = async (id: string) => {
    try {
      await updateAllianceRequestMutation.mutateAsync({
        requestId: id,
        estado: "Aceptada",
      });

      setReceivedRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? {
                ...request,
                status: "Aceptada",
                attendedAt: new Intl.DateTimeFormat(
                  i18n.language === "en" ? "en-US" : "es-DO",
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  },
                ).format(new Date()),
              }
            : request,
        ),
      );
      toast.success(t("requests.acceptSuccess"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("requests.actionError");
      toast.error(message);
      throw error;
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await updateAllianceRequestMutation.mutateAsync({
        requestId: id,
        estado: "Rechazada",
        motivoRechazo: reason.trim(),
      });

      setReceivedRequests((prev) =>
        prev.map((request) =>
          request.id === id
            ? {
                ...request,
                status: "Rechazada",
                rejectionReason: reason.trim(),
                attendedAt: new Intl.DateTimeFormat(
                  i18n.language === "en" ? "en-US" : "es-DO",
                  {
                    dateStyle: "medium",
                    timeStyle: "short",
                  },
                ).format(new Date()),
              }
            : request,
        ),
      );
      toast.success(t("requests.rejectSuccess"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("requests.actionError");
      toast.error(message);
      throw error;
    }
  };

  const handleWithdraw = async (id: string) => {
    try {
      await deleteAllianceRequestMutation.mutateAsync({ requestId: id });
      setSentRequests((prev) => prev.filter((r) => r.id !== id));
      toast.success(t("requests.withdrawSuccess"));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("requests.actionError");
      toast.error(message);
      throw error;
    }
  };

  return (
    <MCDashboardContent mainWidth={isMobile ? "w-full" : "max-w-2xl"}>
      <div
        className={`flex flex-col gap-6 items-center justify-center w-full mb-8 ${isMobile ? "px-4" : "px-0"}`}
      >
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`font-medium mb-2 text-center ${isMobile ? "text-3xl" : "text-5xl"}`}
          >
            {t("requests.title")}
          </h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            {t("requests.description", {
              type:
                userRole === "DOCTOR"
                  ? t("requests.doctorConnections")
                  : t("requests.centerConnections"),
            })}
          </p>
        </div>

        <div className="w-full">
          {(isCenter || isDoctor) && isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Spinner className="size-6" />
              <p className="text-sm text-muted-foreground">{t("loading")}</p>
            </div>
          ) : (isCenter || isDoctor) && isError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {t("requests.loadError")}
              </p>
              <MCButton size="sm" variant="outline" onClick={() => refetch()}>
                {t("retry")}
              </MCButton>
            </div>
          ) : (
            <RequestTabs
              receivedRequests={receivedRequests}
              sentRequests={sentRequests}
              onConnect={handleConnect}
              onReject={handleReject}
              onWithdraw={handleWithdraw}
            />
          )}
        </div>
      </div>
    </MCDashboardContent>
  );
}

function mapAllianceRequestsToCards(
  requests: AllianceRequestRecord[],
  language: string,
  userRole: string | undefined,
): Array<{ iniciadaPor: "Doctor" | "Centro"; card: ConnectionRequest }> {
  const locale = language === "en" ? "en-US" : "es-DO";
  const isCenterRole = userRole === "CENTER";

  return requests.map((item) => {
    const createdAt = new Date(item.creadoEn);
    const updatedAt = item.actualizadoEn ? new Date(item.actualizadoEn) : null;
    const name = isCenterRole
      ? `${item.doctor?.nombre ?? ""} ${item.doctor?.apellido ?? ""}`.trim()
      : (item.centroSalud?.nombreComercial ?? "").trim();

    const issuerName =
      item.iniciadaPor === "Doctor"
        ? `${item.doctor?.nombre ?? ""} ${item.doctor?.apellido ?? ""}`.trim()
        : (item.centroSalud?.nombreComercial ?? "").trim();

    const avatar = isCenterRole
      ? (item.doctor?.usuario?.fotoPerfil ?? "")
      : (item.centroSalud?.foto_perfil ?? "");

    const profileId = isCenterRole
      ? String(item.doctorId ?? "")
      : String(item.centroSaludId ?? "");

    const profileType: "doctor" | "center" = isCenterRole ? "doctor" : "center";

    return {
      iniciadaPor: item.iniciadaPor,
      card: {
        id: String(item.id),
        name: name || "-",
        subtitle: item.mensaje ?? "",
        date: Number.isNaN(createdAt.getTime())
          ? ""
          : new Intl.DateTimeFormat(locale, {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(createdAt),
        avatar,
        profileId,
        profileType,
        status: item.estado,
        rejectionReason: item.motivoRechazo ?? "",
        issuerName: issuerName || "-",
        attendedAt:
          updatedAt && !Number.isNaN(updatedAt.getTime())
            ? new Intl.DateTimeFormat(locale, {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(updatedAt)
            : "",
      },
    };
  });
}

export default RequestPage;
