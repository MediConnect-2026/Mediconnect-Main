import MCCounterInput from "@/shared/components/forms/MCCounterInput";
import { MCModalBase } from "@/shared/components/MCModalBase";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";

function PriceModal({ children }: { children?: React.ReactNode }) {
  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);

  const { t } = useTranslation();
  const priceSchema = serviceSchema(t).pick({ pricePerSession: true });

  const handleSubmit = (data: any) => {
    setCreateServiceField("pricePerSession", data.pricePerSession);
  };

  return (
    <MCModalBase
      id="price-modal"
      title={t("form.price")}
      trigger={children}
      variant="decide"
      size="smWide"
      confirmText={t("Guardar")}
      onConfirm={() =>
        handleSubmit({ pricePerSession: createServiceData.pricePerSession })
      }
      secondaryText={t("Cancelar")}
      triggerClassName="w-full h-auto"
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
          onChange={(value) => setCreateServiceField("pricePerSession", value)}
          label={t("form.price")}
        />
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default PriceModal;
