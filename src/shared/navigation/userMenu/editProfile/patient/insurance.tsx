import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCSelect from "@/shared/components/forms/MCSelect";
import { X, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { patientInsuranceSchema } from "@/schema/profile.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const INSURANCE_OPTIONS = [
  { value: "segurosAtlas", label: "Seguros Atlas" },
  { value: "axa", label: "AXA" },
  { value: "gnp", label: "GNP" },
  { value: "metlife", label: "MetLife" },
  { value: "miiimi", label: "miiimi" },
  { value: "mamam", label: "mamam" },
  { value: "qualitas", label: "Qualitas" },
];

function Insurance() {
  const { t } = useTranslation("patient");
  const isMobile = useIsMobile();

  const setPatientInsurance = useProfileStore(
    (state) => state.setPatientInsurance,
  );

  const patientInsurance = useProfileStore((state) => state.patientInsurance);

  const insurances = Array.isArray(patientInsurance)
    ? []
    : patientInsurance?.insuranceProvider || [];

  const handleAddInsurance = (value: string) => {
    if (!insurances.includes(value)) {
      setPatientInsurance({
        ...patientInsurance,
        insuranceProvider: [...insurances, value],
      });
    }
  };

  const handleRemoveInsurance = (value: string) => {
    setPatientInsurance({
      ...patientInsurance,
      insuranceProvider: insurances.filter((i) => i !== value),
    });
  };

  const availableInsurances = INSURANCE_OPTIONS.filter(
    (opt) => !insurances.includes(opt.value),
  );

  const handleSubmit = () => {
    console.log("Insurance data submitted:", patientInsurance);
  };

  return (
    <MCFormWrapper
      schema={patientInsuranceSchema(t)}
      onSubmit={handleSubmit}
      className={`${isMobile ? "max-w-full" : "max-w-xl"} mx-auto ${
        isMobile ? "p-0" : "p-4"
      } flex flex-col gap-6`}
    >
      <div
        className={`border rounded-xl bg-accent/40 ${
          isMobile ? "p-3" : "p-4"
        } flex flex-col gap-1`}
      >
        <div
          className={`flex items-center gap-2 text-primary font-semibold ${
            isMobile ? "text-base" : "text-lg"
          }`}
        >
          <Shield className={isMobile ? "text-base" : "text-xl"} />
          {t("insurance.title")}
        </div>
        <div className={`text-primary ${isMobile ? "text-sm" : "text-base"}`}>
          {t("insurance.description")}
        </div>
      </div>
      <div>
        <h2
          className={`${
            isMobile ? "text-xl" : "text-2xl"
          } font-semibold text-primary mb-2`}
        >
          {t("insurance.list")}
        </h2>
        <div
          className={`border-2 border-dotted border-primary rounded-xl ${
            isMobile ? "p-3" : "p-4"
          } mb-2`}
        >
          <div
            className={`flex flex-wrap ${isMobile ? "gap-1.5" : "gap-2"} mb-3`}
          >
            {insurances.map((i) => {
              const label =
                INSURANCE_OPTIONS.find((opt) => opt.value === i)?.label || i;
              return (
                <span
                  key={i}
                  className={`flex items-center gap-2 ${
                    isMobile ? "px-3 py-0.5" : "px-4 py-1"
                  } bg-accent/40 text-primary rounded-full ${
                    isMobile ? "text-sm" : "text-base"
                  } font-medium`}
                >
                  <span className="flex items-center gap-1">
                    <Shield
                      className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mb-0.5`}
                    />
                    {label}
                  </span>
                  <MCButton
                    size="s"
                    onClick={() => handleRemoveInsurance(i)}
                    className="ml-1 rounded-full p-0.5 bg-transparent hover:bg-accent/70"
                    aria-label={t("insurance.remove")}
                  >
                    <X size={isMobile ? 16 : 18} className="text-primary" />
                  </MCButton>
                </span>
              );
            })}
          </div>
        </div>
        <div
          className={`mb-1 ${
            isMobile ? "text-base" : "text-lg"
          } font-medium text-primary`}
        >
          {t("insurance.add")}
        </div>
        <MCSelect
          key={insurances.length}
          name="insurance"
          className="mb-4"
          searchable={true}
          placeholder={t("insurance.select", "Selecciona un seguro")}
          options={availableInsurances}
          disabled={availableInsurances.length === 0}
          onChange={(value) => {
            if (typeof value === "string") handleAddInsurance(value);
          }}
        />
      </div>
    </MCFormWrapper>
  );
}

export default Insurance;
