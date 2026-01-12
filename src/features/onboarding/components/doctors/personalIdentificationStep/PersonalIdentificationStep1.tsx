import React from "react";
import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useAppStore } from "@/stores/useAppStore";
import { type DoctorBasicInfoSchemaType } from "@/types/OnbordingTypes";
import { DoctorBasicInfoSchema } from "@/schema/OnbordingSchema";
import AuthFooterContainer from "@/features/auth/components/AuthFooterContainer";
import { Button } from "@/shared/ui/button";

function PersonalIdentificationStep1() {
  const doctorOnboardingData = useAppStore(
    (state) => state.doctorOnboardingData
  );
  const setDoctorOnboardingData = useAppStore(
    (state) => state.setDoctorOnboardingData
  );

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
    if (setDoctorOnboardingData && doctorOnboardingData) {
      setDoctorOnboardingData({
        ...doctorOnboardingData,
        name: data.name,
        lastName: data.lastName,
        gender: data.gender,
        birthDate: data.birthDate,
        nationality: data.nationality,
        identityDocument: data.identityDocument,
        phone: data.phone,
      });
    }
    // Navegar al siguiente paso
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8">
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
      >
        <div className="space-y-4">
          {/* Nombre y Apellido */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCInput
              name="firstName"
              label="Nombre(s)"
              placeholder="Juan Luis"
              required
            />
            <MCInput
              name="lastName"
              label="Apellido(s)"
              placeholder="Capellán Aramboles"
              required
            />
          </div>

          {/* Género y Fecha de Nacimiento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="gender"
              label="Género"
              placeholder="Seleccionar género"
              options={genderOptions}
              required
            />
            <MCInput
              name="birthDate"
              label="Fecha de Nacimiento"
              type="date"
              placeholder="dd/mm/aaaa"
              required
            />
          </div>

          {/* Nacionalidad y Número de Identificación */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MCSelect
              name="nationality"
              label="Nacionalidad"
              placeholder="Seleccionar nacionalidad"
              options={nationalityOptions}
              required
            />
            <MCInput
              name="identificationNumber"
              label="Número de Identificación"
              placeholder="000-0000000-0"
              required
            />
          </div>

          {/* Teléfono móvil */}
          <MCInput
            name="phoneNumber"
            label="Teléfono móvil"
            type="tel"
            placeholder="+1 (809) 000-0000"
            required
          />
        </div>
      </MCFormWrapper>
    </div>
  );
}

export default PersonalIdentificationStep1;
