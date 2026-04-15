import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { useTranslation } from "react-i18next";
import MCButton from "@/shared/components/forms/MCButton";
import useAcceptedInsurances from "@/features/doctor/hooks/useAcceptedInsurances";
import { onDoctorInsuranceChanged } from "@/lib/events/insuranceEvents";

interface Props {
  isMyProfile?: boolean;
  onOpenSheet?: () => void;
  doctorId?: number; // Para cargar seguros de un doctor específico, si es necesario
}

const DoctorInsurancesSection = ({ isMyProfile = false, onOpenSheet, doctorId }: Props) => {
  const { t } = useTranslation("doctor");
  // Determine doctorId param: when viewing another doctor's profile (isMyProfile=false)
  // and a doctorId is provided, pass it to the hook to fetch that doctor's accepted insurances.
  const doctorIdParam = !isMyProfile && doctorId ? doctorId : undefined;

  const {
    data: seguros = [],
    isLoading,
    error,
    refetch,
  } = useAcceptedInsurances({ doctorId: doctorIdParam, enabled: true });

  // Escuchar eventos de cambio en seguros del doctor y refetch
  useEffect(() => {
    const unsubscribe = onDoctorInsuranceChanged(() => {
      if (typeof refetch === "function") refetch();
    });

    return unsubscribe;
  }, [refetch]);

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
            <p className="text-destructive">{(error as any)?.message ?? String(error)}</p>
          </div>
        ) : seguros.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {seguros.map((seguroData) => (
              <div
                key={seguroData.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent/20 cursor-pointer"
              >
                {seguroData.urlImage ? (
                  <img
                    src={seguroData.urlImage}
                    alt={seguroData.nombre}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border-2 font-bold border-primary/10 text-foreground">
                    {seguroData.nombre.substring(0, 2)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {seguroData.nombre}
                  </span>
                  {seguroData.tipoSeguro && (
                    <span className="text-xs text-muted-foreground">
                      {typeof seguroData.tipoSeguro === "string"
                        ? seguroData.tipoSeguro
                        : seguroData.tipoSeguro.nombre}
                    </span>
                  )}
                </div>
              </div>
            ))}
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
