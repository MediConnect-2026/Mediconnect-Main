import React, { useEffect } from "react";
import MCDashboardContent from "@/shared/layout/MCDashboardContent";
import MCInput from "@/shared/components/forms/MCInput";
import MCFormWrapper from "@/shared/components/forms/MCFormWrapper";
import { useProfileStore } from "@/stores/useProfileStore";
import { verifyAccountSchema } from "@/schema/account.schema";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import MCButton from "@/shared/components/forms/MCButton";
import { ArrowRight } from "lucide-react";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";
function VerifyIdentityPage() {
  const navigate = useNavigate();

  const sessionUser = useAppStore((state) => state.user);
  const setVerifyAccountPassword = useProfileStore(
    (state) => state.setVerifyAccountPassword,
  );
  const UserVerifying = useProfileStore((state) => state.verifyAccountPassword);

  const setToast = useGlobalUIStore((state) => state.setToast);
  const toast = useGlobalUIStore((state) => state.toast);

  useEffect(() => {
    console.log(toast);
  }, [toast]);

  const handleSubmitSuccess = () => {
    setToast({
      type: "error",
      message: "Identidad verificada sin implementar lógica real.",
      open: true,
    });
  };

  return (
    <MCDashboardContent mainWidth="max-w-2xl">
      <div className="flex flex-col gap-6 items-center justify-center w-full mb-8">
        <div className="w-full min-w-xl flex flex-col gap-2 justify-center items-center">
          <h1 className="text-5xl font-medium mb-2">Verificar tu identidad</h1>
          <p className="text-muted-foreground text-base max-w-md text-center">
            Por seguridad, necesitamos verificar que eres tú. Ingresa tu
            contraseña actual.
          </p>
          <MCFormWrapper
            schema={verifyAccountSchema}
            onSubmit={handleSubmitSuccess}
            defaultValues={{
              password: UserVerifying?.password || "",
            }}
            className=" w-md mt-4 flex flex-col items-center gap-4 h-full "
          >
            <MCInput
              label="Contraseña"
              type="password"
              name="password"
              placeholder={`Ingresa la contraseña de ${sessionUser?.email}`}
              className="w-full"
            />
            <MCButton
              type="submit"
              className="w-xs"
              icon={<ArrowRight />}
              iconPosition="right"
            >
              Verificar
            </MCButton>
          </MCFormWrapper>
        </div>
      </div>
    </MCDashboardContent>
  );
}

export default VerifyIdentityPage;
