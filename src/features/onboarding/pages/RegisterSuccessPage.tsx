import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import SuccessImg from "@/assets/successPassword.png";
import MCButton from "@/shared/components/forms/MCButton";
import { useAppStore } from "@/stores/useAppStore";

function RegisterSuccessPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const canAccessPage = useAppStore((state) => state.canAccessPage);
  const allowedPages = useAppStore((state) => state.allowedPages);

  useEffect(() => {
    const hasValidAccess =
      canAccessPage && allowedPages.includes("/auth/register-success");

    if (!hasValidAccess) {
      navigate("/auth/register", { replace: true });
    }
  }, [canAccessPage, allowedPages, navigate]);

  const handleclick = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <img
        src={SuccessImg}
        alt={t("passwordSuccess.imgAlt")}
        className="w-90 h-90 mb-8 pointer-events-none"
      />
      <h2 className="text-3xl font-semibold mb-4">
        {t("RegisterSuccessPage.title")}
      </h2>
      <MCButton className="mt-6" onClick={handleclick}>
        {t("RegisterSuccessPage.continue")}
      </MCButton>
    </div>
  );
}

export default RegisterSuccessPage;
