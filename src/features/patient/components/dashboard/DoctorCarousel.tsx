import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MCDoctorCard, {
  type DoctorCardVariant,
} from "@/shared/components/MCDoctorsCards";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import FilterMyDoctors from "../filters/FilterMyDoctors";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { useTranslation } from "react-i18next";
import { Stethoscope, Loader2 } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
import { useMyDoctors } from "@/lib/hooks/useMyDoctors";

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

interface DoctorCarouselProps {
  doctors?: Doctor[]; // Ahora es opcional
  title?: string;
  variant?: DoctorCardVariant;
  showSearch?: boolean;
  useMockData?: boolean; // Nueva prop para controlar si usar datos mock o API
}

// Interfaz para los filtros de doctores
interface DoctorFilters {
  specialty: string;
  languages: string[];
  acceptingInsurance: string[];
  yearsOfExperience: number | null;
  rating: number | null;
  isFavorite: boolean | null;
}

export function DoctorCarousel({
  doctors: mockDoctors,
  title,
  variant = "m",
  showSearch = true,
  useMockData = false,
}: DoctorCarouselProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation("patient");

  // Estados locales con useState
  const [searchTerm, setSearchTerm] = React.useState("");
  const [doctorFilters, setDoctorFilters] = React.useState<DoctorFilters>({
    specialty: "",
    languages: [],
    acceptingInsurance: [],
    yearsOfExperience: null,
    rating: null,
    isFavorite: null,
  });

  // Fetch doctors from API (solo si no usamos mock data)
  const { data, isLoading } = useMyDoctors(
    useMockData
      ? undefined
      : {
          target: i18n.language,
          source: "es",
          translate_fields: "especialidadPrincipal.nombre",
        },
  );

  // Transform API data to the format expected by MCDoctorCard
  const transformedDoctors = useMemo(() => {
    // Si usamos mock data, retornar los doctores proporcionados
    if (useMockData && mockDoctors) {
      return mockDoctors;
    }

    // Si no hay datos de la API, retornar array vacío
    if (!data?.data) return [];

    console.log("Transforming doctors data:", data.data);
    return data.data.map((doctor) => ({
      id: Number(doctor.id),
      name: `${doctor.nombre} ${doctor.apellido}`,
      specialty:
        doctor.especialidadPrincipal?.nombre ||
        t("myDoctors.noSpecialty", "Sin especialidad"),
      rating: doctor.calificacionPromedio || 0,
      yearsOfExperience: doctor.anosExperiencia || 0,
      languages:
        doctor.idiomas?.map((idioma) =>
          idioma.nombre.toLowerCase().substring(0, 2),
        ) || [],
      insuranceAccepted:
        doctor.segurosAceptados?.map(
          (seguro) => seguro.nombre?.toLowerCase() || "",
        ) || [],
      insuranceAcceptedIds:
        doctor.segurosAceptados
          ?.map((seguro) => seguro.id)
          .filter((id): id is number => id !== null) || [],
      isFavorite: doctor.esFavorito || false,
      urlImage: doctor.fotoPerfil || "",
      lastAppointment: doctor.ultimaCita?.fecha,
    }));
  }, [data, t, useMockData, mockDoctors]);

  // Estado local para los doctores (para manejar favoritos localmente)
  const [doctorList, setDoctorList] = React.useState<Doctor[]>([]);

  // Actualiza doctorList cuando cambian los datos transformados
  React.useEffect(() => {
    setDoctorList(transformedDoctors);
  }, [transformedDoctors]);

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
    setSearchTerm("");
  };

  // Función para hacer toggle de favorito
  const handleToggleFavorite = (doctorId: number) => {
    setDoctorList((prev) =>
      prev.map((doc) =>
        doc.id === doctorId ? { ...doc, isFavorite: !doc.isFavorite } : doc,
      ),
    );
  };

  // Filtrar doctores según los filtros activos y búsqueda
  const filteredDoctors = doctorList.filter((doctor) => {
    // Filtro por búsqueda (nombre o especialidad)
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
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

  // Función para contar filtros activos
  const getActiveFiltersCount = () => {
    let count = 0;
    if (doctorFilters.specialty) count++;
    if (doctorFilters.languages.length > 0) count++;
    if (doctorFilters.acceptingInsurance.length > 0) count++;
    if (doctorFilters.yearsOfExperience) count++;
    if (doctorFilters.rating && doctorFilters.rating > 0) count++;
    if (doctorFilters.isFavorite) count++;
    if (searchTerm) count++;
    return count;
  };

  const hasAnyDoctor = doctorList.length > 0;
  const hasActiveFilters = getActiveFiltersCount() > 0;
  const isFilteredEmpty = hasAnyDoctor && hasActiveFilters;

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = isMobile ? 250 : 300;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const buttonVariant = "outline";
  const defaultClassNames = {
    button_previous: "",
    button_next: "",
  };

  return (
    <motion.section className="max-w-full p-4 sm:p-6" {...fadeInUp}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl lg:text-3xl font-semibold text-foreground">
          {title || t("navbar.doctors")}
        </h2>

        {showSearch && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
              <MCFilterInput
                placeholder={t(
                  "myDoctors.searchPlaceholder",
                  "Buscar por nombre...",
                )}
                value={searchTerm}
                onChange={setSearchTerm}
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
        )}
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow - Fixed position */}
        <button
          onClick={() => scroll("left")}
          className={cn(
            buttonVariants({ variant: buttonVariant }),
            "hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 size-9 sm:size-10 lg:size-11 aria-disabled:opacity-50 p-2 border-none select-none transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 active:scale-95 rounded-full flex-shrink-0 shadow-lg",
            defaultClassNames.button_previous,
          )}
          aria-label={
            t("navbar.doctors") + " " + t("common.previous") || "Scroll left"
          }
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>

        {/* Cards Container */}
        <div className="px-0 sm:px-12 lg:px-14">
          {/* Loading State */}
          {isLoading && !useMockData ? (
            <div className="flex-1 flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                {t("myDoctors.loading", "Cargando doctores...")}
              </span>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <Empty className="flex-1 my-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Stethoscope size={32} />
                </EmptyMedia>
                <EmptyTitle>
                  {isFilteredEmpty
                    ? t(
                        "myDoctors.empty.filteredTitle",
                        "No se encontraron doctores",
                      )
                    : t(
                        "myDoctors.empty.noDoctorsTitle",
                        "Aún no tienes doctores",
                      )}
                </EmptyTitle>
                <EmptyDescription>
                  {isFilteredEmpty
                    ? t(
                        "myDoctors.empty.filteredDescription",
                        "Intenta ajustar los filtros o la búsqueda.",
                      )
                    : t(
                        "myDoctors.empty.noDoctorsDescription",
                        "Cuando tengas doctores asignados, aparecerán aquí.",
                      )}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <MCButton
                  size="s"
                  variant="outline"
                  onClick={resetDoctorFilters}
                >
                  {t("filters.popover.clear", "Clear filters")}
                </MCButton>
              </EmptyContent>
            </Empty>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide py-2 snap-x snap-mandatory"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="flex-shrink-0 snap-center w-[280px] sm:w-[300px] lg:w-[320px]"
                >
                  <MCDoctorCard
                    id={doctor.id}
                    name={doctor.name}
                    specialty={doctor.specialty}
                    rating={doctor.rating}
                    yearsOfExperience={doctor.yearsOfExperience}
                    languages={doctor.languages}
                    insuranceAccepted={doctor.insuranceAccepted}
                    isFavorite={doctor.isFavorite}
                    urlImage={doctor.urlImage}
                    variant={variant}
                    lastAppointment={doctor.lastAppointment}
                    onToggleFavorite={() => handleToggleFavorite(doctor.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Arrow - Fixed position */}
        <button
          onClick={() => scroll("right")}
          className={cn(
            buttonVariants({ variant: buttonVariant }),
            "hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 size-9 sm:size-10 lg:size-11 aria-disabled:opacity-50 p-2 select-none border-none transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 active:scale-95 rounded-full flex-shrink-0 shadow-lg",
            defaultClassNames.button_next,
          )}
          aria-label={
            t("navbar.doctors") + " " + t("common.next") || "Scroll right"
          }
        >
          <ChevronRight size={20} className="text-foreground" />
        </button>
      </div>

      {/* Scroll indicator for mobile */}
      {isMobile && filteredDoctors.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 sm:hidden">
          {filteredDoctors.slice(0, 5).map((_, idx) => (
            <div
              key={idx}
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30"
            />
          ))}
        </div>
      )}
    </motion.section>
  );
}
