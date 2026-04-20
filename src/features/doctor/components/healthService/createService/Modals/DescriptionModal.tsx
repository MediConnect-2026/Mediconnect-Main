import { MCDialogBase } from "@/shared/components/MCDialogBase";
import MCAnimatedInput from "@/shared/components/forms/MCAnimatedInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useRef, useState } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface DescriptionModalProps {
  children?: React.ReactNode;
}

function DescriptionModal({ children }: DescriptionModalProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation("doctor");

  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  const [isOpen, setIsOpen] = useState(false);

  const descriptionSchema = serviceSchema(t).pick({ description: true });

  const handleSubmit = (data: any) => {
    setCreateServiceField("description", data.description);
    setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  const submitRef = useRef<(() => void) | null>(null);

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
      <div onClick={handleTriggerClick} className="w-full cursor-pointer">
        {children}
      </div>
      <MCDialogBase
        open={isOpen}
        onOpenChange={setIsOpen}
        title={t("createService.modals.description.title")}
        variant="decide"
        onConfirm={handleConfirm}
        confirmText={t("common.save")}
        secondaryText={t("common.cancel")}
      >
        <div className={`w-full ${isMobile ? "px-2" : ""}`}>
          <MCFormWrapper
            schema={descriptionSchema}
            defaultValues={{
              description: createServiceData.description || "",
            }}
            onSubmit={handleSubmit}
            submitRef={submitRef}
          >
            <MCAnimatedInput
              name="description"
              placeholder={t("createService.modals.description.placeholder")}
              maxLength={250}
              variant="Description"
            />
          </MCFormWrapper>
        </div>
      </MCDialogBase>
    </>
  );
}

export default DescriptionModal;
