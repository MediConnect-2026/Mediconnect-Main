import React from "react";
import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";

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

const specialtyOptions = [
  { value: "cardiologia", label: "Cardiología" },
  { value: "medicina-interna", label: "Medicina Interna" },
  { value: "pediatria", label: "Pediatría" },
  { value: "ginecologia", label: "Ginecología" },
];

function DoctorForm() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCInput
          name="firstName"
          label="Nombre(s)"
          placeholder="Ingrese su nombre"
          size="small"
        />
        <MCInput
          name="lastName"
          label="Apellidos"
          placeholder="Ingrese sus apellidos"
          size="small"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="gender"
          label="Género"
          placeholder="Seleccione su género"
          options={genderOptions}
          size="small"
        />
        <MCInput
          name="email"
          label="Email"
          type="email"
          placeholder="ejemplo@correo.com"
          size="small"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="nationality"
          label="Nacionalidad"
          placeholder="Seleccione nacionalidad"
          options={nationalityOptions}
          size="small"
        />
        <MCInput
          name="identificationNumber"
          label="Número de Identificación"
          placeholder="000-0000000-0"
          size="small"
        />
      </div>

      <MCPhoneInput
        name="phone"
        label="Teléfono"
        placeholder="(809) 000-0000"
        size="small"
      />

      <MCInput
        name="address"
        label="Dirección Física"
        placeholder="Ingrese su dirección completa"
        size="small"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="primarySpecialty"
          label="Especialidad Principal"
          placeholder="Seleccione especialidad"
          options={specialtyOptions}
          size="small"
        />
        <MCSelect
          name="secondarySpecialty"
          label="Especialidad Secundaria (Opcional)"
          placeholder="Seleccione especialidad"
          options={specialtyOptions}
          size="small"
        />
      </div>

      <MCInput
        name="medicalLicense"
        label="Exequátur Médico"
        placeholder="EX00000"
        size="small"
      />
    </div>
  );
}

export default DoctorForm;
