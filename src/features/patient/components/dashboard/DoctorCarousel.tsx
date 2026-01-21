import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MCDoctorCard, {
  type DoctorCardVariant,
} from "@/shared/components/MCDoctorsCards";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import FilterMyDoctors from "../filters/FilterMyDoctors";
import { useFiltersStore } from "@/stores/ useFiltersStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/shared/ui/button";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { useTranslation } from "react-i18next"; // <--- Añade traducción
import { Stethoscope } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/ui/empty";
import MCButton from "@/shared/components/forms/MCButton";
interface Doctor {
  id: number;
  name: string;
  specialty: string;
  rating: number;
  yearsOfExperience?: number;
  languages?: string[];
  insuranceAccepted?: string[];
  isFavorite?: boolean;
  urlImage?: string;
  lastAppointment?: string;
}

interface DoctorCarouselProps {
  doctors: Doctor[];
  title?: string;
  variant?: DoctorCardVariant;
  showSearch?: boolean;
}

export function DoctorCarousel({
  doctors,
  title,
  variant = "m",
  showSearch = true,
}: DoctorCarouselProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation("patient"); // <--- Hook de traducción

  // Obtener filtros y setters del store
  const doctorFilters = useFiltersStore((state) => state.doctorFilters);
  const setDoctorFilters = useFiltersStore((state) => state.setDoctorFilters);

  // Filtrar doctores según los filtros activos
  const filteredDoctors = doctors.filter((doctor) => {
    if (
      doctorFilters.specialty &&
      doctor.specialty.toLowerCase() !== doctorFilters.specialty.toLowerCase()
    )
      return false;
    if (
      doctorFilters.languages.length &&
      !doctorFilters.languages.some((lang: any) =>
        doctor.languages?.includes(lang),
      )
    )
      return false;
    if (
      doctorFilters.acceptingInsurance.length &&
      !doctorFilters.acceptingInsurance.some((ins) =>
        doctor.insuranceAccepted?.includes(ins),
      )
    )
      return false;
    if (
      doctorFilters.yearsOfExperience &&
      (doctor.yearsOfExperience ?? 0) < doctorFilters.yearsOfExperience
    )
      return false;
    if (doctorFilters.rating && doctor.rating < doctorFilters.rating)
      return false;
    if (doctorFilters.isFavorite === true && !doctor.isFavorite) return false;
    return true;
  });

  // Contar filtros activos
  const activeFilters = [
    doctorFilters.specialty,
    doctorFilters.languages.length,
    doctorFilters.acceptingInsurance.length,
    doctorFilters.yearsOfExperience,
    doctorFilters.rating,
    doctorFilters.isFavorite,
  ].filter(Boolean);

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
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-foreground">
          {title || t("navbar.doctors")}
        </h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <div className="w-full sm:w-auto sm:min-w-[200px] lg:min-w-[250px]">
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

      {/* Carousel Container */}
      <div className="relative flex items-center gap-1 sm:gap-2">
        {/* Left Arrow - Hidden on mobile */}
        <button
          onClick={() => scroll("left")}
          className={cn(
            buttonVariants({ variant: buttonVariant }),
            "hidden sm:flex size-9 sm:size-10 lg:size-11 aria-disabled:opacity-50 p-2 border-none select-none transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 active:scale-95 rounded-full flex-shrink-0",
            defaultClassNames.button_previous,
          )}
          aria-label={
            t("navbar.doctors") + " " + t("common.previous") || "Scroll left"
          }
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>

        {/* Cards Container o Empty */}
        {filteredDoctors.length === 0 ? (
          <Empty className="flex-1 my-6">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                {/* Puedes usar cualquier icono, por ejemplo: */}
                <Stethoscope size={32} />
              </EmptyMedia>
              <EmptyTitle>
                {t("doctors.emptyTitle", "No doctors found")}
              </EmptyTitle>
              <EmptyDescription>
                {t(
                  "doctors.emptyDescription",
                  "Try adjusting your filters or search criteria.",
                )}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              {/* Puedes agregar un botón para limpiar filtros si lo deseas */}
              <MCButton
                size="s"
                variant="outline"
                onClick={() =>
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
                className="flex-shrink-0 snap-center w-[85vw] sm:w-[calc((100%-32px)/2)] lg:w-[calc((100%-64px)/3)] min-w-[110px] max-w-[300px]"
              >
                <MCDoctorCard
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
                />
              </div>
            ))}
          </div>
        )}

        {/* Right Arrow - Hidden on mobile */}
        <button
          onClick={() => scroll("right")}
          className={cn(
            buttonVariants({ variant: buttonVariant }),
            "hidden sm:flex size-9 sm:size-10 lg:size-11 aria-disabled:opacity-50 p-2 select-none border-none transition-all duration-200 hover:bg-primary/10 dark:hover:bg-primary/20 active:scale-95 rounded-full flex-shrink-0",
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
