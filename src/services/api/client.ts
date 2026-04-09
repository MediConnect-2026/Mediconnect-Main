import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAppStore } from '@/stores/useAppStore';
import API_ENDPOINTS from './endpoints';
import { willTokenExpireSoon, isTokenExpired } from '@/services/auth/token.utils';

// Flag para evitar múltiples llamadas simultáneas al refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Función auxiliar para refrescar los tokens
 * Centraliza la lógica de refresh para ser reutilizada
 */
const refreshTokens = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
  const refreshToken = useAppStore.getState().refreshToken;

  if (!refreshToken) {
    console.error('🔒 [API Client] No hay refresh token disponible');
    return null;
  }

  try {
    console.log('🔄 [API Client] Refrescando tokens...');
    
    const { data: refreshData } = await axios.post(
      `${apiClient.defaults.baseURL}${API_ENDPOINTS.AUTH.REFRESH_TOKEN}`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('📥 [API Client] Respuesta del refresh:', refreshData);

    // Validar que la respuesta tenga los campos necesarios
    if (!refreshData || !refreshData.accessToken || !refreshData.refreshToken) {
      console.error('❌ [API Client] Respuesta de refresh inválida:', refreshData);
      throw new Error('Respuesta de refresh inválida: faltan tokens');
    }

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshData;

    console.log('✅ [API Client] Tokens refrescados exitosamente');

    // Actualizar tokens en el store
    const updateTokens = useAppStore.getState().updateTokens;
    updateTokens(newAccessToken, newRefreshToken);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.error('❌ [API Client] Error al refrescar tokens:', error);
    
    // Si falla el refresh, cerrar sesión
    const logout = useAppStore.getState().logout;
    logout();
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    
    return null;
  }
};

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Agregar token automáticamente y verificar expiración
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = useAppStore.getState().accessToken;
    
    // Lista de endpoints de autenticación que NO requieren refresh proactivo
    const authEndpoints = [
      API_ENDPOINTS.AUTH.LOGIN,
      API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      API_ENDPOINTS.AUTH.REGISTRO_SOLICITAR_CODIGO,
      API_ENDPOINTS.AUTH.REGISTRO_VALIDAR_CODIGO,
      API_ENDPOINTS.AUTH.REGISTRO_COMPLETAR_PACIENTE,
      API_ENDPOINTS.AUTH.REGISTRO_COMPLETAR_DOCTOR,
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      API_ENDPOINTS.AUTH.VERIFY_EMAIL,
    ];
    
    const isAuthEndpoint = authEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    // Si tenemos un token y no es un endpoint de autenticación, verificar expiración
    if (accessToken && !isAuthEndpoint) {
      // Verificar si el token está expirado
      if (isTokenExpired(accessToken)) {
        console.warn('⚠️ [API Client] Token expirado - refrescando antes de la petición');
        
        if (isRefreshing) {
          // Si ya estamos refrescando, esperar en la cola
          await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          
          // Después de que se resuelva la cola, obtener el nuevo token
          const newAccessToken = useAppStore.getState().accessToken;
          if (config.headers) {
            config.headers.Authorization = `Bearer ${newAccessToken}`;
          }
        } else {
          isRefreshing = true;
          
          try {
            const tokens = await refreshTokens();
            
            if (tokens) {
              // Actualizar el header con el nuevo token
              if (config.headers) {
                config.headers.Authorization = `Bearer ${tokens.accessToken}`;
              }
              
              // Procesar la cola
              processQueue(null, tokens.accessToken);
            } else {
              // Si no se pudo refrescar, rechazar la petición
              processQueue(new Error('No se pudo refrescar el token'), null);
              throw new Error('Token expirado y no se pudo refrescar');
            }
          } finally {
            isRefreshing = false;
          }
        }
      }
      // Verificar si el token expirará pronto (dentro de 5 minutos)
      else if (willTokenExpireSoon(accessToken, 5)) {
        console.log('⏰ [API Client] Token expirará pronto - refrescando de manera proactiva');
        
        // Hacer el refresh de manera no bloqueante (en background)
        if (!isRefreshing) {
          isRefreshing = true;
          
          // Ejecutar el refresh en background sin bloquear la petición actual
          refreshTokens().finally(() => {
            isRefreshing = false;
          });
        }
        
        // Continuar con el token actual (aún válido)
        if (config.headers && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
      // Token válido y no próximo a expirar
      else if (config.headers && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } else if (!accessToken && !config.headers?.Authorization && !isAuthEndpoint) {
      console.log('📤 [API Client] Sin token - petición sin autenticación');
    }
    
    // CRÍTICO: Si estamos enviando FormData, eliminar Content-Type
    // para que axios lo configure automáticamente con el boundary correcto
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('📤 [API Client] Error configurando request:', error);
    return Promise.reject(error);
  }
);

// Interceptor de Response: Manejo de errores global y auto-refresh de tokens (fallback)
apiClient.interceptors.response.use(
  (response) => {
    console.log('📥 [API Client] Response recibida:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      url: response.config.url
    });
    
    // Si el response es exitoso, retornar los datos directamente
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    console.error('📥 [API Client] Error en response:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url
    });
    
    // Manejo de errores
    if (error.response) {
      const { status, data } = error.response;
      
      // Token expirado - intentar refresh automático (FALLBACK)
      // Nota: El refresh proactivo debería prevenir la mayoría de estos casos
      if (status === 401 && !originalRequest._retry) {
        // Lista de endpoints de autenticación que NO deben activar el flujo de refresh
        const authEndpoints = [
          API_ENDPOINTS.AUTH.LOGIN,
          API_ENDPOINTS.AUTH.GOOGLE_LOGIN,
          API_ENDPOINTS.AUTH.REFRESH_TOKEN,
          API_ENDPOINTS.AUTH.REGISTRO_SOLICITAR_CODIGO,
          API_ENDPOINTS.AUTH.REGISTRO_VALIDAR_CODIGO,
          API_ENDPOINTS.AUTH.REGISTRO_COMPLETAR_PACIENTE,
          API_ENDPOINTS.AUTH.REGISTRO_COMPLETAR_DOCTOR,
          API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
          API_ENDPOINTS.AUTH.RESET_PASSWORD,
          API_ENDPOINTS.AUTH.VERIFY_EMAIL,
        ];
        
        // Si es un endpoint de autenticación, NO intentar refresh
        const isAuthEndpoint = authEndpoints.some(endpoint => 
          originalRequest.url?.includes(endpoint)
        );
        
        if (isAuthEndpoint) {
          console.log('🔓 [API Client] Error 401 en endpoint de autenticación - propagando error');
          return Promise.reject(error);
        }
        
        // Verificar si no es el endpoint de refresh para evitar loop infinito
        if (originalRequest.url === API_ENDPOINTS.AUTH.REFRESH_TOKEN) {
          console.error('🔒 [API Client] Refresh token inválido - cerrando sesión');
          const logout = useAppStore.getState().logout;
          logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        console.warn('⚠️ [API Client] 401 recibido (fallback) - el refresh proactivo no lo previno');

        if (isRefreshing) {
          // Si ya estamos refrescando, añadir a la cola
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return apiClient(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const tokens = await refreshTokens();

          if (tokens) {
            // Actualizar el header del request original
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            }

            // Procesar la cola de requests pendientes
            processQueue(null, tokens.accessToken);

            // Reintentar el request original
            return apiClient(originalRequest);
          } else {
            processQueue(new Error('No se pudo refrescar el token'), null);
            return Promise.reject(new Error('No se pudo refrescar el token'));
          }
        } catch (refreshError) {
          console.error('❌ [API Client] Error al refrescar token (fallback):', refreshError);
          processQueue(refreshError as Error, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      
      // Usuario inactivo o bloqueado
      if (status === 403) {
        console.error('🚫 [API Client] Acceso denegado:', data.message);
      }
      
      // Error del servidor
      if (status >= 500) {
        console.error('💥 [API Client] Error del servidor:', data.message);
      }
    } else if (error.request) {
      // Request hecho pero no hay respuesta
      console.error('🌐 [API Client] Error de red: No se recibió respuesta del servidor');
      console.error('🌐 [API Client] Verifica que el backend esté corriendo en:', import.meta.env.VITE_API_URL);
    } else {
      // Error al configurar el request
      console.error('⚙️ [API Client] Error al configurar la petición:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Tipos para respuestas de error
export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: string;
  statusCode?: number;
}

export default apiClient;
