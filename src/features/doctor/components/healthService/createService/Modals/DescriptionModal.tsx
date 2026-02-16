import { MCDialogBase } from "@/shared/components/MCDialogBase";
import MCAnimatedInput from "@/shared/components/forms/MCAnimatedInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { useEffect, useRef, useState } from "react";

interface DescriptionModalProps {
  children?: React.ReactNode;
}

function DescriptionModal({ children }: DescriptionModalProps) {
  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log("Descripción actual:", createServiceData.description);
  }, [createServiceData.description]);

  const { t } = useTranslation();
  const descriptionSchema = serviceSchema(t).pick({ description: true });

  const handleSubmit = (data: any) => {
    setCreateServiceField("description", data.description);
    // Cerrar modal después de guardar
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
        title="Descripción del servicio"
        variant="decide"
        onConfirm={handleConfirm}
        confirmText="Guardar"
        secondaryText="Cancelar"
      >
        <div className="w-full">
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
              placeholder="Ingresa tu descripción aquí..."
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
