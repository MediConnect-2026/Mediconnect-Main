import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { doctorService } from "@/shared/navigation/userMenu/editProfile/doctor/services/doctor.service";
import { Skeleton } from "@/shared/ui/skeleton";
import { toast } from "sonner";

import DoctorProfileBanner from "../components/profile/DoctorProfileBanner";
import DoctorProfileBannerMobile from "../components/profile/DoctorProfileBannerMobile";
import DoctorEducationSection from "../components/profile/DoctorEducationSection";
import DoctorExperienceSection from "../components/profile/DoctorExperienceSection";
import DoctorInsurancesSection from "../components/profile/DoctorInsurancesSection";
import DoctorAboutSection from "../components/profile/DoctorAboutSection";
import DoctorServicesSection from "../components/profile/DoctorServicesSection";
import DoctorCentersSection from "../components/profile/DoctorCentersSection";
import MCDashboardContent from "@/shared/layout/MCDashboardContent"; // <-- importa tu layout
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

function DoctorProfilePage() {
  const { doctorId } = useParams();
  const { i18n, t } = useTranslation("doctor");
  const normalizeLanguageCode = (language?: string): "es" | "en" =>
    language?.toLowerCase().startsWith("en") ? "en" : "es";
  const currentLanguage = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language);
  const sourceLanguage = currentLanguage === "en" ? "es" : "en";
  const [openSheet, setOpenSheet] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);
  const [disconnectingAllianceId, setDisconnectingAllianceId] = useState<
    string | number | null
  >(null);
  const [sheetTab, setSheetTab] = useState<"general" | "education" | "insurance" | "experience" | "language">("general");

  const isMyProfile = !doctorId || user?.id === Number(doctorId);

  // Determinar el ID del doctor a mostrar
  const profileDoctorId = doctorId ? Number(doctorId) : Number(user?.id);
  const hasValidProfileDoctorId = Number.isFinite(profileDoctorId) && profileDoctorId > 0;

  // Fetch del perfil público cuando es otro doctor
  const { data: fetchedDoctorProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["doctor-profile", profileDoctorId, currentLanguage],
    queryFn: () => doctorService.getDoctorById(profileDoctorId!, {
      target: currentLanguage,
      source: sourceLanguage,
      translate_fields: 'biografia,nombre'
    }),
    enabled: !isMyProfile && !!profileDoctorId,
    staleTime: 1000 * 60 * 5,
  });

  const {
    data: myCentersResponse,
    isLoading: isLoadingCenters,
    refetch: refetchMyCenters,
  } = useQuery({
    queryKey: ["doctor-my-centers", profileDoctorId, currentLanguage],
    queryFn: () =>
      doctorService.getMyCenters({
        doctorId: !isMyProfile ? profileDoctorId : undefined,
        target: currentLanguage,
        source: sourceLanguage,
        translate_fields:
          "centroSalud.nombreComercial,centroSalud.tipoCentro.nombre,centroSalud.ubicacion.direccionCompleta",
      }),
    enabled: hasValidProfileDoctorId,
    staleTime: 1000 * 60 * 5,
  });

  const deleteAllianceMutation = useMutation({
    mutationFn: (requestId: string | number) =>
      doctorService.deleteAllianceRequest(requestId),
    onSuccess: async () => {
      await refetchMyCenters();
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
      setDisconnectingAllianceId(null);
    },
  });

  // Usar los datos del store si es mi perfil, o los fetched si es otro doctor
  const doctorProfile = isMyProfile ? user : fetchedDoctorProfile?.data;
  // Para secciones que esperan el objeto doctor anidado (Doctor type)
  const doctorData = doctorProfile;

  const centers = useMemo(() => {
    return (myCentersResponse?.data ?? []).map((item) => ({
      id: item.centroSalud.usuarioId,
      name: item.centroSalud.nombreComercial,
      type:
        item.centroSalud.tipoCentro?.nombre ||
        t("profile.centers.centerTypeFallback", "Centro de salud"),
      rating: 0,
      reviewCount: 0,
      phone: item.centroSalud.usuario?.telefono || "",
      urlImage: item.centroSalud.usuario?.fotoPerfil || "",
      isConnected: true,
      allianceRequestId: item.solicitudId,
      description:
        item.centroSalud.ubicacion?.direccionCompleta ||
        item.centroSalud.ubicacion?.direccion ||
        "",
      connectionStatus: "connected" as const,
    }));
  }, [myCentersResponse?.data, t]);

  const handleViewCenterProfile = (centerId: string | number) => {
    navigate(`/center/profile/${centerId}`);
  };

  const handleDisconnectCenter = (requestId: string | number) => {
    if (!isMyProfile) return;
    setDisconnectingAllianceId(requestId);
    deleteAllianceMutation.mutate(requestId);
  };


  if (isLoadingProfile) {
    return (
      <MCDashboardContent mainWidth="w-[100%]" noBg>
        <div className="min-h-screen w-full space-y-6 p-6">
          <Skeleton className="w-full h-60 rounded-4xl" />
          <Skeleton className="w-2/3 h-8" />
          <Skeleton className="w-full h-40" />
          <Skeleton className="w-full h-40" />
        </div>
      </MCDashboardContent>
    );
  }

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full">
        {/* Banner del doctor */}
        <div className="w-full">
          {isMobile ? (
            <DoctorProfileBannerMobile
              doctor={doctorProfile}
              setOpenSheet={setOpenSheet}
              isMyProfile={isMyProfile}
            />
          ) : (
            <DoctorProfileBanner
              doctor={doctorProfile}
              setOpenSheet={setOpenSheet}
              isMyProfile={isMyProfile}
            />
          )}
        </div>

        {/* Contenido de perfil */}
        <div className="w-full  mt-6 mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[8fr_2fr] gap-4 lg:gap-4">
            {/* Columna principal */}
            <div className="flex flex-col gap-4 lg:gap-6 order-1">
              <DoctorAboutSection 
                doctor={doctorData || undefined} 
                isMyProfile={isMyProfile}
                onOpenSheet={() => {
                  setSheetTab("general");
                  setOpenSheet(true);
                }}
              />
              <DoctorInsurancesSection
                isMyProfile={isMyProfile}
                onOpenSheet={() => {
                  setSheetTab("insurance");
                  setOpenSheet(true);
                }}
                doctorId={profileDoctorId}
              />
              <DoctorServicesSection 
                doctorId={profileDoctorId} 
                isMyProfile={isMyProfile}
              />
              {isLoadingCenters ? (
                <Skeleton className="w-full h-80 rounded-4xl" />
              ) : (
                <DoctorCentersSection
                  centers={centers}
                  onViewProfile={handleViewCenterProfile}
                  onToggleConnection={isMyProfile ? handleDisconnectCenter : undefined}
                  isConnectionSubmitting={deleteAllianceMutation.isPending}
                  connectionSubmittingId={disconnectingAllianceId}
                />
              )}
              {/* Educación y Experiencia - solo en mobile */}
              <div className="flex flex-col gap-4 lg:hidden">
                <DoctorEducationSection 
                  isMyProfile={isMyProfile}
                  onOpenSheet={() => {
                    setSheetTab("education");
                    setOpenSheet(true);
                  }}
                  doctorId={profileDoctorId}
                />
                {user?.id && (
                  <DoctorExperienceSection 
                    doctorId={profileDoctorId}
                    isMyProfile={isMyProfile}
                    onOpenSheet={() => {
                      setSheetTab("experience");
                      setOpenSheet(true);
                    }}
                  />
                )}
              </div>
            </div>
            {/* Columna lateral - sticky en desktop, oculta en mobile */}
            <div className="hidden lg:flex flex-col gap-6 order-2">
              <div className="sticky top-24 space-y-6">
                <DoctorEducationSection 
                  isMyProfile={isMyProfile}
                  onOpenSheet={() => {
                      setSheetTab("education");
                      setOpenSheet(true);
                  }}
                  doctorId={profileDoctorId}
                />
                {user?.id && (
                  <DoctorExperienceSection 
                    doctorId={profileDoctorId}
                    isMyProfile={isMyProfile}
                    onOpenSheet={() => {
                      setSheetTab("experience");
                      setOpenSheet(true);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="h-8 lg:h-12" />
        {/* Sheet de perfil */}
        <MCSheetProfile 
          open={openSheet} 
          onOpenChange={(open) => {
            setOpenSheet(open);
            if (!open) {
              setSheetTab("general");
            }
          }}
          whatTab={sheetTab}
        />
      </div>
    </MCDashboardContent>
  );
}

export default DoctorProfilePage;
