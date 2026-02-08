import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth/auth.service';
import { useAppStore } from '@/stores/useAppStore';
import { useGlobalUIStore } from '@/stores/useGlobalUIStore';
import { queryClient } from '@/lib/react-query/config';
import { ROUTES } from '@/router/routes';

/**
 * Hook para logout
 * 
 * @example
 * ```tsx
 * const { logoutUser, isPending } = useLogout();
 * 
 * const handleLogout = () => {
 *   logoutUser();
 * };
 * ```
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const logout = useAppStore((state) => state.logout);
  const clearOnboarding = useAppStore((state) => state.clearOnboarding);
  const clearAuthFlow = useAppStore((state) => state.clearAuthFlow);
  const setToast = useGlobalUIStore((state) => state.setToast);

  const mutation = useMutation({
    mutationFn: authService.logout,
    
    onSuccess: () => {
      // Limpiar todos los stores
      logout();
      clearOnboarding();
      clearAuthFlow();

      // Limpiar el cache de React Query
      queryClient.clear();

      // Mostrar mensaje de éxito
      setToast({
        message: 'Has cerrado sesión correctamente',
        type: 'success',
        open: true,
      });

      // Redirigir al login
      navigate(ROUTES.LOGIN);
    },
    
    onError: () => {
      // Incluso si hay error en el backend, limpiamos localmente
      logout();
      clearOnboarding();
      clearAuthFlow();
      queryClient.clear();
      navigate(ROUTES.LOGIN);
    },
  });

  return {
    ...mutation,
    logoutUser: mutation.mutate,
  };
};

export default useLogout;
