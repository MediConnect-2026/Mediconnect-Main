import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { type DoctorBasicInfoSchemaType } from "@/types/OnbordingTypes";
import { DoctorBasicInfoSchema } from "@/schema/OnbordingSchema";
import { useEffect } from "react";

type PersonalIdentificationStep1Props = {
  children?: React.ReactNode;
  onValidationChange?: (isValid: boolean) => void;
  onNext?: () => void;
};

function PersonalIdentificationStep1({
  children,
  onValidationChange,
  onNext,
}: PersonalIdentificationStep1Props) {
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData
  );
  const setDoctorField = useAppStore((state) => state.setDoctorField);

  const genderOptions = [
    { value: "masculino", label: "Masculino" },
    { value: "femenino", label: "Femenino" },
    { value: "otro", label: "Otro" },
  ];

  const nationalityOptions = [
    { value: "dominicana", label: "Dominicana" },
    { value: "estadounidense", label: "Estadounidense" },
    { value: "mexicana", label: "Mexicana" },
    { value: "colombiana", label: "Colombiana" },
    { value: "venezolana", label: "Venezolana" },
    { value: "otra", label: "Otra" },
  ];

  const handleSubmit = (data: DoctorBasicInfoSchemaType) => {
    // Ya no necesitas actualizar el store aquí si usas setDoctorField en los onChange
    onValidationChange?.(true);
    onNext?.();
  };

  useEffect(() => {
    console.log("Doctor Onboarding Data:", doctorOnboardingData);
  }, [doctorOnboardingData]);

  return (
    <div className="w-full ">
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
          Datos personales
        </h1>
        <p className="text-primary/60 text-sm sm:text-base">
          Complete su información personal
        </p>
      </div>

      <MCFormWrapper
        schema={DoctorBasicInfoSchema((t) => t)}
        onSubmit={handleSubmit}
        defaultValues={doctorOnboardingData}
        onValidationChange={onValidationChange}
      >
        <div className="space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCInput
              name="name"
              label="Nombre(s)"
              placeholder="Juan Luis"
              onChange={(e) => setDoctorField?.("name", e.target.value)}
            />
            <MCInput
              name="lastName"
              label="Apellido(s)"
              placeholder="Capellán Aramboles"
              onChange={(e) => setDoctorField?.("lastName", e.target.value)}
            />
          </div>

          {/* Género y Fecha de Nacimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="gender"
              label="Género"
              placeholder="Seleccionar género"
              options={genderOptions}
              onChange={(value) =>
                setDoctorField?.("gender", Array.isArray(value) ? value[0] : value)
              }
            />
            <MCInput
              name="birthDate"
              label="Fecha de Nacimiento"
              type="date"
              placeholder="yyyy-mm-dd"
              onChange={(e) => setDoctorField?.("birthDate", e.target.value)}
            />
          </div>

          {/* Nacionalidad y Número de Identificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="nationality"
              label="Nacionalidad"
              placeholder="Seleccionar nacionalidad"
              options={nationalityOptions}
              onChange={(value) =>
                setDoctorField?.("nationality", Array.isArray(value) ? value[0] : value)
              }
            />
            <MCInput
              name="identityDocument"
              label="Número de Identificación"
              placeholder="000-0000000-0"
              onChange={(e) =>
                setDoctorField?.("identityDocument", e.target.value)
              }
            />
          </div>

          {/* Teléfono móvil */}
          <MCInput
            name="phone"
            label="Teléfono móvil"
            type="tel"
            placeholder="+1 (809) 000-0000"
            onChange={(e) => setDoctorField?.("phone", e.target.value)}
          />
        </div>
        {children}
      </MCFormWrapper>
    </div>
  );
}

export default PersonalIdentificationStep1;
