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
  ValidarCodigoPasswordRequest,
  ValidarCodigoPasswordResponse,
  CambiarPasswordRequest,
  CambiarPasswordResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  SolicitarCodigoPasswordResponse,
  SolicitarCodigoPasswordRequest,
  VerificarDocumentoResponse,
  SolicitarCodigoEmailRequest,
  SolicitarCodigoEmailResponse,
  ValidarCodigoEmailRequest,
  ValidarCodigoEmailResponse,
  CambiarEmailRequest,
  CambiarEmailResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
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
   * Solicitar código OTP para recuperación de contraseña
   * POST /auth/password/solicitar-codigo
   */
  solicitarCodigoPassword: async (
    request: SolicitarCodigoPasswordRequest
  ): Promise<SolicitarCodigoPasswordResponse> => {
    const { data } = await apiClient.post<SolicitarCodigoPasswordResponse>(
      API_ENDPOINTS.AUTH.PASSWORD_SOLICITAR_CODIGO,
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
   * Validar código OTP para recuperación de contraseña
   * POST /auth/password/validar-codigo
   */
  validarCodigoPassword: async (
    request: ValidarCodigoPasswordRequest
  ): Promise<ValidarCodigoPasswordResponse> => {
    const { data } = await apiClient.post<ValidarCodigoPasswordResponse>(
      API_ENDPOINTS.AUTH.PASSWORD_VALIDAR_CODIGO,
      request
    );
    return data;
  },

  /**
   * Cambiar contraseña con token de recuperación
   * POST /auth/password/cambiar
   * Requiere header X-Recovery-Token
   */
  cambiarPassword: async (
    request: CambiarPasswordRequest,
    recoveryToken: string
  ): Promise<CambiarPasswordResponse> => {
    const { data } = await apiClient.post<CambiarPasswordResponse>(
      API_ENDPOINTS.AUTH.PASSWORD_CAMBIAR,
      request,
      {
        headers: {
          'X-Recovery-Token': recoveryToken,
        },
      }
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
   * Refresh token - Obtiene nuevos tokens usando el refreshToken
   * POST /auth/refresh
   */
  refreshToken: async (request: RefreshTokenRequest): Promise<RefreshTokenResponse> => {
    const { data } = await apiClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      request
    );
    return data;
  },

  /**
   * Verificar disponibilidad de número de documento
   * GET /auth/verificar-documento
   */
  verificarDocumento: async (numero: string): Promise<VerificarDocumentoResponse> => {
    const { data } = await apiClient.get<VerificarDocumentoResponse>(
      API_ENDPOINTS.AUTH.VERIFICAR_DOCUMENTO,
      {
        params: { numero },
      }
    );
    return data;
  },

  /**
   * Solicitar código OTP para cambio de email
   * POST /auth/email/solicitar-codigo
   */
  solicitarCodigoEmail: async (
    request: SolicitarCodigoEmailRequest
  ): Promise<SolicitarCodigoEmailResponse> => {
    const { data } = await apiClient.post<SolicitarCodigoEmailResponse>(
      API_ENDPOINTS.AUTH.EMAIL_SOLICITAR_CODIGO,
      request
    );
    return data;
  },

  /**
   * Validar código OTP para cambio de email
   * POST /auth/email/validar-codigo
   */
  validarCodigoEmail: async (
    request: ValidarCodigoEmailRequest
  ): Promise<ValidarCodigoEmailResponse> => {
    const { data } = await apiClient.post<ValidarCodigoEmailResponse>(
      API_ENDPOINTS.AUTH.EMAIL_VALIDAR_CODIGO,
      request
    );
    return data;
  },

  /**
   * Cambiar email del usuario autenticado
   * PATCH /auth/cambiar-email
   * Requiere contraseña actual para confirmar identidad
   */
  cambiarEmail: async (
    request: CambiarEmailRequest
  ): Promise<CambiarEmailResponse> => {
    const { data } = await apiClient.patch<CambiarEmailResponse>(
      API_ENDPOINTS.AUTH.EMAIL_CAMBIAR,
      request
    );
    return data;
  },

  /**
   * Eliminar cuenta del usuario autenticado (Soft Delete)
   * DELETE /auth/cuenta
   * 
   * **Validaciones**:
   * - Usuario debe estar autenticado (JWT token válido)
   * - Contraseña debe ser correcta
   * - Confirmación exacta: "ELIMINAR CUENTA" (case-sensitive)
   * 
   * **Comportamiento**:
   * - Marca el usuario como estado: 'Eliminado'
   * - Elimina en cascada todas las entidades relacionadas
   * - Las citas activas se marcan como 'Cancelada'
   * - Permite re-registro posterior con el mismo email
   * 
   * ⚠️ **ADVERTENCIA**: Esta acción no se puede deshacer
   */
  deleteAccount: async (
    request: DeleteAccountRequest
  ): Promise<DeleteAccountResponse> => {
    const { data } = await apiClient.delete<DeleteAccountResponse>(
      API_ENDPOINTS.AUTH.DELETE_ACCOUNT,
      {
        data: request,
      }
    );
    return data;
  },
};

export default authService;
