import { useState } from "react";
import MCBackButton from "@/shared/components/forms/MCBackButton";

import { Heart, AlertTriangle } from "lucide-react";

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
import { type DoctorFiltersSlice } from "@/stores/filters/doctorFilters.slice";
import { useFiltersStore } from "@/stores/ useFiltersStore";

const doctorsList = [
  {
    name: "Alexander Gil",
    specialty: "cardiology",
    rating: 4.8,
    yearsOfExperience: 15,
    languages: ["es", "en", "fr"],
    insuranceAccepted: ["senasa", "universal", "humano"],
    isFavorite: true,
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
    urlImage:
      "https://i.pinimg.com/736x/8f/7a/9c/8f7a9cb4ea42e64fa5c7025a9918d62c.jpg",
  },
  {
    name: "Sofía Ramírez",
    specialty: "Endocrinóloga",
    rating: 4.6,
    yearsOfExperience: 12,
    languages: ["es", "fr"],
    insuranceAccepted: ["senasa", "mapfre", "yunen"],
    isFavorite: true,
    urlImage:
      "https://i.pinimg.com/736x/8f/7a/9c/8f7a9cb4ea42e64fa5c7025a9918d62c.jpg",
  },
  {
    name: "Sofía Ramírez",
    specialty: "Endocrinóloga",
    rating: 4.6,
    yearsOfExperience: 12,
    languages: ["es", "fr"],
    insuranceAccepted: ["senasa", "mapfre", "yunen"],
    isFavorite: true,
    urlImage:
      "https://i.pinimg.com/736x/8f/7a/9c/8f7a9cb4ea42e64fa5c7025a9918d62c.jpg",
  },
];

function getActiveFilters(
  filters: DoctorFiltersSlice["doctorFilters"],
): string[] {
  const active: string[] = [];
  if (filters.specialty) active.push("Especialidad");
  if (filters.languages.length) active.push("Idiomas");
  if (filters.acceptingInsurance.length) active.push("Seguros");
  if (filters.yearsOfExperience) active.push("Experiencia");
  if (filters.rating && filters.rating > 0) active.push("Ranking");
  if (filters.isFavorite) active.push("Solo favoritos");
  return active;
}

function PatientProfilePage() {
  const [openSheet, setOpenSheet] = useState(false);

  const user = useAppStore((state) => state.user);
  const isMobile = useIsMobile();

  const insuranceLogos = [
    { name: "SeNaSa" },
    { name: "ARS Palic" },
    { name: "Humano Seguros" },
    { name: "MAPFRE ARS" },
    { name: "ARS Universal" },
    { name: "Seguros Crecer" },
    { name: "ARS Yunen" },
  ];

  const doctorFilters = useFiltersStore((state) => state.doctorFilters);
  const setDoctorFilters = useFiltersStore((state) => state.setDoctorFilters);

  // Filtrado de doctores usando doctorFilters
  const filteredDoctors = doctorsList.filter((doctor) => {
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

  const activeFilters = getActiveFilters(doctorFilters);
  console.log(activeFilters);

  return (
    <div
      className={`w-full ${isMobile ? "flex flex-col" : "grid grid-cols-[5%_95%]"} justify-between items-start `}
    >
      {!isMobile && (
        <aside>
          <MCBackButton variant="background" />
        </aside>
      )}

      <main className="w-full flex flex-col justify-center items-center gap-4 ">
        {isMobile && (
          <div className="w-full px-2 py-3">
            <MCBackButton variant="background" />
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
                  Mis Seguros Médicos
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
                      Más planes de Seguros dentro de la red Ver todo
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
              <CardContent className={isMobile ? "p-4" : "p-2"}>
                <h2
                  className={`mb-6 ${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground`}
                >
                  Información Médica
                </h2>
                <div
                  className={`mb-6 grid ${isMobile ? "grid-cols-2" : "grid-cols-4"} gap-4`}
                >
                  <div>
                    <p className="text-xs text-muted-foreground">Edad</p>
                    <p
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
                    >
                      45 años
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">IMC</p>
                    <p
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
                    >
                      26.1
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Altura</p>
                    <p
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
                    >
                      175 cm
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Peso</p>
                    <p
                      className={`${isMobile ? "text-base" : "text-lg"} font-semibold text-foreground`}
                    >
                      80 kg
                    </p>
                  </div>
                </div>
                <div className="border-t border-muted my-4"></div>
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground">
                    Tipo de sangre
                  </p>
                  <p
                    className={`${isMobile ? "text-base" : "text-lg"} font-bold text-foreground`}
                  >
                    O+
                  </p>
                </div>
                <div className="border-t border-muted my-4"></div>
                <div
                  className={`${isMobile ? "max-h-64" : "max-h-48"} overflow-y-auto pr-2`}
                >
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-red-600">
                      <Heart className="h-4 w-4" />
                      <span className="font-medium">Alergias</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Penicilina (produce erupción cutánea)
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Penicilina (produce erupción cutánea)
                    </p>
                  </div>
                  <div className="border-t border-muted my-4"></div>
                  <div>
                    <div className="flex items-center gap-2 text-orange-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium">Condiciones</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Apendicectomía en 2010
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Antecedentes familiares de diabetes tipo 2
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                Doctores Favoritos
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <div className="w-full sm:w-auto flex-1 sm:flex-none">
                  <MCFilterInput />
                </div>
                <MCFilterPopover
                  activeFiltersCount={activeFilters.length}
                  onClearFilters={() =>
                    setDoctorFilters({
                      name: "",
                      specialty: "",
                      yearsOfExperience: null,
                      languages: [],
                      acceptingInsurance: [],
                      isFavorite: null,
                      rating: null,
                    })
                  }
                >
                  <FilterMyDoctors
                    doctorFilters={doctorFilters}
                    setDoctorFilters={setDoctorFilters}
                  />
                </MCFilterPopover>
              </div>
            </div>
          </CardHeader>

          <CardContent className={isMobile ? "p-4 pt-2" : "p-6 pt-4"}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
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
          </CardContent>
        </Card>

        <MCSheetProfile open={openSheet} onOpenChange={setOpenSheet} />
      </main>
    </div>
  );
}

export default PatientProfilePage;
