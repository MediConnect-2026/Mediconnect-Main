import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth/auth.service';
import {
  type GoogleLoginRequest,
  type GoogleLoginResponse,
  normalizeGoogleLoginResponse,
} from '@/services/auth/auth.types';
import { useAppStore } from '@/stores/useAppStore';
import { useGlobalUIStore } from '@/stores/useGlobalUIStore';
import { getAuthErrorMessage } from './useAuthErrors';
import { ROUTES } from '@/router/routes';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/services/api/client';

type UseGoogleLoginReturn = Omit<UseMutationResult<GoogleLoginResponse, AxiosError<ApiErrorResponse>, GoogleLoginRequest>, 'mutate'> & {
  loginWithGoogle: (idToken: string) => void;
};

export const useGoogleLogin = (): UseGoogleLoginReturn => {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const setToast = useGlobalUIStore((state) => state.setToast);

  const mutation = useMutation<GoogleLoginResponse, AxiosError<ApiErrorResponse>, GoogleLoginRequest>({
    mutationFn: authService.googleLogin,
    
    onSuccess: (data) => {
      // Normalizar la respuesta y guardar en el store
      const { token, user } = normalizeGoogleLoginResponse(data);
      login(token, user as any);

      // Mostrar mensaje de éxito
      setToast({
        message: '¡Has iniciado sesión con Google!',
        type: 'success',
        open: true,
      });

      // Redirigir según el rol del usuario
      redirectByRole(user.role, navigate);
    },
    
    onError: (error) => {
      // Obtener mensaje de error amigable
      const errorMessage = getAuthErrorMessage(error);
      
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
    loginWithGoogle: (idToken: string) => mutation.mutate({ idToken }),
  };
};

/**
 * Redirige al usuario según su rol
 */
function redirectByRole(role: string, navigate: ReturnType<typeof useNavigate>) {
  switch (role) {
    case 'PATIENT':
      navigate(ROUTES.PATIENT.HOME);
      break;
    case 'DOCTOR':
      navigate(ROUTES.DOCTOR.HOME);
      break;
    case 'CENTER':
      navigate(ROUTES.CENTER.HOME);
      break;
    default:
      navigate('/');
  }
}

export default useGoogleLogin;
