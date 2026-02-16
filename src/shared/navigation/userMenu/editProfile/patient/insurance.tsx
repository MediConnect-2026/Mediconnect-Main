import { useState, useEffect } from "react";
import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCSelect from "@/shared/components/forms/MCSelect";
import { X, Shield, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { patientInsuranceSchema } from "@/schema/profile.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { patientService } from "./services/patient.service";
import type { Seguro } from "./services/patient.types";
import { toast } from "sonner";

// Tipos de seguro disponibles (esto podría venir de la API si existe un endpoint)
const INSURANCE_TYPES = [
  { value: 1, label: "Plan Básico de Salud" },
  { value: 2, label: "Subsidiado" },
  { value: 3, label: "Contributivo Subsidiado" },
];

interface InsuranceProps {
  onInsurancesChanged?: () => void;
}

function Insurance({ onInsurancesChanged }: InsuranceProps = {}) {
  const { t, i18n } = useTranslation("patient");
  const isMobile = useIsMobile();

  const setPatientInsurance = useProfileStore(
    (state) => state.setPatientInsurance,
  );

  const patientInsurance = useProfileStore((state) => state.patientInsurance);

  // Estados para las listas de seguros
  const [availableInsurances, setAvailableInsurances] = useState<Seguro[]>([]);
  const [myInsurances, setMyInsurances] = useState<Seguro[]>([]);
  const [selectedInsuranceType, setSelectedInsuranceType] = useState<number | null>(null);

  // Estados de carga
  const [isLoadingInsurances, setIsLoadingInsurances] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInsurancesData();
  }, []);

  // Recargar datos cuando cambie el idioma
  useEffect(() => {
    // Solo recargar si ya se cargaron inicialmente
    if (!isLoadingInsurances) {
      loadInsurancesData();
    }
  }, [i18n.language]);

  async function loadInsurancesData() {
    try {
      setIsLoadingInsurances(true);
      const [availableResponse, myResponse] = await Promise.all([
        patientService.getAvailableInsurances(i18n.language),
        patientService.getMyInsurances(i18n.language),
      ]);

      if (availableResponse.success) {
        setAvailableInsurances(availableResponse.data);
      }

      if (myResponse.success) {
        // Transformar la estructura anidada de la API a objetos Seguro
        const transformedInsurances: Seguro[] = myResponse.data.map(item => ({
          id: item.seguro.id,
          nombre: item.seguro.nombre,
          descripcion: item.seguro.descripcion,
          idTipoSeguro: item.tipoSeguro.id,
          tipoSeguro: item.tipoSeguro,
        }));
        
        setMyInsurances(transformedInsurances);
        
        // Actualizar el store también
        setPatientInsurance({
          ...patientInsurance,
          insuranceProvider: transformedInsurances.map(i => i.id.toString()),
        });
      }
    } catch (error) {
      console.error("Error al cargar seguros:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : t("insurance.errorLoading", "Error al cargar seguros")
      );
    } finally {
      setIsLoadingInsurances(false);
    }
  }

  const handleSubmit = () => {
    console.log("Insurance data submitted:");
  };

  async function handleAddInsurance(value: string) {
    const idSeguro = parseInt(value);
    
    // Validar que se haya seleccionado un tipo de seguro
    if (!selectedInsuranceType) {
      toast.error(t("insurance.selectTypeFirst", "Por favor selecciona el tipo de seguro primero"));
      return;
    }
    
    // Validar límite de 3 seguros
    if (myInsurances.length >= 3) {
      toast.error(t("insurance.maxLimit", "Solo puedes tener un máximo de 3 seguros"));
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await patientService.addInsurance({ 
        idSeguro, 
        idTipoSeguro: selectedInsuranceType 
      });

      if (response.success) {
        // Construir el objeto Seguro a partir de la respuesta
        const newInsurance: Seguro = {
          id: response.data.seguro.id,
          nombre: response.data.seguro.nombre,
          descripcion: response.data.seguro.descripcion,
          idTipoSeguro: response.data.tipoSeguro.id,
          tipoSeguro: response.data.tipoSeguro,
        };
        
        const updatedInsurances = [...myInsurances, newInsurance];
        setMyInsurances(updatedInsurances);
        
        toast.success(
          t("insurance.added", "Seguro agregado exitosamente") || response.message
        );
        
        // Actualizar el store
        setPatientInsurance({
          ...patientInsurance,
          insuranceProvider: updatedInsurances.map(i => i.id.toString()),
        });
        
        // Resetear selección de tipo de seguro
        setSelectedInsuranceType(null);
        
        // Notificar al componente padre que los seguros cambiaron
        onInsurancesChanged?.();
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

  async function handleRemoveInsurance(id: number) {
    try {
      setIsSubmitting(true);
      const response = await patientService.removeInsurance(id);

      if (response.success) {
        setMyInsurances(myInsurances.filter(i => i.id !== id));
        toast.success(
          t("insurance.removed", "Seguro eliminado exitosamente") || response.message
        );
        
        // Actualizar el store
        setPatientInsurance({
          ...patientInsurance,
          insuranceProvider: myInsurances.filter(i => i.id !== id).map(i => i.id.toString()),
        });
        
        // Notificar al componente padre que los seguros cambiaron
        onInsurancesChanged?.();
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
                const tipoSeguroNombre = typeof insurance.tipoSeguro === 'object' && insurance.tipoSeguro !== null
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
                        <span className="text-xs opacity-70">({tipoSeguroNombre})</span>
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
        
        {/* Tipo de seguro */}
        <div
          className={`mb-1 ${
            isMobile ? "text-base" : "text-lg"
          } font-medium text-primary`}
        >
          {t("insurance.selectType", "Selecciona el tipo de seguro")}
        </div>
        <MCSelect
          key={`type-${myInsurances.length}`}
          name="insuranceType"
          className="mb-4"
          placeholder={t("insurance.typePlaceholder", "Tipo de seguro")}
          options={INSURANCE_TYPES.map(type => ({
            value: type.value.toString(),
            label: type.label,
          }))}
          onChange={(value) => {
            if (typeof value === "string") {
              setSelectedInsuranceType(parseInt(value));
            }
          }}
          disabled={isLoadingInsurances || isSubmitting || myInsurances.length >= 3}
        />
        
        {/* Seguro */}
        <div
          className={`mb-1 ${
            isMobile ? "text-base" : "text-lg"
          } font-medium text-primary`}
        >
          {t("insurance.add")}
        </div>
        <MCSelect
          key={myInsurances.length}
          name="insurance"
          className="mb-4"
          searchable={true}
          placeholder={t("insurance.select", "Selecciona un seguro")}
          options={availableInsurances
            .filter((insurance) => !myInsurances.some(i => i.id === insurance.id))
            .map((insurance) => ({
              value: insurance.id.toString(),
              label: insurance.nombre,
            }))}
          disabled={isLoadingInsurances || isSubmitting || myInsurances.length >= 3 || !selectedInsuranceType}
          onChange={(value) => {
            if (typeof value === "string") handleAddInsurance(value);
          }}
        />
        
        {myInsurances.length >= 3 && (
          <div className={`text-orange-500 ${isMobile ? "text-sm" : "text-base"} font-medium`}>
            {t("insurance.maxReached", "Has alcanzado el límite máximo de 3 seguros")}
          </div>
        )}
      </div>
    </MCFormWrapper>
  );
}

export default Insurance;
