import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import { authService } from '@/services/auth/auth.service';
import {
  type RefreshTokenRequest,
  type RefreshTokenResponse,
} from '@/services/auth/auth.types';
import { useAppStore } from '@/stores/useAppStore';
import type { AxiosError } from 'axios';
import type { ApiErrorResponse } from '@/services/api/client';

type UseRefreshTokenReturn = Omit<
  UseMutationResult<RefreshTokenResponse, AxiosError<ApiErrorResponse>, RefreshTokenRequest>,
  'mutate'
> & {
  refreshTokens: () => void;
};

/**
 * Hook para refrescar los tokens de autenticación
 * Usa el refreshToken actual para obtener nuevos accessToken y refreshToken
 */
export const useRefreshToken = (): UseRefreshTokenReturn => {
  const updateTokens = useAppStore((state) => state.updateTokens);
  const logout = useAppStore((state) => state.logout);
  const currentRefreshToken = useAppStore((state) => state.refreshToken);

  const mutation = useMutation<
    RefreshTokenResponse,
    AxiosError<ApiErrorResponse>,
    RefreshTokenRequest
  >({
    mutationFn: authService.refreshToken,

    onSuccess: (data) => {
      console.log('✅ [useRefreshToken] Tokens actualizados exitosamente');
      
      // Actualizar los tokens en el store
      updateTokens(data.accessToken, data.refreshToken);
    },

    onError: (error) => {
      console.error('❌ [useRefreshToken] Error al refrescar tokens:', error);
      
      // Si el refresh token es inválido, cerrar sesión
      if (error.response?.status === 401) {
        console.warn('🔒 [useRefreshToken] Refresh token inválido - cerrando sesión');
        logout();
      }
    },
  });

  return {
    ...mutation,
    refreshTokens: () => {
      if (!currentRefreshToken) {
        console.error('❌ [useRefreshToken] No hay refreshToken disponible');
        return;
      }
      
      console.log('🔄 [useRefreshToken] Refrescando tokens...');
      mutation.mutate({ refreshToken: currentRefreshToken });
    },
  };
};

export default useRefreshToken;
