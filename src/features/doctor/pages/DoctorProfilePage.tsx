import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import MCBackButton from "@/shared/components/forms/MCBackButton";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { useNavigate, useParams } from "react-router-dom";
import DoctorProfileBanner from "../components/DoctorProfileBanner";
import DoctorProfileBannerMobile from "../components/DoctorProfileBannerMobile";
import DoctorEducationSection from "../components/DoctorEducationSection";
import DoctorExperienceSection from "../components/DoctorExperienceSection";
import DoctorInsurancesSection from "../components/DoctorInsurancesSection";
import DoctorAboutSection from "../components/DoctorAboutSection";
import DoctorServicesSection from "../components/DoctorServicesSection";
function DoctorProfilePage() {
  const { doctorId } = useParams();
  const { t } = useTranslation("doctor");
  const [openSheet, setOpenSheet] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const user = useAppStore((state) => state.user);

  // Mock data - en producción esto vendría de una API
  const doctor = {
    name: "Alexander Gil",
    avatar: "",
    banner: "",
    specialty: "Cardiología",
    rating: 4.8,
    yearsOfExperience: 15,
    languages: ["es", "en", "fr"],
    isFavorite: false,
    about:
      "Alexander integra toda la familia, enfocándose en prevenir, diagnosticar y tratar enfermedades comunes. Nuestro médico de familia acompaña a cada paciente en todas las etapas de su vida, considerando su bienestar físico, emocional y social.",
    education: [
      {
        degree: "Medicina General",
        institution: "Universidad Nacional Autónoma de México",
        location: "Ciudad de México",
        year: "1995-2001",
      },
      {
        degree: "Especialidad en Cardiología",
        institution: "Hospital General de México",
        location: "Ciudad de México",
        year: "2002-2006",
      },
      {
        degree: "Fellowship en Enfermedades Autoinmunes",
        institution: "Mayo Clinic, USA",
        location: "Rochester, Minnesota",
        year: "2007-2018",
      },
    ],
    experience: [
      {
        position: "Médico Internista Senior",
        institution: "Hospital ABC",
        period: "2015 - Presente",
        description: "Atención de pacientes hospitalizados y consulta externa",
      },
      {
        position: "Fellow en Enfermedades Autoinmunes",
        institution: "Mayo Clinic",
        period: "2012 - 2018",
        description:
          "Especialización en enfermedades autoinmunes y manejo avanzado",
      },
      {
        position: "Médico Residente",
        institution: "Hospital General de México",
        period: "2011 - 2015",
        description: "Residencia en medicina interna",
      },
      {
        position: "Médico Pasante",
        institution: "Centro de Salud Valencia",
        period: "2010 - 2011",
        description: "Servicio social y consulta en medicina general",
      },
    ],
    insurances: [
      "Seguros Atlas",
      "AXA Palic",
      "ARS Palic",
      "Seguros Atlas",
      "Humano Seguros",
      "MAPFRE ARS",
      "ARS Universal",
      "Seguros Crecer",
      "ARS Yunen",
    ],
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

  const isMyProfile = user?.id === doctorId;

  return (
    <div
      className={`w-full ${isMobile ? "flex flex-col" : "grid grid-cols-[5%_95%]"} justify-between items-start `}
    >
      {!isMobile && (
        <aside>
          <MCBackButton variant="background" onClick={() => navigate(-1)} />
        </aside>
      )}

      <motion.main
        {...fadeInUp}
        className="w-full flex flex-col justify-center items-center gap-6"
      >
        {isMobile && (
          <div className="w-full px-2 py-3">
            <MCBackButton variant="background" onClick={() => navigate(-1)} />
          </div>
        )}

        {isMobile ? (
          <DoctorProfileBannerMobile
            doctor={doctor}
            setOpenSheet={setOpenSheet}
            isMyProfile={isMyProfile}
            // onSendMessage, onToggleFavorite, etc.
          />
        ) : (
          <DoctorProfileBanner
            doctor={doctor}
            setOpenSheet={setOpenSheet}
            isMyProfile={isMyProfile}
            // onSendMessage, onToggleFavorite, etc.
          />
        )}
        <div className={isMobile ? "w-full px-2" : "w-[90%]"}>
          <div
            className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-[7fr_3fr]"} gap-4  w-full`}
          >
            <div className="flex flex-col gap-6">
              <DoctorAboutSection doctor={doctor} />
              <DoctorInsurancesSection insurances={doctor.insurances} />
              <DoctorServicesSection services={services} />
            </div>
            <div
              className={`flex flex-col gap-6 ${!isMobile ? "sticky top-29.5 h-fit" : ""}`}
            >
              <DoctorEducationSection education={doctor.education} />
              <DoctorExperienceSection experience={doctor.experience} />
            </div>
          </div>
        </div>

        <MCSheetProfile open={openSheet} onOpenChange={setOpenSheet} />
      </motion.main>
    </div>
  );
}

export default DoctorProfilePage;
