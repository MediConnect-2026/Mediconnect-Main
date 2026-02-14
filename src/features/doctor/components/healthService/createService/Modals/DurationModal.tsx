import MCCounterInput from "@/shared/components/forms/MCCounterInput";
import { MCModalBase } from "@/shared/components/MCModalBase";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { serviceSchema } from "@/schema/createService.schema";
import { useTranslation } from "react-i18next";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";

interface DurationModalProps {
  children?: React.ReactNode;
}

function DurationModal({ children }: DurationModalProps) {
  const setCreateServiceField = useCreateServicesStore(
    (s) => s.setCreateServiceField,
  );
  const createServiceData = useCreateServicesStore((s) => s.createServiceData);

  const { t } = useTranslation();
  const durationSchema = serviceSchema(t).pick({ duration: true });

  // Función helper para convertir objeto a string HH:mm:ss
  const objectToTimeString = (duration: any): string => {
    if (typeof duration === "string") return duration;
    if (typeof duration === "object" && duration !== null) {
      const h = duration.hours || 0;
      const m = duration.minutes || 0;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
    }
    return "00:30:00"; // default
  };

  // Función helper para convertir string HH:mm:ss a objeto
  const timeStringToObject = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    return { hours: hours || 0, minutes: minutes || 0 };
  };

  const handleSubmit = (data: any) => {
    console.log("Datos enviados desde modal:", data);
    // Convertir el string del form a objeto para el store
    const durationObject = timeStringToObject(data.duration);
    setCreateServiceField("duration", durationObject);
  };

  return (
    <MCModalBase
      id="duration-modal"
      title="Duración de la sesión"
      trigger={children}
      variant="decide"
      size="smWide"
      confirmText="Guardar"
      onConfirm={() =>
        handleSubmit({
          duration: objectToTimeString(createServiceData.duration),
        })
      }
      secondaryText="Cancelar"
      triggerClassName="w-full h-auto"
    >
      <MCFormWrapper
        schema={durationSchema}
        defaultValues={{
          duration: objectToTimeString(
            createServiceData.duration || { hours: 0, minutes: 30 },
          ),
        }}
        onSubmit={handleSubmit}
      >
        <MCCounterInput
          name="duration"
          variant="hours"
          min={0}
          max={120}
          step={10}
          onChange={(value) => {
            // value viene como string "HH:mm:ss", convertir a objeto
            const durationObject = timeStringToObject(value);
            setCreateServiceField("duration", durationObject);
          }}
          defaultValue={objectToTimeString(
            createServiceData.duration || { hours: 0, minutes: 30 },
          )}
        />
      </MCFormWrapper>
    </MCModalBase>
  );
}

export default DurationModal;
