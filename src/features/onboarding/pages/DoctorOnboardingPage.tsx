import { useEffect, useMemo } from "react";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/shared/ui/progress";
import OnboardingChecklist from "@/features/onboarding/components/OnboardingChecklist";
import AcademicDegreeUpload from "../../onboarding/components/doctors/AcademicDegreeUpload";
import GovernmentIdUpload from "../../onboarding/components/doctors/GovernmentIdUpload";
import ProfilePhotoUpload from "../../onboarding/components/doctors/ProfilePhotoUpload";
import AdditionalCertificationsUpload from "../../onboarding/components/doctors/AdditionalCertificationsUpload";
import PersonalIdentificationDialog from "@/features/onboarding/components/doctors/personalIdentificationStep/PersonalIdentificationDialog";

function DoctorOnboardingPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const verifyEmail = useAppStore((state) => state.verifyEmail);
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData
  );
  useEffect(() => {
    if (!verifyEmail.verified) {
      navigate("/auth/register", { replace: true });
      return;
    }

    if (!verifyEmail.email || verifyEmail.email === "") {
      navigate("/auth/reg-email-verification", { replace: true });
    }
  }, [verifyEmail.email, verifyEmail.verified, navigate]);

  const completionStates = useMemo(() => {
    const isPersonalInfoComplete =
      doctorOnboardingData?.name &&
      doctorOnboardingData?.lastName &&
      doctorOnboardingData?.gender &&
      doctorOnboardingData?.birthDate &&
      doctorOnboardingData?.nationality &&
      doctorOnboardingData?.phone &&
      doctorOnboardingData?.email &&
      doctorOnboardingData?.identityDocument &&
      doctorOnboardingData?.exequatur &&
      doctorOnboardingData?.mainSpecialty &&
      doctorOnboardingData?.secondarySpecialties;

    const isIdDocComplete = Boolean(
      doctorOnboardingData?.identityDocumentFile &&
        doctorOnboardingData.identityDocumentFile.length > 0
    );

    const isProfilePhotoComplete = Boolean(doctorOnboardingData?.urlImg);

    const isCertificationsComplete = Boolean(
      doctorOnboardingData?.certifications &&
        doctorOnboardingData.certifications.length > 0
    );

    const isAcademicTitleComplete = Boolean(
      doctorOnboardingData?.academicTitle
    );

    return {
      isPersonalInfoComplete: Boolean(isPersonalInfoComplete),
      isIdDocComplete: Boolean(isIdDocComplete),
      isProfilePhotoComplete,
      isCertificationsComplete,
      isAcademicTitleComplete,
    };
  }, [
    doctorOnboardingData?.name,
    doctorOnboardingData?.lastName,
    doctorOnboardingData?.gender,
    doctorOnboardingData?.birthDate,
    doctorOnboardingData?.nationality,
    doctorOnboardingData?.phone,
    doctorOnboardingData?.email,
    doctorOnboardingData?.identityDocument,
    doctorOnboardingData?.exequatur,
    doctorOnboardingData?.mainSpecialty,
    doctorOnboardingData?.secondarySpecialties,
    doctorOnboardingData?.identityDocumentFile,
    doctorOnboardingData?.urlImg,
    doctorOnboardingData?.certifications,
    doctorOnboardingData?.academicTitle,
  ]);

  const checklistItems = useMemo(() => {
    return [
      {
        id: "personal-info",
        title: t("doctorOnboarding.steps.personalInfo"),
        completed: completionStates.isPersonalInfoComplete,
        onClick: () => console.log("Información personal"),
        trigger: <PersonalIdentificationDialog />,
      },
      {
        id: "id-doc",
        title: t("doctorOnboarding.steps.idDoc"),
        completed: completionStates.isIdDocComplete,
        onClick: () => console.log("Documento"),
        trigger: <GovernmentIdUpload />,
      },
      {
        id: "profile-photo",
        title: t("doctorOnboarding.steps.profilePhoto"),
        optional: true,
        completed: completionStates.isProfilePhotoComplete,
        onClick: () => console.log("Foto"),
        trigger: <ProfilePhotoUpload />,
      },
      {
        id: "certs",
        title: t("doctorOnboarding.steps.certs"),
        optional: true,
        completed: completionStates.isCertificationsComplete,
        onClick: () => console.log("Certificaciones"),
        trigger: <AdditionalCertificationsUpload />,
      },
      {
        id: "degree",
        title: t("doctorOnboarding.steps.degree"),
        optional: true,
        completed: completionStates.isAcademicTitleComplete,
        onClick: () => console.log("Título"),
        trigger: <AcademicDegreeUpload />,
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
      title={t("doctorOnboarding.title")}
      titleAndSubtitleStart={true}
    >
      <div className="flex flex-col items-center w-full">
        <div className="mb-6 w-full space-y-2">
          <p className="text-base font-medium text-primary/80">
            {t("doctorOnboarding.subtitle")}
          </p>
          <div className="flex items-center space-x-2 text-sm text-primary/80 transition-all duration-300">
            <span className="font-semibold transition-all duration-300">
              {t("doctorOnboarding.requiredProgress", {
                completed: progressStats.completedRequiredItems,
                total: progressStats.requiredItemsCount,
              })}
            </span>
            <span className="mx-1 text-accent">•</span>
            <span className="transition-all duration-300">
              {t("doctorOnboarding.optionalProgress", {
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
            onClick: () => navigate("/auth/doctor-onboarding/password-setup"),
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

export default DoctorOnboardingPage;
