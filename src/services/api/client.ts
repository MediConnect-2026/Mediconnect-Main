import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAppStore } from '@/stores/useAppStore';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request: Agregar token automáticamente
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAppStore.getState().token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('📤 [API Client] Sin token - petición sin autenticación');
    }
    
    return config;
  },
  (error) => {
    console.error('📤 [API Client] Error configurando request:', error);
    return Promise.reject(error);
  }
);

// Interceptor de Response: Manejo de errores global
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
  (error: AxiosError<ApiErrorResponse>) => {
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
      
      // Token expirado o inválido
      if (status === 401) {
        console.warn('🔒 [API Client] Token inválido o expirado (401)');
        // DESACTIVADO TEMPORALMENTE PARA DEBUGGING
        // const logout = useAppStore.getState().logout;
        // logout();
        // if (typeof window !== 'undefined') {
        //   window.location.href = '/login';
        // }
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
