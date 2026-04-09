import { useState, useEffect, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import MCDoctorsCards from "@/shared/components/MCDoctorsCards";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import PatientProfileBannerMobile from "@/features/patient/components/PatientProfileBannerMobile";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import PatientProfileBanner from "../components/PatientProfileBanner";
import FilterMyDoctors from "../components/filters/FilterMyDoctors";
import MedicalInfoCard from "@/features/patient/components/dashboard/MedicalInfoCard";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import { Filter, Loader2 } from "lucide-react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import { calculatePatientBMI, getPatientAge, getPatientBloodType, getPatientWeight, getPatientHeight } from "@/services/auth/auth.types";
import { patientService } from "@/shared/navigation/userMenu/editProfile/patient/services/patient.service";
import type { Seguro, CondicionMedica } from "@/shared/navigation/userMenu/editProfile/patient/services/patient.types";
import { onInsuranceChanged, emitInsuranceChanged } from "@/lib/events/insuranceEvents";
import { onAllergiesChanged, onConditionsChanged, emitClinicalHistoryChanged } from "@/lib/events/clinicalHistoryEvents";
import { useMyDoctors } from "@/lib/hooks/useMyDoctors";


// Interfaz para los filtros de doctores
interface DoctorFilters {
  specialty: string;
  languages: string[];
  acceptingInsurance: string[];
  yearsOfExperience: number | null;
  rating: number | null;
  isFavorite: boolean | null;
}

// Interfaz para los doctores
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  yearsOfExperience?: number;
  languages?: string[];
  insuranceAccepted?: string[];
  insuranceAcceptedIds?: number[];
  isFavorite?: boolean;
  urlImage?: string;
  lastAppointment?: string;
}

function PatientProfilePage() {
  const [openSheet, setOpenSheet] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [sheetTab, setSheetTab] = useState<"general" | "history" | "insurance">("general");
  const { t, i18n } = useTranslation("patient");
  
  // Estados para seguros médicos
  const [myInsurances, setMyInsurances] = useState<Seguro[]>([]);
  const [isLoadingInsurances, setIsLoadingInsurances] = useState(true);
  
  // Estados para alergias y condiciones médicas
  const [myAllergies, setMyAllergies] = useState<CondicionMedica[]>([]);
  const [myConditions, setMyConditions] = useState<CondicionMedica[]>([]);
  const [isLoadingAllergies, setIsLoadingAllergies] = useState(true);
  const [isLoadingConditions, setIsLoadingConditions] = useState(true);

  const [doctorFilters, setDoctorFilters] = useState<DoctorFilters>({
    specialty: "",
    languages: [],
    acceptingInsurance: [],
    yearsOfExperience: null,
    rating: null,
    isFavorite: null,
  });

  const user = useAppStore((state) => state.user);
  const isMobile = useIsMobile();
  
  // Fetch doctors from API
  const { data: doctorsData, isLoading: isLoadingDoctors } = useMyDoctors({
    target: i18n.language,
    source: 'es',
    translate_fields: 'especialidadPrincipal.nombre',
  });
  
  // Transform API data to the format expected by MCDoctorCard
  const transformedDoctors = useMemo(() => {
    if (!doctorsData?.data) return [];
    
    return doctorsData.data.map((doctor) => ({
      id: Number(doctor.id),
      name: `${doctor.nombre} ${doctor.apellido}`,
      specialty: doctor.especialidadPrincipal?.nombre || t("myDoctors.noSpecialty", "Sin especialidad"),
      rating: doctor.calificacionPromedio || 0,
      yearsOfExperience: doctor.anosExperiencia || 0,
      languages: doctor.idiomas?.map(idioma => idioma.nombre.toLowerCase().substring(0, 2)) || [],
      insuranceAccepted: doctor.segurosAceptados?.map(seguro => seguro.nombre?.toLowerCase() || '') || [],
      insuranceAcceptedIds: doctor.segurosAceptados?.map(seguro => seguro.id).filter((id): id is number => id !== null) || [],
      isFavorite: doctor.esFavorito || false,
      urlImage: doctor.fotoPerfil || "",
      lastAppointment: doctor.ultimaCita?.fecha,
    }));
  }, [doctorsData, t]);
  
  // Estado local para los doctores (para manejar favoritos localmente)
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  
  // Actualiza doctorList cuando cambian los datos transformados
  useEffect(() => {
    setDoctorList(transformedDoctors);
  }, [transformedDoctors]);
  
  // ✅ Funciones de carga memoizadas con useCallback para evitar re-renders innecesarios
  // y garantizar que siempre usen el idioma correcto
  const loadInsurances = useCallback(async () => {
    try {
      setIsLoadingInsurances(true);
      const response = await patientService.getMyInsurances(i18n.language);
      
      if (response.success) {
        // Transformar la estructura anidada de la API a objetos Seguro
        const transformedInsurances: Seguro[] = response.data.map(item => ({
          id: item.seguro.id,
          nombre: item.seguro.nombre,
          descripcion: item.seguro.descripcion,
          idTipoSeguro: item.tipoSeguro.id,
          tipoSeguro: item.tipoSeguro,
        }));
        
        setMyInsurances(transformedInsurances);
      }
    } catch (error) {
      console.error("❌ Error al cargar seguros:", error);
    } finally {
      setIsLoadingInsurances(false);
    }
  }, [i18n.language]);
  
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
  
  // ✅ EFECTO 1: Carga inicial de todos los datos médicos
  // Se ejecuta solo al montar el componente y cuando cambian las funciones de carga (que dependen del idioma)
  useEffect(() => {
    const loadAllMedicalData = async () => {
      // Carga paralela para mejor performance
      await Promise.all([
        loadInsurances(),
        loadAllergies(),
        loadConditions(),
      ]);
    };
    
    loadAllMedicalData();
  }, [loadInsurances, loadAllergies, loadConditions]);
  
  // ✅ EFECTO 2: Suscripción a eventos globales de cambios
  // Consolida todos los event listeners en un solo useEffect
  useEffect(() => {
    const unsubscribeInsurance = onInsuranceChanged(loadInsurances);
    const unsubscribeAllergies = onAllergiesChanged(loadAllergies);
    const unsubscribeConditions = onConditionsChanged(loadConditions);
    
    // Cleanup: desuscribirse de todos los eventos al desmontar
    return () => {
      unsubscribeInsurance();
      unsubscribeAllergies();
      unsubscribeConditions();
    };
  }, [loadInsurances, loadAllergies, loadConditions]);
  
  // Callbacks para cambios locales (desde el Sheet)
  const handleInsurancesChanged = useCallback(() => {
    loadInsurances();
    emitInsuranceChanged();
  }, [loadInsurances]);
  
  const handleClinicalHistoryChanged = useCallback(() => {
    loadAllergies();
    loadConditions();
    emitClinicalHistoryChanged();
  }, [loadAllergies, loadConditions]);
  
  // Calcular la edad del paciente
  const patientAge = getPatientAge(user?.paciente || null);
  const IMC = calculatePatientBMI(user?.paciente || null);
  const bloodType = getPatientBloodType(user?.paciente || null);
  const weight = getPatientWeight(user?.paciente || null);
  const height = getPatientHeight(user?.paciente || null);
  
  const updateDoctorFilters = (newFilters: Partial<DoctorFilters>) => {
    setDoctorFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetDoctorFilters = () => {
    setDoctorFilters({
      specialty: "",
      languages: [],
      acceptingInsurance: [],
      yearsOfExperience: null,
      rating: null,
      isFavorite: null,
    });
    setSearchName("");
  };
  
  // Función para hacer toggle de favorito
  const handleToggleFavorite = (doctorId: number) => {
    setDoctorList((prev) =>
      prev.map((doc) =>
        doc.id === doctorId ? { ...doc, isFavorite: !doc.isFavorite } : doc,
      ),
    );
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (doctorFilters.specialty) count++;
    if (doctorFilters.languages.length > 0) count++;
    if (doctorFilters.acceptingInsurance.length > 0) count++;
    if (doctorFilters.yearsOfExperience) count++;
    if (doctorFilters.rating && doctorFilters.rating > 0) count++;
    if (doctorFilters.isFavorite) count++;
    if (searchName) count++;
    return count;
  };

  const filteredDoctors = doctorList.filter((doctor) => {
    // Filtro por búsqueda (nombre o especialidad)
    if (searchName) {
      const q = searchName.toLowerCase();
      const nameMatch = doctor.name.toLowerCase().includes(q);
      const specialtyMatch = doctor.specialty?.toLowerCase().includes(q);
      if (!nameMatch && !specialtyMatch) return false;
    }
    
    // Filtro por especialidad
    if (
      doctorFilters.specialty &&
      doctor.specialty.toLowerCase() !== doctorFilters.specialty.toLowerCase()
    )
      return false;
    
    // Filtro por idiomas
    if (
      doctorFilters.languages.length &&
      !doctorFilters.languages.some((lang: any) =>
        doctor.languages?.includes(lang),
      )
    )
      return false;
    
    // Filtro por seguros — soporta nombres o IDs
    if (doctorFilters.acceptingInsurance.length) {
      const hasMatchingInsurance = doctorFilters.acceptingInsurance.some(
        (ins) => {
          // intentar tratar como ID numérico
          const id = Number(ins);
          if (!Number.isNaN(id) && doctor.insuranceAcceptedIds?.includes(id))
            return true;
          // fallback a comparar por nombre (case-insensitive)
          return doctor.insuranceAccepted?.some(
            (name) => name.toLowerCase() === ins.toLowerCase(),
          );
        },
      );

      if (!hasMatchingInsurance) return false;
    }
    
    // Filtro por años de experiencia
    if (
      doctorFilters.yearsOfExperience &&
      (doctor.yearsOfExperience ?? 0) < doctorFilters.yearsOfExperience
    )
      return false;
    
    // Filtro por rating
    if (doctorFilters.rating && doctor.rating < doctorFilters.rating)
      return false;
    
    // Filtro por favoritos
    if (doctorFilters.isFavorite === true && !doctor.isFavorite) return false;
    
    return true;
  });

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full flex flex-col gap-4">
        {/* Banner del paciente */}
        <div className="w-full">
          {isMobile ? (
            <PatientProfileBannerMobile
              user={user}
              setOpenSheet={(tab?: "general" | "history" | "insurance") => {
                setSheetTab(tab || "general");
                setOpenSheet(true);
              }}
            />
          ) : (
            <PatientProfileBanner 
              user={user} 
              setOpenSheet={(tab?: "general" | "history" | "insurance") => {
                setSheetTab(tab || "general");
                setOpenSheet(true);
              }}
            />
          )}
        </div>

        {/* Info de seguros y datos médicos */}
        <div className={isMobile ? "w-full px-2" : "w-full"}>
          <div
            className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-[6.5fr_3.5fr]"} gap-4 w-full`}
          >
            <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
              <CardContent className={isMobile ? "p-4" : "p-2"}>
                <h2
                  className={`mb-6 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
                >
                  {t("insurance.title")}
                </h2>
                {isLoadingInsurances ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : myInsurances.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-muted-foreground mb-4">
                      {t("insurance.addFirst", "Agrega tu primer seguro médico")}
                    </p>
                    <MCButton
                      variant="outline"
                      onClick={() => {
                        setSheetTab("insurance");
                        setOpenSheet(true);
                      }}
                      size="sm"
                    >
                      {t("insurance.add", "Agregar seguro")}
                    </MCButton>
                  </div>
                ) : (
                  <div
                    className={`grid ${isMobile ? "grid-cols-1" : "grid-cols-2"} gap-2`}
                  >
                    {myInsurances.map((insurance) => {
                      const tipoSeguroNombre = typeof insurance.tipoSeguro === 'object' && insurance.tipoSeguro !== null
                        ? insurance.tipoSeguro.nombre
                        : insurance.tipoSeguro;
                      
                      return (
                        <div
                          key={insurance.id}
                          className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/20 cursor-pointer"
                        >
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border-2 font-bold border-primary/10 text-foreground">
                            {insurance.nombre.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                              {insurance.nombre}
                            </span>
                            {tipoSeguroNombre && (
                              <span className="text-xs text-muted-foreground">
                                {tipoSeguroNombre}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

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

        {/* Doctores */}
        <Card
          className={`animate-fade-in rounded-4xl border-0 shadow-md bg-background ${isMobile ? "w-full" : "w-full"}`}
        >
          <CardHeader className={isMobile ? "p-4 pb-2" : "p-6 pb-4"}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2
                className={`${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
              >
                {t("navbar.doctors")}
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-auto flex-1 sm:flex-none">
                  <MCFilterInput
                    placeholder={t(
                      "filters.placeholders.name",
                      "Search by name",
                    )}
                    value={searchName}
                    onChange={setSearchName}
                  />
                </div>
                <MCFilterPopover
                  activeFiltersCount={getActiveFiltersCount()}
                  onClearFilters={resetDoctorFilters}
                >
                  <FilterMyDoctors
                    filters={doctorFilters}
                    onFiltersChange={updateDoctorFilters}
                  />
                </MCFilterPopover>
              </div>
            </div>
          </CardHeader>

          <CardContent className={isMobile ? "p-4 pt-2" : "p-6 pt-4"}>
            {isLoadingDoctors ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">
                  {t("myDoctors.loading", "Cargando doctores...")}
                </span>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <div className="flex flex-col items-center gap-2">
                    <span className="flex items-center gap-2 text-primary">
                      <Filter className="w-7 h-7" />
                      <EmptyTitle className="text-lg font-semibold">
                        {t("doctors.emptyTitle")}
                      </EmptyTitle>
                    </span>
                    <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
                      {t("doctors.emptyDescription")}
                    </EmptyDescription>
                  </div>
                </EmptyHeader>
                <EmptyContent>
                  {getActiveFiltersCount() > 0 && (
                    <MCButton
                      variant="outline"
                      onClick={resetDoctorFilters}
                      className="px-6 py-2"
                      size="sm"
                    >
                      {t("doctors.clearFilters")}
                    </MCButton>
                  )}
                </EmptyContent>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredDoctors.map((doctor) => (
                  <MCDoctorsCards
                    id={doctor.id}
                    key={doctor.id}
                    name={doctor.name}
                    specialty={doctor.specialty}
                    rating={doctor.rating}
                    yearsOfExperience={doctor.yearsOfExperience}
                    languages={doctor.languages}
                    insuranceAccepted={doctor.insuranceAccepted}
                    isFavorite={doctor.isFavorite}
                    urlImage={doctor.urlImage}
                    onToggleFavorite={() => handleToggleFavorite(doctor.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <MCSheetProfile 
          open={openSheet} 
          onOpenChange={(open) => {
            setOpenSheet(open);
            if (!open) {
              setSheetTab("general");
            }
          }} 
          whatTab={sheetTab}
          onInsurancesChanged={handleInsurancesChanged}
          onClinicalHistoryChanged={handleClinicalHistoryChanged}
        />
      </div>
    </MCDashboardContent>
  );
}

export default PatientProfilePage;
