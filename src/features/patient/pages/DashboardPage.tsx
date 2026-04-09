import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
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
import {
  calculatePatientBMI,
  getPatientAge,
  getPatientBloodType,
  getPatientWeight,
  getPatientHeight,
} from "@/services/auth/auth.types";
import { patientService } from "@/shared/navigation/userMenu/editProfile/patient/services/patient.service";
import type { CondicionMedica } from "@/shared/navigation/userMenu/editProfile/patient/services/patient.types";
import {
  onAllergiesChanged,
  onConditionsChanged,
} from "@/lib/events/clinicalHistoryEvents";
import { ROUTES } from "@/router/routes";

function DashboardPage() {
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation("patient");
  const user = useAppStore((state) => state.user);
  const navigate = useNavigate();

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

  // Handle doctor selection - navigate to doctor profile
  const handleDoctorSelect = useCallback(
    (doctorId: string) => {
      navigate(
        ROUTES.DOCTOR.DOCTOR_PROFILE_PUBLIC.replace(":doctorId", doctorId),
      );
    },
    [navigate],
  );

  // Handle insurance selection - trigger doctor search by insurance
  const handleInsuranceSelect = useCallback(
    (insuranceId: string, insuranceName: string) => {
      console.log("Insurance selected:", { insuranceId, insuranceName });
      // DoctorSearchBar will handle the search automatically
    },
    [],
  );

  return (
    <motion.main {...fadeInUp} className="min-h-screen">
      <div className="mx-auto space-y-4">
        {/* BUSCADOR SUPERIOR */}
        <div className="rounded-2xl md:rounded-4xl p-6 md:p-12 w-full flex flex-col items-center bg-accent-foreground">
          <h1 className="text-xl md:text-4xl font-semibold text-background dark:text-primary mb-3 md:mb-4 text-center">
            {t("dashboard.searchTitle")}
          </h1>
          <div className="w-full">
            <DoctorSearchBar
              onDoctorSelect={handleDoctorSelect}
              onInsuranceSelect={handleInsuranceSelect}
            />
          </div>
        </div>

        <div className="w-full flex flex-col justify-center items-center gap-4">
          {/* FILA 1: CALENDARIO + SEGUROS */}
          <div className="grid grid-cols-1 lg:grid-cols-[69.5%_29.5%] gap-4 w-full">
            {/* Calendario + citas */}
            <Card className="rounded-2xl md:rounded-4xl min-h-0 lg:h-[480px] flex flex-col">
              <AppointmentsCalendar />
            </Card>

            {/* Mis seguros */}
            <Card className="rounded-2xl md:rounded-4xl">
              <MyInsurance />
            </Card>
          </div>

          {/* FILA 2: DOCTORES + INFORMACIÓN MÉDICA */}
          <div className="grid grid-cols-1 lg:grid-cols-[69.5%_29.5%] gap-4 w-full">
            {/* Carrusel de doctores - Ahora carga desde la API */}
            <Card className="rounded-2xl md:rounded-4xl">
              <DoctorCarousel />
            </Card>

            {/* Información médica */}
            <MedicalInfoCard
              isMobile={isMobile}
              age={
                patientAge !== null
                  ? `${patientAge} ${t("profileForm.years")}`
                  : t("profileForm.agePlaceholder")
              }
              bmi={
                IMC !== null ? `${IMC.toFixed(1)}` : t("profileForm.pending")
              }
              height={
                height !== null
                  ? `${height} cm`
                  : t("profileForm.heightPlaceholder") + " cm"
              }
              weight={
                weight !== null
                  ? `${weight} kg`
                  : t("profileForm.weightPlaceholder") + " kg"
              }
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
