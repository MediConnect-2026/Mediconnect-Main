import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoWhite from "@/assets/MediConnectLanding.png";
import { useTranslation } from "react-i18next";
import { useAppStore } from "@/stores/useAppStore";
import { MCModalBase } from "@/shared/components/MCModalBase";

function AuthHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation("auth");
  const email = useAppStore((state) => state.forgotPassword?.email);
  const otp = useAppStore((state) => state.otp);
  const selectedRole = useAppStore((state) => state.selectedRole);
  const hasProgress = email || otp || selectedRole;

  const handleConfirmCancel = () => {
    navigate("/login", { replace: true });
  };

  const handleDirectBack = () => {
    navigate("/login");
  };

  // Solo el contenido del botón, sin el button tag
  const backButtonContent = (
    <>
      <ArrowLeft className="text-white transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-110" />
      <span className="font-medium text-lg">{t("header.back")}</span>
    </>
  );

  return (
    <>
      <div className="bg-primary py-4 px-6">
        <div className="flex items-center justify-between">
          {hasProgress ? (
            <MCModalBase
              id="cancel-process-modal"
              trigger={backButtonContent}
              title="¿Deseas cancelar el proceso?"
              variant="warning"
              onConfirm={handleConfirmCancel}
              confirmText="Sí, cancelar"
              secondaryText="Continuar"
            >
              <div>
                <p className="text-gray-600 mb-4">
                  Si sales ahora, perderás el progreso de recuperación de
                  contraseña y el código de verificación enviado será eliminado.
                </p>
                <p className="text-gray-600">
                  Tendrás que iniciar el proceso nuevamente.
                </p>
              </div>
            </MCModalBase>
          ) : (
            <button
              className="group flex items-center gap-2 text-white transition-all duration-150 hover:opacity-80 active:scale-95"
              onClick={handleDirectBack}
              type="button"
            >
              <ArrowLeft className="text-white transition-transform duration-200 group-hover:-translate-x-1 group-hover:scale-110" />
              <span className="font-medium text-lg">{t("header.back")}</span>
            </button>
          )}

          {/* Center: Logo */}
          <div className="flex-1 flex justify-center">
            <img
              src={LogoWhite}
              alt="MediConnect Logo"
              className="h-20 object-contain pointer-events-none"
            />
          </div>

          {/* Right: Empty for spacing */}
          <div className="w-20"></div>
        </div>
      </div>
    </>
  );
}

export default AuthHeader;
