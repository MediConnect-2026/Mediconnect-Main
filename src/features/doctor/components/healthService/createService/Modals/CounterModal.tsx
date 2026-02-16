import MCCounterInput from "@/shared/components/forms/MCCounterInput";
import { MCDialogBase } from "@/shared/components/MCDialogBase";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useRef, useState } from "react";

interface CounterModalProps {
  children?: React.ReactNode;
}

function CounterModal({ children }: CounterModalProps) {
  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  const submitRef = useRef<(() => void) | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const sessionsSchema = serviceSchema(t).pick({ numberOfSessions: true });

  const handleSubmit = (data: any) => {
    console.log("Datos enviados desde modal:", data);
    setCreateServiceField("numberOfSessions", data.numberOfSessions);
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
        title={t("form.numberOfSessions")}
        variant="decide"
        size="sm"
        confirmText="Guardar"
        onConfirm={handleConfirm}
        secondaryText="Cancelar"
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
