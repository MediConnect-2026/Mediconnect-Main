import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useCreateServicesStore } from "@/stores/useCreateServicesStore";
import { serviceSchema } from "@/schema/createService.schema";
import ServicesLayoutsSteps from "./ServicesLayoutsSteps";
import { useTranslation } from "react-i18next";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import DescriptionModal from "./Modals/DescriptionModal";
import CounterModal from "./Modals/CounterModal";
import PriceModal from "./Modals/PriceModal";
import DurationModal from "./Modals/DurationModal";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCInput from "@/shared/components/forms/MCInput";
import { useEffect } from "react";
function ServiceBasicInfoStep() {
  const { t } = useTranslation();
  const basicInfoSchema = serviceSchema(t).pick({
    specialty: true,
    selectedModality: true,
    pricePerSession: true,
    description: true,
    numberOfSessions: true,
    duration: true,
  });

  const createServiceData = useCreateServicesStore((s) => s.createServiceData);

  const handleSubmit = (data: any) => {
    console.log("Datos del formulario:", data);
  };

  const modalityOptions = [
    { value: "presencial", label: t("modality.presencial") },
    { value: "teleconsulta", label: t("modality.teleconsulta") },
    { value: "Mixta", label: t("modality.mixed") },
  ];

  const specialtyOptions = [
    { value: "cardiologia", label: t("specialty.cardiology") },
    { value: "pediatria", label: t("specialty.pediatrics") },
  ];

  // Función para formatear la duración SOLO para display visual
  const formatDurationDisplay = (duration: any) => {
    if (!duration) return "0m";
    // Si es objeto { hours, minutes }
    if (typeof duration === "object" && duration !== null) {
      const h = parseInt(duration.hours, 10) || 0;
      const m = parseInt(duration.minutes, 10) || 0;
      if (h === 0) return `${m}m`;
      return `${h}h : ${m}m`;
    }
    // Si es string "HH:mm" o "HH:mm:ss"
    if (typeof duration === "string") {
      const [hours, minutes] = duration.split(":");
      const h = parseInt(hours, 10) || 0;
      const m = parseInt(minutes, 10) || 0;
      if (h === 0) return `${m}m`;
      return `${h}h : ${m}m`;
    }
    return "0m";
  };

  useEffect(() => {
    console.log("Datos actuales del servicio:", createServiceData);
  }, [createServiceData]);

  return (
    <ServicesLayoutsSteps title="Ponle un título a tu servicio">
      <MCFormWrapper
        schema={basicInfoSchema}
        defaultValues={{
          specialty: createServiceData.specialty || "",
          selectedModality: createServiceData.selectedModality || "presencial",
          pricePerSession: createServiceData.pricePerSession,
          description: createServiceData.description || "",
          numberOfSessions: createServiceData.numberOfSessions,
          duration: createServiceData.duration || { hours: 0, minutes: 30 },
        }}
        onSubmit={handleSubmit}
        className="w-full"
      >
        <div className="space-y-4 mb-6">
          <MCSelect
            name="specialty"
            label={t("form.specialty")}
            options={specialtyOptions}
            placeholder={t("form.selectSpecialty")}
          />
          <MCSelect
            name="selectedModality"
            label={t("form.modality")}
            options={modalityOptions}
            placeholder={t("form.selectModality")}
          />
          <DescriptionModal>
            <MCInput
              name="description"
              label={t("form.description")}
              placeholder={t("form.serviceDescription")}
              variant="internal-vertical"
              internalTitle={t("form.optional")}
              internalPlaceholder={t("form.descriptionPlaceholder")}
            />
          </DescriptionModal>
          <CounterModal>
            <MCInput
              name="numberOfSessions"
              label={t("form.numberOfSessions")}
              type="number"
              className="my-input"
              variant="internal-horizontal"
              internalTitle={t("form.sessions")}
              internalPlaceholder={t("form.numberOfSessionsPlaceholder")}
              value={createServiceData.numberOfSessions} // Asegúrate de que este valor se actualice correctamente desde el store
              displayMode="value"
              standalone
            />{" "}
          </CounterModal>
          <DurationModal>
            <MCInput
              name="duration"
              label={t("form.durationHours")}
              variant="internal-horizontal"
              internalTitle={t("form.hours")}
              internalPlaceholder="0h : 0m"
              value={formatDurationDisplay(createServiceData.duration)}
              displayMode="value"
              standalone
            />
          </DurationModal>
          <PriceModal>
            <MCInput
              name="pricePerSession"
              label={t("form.price")}
              type="number"
              isPrice
              variant="internal-horizontal"
              internalTitle={t("form.pricePerSession")}
              internalPlaceholder={t("form.pricePerSessionPlaceholder")}
              className="my-input"
              value={createServiceData.pricePerSession} // Asegúrate de que este valor se actualice correctamente desde el store
              displayMode="value"
              standalone
            />
          </PriceModal>
        </div>
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

export default ServiceBasicInfoStep;
