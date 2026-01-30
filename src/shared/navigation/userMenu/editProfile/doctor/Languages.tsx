import MCButton from "@/shared/components/forms/MCButton";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import MCSelect from "@/shared/components/forms/MCSelect";
import { X, Languages as LanguagesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useProfileStore } from "@/stores/useProfileStore";
import { doctorLanguageSchema } from "@/schema/profile.schema";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

const LANGUAGE_OPTIONS = [
  { value: "es", label: "Español" },
  { value: "en", label: "Inglés" },
  { value: "fr", label: "Francés" },
  { value: "de", label: "Alemán" },
  { value: "it", label: "Italiano" },
  { value: "pt", label: "Portugués" },
];

function LanguagesTab() {
  const { t } = useTranslation("doctor");
  const isMobile = useIsMobile();

  const setDoctorLanguage = useProfileStore((state) => state.setDoctorLanguage);
  const doctorLanguage = useProfileStore((state) => state.doctorLanguage);

  const languages = doctorLanguage?.languages || [];

  const handleAddLanguage = (value: string) => {
    if (!languages.includes(value)) {
      setDoctorLanguage({
        ...doctorLanguage,
        languages: [...languages, value],
      });
    }
  };

  const handleRemoveLanguage = (value: string) => {
    setDoctorLanguage({
      ...doctorLanguage,
      languages: languages.filter((l) => l !== value),
    });
  };

  const availableLanguages = LANGUAGE_OPTIONS.filter(
    (opt) => !languages.includes(opt.value),
  );

  const handleSubmit = () => {
    // Puedes manejar el submit aquí si lo necesitas
  };

  return (
    <MCFormWrapper
      schema={doctorLanguageSchema(t)}
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
          <LanguagesIcon className={isMobile ? "text-base" : "text-xl"} />
          {t("languages.title")}
        </div>
        <div className={`text-primary ${isMobile ? "text-sm" : "text-base"}`}>
          {t("languages.description")}
        </div>
      </div>
      <div>
        <h2
          className={`${
            isMobile ? "text-xl" : "text-2xl"
          } font-semibold text-primary mb-2`}
        >
          {t("languages.list")}
        </h2>
        <div
          className={`border-2 border-dotted border-primary rounded-xl ${
            isMobile ? "p-3" : "p-4"
          } mb-2`}
        >
          <div
            className={`flex flex-wrap ${isMobile ? "gap-1.5" : "gap-2"} mb-3`}
          >
            {languages.map((l) => {
              const label =
                LANGUAGE_OPTIONS.find((opt) => opt.value === l)?.label || l;
              return (
                <span
                  key={l}
                  className={`flex items-center gap-2 ${
                    isMobile ? "px-3 py-0.5" : "px-4 py-1"
                  } bg-accent/40 text-primary rounded-full ${
                    isMobile ? "text-sm" : "text-base"
                  } font-medium`}
                >
                  <span className="flex items-center gap-1">
                    <LanguagesIcon
                      className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mb-0.5`}
                    />
                    {label}
                  </span>
                  <MCButton
                    size="s"
                    onClick={() => handleRemoveLanguage(l)}
                    className="ml-1 rounded-full p-0.5 bg-transparent hover:bg-accent/70"
                    aria-label={t("languages.remove")}
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
          {t("languages.add")}
        </div>
        <MCSelect
          key={languages.length}
          name="language"
          className="mb-4"
          searchable={true}
          placeholder={t("languages.select", "Selecciona un idioma")}
          options={availableLanguages}
          disabled={availableLanguages.length === 0}
          onChange={(value) => {
            if (typeof value === "string") handleAddLanguage(value);
          }}
        />
      </div>
    </MCFormWrapper>
  );
}

export default LanguagesTab;
