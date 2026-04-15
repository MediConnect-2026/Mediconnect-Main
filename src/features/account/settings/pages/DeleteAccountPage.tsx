import { useEffect, useState } from "react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCButton from "@/shared/components/forms/MCButton";
import { useNavigate } from "react-router-dom";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useTranslation } from "react-i18next";
import { authService } from "@/services/auth/auth.service";
import { useAppStore } from "@/stores/useAppStore";
import { useProfileStore } from "@/stores/useProfileStore";
import { toast } from "sonner";
import MCInput from "@/shared/components/forms/MCInput";

function DeleteAccountPage() {
  const { t } = useTranslation("common");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const VerificationContext = useGlobalUIStore(
    (state) => state.verificationContext,
  );
  const VerificationContextStatus = useGlobalUIStore(
    (state) => state.verificationContextStatus,
  );
  const logout = useAppStore((state) => state.logout);
  const verifyAccountPassword = useProfileStore(
    (state) => state.verifyAccountPassword,
  );

  const [confirmation, setConfirmation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (
      VerificationContext !== "DELETE_ACCOUNT" ||
      VerificationContextStatus !== "VERIFIED" ||
      !verifyAccountPassword?.password
    ) {
      navigate("/settings");
    }
  }, [VerificationContext, VerificationContextStatus, verifyAccountPassword, navigate]);

  const handleSubmit = async () => {
    // Normalizar y validar que la confirmación sea exacta (español o inglés)
    const normalizedConfirmation = confirmation.trim().toUpperCase();
    
    const isValidConfirmation = 
      normalizedConfirmation === "ELIMINAR CUENTA" || 
      normalizedConfirmation === "DELETE ACCOUNT";
    
    if (!isValidConfirmation) {
      toast.error(
        t(
          "deleteAccount.errors.confirmationInvalid",
          'Debes escribir exactamente "ELIMINAR CUENTA" o "DELETE ACCOUNT" para confirmar'
        )
      );
      return;
    }

    // Verificar que tengamos la contraseña del store
    if (!verifyAccountPassword?.password) {
      toast.error(t("deleteAccount.errors.noPassword", "No se encontró la contraseña validada"));
      navigate("/settings");
      return;
    }

    try {
      setIsSubmitting(true);

      // El API solo acepta "ELIMINAR CUENTA", sin importar el idioma del usuario
      const response = await authService.deleteAccount({
        password: verifyAccountPassword.password,
        confirmacion: "ELIMINAR CUENTA",
      });

      toast.success(
        t("deleteAccount.success", "Cuenta eliminada exitosamente") || response.nota || "Cuenta eliminada exitosamente"
      );

      if (response.nota) {
        toast.info(response.nota, { duration: 5000 });
      }

      // Cerrar sesión y redirigir
      await logout();
      navigate("/login");
    } catch (error: any) {
      console.error("❌ Error al eliminar cuenta:", error);

      // Manejar errores específicos
      const errorData = error.response?.data;
      const status = error.response?.status;

      if (status === 401) {
        toast.error(
          errorData?.error ||
            t("deleteAccount.errors.incorrectPassword", "Contraseña incorrecta")
        );
      } else if (status === 400) {
        const details = errorData?.detalles;
        if (Array.isArray(details)) {
          details.forEach((detail: string) => toast.error(detail));
        } else {
          toast.error(
            errorData?.error ||
              t("deleteAccount.errors.invalidData", "Datos inválidos")
          );
        }
      } else if (status === 403) {
        toast.error(
          errorData?.mensaje ||
            t(
              "deleteAccount.errors.accountInactive",
              "Tu cuenta ya ha sido eliminada o desactivada"
            )
        );
        setTimeout(() => {
          logout();
          navigate("/auth/login");
        }, 2000);
      } else if (status === 404) {
        toast.error(
          t("deleteAccount.errors.userNotFound", "Usuario no encontrado")
        );
        setTimeout(() => {
          logout();
          navigate("/auth/login");
        }, 2000);
      } else {
        toast.error(
          errorData?.error ||
            error.message ||
            t(
              "deleteAccount.errors.generic",
              "Error al eliminar la cuenta. Intenta nuevamente."
            )
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MCDashboardContent mainWidth={isMobile ? "w-full" : "max-w-2xl"}>
      <div
        className={`flex flex-col gap-6 items-center justify-center w-full mb-8 ${isMobile ? "px-4" : "px-0"}`}
      >
        <div
          className={`w-full flex flex-col gap-2 justify-center items-center ${isMobile ? "min-w-0" : "min-w-xl"}`}
        >
          <h1
            className={`font-medium mb-2 text-center text-destructive ${isMobile ? "text-3xl" : "text-5xl"}`}
          >
            {t("deleteAccount.title")}
          </h1>
          <p className="text-base max-w-md text-center text-muted-foreground">
            {t("deleteAccount.description")}
          </p>
          <div className="bg-destructive/10 border border-destructive rounded-3xl p-4 my-2 max-w-md text-sm text-destructive">
            <b>{t("deleteAccount.whatHappens")}</b>
            <ul className="list-disc ml-5 mt-2">
              <li>{t("deleteAccount.consequence1")}</li>
              <li>{t("deleteAccount.consequence2")}</li>
              <li>{t("deleteAccount.consequence3")}</li>
              <li>{t("deleteAccount.consequence4")}</li>
            </ul>
          </div>

          {/* Formulario de eliminación */}
          <div className="w-full max-w-md mt-4">
            <div className="mb-4">
              <label htmlFor="confirmation" className="block text-sm font-medium mb-2">
                {t(
                  "deleteAccount.confirmationLabel",
                  'Escribe "ELIMINAR CUENTA" para confirmar'
                )}
              </label>
              <MCInput
                name="confirmation"
                type="text"
                placeholder={t("deleteAccount.placeholder", "Type DELETE ACCOUNT to confirm")}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                disabled={isSubmitting}
                required
                standalone={true}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t(
                  "deleteAccount.confirmationHint",
                  "Debe ser exactamente: ELIMINAR CUENTA (mayúsculas)"
                )}
              </p>
            </div>
          </div>

          <div
            className={`flex gap-4 mt-6 ${isMobile ? "flex-col w-full" : ""}`}
          >
            <MCButton
              type="button"
              variant="outline"
              className={isMobile ? "w-full" : ""}
              onClick={() => navigate("/settings")}
              disabled={isSubmitting}
            >
              {t("deleteAccount.cancelButton")}
            </MCButton>
            <MCButton
              type="submit"
              variant="delete"
              className={isMobile ? "w-full" : ""}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("deleteAccount.deleting", "Eliminando...")
                : t("deleteAccount.deleteButton")}
            </MCButton>
          </div>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default DeleteAccountPage;
