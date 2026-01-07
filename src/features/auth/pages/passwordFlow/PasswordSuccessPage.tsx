import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import SuccessImg from "@/assets/successPassword.png";
import MCButton from "@/shared/components/forms/MCButton";
import { useAppStore } from "@/stores/useAppStore";

function PasswordSuccessPage() {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const canAccessPage = useAppStore((state) => state.canAccessPage);
  const allowedPages = useAppStore((state) => state.allowedPages);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const hasValidAccess =
      canAccessPage && allowedPages.includes("/auth/password-success");

    if (!hasValidAccess) {
      navigate("/auth/forgot-password", { replace: true });
    } else {
      setHasAccess(true);
    }
  }, [canAccessPage, allowedPages, navigate]);

  const handleclick = () => {
    navigate("/login", { replace: true });
  };

  if (!hasAccess) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <img
        src={SuccessImg}
        alt={t("passwordSuccess.imgAlt")}
        className="w-90 h-90 mb-8 pointer-events-none"
      />
      <h2 className="text-3xl font-semibold mb-4">
        {t("passwordSuccess.title")}
      </h2>
      <MCButton className="mt-6" onClick={handleclick}>
        {t("passwordSuccess.continue")}
      </MCButton>
    </div>
  );
}

export default PasswordSuccessPage;
