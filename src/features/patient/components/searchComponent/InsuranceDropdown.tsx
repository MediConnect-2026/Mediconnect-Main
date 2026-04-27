import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { insurancePlans, type InsurancePlan } from "@/data/searchData";
import { Loader2 } from "lucide-react";
import {
  useAvailableInsurances,
  usePopularInsurances,
} from "@/features/patient/hooks";

interface InsuranceDropdownProps {
  searchTerm: string;
  onSelect: (plan: InsurancePlan) => void;
  isMobile?: boolean;
}

const InsuranceDropdown = ({
  searchTerm,
  onSelect,
  isMobile = false,
}: InsuranceDropdownProps) => {
  const { t } = useTranslation("patient");

  // React Query hooks para datos con caché
  const { data: availableInsurances = [], isLoading: isLoadingInsurances } =
    useAvailableInsurances();
  const {
    data: popularInsurances = [],
    isLoading: isLoadingPopularInsurances,
  } = usePopularInsurances();

  const { popularPlans, allPlans } = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();

    // Map availableInsurances (Seguro[]) to InsurancePlan shape
    const mappedPlans: InsurancePlan[] =
      availableInsurances && availableInsurances.length > 0
        ? availableInsurances.map((s) => ({
            id: String(s.id),
            name: s.nombre,
            popular: false,
          }))
        : insurancePlans;

    // Map popularInsurances (if provided) to InsurancePlan
    const mappedPopularPlans: InsurancePlan[] =
      popularInsurances && popularInsurances.length > 0
        ? popularInsurances.map((s) => ({
            id: String(s.id),
            name: s.nombre,
            popular: true,
          }))
        : mappedPlans.filter((p) => p.popular);

    const filterByQuery = (plans: InsurancePlan[]) =>
      query ? plans.filter((p) => p.name.toLowerCase().includes(query)) : plans;

    const popularFiltered = filterByQuery(mappedPopularPlans);
    const othersFiltered = filterByQuery(
      mappedPlans.filter((p) => !p.popular),
    ).sort((a, b) => a.name.localeCompare(b.name));

    return {
      popularPlans: popularFiltered,
      allPlans: othersFiltered,
    };
  }, [searchTerm, availableInsurances, popularInsurances]);

  // Agrupar por letra inicial (solo en desktop)
  const groupedPlans = useMemo(() => {
    if (isMobile) return null;

    const groups: Record<string, InsurancePlan[]> = {};
    allPlans.forEach((plan) => {
      const letter = plan.name[0].toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(plan);
    });
    return groups;
  }, [allPlans, isMobile]);

  // En mobile, mostrar lista simple
  const mobilePlans = isMobile ? allPlans.slice(0, 10) : [];

  return (
    <div className="absolute top-full left-0 right-0 mt-2 md:mt-2.5 bg-background rounded-xl md:rounded-2xl shadow-search border border-primary/15 overflow-hidden z-50 max-h-[60vh] md:max-h-96 overflow-y-auto">
      <div className="py-3">
        {/* Planes populares */}
        {popularPlans.length > 0 && (
          <div className="px-4 md:px-5">
            <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">
              {t("searchBar.popularPlans")}
            </h3>
            {popularPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => onSelect(plan)}
                className="w-full text-left py-2.5 md:py-2 px-2 rounded-lg hover:bg-accent transition-colors text-foreground hover:text-secondary-foreground text-sm md:text-base"
              >
                {plan.name}
              </button>
            ))}
          </div>
        )}

        {/* MOBILE: Lista simple */}
        {isMobile && mobilePlans.length > 0 && (
          <div className="px-4 mt-4">
            <h3 className="font-semibold text-foreground mb-2 text-sm">
              {t("searchBar.allPlans")}
            </h3>
            {mobilePlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => onSelect(plan)}
                className="w-full text-left py-2.5 px-2 rounded-lg hover:bg-accent hover:text-secondary-foreground transition-colors text-foreground text-sm"
              >
                {plan.name}
              </button>
            ))}
          </div>
        )}

        {/* DESKTOP: Agrupado por letra */}
        {isLoadingInsurances || isLoadingPopularInsurances ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          !isMobile &&
          groupedPlans &&
          Object.keys(groupedPlans).length > 0 && (
            <div className="px-5 mt-4">
              <h3 className="font-semibold text-foreground mb-2">
                {t("searchBar.allPlans")}
              </h3>
              {Object.entries(groupedPlans).map(([letter, plans]) => (
                <div key={letter}>
                  <div className="text-sm font-medium text-muted-foreground mt-3 mb-1">
                    {letter}
                  </div>
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => onSelect(plan)}
                      className="w-full text-left py-2 px-2 rounded-lg hover:bg-accent hover:text-secondary-foreground transition-colors text-foreground"
                    >
                      {plan.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )
        )}

        {popularPlans.length === 0 &&
          (isMobile
            ? mobilePlans.length === 0
            : Object.keys(groupedPlans || {}).length === 0) && (
            <div className="px-4 md:px-5 py-4 text-muted-foreground text-center text-sm md:text-base">
              {t("searchBar.noPlans")}
            </div>
          )}
      </div>
    </div>
  );
};

export default InsuranceDropdown;
