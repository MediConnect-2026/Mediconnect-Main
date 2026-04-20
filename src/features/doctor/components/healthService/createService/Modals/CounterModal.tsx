import MCCounterInput from "@/shared/components/forms/MCCounterInput";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useRef, useState } from "react";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

interface CounterModalProps {
  children?: React.ReactNode;
}

function CounterModal({ children }: CounterModalProps) {
  const isMobile = useIsMobile();
  const { t } = useTranslation("doctor");

  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  const submitRef = useRef<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const sessionsSchema = serviceSchema(t).pick({ numberOfSessions: true });

  const handleSubmit = (data: any) => {
    setCreateServiceField("numberOfSessions", data.numberOfSessions);
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
        title={t("createService.modals.sessions.title")}
        variant="decide"
        size={isMobile ? "sm" : "sm"}
        confirmText={t("common.save")}
        onConfirm={handleConfirm}
        secondaryText={t("common.cancel")}
      >
        <MCFormWrapper
          schema={sessionsSchema}
          defaultValues={{
            numberOfSessions: createServiceData.numberOfSessions || 1,
          }}
          onSubmit={handleSubmit}
          submitRef={submitRef}
        >
          <MCCounterInput
            name="numberOfSessions"
            variant="participants"
            min={1}
            max={5}
            step={1}
            onChange={(value) =>
              setCreateServiceField("numberOfSessions", value)
            }
            defaultValue={createServiceData.numberOfSessions || 1}
            label={t("form.numberOfSessions")}
          />
        </MCFormWrapper>
      </MCDialogBase>
    </>
  );
}

export default CounterModal;
