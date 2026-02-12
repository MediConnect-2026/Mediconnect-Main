import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { serviceSchema } from "@/schema/createService.schema";
import MCAnimatedInput from "@/shared/components/forms/MCAnimatedInput";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useEffect } from "react";
function ServiceTittleStep() {
  const { t } = useTranslation();
  const nameSchema = serviceSchema(t).pick({ name: true });
  const setName = useCreateServicesStore((s) => s.setCreateServiceField);
  const name = useCreateServicesStore((s) => s.createServiceData.name);
  const setIsTitleSeted = useCreateServicesStore((s) => s.setIsTitleSeted);
  const handleSubmit = (data: { name: string }) => {
    setName("name", data.name);
    setIsTitleSeted(true);
  };

  useEffect(() => {
    console.log(name);
  }, [name]);

  return (
    <ServicesLayoutsSteps title="Ponle un título a tu servicio">
      <MCFormWrapper
        schema={nameSchema}
        defaultValues={{ name }}
        onSubmit={handleSubmit}
        className="w-full"
      >
        <MCAnimatedInput
          name="name"
          label="Nombre del servicio"
          onChange={(value) => setName("name", value)}
        />
        <AuthFooterContainer
          backButtonProps={{
            disabled: true,
          }}
          continueButtonProps={{
            type: "submit",
          }}
        />
      </MCFormWrapper>
    </ServicesLayoutsSteps>
  );
}

export default ServiceTittleStep;
