import { MCModalBase } from "@/shared/components/MCModalBase";
import MCAnimatedInput from "@/shared/components/forms/MCAnimatedInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useEffect } from "react";
interface DescriptionModalProps {
  children?: React.ReactNode;
}

function DescriptionModal({ children }: DescriptionModalProps) {
  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  useEffect(() => {
    console.log("Descripción actual:", createServiceData.description);
  }, [createServiceData.description]);
  const { t } = useTranslation();
  const descriptionSchema = serviceSchema(t).pick({ description: true });

  const handleSubmit = (data: any) => {
    setCreateServiceField("description", data.description);
  };

  return (
    <MCModalBase
      id="description-modal"
      title="Descripción del servicio"
      trigger={children}
      variant="decide"
      onConfirm={() => {
        handleSubmit({ description: createServiceData.description });
      }}
      confirmText="Guardar"
      secondaryText="Cancelar"
      triggerClassName="w-full"
      size="mdAuto"
    >
      <div className="w-full">
        <MCFormWrapper
          schema={descriptionSchema}
          defaultValues={{
            description: createServiceData.description,
          }}
          onSubmit={handleSubmit}
        >
          <MCAnimatedInput
            name="description"
            placeholder="Ingresa tu descripción aquí..."
            maxLength={250}
            onChange={(value) => {
              setCreateServiceField("description", value);
            }}
            variant="Description"
          />{" "}
        </MCFormWrapper>
      </div>
    </MCModalBase>
  );
}

export default DescriptionModal;
