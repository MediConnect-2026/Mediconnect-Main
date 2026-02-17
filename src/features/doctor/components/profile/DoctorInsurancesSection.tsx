import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTranslation } from "react-i18next";
import MCButton from "@/shared/components/forms/MCButton";
import segurosService from "@/services/seguros/seguros.service";
import type { SeguroAceptado } from "@/services/seguros/seguros.types";

interface Props {
  isMyProfile?: boolean;
  onOpenSheet?: () => void;
}

const DoctorInsurancesSection = ({ isMyProfile = false, onOpenSheet }: Props) => {
  const { t, i18n } = useTranslation("doctor");
  const [seguros, setSeguros] = useState<SeguroAceptado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeguros = async () => {
      try {
        setIsLoading(true);
        const response = await segurosService.obtenerSegurosAceptados({
          target: i18n.language,
          translate_fields: 'nombre'
        });
        setSeguros(response.data || []);
      } catch (err) {
        console.error("Error al obtener seguros aceptados:", err);
        setError("Error al cargar los seguros");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeguros();
  }, [i18n.language]);

  return (
    <Card className="animate-fade-in rounded-4xl border-0 shadow-md bg-background">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-foreground">
          {t("profile.insurance.title", "Seguros Médicos Aceptados")}
        </CardTitle>
        {seguros.length > 0 && !isMyProfile && ( 
          <span className="text-sm text-muted-foreground">
            {t(
              "profile.insurance.question",
              "¿Este doctor está dentro de su red de seguros?",
            )}
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">
              {t("profile.insurance.loading", "Cargando seguros...")}
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-destructive">{error}</p>
          </div>
        ) : seguros.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {seguros.map((seguroData, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/20 cursor-pointer"
              >
                {seguroData.seguro.urlImage ? (
                  <img
                    src={seguroData.seguro.urlImage}
                    alt={seguroData.seguro.nombre}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border-2 font-bold border-primary/10 text-foreground">
                    {seguroData.seguro.nombre.substring(0, 2)}
                  </div>
                )}
                <span className="text-sm font-medium text-foreground">
                  {seguroData.seguro.nombre}
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 p-2">
              <span className="text-sm text-primary hover:underline hover:text-secondary cursor-pointer">
                {!isMyProfile && t(
                  "profile.insurance.morePlans",
                  "Más planes de Seguros dentro de la red Ver todo",
                )}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center px-6">
            <p className="text-muted-foreground mb-4">
              {isMyProfile
                ? t(
                    "profile.insurance.addInsurance",
                    "Agrega los seguros médicos que aceptas para ayudar a tus pacientes",
                  )
                : t(
                    "profile.insurance.noInsurance",
                    "Este doctor no ha registrado seguros médicos aceptados.",
                  )}
            </p>
            {isMyProfile && onOpenSheet && (
              <MCButton variant="outline" onClick={onOpenSheet} size="sm">
                {t(
                  "profile.insurance.addButton",
                  "Agregar seguros aceptados",
                )}
              </MCButton>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoctorInsurancesSection;
