import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import MCDoctorsCards from "@/shared/components/MCDoctorsCards";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import { Filter, ShieldCheck } from "lucide-react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import CenterProfileBanner from "../components/profile/CenterProfileBanner";
import CenterProfileBannerMobile from "../components/profile/CenterProfileBannerMobile";
import FilterStaff from "../components/filters/FilterStaff";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";
import ubicacionesService from "@/features/onboarding/services/ubicaciones.services";
import { QUERY_KEYS } from "@/lib/react-query/config";
import { getUserAvatar, getUserFullName } from "@/services/auth/auth.types";
import centerService from "@/shared/navigation/userMenu/editProfile/center/services/center.services";
import { Skeleton } from "@/shared/ui/skeleton";
import { formatPhone } from "@/utils/phoneFormat";
import { useDoctorAllianceRequest } from "@/features/search/hooks/useDoctorAllianceRequest";
import { useDoctorAllianceDelete } from "@/features/search/hooks/useDoctorAllianceDelete";

interface StaffFilters {
  specialty: string | string[];
  rating: string | string[];
  joinDate: { from: Date | null; to: Date | null };
}

type ConnectionStatus = "connected" | "not_connected" | "pending";

interface CenterConnectionSnapshot {
  status: ConnectionStatus;
  requestId?: number;
}

function normalizeCenterConnection(centerProfile: unknown): CenterConnectionSnapshot {
  const profile = (centerProfile ?? {}) as {
    estaConectado?: boolean;
    estadoAlianza?: string;
    solicitudAlianzaId?: number | null;
  };

  const normalizedAllianceStatus = (profile.estadoAlianza || "").toLowerCase();
  const isConnected =
    profile.estaConectado === true ||
    normalizedAllianceStatus === "aceptada" ||
    normalizedAllianceStatus === "accepted";
  const isPending =
    normalizedAllianceStatus === "pendiente" ||
    normalizedAllianceStatus === "pending" ||
    normalizedAllianceStatus === "en_proceso" ||
    normalizedAllianceStatus === "in_progress";

  const status: ConnectionStatus = isConnected
    ? "connected"
    : isPending
      ? "pending"
      : "not_connected";

  const requestId =
    typeof profile.solicitudAlianzaId === "number" && Number.isFinite(profile.solicitudAlianzaId)
      ? profile.solicitudAlianzaId
      : undefined;

  return { status, requestId };
}

function parseApiNumeric(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  // Decimal-like objects from backend serializers (e.g. { s, e, d })
  if (value && typeof value === "object") {
    const maybeDecimal = value as { toString?: () => string };
    if (typeof maybeDecimal.toString === "function") {
      const parsed = Number(maybeDecimal.toString());
      return Number.isFinite(parsed) ? parsed : 0;
    }
  }

  return 0;
}

function normalizeFilterText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function parseValidDate(value?: string | null): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function isDateInRange(
  date: Date,
  from: Date | null,
  to: Date | null,
): boolean {
  const start = from ? new Date(from) : null;
  const end = to ? new Date(to) : null;

  if (start) {
    start.setHours(0, 0, 0, 0);
  }

  if (end) {
    end.setHours(23, 59, 59, 999);
  }

  if (start && date < start) return false;
  if (end && date > end) return false;
  return true;
}


function CenterProfilePage() {
  const [openSheet, setOpenSheet] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [deletingAllianceId, setDeletingAllianceId] = useState<string | number | null>(null);
  const [optimisticCenterConnection, setOptimisticCenterConnection] = useState<CenterConnectionSnapshot | null>(null);
  const { centerId } = useParams();
  const { t, i18n } = useTranslation("center");

  const [staffFilters, setStaffFilters] = useState<StaffFilters>({
    specialty: "",
    rating: "",
    joinDate: { from: null, to: null },
  });

  const user = useAppStore((state) => state.user);
  const createDoctorAllianceMutation = useDoctorAllianceRequest();
  const deleteDoctorAllianceMutation = useDoctorAllianceDelete();
  const isMobile = useIsMobile();
  const isMyProfile = !centerId || String(user?.id ?? "") === String(centerId);
  const viewedCenterId = isMyProfile ? String(user?.id ?? "") : String(centerId ?? "");

  const language = i18n.language || "es";

  const allianceTranslationParams = useMemo(
    () => ({
      target: language === "en" ? "en" : "es",
      source: language === "en" ? "es" : "en",
      translate_fields: "doctor.nombre,doctor.apellido,mensaje",
    }),
    [language],
  );

  const profileTranslationParams =
    language !== "es"
      ? {
          target: language,
          source: language === "en" ? "es" : "en",
          translate_fields: "descripcion,nombreComercial",
        }
      : undefined;

  const {
    data: myCenterProfileResponse,
    isLoading: isLoadingMyCenterProfile,
    isError: isMyCenterProfileError,
    refetch: refetchMyCenterProfile,
  } = useQuery({
    queryKey: ["center-profile", "me", language],
    queryFn: () => centerService.getMyProfile(profileTranslationParams),
    enabled: isMyProfile,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: publicCenterProfileResponse,
    isLoading: isLoadingPublicCenterProfile,
    isError: isPublicCenterProfileError,
    refetch: refetchPublicCenterProfile,
  } = useQuery({
    queryKey: ["center-profile", "public", centerId, language],
    queryFn: () => centerService.getCenterById(centerId as string, profileTranslationParams),
    enabled: !isMyProfile && Boolean(centerId),
    staleTime: 1000 * 60 * 5,
  });

  const centerProfile = isMyProfile
    ? myCenterProfileResponse?.data
    : publicCenterProfileResponse?.data;

  const isLoadingCenterProfile = isMyProfile
    ? isLoadingMyCenterProfile
    : isLoadingPublicCenterProfile;

  const isCenterProfileError = isMyProfile
    ? isMyCenterProfileError
    : isPublicCenterProfileError;

  const refetchCenterProfile = isMyProfile
    ? refetchMyCenterProfile
    : refetchPublicCenterProfile;

  const {
    data: allianceResponse,
    isLoading: isAllianceLoading,
    isError: isAllianceError,
    refetch: refetchAlliance,
  } = useQuery({
    queryKey: [...QUERY_KEYS.CENTER_ALLIANCE_REQUESTS, viewedCenterId, language],
    queryFn: () =>
      centerService.getCenterAllianceRequests({
        ...allianceTranslationParams,
        centroSaludId: !isMyProfile && centerId ? centerId : undefined,
      }),
    enabled: isMyProfile || Boolean(centerId),
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: insurancesResponse,
    isLoading: isInsurancesLoading,
    isError: isInsurancesError,
    refetch: refetchInsurances,
  } = useQuery({
    queryKey: [...QUERY_KEYS.MY_INSURANCES(language), "center-profile", viewedCenterId],
    queryFn: () =>
      centerService.getInsurances(
        language,
        !isMyProfile && centerId ? centerId : undefined,
      ),
    enabled: isMyProfile || Boolean(centerId),
    staleTime: 1000 * 60 * 30,
  });

  const insurancesList = insurancesResponse?.data ?? [];

  const doctorsList = useMemo(() => {
    const requests = allianceResponse?.data ?? [];

    return requests
      .filter((request) => request.estado === "Aceptada" && request.doctor)
      .map((request) => {
        const doctor = request.doctor;
        const specialties =
          doctor?.especialidades
            ?.map((item) => item.nombre?.trim())
            .filter((value): value is string => Boolean(value)) ?? [];

        const languages =
          doctor?.idiomas
            ?.map((item) => item.nombre?.trim())
            .filter((value): value is string => Boolean(value)) ?? [];

        const insuranceAccepted =
          doctor?.seguros
            ?.map((item) => item.nombre?.trim())
            .filter((value): value is string => Boolean(value)) ?? [];

        return {
          id: request.id,
          doctorId: request.doctorId,
          name: `${doctor?.nombre ?? ""} ${doctor?.apellido ?? ""}`.trim() || "-",
          specialty: specialties.length > 0 ? specialties.join(", ") : t("profilePage.noSpecialty"),
          specialtyList: specialties,
          rating: parseApiNumeric(doctor?.calificacionPromedio),
          yearsOfExperience: doctor?.anosExperiencia,
          languages,
          insuranceAccepted,
          isFavorite: request.doctor?.isFavorite ?? false,
          urlImage: doctor?.usuario?.fotoPerfil ?? "",
          createdAt: request.creadoEn,
          updatedAt: request.actualizadoEn,
        };
      });
  }, [allianceResponse?.data, t]);

  const center = {
    id: String(centerProfile?.usuarioId ?? centerId ?? user?.id ?? ""),
    name: centerProfile?.nombreComercial || getUserFullName(user) || "-",
    avatar:
      centerProfile?.foto_perfil ||
      centerProfile?.usuario?.fotoPerfil ||
      getUserAvatar(user),
    banner: isMyProfile ? user?.banner : undefined,
    rating: centerProfile?.calificacionPromedio ? parseApiNumeric(centerProfile.calificacionPromedio) : 0,
    reviewCount: centerProfile?.totalResenas ? parseApiNumeric(centerProfile.totalResenas) : 0,
    phone: formatPhone(centerProfile?.usuario?.telefono || ""),
    website: centerProfile?.sitio_web || "",
    description: centerProfile?.descripcion || "",
  };

  const serverCenterConnection = useMemo(
    () =>
      isMyProfile
        ? { status: "not_connected" as ConnectionStatus }
        : normalizeCenterConnection(centerProfile),
    [centerProfile, isMyProfile],
  );

  const effectiveCenterConnection = optimisticCenterConnection ?? serverCenterConnection;

  useEffect(() => {
    setOptimisticCenterConnection(null);
  }, [viewedCenterId]);

  // Mapear la ubicación del centro mediante ubicacionId
  const ubicacionId = centerProfile?.ubicacionId ?? centerProfile?.ubicacion?.id;

  const {
    data: locationResponse,
    isLoading: isLocationLoading,
    isError: isLocationError,
    refetch: refetchLocation,
  } = useQuery({
    queryKey: QUERY_KEYS.UBICACIONES("location", { id: ubicacionId, lang: language }),
    queryFn: () => ubicacionesService.getLocationById(Number(ubicacionId)),
    enabled: Boolean(ubicacionId),
    staleTime: 1000 * 60 * 30,
  });

  const mapUbicacionToCoords = (locResp: any) => {
    if (!locResp) return null;
    const loc = locResp.data || locResp;

    // GeoJSON puntoGeografico: { coordinates: [lng, lat] }
    try {
      const coords = loc?.puntoGeografico?.coordinates;
      if (Array.isArray(coords) && coords.length >= 2) {
        const lng = Number(coords[0]);
        const lat = Number(coords[1]);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
      }

      // Direct fields
      if (loc?.lat && loc?.lng) {
        const lat = Number(loc.lat);
        const lng = Number(loc.lng);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
      }

      // Nested coordinates object
      if (loc?.coordinates?.latitude && loc?.coordinates?.longitude) {
        const lat = Number(loc.coordinates.latitude);
        const lng = Number(loc.coordinates.longitude);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
      }
    } catch (e) {
      console.error("Error parsing location coords:", e);
    }

    return null;
  };

  const parsedLocation = mapUbicacionToCoords(locationResponse);

  // Center location fallback (Santo Domingo, RD - Hospital Dario Contreras)
  const centerLocation = parsedLocation ?? { lat: 18.4861, lng: -69.8887 };

  const updateStaffFilters = (newFilters: Partial<StaffFilters>) => {
    setStaffFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetStaffFilters = () => {
    setStaffFilters({
      specialty: "",
      rating: "",
      joinDate: { from: null, to: null },
    });
    setSearchName("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (
      staffFilters.specialty &&
      (Array.isArray(staffFilters.specialty)
        ? staffFilters.specialty.length > 0
        : staffFilters.specialty !== "")
    )
      count++;
    if (
      staffFilters.rating &&
      (Array.isArray(staffFilters.rating)
        ? staffFilters.rating.length > 0
        : staffFilters.rating !== "" && staffFilters.rating !== "0")
    )
      count++;
    if (staffFilters.joinDate.from || staffFilters.joinDate.to) count++;
    if (searchName) count++;
    return count;
  };

  const filteredDoctors = doctorsList.filter((doctor) => {
    if (
      searchName &&
      !doctor.name.toLowerCase().includes(searchName.toLowerCase())
    )
      return false;

    if (staffFilters.specialty) {
      const specs = Array.isArray(staffFilters.specialty)
        ? staffFilters.specialty
        : [staffFilters.specialty];
      const normalizedSpecs = specs
        .map((value) => normalizeFilterText(value))
        .filter((value) => value.length > 0);

      const doctorSpecialties =
        doctor.specialtyList.length > 0
          ? doctor.specialtyList
          : doctor.specialty
              .split(",")
              .map((value) => value.trim())
              .filter((value) => value.length > 0);

      const normalizedDoctorSpecialties = doctorSpecialties.map((value) =>
        normalizeFilterText(value),
      );

      if (
        normalizedSpecs.length > 0 &&
        !normalizedSpecs.some((selectedSpecialty) =>
          normalizedDoctorSpecialties.includes(selectedSpecialty),
        )
      )
        return false;
    }

    if (staffFilters.rating) {
      const minRating = Array.isArray(staffFilters.rating)
        ? Math.max(...staffFilters.rating.map(Number))
        : Number(staffFilters.rating);
      if (doctor.rating === undefined || doctor.rating === null) return false;
      if (minRating > 0 && doctor.rating < minRating) return false;
    }

    if (staffFilters.joinDate.from || staffFilters.joinDate.to) {
      const createdAt = parseValidDate(doctor.createdAt);
      const updatedAt = parseValidDate(doctor.updatedAt);

      const hasDateInRange = [createdAt, updatedAt]
        .filter((date): date is Date => date !== null)
        .some((date) =>
          isDateInRange(date, staffFilters.joinDate.from, staffFilters.joinDate.to),
        );

      if (!hasDateInRange) {
        return false;
      }
    }

    return true;
  });
  
  const deleteAllianceMutation = useMutation({
    mutationFn: async (requestId: string | number) =>
      centerService.deleteAllianceRequest(requestId),
    onSuccess: async () => {
      await refetchAlliance();
      toast.success(t("connection.allianceDisconnectSuccess"));
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("connection.allianceDisconnectError");
      toast.error(errorMessage);
    },
    onSettled: () => {
      setDeletingAllianceId(null);
    },
  });

  const handleDisconnectAlliance = (requestId: string | number) => {
    if (!isMyProfile) return;
    setDeletingAllianceId(requestId);
    deleteAllianceMutation.mutate(requestId);
  };

  const handleConnectToCenter = async (id: string, message?: string) => {
    const destinatarioId = Number(id);
    const allianceMessage = (message ?? "").trim();

    if (!Number.isFinite(destinatarioId) || allianceMessage.length < 10) {
      return;
    }

    const previousConnection = optimisticCenterConnection;
    setOptimisticCenterConnection({
      status: "pending",
      requestId: previousConnection?.requestId ?? serverCenterConnection.requestId,
    });

    try {
      const response = await createDoctorAllianceMutation.mutateAsync({
        destinatarioId,
        mensaje: allianceMessage,
      });

      const requestId =
        typeof response.message === "object" && response.message && "id" in response.message
          ? Number((response.message as { id?: number }).id)
          : undefined;

      setOptimisticCenterConnection({
        status: "pending",
        requestId: Number.isFinite(requestId) ? requestId : undefined,
      });
    } catch {
      setOptimisticCenterConnection(previousConnection ?? null);
    }
  };

  const handleDisconnectFromCenter = async (_centerUserId: string) => {
    const requestId = optimisticCenterConnection?.requestId ?? serverCenterConnection.requestId;

    if (!requestId) {
      toast.error(t("connection.allianceDisconnectError"));
      return;
    }

    const previousConnection = optimisticCenterConnection;
    setOptimisticCenterConnection({ status: "not_connected" });

    try {
      await deleteDoctorAllianceMutation.mutateAsync(requestId);
    } catch {
      setOptimisticCenterConnection(previousConnection ?? null);
    }
  };

  if (isLoadingCenterProfile) {
    return (
      <MCDashboardContent mainWidth="w-[100%]" noBg>
        <div className="min-h-screen w-full flex flex-col gap-4">
          <Skeleton className="w-full h-60 rounded-4xl" />
          <Skeleton className="w-full h-36 rounded-4xl" />
          <div className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
            <Skeleton className="w-full h-72 rounded-4xl" />
            <Skeleton className="w-full h-72 rounded-4xl" />
          </div>
        </div>
      </MCDashboardContent>
    );
  }

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full flex flex-col gap-4">
        {isCenterProfileError && (
          <Card className="rounded-3xl border border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-foreground">
                {t("profilePage.profileLoadError")}
              </p>
              <MCButton size="sm" variant="outline" onClick={() => refetchCenterProfile()}>
                {t("profilePage.retry")}
              </MCButton>
            </CardContent>
          </Card>
        )}

        {/* Banner del centro */}
        <div className="w-full">
          {isMobile ? (
            <CenterProfileBannerMobile
              center={center}
              setOpenSheet={isMyProfile ? setOpenSheet : undefined}
              isConnected={effectiveCenterConnection.status}
              onConnect={handleConnectToCenter}
              onDisconnect={handleDisconnectFromCenter}
              isConnecting={createDoctorAllianceMutation.isPending || deleteDoctorAllianceMutation.isPending}
            />
          ) : (
            <CenterProfileBanner
              center={center}
              setOpenSheet={isMyProfile ? setOpenSheet : undefined}
              isConnected={effectiveCenterConnection.status}
              onConnect={handleConnectToCenter}
              onDisconnect={handleDisconnectFromCenter}
              isConnecting={createDoctorAllianceMutation.isPending || deleteDoctorAllianceMutation.isPending}
            />
          )}
        </div>

        {/* Acerca de - Full width card */}
        <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background w-full">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <h2
              className={`mb-3 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
            >
              {t("profilePage.aboutTitle")}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {center?.description || t("profilePage.aboutDescription")}
            </p>
          </CardContent>
        </Card>

        {/* Grid: Seguros + Mapa */}
        <div className={isMobile ? "w-full px-0" : "w-full"}>
          <div
            className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-4"} w-full`}
          >
            {/* Seguros aceptados */}
            <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
              <CardContent className={isMobile ? "p-4" : "p-6"}>
                <h2
                  className={`mb-4 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
                >
                  {t("profilePage.insurancesTitle")}
                </h2>
                {isInsurancesLoading ? (
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 6 }, (_, idx) => (
                      <Skeleton key={idx} className="h-16 w-full rounded-lg" />
                    ))}
                  </div>
                ) : isInsurancesError ? (
                  <Card className="rounded-3xl border border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-sm text-foreground">
                        {t("profilePage.insurancesLoadError")}
                      </p>
                      <MCButton size="sm" variant="outline" onClick={() => refetchInsurances()}>
                        {t("profilePage.retry")}
                      </MCButton>
                    </CardContent>
                  </Card>
                ) : insurancesList.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {insurancesList.map((insurance) => (
                      <div
                        key={insurance.id}
                        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/20 cursor-pointer"
                      >
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border-2 font-bold border-primary/10 text-foreground">
                          {insurance.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {insurance.nombre}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty>
                    <EmptyHeader>
                      <div className="flex flex-col items-center gap-2 py-6">
                        <span className="flex items-center gap-2 text-primary">
                          <ShieldCheck className="w-7 h-7" />
                          <EmptyTitle className="text-lg font-semibold">
                            {t("profilePage.insurancesUnavailable")}
                          </EmptyTitle>
                        </span>
                        <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
                          {t("profilePage.insurancesEmptyDescription")}
                        </EmptyDescription>
                      </div>
                    </EmptyHeader>
                  </Empty>
                )}
              </CardContent>
            </Card>

            {/* Ubicación / Mapa */}
            <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
              <CardContent className={isMobile ? "p-4" : "p-6"}>
                <h2
                  className={`mb-4 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
                >
                  {t("profilePage.locationTitle")}
                </h2>
                {isLocationLoading ? (
                  <Skeleton className="w-full h-60 rounded-4xl" />
                ) : isLocationError ? (
                  <Card className="rounded-3xl border border-destructive/30 bg-destructive/5">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <p className="text-sm text-foreground">{t("profilePage.locationLoadError")}</p>
                      <MCButton size="sm" variant="outline" onClick={() => refetchLocation()}>
                        {t("profilePage.retry")}
                      </MCButton>
                    </CardContent>
                  </Card>
                ) : parsedLocation ? (
                  <MapScheduleLocation
                    initialLocation={centerLocation}
                    fontSizeVariant={isMobile ? "xs" : "s"}
                    showAddressInfo={true}
                  />
                ) : (
                  <p className="text-muted-foreground">{t("profilePage.locationUnavailable")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Directorio médico (Doctores conectados) */}
        <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background w-full">
          <CardHeader className={isMobile ? "p-4 pb-2" : "p-6 pb-4"}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2
                className={`${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
              >
                {t("profilePage.connectedDoctors")}
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-auto flex-1 sm:flex-none">
                  <MCFilterInput
                    placeholder={t("profilePage.searchPlaceholder")}
                    value={searchName}
                    onChange={setSearchName}
                  />
                </div>
                <FilterStaff
                  filters={staffFilters}
                  onFiltersChange={updateStaffFilters}
                  onClearFilters={resetStaffFilters}
                  activeFiltersCount={getActiveFiltersCount()}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className={isMobile ? "p-4 pt-2" : "p-6 pt-4"}>
            {isAllianceLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }, (_, idx) => (
                  <Skeleton key={idx} className="w-full h-[360px] rounded-3xl" />
                ))}
              </div>
            ) : isAllianceError ? (
              <Card className="rounded-3xl border border-destructive/30 bg-destructive/5">
                <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <p className="text-sm text-foreground">
                    {t("profilePage.affiliatedDoctorsLoadError")}
                  </p>
                  <MCButton size="sm" variant="outline" onClick={() => refetchAlliance()}>
                    {t("profilePage.retry")}
                  </MCButton>
                </CardContent>
              </Card>
            ) : filteredDoctors.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex items-center gap-2 text-primary">
                      <Filter className="w-7 h-7" />
                      <EmptyTitle className="text-lg font-semibold">
                        {t("profilePage.emptyTitle")}
                      </EmptyTitle>
                    </span>
                    <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
                      {t("profilePage.emptyDescription")}
                    </EmptyDescription>
                  </div>
                </EmptyHeader>
                <EmptyContent>
                  {getActiveFiltersCount() > 0 && (
                    <MCButton
                      variant="outline"
                      onClick={resetStaffFilters}
                      className="px-6 py-2"
                      size="sm"
                    >
                      {t("profilePage.clearFilters")}
                    </MCButton>
                  )}
                </EmptyContent>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
                {filteredDoctors.map((doctor) => (
                  <MCDoctorsCards
                    id={doctor.doctorId}
                    key={doctor.id}
                    name={doctor.name}
                    specialty={doctor.specialty}
                    rating={doctor.rating}
                    yearsOfExperience={doctor.yearsOfExperience}
                    languages={doctor.languages}
                    insuranceAccepted={doctor.insuranceAccepted}
                    isFavorite={doctor.isFavorite}
                    urlImage={doctor.urlImage}
                    connectionStatus="connected" // <-- Fuerza el estado conectado
                    onConnect={handleDisconnectAlliance}
                    isConnectionSubmitting={
                      deleteAllianceMutation.isPending &&
                      deletingAllianceId !== null &&
                      String(deletingAllianceId) === String(doctor.id)
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <MCSheetProfile open={openSheet} onOpenChange={setOpenSheet} />
      </div>
    </MCDashboardContent>
  );
}

export default CenterProfilePage;
