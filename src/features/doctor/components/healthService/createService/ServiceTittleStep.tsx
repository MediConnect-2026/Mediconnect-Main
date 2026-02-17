import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { serviceSchema } from "@/schema/createService.schema";
import MCAnimatedInput from "@/shared/components/forms/MCAnimatedInput";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useEffect } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

function ServiceTittleStep() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

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
    <ServicesLayoutsSteps title={t("createService.title.title")}>
      <MCFormWrapper
        schema={nameSchema}
        defaultValues={{ name }}
        onSubmit={handleSubmit}
        className={`w-full ${isMobile ? "px-2" : ""}`}
      >
        <MCAnimatedInput
          name="name"
          label={t("createService.title.serviceName")}
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
