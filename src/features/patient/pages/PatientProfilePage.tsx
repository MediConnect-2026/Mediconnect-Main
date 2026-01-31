import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import MCBackButton from "@/shared/components/forms/MCBackButton";
import { AlertTriangle } from "lucide-react";
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
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { useNavigate } from "react-router-dom";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import { Filter } from "lucide-react";

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
    name: "Alexander Gil",
    specialty: "cardiology",
    rating: 4.8,
    yearsOfExperience: 15,
    languages: ["es", "en", "fr"],
    insuranceAccepted: ["senasa", "universal", "humano"],
    isFavorite: false,
    urlImage:
      "https://i.pinimg.com/736x/58/8b/f4/588bf4e2b04c192c96b297d7627b31e6.jpg",
  },
  {
    name: "María López",
    specialty: "Dermatóloga",
    rating: 4.9,
    yearsOfExperience: 10,
    languages: ["es", "en"],
    insuranceAccepted: ["palic", "humano"],
    isFavorite: true,
    urlImage:
      "https://i.pinimg.com/736x/22/1f/d5/221fd565c4175235f7ae93d2ba80c641.jpg",
  },
  {
    name: "Carlos Méndez",
    specialty: "Pediatra",
    rating: 4.7,
    yearsOfExperience: 8,
    languages: ["es"],
    insuranceAccepted: ["universal"],
    isFavorite: true,
    urlImage:
      "https://i.pinimg.com/736x/b5/09/6b/b5096bf449df00f2f3fc52d8a4de5c70.jpg",
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
  const { t } = useTranslation("patient");

  // Estados locales para filtros de doctores con useState
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

  const insuranceLogos = [
    { name: t("filters.insurances.senasa") },
    { name: t("filters.insurances.palic") },
    { name: t("filters.insurances.humano") },
    { name: t("filters.insurances.mapfre") },
    { name: t("filters.insurances.universal") },
    { name: t("filters.insurances.crecer") },
    { name: t("filters.insurances.yunen") },
  ];

  const navigate = useNavigate();

  // Función para actualizar filtros
  const updateDoctorFilters = (newFilters: Partial<DoctorFilters>) => {
    setDoctorFilters((prev) => ({ ...prev, ...newFilters }));
  };

  // Función para resetear filtros
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

  // Función para contar filtros activos
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

  // Filtrado de doctores usando doctorFilters y searchName
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
        className="w-full flex flex-col justify-center items-center gap-4 "
      >
        {isMobile && (
          <div className="w-full px-2 py-3">
            <MCBackButton variant="background" onClick={() => navigate(-1)} />
          </div>
        )}

        {isMobile ? (
          <PatientProfileBannerMobile user={user} setOpenSheet={setOpenSheet} />
        ) : (
          <PatientProfileBanner user={user} setOpenSheet={setOpenSheet} />
        )}

        <div className={isMobile ? "w-full px-2" : "w-[90%]"}>
          <div
            className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-[64%_34%]"} justify-between w-full`}
          >
            <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
              <CardContent className={isMobile ? "p-4" : "p-2"}>
                <h2
                  className={`mb-6 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
                >
                  {t("insurance.title")}
                </h2>
                <div
                  className={`grid ${isMobile ? "grid-cols-2" : "grid-cols-2"} gap-2`}
                >
                  {insuranceLogos.map((insurance, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/20 cursor-pointer"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border-2 font-bold border-primary/10 text-foreground">
                        {insurance.name.substring(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {insurance.name}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center gap-3 p-2">
                    <span className="text-sm text-primary hover:underline hover:text-secondary cursor-pointer">
                      {t("insurance.morePlans")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <MedicalInfoCard
              isMobile={isMobile}
              age={t("profileForm.agePlaceholder")}
              bmi="26.1"
              height={t("profileForm.heightPlaceholder") + " cm"}
              weight={t("profileForm.weightPlaceholder") + " kg"}
              bloodType={t("profileForm.bloodTypePlaceholder")}
              allergies={[
                t("clinicalHistory.allergies") + " (Penicillin, skin rash)",
                t("clinicalHistory.allergies") + " (Penicillin, skin rash)",
              ]}
              conditions={[
                t(
                  "clinicalHistory.conditionPlaceholder",
                  "Appendectomy in 2010",
                ),
                t(
                  "clinicalHistory.conditionPlaceholder",
                  "Family history of type 2 diabetes",
                ),
              ]}
            />
          </div>
        </div>

        <Card
          className={`animate-fade-in rounded-4xl border-0 shadow-md bg-background ${isMobile ? "w-full" : "w-[90%]"}`}
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

        <MCSheetProfile open={openSheet} onOpenChange={setOpenSheet} />
      </motion.main>
    </div>
  );
}

export default PatientProfilePage;
