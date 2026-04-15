import { useState, useEffect } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCSelect from "@/shared/components/forms/MCSelect";
import { X, Shield, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { doctorInsuranceSchema } from "@/schema/profile.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { toast } from "sonner";
import { emitDoctorInsuranceChanged } from "@/lib/events/insuranceEvents";
import { useAvailableInsurances } from "@/features/patient/hooks";
import { useDoctorAvailableInsuranceTypes, useAcceptedInsurances } from "@/features/doctor/hooks";
import { doctorService } from "./services/doctor.service";
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/lib/react-query/config';

function Insurance() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();
  const queryClient = useQueryClient();

  const setDoctorInsurance = useProfileStore(
    (state) => state.setDoctorInsurance
  );
  const doctorInsurance = useProfileStore((state) => state.doctorInsurance);

  // React Query hooks para datos con caché
  const { data: availableInsurances = [], isLoading: isLoadingInsurances } = useAvailableInsurances();
  const [selectedInsuranceId, setSelectedInsuranceId] = useState<number | null>(null);
  const { data: availableInsuranceTypes = [], isLoading: isLoadingInsuranceTypes } = useDoctorAvailableInsuranceTypes({
    insuranceId: selectedInsuranceId ?? undefined,
  });
  const { data: acceptedInsurances = [] } = useAcceptedInsurances();

  // Estado local para UI
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectableInsuranceTypes = availableInsuranceTypes.filter((type) => {
    if (!selectedInsuranceId) {
      return false;
    }

    return !acceptedInsurances.some(
      (acceptedInsurance) =>
        acceptedInsurance.id === selectedInsuranceId && acceptedInsurance.idTipoSeguro === type.id
    );
  });

  // Actualizar el store cuando cambian los seguros aceptados
  useEffect(() => {
    if (acceptedInsurances.length > 0) {
      setDoctorInsurance({
        ...doctorInsurance,
        insuranceProviders: acceptedInsurances.map(i => i.id.toString()),
      });
    }
  }, [acceptedInsurances]);

  const handleSubmit = () => {
    console.log("Insurance data submitted:");
  };

  async function handleAddInsurance(selectedTypeId: number) {
    if (!selectedInsuranceId) {
      toast.error(t("insurance.selectInsuranceFirst", "Por favor selecciona un seguro primero"));
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await doctorService.addAcceptedInsurance({ 
        idSeguro: selectedInsuranceId,
        idTipoSeguro: selectedTypeId,
      });

      if (response.success) {
        // Invalidar el caché para que se recargue la lista
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.ACCEPTED_INSURANCES(),
        });
        
        toast.success(
          t("insurance.added", "Seguro agregado exitosamente") || response.message
        );
        
        // Resetear selección después de agregar
        setSelectedInsuranceId(null);
        
        // Emitir evento de cambio en seguros
        emitDoctorInsuranceChanged();
      }
    } catch (error) {
      console.error("Error al agregar seguro:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("insurance.errorAdding", "Error al agregar seguro")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveInsurance(id: number, tipoSeguroId: number) {
    try {
      setIsSubmitting(true);
      const response = await doctorService.removeAcceptedInsurance(id, tipoSeguroId);

      if (response.success) {
        // Invalidar el caché para que se recargue la lista
        await queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.ACCEPTED_INSURANCES(),
        });
        
        toast.success(
          t("insurance.removed", "Seguro eliminado exitosamente") || response.message
        );
        
        // Emitir evento de cambio en seguros
        console.log("✅ [Insurance] Emitting insurance changed event after REMOVE");
        emitDoctorInsuranceChanged();
      }
    } catch (error) {
      console.error("Error al eliminar seguro:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("insurance.errorRemoving", "Error al eliminar seguro")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MCFormWrapper
      schema={doctorInsuranceSchema(t)}
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
              {acceptedInsurances.map((insurance) => {
                const tipoSeguroNombre = typeof insurance.tipoSeguro === 'object' && insurance.tipoSeguro !== null
                  ? insurance.tipoSeguro.nombre
                  : insurance.tipoSeguro;
                
                const tipoSeguroId = typeof insurance.tipoSeguro === 'object' && insurance.tipoSeguro !== null
                  ? insurance.tipoSeguro.id
                  : insurance.idTipoSeguro || 0;
                
                return (
                  <span
                    key={`${insurance.id}-${tipoSeguroId}`}
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
                        <span className="text-xs opacity-70">({tipoSeguroNombre})</span>
                      )}
                    </span>
                    <MCButton
                      size="s"
                      onClick={() => handleRemoveInsurance(insurance.id, tipoSeguroId)}
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
          key={`insurance-${acceptedInsurances.length}`}
          name="insurance"
          className="mb-4"
          searchable={true}
          placeholder={t("insurance.select", "Selecciona un seguro")}
          options={availableInsurances.map((insurance) => ({
            value: insurance.id.toString(),
            label: insurance.nombre,
          }))}
          onChange={(value) => {
            if (typeof value === "string") {
              setSelectedInsuranceId(parseInt(value));
            }
          }}
          disabled={isLoadingInsurances || isSubmitting}
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
          key={`type-${selectedInsuranceId ?? "none"}-${acceptedInsurances.length}`}
          name="insuranceType"
          className="mb-4"
          placeholder={t("insurance.typePlaceholder", "Tipo de seguro")}
          options={selectableInsuranceTypes.map((type) => ({
            value: type.id.toString(),
            label: type.nombre,
          }))}
          disabled={
            isLoadingInsurances ||
            isLoadingInsuranceTypes ||
            isSubmitting ||
            !selectedInsuranceId
          }
          onChange={(value) => {
            if (typeof value === "string") {
              void handleAddInsurance(parseInt(value));
            }
          }}
        />
      </div>
    </MCFormWrapper>
  );
}

export default Insurance;
