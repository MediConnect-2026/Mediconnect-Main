import React from "react";
import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import { useFormContext } from "react-hook-form";

const centerTypeOptions = [
  { value: "Hospital", label: "Hospital" },
  { value: "Clínica", label: "Clínica" },
  { value: "Consultorio", label: "Consultorio" },
  { value: "Centro Diagnóstico", label: "Centro Diagnóstico" },
];

function CenterForm() {
  const { setValue, watch } = useFormContext();
  const coordinates = watch("coordinates");

  const handleLocationChange = (lat: number, lng: number) => {
    setValue("coordinates.latitude", lat);
    setValue("coordinates.longitude", lng);
  };

  const handleLocationDetails = (details: {
    address: string;
    neighborhood: string;
    zipCode: string;
    province?: string;
    municipality?: string;
  }) => {
    setValue("address", details.address);
    if (details.province) {
      setValue("province", details.province);
    }
    if (details.municipality) {
      setValue("municipality", details.municipality);
    }
  };

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
      </div>{" "}
      <div className="space-y-4">
        <label className="block text-base font-medium text-primary">
          Seleccionar Ubicación
        </label>
        <MapSelectLocation
          value={
            coordinates?.latitude && coordinates?.longitude
              ? { lat: coordinates.latitude, lng: coordinates.longitude }
              : undefined
          }
          onChange={handleLocationChange}
          onLocationDetails={handleLocationDetails}
        />
      </div>
      <MCInput
        name="address"
        label="Dirección"
        placeholder="La dirección se completará automáticamente al seleccionar en el mapa"
        size="small"
        disabled
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCInput
          name="province"
          label="Provincia"
          placeholder="Se completará automáticamente"
          size="small"
          disabled
        />
        <MCInput
          name="municipality"
          label="Municipio"
          placeholder="Se completará automáticamente"
          size="small"
          disabled
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 hidden">
        <MCInput
          name="coordinates.latitude"
          label="Latitud"
          type="number"
          placeholder="Se completará automáticamente"
          size="small"
          disabled
        />
        <MCInput
          name="coordinates.longitude"
          label="Longitud"
          type="number"
          placeholder="Se completará automáticamente"
          size="small"
          disabled
        />
      </div>
    </div>
  );
}

export default CenterForm;
