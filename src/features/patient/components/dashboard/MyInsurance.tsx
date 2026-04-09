import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations/commonAnimations";
import MCButton from "@/shared/components/forms/MCButton";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import MCSheetProfile from "@/shared/navigation/userMenu/editProfile/MCSheetProfile";
import { useTranslation } from "react-i18next";
import { patientService } from "@/shared/navigation/userMenu/editProfile/patient/services/patient.service";
import type { Seguro } from "@/shared/navigation/userMenu/editProfile/patient/services/patient.types";
import { onInsuranceChanged, emitInsuranceChanged } from "@/lib/events/insuranceEvents";

function MyInsurance() {
  const [openSheet, setOpenSheet] = useState(false);
  const isMobile = useIsMobile();
  const { t, i18n } = useTranslation("patient");
  
  // Estados para seguros reales
  const [myInsurances, setMyInsurances] = useState<Seguro[]>([]);
  const [isLoadingInsurances, setIsLoadingInsurances] = useState(true);
  
  // Cargar seguros del usuario
  const loadInsurances = useCallback(async () => {
    try {
      setIsLoadingInsurances(true);
      const response = await patientService.getMyInsurances(i18n.language);
      
      if (response.success) {
        const transformedInsurances: Seguro[] = response.data.map(item => ({
          id: item.seguro.id,
          nombre: item.seguro.nombre,
          descripcion: item.seguro.descripcion,
          idTipoSeguro: item.tipoSeguro.id,
          tipoSeguro: item.tipoSeguro,
        }));
        
        setMyInsurances(transformedInsurances);
      }
    } catch (error) {
      console.error("Error al cargar seguros en MyInsurance:", error);
    } finally {
      setIsLoadingInsurances(false);
    }
  }, [i18n.language]);
  
  useEffect(() => {
    loadInsurances();
  }, [loadInsurances]);
  
  // Escuchar evento global de cambios en seguros
  useEffect(() => {
    const unsubscribe = onInsuranceChanged(() => {
      loadInsurances();
    });
    
    return unsubscribe;
  }, [loadInsurances]);
  
  // Callback para cuando se modifiquen los seguros localmente
  const handleInsurancesChanged = useCallback(() => {
    loadInsurances();
    // Emitir evento para notificar a otros componentes
    emitInsuranceChanged();
  }, [loadInsurances]);

  // Ajusta el número de items para activar el scroll según el tamaño de pantalla
  const scrollLimit = isMobile ? 3 : 5;
  const scrollable = myInsurances.length > scrollLimit;

  return (
    <motion.div
      {...fadeInUp}
      className="w-full h-full flex flex-col p-2 lg:p-6"
    >
      <h2
        className={`mb-6 ${
          isMobile ? "text-lg" : "text-3xl"
        } font-semibold text-foreground`}
      >
        {t("insurance.title")}
      </h2>
      <div
        className={`space-y-6 mb-8 flex-1 ${
          scrollable ? "overflow-y-auto" : ""
        }`}
        style={scrollable ? { maxHeight: "22rem" } : {}}
      >
        {isLoadingInsurances ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("insurance.loading", "Cargando seguros...")}
          </div>
        ) : myInsurances.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {t("insurance.noInsurances", "No tienes seguros agregados")}
          </div>
        ) : (
          myInsurances.map((insurance) => {
            const tipoSeguroNombre = typeof insurance.tipoSeguro === 'object' && insurance.tipoSeguro !== null
              ? insurance.tipoSeguro.nombre
              : insurance.tipoSeguro;
            
            return (
              <div
                key={insurance.id}
                className="flex items-center gap-4 border-b border-b-primary/10 last:border-b-0 pb-6 last:pb-0"
              >
                <div className="h-16 w-20 flex items-center justify-center rounded-lg bg-background border-2 border-primary/10 text-foreground font-bold text-xl">
                  {insurance.nombre.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xl text-foreground">{insurance.nombre}</span>
                  {tipoSeguroNombre && (
                    <span className="text-sm text-muted-foreground">{tipoSeguroNombre}</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      <MCButton
        className="w-full rounded-full text-lg bg-primary text-background mt-auto"
        onClick={() => setOpenSheet(true)}
      >
        {t("insurance.add")}
      </MCButton>
      <MCSheetProfile
        open={openSheet}
        onOpenChange={setOpenSheet}
        whatTab="insurance"
        onInsurancesChanged={handleInsurancesChanged}
      />
    </motion.div>
  );
}

export default MyInsurance;
