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
import { useEffect, useRef, useState } from "react";
import { especialidadesService } from "@/features/onboarding/services/especialidades.service";
import { formatCurrency } from "@/utils/formatCurrency";
import type { SelectOption } from "@/features/onboarding/services/especialidades.types";
import i18n from "@/i18n/config";

function ServiceBasicInfoStep() {
  const { t } = useTranslation("doctor");
  const formRef = useRef<any>(null);
  const submitRef = useRef<any>(null);

  const basicInfoSchema = serviceSchema(t).pick({
    specialty: true,
    specialityName: true,
    selectedModality: true,
    pricePerSession: true,
    description: true,
    numberOfSessions: true,
    duration: true,
  });

  const [especialidadesOptions, setEspecialidadesOptions] = useState<SelectOption[]>([]);
  const [loadingEspecialidades, setLoadingEspecialidades] = useState(true);
  const [isFormValid, setIsFormValid] = useState(false);


  const createServiceData = useCreateServicesStore((s) => s.createServiceData);
  const setCreateServiceData = useCreateServicesStore(
    (s) => s.setCreateServiceData,
  );

  const goToNextStep = useCreateServicesStore((s) => s.goToNextStep);
  const goToPreviousStep = useCreateServicesStore((s) => s.goToPreviousStep);


  // Actualizar el formulario cuando cambien los datos del store
  useEffect(() => {
    if (formRef.current) {
      formRef.current.setValue(
        "numberOfSessions",
        createServiceData.numberOfSessions || 1,
      );
      formRef.current.setValue(
        "duration",
        createServiceData.duration || { hours: 0, minutes: 30 },
      );
      formRef.current.setValue(
        "pricePerSession",
        createServiceData.pricePerSession || 1,
      );

      if (createServiceData.description) {
        formRef.current.setValue(
          "description",
          createServiceData.description || "",
        );
      }
      
      formRef.current.setValue(
        "selectedModality",
        createServiceData.selectedModality || "presencial",
      );
      formRef.current.setValue(
        "specialty",
        createServiceData.specialty || "",
        { shouldValidate: true },
      );
      formRef.current.setValue(
        "specialityName",
        createServiceData.specialityName || "",
        { shouldValidate: true },
      );
    }
  }, [
    createServiceData.specialty,
    createServiceData.selectedModality,
    createServiceData.numberOfSessions,
    createServiceData.duration,
    createServiceData.pricePerSession,
    createServiceData.description,
    createServiceData.specialityName,
  ]);

  //Cargar especialidades para el select
  useEffect(() => {
    const fetchEspecialidades = async () => {
      setLoadingEspecialidades(true);
      try {
        const language = i18n.language === "es" ? "es" : i18n.language; // Obtener el idioma actual, por defecto español
        const data = await especialidadesService.getAllActiveEspecialidades(language);
        setEspecialidadesOptions(data);
      } catch (error) {
        console.error("Error fetching especialidades:", error);
        setEspecialidadesOptions([]); // En caso de error, establecer opciones vacías
      } finally {
        setLoadingEspecialidades(false);
      }
    };

    fetchEspecialidades();
  }, [i18n.language]);

  const handleSubmit = (data: any) => {
    const formattedData = {
      ...data,
      specialty: data.specialty,
      selectedModality: data.selectedModality,
      pricePerSession: Number(data.pricePerSession),
      numberOfSessions: Number(data.numberOfSessions),
      duration: {
        hours: Number(data.duration?.hours || 0),
        minutes: Number(data.duration?.minutes || 30),
      },
    };

    setCreateServiceData(formattedData);

    goToNextStep();
  };

  const handleBack = () => {
    goToPreviousStep();
  };

  const handleEspecialidadChange = (option: any | null) => {
    const value = option ? option : "";
    formRef.current.setValue("specialty", value, { shouldValidate: true });
    if(especialidadesOptions.length > 0) {
      const selectedOption = especialidadesOptions.find((opt) => opt.value === value);
      setCreateServiceData({
        ...createServiceData,
        specialty: value,
        specialityName: selectedOption?.label || "",
      });
    } else {
      setCreateServiceData({
        ...createServiceData,
        specialty: value
      });
    }
  };

  const handleModalityChange = (option: any | null) => {
    const value = option ? option : "";
    formRef.current.setValue("selectedModality", value, { shouldValidate: true });
    setCreateServiceData({
      ...createServiceData,
      selectedModality: value,
    });
  };

  const modalityOptions = [
    { value: "presencial", label: t("modality.presencial") },
    { value: "teleconsulta", label: t("modality.teleconsulta") },
    { value: "Mixta", label: t("modality.mixed") },
  ];

  const formatDurationDisplay = (duration: any) => {
    if (!duration) return "0m";
    if (typeof duration === "object" && duration !== null) {
      const h = parseInt(duration.hours, 10) || 0;
      const m = parseInt(duration.minutes, 10) || 0;
      if (h === 0) return `${m}m`;
      return `${h}h : ${m}m`;
    }
    if (typeof duration === "string") {
      const [hours, minutes] = duration.split(":");
      const h = parseInt(hours, 10) || 0;
      const m = parseInt(minutes, 10) || 0;
      if (h === 0) return `${m}m`;
      return `${h}h : ${m}m`;
    }
    return "0m";
  };

  const isButtonDisabled =
  !isFormValid ||
  !createServiceData.specialty?.trim() ||
  !createServiceData.selectedModality?.trim() ||
  !createServiceData.pricePerSession ||
  createServiceData.pricePerSession <= 0;

  return (
    <ServicesLayoutsSteps
      title={t("createService.basicInfo.title")}
      description={t("createService.basicInfo.description")}
    >
      <MCFormWrapper
        formRef={formRef}
        submitRef={submitRef}
        schema={basicInfoSchema}
        defaultValues={{
          specialty: createServiceData.specialty || "",
          selectedModality: createServiceData.selectedModality || "presencial",
          pricePerSession: createServiceData.pricePerSession || 1,
          description: createServiceData.description || "",
          numberOfSessions: createServiceData.numberOfSessions || 1,
          duration: createServiceData.duration || { hours: 0, minutes: 30 },
        }}
        onSubmit={handleSubmit}
        onValidationChange={setIsFormValid}
        className="w-full"
      >
        <div className="space-y-4 mb-6">
          <MCSelect
            name="specialty"
            label={t("form.specialty")}
            options={especialidadesOptions}
            placeholder={t("form.selectSpecialty")}
            onChange={handleEspecialidadChange}
            disabled={loadingEspecialidades}
            searchable={true}
          />
          <MCSelect
            name="selectedModality"
            label={t("form.modality")}
            options={modalityOptions}
            placeholder={t("form.selectModality")}
            onChange={handleModalityChange}
          />
          <DescriptionModal>
            <MCInput
              name="description"
              label={t("form.description")}
              placeholder={t("form.serviceDescription")}
              variant="internal-vertical"
              internalTitle={t("form.serviceDescription")}
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
              displayMode="value"
            />
          </CounterModal>
          <DurationModal>
            <MCInput
              name="duration"
              label={t("form.durationHours")}
              variant="internal-horizontal"
              internalTitle={t("form.hours")}
              internalPlaceholder="0h : 0m"
              displayMode="value"
              customDisplayValue={formatDurationDisplay(
                createServiceData.duration,
              )}
            />
          </DurationModal>
          <PriceModal>
            <MCInput
              name="pricePerSession"
              label={t("form.price")}
              type="number"
              variant="internal-horizontal"
              internalTitle={t("form.pricePerSession")}
              internalPlaceholder={t("form.pricePerSessionPlaceholder")}
              displayMode="value"
              customDisplayValue={formatCurrency(createServiceData.pricePerSession)}
            />
          </PriceModal>
        </div>
        <AuthFooterContainer
          backButtonProps={{
            onClick: handleBack,
          }}
          continueButtonProps={{
            type: "submit",
            disabled: isButtonDisabled,
          }}
        />
      </MCFormWrapper>
    </ServicesLayoutsSteps>
  );
}

export default ServiceBasicInfoStep;
