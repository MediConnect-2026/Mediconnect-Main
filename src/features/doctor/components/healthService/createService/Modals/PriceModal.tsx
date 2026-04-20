import MCCounterInput from "@/shared/components/forms/MCCounterInput";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useRef, useState } from "react";

function PriceModal({ children }: { children?: React.ReactNode }) {
  const { t } = useTranslation("doctor");

  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  const submitRef = useRef<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const priceSchema = serviceSchema(t).pick({ pricePerSession: true });

  const handleSubmit = (data: any) => {
    setCreateServiceField("pricePerSession", data.pricePerSession);
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
        title={t("createService.modals.price.title")}
        variant="decide"
        confirmText={t("common.save")}
        onConfirm={handleConfirm}
        secondaryText={t("common.cancel")}
        size="sm"
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
