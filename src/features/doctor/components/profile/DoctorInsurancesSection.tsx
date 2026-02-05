import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTranslation } from "react-i18next";

interface Insurance {
  name: string;
  logo?: string; // Si tienes logos, puedes agregar la propiedad
}

interface Props {
  insurances: string[];
}

const DoctorInsurancesSection = ({ insurances }: Props) => {
  const { t } = useTranslation("doctor");

  // Simulación de logos, puedes reemplazar por imágenes reales si tienes
  const insuranceLogos: Insurance[] = insurances.map((name) => ({
    name,
    // logo: `/path/to/logos/${name}.png`, // Si tienes logos
  }));

  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {t("profile.insurance.title", "Seguros Médicos Aceptados")}
        </CardTitle>
        <span className="text-sm text-muted-foreground">
          {t(
            "profile.insurance.question",
            "¿Este doctor está dentro de su red de seguros?",
          )}
        </span>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-2">
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
              {t(
                "profile.insurance.morePlans",
                "Más planes de Seguros dentro de la red Ver todo",
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorInsurancesSection;
