import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores/useAppStore';
import { useGlobalUIStore } from '@/stores/useGlobalUIStore';
import { queryClient } from '@/lib/react-query/config';
import { ROUTES } from '@/router/routes';
import { useTranslation } from 'react-i18next';

/**
 * Hook para logout
 * 
 * Como el backend no tiene endpoint de logout, solo limpia el estado local:
 * - Limpia tokens y usuario del store de autenticación
 * - Limpia el estado de onboarding
 * - Limpia el flujo de autenticación
 * - Limpia el cache de React Query
 * - Redirige al login
 * 
 * @returns Función logoutUser que ejecuta el cierre de sesión
 * 
 * @example
 * ```tsx
 * const logoutUser = useLogout();
 * 
 * const handleLogout = () => {
 *   logoutUser();
 * };
 * ```
 */
export const useLogout = () => {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const logout = useAppStore((state) => state.logout);
  const clearOnboarding = useAppStore((state) => state.clearOnboarding);
  const clearAuthFlow = useAppStore((state) => state.clearAuthFlow);
  const setToast = useGlobalUIStore((state) => state.setToast);

  const logoutUser = useCallback(() => {
    try {
      // Limpiar todos los stores
      logout();
      clearOnboarding();
      clearAuthFlow();

      // Limpiar el cache de React Query
      queryClient.clear();

      // Mostrar mensaje de éxito
      setToast({
        message: t('logout.successMessage'),
        type: 'success',
        open: true,
      });

      // Redirigir al login
      navigate(ROUTES.LOGIN, { replace: true });
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      
      // Mostrar mensaje de error
      setToast({
        message: t('logout.errorMessage'),
        type: 'error',
        open: true,
      });
    }
  }, [logout, clearOnboarding, clearAuthFlow, setToast, navigate, t]);

  return logoutUser;
};

export default useLogout;
