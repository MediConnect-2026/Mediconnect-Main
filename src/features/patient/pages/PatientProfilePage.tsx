import { useState, useEffect, useCallback } from "react";
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


// Interfaz para los filtros de doctores
interface DoctorFilters {
  specialty: string;
  languages: string[];
  acceptingInsurance: string[];
  yearsOfExperience: number | null;
  rating: number | null;
  isFavorite: boolean | null;
}

const doctorsList = [
  {
    name: "Cristiano Ronaldo",
    specialty: "cardiology",
    rating: 4.8,
    yearsOfExperience: 15,
    languages: ["es", "en", "fr"],
    insuranceAccepted: ["senasa", "universal", "humano"],
    isFavorite: false,
    urlImage: "",
  },
  {
    name: "María López",
    specialty: "Dermatóloga",
    rating: 4.9,
    yearsOfExperience: 10,
    languages: ["es", "en"],
    insuranceAccepted: ["palic", "humano"],
    isFavorite: true,
    urlImage: "",
  },
  {
    name: "Carlos Méndez",
    specialty: "Pediatra",
    rating: 4.7,
    yearsOfExperience: 8,
    languages: ["es"],
    insuranceAccepted: ["universal"],
    isFavorite: true,
    urlImage: "",
  },
  {
    name: "Sofía Ramírez",
    specialty: "Endocrinóloga",
    rating: 4.6,
    yearsOfExperience: 12,
    languages: ["es", "fr"],
    insuranceAccepted: ["senasa", "mapfre", "yunen"],
    isFavorite: true,
    urlImage: "",
  },
];

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
  
  // Definir loadInsurances con useCallback primero
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
  
  // Cargar seguros del usuario
  useEffect(() => {
    loadInsurances();
  }, [loadInsurances]);
  
  // Cargar alergias del usuario
  useEffect(() => {
    loadAllergies();
  }, [loadAllergies]);
  
  // Cargar condiciones médicas del usuario
  useEffect(() => {
    loadConditions();
  }, [loadConditions]);
  
  // Escuchar evento global de cambios en seguros (desde otros componentes como MCUserMenu)
  useEffect(() => {
    const unsubscribe = onInsuranceChanged(() => {
      loadInsurances();
    });
    
    return unsubscribe;
  }, [loadInsurances]);
  
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
  
  // Callback para cuando se modifiquen los seguros en el Sheet local
  const handleInsurancesChanged = useCallback(() => {
    loadInsurances();
    // Emitir evento para notificar a otros componentes
    emitInsuranceChanged();
  }, [loadInsurances]);
  
  // Callback para cuando se modifiquen alergias o condiciones médicas en el Sheet local
  const handleClinicalHistoryChanged = useCallback(() => {
    loadAllergies();
    loadConditions();
    // Emitir evento para notificar a otros componentes
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

  const filteredDoctors = doctorsList.filter((doctor) => {
    if (
      searchName &&
      !doctor.name.toLowerCase().includes(searchName.toLowerCase())
    )
      return false;
    if (
      doctorFilters.specialty &&
      doctor.specialty.toLowerCase() !== doctorFilters.specialty.toLowerCase()
    )
      return false;
    if (
      doctorFilters.languages.length &&
      !doctorFilters.languages.some((lang: any) =>
        doctor.languages.includes(lang),
      )
    )
      return false;
    if (
      doctorFilters.acceptingInsurance.length &&
      !doctorFilters.acceptingInsurance.some((ins) =>
        doctor.insuranceAccepted.includes(ins),
      )
    )
      return false;
    if (
      doctorFilters.yearsOfExperience &&
      doctor.yearsOfExperience < doctorFilters.yearsOfExperience
    )
      return false;
    if (doctorFilters.rating && doctor.rating < doctorFilters.rating)
      return false;
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
            {filteredDoctors.length === 0 ? (
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
                {filteredDoctors.map((doctor, idx) => (
                  <MCDoctorsCards
                    id={idx}
                    key={idx}
                    name={doctor.name}
                    specialty={doctor.specialty}
                    rating={doctor.rating}
                    yearsOfExperience={doctor.yearsOfExperience}
                    languages={doctor.languages}
                    insuranceAccepted={doctor.insuranceAccepted}
                    isFavorite={doctor.isFavorite}
                    urlImage={doctor.urlImage}
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
