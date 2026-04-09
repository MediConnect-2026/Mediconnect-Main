import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import SearchDropdown from "./searchComponent/SearchDropdown";
import InsuranceDropdown from "@/features/patient/components/searchComponent/InsuranceDropdown";
import type { InsurancePlan } from "@/data/searchData";
import { specialties } from "@/data/searchData";
import { useSearchDoctors } from "@/features/search/hooks/useSearchDoctors";
import { useTranslation } from "react-i18next";

interface DoctorSearchBarProps {
  onSearchChange?: (searchTerm: string) => void;
  onInsuranceChange?: (insurance: string) => void;
  onDoctorSelect?: (doctorId: string) => void;
  onInsuranceSelect?: (insuranceId: string, insuranceName: string) => void;
}

// Minimum search length to trigger API call
const MIN_SEARCH_LENGTH = 2;

const DoctorSearchBar = ({ onSearchChange, onInsuranceChange, onDoctorSelect, onInsuranceSelect }: DoctorSearchBarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [insurance, setInsurance] = useState("");
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<string | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedInsurance = useDebounce(insurance, 300);
  const searchRef = useRef<HTMLDivElement>(null);
  const insuranceRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation("patient");

  // Use search doctors hook with name filter and/or insurance filter
  const hasSearchText = debouncedSearch.trim().length >= MIN_SEARCH_LENGTH;
  const hasInsuranceSelected = selectedInsuranceId !== null;
  const shouldEnableSearch = hasSearchText || hasInsuranceSelected;
  
  console.log("DoctorSearchBar state:", {
    hasSearchText,
    hasInsuranceSelected,
    shouldEnableSearch,
    selectedInsuranceId,
    debouncedSearch,
  });
  
  const { 
    filteredProviders, 
    isLoading 
  } = useSearchDoctors({
    lat: null, // Don't send location for name-only search
    lng: null, // Don't send location for name-only search
    radiusKm: undefined, // Don't send radius for name-only search
    filters: shouldEnableSearch ? {
      name: debouncedSearch,
      insuranceAccepted: selectedInsuranceId ? [selectedInsuranceId] : [],
      providerType: [],
      modality: "all",
      specialty: [],
      gender: "all",
      yearsOfExperience: null,
      languages: "all",
      scheduledAppointments: "all",
      rating: null,
      radio: null,
    } : undefined,
    enabled: shouldEnableSearch,
  });
  
  console.log("Search results:", {
    filteredProvidersCount: filteredProviders.length,
    isLoading,
  });

  // Update parent with debounced search term
  useEffect(() => {
    onSearchChange?.(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  // Update parent with debounced insurance
  useEffect(() => {
    onInsuranceChange?.(debouncedInsurance);
  }, [debouncedInsurance, onInsuranceChange]);

  // Auto-open search dropdown when insurance is selected
  useEffect(() => {
    if (hasInsuranceSelected && onInsuranceSelect) {
      setShowSearchDropdown(true);
    }
  }, [hasInsuranceSelected, onInsuranceSelect]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
      if (
        insuranceRef.current &&
        !insuranceRef.current.contains(event.target as Node)
      ) {
        setShowInsuranceDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    console.log("Buscando:", { searchTerm, insurance });
  };

  const handleSelectDoctor = (doctorId: string, doctorName: string) => {
    setSearchTerm(doctorName);
    setShowSearchDropdown(false);
    
    // If onDoctorSelect callback is provided, navigate to doctor profile
    if (onDoctorSelect) {
      onDoctorSelect(doctorId);
    }
  };

  const handleSelectSpecialty = (specialty: { id: string; name: string }) => {
    setSearchTerm(specialty.name);
    setShowSearchDropdown(false);
  };

  const handleSelectInsurance = (plan: InsurancePlan) => {
    setInsurance(plan.name);
    setSelectedInsuranceId(plan.id);
    setShowInsuranceDropdown(false);
    
    console.log("Insurance selected, searching doctors with insurance ID:", plan.id);
    
    // If onInsuranceSelect callback is provided, trigger search by insurance
    if (onInsuranceSelect) {
      onInsuranceSelect(plan.id, plan.name);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-background rounded-2xl md:rounded-full shadow-search flex flex-col md:flex-row items-stretch md:items-center p-4 md:p-2 md:pl-6 relative border-1 border-primary/70 gap-3 md:gap-0">
        {/* Campo de búsqueda */}
        <div ref={searchRef} className="flex-1 py-2 relative">
          <label className="block text-xs md:text-sm font-medium text-foreground mb-1">
            {t("searchBar.searchLabel")}
          </label>
          <input
            type="text"
            placeholder={
              isMobile
                ? t("searchBar.searchPlaceholderMobile")
                : t("searchBar.searchPlaceholderDesktop")
            }
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSearchDropdown(true);
            }}
            onFocus={() => setShowSearchDropdown(true)}
            className="w-full bg-background text-muted-foreground placeholder:text-muted-foreground/70 text-sm focus:outline-none"
          />
          {showSearchDropdown && (hasSearchText || hasInsuranceSelected) && (
            <SearchDropdown
              searchTerm={debouncedSearch}
              doctors={filteredProviders}
              specialties={specialties}
              onSelectDoctor={handleSelectDoctor}
              onSelectSpecialty={handleSelectSpecialty}
              isMobile={isMobile}
              isLoading={isLoading}
              hasActiveFilter={hasInsuranceSelected}
            />
          )}
        </div>

        {/* Separador */}
        <div className="w-full md:w-px h-px md:h-12 bg-border md:mx-4" />

        {/* Campo de seguro */}
        <div ref={insuranceRef} className="flex-1 py-2 relative">
          <label className="block text-xs md:text-sm font-medium text-foreground mb-1">
            {t("searchBar.insuranceLabel")}
          </label>
          <input
            type="text"
            placeholder={
              isMobile
                ? t("searchBar.insurancePlaceholderMobile")
                : t("searchBar.insurancePlaceholderDesktop")
            }
            value={insurance}
            onChange={(e) => {
              const newValue = e.target.value;
              setInsurance(newValue);
              setShowInsuranceDropdown(true);
              
              // If user clears the insurance field, clear the selected insurance ID
              if (newValue === "") {
                setSelectedInsuranceId(null);
                setShowSearchDropdown(false);
              }
            }}
            onFocus={() => setShowInsuranceDropdown(true)}
            className="w-full bg-transparent text-muted-foreground placeholder:text-muted-foreground/70 text-sm focus:outline-none"
          />
          {showInsuranceDropdown && (
            <InsuranceDropdown
              searchTerm={insurance}
              onSelect={handleSelectInsurance}
              isMobile={isMobile}
            />
          )}
        </div>

        <button
          onClick={handleSearch}
          className="w-full md:w-14 h-12 md:h-14 rounded-xl md:rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center transition-colors md:ml-4"
          aria-label={t("searchBar.searchButton")}
        >
          <Search className="w-5 h-5 text-primary-foreground" />
          {isMobile && (
            <span className="ml-2 font-medium text-primary-foreground">
              {t("searchBar.searchButton")}
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default DoctorSearchBar;
