import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { QUERY_KEYS } from "@/lib/react-query/config";
import centerService from "@/shared/navigation/userMenu/editProfile/center/services/center.services";
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

  const mockDoctorReceivedRequests = useMemo<ConnectionRequest[]>(
    () => [
      {
        id: "d1",
        name: "Edith García",
        subtitle: t("requests.mock.specialtyCardiology"),
        date: t("requests.mock.receivedToday"),
        avatar: "",
        profileId: "d1",
        profileType: "doctor",
        status: "Pendiente",
      },
      {
        id: "d2",
        name: "Carlos Mendoza",
        subtitle: t("requests.mock.specialtyNeurology"),
        date: t("requests.mock.receivedYesterday"),
        avatar: "",
        profileId: "d2",
        profileType: "doctor",
        status: "Pendiente",
      },
      {
        id: "d3",
        name: "María López",
        subtitle: t("requests.mock.specialtyPediatrics"),
        date: t("requests.mock.receivedTwoDaysAgo"),
        avatar: "",
        profileId: "d3",
        profileType: "doctor",
        status: "Pendiente",
      },
    ],
    [t, language],
  );

  const mockDoctorSentRequests = useMemo<ConnectionRequest[]>(
    () => [
      {
        id: "d4",
        name: "Roberto Sánchez",
        subtitle: t("requests.mock.specialtyDermatology"),
        date: t("requests.mock.sentToday"),
        avatar: "",
        profileId: "d4",
        profileType: "doctor",
        status: "Pendiente",
      },
      {
        id: "d5",
        name: "Ana Chen",
        subtitle: t("requests.mock.specialtyOphthalmology"),
        date: t("requests.mock.sentThreeDaysAgo"),
        avatar: "",
        profileId: "d5",
        profileType: "doctor",
        status: "Pendiente",
      },
    ],
    [t, language],
  );

  const {
    data: allianceResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: [...QUERY_KEYS.CENTER_ALLIANCE_REQUESTS, language],
    queryFn: () => centerService.getCenterAllianceRequests(allianceTranslationParams),
    enabled: isCenter,
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
      centerService.updateAllianceRequestStatus(requestId, {
        estado,
        motivoRechazo,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CENTER_ALLIANCE_REQUESTS,
      });
    },
  });

  // Keep doctor role mocked in this phase; center role is hydrated from API.
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>(
    userRole === "DOCTOR"
      ? mockDoctorReceivedRequests
      : [],
  );
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>(
    userRole === "DOCTOR" ? mockDoctorSentRequests : [],
  );

  useEffect(() => {
    if (!isCenter || !allianceResponse?.data) {
      return;
    }

    const mappedRequests = mapAllianceRequestsToCards(
      allianceResponse.data,
      i18n.language,
      userRole,
    );

    setReceivedRequests(
      mappedRequests
        .filter((item) => item.iniciadaPor === "Doctor")
        .map((item) => item.card),
    );

    setSentRequests(
      mappedRequests
        .filter((item) => item.iniciadaPor === "Centro")
        .map((item) => item.card),
    );
  }, [isCenter, allianceResponse?.data, i18n.language, userRole]);

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
      toast.success(
        t("requests.acceptSuccess"),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("requests.actionError");
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
      toast.success(
        t("requests.rejectSuccess"),
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("requests.actionError");
      toast.error(message);
      throw error;
    }
  };

  const handleWithdraw = (id: string) => {
    setSentRequests((prev) => prev.filter((r) => r.id !== id));
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
          {isCenter && isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <Spinner className="size-6" />
              <p className="text-sm text-muted-foreground">
                {t("search.loading")}
              </p>
            </div>
          ) : isCenter && isError ? (
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
      ? item.doctor?.usuario?.fotoPerfil ?? ""
      : item.centroSalud?.foto_perfil ?? "";

    const profileId = isCenterRole
      ? String(item.doctorId ?? "")
      : String(item.centroSaludId ?? "");

    const profileType: "doctor" | "center" = isCenterRole
      ? "doctor"
      : "center";

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
