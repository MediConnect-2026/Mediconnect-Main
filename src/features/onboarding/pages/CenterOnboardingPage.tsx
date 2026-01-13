import { useEffect, useMemo } from "react";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/shared/ui/progress";
import OnboardingChecklist from "@/features/onboarding/components/OnboardingChecklist";
// Importa los componentes necesarios para cada paso
import CenterInfoStep from "@/features/onboarding/components/center/centerInfoStep/CenterInfoStep";
import HealthCertificateUpload from "@/features/onboarding/components/center/HealthCertificateUpload";
import ProfilePhotoUpload from "@/features/onboarding/components/center/ProfilePhotoUpload";

function CenterOnboardingPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const centerOnboardingData = useAppStore(
    (state) => state.centerOnboardingData
  );

  // Calcula el estado de cada paso
  const completionStates = useMemo(() => {
    const isCenterInfoComplete =
      centerOnboardingData?.name &&
      centerOnboardingData?.address &&
      centerOnboardingData?.phone &&
      centerOnboardingData?.email;

    const isHealthCertificateComplete = Boolean(
      centerOnboardingData?.healthCertificateFile
    );

    const isProfilePhotoComplete = Boolean(centerOnboardingData?.urlImg);

    return {
      isCenterInfoComplete: Boolean(isCenterInfoComplete),
      isHealthCertificateComplete: Boolean(isHealthCertificateComplete),
      isProfilePhotoComplete,
    };
  }, [
    centerOnboardingData?.name,
    centerOnboardingData?.address,
    centerOnboardingData?.phone,
    centerOnboardingData?.email,
    centerOnboardingData?.healthCertificateFile,
    centerOnboardingData?.urlImg,
  ]);

  // Define los pasos del checklist
  const checklistItems = useMemo(() => {
    return [
      {
        id: "center-info",
        title: t("centerOnboarding.steps.centerInfo"),
        completed: completionStates.isCenterInfoComplete,
        onClick: () => console.log("Información del centro"),
        trigger: <CenterInfoStep />,
      },
      {
        id: "health-certificate",
        title: t("centerOnboarding.steps.healthCertificate"),
        completed: completionStates.isHealthCertificateComplete,
        onClick: () => console.log("Certificado sanitario"),
        trigger: <HealthCertificateUpload />,
      },
      {
        id: "profile-photo",
        title: t("centerOnboarding.steps.profilePhoto"),
        optional: true,
        completed: completionStates.isProfilePhotoComplete,
        onClick: () => console.log("Foto de perfil"),
        trigger: <ProfilePhotoUpload />,
      },
    ];
  }, [completionStates, navigate, t]);

  // Calcular progreso
  const progressStats = useMemo(() => {
    const requiredItemsCount = checklistItems.filter(
      (item) => !item.optional
    ).length;

    const completedRequiredItems = checklistItems.filter(
      (item) => !item.optional && item.completed
    ).length;

    const completedOptionalItems = checklistItems.filter(
      (item) => item.optional && item.completed
    ).length;

    const progressPercentage =
      requiredItemsCount > 0
        ? (completedRequiredItems / requiredItemsCount) * 100
        : 0;

    return {
      requiredItemsCount,
      completedRequiredItems,
      completedOptionalItems,
      progressPercentage,
    };
  }, [checklistItems]);

  return (
    <AuthContentContainer
      title={t("centerOnboarding.title")}
      titleAndSubtitleStart={true}
    >
      <div className="flex flex-col items-center w-full">
        <div className="mb-6 w-full space-y-2">
          <p className="text-base font-medium text-primary/80">
            {t("centerOnboarding.subtitle")}
          </p>
          <div className="flex items-center space-x-2 text-sm text-primary/80 transition-all duration-300">
            <span className="font-semibold transition-all duration-300">
              {t("centerOnboarding.requiredProgress", {
                completed: progressStats.completedRequiredItems,
                total: progressStats.requiredItemsCount,
              })}
            </span>
            <span className="mx-1 text-accent">•</span>
            <span className="transition-all duration-300">
              {t("centerOnboarding.optionalProgress", {
                count: progressStats.completedOptionalItems,
              })}
            </span>
          </div>
          <div className="pt-2">
            <Progress
              value={progressStats.progressPercentage}
              className="h-3"
            />
          </div>
        </div>
        <OnboardingChecklist items={checklistItems} />
        <AuthFooterContainer
          continueButtonProps={{
            children: t("footer.continue"),
            onClick: () => navigate("/auth/center-onboarding/password-setup"),
            disabled:
              progressStats.completedRequiredItems <
              progressStats.requiredItemsCount,
          }}
          backButtonProps={{
            onClick: () => navigate("/auth/otp-verification"),
          }}
        />
      </div>
    </AuthContentContainer>
  );
}

export default CenterOnboardingPage;
