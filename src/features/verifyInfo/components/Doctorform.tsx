import { useTranslation } from "react-i18next";
import MCInput from "@/shared/components/forms/MCInput";
import MCSelect from "@/shared/components/forms/MCSelect";
import MCPhoneInput from "@/shared/components/forms/MCPhoneInput";

function DoctorForm() {
  const { t } = useTranslation("common");

  const genderOptions = [
    { value: "masculino", label: t("verification.forms.genderOptions.male") },
    { value: "femenino", label: t("verification.forms.genderOptions.female") },
    { value: "otro", label: t("verification.forms.genderOptions.other") },
  ];

  const nationalityOptions = [
    {
      value: "dominicana",
      label: t("verification.forms.nationalities.dominican"),
    },
    {
      value: "estadounidense",
      label: t("verification.forms.nationalities.american"),
    },
    { value: "mexicana", label: t("verification.forms.nationalities.mexican") },
    {
      value: "colombiana",
      label: t("verification.forms.nationalities.colombian"),
    },
    {
      value: "venezolana",
      label: t("verification.forms.nationalities.venezuelan"),
    },
    { value: "otra", label: t("verification.forms.nationalities.other") },
  ];

  const specialtyOptions = [
    {
      value: "cardiologia",
      label: t("verification.forms.specialties.cardiology"),
    },
    {
      value: "medicina-interna",
      label: t("verification.forms.specialties.internal_medicine"),
    },
    {
      value: "pediatria",
      label: t("verification.forms.specialties.pediatrics"),
    },
    {
      value: "ginecologia",
      label: t("verification.forms.specialties.gynecology"),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCInput
          name="firstName"
          label={t("verification.forms.firstName")}
          placeholder={t("verification.forms.firstNamePlaceholder")}
          size="small"
        />
        <MCInput
          name="lastName"
          label={t("verification.forms.lastName")}
          placeholder={t("verification.forms.lastNamePlaceholder")}
          size="small"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="gender"
          label={t("verification.forms.gender")}
          placeholder={t("verification.forms.genderPlaceholder")}
          options={genderOptions}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="nationality"
          label={t("verification.forms.nationality")}
          placeholder={t("verification.forms.nationalityPlaceholder")}
          options={nationalityOptions}
          size="small"
        />
        <MCInput
          name="identificationNumber"
          label={t("verification.forms.identificationNumber")}
          placeholder={t("verification.forms.identificationNumberPlaceholder")}
          size="small"
          variant="cedula"
        />
      </div>

      <MCPhoneInput
        name="phone"
        label={t("verification.forms.phone")}
        placeholder={t("verification.forms.phonePlaceholder")}
        size="small"
      />

      <MCInput
        name="address"
        label={t("verification.forms.physicalAddress")}
        placeholder={t("verification.forms.physicalAddressPlaceholder")}
        size="small"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MCSelect
          name="primarySpecialty"
          label={t("verification.forms.primarySpecialty")}
          placeholder={t("verification.forms.primarySpecialtyPlaceholder")}
          options={specialtyOptions}
          size="small"
        />
        <MCSelect
          name="secondarySpecialty"
          label={t("verification.forms.secondarySpecialty")}
          placeholder={t("verification.forms.primarySpecialtyPlaceholder")}
          options={specialtyOptions}
          size="small"
        />
      </div>

      <MCInput
        name="medicalLicense"
        label={t("verification.forms.medicalLicense")}
        placeholder={t("verification.forms.medicalLicensePlaceholder")}
        size="small"
      />
    </div>
  );
}

export default DoctorForm;
