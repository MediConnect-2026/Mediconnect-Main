import { ChevronDownIcon } from "../../ui/chevron-down";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
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

type LanguageDropDownProps = {
  showLabel?: boolean;
  buttonBg?: string;
  buttonText?: string;
  borderColor?: string;
  className?: string;
};

function LanguageDropDown({
  showLabel = false,
  buttonBg = "bg-white",
  buttonText = "text-primary",
  borderColor = "border-primary",
  className = "px-3 py-2", // tamaño compacto por defecto
}: LanguageDropDownProps) {
  const language = useGlobalUIStore((state) => state.language);
  const setLanguage = useGlobalUIStore((state) => state.setLanguage);
  const normalizedLanguage = language?.toLowerCase().startsWith("es")
    ? "es"
    : "en";
  const selectedLang =
    languages.find((l) => l.code === normalizedLanguage) ?? languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={`flex ${
            showLabel ? "justify-center" : ""
          } items-center gap-2 rounded-full border transition focus:outline-none
            ${buttonBg} ${buttonText} ${borderColor} ${className}
            hover:-translate-y-0.5 hover:scale-105 hover:opacity-95
            active:scale-97 active:translate-y-0 active:opacity-90
            disabled:opacity-50 disabled:cursor-not-allowed
            motion-safe:transition-transform`}
        >
          <span
            className={`flex items-center gap-2 w-full ${
              showLabel ? "justify-center" : ""
            }`}
          >
            <img
              src={selectedLang?.flag}
              alt={selectedLang?.label}
              className="w-5 h-5 rounded-full focus:outline-none"
            />
            {showLabel && (
              <span className="font-medium text-lg md:text-xl">
                {selectedLang?.label}
              </span>
            )}
          </span>
          <ChevronDownIcon size={20} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel className="font-medium">
          Selecciona idioma
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={normalizedLanguage}
          onValueChange={setLanguage}
        >
          {languages.map((lang) => (
            <DropdownMenuRadioItem
              key={lang.code}
              value={lang.code}
              className={`focus:outline-none focus:ring-0 ${
                language === lang.code ? "text-primary" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                <img
                  src={lang.flag}
                  alt={lang.label}
                  className="w-5 h-5 rounded-full"
                />
                {lang.label}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default LanguageDropDown;
