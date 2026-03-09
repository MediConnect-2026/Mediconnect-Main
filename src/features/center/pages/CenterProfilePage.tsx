import { useState } from "react";
import { useTranslation } from "react-i18next";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import { useAppStore } from "@/stores/useAppStore";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import MCDoctorsCards from "@/shared/components/MCDoctorsCards";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import { Filter } from "lucide-react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import CenterProfileBanner from "../components/profile/CenterProfileBanner";
import CenterProfileBannerMobile from "../components/profile/CenterProfileBannerMobile";
import FilterStaff from "../components/filters/FilterStaff";
import MapScheduleLocation from "@/shared/components/maps/MapScheduleLocation";

// Mock data for connected doctors
const doctorsList = [
  {
    name: "Dr. Carlos Méndez",
    specialty: "Cardiología",
    rating: 4.8,
    yearsOfExperience: 15,
    languages: ["es", "en", "fr"],
    insuranceAccepted: ["senasa", "universal", "humano"],
    isFavorite: false,
    urlImage: "",
  },
  {
    name: "Dra. María López",
    specialty: "Dermatología",
    rating: 4.9,
    yearsOfExperience: 10,
    languages: ["es", "en"],
    insuranceAccepted: ["palic", "humano"],
    isFavorite: true,
    urlImage: "",
  },
  {
    name: "Dr. Juan Reyes",
    specialty: "Pediatría",
    rating: 4.7,
    yearsOfExperience: 8,
    languages: ["es"],
    insuranceAccepted: ["universal"],
    isFavorite: true,
    urlImage: "",
  },
  {
    name: "Dra. Sofía Ramírez",
    specialty: "Endocrinología",
    rating: 4.6,
    yearsOfExperience: 12,
    languages: ["es", "fr"],
    insuranceAccepted: ["senasa", "mapfre", "yunen"],
    isFavorite: false,
    urlImage: "",
  },
];

// Mock insurances
const insurancesList = [
  { name: "SENASA" },
  { name: "Humano" },
  { name: "Universal" },
  { name: "PALIC" },
  { name: "MAPFRE" },
  { name: "Yunen" },
  { name: "ARS Crecer" },
];

interface StaffFilters {
  specialty: string | string[];
  rating: string | string[];
  joinDate: { from: Date | null; to: Date | null };
}

function CenterProfilePage() {
  const [openSheet, setOpenSheet] = useState(false);
  const [searchName, setSearchName] = useState("");
  const { t } = useTranslation("center");

  const [staffFilters, setStaffFilters] = useState<StaffFilters>({
    specialty: "",
    rating: "",
    joinDate: { from: null, to: null },
  });

  const user = useAppStore((state) => state.user);
  const isMobile = useIsMobile();

  // Mock center data
  const center = {
    id: "1",
    name: user?.name || "Hospital Dario Contreras",
    avatar: user?.avatar,
    banner: user?.banner,
    rating: 4.8,
    reviewCount: 12,
    phone: "809-093-2342",
    website: "https://www.dariocontreras.gob.do",
    description: "",
  };

  // Center location (Santo Domingo, RD - Hospital Dario Contreras)
  const centerLocation = { lat: 18.4861, lng: -69.8887 };

  const updateStaffFilters = (newFilters: Partial<StaffFilters>) => {
    setStaffFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetStaffFilters = () => {
    setStaffFilters({
      specialty: "",
      rating: "",
      joinDate: { from: null, to: null },
    });
    setSearchName("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (
      staffFilters.specialty &&
      (Array.isArray(staffFilters.specialty)
        ? staffFilters.specialty.length > 0
        : staffFilters.specialty !== "")
    )
      count++;
    if (
      staffFilters.rating &&
      (Array.isArray(staffFilters.rating)
        ? staffFilters.rating.length > 0
        : staffFilters.rating !== "" && staffFilters.rating !== "0")
    )
      count++;
    if (staffFilters.joinDate.from || staffFilters.joinDate.to) count++;
    if (searchName) count++;
    return count;
  };

  const filteredDoctors = doctorsList.filter((doctor) => {
    if (
      searchName &&
      !doctor.name.toLowerCase().includes(searchName.toLowerCase())
    )
      return false;

    if (staffFilters.specialty) {
      const specs = Array.isArray(staffFilters.specialty)
        ? staffFilters.specialty
        : [staffFilters.specialty];
      if (
        specs.length > 0 &&
        !specs.some((s) => doctor.specialty.toLowerCase() === s.toLowerCase())
      )
        return false;
    }

    if (staffFilters.rating) {
      const minRating = Array.isArray(staffFilters.rating)
        ? Math.max(...staffFilters.rating.map(Number))
        : Number(staffFilters.rating);
      if (minRating > 0 && doctor.rating < minRating) return false;
    }

    return true;
  });

  return (
    <MCDashboardContent mainWidth="w-[100%]" noBg>
      <div className="min-h-screen w-full flex flex-col gap-4">
        {/* Banner del centro */}
        <div className="w-full">
          {isMobile ? (
            <CenterProfileBannerMobile
              center={center}
              setOpenSheet={setOpenSheet}
            />
          ) : (
            <CenterProfileBanner center={center} setOpenSheet={setOpenSheet} />
          )}
        </div>

        {/* Acerca de - Full width card */}
        <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background w-full">
          <CardContent className={isMobile ? "p-4" : "p-6"}>
            <h2
              className={`mb-3 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
            >
              {t("profilePage.aboutTitle")}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
              {center?.description || t("profilePage.aboutDescription")}
            </p>
          </CardContent>
        </Card>

        {/* Grid: Seguros + Mapa */}
        <div className={isMobile ? "w-full px-0" : "w-full"}>
          <div
            className={`grid ${isMobile ? "grid-cols-1 gap-4" : "grid-cols-2 gap-4"} w-full`}
          >
            {/* Seguros aceptados */}
            <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
              <CardContent className={isMobile ? "p-4" : "p-6"}>
                <h2
                  className={`mb-4 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
                >
                  {t("profilePage.insurancesTitle")}
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {insurancesList.map((insurance, index) => (
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
                      {t("profilePage.morePlans")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación / Mapa */}
            <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
              <CardContent className={isMobile ? "p-4" : "p-6"}>
                <h2
                  className={`mb-4 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
                >
                  {t("profilePage.locationTitle")}
                </h2>
                <MapScheduleLocation
                  initialLocation={centerLocation}
                  fontSizeVariant={isMobile ? "xs" : "s"}
                  showAddressInfo={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Directorio médico (Doctores conectados) */}
        <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background w-full">
          <CardHeader className={isMobile ? "p-4 pb-2" : "p-6 pb-4"}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2
                className={`${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
              >
                {t("profilePage.connectedDoctors")}
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-auto flex-1 sm:flex-none">
                  <MCFilterInput
                    placeholder={t("profilePage.searchPlaceholder")}
                    value={searchName}
                    onChange={setSearchName}
                  />
                </div>
                <FilterStaff
                  filters={staffFilters}
                  onFiltersChange={updateStaffFilters}
                  onClearFilters={resetStaffFilters}
                  activeFiltersCount={getActiveFiltersCount()}
                />
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
                        {t("profilePage.emptyTitle")}
                      </EmptyTitle>
                    </span>
                    <EmptyDescription className="text-muted-foreground text-center max-w-md mx-auto">
                      {t("profilePage.emptyDescription")}
                    </EmptyDescription>
                  </div>
                </EmptyHeader>
                <EmptyContent>
                  {getActiveFiltersCount() > 0 && (
                    <MCButton
                      variant="outline"
                      onClick={resetStaffFilters}
                      className="px-6 py-2"
                      size="sm"
                    >
                      {t("profilePage.clearFilters")}
                    </MCButton>
                  )}
                </EmptyContent>
              </Empty>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
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
                    connectionStatus="connected" // <-- Fuerza el estado conectado
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <MCSheetProfile open={openSheet} onOpenChange={setOpenSheet} />
      </div>
    </MCDashboardContent>
  );
}

export default CenterProfilePage;
