import MCCounterInput from "@/shared/components/forms/MCCounterInput";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useRef, useState } from "react";

function PriceModal({ children }: { children?: React.ReactNode }) {
  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  const submitRef = useRef<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const priceSchema = serviceSchema(t).pick({ pricePerSession: true });

  const handleSubmit = (data: any) => {
    console.log("Datos enviados desde modal:", data);
    setCreateServiceField("pricePerSession", data.pricePerSession);
    // Cerrar modal después de guardar
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const handleConfirm = () => {
    submitRef.current?.();
  };

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(true);
  };

  return (
    <>
      <div
        onClick={handleTriggerClick}
        className="w-full h-auto cursor-pointer"
      >
        {children}
      </div>

      <MCDialogBase
        open={isOpen}
        onOpenChange={setIsOpen}
        title={t("form.price")}
        variant="decide"
        confirmText={t("Guardar")}
        onConfirm={handleConfirm}
        secondaryText={t("Cancelar")}
      >
        <MCFormWrapper
          schema={priceSchema}
          defaultValues={{
            pricePerSession:
              typeof createServiceData.pricePerSession === "number"
                ? createServiceData.pricePerSession
                : 1,
          }}
          onSubmit={handleSubmit}
          submitRef={submitRef}
        >
          <MCCounterInput
            name="pricePerSession"
            variant="price"
            min={1}
            step={1}
            defaultValue={
              typeof createServiceData.pricePerSession === "number"
                ? createServiceData.pricePerSession
                : 1
            }
            label={t("form.price")}
          />
        </MCFormWrapper>
      </MCDialogBase>
    </>
  );
}

export default PriceModal;
