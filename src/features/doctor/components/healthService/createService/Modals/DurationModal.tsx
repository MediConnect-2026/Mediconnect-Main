import MCCounterInput from "@/shared/components/forms/MCCounterInput";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useRef, useState } from "react";

interface DurationModalProps {
  children?: React.ReactNode;
}

function DurationModal({ children }: DurationModalProps) {
  const { t } = useTranslation("doctor");

  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  const submitRef = useRef<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const durationSchema = serviceSchema(t).pick({ duration: true });

  const handleSubmit = (data: any) => {
    setCreateServiceField("duration", data.duration);
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
        title={t("createService.modals.duration.title")}
        variant="decide"
        size="sm"
        confirmText={t("common.save")}
        onConfirm={handleConfirm}
        secondaryText={t("common.cancel")}
      >
        <MCFormWrapper
          schema={durationSchema}
          defaultValues={{
            duration: createServiceData.duration || { hours: 0, minutes: 30 },
          }}
          onSubmit={handleSubmit}
          submitRef={submitRef}
        >
          <MCCounterInput
            name="duration"
            variant="hours"
            min={0}
            max={120}
            step={10}
            defaultValue={
              createServiceData.duration || { hours: 0, minutes: 30 }
            }
          />
        </MCFormWrapper>
      </MCDialogBase>
    </>
  );
}

export default DurationModal;
