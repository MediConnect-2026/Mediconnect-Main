import { Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import SearchDropdown from "./searchComponent/SearchDropdown";
import InsuranceDropdown from "@/features/patient/components/searchComponent/InsuranceDropdown";
import type { Doctor, Specialty, InsurancePlan } from "@/data/searchData";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import { useTranslation } from "react-i18next";

const DoctorSearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [insurance, setInsurance] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showInsuranceDropdown, setShowInsuranceDropdown] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 150);
  const searchRef = useRef<HTMLDivElement>(null);
  const insuranceRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { t } = useTranslation("patient");

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

  const handleSelectDoctor = (doctor: Doctor) => {
    setSearchTerm(doctor.name);
    setShowSearchDropdown(false);
  };

  const handleSelectSpecialty = (specialty: Specialty) => {
    setSearchTerm(specialty.name);
    setShowSearchDropdown(false);
  };

  const handleSelectInsurance = (plan: InsurancePlan) => {
    setInsurance(plan.name);
    setShowInsuranceDropdown(false);
  };

  return (
    <motion.div {...fadeInUp} className="w-full max-w-4xl mx-auto">
      <div className="bg-card rounded-2xl md:rounded-full shadow-search flex flex-col md:flex-row items-stretch md:items-center p-4 md:p-2 md:pl-6 relative border-2 border-foreground/10 gap-3 md:gap-0">
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
            className="w-full bg-transparent text-muted-foreground placeholder:text-muted-foreground/70 text-sm focus:outline-none"
          />
          {showSearchDropdown && debouncedSearch && (
            <SearchDropdown
              searchTerm={debouncedSearch}
              onSelectDoctor={handleSelectDoctor}
              onSelectSpecialty={handleSelectSpecialty}
              isMobile={isMobile}
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
              setInsurance(e.target.value);
              setShowInsuranceDropdown(true);
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

        {/* Botón de búsqueda */}
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
    </motion.div>
  );
};

export default DoctorSearchBar;
