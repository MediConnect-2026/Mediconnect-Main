import { useState } from "react";
import { useTranslation } from "react-i18next";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import { useAppStore } from "@/stores/useAppStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useParams } from "react-router-dom";
import DoctorProfileBanner from "../components/profile/DoctorProfileBanner";
import DoctorProfileBannerMobile from "../components/profile/DoctorProfileBannerMobile";
import DoctorEducationSection from "../components/profile/DoctorEducationSection";
import DoctorExperienceSection from "../components/profile/DoctorExperienceSection";
import DoctorInsurancesSection from "../components/profile/DoctorInsurancesSection";
import DoctorAboutSection from "../components/profile/DoctorAboutSection";
import DoctorServicesSection from "../components/profile/DoctorServicesSection";
import DoctorCentersSection from "../components/profile/DoctorCentersSection";
import MCDashboardContent from "@/shared/layout/MCDashboardContent"; // <-- importa tu layout

function DoctorProfilePage() {
  const { doctorId } = useParams();
  const { t } = useTranslation("doctor");
  const [openSheet, setOpenSheet] = useState(false);
  const isMobile = useIsMobile();
  const user = useAppStore((state) => state.user); 
  const [sheetTab, setSheetTab] = useState<"general" | "education" | "insurance" | "experience" | "language">("general");

  console.log("Doctor from store:", user);
  
  // Mock data - en producción esto vendría de una API
  const doctor = {
    name: "LeBron James",
    avatar: "",
    banner: "",
    specialty: "Cardiología",
    rating: 4.8,
    yearsOfExperience: 15,
    languages: ["es", "en", "fr"],
    isFavorite: false,
    about:
      "LeBron James integra toda la familia, enfocándose en prevenir, diagnosticar y tratar enfermedades comunes. Nuestro médico de familia acompaña a cada paciente en todas las etapas de su vida, considerando su bienestar físico, emocional y social.",
  };

  const services = [
    {
      id: "1",
      title: "Laboratorios clínicos",
      description:
        "Evaluación médica completa con laboratorios ambulatorios realizados por laboratoristas profesionales y con las autorizaciones correspondientes.",
      duration: "1 hora",
      price: "RD$800",
      type: "presencial" as const,
      image:
        "https://i.pinimg.com/736x/26/96/86/2696865c46c902b5a2a0cdd58b98ba95.jpg",
      rating: 4.7,
      reviews: 12,
      status: "active",
    },
    {
      id: "2",
      title: "Consulta virtual",
      description:
        "Consulta médica por videollamada para seguimiento y evaluación de síntomas.",
      duration: "30 min",
      price: "RD$1,200",
      type: "virtual" as const,
      image:
        "https://i.pinimg.com/736x/5a/be/8f/5abe8ff7a562514b3a552a78369e0ed7.jpg",
      rating: 4.9,
      reviews: 20,
      status: "active",
    },
    {
      id: "3",
      title: "Chequeo general anual",
      description:
        "Evaluación médica completa anual para monitorear la salud general y prevenir enfermedades.",
      duration: "1 hora",
      price: "RD$2,500",
      type: "presencial" as const,
      image:
        "https://i.pinimg.com/736x/2d/79/92/2d799226aaefb127794b72128c3889cd.jpg",
      rating: 4.8,
      reviews: 15,
      status: "active",
    },
    {
      id: "4",
      title: "Consulta de seguimiento",
      description:
        "Consulta médica para seguimiento de condiciones crónicas o tratamiento en curso.",
      duration: "30 min",
      price: "RD$1,000",
      type: "mixta" as const,
      image:
        "https://i.pinimg.com/736x/16/51/d6/1651d6e629be1f7033e364dda83a83cd.jpg",
      rating: 4.6,
      reviews: 8,
      status: "inactive",
    },
  ];

  const centers = [
    {
      id: "1",
      name: "Hospital Dario Contreras",
      type: "Hospital General",
      rating: 4.8,
      reviewCount: 12,
      phone: "809-093-2342",
      urlImage:
        "https://i.pinimg.com/736x/2d/79/92/2d799226aaefb127794b72128c3889cd.jpg",
      isConnected: true,
      description:
        "Centro hospitalario de referencia nacional con atención 24/7.",
    },
    {
      id: "2",
      name: "Centro Médico Integral",
      type: "Clínica",
      rating: 4.6,
      reviewCount: 8,
      phone: "809-555-1234",
      urlImage:
        "https://i.pinimg.com/736x/5a/be/8f/5abe8ff7a562514b3a552a78369e0ed7.jpg",
      isConnected: false,
    },
    {
      id: "3",
      name: "Clínica Familiar",
      type: "Centro de Salud",
      rating: 4.7,
      reviewCount: 10,
      phone: "809-222-5678",
      urlImage:
        "https://i.pinimg.com/736x/26/96/86/2696865c46c902b5a2a0cdd58b98ba95.jpg",
      isConnected: false,
      description: "Atención primaria y familiar para toda la comunidad.",
    },
  ];

  const isMyProfile = user?.id === (doctorId ? Number(doctorId) : undefined);

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full">
        {/* Banner del doctor */}
        <div className="w-full">
          {isMobile ? (
            <DoctorProfileBannerMobile
              doctor={user}
              setOpenSheet={setOpenSheet}
              isMyProfile={isMyProfile}
            />
          ) : (
            <DoctorProfileBanner
              doctor={user}
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
                doctor={user?.doctor || doctor} 
                isMyProfile={isMyProfile}
                onOpenSheet={() => {
                  setSheetTab("general");
                  setOpenSheet(true);
                }}
              />
              <DoctorInsurancesSection
                isMyProfile={isMyProfile}
                onOpenSheet={() => setOpenSheet(true)}
              />
              <DoctorServicesSection services={services} />
              <DoctorCentersSection centers={centers} />
              {/* Educación y Experiencia - solo en mobile */}
              <div className="flex flex-col gap-4 lg:hidden">
                <DoctorEducationSection 
                  isMyProfile={isMyProfile}
                  onOpenSheet={() => setOpenSheet(true)}
                />
                {user?.id && (
                  <DoctorExperienceSection 
                    doctorId={user.id}
                    isMyProfile={isMyProfile}
                    onOpenSheet={() => setOpenSheet(true)}
                  />
                )}
              </div>
            </div>
            {/* Columna lateral - sticky en desktop, oculta en mobile */}
            <div className="hidden lg:flex flex-col gap-6 order-2">
              <div className="sticky top-24 space-y-6">
                <DoctorEducationSection 
                  isMyProfile={isMyProfile}
                  onOpenSheet={() => setOpenSheet(true)}
                />
                {user?.id && (
                  <DoctorExperienceSection 
                    doctorId={user.id}
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
