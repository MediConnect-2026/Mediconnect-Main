import { XIcon } from "@/shared/ui/x-icon";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useTranslation } from "react-i18next";
import { cl } from "@/utils/cloudinary";

const languages = [
  {
    code: "es",
    label: "Español",
    flag: cl(
      "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637850/flag-spain_u9cses.png",
      { width: 64, quality: "auto:good" },
    ),
  },
  {
    code: "en",
    label: "English",
    flag: cl(
      "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637851/flag-usa_ubewc7.png",
      { width: 64, quality: "auto:good" },
    ),
  },
];

type MobileLanguageSelectorProps = {
  isOpen: boolean;
  onClose: () => void;
};

function MobileLanguageSelector({
  isOpen,
  onClose,
}: MobileLanguageSelectorProps) {
  const { t } = useTranslation("landing");
  const language = useGlobalUIStore((state) => state.language);
  const setLanguage = useGlobalUIStore((state) => state.setLanguage);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-70 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-primary">
          {t("navbar.selectLanguage") || "Seleccionar idioma"}
        </h2>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full text-primary hover:bg-primary/10 transition-colors"
          aria-label="Cerrar selector de idioma"
        >
          <XIcon size={24} />
        </button>
      </div>

      {/* Language Options */}
      <div className="p-4 space-y-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 text-left ${
              language === lang.code
                ? "bg-primary/10 border-2 border-primary/30 scale-[1.02]"
                : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 active:bg-gray-200 active:scale-95"
            }`}
          >
            <img
              src={lang.flag}
              alt={lang.label}
              className="w-8 h-8 rounded-full"
            />
            <span
              className={`text-lg font-medium flex-1 ${
                language === lang.code ? "text-primary" : "text-gray-700"
              }`}
            >
              {lang.label}
            </span>
            {language === lang.code && (
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MobileLanguageSelector;
