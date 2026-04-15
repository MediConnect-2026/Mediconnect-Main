import { useState, useEffect } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCSelect from "@/shared/components/forms/MCSelect";
import { X, Shield, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { patientInsuranceSchema } from "@/schema/profile.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { toast } from "sonner";
import {
  useAvailableInsurances,
  useAvailableInsuranceTypes,
  useMyInsurances,
  useAddInsurance,
  useRemoveInsurance,
} from "@/features/patient/hooks";

interface InsuranceProps {
  onInsurancesChanged?: () => void;
}

function Insurance({ onInsurancesChanged }: InsuranceProps = {}) {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();

  const setPatientInsurance = useProfileStore(
    (state) => state.setPatientInsurance,
  );

  const patientInsurance = useProfileStore((state) => state.patientInsurance);

  // React Query hooks para datos con caché
  const { data: availableInsurances = [], isLoading: isLoadingInsurances } =
    useAvailableInsurances();
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<number | null>(
    null,
  );
  const {
    data: availableInsuranceTypes = [],
    isLoading: isLoadingInsuranceTypes,
  } = useAvailableInsuranceTypes({
    insuranceId: selectedInsuranceId ?? undefined,
  });
  const { data: myInsurances = [] } = useMyInsurances();

  // Mutation hooks
  const addInsurance = useAddInsurance();
  const removeInsurance = useRemoveInsurance();

  // Estado de carga global (cualquier mutación en progreso)
  const isSubmitting = addInsurance.isPending || removeInsurance.isPending;

  // Actualizar el store cuando cambian los seguros
  useEffect(() => {
    if (myInsurances.length > 0) {
      setPatientInsurance({
        ...patientInsurance,
        insuranceProvider: myInsurances.map((i) => i.id.toString()),
      });
    }
  }, [myInsurances]);

  const handleSubmit = () => {
    console.log("Insurance data submitted:");
  };

  async function handleAddInsurance(selectedTypeId: number) {
    if (!selectedInsuranceId) {
      toast.error(
        t(
          "insurance.selectInsuranceFirst",
          "Por favor selecciona un seguro primero",
        ),
      );
      return;
    }

    // Validar límite de 3 seguros
    if (myInsurances.length >= 3) {
      toast.error(
        t("insurance.maxLimit", "Solo puedes tener un máximo de 3 seguros"),
      );
      return;
    }

    await addInsurance.mutateAsync({
      idSeguro: selectedInsuranceId,
      idTipoSeguro: selectedTypeId,
    });

    // Resetear selección después de agregar
    setSelectedInsuranceId(null);

    // Notificar al componente padre que los seguros cambiaron
    onInsurancesChanged?.();
  }

  async function handleRemoveInsurance(id: number) {
    await removeInsurance.mutateAsync(id);

    // Notificar al componente padre que los seguros cambiaron
    onInsurancesChanged?.();
  }

  return (
    <MCFormWrapper
      schema={patientInsuranceSchema(t)}
      onSubmit={handleSubmit}
      className={`${isMobile ? "max-w-full" : "max-w-xl"} mx-auto ${
        isMobile ? "p-0" : "p-4"
      } flex flex-col gap-6`}
    >
      <div
        className={`border rounded-xl bg-accent/40 ${
          isMobile ? "p-3" : "p-4"
        } flex flex-col gap-1`}
      >
        <div
          className={`flex items-center gap-2 text-primary font-semibold ${
            isMobile ? "text-base" : "text-lg"
          }`}
        >
          <Shield className={isMobile ? "text-base" : "text-xl"} />
          {t("insurance.title")}
        </div>
        <div className={`text-primary ${isMobile ? "text-sm" : "text-base"}`}>
          {t("insurance.description")}
        </div>
      </div>
      <div>
        <h2
          className={`${
            isMobile ? "text-xl" : "text-2xl"
          } font-semibold text-primary mb-2`}
        >
          {t("insurance.list")}
        </h2>
        <div
          className={`border-2 border-dotted border-primary rounded-xl ${
            isMobile ? "p-3" : "p-4"
          } mb-2 min-h-[60px]`}
        >
          {isLoadingInsurances ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div
              className={`flex flex-wrap ${isMobile ? "gap-1.5" : "gap-2"} mb-3`}
            >
              {myInsurances.map((insurance) => {
                const tipoSeguroNombre =
                  typeof insurance.tipoSeguro === "object" &&
                  insurance.tipoSeguro !== null
                    ? insurance.tipoSeguro.nombre
                    : insurance.tipoSeguro;

                return (
                  <span
                    key={insurance.id}
                    className={`flex items-center gap-2 ${
                      isMobile ? "px-3 py-0.5" : "px-4 py-1"
                    } bg-accent/40 text-primary rounded-full ${
                      isMobile ? "text-sm" : "text-base"
                    } font-medium`}
                  >
                    <span className="flex items-center gap-1">
                      <Shield
                        className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mb-0.5`}
                      />
                      {insurance.nombre}
                      {tipoSeguroNombre && (
                        <span className="text-xs opacity-70">
                          ({tipoSeguroNombre})
                        </span>
                      )}
                    </span>
                    <MCButton
                      size="s"
                      onClick={() => handleRemoveInsurance(insurance.id)}
                      className="ml-1 rounded-full p-0.5 bg-transparent hover:bg-accent/70"
                      aria-label={t("insurance.remove")}
                      disabled={isSubmitting}
                    >
                      <X size={isMobile ? 16 : 18} className="text-primary" />
                    </MCButton>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Seguro */}
        <div
          className={`mb-1 ${
            isMobile ? "text-base" : "text-lg"
          } font-medium text-primary`}
        >
          {t("insurance.add")}
        </div>
        <MCSelect
          key={`insurance-${myInsurances.length}`}
          name="insurance"
          className="mb-4"
          searchable={true}
          placeholder={t("insurance.select", "Selecciona un seguro")}
          options={availableInsurances
            .filter(
              (insurance) => !myInsurances.some((i) => i.id === insurance.id),
            )
            .map((insurance) => ({
              value: insurance.id.toString(),
              label: insurance.nombre,
            }))}
          disabled={
            isLoadingInsurances || isSubmitting || myInsurances.length >= 3
          }
          onChange={(value) => {
            if (typeof value === "string") {
              setSelectedInsuranceId(parseInt(value));
            }
          }}
        />

        {/* Tipo de seguro */}
        <div
          className={`mb-1 ${
            isMobile ? "text-base" : "text-lg"
          } font-medium text-primary`}
        >
          {t("insurance.selectType", "Selecciona el tipo de seguro")}
        </div>
        <MCSelect
          key={`type-${selectedInsuranceId ?? "none"}-${myInsurances.length}`}
          name="insuranceType"
          className="mb-4"
          placeholder={t("insurance.typePlaceholder", "Tipo de seguro")}
          options={availableInsuranceTypes.map((type) => ({
            value: type.id.toString(),
            label: type.nombre,
          }))}
          onChange={(value) => {
            if (typeof value === "string") {
              void handleAddInsurance(parseInt(value));
            }
          }}
          disabled={
            isLoadingInsurances ||
            isLoadingInsuranceTypes ||
            isSubmitting ||
            myInsurances.length >= 3 ||
            !selectedInsuranceId
          }
        />

        {myInsurances.length >= 3 && (
          <div
            className={`text-orange-500 ${isMobile ? "text-sm" : "text-base"} font-medium`}
          >
            {t(
              "insurance.maxReached",
              "Has alcanzado el límite máximo de 3 seguros",
            )}
          </div>
        )}
      </div>
    </MCFormWrapper>
  );
}

export default Insurance;
