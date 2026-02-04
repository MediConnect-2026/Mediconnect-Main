import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { useTranslation } from "react-i18next";
import { Search, Calendar } from "lucide-react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCServiceCards from "@/shared/components/MCServiceCards";

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
}

interface Props {
  services: Service[];
}

function DoctorServicesSection({ services }: Props) {
  const { t } = useTranslation("doctor");
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader className={isMobile ? "p-4 pb-2" : "p-6 pb-4"}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <h2
            className={`${isMobile ? "text-lg" : "text-2xl"} font-semibold text-foreground flex items-center gap-2`}
          >
            {t("profile.services.title", "Servicios ofrecidos")}
          </h2>
          <div className="w-full sm:w-auto flex-1 sm:flex-none relative"></div>
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
