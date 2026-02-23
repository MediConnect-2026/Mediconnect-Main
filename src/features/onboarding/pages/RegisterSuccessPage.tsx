import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

import MCButton from "@/shared/components/forms/MCButton";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

function RegisterSuccessPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const canAccessPage = useGlobalUIStore((state) => state.canAccessPage);
  const allowedPages = useGlobalUIStore((state) => state.allowedPages);

  // Buscar el objeto de la página actual para obtener el reason
  const currentPage = allowedPages.find(
    (p) => p.page === "/auth/register-success",
  );
  const reason = currentPage?.reason;

  useEffect(() => {
    const hasValidAccess =
      canAccessPage &&
      allowedPages.some((p) => p.page === "/auth/register-success");

    if (!hasValidAccess) {
      navigate("/auth/register", { replace: true });
    }
  }, [canAccessPage, allowedPages, navigate]);

  const handleclick = () => {
    navigate("/login", { replace: true });
  };

  // Mensaje y título según el reason
  const title =
    reason === "password"
      ? t("RegisterSuccessPage.passwordTitle")
      : t("RegisterSuccessPage.title");
  const message =
    reason === "password"
      ? t("RegisterSuccessPage.passwordMessage")
      : t("RegisterSuccessPage.message");

  const successImgUrl =
    "https://res.cloudinary.com/dy2wtanhl/image/upload/v1771694169/successPassword_gcxlbt.png";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <img
        src={successImgUrl}
        alt={t("passwordSuccess.imgAlt")}
        className="w-90 h-90 mb-8 pointer-events-none"
      />
      <h2 className="text-3xl font-semibold mb-4">{title}</h2>
      <p className="mb-4 text-center">{message}</p>
      <MCButton className="mt-6" onClick={handleclick}>
        {t("RegisterSuccessPage.continue")}
      </MCButton>
    </div>
  );
}

export default RegisterSuccessPage;
