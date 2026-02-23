import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { MCModalBase } from "@/shared/components/MCModalBase";
import { ToggleGroup, ToggleGroupItem } from "@/shared/ui/toggle-group";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

function AuthHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const email = useAppStore((state) => state.forgotPassword?.email);
  const otp = useAppStore((state) => state.otp);
  const selectedRole = useAppStore((state) => state.selectedRole);
  const hasProgress = email || otp || selectedRole;
  const setLanguage = useGlobalUIStore((state) => state.setLanguage);
  const currentLanguage = useGlobalUIStore((state) => state.language);

  const handleConfirmCancel = () => {
    navigate("/login", { replace: true });
  };

  const handleDirectBack = () => {
    navigate("/login");
  };

  // Solo el contenido del botón, sin el button tag
  const backButtonContent = (
    <div className="group flex items-center gap-2 text-white transition-all duration-150 hover:opacity-80 active:scale-95 cursor-pointer">
      <ArrowLeft className="text-white transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-110" />
      <span className="font-medium text-lg">{t("header.back")}</span>
    </div>
  );

  return (
    <>
      <div className="bg-primary py-4 px-6">
        <div className="flex items-center justify-between">
          {hasProgress ? (
            <MCModalBase
              id="cancel-process-modal"
              trigger={backButtonContent}
              title={t("header.cancelTitle")}
              variant="warning"
              size="sm"
              onConfirm={handleConfirmCancel}
              confirmText={t("header.confirmCancel")}
              secondaryText={t("header.continue")}
            >
              <div className="flex flex-col">
                <p className="text-primary text-justify">
                  {t("header.cancelWarning")}
                </p>
              </div>
            </MCModalBase>
          ) : (
            <button
              onClick={handleDirectBack}
              className="group flex items-center gap-2 text-white transition-all duration-150 hover:opacity-80 active:scale-95"
              type="button"
            >
              <ArrowLeft className="text-white transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-110" />
              <span className="font-medium text-lg">{t("header.back")}</span>
            </button>
          )}

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <img
              src="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637881/MediConnectLanding_ryopcw.png"
              alt="MediConnect Logo"
              className="h-20 object-contain pointer-events-none"
            />
          </div>

          {/* Right: Toggle de idiomas */}
          <div>
            <ToggleGroup
              type="single"
              value={currentLanguage}
              onValueChange={setLanguage}
              aria-label="Language selector"
            >
              <ToggleGroupItem
                value="en"
                aria-label="English"
                className={currentLanguage !== "en" ? "opacity-70" : ""}
              >
                <img
                  src="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637851/flag-usa_ubewc7.png"
                  alt="English"
                  className="w-6 h-6"
                />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="es"
                aria-label="Español"
                className={currentLanguage !== "es" ? "opacity-70" : ""}
              >
                <img
                  src="https://res.cloudinary.com/dy2wtanhl/image/upload/v1771637850/flag-spain_u9cses.png"
                  alt="Español"
                  className="w-6 h-6"
                />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </>
  );
}

export default AuthHeader;
