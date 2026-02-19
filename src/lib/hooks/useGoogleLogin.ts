import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '@/services/auth/auth.service';
import {
  type GoogleLoginRequest,
  type GoogleLoginResponse,
  normalizeGoogleLoginResponse,
  isGoogleLoginSuccess,
  isGoogleRegistration,
  isUserDeleted
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
  const { t } = useTranslation('auth');
  const login = useAppStore((state) => state.login);
  const setRegistrationToken = useAppStore((state) => state.setRegistrationToken);
  const setGoogleUserData = useAppStore((state) => state.setGoogleUserData);
  const setToast = useGlobalUIStore((state) => state.setToast);

  const mutation = useMutation<GoogleLoginResponse, AxiosError<ApiErrorResponse>, GoogleLoginRequest>({
    mutationFn: authService.googleLogin,
    
    onSuccess: (data) => {      
      // Verificar si es un login exitoso o requiere registro
      if (isGoogleLoginSuccess(data)) {
        // Normalizar la respuesta para obtener los datos del usuario
        const { accessToken, refreshToken, user } = normalizeGoogleLoginResponse(data);

        // Verificar si el usuario tiene estado "Eliminado"
        if (isUserDeleted(user)) {
          // Guardar datos del usuario de Google
          setGoogleUserData({
            email: user.email,
            nombre: user.paciente?.nombre || user.doctor?.nombre || '',
            apellido: user.paciente?.apellido || user.doctor?.apellido || '',
            foto: user.fotoPerfil || undefined,
            banner: user.banner || undefined,
          });
          
          // Mostrar mensaje informativo
          setToast({
            message: t('auth.accountDeleted') || 'Esta cuenta ha sido eliminada. Por favor, completa el registro nuevamente.',
            type: 'info',
            open: true,
          });
          
          // Redirigir a registro
          navigate(ROUTES.REGISTER);
          return;
        }

        // Usuario ya registrado y activo - hacer login normal
        login(accessToken, refreshToken, user as any);

        // Mostrar mensaje de éxito
        setToast({
          message: t('login.welcome'),
          type: 'success',
          open: true,
        });
        
        redirectByRole(user.rol, navigate);
      } else if (isGoogleRegistration(data)) {
        // Usuario nuevo - requiere completar registro
        console.log('📝 Usuario nuevo, redirigiendo a selección de tipo de usuario...');
        
        // Guardar el token de registro
        setRegistrationToken(data.registroToken);
        
        // Guardar los datos del usuario de Google
        setGoogleUserData({
          email: data.email,
          nombre: data.nombre,
          apellido: data.apellido,
          foto: data.foto,
          banner: data.banner,
        });
        
        // Mostrar mensaje informativo
        setToast({
          message: t('auth.completeRegistration') || data.message || 'Por favor completa tu registro',
          type: 'info',
          open: true,
        });
        
        // Redirigir a la página de selección de rol
        navigate(ROUTES.REGISTER);
      }
    },
    
    onError: (error) => {
      console.error('❌ Error en login con Google:', error);
      
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
    loginWithGoogle: (idToken: string) => {
      mutation.mutate({ idToken });
    },
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

export default useGoogleLogin;
