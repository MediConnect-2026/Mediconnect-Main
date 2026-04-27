import { useMemo } from "react";
import HighlightedText from "@/features/patient/components/searchComponent/HighlightedText";
import type { Provider, Doctor as ProviderDoctor } from "@/data/providers";
import type { Specialty } from "@/data/searchData";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";

interface SearchDropdownProps {
  searchTerm: string;
  doctors: Provider[];
  specialties: Specialty[];
  onSelectDoctor: (doctorId: string, doctorName: string) => void;
  onSelectSpecialty: (specialty: Specialty) => void;
  isMobile?: boolean;
  isLoading?: boolean;
  hasActiveFilter?: boolean; // To show doctors even without search term when filtering by insurance
}

const SearchDropdown = ({
  searchTerm,
  doctors,
  specialties,
  onSelectDoctor,
  onSelectSpecialty,
  isMobile = false,
  isLoading = false,
  hasActiveFilter = false,
}: SearchDropdownProps) => {
  const filteredSpecialties = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return specialties
      .filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, isMobile ? 3 : 4);
  }, [searchTerm, specialties, isMobile]);

  const filteredDoctors = useMemo(() => {
    // Show doctors if there's a search term OR an active filter (like insurance)
    if (!searchTerm.trim() && !hasActiveFilter) return [];
    // Doctors are already filtered by the API/hook, just limit the display count
    return doctors.slice(0, isMobile ? 3 : 4);
  }, [doctors, isMobile, searchTerm, hasActiveFilter]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 md:mt-2.5 bg-background rounded-xl md:rounded-2xl shadow-search border border-primary/15 overflow-hidden z-50">
        <div className="py-4 px-4 text-center text-sm text-muted-foreground">
          Buscando...
        </div>
      </div>
    );
  }

  // Show empty state if no results
  if (filteredSpecialties.length === 0 && filteredDoctors.length === 0) {
    if (!searchTerm.trim() && !hasActiveFilter) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-2 md:mt-2.5 bg-background rounded-xl md:rounded-2xl shadow-search border border-primary/15 overflow-hidden z-50">
        <div className="py-4 px-4 text-center text-sm text-muted-foreground">
          No se encontraron resultados
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-2 md:mt-2.5 bg-background rounded-xl md:rounded-2xl shadow-search border border-primary/15 overflow-hidden z-50 max-h-[60vh] md:max-h-96 overflow-y-auto">
      <div className="py-2">
        {/* Especialidades */}
        {filteredSpecialties.length > 0 && (
          <div className="px-3 md:px-4 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 md:hidden">
              Especialidades
            </h3>
            {filteredSpecialties.map((specialty) => (
              <button
                key={specialty.id}
                onClick={() => onSelectSpecialty(specialty)}
                className="w-full text-left py-2.5 md:py-2 px-2 rounded-lg hover:bg-accent hover:text-secondary-foreground transition-colors text-sm md:text-base"
              >
                <HighlightedText text={specialty.name} highlight={searchTerm} />
              </button>
            ))}
          </div>
        )}

        {/* Separador */}
        {filteredSpecialties.length > 0 && filteredDoctors.length > 0 && (
          <div className="border-t border-border mx-3 md:mx-4" />
        )}

        {/* Doctores */}
        {filteredDoctors.length > 0 && (
          <div className="px-3 md:px-4 py-2">
            <h3 className="text-xs font-semibold text-muted-foreground mb-2 md:hidden">
              Doctores
            </h3>
            {filteredDoctors.map((provider) => {
              const doctor = provider as ProviderDoctor;
              const imageSrc = doctor.image?.trim() ? doctor.image : undefined;
              const doctorInitials = doctor.name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase();

              return (
                <button
                  key={doctor.id}
                  onClick={() => onSelectDoctor(doctor.id, doctor.name)}
                  className="w-full flex items-center gap-3 py-2.5 md:py-2 px-2 rounded-lg hover:bg-accent hover:text-secondary-foreground transition-colors"
                >
                  <Avatar className="w-10 h-10 md:w-10 md:h-10 flex-shrink-0">
                    <AvatarImage
                      src={imageSrc}
                      alt={doctor.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                      {doctorInitials || "DR"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left min-w-0 flex-1">
                    <div className="font-medium text-sm md:text-base truncate">
                      {searchTerm ? (
                        <HighlightedText
                          text={doctor.name}
                          highlight={searchTerm}
                        />
                      ) : (
                        doctor.name
                      )}
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground truncate">
                      {doctor.specialty}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDropdown;
