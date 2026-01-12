import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { DoctorProfessionalInfoSchema } from "@/schema/OnbordingSchema";
import { useEffect } from "react";

type PersonalIdentificationStep2Props = {
  children?: React.ReactNode;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
};

const specialtyOptions = [
  { value: "medicina_general", label: "Medicina General" },
  { value: "pediatria", label: "Pediatría" },
  { value: "cardiologia", label: "Cardiología" },
  { value: "dermatologia", label: "Dermatología" },
  { value: "ginecologia", label: "Ginecología" },
  { value: "otra", label: "Otra" },
];

function PersonalIdentificationStep2({
  children,
  onValidationChange,
  onNext,
}: PersonalIdentificationStep2Props) {
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData
  );
  const setDoctorField = useAppStore((state) => state.setDoctorField);
  const setOnboardingStep = useAppStore((state) => state.setOnboardingStep);

  const handleSubmit = (data: any) => {
    // El submit ya no necesita actualizar el store aquí si usas setDoctorField en los onChange
    setOnboardingStep(0);
    onValidationChange?.(true);
    onNext?.();
  };

  useEffect(() => {}, [doctorOnboardingData]);

  return (
    <div className="w-full">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          Información profesional
        </h1>
        <p className="text-primary/60 text-sm sm:text-base">
          Complete su información profesional
        </p>
      </div>

      <MCFormWrapper
        schema={DoctorProfessionalInfoSchema((t) => t)}
        onSubmit={handleSubmit}
        defaultValues={doctorOnboardingData}
        onValidationChange={onValidationChange}
      >
        <div className="space-y-4">
          <MCInput
            name="exequatur"
            label="Número de Exequátur"
            placeholder="123456"
            onChange={(e) => setDoctorField?.("exequatur", e.target.value)}
          />
          <MCSelect
            name="mainSpecialty"
            label="Especialidad principal"
            placeholder="Seleccionar especialidad"
            options={specialtyOptions}
            onChange={(value) => {
              if (Array.isArray(value)) {
                setDoctorField?.("mainSpecialty", value[0] ?? "");
              } else {
                setDoctorField?.("mainSpecialty", value);
              }
            }}
          />
          <MCSelect
            name="secondarySpecialties"
            label="Especialidades secundarias"
            placeholder="Seleccionar especialidades"
            options={specialtyOptions}
            multiple
            onChange={(value) => {
              if (Array.isArray(value)) {
                setDoctorField?.("secondarySpecialties", value);
              } else if (typeof value === "string") {
                setDoctorField?.("secondarySpecialties", [value]);
              } else {
                setDoctorField?.("secondarySpecialties", []);
              }
            }}
          />
        </div>
        {children}
      </MCFormWrapper>
    </div>
  );
}

export default PersonalIdentificationStep2;
