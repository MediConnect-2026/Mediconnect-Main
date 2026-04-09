import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AuthHeader from "@/features/auth/components/AuthHeader";
import { useAppStore } from "@/stores/useAppStore";
import { useGlobalUIStore } from "@/stores/useGlobalUIStore";

function AuthLayout() {
  const location = useLocation();
  const clearOnboarding = useAppStore((state) => state.clearOnboarding);
  const clearAuthFlow = useAppStore((state) => state.clearAuthFlow);

  const setAccessPage = useGlobalUIStore((state) => state.setAccessPage);

  useEffect(() => {
    return () => {
      const currentPath = window.location.pathname;
      // Rutas del flujo de autenticación que deben preservar el estado
      const authFlowPaths = [
        "/auth",
        "/forgot-password",
        "/verify-email",
        "/reset-password",
        "/password-success",
        "/login"
      ];
      
      const isAuthFlow = authFlowPaths.some(path => currentPath.startsWith(path));
      
      if (!isAuthFlow) {
        clearOnboarding();
        clearAuthFlow();
        setAccessPage(false, [], "Auth flow exited");
      }
    };
  }, [location.pathname, clearAuthFlow, clearOnboarding, setAccessPage]);

  return (
    <div className="min-h-screen flex flex-col">
      <div>
        <AuthHeader />
      </div>
      <div className="h-full flex justify-center items-center pt-15">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
