import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCCentersCards from "@/shared/components/MCCentersCards";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import FilterCenters from "../filters/FilterCenters";

interface Center {
  id: string | number;
  name: string;
  type: string;
  rating: number;
  reviewCount?: number;
  phone?: string;
  urlImage?: string;
  isConnected?: boolean;
  description?: string;
}

interface CenterFilters {
  type: string;
  rating: number | null;
  isConnected: boolean | null;
}

interface Props {
  centers: Center[];
  onToggleConnection?: (id: string | number) => void;
}

function DoctorCentersSection({ centers, onToggleConnection }: Props) {
  const { t } = useTranslation("doctor");
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  // Estado de filtros
  const [filters, setFilters] = useState<CenterFilters>({
    type: "",
    rating: null,
    isConnected: null,
  });

  // Lógica de filtrado
  const filteredCenters = centers.filter((center) => {
    // Filtro por búsqueda
    const matchesSearch =
      center.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (center.type &&
        center.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (center.description &&
        center.description.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por tipo (solo si hay filtro)
    if (filters.type && center.type !== filters.type) return false;

    // Filtro por rating (solo si hay filtro)
    if (filters.rating !== null && center.rating < filters.rating) return false;

    // Filtro por conexión (solo si hay filtro)
    if (
      filters.isConnected !== null &&
      !!center.isConnected !== filters.isConnected
    )
      return false;

    return matchesSearch;
  });

  // Componente de filtros
  const filterComponent = (
    <MCFilterPopover
      activeFiltersCount={
        Object.values(filters).filter(
          (v) =>
            (typeof v === "string" && v !== "") ||
            (typeof v === "number" && v !== null),
        ).length
      }
      onClearFilters={() =>
        setFilters({
          type: "",
          rating: null,
          isConnected: null,
        })
      }
    >
      <FilterCenters
        filters={filters}
        onFiltersChange={(partialFilters) =>
          setFilters((prev) => ({ ...prev, ...partialFilters }))
        }
      />
    </MCFilterPopover>
  );

  // Componente de búsqueda
  const searchComponent = (
    <MCFilterInput
      placeholder={t("profile.centers.search", "Buscar centro...")}
      value={searchTerm}
      onChange={setSearchTerm}
    />
  );

  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader className={isMobile ? "p-4 pb-2" : "p-6 pb-4"}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <h2
            className={`${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground flex items-center gap-2`}
          >
            {t("profile.centers.title", "Centros médicos")}
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            {searchComponent}
            {filterComponent}
          </div>
        </div>
      </CardHeader>

      <CardContent className={isMobile ? "p-4 pt-2" : "p-6 pt-4"}>
        {filteredCenters.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t("profile.centers.noResults", "No se encontraron centros.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filteredCenters.map((center) => (
              <MCCentersCards
                key={center.id}
                name={center.name}
                type={center.type}
                rating={center.rating}
                description={center.description}
                reviewCount={center.reviewCount}
                phone={center.phone}
                urlImage={center.urlImage ?? ""}
                isConnected={center.isConnected}
                onToggleConnection={
                  onToggleConnection
                    ? () => onToggleConnection(center.id)
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DoctorCentersSection;
