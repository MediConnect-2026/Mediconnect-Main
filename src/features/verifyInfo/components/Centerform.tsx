import React from "react";
import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";

const provinceOptions = [
  { value: "Santo Domingo", label: "Santo Domingo" },
  { value: "Santiago", label: "Santiago" },
  { value: "La Vega", label: "La Vega" },
  { value: "San Pedro de Macorís", label: "San Pedro de Macorís" },
];

const municipalityOptions = [
  { value: "Distrito Nacional", label: "Distrito Nacional" },
  { value: "Santo Domingo Este", label: "Santo Domingo Este" },
  { value: "Santo Domingo Norte", label: "Santo Domingo Norte" },
  { value: "Santo Domingo Oeste", label: "Santo Domingo Oeste" },
];

const centerTypeOptions = [
  { value: "Hospital", label: "Hospital" },
  { value: "Clínica", label: "Clínica" },
  { value: "Consultorio", label: "Consultorio" },
  { value: "Centro Diagnóstico", label: "Centro Diagnóstico" },
];

function CenterForm() {
  return (
    <div className="space-y-4">
      <MCInput
        name="name"
        label="Nombre del Centro"
        placeholder="Ingrese el nombre del centro"
        size="small"
      />

      <MCInput
        name="description"
        label="Descripción"
        placeholder="Describa el centro médico"
        size="small"
      />

      <MCInput
        name="website"
        label="Sitio Web (Opcional)"
        placeholder="https://www.ejemplo.com"
        size="small"
      />

      <MCInput
        name="address"
        label="Dirección"
        placeholder="Ingrese la dirección completa"
        size="small"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="province"
          label="Provincia"
          placeholder="Seleccione provincia"
          options={provinceOptions}
          size="small"
        />
        <MCSelect
          name="municipality"
          label="Municipio"
          placeholder="Seleccione municipio"
          options={municipalityOptions}
          size="small"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCInput name="rnc" label="RNC" placeholder="000000000" size="small" />
        <MCSelect
          name="centerType"
          label="Tipo de Centro"
          placeholder="Seleccione tipo"
          options={centerTypeOptions}
          size="small"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCPhoneInput
          name="phone"
          label="Teléfono"
          placeholder="(809) 000-0000"
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
        <MCInput
          name="coordinates.latitude"
          label="Latitud"
          type="number"
          placeholder="18.4861"
          size="small"
        />
        <MCInput
          name="coordinates.longitude"
          label="Longitud"
          type="number"
          placeholder="-69.9312"
          size="small"
        />
      </div>
    </div>
  );
}

export default CenterForm;
