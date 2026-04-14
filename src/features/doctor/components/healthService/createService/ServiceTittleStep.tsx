import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { serviceSchema } from "@/schema/createService.schema";
import MCAnimatedInput from "@/shared/components/forms/MCAnimatedInput";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { useEffect, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
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
  const formRef = useRef<UseFormReturn<any> | null>(null);

  useEffect(() => {
    // If the `name` is populated asynchronously (edit mode), reset the form value so Controller/defaultValue reflects it
    if (formRef.current) {
      formRef.current.reset({ name });
    }
  }, [name]);

  const isButtondisabled = !name || name.trim() === "";

  return (
    <ServicesLayoutsSteps title={t("createService.title.title")}>
      <MCFormWrapper
        schema={nameSchema}
        defaultValues={{ name }}
        formRef={formRef}
        onSubmit={handleSubmit}
        className={`w-full ${isMobile ? "px-2" : ""}`}
      >
        <MCAnimatedInput
          name="name"
          label={t("createService.title.serviceName")}
          value={name}
          onChange={(value) => setName("name", value)}
        />
        <AuthFooterContainer
          backButtonProps={{
            disabled: true,
          }}
          continueButtonProps={{
            type: "submit",
            disabled: isButtondisabled,
          }}
        />
      </MCFormWrapper>
    </ServicesLayoutsSteps>
  );
}

export default ServiceTittleStep;
