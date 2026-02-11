import { useTranslation } from "react-i18next";
import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";
import MapSelectLocation from "@/shared/components/maps/MapSelectLocation";
import { useFormContext } from "react-hook-form";

function CenterForm() {
  const { t } = useTranslation("common");
  const { setValue, watch } = useFormContext();
  const coordinates = watch("coordinates");

  const centerTypeOptions = [
    { value: "Hospital", label: t("verification.forms.centerTypes.hospital") },
    { value: "Clínica", label: t("verification.forms.centerTypes.clinic") },
    { value: "Consultorio", label: t("verification.forms.centerTypes.office") },
    {
      value: "Centro Diagnóstico",
      label: t("verification.forms.centerTypes.diagnostic"),
    },
  ];

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
        label={t("verification.forms.centerName")}
        placeholder={t("verification.forms.centerNamePlaceholder")}
        size="small"
      />
      <MCInput
        name="description"
        label={t("verification.forms.description")}
        placeholder={t("verification.forms.descriptionPlaceholder")}
        size="small"
      />
      <MCInput
        name="website"
        label={t("verification.forms.website")}
        placeholder={t("verification.forms.websitePlaceholder")}
        size="small"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCInput
          name="rnc"
          label={t("verification.forms.rnc")}
          placeholder={t("verification.forms.rncPlaceholder")}
          size="small"
          variant="cedula"
        />
        <MCSelect
          name="centerType"
          label={t("verification.forms.centerType")}
          placeholder={t("verification.forms.centerTypePlaceholder")}
          options={centerTypeOptions}
          size="small"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCPhoneInput
          name="phone"
          label={t("verification.forms.phone")}
          placeholder={t("verification.forms.phonePlaceholder")}
          size="small"
        />
        <MCInput
          name="email"
          label={t("verification.forms.email")}
          type="email"
          placeholder={t("verification.forms.emailPlaceholder")}
          size="small"
        />
      </div>

      <div className="space-y-4">
        <label className="block text-sm sm:text-base font-medium text-primary">
          {t("verification.forms.selectLocation")}
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
        label={t("verification.forms.address")}
        placeholder={t("verification.forms.addressPlaceholder")}
        size="small"
        disabled
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCInput
          name="province"
          label={t("verification.forms.province")}
          placeholder={t("verification.forms.provincePlaceholder")}
          size="small"
          disabled
        />
        <MCInput
          name="municipality"
          label={t("verification.forms.municipality")}
          placeholder={t("verification.forms.municipalityPlaceholder")}
          size="small"
          disabled
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 hidden">
        <MCInput
          name="coordinates.latitude"
          label={t("verification.forms.latitude")}
          type="number"
          placeholder={t("verification.forms.provincePlaceholder")}
          size="small"
          disabled
        />
        <MCInput
          name="coordinates.longitude"
          label={t("verification.forms.longitude")}
          type="number"
          placeholder={t("verification.forms.provincePlaceholder")}
          size="small"
          disabled
        />
      </div>
    </div>
  );
}

export default CenterForm;
