import apiClient from '../api/client';
import API_ENDPOINTS from '../api/endpoints';
import type {
  LoginRequest,
  LoginResponse,
  GoogleLoginRequest,
  GoogleLoginResponse,
  SolicitarCodigoRequest,
  SolicitarCodigoResponse,
  ValidarCodigoRequest,
  ValidarCodigoResponse,
} from './auth.types';


export const authService = {
  /**
   * Login con email y contraseña
   * POST /auth/login
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const { data } = await apiClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Login con Google OAuth
   * POST /auth/google
   */
  googleLogin: async (request: GoogleLoginRequest): Promise<GoogleLoginResponse> => {
    const { data } = await apiClient.post<GoogleLoginResponse>(
      API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
      request
    );
    return data;
  },

  /**
   * Solicitar código OTP para registro
   * POST /auth/registro/solicitar-codigo
   */
  solicitarCodigoRegistro: async (
    request: SolicitarCodigoRequest
  ): Promise<SolicitarCodigoResponse> => {
    const { data } = await apiClient.post<SolicitarCodigoResponse>(
      API_ENDPOINTS.AUTH.REGISTRO_SOLICITAR_CODIGO,
      request
    );
    return data;
  },

  /**
   * Validar código OTP y obtener token de registro
   * POST /auth/registro/validar-codigo
   */
  validarCodigoRegistro: async (
    request: ValidarCodigoRequest
  ): Promise<ValidarCodigoResponse> => {
    const { data } = await apiClient.post<ValidarCodigoResponse>(
      API_ENDPOINTS.AUTH.REGISTRO_VALIDAR_CODIGO,
      request
    );
    return data;
  },

  /**
   * Logout (limpia el token localmente)
   * Nota: El backend puede tener un endpoint de logout si maneja blacklist de tokens
   */
  logout: async (): Promise<void> => {
    // Si el backend tiene endpoint de logout, descomentar:
    // await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    
    // Por ahora solo limpiamos localmente
    return Promise.resolve();
  },

  /**
   * Refresh token (si el backend lo implementa)
   * POST /auth/refresh
   */
  refreshToken: async (): Promise<{ token: string }> => {
    const { data } = await apiClient.post<{ token: string }>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN
    );
    return data;
  },
};

export default authService;
