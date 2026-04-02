import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/auth/auth.service';
import {
  type LoginRequest,
  type LoginResponse,
  normalizeLoginResponse
} from '@/services/auth/auth.types';
import { useAppStore } from '@/stores/useAppStore';
import { useGlobalUIStore } from '@/stores/useGlobalUIStore';
import { getAuthErrorMessage } from './useAuthErrors';
import { ROUTES } from '@/router/routes';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/services/api/client';

type UseLoginReturn = Omit<UseMutationResult<LoginResponse, AxiosError<ApiErrorResponse>, LoginRequest>, 'mutate'> & {
  loginUser: (credentials: LoginRequest) => void;
};


export const useLogin = (): UseLoginReturn => {
  const navigate = useNavigate();
  const { t } = useTranslation('auth');
  const login = useAppStore((state) => state.login);
  const setToast = useGlobalUIStore((state) => state.setToast);

  const mutation = useMutation<LoginResponse, AxiosError<ApiErrorResponse>, LoginRequest>({
    mutationFn: authService.login,
    
    onSuccess: (data) => {
      
      // Normalizar la respuesta y guardar en el store
      const { accessToken, refreshToken, user } = normalizeLoginResponse(data);

      login(accessToken, refreshToken, user);

      // Mostrar mensaje de éxito
      setToast({
        message: t('errors.loginSuccess'),
        type: 'success',
        open: true,
      });


      redirectByRole(user.rol, navigate);
    },
    
    onError: (error) => {
      // Obtener mensaje de error amigable con traducción
      const errorMessage = getAuthErrorMessage(error, t);
      
      // Mostrar toast de error
      setToast({
        message: errorMessage,
        type: 'error',
        open: true,
      });
    },
  });

  return {
    ...mutation,
    loginUser: mutation.mutate,
  };
};

/**
 * Redirige al usuario según su rol
 */
function redirectByRole(role: string, navigate: ReturnType<typeof useNavigate>) {
  switch (role) {
    case 'PATIENT':
      navigate(ROUTES.COMMON.DASHBOARD);
      break;
    case 'DOCTOR':
      navigate(ROUTES.COMMON.DASHBOARD);
      break;
    case 'CENTER':
      navigate(ROUTES.COMMON.DASHBOARD);
      break;
    default:
      navigate('/');
  }
}

export default useLogin;
