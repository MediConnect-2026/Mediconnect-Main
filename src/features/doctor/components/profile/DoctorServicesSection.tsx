import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { useTranslation } from "react-i18next";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCServiceCards from "@/shared/components/MCServiceCards";
import FiltersServices from "../filters/FiltersServices";
import { MCFilterPopover } from "@/shared/components/filters/MCFilterPopover";
import MCFilterInput from "@/shared/components/filters/MCFilterInput";

interface Service {
  id: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  type: string; // "presencial" | "virtual" | "mixta"
  image: string;
  rating: number;
  reviews: number;
  status?: string;
  isOwner?: boolean;
}

interface ServiceFilters {
  type: string;
  priceRange: string;
  duration: string;
  rating: number | null;
  status: string;
  isOwner: boolean | null;
}

interface Props {
  services: Service[];
}

function DoctorServicesSection({ services }: Props) {
  const { t } = useTranslation("doctor");
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  // Filtros iniciales
  const [filters, setFilters] = useState<ServiceFilters>({
    type: "",
    priceRange: "",
    duration: "",
    rating: null,
    status: "",
    isOwner: null,
  });

  // Lógica de filtrado
  const filteredServices = services.filter((service) => {
    // Filtro por búsqueda
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por tipo
    if (filters.type && service.type !== filters.type) return false;

    // Filtro por duración
    if (filters.duration && service.duration !== filters.duration) return false;

    // Filtro por rango de precio (ejemplo simple, ajusta según tu formato de precio)
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number);
      const priceValue = Number(service.price.replace(/[^0-9]/g, ""));
      if (max) {
        if (priceValue < min || priceValue > max) return false;
      } else {
        if (priceValue < min) return false;
      }
    }

    // Filtro por rating
    if (filters.rating !== null && service.rating < filters.rating)
      return false;

    // Filtro por status (solo si eres owner)
    if (filters.status && service.status !== filters.status) return false;

    // Filtro por owner
    if (filters.isOwner === true && !service.isOwner) return false;

    // Ocultar servicios inactivos a no owners
    if (service.status === "inactive" && !service.isOwner) return false;

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
          priceRange: "",
          duration: "",
          rating: null,
          status: "",
          isOwner: null,
        })
      }
    >
      <FiltersServices
        filters={filters}
        onFiltersChange={(partialFilters) =>
          setFilters((prev) => ({ ...prev, ...partialFilters }))
        }
        owner={true}
      />
    </MCFilterPopover>
  );

  // Componente de búsqueda
  const searchComponent = (
    <MCFilterInput
      placeholder={t("profile.services.search", "Buscar servicio...")}
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
            {t("profile.services.title", "Servicios ofrecidos")}
          </h2>
          <div className="flex gap-2 w-full sm:w-auto">
            {searchComponent}
            {filterComponent}
          </div>
        </div>
      </CardHeader>

      <CardContent className={isMobile ? "p-4 pt-2" : "p-6 pt-4"}>
        {filteredServices.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {t("profile.services.noResults", "No se encontraron servicios.")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <MCServiceCards
                key={service.id}
                image={service.image}
                status={
                  service.status === "active" || service.status === "inactive"
                    ? service.status
                    : undefined
                }
                title={service.title}
                price={service.price}
                description={service.description}
                rating={service.rating}
                reviews={service.reviews}
                duration={service.duration}
                type={service.type}
                isOwner={service.isOwner}
                onDetails={() => {
                  /* Acción al ver detalles */
                }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DoctorServicesSection;
