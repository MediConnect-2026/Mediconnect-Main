import { useMemo } from "react";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import AuthContentContainer from "@/features/auth/components/AuthContentContainer";
import MCInput from "@/shared/components/forms/MCInput";
import { useAppStore } from "@/stores/useAppStore";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/shared/ui/progress";
import { ArrowRight } from "lucide-react";
import OnboardingChecklist from "@/features/auth/components/OnboardingChecklist";
import AcademicDegreeUpload from "../../components/doctors/AcademicDegreeUpload";
import GovernmentIdUpload from "../../components/doctors/GovernmentIdUpload";
import ProfilePhotoUpload from "../../components/doctors/ProfilePhotoUpload";
import AdditionalCertificationsUpload from "../../components/doctors/AdditionalCertificationsUpload";

function DoctorOnboardingPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();

  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData
  );

  const checklistItems = useMemo(() => {
    const isPersonalInfoComplete =
      doctorOnboardingData?.name &&
      doctorOnboardingData?.lastName &&
      doctorOnboardingData?.gender &&
      doctorOnboardingData?.birthDate &&
      doctorOnboardingData?.nationality &&
      doctorOnboardingData?.phone &&
      doctorOnboardingData?.email;

    const isIdDocComplete =
      doctorOnboardingData?.identityDocument &&
      doctorOnboardingData?.identityDocumentFile;

    const isProfilePhotoComplete = Boolean(doctorOnboardingData?.urlImg);

    const isCertificationsComplete = Boolean(
      doctorOnboardingData?.certifications?.length
    );

    const isAcademicTitleComplete = Boolean(
      doctorOnboardingData?.academicTitle
    );

    return [
      {
        id: "personal-info",
        title: "Información personal",
        completed: Boolean(isPersonalInfoComplete),
        onClick: () => console.log("Personal Info"),
      },
      {
        id: "id-doc",
        title: "Documento de identificación",
        completed: Boolean(isIdDocComplete),
        onClick: () => console.log("Documento"),
        trigger: <GovernmentIdUpload>Cargar documento</GovernmentIdUpload>,
      },
      {
        id: "profile-photo",
        title: "Foto de perfil",
        optional: true,
        completed: isProfilePhotoComplete,
        onClick: () => console.log("Foto"),
        trigger: <ProfilePhotoUpload>Cargar foto</ProfilePhotoUpload>,
      },
      {
        id: "certs",
        title: "Certificaciones adicionales",
        optional: true,
        completed: isCertificationsComplete,
        onClick: () => console.log("Certificaciones"),
        trigger: (
          <AdditionalCertificationsUpload>
            Cargar certificación
          </AdditionalCertificationsUpload>
        ),
      },
      {
        id: "degree",
        title: "Título académico",
        optional: true,
        completed: isAcademicTitleComplete,
        onClick: () => console.log("Título"),
        trigger: <AcademicDegreeUpload>Cargar título</AcademicDegreeUpload>,
      },
    ];
  }, [doctorOnboardingData]);

  // Calcular progreso
  const requiredItemsCount = checklistItems.filter(
    (item) => !item.optional
  ).length;
  const completedRequiredItems = checklistItems.filter(
    (item) => !item.optional && item.completed
  ).length;
  const completedOptionalItems = checklistItems.filter(
    (item) => item.optional && item.completed
  ).length;

  return (
    <AuthContentContainer
      title="Documentos y datos requeridos para registro de doctores en MediConnect"
      titleAndSubtitleStart={true}
    >
      <div className="flex flex-col items-center w-full ">
        <div className="mb-6 w-full space-y-2">
          <p className="text-base font-mediumt text-primary/80 ">
            Completa estos pasos y empieza a transformar la vida de tus
            pacientes.
          </p>

          <div className="flex items-center space-x-2 text-sm text-primary/80 ">
            <span>
              {completedRequiredItems} de {requiredItemsCount} requeridos
            </span>
            <span className="mx-1 text-accent">•</span>
            <span>{completedOptionalItems} opcionales completados</span>
          </div>
          <div className="pt-2">
            <Progress
              value={(completedRequiredItems / requiredItemsCount) * 100}
            />
          </div>
        </div>
        <OnboardingChecklist items={checklistItems} />
        <AuthFooterContainer></AuthFooterContainer>
      </div>
    </AuthContentContainer>
  );
}

export default DoctorOnboardingPage;
