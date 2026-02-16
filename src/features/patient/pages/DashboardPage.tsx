import { useTranslation } from "react-i18next";
import { Card } from "@/shared/ui/card";
import { AppointmentsCalendar } from "@/shared/components/calendar/AppointmentsCalendar";
import DoctorSearchBar from "../components/DoctorSearchBar";
import MyInsurance from "../components/dashboard/MyInsurance";
import { DoctorCarousel } from "../components/dashboard/DoctorCarousel";
import MedicalInfoCard from "../components/dashboard/MedicalInfoCard";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { useState, useEffect, useCallback } from "react";
import { useAppStore } from "@/stores/useAppStore";
import { calculatePatientBMI, getPatientAge, getPatientBloodType, getPatientWeight, getPatientHeight } from "@/services/auth/auth.types";
import { patientService } from "@/shared/navigation/userMenu/editProfile/patient/services/patient.service";
import type { CondicionMedica } from "@/shared/navigation/userMenu/editProfile/patient/services/patient.types";
import { onAllergiesChanged, onConditionsChanged } from "@/lib/events/clinicalHistoryEvents";

const mockDoctors = [
  {
    id: 1,
    name: "Eduardo Segura",
    specialty: "Cardiólogo",
    rating: 4.8,
    yearsOfExperience: 15,
    languages: ["Español", "Inglés"],
    insuranceAccepted: ["Seguros Monterrey", "GNP", "MetLife"],
    isFavorite: true,
    urlImage:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop&crop=face",
    lastAppointment: "10/10/2025",
  },
  {
    id: 2,
    name: "Jorge Tapia",
    specialty: "Cardiólogo",
    rating: 4.4,
    yearsOfExperience: 12,
    languages: ["Español", "Inglés", "Francés"],
    insuranceAccepted: ["AXA", "Seguros Monterrey"],
    isFavorite: true,
    urlImage:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=300&fit=crop&crop=face",
    lastAppointment: "10/10/2025",
  },
  {
    id: 3,
    name: "Eladio Tavarez",
    specialty: "Cardiólogo",
    rating: 4.8,
    yearsOfExperience: 20,
    languages: ["Español"],
    insuranceAccepted: ["GNP", "Banorte"],
    isFavorite: true,
    urlImage:
      "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop&crop=face",
    lastAppointment: "10/10/2025",
  },
  {
    id: 4,
    name: "Anni Yuen",
    specialty: "Cardiólogo",
    rating: 4.8,
    yearsOfExperience: 8,
    languages: ["Español", "Inglés", "Mandarín"],
    insuranceAccepted: ["MetLife", "Seguros Monterrey"],
    isFavorite: true,
    urlImage:
      "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=300&fit=crop&crop=face",
    lastAppointment: "10/10/2025",
  },
  {
    id: 5,
    name: "María González",
    specialty: "Pediatra",
    rating: 4.9,
    yearsOfExperience: 10,
    languages: ["Español", "Portugués"],
    insuranceAccepted: ["AXA", "GNP"],
    isFavorite: false,
    urlImage:
      "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=300&fit=crop&crop=face",
    lastAppointment: "05/09/2025",
  },
  {
    id: 6,
    name: "Carlos Mendez",
    specialty: "Dermatólogo",
    rating: 4.7,
    yearsOfExperience: 18,
    languages: ["Español", "Inglés"],
    insuranceAccepted: ["Seguros Monterrey", "Banorte", "GNP"],
    isFavorite: false,
    urlImage:
      "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=300&fit=crop&crop=face",
    lastAppointment: "22/08/2025",
  },
];

function DashboardPage() {
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation("patient");
  const user = useAppStore((state) => state.user);
  
  // Estados para alergias y condiciones médicas
  const [myAllergies, setMyAllergies] = useState<CondicionMedica[]>([]);
  const [myConditions, setMyConditions] = useState<CondicionMedica[]>([]);
  const [isLoadingAllergies, setIsLoadingAllergies] = useState(true);
  const [isLoadingConditions, setIsLoadingConditions] = useState(true);
  
  // Cargar alergias del usuario
  const loadAllergies = useCallback(async () => {
    try {
      setIsLoadingAllergies(true);
      const response = await patientService.getMyAllergies(i18n.language);
      
      if (response.success) {
        setMyAllergies(response.data);
      }
    } catch (error) {
      console.error("❌ Error al cargar alergias:", error);
    } finally {
      setIsLoadingAllergies(false);
    }
  }, [i18n.language]);
  
  // Cargar condiciones médicas del usuario
  const loadConditions = useCallback(async () => {
    try {
      setIsLoadingConditions(true);
      const response = await patientService.getMyConditions(i18n.language);
      
      if (response.success) {
        setMyConditions(response.data);
      }
    } catch (error) {
      console.error("❌ Error al cargar condiciones médicas:", error);
    } finally {
      setIsLoadingConditions(false);
    }
  }, [i18n.language]);
  
  // Cargar alergias del usuario
  useEffect(() => {
    loadAllergies();
  }, [loadAllergies]);
  
  // Cargar condiciones médicas del usuario
  useEffect(() => {
    loadConditions();
  }, [loadConditions]);
  
  // Escuchar evento global de cambios en alergias
  useEffect(() => {
    const unsubscribe = onAllergiesChanged(() => {
      loadAllergies();
    });
    
    return unsubscribe;
  }, [loadAllergies]);
  
  // Escuchar evento global de cambios en condiciones médicas
  useEffect(() => {
    const unsubscribe = onConditionsChanged(() => {
      loadConditions();
    });
    
    return unsubscribe;
  }, [loadConditions]);
  
  // Calcular datos del paciente
  const patientAge = getPatientAge(user?.paciente || null);
  const IMC = calculatePatientBMI(user?.paciente || null);
  const bloodType = getPatientBloodType(user?.paciente || null);
  const weight = getPatientWeight(user?.paciente || null);
  const height = getPatientHeight(user?.paciente || null);

  return (
    <motion.main {...fadeInUp} className="min-h-screen">
      <div className="mx-auto space-y-4">
        {/* BUSCADOR SUPERIOR */}
        <div className="rounded-2xl md:rounded-4xl p-6 md:p-12 w-full flex flex-col items-center bg-accent-foreground">
          <h1 className="text-xl md:text-4xl font-semibold text-background dark:text-primary mb-3 md:mb-4 text-center">
            {t("dashboard.searchTitle")}
          </h1>
          <div className="w-full">
            <DoctorSearchBar />
          </div>
        </div>

        <div className="w-full flex flex-col justify-center items-center gap-4">
          {/* FILA 1: CALENDARIO + SEGUROS */}
          <div className="grid grid-cols-1 lg:grid-cols-[69.5%_29.5%] gap-4 w-full">
            {/* Calendario + citas */}
            <Card className="rounded-2xl md:rounded-4xl  min-h-0">
              <AppointmentsCalendar />
            </Card>

            {/* Mis seguros */}
            <Card className="rounded-2xl md:rounded-4xl">
              <MyInsurance />
            </Card>
          </div>

          {/* FILA 2: DOCTORES + INFORMACIÓN MÉDICA */}
          <div className="grid grid-cols-1 lg:grid-cols-[69.5%_29.5%] gap-4 w-full">
            {/* Carrusel de doctores */}
            <Card className="rounded-2xl md:rounded-4xl">
              <DoctorCarousel doctors={mockDoctors} />
            </Card>

            {/* Información médica */}
            <MedicalInfoCard
              isMobile={isMobile}
              age={patientAge !== null ? `${patientAge} ${t("profileForm.years")}` : t("profileForm.agePlaceholder")}
              bmi={IMC !== null ? `${IMC.toFixed(1)}` : t("profileForm.pending")}
              height={height !== null ? `${height} cm` : t("profileForm.heightPlaceholder") + " cm"}
              weight={weight !== null ? `${weight} kg` : t("profileForm.weightPlaceholder") + " kg"}
              bloodType={bloodType || t("profileForm.bloodTypePlaceholder")}
              allergies={myAllergies.map((allergy) => allergy.nombre)}
              conditions={myConditions.map((condition) => condition.nombre)}
              isLoadingAllergies={isLoadingAllergies}
              isLoadingConditions={isLoadingConditions}
            />
          </div>
        </div>
      </div>
    </motion.main>
  );
}

export default DashboardPage;
